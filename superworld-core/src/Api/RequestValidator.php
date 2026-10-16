<?php
declare(strict_types=1);

namespace Superworld\Core\Api;

/** Strict input validation; catalog field keys and values are never sanitized. */
final class RequestValidator
{
    private const ARGUMENTS = [
        'index' => [],
        'health' => [],
        'tree' => [],
        'resolve' => ['path'],
        'category' => ['path'],
        'series' => ['path'],
        'fields' => ['path'],
        'parts' => ['path', 'page', 'per_page', 'search', 'filter', 'sort', 'direction'],
        'facets' => ['path'],
        'search' => ['q'],
        'spec_roots' => [],
        'spec_groups' => ['root_id'],
        'spec_facets' => ['category_ids'],
        'spec_products' => ['category_ids', 'filters'],
    ];

    public static function validate(string $operation, array $arguments = []): array|\WP_Error
    {
        if (!array_key_exists($operation, self::ARGUMENTS)) {
            return self::invalid('The catalog operation is not supported.');
        }

        foreach ($arguments as $key => $value) {
            if (!is_string($key) || !in_array($key, self::ARGUMENTS[$operation], true)) {
                return self::invalid('The catalog request contains an unsupported argument.');
            }
        }

        $canonical = [];
        foreach (self::ARGUMENTS[$operation] as $key) {
            if (!array_key_exists($key, $arguments)) {
                if ($key === 'path' || $key === 'root_id') {
                    return self::invalid('A required catalog argument is missing.');
                }
                continue;
            }

            $value = $arguments[$key];
            switch ($key) {
                case 'path':
                    if (!is_string($value) || !self::isPath($value)) {
                        return self::invalid('A valid catalog path is required.');
                    }
                    break;
                case 'page':
                case 'per_page':
                case 'root_id':
                    $value = self::positiveInteger($value, match ($key) {
                        'page' => 10000,
                        'per_page' => 100,
                        default => PHP_INT_MAX,
                    });
                    if ($value === null) {
                        return self::invalid('A catalog numeric argument is outside its allowed range.');
                    }
                    break;
                case 'q':
                case 'search':
                    if (!self::text($value, 200)) {
                        return self::invalid('Catalog search text must be a bounded string.');
                    }
                    // The backend trims search text too; other field values stay exact.
                    $value = trim($value);
                    break;
                case 'sort':
                    if (!self::isFieldKey($value)) {
                        return self::invalid('The catalog sort field is invalid.');
                    }
                    break;
                case 'direction':
                    if (!is_string($value) || !in_array($value, ['asc', 'desc'], true)) {
                        return self::invalid('The catalog sort direction must be asc or desc.');
                    }
                    break;
                case 'filter':
                case 'filters':
                    $value = self::filters($value, $key === 'filters');
                    if ($value === null) {
                        return self::invalid('Catalog filters must contain bounded scalar values and exact field keys.');
                    }
                    break;
                case 'category_ids':
                    if (!is_array($value) || !array_is_list($value) || count($value) > 100) {
                        return self::invalid('Catalog category IDs must be a list of at most 100 positive integers.');
                    }
                    $ids = [];
                    foreach ($value as $id) {
                        $id = self::positiveInteger($id, PHP_INT_MAX);
                        if ($id === null) {
                            return self::invalid('Each catalog category ID must be a positive integer.');
                        }
                        $ids[] = $id;
                    }
                    $value = array_values(array_unique($ids));
                    sort($value, SORT_NUMERIC);
                    break;
            }
            $canonical[$key] = $value;
        }

        if ($operation === 'search' && !isset($canonical['q'])) {
            $canonical['q'] = '';
        }
        if ($operation === 'spec_facets' || $operation === 'spec_products') {
            $canonical['category_ids'] ??= [];
        }
        if ($operation === 'spec_products') {
            $canonical['filters'] ??= [];
        }

        return $canonical;
    }

    /** Catalog paths are decoded slug segments, never URLs or encoded paths. */
    public static function isPath(string $value): bool
    {
        return strlen($value) <= 1024
            && preg_match('/\A[\pL\pN_-]+(?:\/[\pL\pN_-]+)*\z/uD', $value) === 1;
    }

    public static function isFieldKey(mixed $value): bool
    {
        // Brackets cannot round-trip through PHP's nested GET query parser.
        return self::text($value, 128, false) && preg_match('/[\[\]]/', $value) === 0;
    }

    private static function text(mixed $value, int $maximum, bool $allowEmpty = true): bool
    {
        return is_string($value) && ($allowEmpty || $value !== '')
            && strlen($value) <= $maximum && preg_match('//u', $value) === 1
            && preg_match('/[\x00-\x1f\x7f]/', $value) === 0;
    }

    private static function positiveInteger(mixed $value, int $maximum): ?int
    {
        if (is_string($value) && preg_match('/\A[1-9][0-9]*\z/D', $value) === 1) {
            $value = filter_var($value, FILTER_VALIDATE_INT);
        }
        return is_int($value) && $value > 0 && $value <= $maximum ? $value : null;
    }

    private static function filters(mixed $value, bool $requireLists): ?array
    {
        if (!is_array($value) || count($value) > 30 || ($value !== [] && array_is_list($value))) {
            return null;
        }
        foreach ($value as $key => $values) {
            if (!self::isFieldKey($key)) {
                return null;
            }
            if (!is_array($values)) {
                if ($requireLists || !self::filterValue($values)) {
                    return null;
                }
                continue;
            }
            if (!array_is_list($values) || count($values) > 30) {
                return null;
            }
            foreach ($values as $item) {
                if (!self::filterValue($item)) {
                    return null;
                }
            }
        }
        ksort($value, SORT_STRING);
        return $value;
    }

    private static function filterValue(mixed $value): bool
    {
        return self::text($value, 512)
            || is_int($value) || is_bool($value) || (is_float($value) && is_finite($value));
    }

    private static function invalid(string $message): \WP_Error
    {
        return ApiError::make('invalid_request', $message, 422);
    }
}
