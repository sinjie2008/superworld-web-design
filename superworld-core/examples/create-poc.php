<?php
declare(strict_types=1);

// Standard WordPress APIs only; does not write undocumented Elementor document metadata.
if (PHP_SAPI !== 'cli' || empty($argv[1])) {
    exit(2);
}
require rtrim($argv[1], '/') . '/wp-load.php';
if (wp_get_environment_type() === 'production' || !function_exists('update_field')) {
    fwrite(STDERR, "Use a disposable non-production WordPress installation with ACF enabled.\n");
    exit(2);
}
$existing = get_page_by_path('superworld-foundation-poc');
$id = wp_insert_post([
    'ID' => $existing ? $existing->ID : 0,
    'post_type' => 'page', 'post_status' => 'publish',
    'post_title' => 'Superworld Foundation POC', 'post_name' => 'superworld-foundation-poc',
    'post_content' => '<!-- wp:heading --><h2>Editorial field</h2><!-- /wp:heading -->' . "\n" .
        '[superworld_editorial field="hero_title"]' . "\n" .
        '[superworld_catalog]' . "\n" .
        '[superworld_parts path="general/emc/ax-10" per_page="1"]' . "\n" .
        '[superworld_parts path="general/emc/ax-10" per_page="1"]',
], true);
if (is_wp_error($id)) {
    fwrite(STDERR, "Unable to create POC page.\n");
    exit(1);
}
update_field('field_superworld_hero_title', 'Superworld editable editorial title', $id);
update_field('field_superworld_hero_intro', 'Editorial content is stored in WordPress; product data remains in the Public Product API.', $id);
echo 'POC page ID: ' . $id . PHP_EOL;
