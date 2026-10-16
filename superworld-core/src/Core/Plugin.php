<?php
declare(strict_types=1);

namespace Superworld\Core\Core;

use Superworld\Core\Api\CacheService;
use Superworld\Core\Api\ProductApiClient;
use Superworld\Core\Api\ProductApiInterface;
use Superworld\Core\Controllers\DiagnosticsController;
use Superworld\Core\Elementor\Integration;
use Superworld\Core\Fields\EditorialFields;
use Superworld\Core\PostTypes\EditorialPostTypes;
use Superworld\Core\Rest\CatalogRoutes;
use Superworld\Core\Services\FixtureProductApi;
use Superworld\Core\Shortcodes\CatalogShortcodes;

final class Plugin
{
    public function register(): void
    {
        $api = self::api();
        $assets = new Assets();
        EditorialPostTypes::register();
        EditorialFields::register();
        Integration::register();
        $assets->registerHooks();
        (new CatalogShortcodes($api, $assets))->register();
        (new CatalogRoutes($api))->register();
        (new DiagnosticsController($api))->register();
    }

    public static function api(): ProductApiInterface
    {
        $mode = defined('SUPERWORLD_API_MODE') ? SUPERWORLD_API_MODE : 'live';
        // Fixtures are an explicit development capability, never an outage fallback.
        if ($mode === 'fixture' && wp_get_environment_type() !== 'production') {
            $api = new FixtureProductApi(SUPERWORLD_CORE_PATH . 'tests/fixtures/public-api-v1/');
        } else {
            $base = defined('SUPERWORLD_PRODUCT_API_BASE_URL') ? (string) SUPERWORLD_PRODUCT_API_BASE_URL : '';
            $private = defined('SUPERWORLD_ALLOW_PRIVATE_API') && SUPERWORLD_ALLOW_PRIVATE_API === true
                && wp_get_environment_type() !== 'production';
            $api = new ProductApiClient($base, new CacheService(), 8, $private);
        }
        $custom = apply_filters('superworld_core/api', $api);
        return $custom instanceof ProductApiInterface ? $custom : $api;
    }
}
