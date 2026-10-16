<?php
defined('ABSPATH') || exit;
$listing = $data['parts'];
$pagination = $listing['pagination'];
$instance = $data['instance'];
?>
<section class="sw-core sw-parts" data-sw-parts
    data-rest-url="<?= esc_url(rest_url('superworld/v1/parts')) ?>"
    data-path="<?= esc_attr($listing['series']['path']) ?>"
    data-inquiry-url="<?= esc_url($data['inquiry_url']) ?>"
    data-page="<?= esc_attr((string) $pagination['page']) ?>"
    data-last-page="<?= esc_attr((string) $pagination['last_page']) ?>"
    data-total="<?= esc_attr((string) $pagination['total']) ?>"
    data-per-page="<?= esc_attr((string) $pagination['per_page']) ?>">
    <h2><?= esc_html($listing['series']['name']) ?></h2>
    <form data-sw-search-form role="search">
        <label for="<?= esc_attr($instance) ?>-search"><?= esc_html__('Search parts', 'superworld-core') ?></label>
        <input id="<?= esc_attr($instance) ?>-search" type="search" name="search" maxlength="200">
        <label for="<?= esc_attr($instance) ?>-size"><?= esc_html__('Parts per page', 'superworld-core') ?></label>
        <select id="<?= esc_attr($instance) ?>-size" name="per_page">
            <?php foreach (array_unique([$pagination['per_page'], 10, 25, 50, 100]) as $size) : ?>
                <option value="<?= esc_attr((string) $size) ?>" <?= selected($pagination['per_page'], $size, false) ?>><?= esc_html((string) $size) ?></option>
            <?php endforeach; ?>
        </select>
        <?php foreach ($data['facets'] as $index => $facet) : ?>
            <label for="<?= esc_attr($instance . '-filter-' . $index) ?>"><?= esc_html($facet['label']) ?></label>
            <select id="<?= esc_attr($instance . '-filter-' . $index) ?>" name="<?= esc_attr('filter[' . $facet['key'] . ']') ?>" data-sw-filter data-field="<?= esc_attr($facet['key']) ?>">
                <option value=""><?= esc_html__('All values', 'superworld-core') ?></option>
                <?php foreach ($facet['values'] as $option) : ?>
                    <option value="<?= esc_attr((string) $option['value']) ?>"><?= esc_html((string) $option['value']) ?> (<?= esc_html((string) $option['count']) ?>)</option>
                <?php endforeach; ?>
            </select>
        <?php endforeach; ?>
        <button type="submit"><?= esc_html__('Search', 'superworld-core') ?></button>
    </form>
    <div class="sw-parts__scroll">
        <table data-sw-table>
            <caption class="screen-reader-text"><?= esc_html__('Parts and specifications', 'superworld-core') ?></caption>
            <thead><tr><th scope="col"><?= esc_html__('Select', 'superworld-core') ?></th><th scope="col">SKU</th><th scope="col"><?= esc_html__('Product', 'superworld-core') ?></th>
                <?php foreach ($listing['fields'] as $field) : ?><th scope="col"><?= esc_html($field['label']) ?></th><?php endforeach; ?>
            </tr></thead>
            <tbody>
                <?php foreach ($listing['parts'] as $part) : ?>
                    <tr><td><input type="checkbox" data-sw-select data-id="<?= esc_attr((string) $part['id']) ?>" data-sku="<?= esc_attr($part['sku']) ?>" data-name="<?= esc_attr($part['name']) ?>" aria-label="<?= esc_attr(sprintf(__('Select %s', 'superworld-core'), $part['sku'])) ?>"></td>
                        <td><?= esc_html($part['sku']) ?></td><td><?= esc_html($part['name']) ?></td>
                        <?php foreach ($listing['fields'] as $field) : ?><td><?= esc_html((string) ($part['values'][$field['key']] ?? '—')) ?></td><?php endforeach; ?>
                    </tr>
                <?php endforeach; ?>
                <?php if ($listing['parts'] === []) : ?><tr><td colspan="<?= esc_attr((string) (count($listing['fields']) + 3)) ?>"><?= esc_html__('No matching parts.', 'superworld-core') ?></td></tr><?php endif; ?>
            </tbody>
        </table>
    </div>
    <p data-sw-summary role="status" aria-live="polite"><?= esc_html(sprintf(__('Page %1$d of %2$d; %3$d parts', 'superworld-core'), $pagination['page'], $pagination['last_page'], $pagination['total'])) ?></p>
    <button type="button" data-sw-prev <?= disabled($pagination['page'] <= 1, true, false) ?>><?= esc_html__('Previous', 'superworld-core') ?></button>
    <button type="button" data-sw-next <?= disabled($pagination['page'] >= $pagination['last_page'], true, false) ?>><?= esc_html__('Next', 'superworld-core') ?></button>
    <p><span data-sw-selected-count>0</span> <?= esc_html__('selected', 'superworld-core') ?> · <a data-sw-inquiry href="<?= esc_url($data['inquiry_url']) ?>" aria-disabled="true"><?= esc_html__('Inquiry', 'superworld-core') ?></a></p>
    <noscript><p><?= esc_html__('Initial product data is available above. Enable JavaScript for filtering, pagination and inquiry selection.', 'superworld-core') ?></p></noscript>
</section>
