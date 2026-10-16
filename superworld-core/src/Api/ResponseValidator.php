<?php
declare(strict_types=1);

namespace Superworld\Core\Api;

/** Validate the pinned public contracts while preserving every dynamic key. */
final class ResponseValidator
{
    public static function isValid(string $operation, mixed $data): bool
    {
        if (!is_array($data)) {
            return false;
        }
        return match ($operation) {
            'index' => self::index($data),
            'health' => ($data['status'] ?? null) === 'ok'
                && ($data['database'] ?? null) === 'connected'
                && ($data['writeOperations'] ?? null) === false,
            'tree' => self::tree($data),
            'resolve' => self::resource($data),
            'category' => self::resource($data, 'category')
                && self::rows($data['children'] ?? null, self::node(...)),
            'series' => self::resource($data, 'series')
                && self::fields($data['fields'] ?? null)
                && self::rows($data['metadata'] ?? null, self::metadata(...))
                && self::count($data['partCount'] ?? null),
            'fields' => self::fields($data),
            'parts' => self::parts($data),
            'facets' => self::node($data['series'] ?? null, 'series')
                && self::count($data['totalParts'] ?? null)
                && self::rows($data['facets'] ?? null, self::facet(...)),
            'search' => self::search($data),
            'spec_roots' => self::rows($data['categories'] ?? null, self::namedId(...)),
            'spec_groups' => self::rows($data['groups'] ?? null, self::group(...)),
            'spec_facets' => self::rows($data['facets'] ?? null, self::specFacet(...)),
            'spec_products' => self::count($data['total'] ?? null)
                && self::rows($data['items'] ?? null, self::specProduct(...), 500)
                && $data['total'] === count($data['items']),
            default => false,
        };
    }

    private static function index(array $data): bool
    {
        return self::text($data['name'] ?? null)
            && self::text($data['sourceOfTruth'] ?? null)
            && ($data['readOnly'] ?? null) === true
            && ($data['requiresMigration'] ?? null) === false
            && ($data['requiresImport'] ?? null) === false
            && ($data['requiresManualSync'] ?? null) === false
            && self::count($data['endpointCount'] ?? null)
            && self::rows($data['endpoints'] ?? null, static fn ($value): bool => self::text($value, 2048))
            && $data['endpointCount'] === count($data['endpoints'])
            && self::tree($data['tree'] ?? null);
    }

    private static function tree(mixed $data): bool
    {
        $budget = 20000;
        return self::treeBranch($data, null, '', 0, $budget);
    }

    private static function treeBranch(mixed $rows, ?int $parentId, string $parentPath, int $depth, int &$budget): bool
    {
        if (!is_array($rows) || !array_is_list($rows) || $depth > 32) {
            return false;
        }
        $seen = [];
        foreach ($rows as $node) {
            if (--$budget < 0 || !self::node($node)
                || $node['parentId'] !== $parentId || isset($seen[$node['id']])
                || $node['path'] !== ($parentPath === '' ? '' : $parentPath . '/') . $node['slug']
                || ($node['type'] === 'series' && !self::count($node['partCount'] ?? null))
                || !self::treeBranch($node['children'] ?? null, $node['id'], $node['path'], $depth + 1, $budget)) {
                return false;
            }
            $seen[$node['id']] = true;
        }
        return true;
    }

    private static function node(mixed $node, ?string $type = null): bool
    {
        return is_array($node) && self::id($node['id'] ?? null)
            && array_key_exists('parentId', $node)
            && ($node['parentId'] === null || self::id($node['parentId']))
            && self::text($node['name'] ?? null)
            && in_array($node['type'] ?? null, ['category', 'series'], true)
            && ($type === null || $node['type'] === $type)
            && is_string($node['slug'] ?? null)
            && RequestValidator::isPath($node['slug']) && !str_contains($node['slug'], '/')
            && is_string($node['path'] ?? null) && RequestValidator::isPath($node['path'])
            && basename($node['path']) === $node['slug']
            && is_int($node['displayOrder'] ?? null)
            && (!array_key_exists('partCount', $node) || self::count($node['partCount']));
    }

    private static function resource(array $data, ?string $type = null): bool
    {
        if (!self::node($data['resource'] ?? null, $type)
            || !self::rows($data['breadcrumb'] ?? null, self::node(...), 33)
            || $data['breadcrumb'] === []) {
            return false;
        }
        $previous = null;
        foreach ($data['breadcrumb'] as $node) {
            if ($previous !== null && ($node['parentId'] !== $previous['id']
                || $node['path'] !== $previous['path'] . '/' . $node['slug'])) {
                return false;
            }
            $previous = $node;
        }
        return $previous['id'] === $data['resource']['id']
            && $previous['path'] === $data['resource']['path']
            && $previous['type'] === $data['resource']['type'];
    }

    private static function fields(mixed $rows): bool
    {
        if (!self::rows($rows, self::field(...), 5000)) {
            return false;
        }
        $ids = [];
        $keys = [];
        foreach ($rows as $field) {
            if (isset($ids[$field['id']]) || isset($keys[$field['key']])) {
                return false;
            }
            $ids[$field['id']] = true;
            $keys[$field['key']] = true;
        }
        return true;
    }

    private static function field(mixed $field): bool
    {
        return is_array($field) && self::id($field['id'] ?? null)
            && self::fieldDescription($field)
            && array_key_exists('defaultValue', $field) && self::scalar($field['defaultValue'])
            && is_int($field['sortOrder'] ?? null) && is_bool($field['required'] ?? null);
    }

