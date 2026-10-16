<?php
declare(strict_types=1);

namespace Superworld\Core\Services;

use Superworld\Core\Api\ProductApiInterface;
use Superworld\Core\Api\RequestValidator;
use Superworld\Core\Api\ResponseValidator;

/** Explicit offline demo adapter. All sample data comes from source-derived fixtures. */
final class FixtureProductApi implements ProductApiInterface
{
    public function __construct(private string $directory) {}

    private function fixture(string $name): array
    {
        // Names are internal constants, never supplied by a REST client.
        $json = file_get_contents($this->directory . $name . '.json');
        $value = json_decode($json ?: '', true, 128, JSON_THROW_ON_ERROR);
        return $value['data'];
    }

    public function request(string $operation, array $arguments = []): array|\WP_Error
    {
        if (wp_get_environment_type() === 'production') {
            return new \WP_Error('superworld_fixture_disabled', 'Offline fixtures are disabled in production.', ['status' => 503]);
        }
        $args = RequestValidator::validate($operation, $arguments);
        if (is_wp_error($args)) {
            return $args;
        }
        try {
            $response = $this->respond($operation, $args);
            if (is_wp_error($response) || ResponseValidator::isValid($operation, $response)) {
                return $response;
            }
            return new \WP_Error('superworld_fixture_invalid', 'Offline fixture response failed contract validation.', ['status' => 503]);
        } catch (\Throwable $error) {
            return new \WP_Error('superworld_fixture_invalid', 'Offline fixture is unavailable.', ['status' => 503]);
        }
    }

