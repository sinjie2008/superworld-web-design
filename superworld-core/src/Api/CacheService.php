<?php
declare(strict_types=1);

namespace Superworld\Core\Api;

/**
 * Optional short-lived catalog cache. invalidate() rotates all backend namespaces;
 * old transients expire naturally within five minutes, without table scans.
 */
final class CacheService
{
    private const GENERATION_OPTION = 'superworld_api_cache_generation';
    private const DEFAULT_TTL = 120;
    private const MAX_TTL = 300;

    public function get(string $backend, string $operation, array $arguments = []): ?array
    {
        if (!self::isCacheable($operation, $arguments)) {
            return null;
        }
        $entry = get_transient($this->key($backend, $operation, $arguments));
        return is_array($entry) && isset($entry['data']) && is_array($entry['data'])
            ? $entry['data'] : null;
    }

    public function set(
        string $backend,
        string $operation,
        array $arguments,
        array $data,
        int $ttl = self::DEFAULT_TTL
    ): bool {
        if (!self::isCacheable($operation, $arguments) || $ttl < 1) {
            return false;
        }
        return set_transient($this->key($backend, $operation, $arguments), ['data' => $data], min($ttl, self::MAX_TTL));
    }

    public static function invalidate(): void
    {
        update_option(self::GENERATION_OPTION, wp_generate_uuid4(), false);
    }

    public static function isCacheable(string $operation, array $arguments): bool
    {
        return ($operation === 'tree' && $arguments === [])
            || (in_array($operation, ['category', 'series', 'fields', 'facets'], true)
                && count($arguments) === 1 && isset($arguments['path'])
                && is_string($arguments['path']) && RequestValidator::isPath($arguments['path']));
    }

    private function key(string $backend, string $operation, array $arguments): string
    {
        ksort($arguments, SORT_STRING);
        $generation = (string) get_option(self::GENERATION_OPTION, '1');
        $identity = wp_json_encode([$backend, $operation, $arguments], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        return 'sw_api_' . hash('sha256', $generation . ':' . $identity);
    }
}
