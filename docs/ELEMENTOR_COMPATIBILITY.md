# Elementor compatibility notes

The official Elementor repository snapshot reviewed is commit `a1680caf4bdeb38be6ecbb6736af0d2970d5b4ec`, version `4.4.0` (`elementor.php`). Published `developers.elementor.com` pages returned HTTP 403 in this environment, so API selection used the vendor's in-repository official documentation. Subsequent runtime checks used the installable official GitHub build `4.4.0-latest-1792145704` on disposable WordPress 7.1.3 / PHP 8.3.35 with ACF Free 6.8.10. This latest/nightly build is not a compatibility promise for every V4 release. See `docs/TESTING.md` for the final test record.

| Capability | Evidence in the v4.4.0 snapshot | Integration boundary |
|---|---|---|
| Atomic layout | `e-flexbox`, `e-grid`, and `e-heading` appear in `docs/atomic-builder/atomic-widgets/elements-catalog.md`. | Use these native elements for editable layout. Do not invent an `e-shortcode` type; it is absent from this catalog snapshot. |
| Shortcodes | Core retains the legacy `shortcode` widget in `includes/widgets/shortcode.php`; frontend rendering uses WordPress `do_shortcode()`. Its `shortcode` control opts into dynamic tags. | Confirm the installed editor exposes this widget before using it. Its rendered shortcode output is output content, not a promise that generated children become editable Elementor elements. |
| Dynamic tags | Official `docs/atomic-builder/dynamic-tags/{overview,extending}.md` describes registering legacy `Elementor\Core\DynamicTags\Tag` subclasses on `elementor/dynamic_tags/register`; the v4 bridge converts compatible text-category tags for atomic props. | The plugin registers one text tag for the ACF `hero_title`. Atomic editor availability still needs a live editor check. |
| WordPress editorial data | This plugin registers `sw_news`, `sw_event`, and `sw_announcement` with `show_in_rest`; ACF JSON is the only field schema source. | WordPress owns editorial storage and REST visibility. Elementor owns presentation; the plugin does not register a product post type or Atomic internals. |

## Manual proof recipe

Use a disposable WordPress site with the plugin, ACF Free, and the installed Elementor version enabled. The code supports a no-Elementor/no-ACF runtime; the optional editor proof requires the plugins.

1. Confirm installed Elementor version and active Atomic features in that site. Check that the standard **Shortcode** widget is available in the editor. The source snapshot contains that legacy widget, but the atomic element catalog does not list an `e-shortcode`.
2. Create a WordPress Page and fill Hero title, introduction, and image. Create a `sw_news` item with the same shared fields, then a `sw_event` item and confirm it also has the Event date field. Confirm `sw_announcement` has only shared hero fields. Verify the three editorial types are REST-enabled.
3. Build the editable hero and card layout with native `e-flexbox`, `e-heading`, and `e-grid` elements. Bind the heading to **Superworld Hero Title** and confirm the saved page preview displays the ACF value.
4. Where the editor exposes the Shortcode widget, place it in a compatible regular Elementor container and enter `[superworld_editorial field="hero_title"]`. The plugin's POC fixtures also define `[superworld_catalog]` and `[superworld_parts path="general/emc/ax-10"]`. If the installed editor supports a dynamic Shortcode control, verify that behavior separately before relying on it.
5. Verify shortcode output in the saved frontend and preview. Treat the output as rendered shortcode HTML: edit its contents through the shortcode/content source, not as generated Elementor children.

## Executed proof and limits

Through the visible Elementor GUI, a native Atomic Flexbox and Heading were created, the heading text was edited, and **Save Options → Save Draft** persisted them across a full editor reload. A real Shortcode widget was also inserted and saved with `[superworld_editorial field="hero_title"] [superworld_parts path="general/emc/ax-10" per_page="1"]`. The test post's ACF title was saved using the public ACF API. The saved editor and standalone Preview Changes rendered native content and fixture product content; preview pagination retrieved page two through WordPress REST with HTTP 200. No Elementor internal JavaScript API or undocumented post-meta write created the layout.

The first standalone preview exposed an ACF revision issue: Elementor revisions lacked ACF metadata even though the canonical post held the title. `Services/EditorialValue` now supplies saved plain hero text only when an authorized preview's latest revision **lacks** that metadata. Explicitly stored empty revision values still win. Real WordPress regression checks and browser preview verification pass after the correction. The same reader is shared by the optional PHP dynamic tag.

The native heading in this POC is editable static content; the ACF value is rendered through the separate shortcode. The dynamic tag's PHP registration/render is tested, but **native Atomic dynamic-tag binding in the GUI, ACF Pro, and repeated editor AJAX-render stress tests remain NOT TESTED**. Independent JS tests cover mount/unmount/replacement and multiple instances, which does not substitute for every editor lifecycle scenario.

The component's ordinary WordPress page passes 390/768/1440 viewport checks. Editor-specific responsive controls and all original page layouts are not certified. Google Fonts and Gravatar resources in the Elementor preview were blocked by the environment's network policy; product REST and plugin scripts worked and there were no JavaScript page exceptions. No branding/font decision was made.

**MCP operations and the user's own staging installation remain BLOCKED**: no callable Elementor MCP connection or staging address was supplied. When connected, use the official composition workflow: discover live widget schemas, read variables/classes, build native composition, save, then preview and inspect. Do not invent an `e-shortcode`, bypass permissions, or treat generated shortcode children as native editable elements.
