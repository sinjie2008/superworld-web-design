<?php
declare(strict_types=1);

namespace Superworld\Core\Shortcodes;

use Superworld\Core\Api\ProductApiInterface;
use Superworld\Core\Core\Assets;
use Superworld\Core\Core\Template;
use Superworld\Core\Services\EditorialValue;

final class CatalogShortcodes
{
    public function __construct(private ProductApiInterface $api, private Assets $assets) {}

    public function register(): void
    {
        add_shortcode('superworld_catalog', [$this, 'catalog']);
        add_shortcode('superworld_parts', [$this, 'parts']);
        add_shortcode('superworld_editorial', [$this, 'editorial']);
    }

    private function error(\WP_Error $error): string
    {
        return Template::render('error', ['message' => __('Product data is unavailable. Please try again later.', 'superworld-core'), 'correlationId' => $error->get_error_data()['correlationId'] ?? '']);
    }

    public function catalog(array|string $attributes = []): string
    {
        $atts = shortcode_atts(['path' => ''], $attributes, 'superworld_catalog');
        $path = (string) $atts['path'];
        if (isset($_GET['sw_path'])) {
            if (!is_string($_GET['sw_path'])) {
                return $this->error(new \WP_Error('superworld_invalid_path', 'Invalid catalog path.'));
            }
            $requested = wp_unslash($_GET['sw_path']);
            if ($path !== '' && $requested !== $path && !str_starts_with($requested, $path . '/')) {
                return $this->error(new \WP_Error('superworld_invalid_path', 'Catalog path is outside this component.'));
            }
            $path = $requested;
            $resolved = $this->api->request('resolve', ['path' => $path]);
            if (is_wp_error($resolved)) {
                return $this->error($resolved);
            }
            if ($resolved['resource']['type'] === 'series') {
                return $this->parts(['path' => $path]);
            }
        }
        $result = $path === '' ? $this->api->request('tree') : $this->api->request('category', ['path' => $path]);
        if (is_wp_error($result)) {
            return $this->error($result);
        }
        $this->assets->catalog();
        return Template::render('catalog', ['nodes' => $path === '' ? $result : $result['children'], 'resource' => $result['resource'] ?? null]);
    }

    public function parts(array|string $attributes = []): string
    {
        $atts = shortcode_atts(['path' => '', 'per_page' => '10', 'inquiry_url' => ''], $attributes, 'superworld_parts');
        $args = ['path' => (string) $atts['path'], 'per_page' => $atts['per_page']];
        $result = $this->api->request('parts', $args);
        if (is_wp_error($result)) {
            return $this->error($result);
        }
        $facets = $this->api->request('facets', ['path' => (string) $atts['path']]);
        // Failures in optional facets must not hide a valid parts table.
        $this->assets->parts();
        $inquiry = $atts['inquiry_url'] === '' ? home_url('/inquiry/') : wp_validate_redirect((string) $atts['inquiry_url'], home_url('/inquiry/'));
        return Template::render('parts', ['parts' => $result, 'facets' => is_wp_error($facets) ? [] : $facets['facets'], 'inquiry_url' => $inquiry, 'instance' => wp_unique_id('sw-parts-')]);
    }

    public function editorial(array|string $attributes = []): string
    {
        $atts = shortcode_atts(['field' => 'hero_title'], $attributes, 'superworld_editorial');
        if (!in_array($atts['field'], ['hero_title', 'hero_intro'], true) || !function_exists('get_field')) {
            return '';
        }
        $value = EditorialValue::read($atts['field']);
        return is_scalar($value) ? esc_html((string) $value) : '';
    }
}