    private function respond(string $operation, array $args): array|\WP_Error
    {
        if ($operation === 'index') {
            return $this->fixture('public-root');
        }
        if ($operation === 'health') {
            return $this->fixture('public-health');
        }
        $tree = $this->fixture('public-tree');
        if ($operation === 'tree') {
            return $tree;
        }
        $nodes = [];
        $visit = static function (array $children, array $breadcrumb = []) use (&$visit, &$nodes): void {
            foreach ($children as $node) {
                $nested = $node['children'] ?? [];
                unset($node['children'], $node['partCount']);
                $trail = [...$breadcrumb, $node];
                $childrenOnly = array_map(static function (array $child): array {
                    unset($child['children']);
                    return $child;
                }, $nested);
                $nodes[$node['path']] = ['resource' => $node, 'breadcrumb' => $trail, 'children' => $childrenOnly];
                $visit($nested, $trail);
            }
        };
        $visit($tree);
        $series = $this->fixture('public-series');
        $parts = [...$this->fixture('public-parts-page-1')['parts'], ...$this->fixture('public-parts-page-2')['parts']];
        if ($operation === 'search') {
            $q = $args['q'];
            $matches = static fn(array $item): bool => $q !== '' && stripos((string) wp_json_encode($item), $q) !== false;
            return ['query' => $q, 'nodes' => array_values(array_filter(array_column($nodes, 'resource'), $matches)), 'parts' => array_values(array_map(static function (array $part) use ($series): array {
                unset($part['values']);
                return $part + ['series' => $series['resource']];
            }, array_filter($parts, $matches)))];
        }
        $specFiles = ['spec_roots' => 'spec-roots', 'spec_groups' => 'spec-groups', 'spec_facets' => 'spec-facets', 'spec_products' => 'spec-products'];
        if (isset($specFiles[$operation])) {
            if ($operation === 'spec_groups') {
                $roots = $this->fixture('spec-roots')['categories'];
                if (!in_array($args['root_id'], array_column($roots, 'id'), true)) {
                    return ['groups' => []];
                }
            }
            if (isset($args['category_ids']) && $args['category_ids'] === []) {
                return $operation === 'spec_facets' ? ['facets' => []] : ['items' => [], 'total' => 0];
            }
            if (in_array($operation, ['spec_facets', 'spec_products'], true)) {
                $items = $this->fixture('spec-products')['items'];
                $items = array_values(array_filter($items, static function (array $item) use ($args): bool {
                    if (!in_array($item['categoryId'], $args['category_ids'], true)) {
                        return false;
                    }
                    foreach ($args['filters'] ?? [] as $key => $values) {
                        if ($values !== [] && !in_array((string) ($item[$key] ?? ''), array_map('strval', $values), true)) {
                            return false;
                        }
                    }
                    return true;
                }));
                if ($operation === 'spec_products') {
                    return ['items' => $items, 'total' => count($items)];
                }
                if ($items === []) {
                    return ['facets' => []];
                }
            }
            return $this->fixture($specFiles[$operation]);
        }
        $path = $args['path'] ?? '';
        if (!isset($nodes[$path])) {
            return new \WP_Error('superworld_api_not_found', 'Catalog resource not found.', ['status' => 404]);
        }
        if ($operation === 'resolve') {
            return array_intersect_key($nodes[$path], array_flip(['resource', 'breadcrumb']));
        }
        if ($operation === 'category') {
            return $nodes[$path]['resource']['type'] === 'category' ? $nodes[$path] : new \WP_Error('superworld_api_not_found', 'Category not found.', ['status' => 404]);
        }
        if ($path !== $series['resource']['path']) {
            return new \WP_Error('superworld_api_not_found', 'Series not found.', ['status' => 404]);
        }
        if ($operation === 'series') {
            return $series;
        }
        if ($operation === 'fields') {
            return $series['fields'];
        }
        if ($operation === 'facets') {
            return ['series' => $series['resource'], 'totalParts' => count($parts), 'facets' => array_map(static function (array $field) use ($parts): array {
                $counts = [];
                foreach ($parts as $part) {
                    $value = $part['values'][$field['key']] ?? null;
                    if ($value !== null && $value !== '') {
                        $counts[(string) $value] = ($counts[(string) $value] ?? 0) + 1;
                    }
                }
                ksort($counts, SORT_NATURAL | SORT_FLAG_CASE);
                return array_intersect_key($field, array_flip(['key', 'label', 'type'])) + ['values' => array_map(static fn($value, $count): array => ['value' => $value, 'count' => $count], array_keys($counts), array_values($counts))];
            }, $series['fields'])];
        }
        $knownKeys = array_column($series['fields'], 'key');
        foreach (array_keys($args['filter'] ?? []) as $key) {
            if (!in_array($key, $knownKeys, true)) {
                return new \WP_Error('superworld_api_invalid_query', 'Unknown filter field.', ['status' => 422]);
            }
        }
        $sort = $args['sort'] ?? 'sku';
        if (!in_array($sort, ['id', 'sku', 'name', ...$knownKeys], true)) {
            return new \WP_Error('superworld_api_invalid_query', 'Unknown sort field.', ['status' => 422]);
        }
        $parts = array_values(array_filter($parts, static function (array $part) use ($args): bool {
            if (($args['search'] ?? '') !== '' && stripos((string) wp_json_encode($part), $args['search']) === false) {
                return false;
            }
            foreach ($args['filter'] ?? [] as $key => $wanted) {
                if (!in_array(strtolower((string) ($part['values'][$key] ?? '')), array_map(static fn($value): string => strtolower((string) $value), (array) $wanted), true)) {
                    return false;
                }
            }
            return true;
        }));
        usort($parts, static function (array $a, array $b) use ($sort, $args): int {
            $comparison = strnatcasecmp((string) ($a[$sort] ?? $a['values'][$sort] ?? ''), (string) ($b[$sort] ?? $b['values'][$sort] ?? '')) ?: $a['id'] <=> $b['id'];
            return ($args['direction'] ?? 'asc') === 'desc' ? -$comparison : $comparison;
        });
        $per = $args['per_page'] ?? 25;
        $total = count($parts);
        $last = max(1, (int) ceil($total / $per));
        $page = min($args['page'] ?? 1, $last);
        return ['series' => $series['resource'], 'fields' => $series['fields'], 'parts' => array_slice($parts, ($page - 1) * $per, $per), 'pagination' => ['page' => $page, 'per_page' => $per, 'total' => $total, 'last_page' => $last]];
    }
}
