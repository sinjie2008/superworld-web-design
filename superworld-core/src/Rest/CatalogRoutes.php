<?php
declare(strict_types=1);

namespace Superworld\Core\Rest;

use Superworld\Core\Api\ProductApiInterface;
use Superworld\Core\Api\RequestValidator;

final class CatalogRoutes
{
    private const ROUTES = [
        'tree' => 'tree', 'resolve' => 'resolve', 'categories' => 'category',
        'series' => 'series', 'fields' => 'fields', 'parts' => 'parts',
        'facets' => 'facets', 'search' => 'search',
    ];

    public function __construct(private ProductApiInterface $api) {}

    public function register(): void
    {
        add_action('rest_api_init', function (): void {
            foreach (self::ROUTES as $route => $operation) {
                register_rest_route('superworld/v1', '/' . $route, [
                    'methods' => \WP_REST_Server::READABLE,
                    // These endpoints expose only the backend's public read model.
                    'permission_callback' => '__return_true',
                    'callback' => fn(\WP_REST_Request $request) => $this->dispatch($operation, $request),
                ]);
            }
        });
    }

    public function dispatch(string $operation, \WP_REST_Request $request): \WP_REST_Response|\WP_Error
    {
        $args = $request->get_query_params();
        foreach (['_fields', '_embed', '_envelope', '_locale', 'context', 'rest_route'] as $wpArg) {
            unset($args[$wpArg]);
        }
        $valid = RequestValidator::validate($operation, $args);
        if (is_wp_error($valid)) {
            return $valid;
        }
        // Fixed global budget bounds persistent storage. Also rate-limit at the edge in production.
        if (!RateBudget::allow()) {
            return new \WP_Error('superworld_rate_limit', __('Catalog request budget reached. Please try again shortly.', 'superworld-core'), ['status' => 429]);
        }
        $result = $this->api->request($operation, $valid);
        if (is_wp_error($result)) {
            return $result;
        }
        return new \WP_REST_Response($result, 200, ['Cache-Control' => 'no-store']);
    }
}
