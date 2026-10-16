<?php
declare(strict_types=1);

namespace Superworld\Core\Api;

use JsonException;

/** WordPress HTTP adapter for the read-only Product API and Spec Search. */
final class ProductApiClient implements ProductApiInterface
{
    private const MAX_RESPONSE_BYTES = 5242880;
    private const ROUTES = [
        'index' => '/',
        'health' => '/health',
        'tree' => '/tree',
        'resolve' => '/resolve/',
        'category' => '/categories/',
        'series' => '/series/',
        'fields' => '/series/',
        'parts' => '/series/',
        'facets' => '/series/',
        'search' => '/search',
        'spec_roots' => '/spec-search/root-categories.php',
        'spec_groups' => '/spec-search/product-categories.php',
        'spec_facets' => '/spec-search/facets.php',
        'spec_products' => '/spec-search/products.php',
    ];

    private ?string $baseUrl;
    private int $timeout;

    /**
     * $baseUrl includes /api, optionally below a deployment subdirectory.
     * $allowPrivate is an explicit development escape hatch for HTTP/private hosts.
     * Redirects and TLS verification remain fixed even in development.
     */
    public function __construct(
        string $baseUrl,
        private ?CacheService $cache = null,
        int $timeout = 8,
        private bool $allowPrivate = false
    ) {
        $this->baseUrl = self::normalizeBaseUrl($baseUrl, $allowPrivate);
        $this->timeout = max(1, min(30, $timeout));
    }

    public function request(string $operation, array $arguments = []): array|\WP_Error
    {
        $correlationId = ApiError::correlationId();
        $arguments = RequestValidator::validate($operation, $arguments);
        if (is_wp_error($arguments)) {
            return $arguments;
        }
        if ($this->baseUrl === null) {
            return ApiError::make('configuration', 'The product service URL is not configured correctly.', 503, $correlationId);
        }

        $cached = $this->cache?->get($this->baseUrl, $operation, $arguments);
        if ($cached !== null && ResponseValidator::isValid($operation, $cached)) {
            return $cached;
        }

        [$url, $options] = $this->transport($operation, $arguments, $correlationId);
        $response = wp_remote_request($url, $options);
        if (is_wp_error($response)) {
            return ApiError::make('unavailable', 'The product service is temporarily unavailable.', 502, $correlationId);
        }

        $status = (int) wp_remote_retrieve_response_code($response);
        if ($status >= 300 && $status < 400) {
            return ApiError::make('redirect_blocked', 'The product service returned an unsupported redirect.', 502, $correlationId);
        }
        $body = wp_remote_retrieve_body($response);
        $length = self::header($response, 'content-length');
        $encoding = strtolower(trim(self::header($response, 'content-encoding')));
        if (!is_string($body) || strlen($body) > self::MAX_RESPONSE_BYTES
            || (ctype_digit($length) && (float) $length > self::MAX_RESPONSE_BYTES)
            || ($encoding !== '' && $encoding !== 'identity')) {
            return ApiError::make('invalid_response', 'The product service returned an unsupported response.', 502, $correlationId);
        }

        $contentType = strtolower(trim(self::header($response, 'content-type')));
        if (preg_match('~\Aapplication/(?:json|[a-z0-9!#$&^_.+-]+\+json)(?:\s*;|\z)~D', $contentType) !== 1) {
            return ApiError::make('invalid_response', 'The product service returned an invalid JSON response.', 502, $correlationId);
        }
        try {
            $envelope = json_decode($body, true, 64, JSON_THROW_ON_ERROR);
        } catch (JsonException $exception) {
            return ApiError::make('invalid_response', 'The product service returned an invalid JSON response.', 502, $correlationId);
        }
        if (!is_array($envelope)) {
            return ApiError::make('invalid_response', 'The product service returned an invalid response.', 502, $correlationId);
        }

        $spec = str_starts_with($operation, 'spec_');
        $upstreamCorrelationId = $spec && isset($envelope['error']) && is_array($envelope['error'])
            ? ($envelope['error']['correlationId'] ?? null) : ($envelope['correlationId'] ?? null);
        if (ApiError::validCorrelationId($upstreamCorrelationId)) {
            $correlationId = $upstreamCorrelationId;
        }

        if ($status < 200 || $status >= 300 || ($envelope['success'] ?? null) !== true) {
            return $this->upstreamError($envelope, $status, $spec, $correlationId);
        }
        if (array_key_exists('error', $envelope) || array_key_exists('errorCode', $envelope)
            || !ApiError::validCorrelationId($envelope['correlationId'] ?? null)
            || !ResponseValidator::isValid($operation, $envelope['data'] ?? null)) {
            return ApiError::make('invalid_response', 'The product service returned data with an unsupported structure.', 502, $correlationId);
        }

        $data = $envelope['data'];
        $ttl = $this->cacheTtl($response);
        if ($ttl > 0) {
            $this->cache?->set($this->baseUrl, $operation, $arguments, $data, $ttl);
        }
        return $data;
    }

