<?php

namespace Superworld\Core\Elementor\DynamicTags;

use Elementor\Core\DynamicTags\Tag;

/** Exposes only the editorial ACF hero title as an Elementor text tag. */
final class HeroTitleTag extends Tag {
	public function get_name(): string {
		return 'superworld-hero-title';
	}

	public function get_title(): string {
		return esc_html__( 'Superworld Hero Title', 'superworld-core' );
	}

	public function get_group(): string {
		return 'site';
	}

	public function get_categories(): array {
		$category = class_exists( '\Elementor\Modules\DynamicTags\Module' )
			? \Elementor\Modules\DynamicTags\Module::TEXT_CATEGORY
			: 'text';

		return [ $category ];
	}

	public function render(): void {
		if ( ! function_exists( 'get_field' ) ) {
			return;
		}

		$value = \Superworld\Core\Services\EditorialValue::read( 'hero_title' );
		if ( is_string( $value ) && '' !== $value ) {
			echo esc_html( $value ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		}
	}
}
