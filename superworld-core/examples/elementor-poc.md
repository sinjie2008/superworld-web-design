# Elementor proof of concept

This fixture is for a disposable development WordPress site. Its product output is illustrative; it is not a production catalog or product data source.

## Native layout

Create a WordPress Page in the Elementor editor using native `e-flexbox`, `e-heading`, and `e-grid` elements. Fill its ACF Hero title, then bind the hero heading to the **Superworld Hero Title** dynamic tag. The shared hero fields are also available to `sw_news`, `sw_event`, and `sw_announcement` items; only `sw_event` receives the Event date field. Use ordinary Elementor text and image controls for the rest of the editable content.

The official Elementor v4.4.0 source snapshot documents the legacy **Shortcode** widget, not an `e-shortcode` atomic element. Confirm the installed editor exposes that widget before adding it. Place it in a compatible regular Elementor container if available. Shortcode-generated HTML is rendered output; its children are not claimed as editable Elementor elements.

## Fixture shortcodes

The plugin development fixture exposes:

```text
[superworld_editorial field="hero_title"]
[superworld_catalog]
[superworld_parts path="general/emc/ax-10"]
```

`superworld_editorial` reads the current editorial post's requested allow-listed field. `superworld_catalog` and `superworld_parts` provide representative markup/data for checking the plugin integration surface. Keep their use limited to the explicit development fixture mode; replace fixture data with the live same-origin API-backed components before production use.

## Acceptance check

1. Create a Page and editorial fixture content; confirm shared hero fields appear on all four types and the event date appears only for `sw_event`.
2. Bind an `e-heading` to **Superworld Hero Title** and confirm the frontend resolves the saved ACF title.
3. If the Shortcode widget is available, render the three shortcodes above and confirm the output is treated as shortcode HTML.
4. Record Elementor version, active Atomic features, ACF version, and editor/frontend results with the verification notes.

Executed in the disposable test installation: native Flexbox + Heading created/edited/saved through the GUI and verified after reload; a legacy Shortcode widget saved both editorial and parts shortcodes; standalone preview showed the ACF title and interactive mock-backed pagination (HTTP 200). The shared preview reader handles an absent ACF revision field while preserving an intentional empty value. This minimal layout is a test fixture, not a migrated Superworld page design.

MCP, actual user staging, native GUI dynamic-tag binding, ACF Pro and repeated editor-render stress remain outstanding. Follow [ELEMENTOR_COMPATIBILITY.md](../../docs/ELEMENTOR_COMPATIBILITY.md) and repository `docs/TESTING.md` for exact version-qualified outcomes.
