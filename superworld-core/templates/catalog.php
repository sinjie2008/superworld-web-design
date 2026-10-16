<?php
defined('ABSPATH') || exit;
$renderNodes = static function (array $nodes, int $depth = 0) use (&$renderNodes): void {
    if ($depth > 30) {
        return;
    }
    echo '<ul class="sw-catalog-list">';
    foreach ($nodes as $node) {
        $url = add_query_arg('sw_path', $node['path'], get_permalink() ?: home_url('/'));
        echo '<li><a href="' . esc_url($url) . '">' . esc_html($node['name']) . '</a>';
        if (isset($node['partCount'])) {
            echo ' <span>' . esc_html(sprintf(__('(%d parts)', 'superworld-core'), $node['partCount'])) . '</span>';
        }
        if (!empty($node['children'])) {
            $renderNodes($node['children'], $depth + 1);
        }
        echo '</li>';
    }
    echo '</ul>';
};
?>
<nav class="sw-core" aria-label="<?= esc_attr__('Product catalog', 'superworld-core') ?>">
    <?php if ($data['resource']) : ?><h2><?= esc_html($data['resource']['name']) ?></h2><?php endif; ?>
    <?php $renderNodes($data['nodes']); ?>
    <?php if ($data['nodes'] === []) : ?><p><?= esc_html__('No catalog entries found.', 'superworld-core') ?></p><?php endif; ?>
</nav>
