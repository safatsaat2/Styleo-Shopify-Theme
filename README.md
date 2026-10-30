# Lilac Shopify theme

Lilac is an Online Store 2.0 theme built for the Shopify Theme Store. Version 1.0.0.

This README is for developers. Merchants should read [docs/merchant-setup-guide.md](docs/merchant-setup-guide.md).

## Structure

| Folder | Contents |
|---|---|
| `assets/` | `base.css` and `components.css` (global), `section-*.css` (loaded by their sections), `theme.js` (core runtime), and feature scripts |
| `blocks/` | Theme blocks. Private blocks start with `_` |
| `config/` | `settings_schema.json`, plus `settings_data.json` with the Lilac, Ivory, and Dusk presets |
| `layout/` | `theme.liquid` and `password.liquid` |
| `listings/` | Home page templates for the Ivory and Dusk styles |
| `locales/` | `en.default.json` (storefront) and `en.default.schema.json` (editor) |
| `sections/` | Sections and the header, footer, and overlay section groups |
| `snippets/` | Shared partials. Each starts with a comment listing what it accepts |
| `templates/` | JSON templates (including the legacy `customers/*` pages) and `gift_card.liquid` |
| `docs/`, `tools/` | Documentation and build tools; excluded from uploads by `.shopifyignore` |

## Conventions

- Custom elements use the `lc-` prefix (`<lc-product>`, `<lc-cart-items>`). CSS variables use `--lc-`; theme block classes use `tb-`.
- Classes follow a light BEM form: `card`, `card__media`, `card--row`.
- Plain CSS and JavaScript, not minified, with no build step and no dependencies.
- Every storefront string is in `locales/en.default.json`. Every editor string is a `t:` key.
- Scripts load with `defer` and build on `window.Lilac` (see [docs/events.md](docs/events.md)).

## Tools

Run these from the theme folder. They need Node.js 18 or later.

| Command | What it does |
|---|---|
| `node tools/localize-schema.mjs` | Turns English strings in schemas into `t:` keys and adds them to `en.default.schema.json`. Run it after adding or changing a schema |
| `node tools/check-locales.mjs` | Checks that every translation key used in the theme exists |
| `node tools/add-locale-strings.mjs file.json` | Merges a JSON file of new storefront strings into `en.default.json` |
| `node tools/audit.mjs` | Accessibility and performance checks that Theme Check doesn't cover |
| `shopify theme check` | Shopify's linter. Must report no offenses |
| `shopify theme dev` | Local preview against a development store |

## Before release

1. Run all of the checks above.
2. Update `theme_version` in `config/settings_schema.json`, `CHANGELOG.md`, and `docs/release-notes.md`.
3. Make sure `theme_documentation_url` and `theme_support_url` point to live pages.
