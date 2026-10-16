<?php
declare(strict_types=1);

namespace Superworld\Core\Controllers;

use Superworld\Core\Api\CacheService;
use Superworld\Core\Api\ProductApiInterface;

final class DiagnosticsController
{
    public function __construct(private ProductApiInterface $api) {}

    public function register(): void
    {
        add_action('admin_menu', function (): void {
            add_management_page('Superworld Core', 'Superworld Core', 'manage_options', 'superworld-core', [$this, 'page']);
        });
        add_action('admin_post_superworld_cache_clear', [$this, 'clear']);
    }

    public function clear(): void
    {
        if (!current_user_can('manage_options')) {
            wp_die(esc_html__('Permission denied.', 'superworld-core'), '', ['response' => 403]);
        }
        check_admin_referer('superworld_cache_clear');
        CacheService::invalidate();
        wp_safe_redirect(admin_url('tools.php?page=superworld-core&cleared=1'));
        exit;
    }

    public function page(): void
    {
        if (!current_user_can('manage_options')) {
            return;
        }
        echo '<div class="wrap"><h1>Superworld Core</h1><p>' . esc_html__('Configure SUPERWORLD_PRODUCT_API_BASE_URL in wp-config.php, including the actual /api prefix. Products remain in the external catalog.', 'superworld-core') . '</p>';
        echo '<p>' . esc_html__('Health is checked only when you submit this form.', 'superworld-core') . '</p>';
        if (isset($_POST['superworld_health'])) {
            check_admin_referer('superworld_health');
            $health = $this->api->request('health');
            echo '<p role="status">' . esc_html(is_wp_error($health) ? $health->get_error_message() : __('API health check passed.', 'superworld-core')) . '</p>';
        }
        echo '<form method="post">';
        wp_nonce_field('superworld_health');
        submit_button('Check API health', 'secondary', 'superworld_health');
        echo '</form><form method="post" action="' . esc_url(admin_url('admin-post.php')) . '"><input type="hidden" name="action" value="superworld_cache_clear">';
        wp_nonce_field('superworld_cache_clear');
        submit_button('Invalidate catalog cache');
        echo '</form></div>';
    }
}
