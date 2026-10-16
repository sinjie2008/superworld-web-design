<?php
declare(strict_types=1);

namespace Superworld\Core\Core;

final class Assets
{
    public function registerHooks(): void
    {
        add_action('wp_enqueue_scripts', [$this, 'register']);
        add_action('wp_enqueue_scripts', [$this, 'discover'], 20);
        // Editor AJAX fragments may arrive after the initial document head/footer.
        add_action('elementor/preview/enqueue_scripts', [$this, 'parts']);
        add_action('elementor/frontend/after_enqueue_scripts', [$this, 'discover']);
    }

    public function register(): void
    {
        $url = plugin_dir_url(SUPERWORLD_CORE_FILE);
        wp_register_style('superworld-catalog', $url . 'assets/dist/catalog.css', [], SUPERWORLD_CORE_VERSION);
        wp_register_script('superworld-parts', $url . 'assets/dist/parts.js', [], SUPERWORLD_CORE_VERSION, ['in_footer' => true]);
    }

    public function catalog(): void
    {
        $this->register();
        wp_enqueue_style('superworld-catalog');
        // Shortcodes rendered after wp_head still need their component stylesheet.
        if (did_action('wp_head') && !wp_style_is('superworld-catalog', 'done')) {
            wp_print_styles('superworld-catalog');
        }
    }

    public function parts(): void
    {
        $this->catalog();
        wp_enqueue_script('superworld-parts');
    }

    public function discover(): void
    {
        $post = get_post();
        if (!$post) {
            return;
        }
        $content = $post->post_content;
        // Detection is an optimization. Render callbacks also enqueue, including templates.
        if (has_shortcode($content, 'superworld_parts')) {
            $this->parts();
        } elseif (has_shortcode($content, 'superworld_catalog')) {
            $this->catalog();
        }
    }
}
