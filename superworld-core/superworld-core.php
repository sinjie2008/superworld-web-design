<?php
/**
 * Plugin Name: Superworld Core
 * Description: Editorial WordPress integration and read-only Public Product API components.
 * Version: 0.1.0
 * Requires at least: 6.8
 * Requires PHP: 8.3
 * License: GPL-2.0-or-later
 * Text Domain: superworld-core
 */

defined('ABSPATH') || exit;

define('SUPERWORLD_CORE_VERSION', '0.1.0');
define('SUPERWORLD_CORE_FILE', __FILE__);
define('SUPERWORLD_CORE_PATH', __DIR__ . '/');

require_once __DIR__ . '/autoload.php';

register_activation_hook(__FILE__, static function (): void {
    if (version_compare(PHP_VERSION, '8.3', '<') || version_compare(get_bloginfo('version'), '6.8', '<')) {
        wp_die(esc_html__('Superworld Core requires PHP 8.3 and WordPress 6.8 or newer.', 'superworld-core'));
    }
    \Superworld\Core\PostTypes\EditorialPostTypes::register_types();
    flush_rewrite_rules(false);
});
register_deactivation_hook(__FILE__, static function (): void {
    \Superworld\Core\Api\CacheService::invalidate();
    foreach (['sw_news', 'sw_event', 'sw_announcement'] as $type) {
        if (post_type_exists($type)) {
            unregister_post_type($type);
        }
    }
    flush_rewrite_rules(false);
});

add_action('plugins_loaded', static function (): void {
    if (version_compare(PHP_VERSION, '8.3', '<') || version_compare(get_bloginfo('version'), '6.8', '<')) {
        add_action('admin_notices', static function (): void {
            echo '<div class="notice notice-error"><p>' . esc_html__('Superworld Core needs PHP 8.3 and WordPress 6.8 or newer.', 'superworld-core') . '</p></div>';
        });
        return;
    }
    (new \Superworld\Core\Core\Plugin())->register();
});
