<?php defined('ABSPATH') || exit; ?>
<div class="sw-core" role="status">
    <p><?= esc_html($data['message']) ?></p>
    <?php if ($data['correlationId'] !== '') : ?>
        <small><?= esc_html__('Reference:', 'superworld-core') ?> <?= esc_html($data['correlationId']) ?></small>
    <?php endif; ?>
</div>
