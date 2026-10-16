<?php

namespace Superworld\Core\Elementor;

/** Adds the optional Elementor dynamic tag integration. */
final class Integration {
	/** Register only the documented public dynamic-tag hook. */
	public static function register(): void {
		add_action( 'elementor/dynamic_tags/register', [ self::class, 'register_dynamic_tag' ] );
	}

	/** Register the ACF hero title text tag when Elementor is available. */
	public static function register_dynamic_tag( $manager ): void {
		if ( ! class_exists( '\Elementor\Core\DynamicTags\Tag' ) || ! is_object( $manager ) || ! method_exists( $manager, 'register' ) ) {
			return;
		}

		require_once __DIR__ . '/DynamicTags/HeroTitleTag.php';
		$manager->register( new DynamicTags\HeroTitleTag() );
	}
}
