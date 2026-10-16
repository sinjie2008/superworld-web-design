<?php
declare(strict_types=1);

namespace Superworld\Core\Services;

/** Plain editorial text only; preserve ACF preview edits, including intentional clears. */
final class EditorialValue
{
    public static function read(string $field, ?int $postId = null): mixed
    {
        if (!in_array($field, ['hero_title', 'hero_intro'], true) || !function_exists('get_field')) {
            return null;
        }
        $postId ??= (int) get_the_ID();
        if ($postId < 1) {
            return null;
        }
        $postId = wp_is_post_revision($postId) ?: $postId;
        $value = get_field($field, $postId);
        // ACF maps authorized previews to the latest WordPress revision. Elementor
        // saves can create revisions with no ACF metadata. An absent value is not
        // the same as an editor explicitly storing an empty value in that revision.
        if (is_preview() && current_user_can('edit_post', $postId)) {
            $revisions = wp_get_post_revisions($postId, ['numberposts' => 1]);
            $revision = reset($revisions);
            if ($revision && !metadata_exists('post', $revision->ID, $field)
                && metadata_exists('post', $postId, $field)) {
                // These allow-listed fields are plain text; no ACF image/repeater
                // formatting or arbitrary post meta is read through this fallback.
                return get_post_meta($postId, $field, true);
            }
        }
        return $value;
    }
}
