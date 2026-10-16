<?php
declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}
$root = $argv[1] ?? getenv('WP_TEST_ROOT');
if (!$root || !is_file($root . '/wp-load.php')) {
    fwrite(STDERR, "Usage: php tests/php/run.php /path/to/DISPOSABLE/wordpress\n");
    exit(2);
}
$_SERVER['HTTP_HOST'] ??= getenv('SW_WP_TEST_HOST') ?: '';
$_SERVER['REQUEST_URI'] ??= '/';
require $root . '/wp-load.php';
if (wp_get_environment_type() === 'production') {
    fwrite(STDERR, "Refusing tests against a production WordPress installation.\n");
    exit(2);
}
require_once ABSPATH . 'wp-admin/includes/plugin.php';

use Superworld\Core\Api\ProductApiClient;
use Superworld\Core\Api\ProductApiInterface;
use Superworld\Core\Core\Assets;
use Superworld\Core\Core\Plugin;
use Superworld\Core\Rest\CatalogRoutes;
use Superworld\Core\Services\FixtureProductApi;
use Superworld\Core\Shortcodes\CatalogShortcodes;

$count = 0;
$assert = static function (bool $condition, string $label) use (&$count): void {
    if (!$condition) {
        throw new RuntimeException('FAIL: ' . $label);
    }
    $count++;
    echo 'PASS ' . $label . PHP_EOL;
};