    private function transport(string $operation, array $arguments, string $correlationId): array
    {
        $url = $this->baseUrl . self::ROUTES[$operation];
        if (isset($arguments['path'])) {
            $url .= implode('/', array_map('rawurlencode', explode('/', $arguments['path'])));
            unset($arguments['path']);
            if (in_array($operation, ['fields', 'parts', 'facets'], true)) {
                $url .= '/' . $operation;
            }
        }
        $post = in_array($operation, ['spec_facets', 'spec_products'], true);
        $options = [
            'method' => $post ? 'POST' : 'GET',
            'timeout' => $this->timeout,
            'redirection' => 0,
            'sslverify' => true,
            'reject_unsafe_urls' => !$this->allowPrivate,
            'blocking' => true,
            'stream' => false,
            'decompress' => false,
            // Read one extra byte so truncation at the size boundary is detectable.
            'limit_response_size' => self::MAX_RESPONSE_BYTES + 1,
            'cookies' => [],
            'headers' => [
                'Accept' => 'application/json',
                'Accept-Encoding' => 'identity',
                'X-Correlation-ID' => $correlationId,
            ],
        ];
        if ($post) {
            if ($operation === 'spec_products') {
                $arguments['filters'] = (object) $arguments['filters'];
            }
            $options['headers']['Content-Type'] = 'application/json; charset=utf-8';
            $options['body'] = wp_json_encode($arguments, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            $options['data_format'] = 'body';
        } elseif ($arguments !== []) {
            $url .= '?' . http_build_query($arguments, '', '&', PHP_QUERY_RFC3986);
        }
        return [$url, $options];
    }

    private function upstreamError(array $envelope, int $status, bool $spec, string $correlationId): \WP_Error
    {
        $error = $spec ? ($envelope['error'] ?? null) : $envelope;
        $code = is_array($error) ? ($error[$spec ? 'code' : 'errorCode'] ?? null) : null;
        $valid = is_array($error) && is_string($code) && is_string($error['message'] ?? null)
            && ($spec || (($envelope['success'] ?? null) === false && is_array($envelope['details'] ?? null)));
        if (!$valid) {
            return ApiError::make('invalid_response', 'The product service returned an invalid error response.', 502, $correlationId);
        }
        $code = match ($code) {
            'NOT_FOUND', 'CATEGORY_NOT_FOUND', 'SERIES_NOT_FOUND' => 'not_found',
            'INVALID_PATH', 'INVALID_QUERY' => 'invalid_request',
            'METHOD_NOT_ALLOWED' => 'method_not_allowed',
            default => 'upstream_error',
        };
        $message = match ($code) {
            'not_found' => 'The requested catalog resource was not found.',
            'invalid_request' => 'The product service rejected the catalog request.',
            'method_not_allowed' => 'The product service does not support this operation.',
            default => 'The product service could not complete the request.',
        };
        return ApiError::make($code, $message, $status >= 400 && $status <= 599 ? $status : 502, $correlationId);
    }

    private function cacheTtl(array $response): int
    {
        $control = strtolower(self::header($response, 'cache-control'));
        if (preg_match('/(?:\A|,)\s*(?:no-store|no-cache|private)(?:\s*(?:=|,|\z))/', $control) === 1
            || preg_match('/(?:\A|,)\s*\*\s*(?:,|\z)/', self::header($response, 'vary')) === 1
            || self::header($response, 'set-cookie') !== '') {
            return 0;
        }
        $ttl = 120;
        if (preg_match('/(?:\A|,)\s*max-age\s*=\s*"?([0-9]+)"?/', $control, $match) === 1) {
            $ttl = (int) min(120, (float) $match[1]);
        }
        $age = self::header($response, 'age');
        if ($age !== '' && !ctype_digit($age)) {
            return 0;
        }
        return max(0, $ttl - (ctype_digit($age) ? (int) min($ttl, (float) $age) : 0));
    }

    /** WordPress can return multiple header values as an array. Preserve all directives. */
    private static function header(array $response, string $name): string
    {
        $value = wp_remote_retrieve_header($response, $name);
        if (is_array($value)) {
            return implode(', ', array_map(static fn($item): string => is_scalar($item) ? (string) $item : '', $value));
        }
        return is_scalar($value) ? (string) $value : '';
    }

    private static function normalizeBaseUrl(string $url, bool $allowPrivate): ?string
    {
        if ($url === '' || strlen($url) > 2048 || preg_match('/[\x00-\x20\x7f\\\\%]/', $url) === 1) {
            return null;
        }
        $parts = wp_parse_url($url);
        if (is_array($parts) && isset($parts['scheme'])) {
            $parts['scheme'] = strtolower($parts['scheme']);
        }
        if (!is_array($parts) || isset($parts['user']) || isset($parts['pass'])
            || array_key_exists('query', $parts) || array_key_exists('fragment', $parts)
            || !isset($parts['scheme'], $parts['host'], $parts['path'])
            || !in_array($parts['scheme'], $allowPrivate ? ['http', 'https'] : ['https'], true)) {
            return null;
        }
        $host = strtolower($parts['host']);
        $ip = trim($host, '[]');
        if (in_array($host, ['metadata', 'metadata.google.internal', 'metadata.goog', 'instance-data', 'instance-data.ec2.internal'], true)) {
            return null;
        }
        if (filter_var($ip, FILTER_VALIDATE_IP)) {
            if (self::isMetadataAddress($ip)
                || (!$allowPrivate && !filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_GLOBAL_RANGE))) {
                return null;
            }
        } else {
            if (strlen($host) > 253 || preg_match('/\A(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)*[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\z/D', $host) !== 1
                || preg_match('/\A[0-9.]+\z/D', $host) === 1
                || (!$allowPrivate && (!str_contains($host, '.')
                    || preg_match('/(?:\A|\.)(?:localhost|local|internal|home|lan)\z/D', $host) === 1))) {
                return null;
            }
        }
        $path = rtrim($parts['path'], '/');
        if (preg_match('~\A/(?:[A-Za-z0-9_.-]+/)*api\z~D', $path) !== 1
            || preg_match('~(?:\A|/)\.{1,2}(?:/|\z)~D', $path) === 1
            || (isset($parts['port']) && ($parts['port'] < 1 || $parts['port'] > 65535))) {
            return null;
        }
        $port = $parts['port'] ?? null;
        $authority = $host . ($port !== null && !(($parts['scheme'] === 'https' && $port === 443)
            || ($parts['scheme'] === 'http' && $port === 80)) ? ':' . $port : '');
        return $parts['scheme'] . '://' . $authority . $path;
    }

    /** Metadata and link-local destinations are never a development backend. */
    private static function isMetadataAddress(string $address): bool
    {
        $packed = inet_pton($address);
        if ($packed === false) {
            return true;
        }
        if (strlen($packed) === 16 && substr($packed, 0, 12) === str_repeat("\0", 10) . "\xff\xff") {
            $packed = substr($packed, 12);
        }
        if (strlen($packed) === 4) {
            return (ord($packed[0]) === 169 && ord($packed[1]) === 254)
                || $packed === inet_pton('100.100.100.200');
        }
        return (ord($packed[0]) === 0xfe && (ord($packed[1]) & 0xc0) === 0x80)
            || $packed === inet_pton('fd00:ec2::254');
    }
}
