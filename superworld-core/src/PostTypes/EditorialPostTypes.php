<?php

namespace Superworld\Core\PostTypes;

/** Registers the editorial content types owned by the plugin. */
final class EditorialPostTypes {
	/** Register the WordPress init callback. */
	public static function register(): void {
		add_action( 'init', [ self::class, 'register_types' ] );
	}

	/** Register news, events, and announcements. */
	public static function register_types(): void {
		$types = [
			'sw_news' => [
				'singular' => __( 'News item', 'superworld-core' ),
				'plural'   => __( 'News', 'superworld-core' ),
				'archive'  => 'news',
			],
			'sw_event' => [
				'singular' => __( 'Event', 'superworld-core' ),
				'plural'   => __( 'Events', 'superworld-core' ),
				'archive'  => 'events',
			],
			'sw_announcement' => [
				'singular' => __( 'Announcement', 'superworld-core' ),
				'plural'   => __( 'Announcements', 'superworld-core' ),
				'archive'  => 'announcements',
			],
		];

		foreach ( $types as $post_type => $type ) {
			$labels = [
				'name'                  => $type['plural'],
				'singular_name'         => $type['singular'],
				'add_new_item'          => sprintf( __( 'Add %s', 'superworld-core' ), $type['singular'] ),
				'edit_item'             => sprintf( __( 'Edit %s', 'superworld-core' ), $type['singular'] ),
				'new_item'              => sprintf( __( 'New %s', 'superworld-core' ), $type['singular'] ),
				'view_item'             => sprintf( __( 'View %s', 'superworld-core' ), $type['singular'] ),
				'search_items'          => sprintf( __( 'Search %s', 'superworld-core' ), $type['plural'] ),
				'not_found'             => sprintf( __( 'No %s found.', 'superworld-core' ), strtolower( $type['plural'] ) ),
				'not_found_in_trash'    => sprintf( __( 'No %s found in Trash.', 'superworld-core' ), strtolower( $type['plural'] ) ),
				'all_items'             => sprintf( __( 'All %s', 'superworld-core' ), $type['plural'] ),
				'menu_name'             => $type['plural'],
			];

			register_post_type(
				$post_type,
				[
					'labels'             => $labels,
					'public'             => true,
					'publicly_queryable' => true,
					'show_in_rest'       => true,
					'has_archive'        => $type['archive'],
					'rewrite'            => [ 'slug' => $type['archive'], 'with_front' => false ],
					'menu_position'      => 21,
					'menu_icon'          => 'dashicons-megaphone',
					'supports'           => [ 'title', 'editor', 'excerpt', 'thumbnail', 'author', 'revisions' ],
					'capability_type'    => 'post',
					'map_meta_cap'       => true,
				]
			);
		}
	}
}
