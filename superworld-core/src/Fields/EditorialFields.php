<?php

namespace Superworld\Core\Fields;

/** Loads version-controlled editorial field groups from the ACF JSON source. */
final class EditorialFields {
	private const JSON_DIRECTORY = __DIR__ . '/../../acf-json';

	/** Register ACF hooks without requiring ACF at plugin load time. */
	public static function register(): void {
		add_filter( 'acf/settings/load_json', [ self::class, 'append_json_directory' ] );
		add_action( 'acf/init', [ self::class, 'register_local_group' ], 20 );
	}

	/** Append this plugin's group directory while preserving other ACF load paths. */
	public static function append_json_directory( $paths ): array {
		$paths   = is_array( $paths ) ? $paths : [];
		$paths[] = self::JSON_DIRECTORY;

		return array_values( array_unique( $paths ) );
	}

	/** Register each JSON-defined group only when ACF has not already loaded it. */
	public static function register_local_group(): void {
		if ( ! function_exists( 'acf_add_local_field_group' ) ) {
			return;
		}

		$files = glob( self::JSON_DIRECTORY . '/*.json' );
		if ( ! is_array( $files ) ) {
			return;
		}

		foreach ( $files as $file ) {
			if ( ! is_readable( $file ) ) {
				continue;
			}

			$group = json_decode( file_get_contents( $file ), true );
			if ( ! is_array( $group ) || empty( $group['key'] ) || empty( $group['fields'] ) ) {
				continue;
			}

			if ( function_exists( 'acf_get_local_field_group' ) && acf_get_local_field_group( $group['key'] ) ) {
				continue;
			}

			acf_add_local_field_group( $group );
		}
	}
}
