<?php
declare(strict_types=1);

use Superworld\Core\Api\CacheService;
use Superworld\Core\Api\ProductApiClient;

/**
 * Exercise the real WordPress HTTP adapter with fixture-backed transport.
 * The main integration runner must load WordPress and activate the plugin first.
 *
 * @param callable(bool, string): void $assert Assertion callback owned by the runner.
 */
function run_adapter_tests(callable $assert): void
{
    $fixtureDirectory = dirname(__DIR__) . '/fixtures/public-api-v1/';
    $catalog = json_decode((string) file_get_contents($fixtureDirectory . 'catalog.json'), true, 64, JSON_THROW_ON_ERROR);
    $fixture = static function (string $name) use ($fixtureDirectory): array {
        $decoded = json_decode((string) file_get_contents($fixtureDirectory . $name), true, 64, JSON_THROW_ON_ERROR);
        if (!is_array($decoded)) {
            throw new RuntimeException('Invalid adapter fixture: ' . $name);
        }
        return $decoded;
    };
    $response = static function (array $envelope, int $status = 200, array $headers = []): array {
        return [
            'headers' => array_merge([
                'content-type' => 'application/json; charset=utf-8',
                'cache-control' => 'no-store',
            ], $headers),
            'body' => wp_json_encode($envelope, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            'response' => ['code' => $status, 'message' => 'Synthetic fixture response'],
            'cookies' => [],
        ];
    };
    $canonicalize = static function (array $value) use (&$canonicalize): array {
        foreach ($value as &$item) {
            if (is_array($item)) {
                $item = $canonicalize($item);
            }
        }
        unset($item);
        if (!array_is_list($value)) {
            ksort($value, SORT_STRING);
        }
        return $value;
    };

    $state = ['response' => null, 'requests' => []];
    $transport = static function ($preempt, array $args, string $url) use (&$state) {
        $state['requests'][] = ['url' => $url, 'args' => $args];
        return $state['response'] ?? $preempt;
    };
    add_filter('pre_http_request', $transport, 10, 3);

    $cache = new CacheService();
    CacheService::invalidate();
    try {
        $base = 'https://8.8.8.8/project/api';
        $client = new ProductApiClient($base, null, 8);
        $cachedClient = new ProductApiClient($base, $cache, 90);
        $cases = [
            ['public.root', 'index', []],
            ['public.health', 'health', []],
            ['public.tree', 'tree', []],
            ['public.resolve.series', 'resolve', ['path' => 'general/emc/ax-10']],
            ['public.category', 'category', ['path' => 'general/emc']],
            ['public.series', 'series', ['path' => 'general/emc/ax-10']],
            ['public.fields', 'fields', ['path' => 'general/emc/ax-10']],
            ['public.parts.page1', 'parts', ['path' => 'general/emc/ax-10', 'page' => 1, 'per_page' => 1]],
            ['public.parts.page2', 'parts', ['path' => 'general/emc/ax-10', 'page' => 2, 'per_page' => 1]],
            ['public.facets.empty', 'facets', ['path' => 'general/emc/ax-10']],
            ['public.search', 'search', ['q' => 'SYN-AX10']],
            ['spec.rootCategories', 'spec_roots', []],
            ['spec.productCategories', 'spec_groups', ['root_id' => 10]],
            ['spec.facets', 'spec_facets', ['category_ids' => [20]]],
            ['spec.products', 'spec_products', ['category_ids' => [20], 'filters' => ['series' => ['AX-10'], 'dcr' => ['12.5']]]],
            ['spec.products.empty', 'spec_products', ['category_ids' => [], 'filters' => []]],
        ];
        $routes = [
            'index' => '/', 'health' => '/health', 'tree' => '/tree', 'resolve' => '/resolve/',
            'category' => '/categories/', 'series' => '/series/', 'fields' => '/series/',
            'parts' => '/series/', 'facets' => '/series/', 'search' => '/search',
            'spec_roots' => '/spec-search/root-categories.php',
            'spec_groups' => '/spec-search/product-categories.php',
            'spec_facets' => '/spec-search/facets.php',
            'spec_products' => '/spec-search/products.php',
        ];

        foreach ($cases as [$endpoint, $operation, $arguments]) {
            $entry = $catalog['endpoints'][$endpoint] ?? null;
            if (!is_array($entry) || !isset($entry['response'])) {
                throw new RuntimeException('Missing endpoint fixture mapping: ' . $endpoint);
            }
            $envelope = $fixture($entry['response']);
            $state['response'] = $response($envelope, (int) ($entry['status'] ?? 200));
            $before = count($state['requests']);
            $result = $client->request($operation, $arguments);
            $assert(is_array($result) && ($result === ($envelope['data'] ?? null)), $endpoint . ' maps the fixture data envelope');
            $assert(count($state['requests']) === $before + 1, $endpoint . ' makes one upstream request');
            $last = $state['requests'][array_key_last($state['requests'])];
            $expectedUrl = $base . $routes[$operation];
            if (isset($arguments['path'])) {
                $expectedUrl .= implode('/', array_map('rawurlencode', explode('/', $arguments['path'])));
                if (in_array($operation, ['fields', 'parts', 'facets'], true)) {
                    $expectedUrl .= '/' . $operation;
                }
                unset($arguments['path']);
            }
            if ($operation === 'spec_groups') {
                $expectedUrl .= '?root_id=10';
            } elseif (in_array($operation, ['parts', 'search'], true)) {
                $expectedUrl .= '?' . http_build_query($arguments, '', '&', PHP_QUERY_RFC3986);
            }
            $assert($last['url'] === $expectedUrl, $endpoint . ' uses the expected route and query encoding');
            $expectedMethod = in_array($operation, ['spec_facets', 'spec_products'], true) ? 'POST' : 'GET';
            $assert(($last['args']['method'] ?? null) === $expectedMethod, $endpoint . ' uses the expected HTTP method');
            if ($expectedMethod === 'POST') {
                $sent = json_decode((string) ($last['args']['body'] ?? ''), true, 64, JSON_THROW_ON_ERROR);
                $assert($canonicalize($sent) === $canonicalize($arguments), $endpoint . ' sends the expected JSON payload');
            }
        }

        $assert(($fixture('public-parts-page-1.json')['data']['pagination']['page'] ?? null) === 1, 'parts page one fixture retains pagination');
        $assert(($fixture('public-parts-page-2.json')['data']['pagination']['page'] ?? null) === 2, 'parts page two fixture retains pagination');
        $assert(($fixture('public-facets-empty.json')['data']['totalParts'] ?? null) === 0, 'empty facets fixture retains the zero count');
        $assert(($fixture('spec-products-empty.json')['data']['items'] ?? null) === [], 'empty products fixture retains the empty item list');

        $state['response'] = $response($fixture('public-resolve-series.json'));
        $unicodePath = 'general/高磁/AX-10';
        $result = $client->request('resolve', ['path' => $unicodePath]);
        $last = $state['requests'][array_key_last($state['requests'])];
        $assert(is_array($result), 'Unicode path request returns valid fixture data');
        $assert(str_ends_with($last['url'], '/resolve/general/%E9%AB%98%E7%A3%81/AX-10'), 'Unicode path segments are percent-encoded independently');

        $state['response'] = $response($fixture('public-parts-page-1.json'));
        $client->request('parts', ['path' => 'general/emc/ax-10', 'filter' => ['flux.density' => ['high value']]]);
        $last = $state['requests'][array_key_last($state['requests'])];
        $assert(str_contains($last['url'], 'filter%5Bflux.density%5D%5B0%5D=high%20value'), 'dotted GET filter keys round-trip exactly');
        $state['response'] = $response($fixture('spec-products.json'));
        $client->request('spec_products', ['category_ids' => [20], 'filters' => ['flux.density' => ['high value']]]);
        $last = $state['requests'][array_key_last($state['requests'])];
        $sent = json_decode((string) $last['args']['body'], true, 64, JSON_THROW_ON_ERROR);
        $assert(array_key_exists('flux.density', $sent['filters']), 'dotted Spec Search field keys remain unchanged in JSON');

        $invalidInputs = [
            ['resolve', ['path' => '../private']],
            ['series', ['path' => 'general/%2Fsecret']],
            ['parts', ['path' => 'general/emc/ax-10', 'per_page' => 101]],
            ['tree', ['unexpected' => 'value']],
            ['spec_products', ['category_ids' => [20], 'filters' => ['bad[key]' => ['x']]]],
            ['search', ['q' => str_repeat('x', 201)]],
        ];
        foreach ($invalidInputs as [$operation, $arguments]) {
            $before = count($state['requests']);
            $result = $client->request($operation, $arguments);
            $assert(is_wp_error($result) && count($state['requests']) === $before, $operation . ' rejects malicious or out-of-range input before transport');
        }

        foreach ([
            ['public-error-not-found.json', 404, 'superworld_api_not_found'],
            ['public-error-invalid-query.json', 422, 'superworld_api_invalid_request'],
            ['public-error-method-not-allowed.json', 405, 'superworld_api_method_not_allowed'],
        ] as [$name, $status, $code]) {
            $state['response'] = $response($fixture($name), $status);
            $result = $client->request('tree');
            $assert(is_wp_error($result) && $result->get_error_code() === $code, $name . ' maps the flat public error envelope');
            $assert(($result->get_error_data()['status'] ?? null) === $status, $name . ' preserves the HTTP status');
        }
        $state['response'] = $response($fixture('spec-error-internal.json'), 500);
        $result = $client->request('spec_products', ['category_ids' => [999], 'filters' => []]);
        $assert(is_wp_error($result) && $result->get_error_code() === 'superworld_api_upstream_error', 'nested Spec Search errors map to a generic WP error');
        $assert(($result->get_error_data()['correlationId'] ?? null) === 'synthetic-correlation-001', 'upstream correlation ID is preserved');
        $state['response'] = $response([
            'success' => false, 'errorCode' => 'UPSTREAM_PRIVATE',
            'message' => 'secret sql password https://private.invalid/path', 'details' => ['password' => 'secret'],
            'correlationId' => 'synthetic-correlation-001',
        ], 500);
        $result = $client->request('tree');
        $message = is_wp_error($result) ? $result->get_error_message() : '';
        $assert(is_wp_error($result) && !str_contains($message, 'secret') && !str_contains($message, 'private.invalid'), 'upstream messages and secrets are redacted');

        $state['response'] = $response($fixture('public-health.json'));
        $strictClient = new ProductApiClient($base, null, 90);
        $strictClient->request('health');
        $options = $state['requests'][array_key_last($state['requests'])]['args'];
        $assert(($options['timeout'] ?? null) === 30, 'timeout is capped at 30 seconds');
        $assert(($options['redirection'] ?? null) === 0 && ($options['sslverify'] ?? null) === true, 'redirects are disabled and TLS verification is required');
        $assert(($options['limit_response_size'] ?? null) === 5242881 && ($options['decompress'] ?? null) === false, 'response size and decompression are bounded');
        $assert(($options['reject_unsafe_urls'] ?? null) === true && ($options['stream'] ?? null) === false, 'unsafe URLs and streamed responses are disabled');
        $assert(($options['headers']['Accept-Encoding'] ?? null) === 'identity' && isset($options['headers']['X-Correlation-ID']), 'identity encoding and correlation headers are sent');

        $state['response'] = new WP_Error('synthetic_network_failure', 'private transport detail');
        $result = $client->request('tree');
        $assert(is_wp_error($result) && $result->get_error_code() === 'superworld_api_unavailable' && !str_contains($result->get_error_message(), 'private'), 'network errors are mapped without leaking transport details');
        $state['response'] = $response($fixture('public-health.json'), 302, ['location' => 'https://private.invalid/']);
        $result = $client->request('health');
        $assert(is_wp_error($result) && $result->get_error_code() === 'superworld_api_redirect_blocked', 'redirect responses are rejected');

        $badResponses = [
            [['headers' => ['content-type' => 'application/json'], 'body' => '{bad json', 'response' => ['code' => 200]], 'malformed JSON is rejected'],
            [['headers' => ['content-type' => 'text/html'], 'body' => '{}', 'response' => ['code' => 200]], 'non-JSON content types are rejected'],
            [$response(['success' => true, 'data' => ['unexpected' => true], 'correlationId' => 'fixture-id']), 'invalid success shapes are rejected'],
            [$response($fixture('public-health.json'), 200, ['content-length' => '5242881']), 'oversize declared response lengths are rejected'],
            [['headers' => ['content-type' => 'application/json'], 'body' => str_repeat('x', 5242881), 'response' => ['code' => 200]], 'oversize response bodies are rejected'],
        ];
        foreach ($badResponses as [$badResponse, $label]) {
            $state['response'] = $badResponse;
            $result = $client->request('health');
            $assert(is_wp_error($result) && $result->get_error_code() === 'superworld_api_invalid_response', $label);
        }

        CacheService::invalidate();
        $start = count($state['requests']);
        $state['response'] = $response($fixture('public-tree.json'), 200, ['cache-control' => 'max-age=120']);
        $cachedClient->request('tree');
        $cachedClient->request('tree');
        $assert(count($state['requests']) === $start + 1, 'cacheable tree request hits the real transient cache');
        CacheService::invalidate();
        $cachedClient->request('tree');
        $assert(count($state['requests']) === $start + 2, 'cache invalidation forces a new upstream request');

        CacheService::invalidate();
        $start = count($state['requests']);
        $state['response'] = $response($fixture('public-tree.json'), 200, ['cache-control' => 'no-store']);
        $cachedClient->request('tree');
        $cachedClient->request('tree');
        $assert(count($state['requests']) === $start + 2, 'no-store response is never cached');

        foreach ([['cache-control' => ['max-age=120', 'no-store']], ['cache-control' => 'max-age=120', 'vary' => 'Accept-Encoding, *']] as $headers) {
            CacheService::invalidate();
            $start = count($state['requests']);
            $state['response'] = $response($fixture('public-tree.json'), 200, $headers);
            $cachedClient->request('tree');
            $cachedClient->request('tree');
            $assert(count($state['requests']) === $start + 2, 'combined no-store or Vary wildcard directives prevent caching');
        }

        CacheService::invalidate();
        $start = count($state['requests']);
        $state['response'] = $response($fixture('public-search.json'), 200, ['cache-control' => 'max-age=120']);
        $cachedClient->request('search', ['q' => 'SYN-AX10']);
        $cachedClient->request('search', ['q' => 'SYN-AX10']);
        $assert(count($state['requests']) === $start + 2, 'high-cardinality search is not cached');
    } finally {
        CacheService::invalidate();
        remove_filter('pre_http_request', $transport, 10);
    }
}
