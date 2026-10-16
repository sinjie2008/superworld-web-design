<?php
declare(strict_types=1);

if (PHP_SAPI !== 'cli' || empty($argv[1])) {
    exit(2);
}
$base = getenv('SW_PRODUCT_API_BASE_URL');
if (!$base) {
    fwrite(STDERR, "BLOCKED: SW_PRODUCT_API_BASE_URL must contain the actual authorized API base.\n");
    exit(2);
}
require rtrim($argv[1], '/') . '/wp-load.php';
if (wp_get_environment_type() === 'production') {
    fwrite(STDERR, "Use an authorized non-production WordPress host for live smoke tests.\n");
    exit(2);
}
require_once dirname(__DIR__, 2) . '/autoload.php';
$client = new \Superworld\Core\Api\ProductApiClient($base, null, 8, getenv('SW_ALLOW_PRIVATE_API') === '1');
$request = static function (string $op, array $args = []) use ($client): array {
    $data = $client->request($op, $args);
    if (is_wp_error($data)) {
        $blocked = in_array($data->get_error_code(), ['superworld_api_unavailable', 'superworld_api_configuration'], true);
        fwrite(STDERR, ($blocked ? 'BLOCKED ' : 'FAIL ') . $op . ': ' . $data->get_error_message() . PHP_EOL);
        exit($blocked ? 2 : 1);
    }
    echo 'PASS ' . $op . PHP_EOL;
    return $data;
};
$request('health');
$tree = $request('tree');
$category = null;
$series = null;
$find = static function (array $nodes) use (&$find, &$category, &$series): void {
    foreach ($nodes as $node) {
        if ($node['type'] === 'category') {
            $category ??= $node;
        } else {
            $series ??= $node;
        }
        $find($node['children'] ?? []);
    }
};
$find($tree);
if (!$category || !$series) {
    fwrite(STDERR, "NOT TESTED: catalog lacks a category or series to exercise.\n");
    exit(2);
}
$request('resolve', ['path' => $category['path']]);
$request('category', ['path' => $category['path']]);
$request('resolve', ['path' => $series['path']]);
$request('series', ['path' => $series['path']]);
$request('fields', ['path' => $series['path']]);
$parts = $request('parts', ['path' => $series['path'], 'per_page' => 1, 'page' => 1]);
if ($parts['pagination']['last_page'] > 1) {
    $page2 = $request('parts', ['path' => $series['path'], 'per_page' => 1, 'page' => 2]);
    if ($page2['pagination']['page'] !== 2 || $page2['parts'][0]['id'] === $parts['parts'][0]['id']) {
        fwrite(STDERR, "FAIL pagination contract\n");
        exit(1);
    }
} else {
    echo "NOT TESTED page two: selected series has fewer than two parts.\n";
}
$facets = $request('facets', ['path' => $series['path']]);
$filterChecked = false;
foreach ($facets['facets'] as $facet) {
    if ($facet['values'] !== []) {
        $value = $facet['values'][0]['value'];
        $filtered = $request('parts', ['path' => $series['path'], 'filter' => [$facet['key'] => (string) $value]]);
        foreach ($filtered['parts'] as $part) {
            if (strcasecmp((string) $part['values'][$facet['key']], (string) $value) !== 0) {
                fwrite(STDERR, "FAIL filter value mapping\n");
                exit(1);
            }
        }
        $filterChecked = true;
        break;
    }
}
if (!$filterChecked) {
    echo "NOT TESTED filters: no available facet values.\n";
}
$request('search', ['q' => $parts['parts'][0]['sku'] ?? $series['name']]);
echo "PASS available read-only live contract scenarios; see any NOT TESTED cases above.\n";