try {
    $activation = activate_plugin('superworld-core/superworld-core.php');
    $assert(!is_wp_error($activation) && is_plugin_active('superworld-core/superworld-core.php'), 'plugin activation on actual WordPress');
    if (!class_exists(Plugin::class)) {
        require_once dirname(__DIR__, 2) . '/superworld-core.php';
    }
    $fixture = new FixtureProductApi(dirname(__DIR__) . '/fixtures/public-api-v1/');
    $assert($fixture instanceof ProductApiInterface, 'fixture adapter implements replaceable API boundary');
    $tree = $fixture->request('tree');
    $path = $tree[0]['children'][0]['children'][0]['path'];
    $assert(!is_wp_error($fixture->request('health')), 'offline health response contract');
    $assert(!is_wp_error($fixture->request('resolve', ['path' => $path])), 'offline series resolution');
    $listing = $fixture->request('parts', ['path' => $path, 'per_page' => 1]);
    $assert($listing['pagination']['last_page'] === 2 && count($listing['parts']) === 1, 'offline pagination page one');
    $listing2 = $fixture->request('parts', ['path' => $path, 'per_page' => 1, 'page' => 2]);
    $assert($listing2['parts'][0]['id'] !== $listing['parts'][0]['id'], 'offline pagination page two');
    $filtered = $fixture->request('parts', ['path' => $path, 'filter' => [$listing['fields'][0]['key'] => $listing['parts'][0]['values'][$listing['fields'][0]['key']]]]);
    $assert($filtered['pagination']['total'] === 1, 'offline filter uses exact API field key');
    $empty = $fixture->request('parts', ['path' => $path, 'search' => 'no-such-synthetic-part']);
    $assert($empty['parts'] === [] && $empty['pagination']['last_page'] === 1, 'empty listing remains a valid response');

    $shortcodes = new CatalogShortcodes($fixture, new Assets());
    $shortcodes->register();
    ob_start();
    $html = do_shortcode('[superworld_catalog]');
    $unexpectedOutput = ob_get_clean();
    $assert(str_contains($html, $path) && str_contains($html, 'AX-10'), 'catalog shortcode renders nested hierarchy');
    $assert($unexpectedOutput === '', 'shortcode returns content without direct output');
    $parts = do_shortcode('[superworld_parts path="' . $path . '" per_page="1"]');
    $assert(str_contains($parts, 'SYN-AX10-01') && str_contains($parts, 'data-sw-parts'), 'parts shortcode renders API content before JavaScript');
    $assert(str_contains($parts, 'DCR (mΩ)') && str_contains($parts, 'data-field="dcr"'), 'definitions drive table and filter controls');
    $assert(wp_script_is('superworld-parts', 'enqueued') && wp_style_is('superworld-catalog', 'enqueued'), 'components enqueue registered assets');
    $assert(str_contains(do_shortcode('[superworld_parts path="../admin"]'), 'Product data is unavailable'), 'invalid shortcode path renders safe diagnostic');
    $broken = new class implements ProductApiInterface {
        public function request(string $operation, array $arguments = []): array|WP_Error {
            return new WP_Error('network', 'secret backend URL must not render', ['status' => 502, 'correlationId' => 'safe-ref']);
        }
    };
    $error = (new CatalogShortcodes($broken, new Assets()))->parts(['path' => $path]);
    $assert(str_contains($error, 'safe-ref') && !str_contains($error, 'secret backend'), 'PHP error renderer escapes and redacts diagnostics');
    $_GET['sw_path'] = $path;
    $assert(str_contains($shortcodes->catalog(), 'data-sw-parts'), 'catalog link resolves to SSR series component');
    $assert(str_contains($shortcodes->catalog(['path' => $tree[0]['path']]), 'data-sw-parts'), 'scoped catalog can navigate to a descendant series');
    $_GET['sw_path'] = $tree[0]['children'][0]['path'];
    $assert(str_contains($shortcodes->catalog(['path' => $tree[0]['path']]), 'AX-10'), 'scoped catalog can navigate to a child category');
    $_GET['sw_path'] = 'outside/component';
    $assert(str_contains($shortcodes->catalog(['path' => $tree[0]['path']]), 'Product data is unavailable'), 'scoped catalog rejects navigation outside its subtree');
    unset($_GET['sw_path']);

    $malicious = new class($fixture) implements ProductApiInterface {
        public function __construct(private ProductApiInterface $base) {}
        public function request(string $operation, array $arguments = []): array|WP_Error {
            $data = $this->base->request($operation, $arguments);
            if ($operation === 'parts' && is_array($data)) {
                $data['parts'][0]['name'] = '<img src=x onerror=alert(1)>';
                $data['fields'][0]['label'] = '<script>bad()</script>';
            }
            return $data;
        }
    };
    $escaped = (new CatalogShortcodes($malicious, new Assets()))->parts(['path' => $path]);
    $assert(!str_contains($escaped, '<img src=x') && str_contains($escaped, '&lt;img'), 'API product text escaped in server HTML');
    $assert(!str_contains($escaped, '<script>bad') && str_contains($escaped, '&lt;script'), 'API field labels escaped in server HTML');

    foreach (['sw_news', 'sw_event', 'sw_announcement'] as $type) {
        $assert(post_type_exists($type) && get_post_type_object($type)->show_in_rest, 'editorial CPT ' . $type);
    }
    $assert(!post_type_exists('sw_product'), 'no duplicate product CPT');
    $routes = new CatalogRoutes($fixture);
    $routes->register();
    $server = rest_get_server();
    delete_transient('superworld_rest_budget');
    foreach (['tree' => [], 'resolve' => ['path' => $path], 'series' => ['path' => $path], 'fields' => ['path' => $path], 'facets' => ['path' => $path], 'parts' => ['path' => $path, 'page' => '2', 'per_page' => '1'], 'search' => ['q' => 'SYN']] as $route => $params) {
        $request = new WP_REST_Request('GET', '/superworld/v1/' . $route);
        $request->set_query_params($params);
        $response = $server->dispatch($request);
        $assert($response->get_status() === 200, 'actual WordPress REST ' . $route);
    }
    $request = new WP_REST_Request('GET', '/superworld/v1/parts');
    $request->set_query_params(['path' => $path, 'per_page' => '101']);
    $assert($server->dispatch($request)->get_status() === 422, 'REST rejects oversized page size');
    $request->set_query_params(['path' => 'http://evil.test/api']);
    $assert($server->dispatch($request)->get_status() === 422, 'REST rejects URL as catalog path');
    $request->set_query_params(['path' => $path, 'base_url' => 'http://evil.test']);
    $assert($server->dispatch($request)->get_status() === 422, 'REST cannot override backend destination');
    $post = new WP_REST_Request('POST', '/superworld/v1/parts');
    $assert($server->dispatch($post)->get_status() === 404, 'public REST rejects mutation methods');
    $limit = static fn() => 1;
    add_filter('superworld_core/rest_budget', $limit);
    delete_transient('superworld_rest_budget');
    $request = new WP_REST_Request('GET', '/superworld/v1/tree');
    $server->dispatch($request);
    $assert($server->dispatch($request)->get_status() === 429, 'bounded site request budget enforced');
    remove_filter('superworld_core/rest_budget', $limit);
    delete_transient('superworld_rest_budget');

    $diagnostics = new \Superworld\Core\Controllers\DiagnosticsController($fixture);
    $dieHandler = static fn() => static function (): void { throw new RuntimeException('test_wp_die'); };
    add_filter('wp_die_handler', $dieHandler);
    wp_set_current_user(0);
    try {
        $diagnostics->clear();
        $assert(false, 'anonymous cache purge must be denied');
    } catch (RuntimeException $error) {
        $assert($error->getMessage() === 'test_wp_die', 'cache purge requires administrator capability');
    }
    $adminIds = get_users(['role' => 'administrator', 'number' => 1, 'fields' => 'ID']);
    $assert($adminIds !== [], 'disposable WordPress has an administrator for permission tests');
    wp_set_current_user((int) $adminIds[0]);
    unset($_REQUEST['_wpnonce']);
    try {
        $diagnostics->clear();
        $assert(false, 'cache purge with missing nonce must be denied');
    } catch (RuntimeException $error) {
        $assert($error->getMessage() === 'test_wp_die', 'administrator cache purge requires a valid nonce');
    }
    remove_filter('wp_die_handler', $dieHandler);
    wp_set_current_user(0);

    if (function_exists('acf_get_local_field_group')) {
        $assert((bool) acf_get_local_field_group('group_superworld_editorial'), 'real ACF loads the versioned hero field group');
        $assert((bool) acf_get_local_field_group('group_superworld_event'), 'real ACF loads event date field group');
        $pageId = wp_insert_post(['post_type' => 'page', 'post_status' => 'draft', 'post_title' => 'Temporary ACF assertion']);
        update_field('field_superworld_hero_title', '<b>Editable ACF title</b>', $pageId);
        $GLOBALS['post'] = get_post($pageId);
        $editorial = do_shortcode('[superworld_editorial field="hero_title"]');
        $assert($editorial === '&lt;b&gt;Editable ACF title&lt;/b&gt;', 'actual ACF field renders escaped shortcode content');
        $assert(do_shortcode('[superworld_editorial field="unknown"]') === '', 'editorial shortcode restricts readable fields');
        $revisionId = wp_save_post_revision($pageId);
        $assert(is_int($revisionId) && $revisionId > 0, 'actual WordPress creates an editorial preview revision');
        delete_metadata('post', $revisionId, 'hero_title');
        $previousPreview = $GLOBALS['wp_query']->is_preview;
        $GLOBALS['wp_query']->is_preview = true;
        $_GET['preview_id'] = $pageId;
        wp_set_current_user((int) $adminIds[0]);
        $assert(\Superworld\Core\Services\EditorialValue::read('hero_title', $pageId) === '<b>Editable ACF title</b>', 'preview missing revision field retains saved editorial text');
        update_metadata('post', $revisionId, 'hero_title', '');
        $emptyPreview = \Superworld\Core\Services\EditorialValue::read('hero_title', $pageId);
        $assert($emptyPreview === '' || $emptyPreview === false || $emptyPreview === null, 'intentionally cleared revision field does not restore the old title');
        $GLOBALS['wp_query']->is_preview = $previousPreview;
        unset($_GET['preview_id']);
        wp_set_current_user(0);
        if (class_exists('Elementor\\Plugin')) {
            $manager = \Elementor\Plugin::$instance->dynamic_tags;
            $tags = $manager->get_tags();
            $assert(isset($tags['superworld-hero-title']), 'actual Elementor registers the public dynamic tag');
            $tag = new \Superworld\Core\Elementor\DynamicTags\HeroTitleTag();
            ob_start();
            $tag->render();
            $tagContent = ob_get_clean();
            $assert($tagContent === $editorial, 'Elementor PHP dynamic tag resolves the ACF value');
        } else {
            echo "BLOCKED Elementor PHP tag: host plugin unavailable.\n";
        }
        wp_delete_post($pageId, true);
        unset($GLOBALS['post']);
    } else {
        echo "BLOCKED ACF integration: host plugin unavailable.\n";
    }

    require __DIR__ . '/adapter.php';
    run_adapter_tests($assert);

    deactivate_plugins('superworld-core/superworld-core.php');
    $assert(!is_plugin_active('superworld-core/superworld-core.php') && !post_type_exists('sw_news'), 'deactivation unregisters editorial rewrite owners');
    $reactivation = activate_plugin('superworld-core/superworld-core.php');
    $assert(!is_wp_error($reactivation) && post_type_exists('sw_news'), 'reactivation restores editorial types');

    echo 'RESULT PASS: ' . $count . ' assertions; WordPress ' . get_bloginfo('version') . '; PHP ' . PHP_VERSION . PHP_EOL;
} catch (Throwable $error) {
    fwrite(STDERR, $error->getMessage() . PHP_EOL . $error->getTraceAsString() . PHP_EOL);
    exit(1);
}