    private static function fieldDescription(array $field): bool
    {
        return self::key($field['key'] ?? null) && self::text($field['label'] ?? null)
            && in_array($field['type'] ?? null, ['text', 'number', 'file'], true);
    }

    private static function metadata(mixed $field): bool
    {
        return is_array($field) && self::fieldDescription($field)
            && array_key_exists('value', $field) && self::scalar($field['value'])
            && is_int($field['sortOrder'] ?? null);
    }

    private static function parts(array $data): bool
    {
        if (!self::node($data['series'] ?? null, 'series') || !self::fields($data['fields'] ?? null)
            || !self::pagination($data['pagination'] ?? null)
            || !self::rows($data['parts'] ?? null, self::part(...), 100)
            || count($data['parts']) > $data['pagination']['per_page']) {
            return false;
        }
        $keys = array_column($data['fields'], 'key');
        foreach ($data['parts'] as $part) {
            if (count($part['values']) !== count($keys)) {
                return false;
            }
            foreach ($keys as $key) {
                if (!array_key_exists($key, $part['values'])) {
                    return false;
                }
            }
        }
        $pagination = $data['pagination'];
        $expected = min($pagination['per_page'], max(0, $pagination['total'] - ($pagination['page'] - 1) * $pagination['per_page']));
        return count($data['parts']) === $expected;
    }

    private static function pagination(mixed $pagination): bool
    {
        return is_array($pagination) && self::id($pagination['page'] ?? null)
            && self::id($pagination['per_page'] ?? null) && $pagination['per_page'] <= 100
            && self::count($pagination['total'] ?? null) && self::id($pagination['last_page'] ?? null)
            && $pagination['page'] <= $pagination['last_page']
            && $pagination['last_page'] === max(1, (int) ceil($pagination['total'] / $pagination['per_page']));
    }

    private static function part(mixed $part): bool
    {
        return self::partIdentity($part) && array_key_exists('description', $part)
            && ($part['description'] === null || self::text($part['description'], 1048576))
            && self::valueMap($part['values'] ?? null);
    }

    private static function partIdentity(mixed $part): bool
    {
        return is_array($part) && self::id($part['id'] ?? null)
            && self::text($part['sku'] ?? null) && self::text($part['name'] ?? null);
    }

    private static function facet(mixed $facet): bool
    {
        return is_array($facet) && self::fieldDescription($facet)
            && self::rows($facet['values'] ?? null, static fn ($row): bool => is_array($row)
                && array_key_exists('value', $row) && self::scalar($row['value']) && self::id($row['count'] ?? null));
    }

    private static function search(array $data): bool
    {
        return self::text($data['query'] ?? null, 200)
            && self::rows($data['nodes'] ?? null, self::node(...))
            && self::rows($data['parts'] ?? null, static fn ($part): bool => self::partIdentity($part)
                && array_key_exists('description', $part)
                && ($part['description'] === null || self::text($part['description'], 1048576))
                && self::node($part['series'] ?? null, 'series'), 100);
    }

    private static function namedId(mixed $row): bool
    {
        return is_array($row) && self::id($row['id'] ?? null) && self::text($row['name'] ?? null);
    }

    private static function group(mixed $group): bool
    {
        return is_array($group) && self::text($group['group'] ?? null)
            && self::rows($group['categories'] ?? null, self::namedId(...));
    }

    private static function specFacet(mixed $facet): bool
    {
        return is_array($facet) && self::key($facet['key'] ?? null) && self::text($facet['label'] ?? null)
            && self::rows($facet['values'] ?? null, self::scalar(...));
    }

    private static function specProduct(mixed $product): bool
    {
        return self::partIdentity($product) && self::text($product['series'] ?? null)
            && self::id($product['seriesId'] ?? null) && self::text($product['category'] ?? null)
            && self::id($product['categoryId'] ?? null)
            && self::text($product['seriesImage'] ?? null, 1048576)
            && self::text($product['pdfDownload'] ?? null, 16384) && self::valueMap($product);
    }

    private static function valueMap(mixed $values): bool
    {
        if (!is_array($values)) {
            return false;
        }
        foreach ($values as $key => $value) {
            // PHP casts numeric object keys to integers; neither form is rewritten.
            if (!self::key((string) $key) || !self::scalar($value)) {
                return false;
            }
        }
        return true;
    }

    private static function rows(mixed $rows, callable $validator, int $maximum = 20000): bool
    {
        if (!is_array($rows) || !array_is_list($rows) || count($rows) > $maximum) {
            return false;
        }
        foreach ($rows as $row) {
            if (!$validator($row)) {
                return false;
            }
        }
        return true;
    }

    private static function key(mixed $value): bool
    {
        return self::text($value, 256) && $value !== '' && preg_match('/[\x00-\x1f\x7f]/', $value) === 0;
    }

    private static function text(mixed $value, int $maximum = 4096): bool
    {
        return is_string($value) && strlen($value) <= $maximum;
    }

    private static function scalar(mixed $value): bool
    {
        return $value === null || is_bool($value) || is_int($value)
            || (is_float($value) && is_finite($value)) || self::text($value, 1048576);
    }

    private static function id(mixed $value): bool
    {
        return is_int($value) && $value > 0;
    }

    private static function count(mixed $value): bool
    {
        return is_int($value) && $value >= 0;
    }
}
