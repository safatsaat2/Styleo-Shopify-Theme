# Phase 1: Analysis, design tokens, feature plan, file tree

Build mode: **THEME_STORE** (default; no mode was picked in the brief).
Design source: `Mihi-Styleo-main` (Next.js 16, Tailwind v4, Zustand, lucide icons). Industry: **fashion / apparel** (blazers, shirts, essentials, shoes, bags, accessories).
Structure reference: `horizon-main` (patterns only, no code copied).
Compliance: `Shopify-Theme-Store-Rules.pdf` (all 22 sections read).

This folder (`docs/`) is not part of the theme package. It goes in `.shopifyignore` so `shopify theme push` and the submission zip skip it.

---

## 1. Design tokens (taken from `globals.css`, components, and `public/design-reference.png`)

### 1.1 Colors and roles

| Token (source) | Hex | Role | Theme mapping |
|---|---|---|---|
| `--ink` | `#0f0f10` | Header and footer background, primary text, secondary button | Scheme "Noir" background / scheme "Cream" text |
| `--ink-soft` | `#1a1a1c` | Dropdown panels, hover on dark | Noir: raised surface |
| `--cream` | `#f3f0ea` | Page background | Scheme "Cream" background (default) |
| `--cream-dark` | `#e8e4db` | Image well behind product media, skeletons | All schemes: `--color-media-well` |
| `--stone` | `#6b6860` | Secondary text (4.9:1 on cream, passes AA) | Cream: muted text |
| `--lavender` | `#c8b6e2` | Primary button, announcement bar, feature dock, newsletter panel, focus ring, selection | Scheme "Lavender" background; accent on all schemes |
| `--lavender-deep` | `#b49fd4` | Primary button hover, filled heart/star | Accent hover |
| `--lavender-soft` | `#ddd0ef` | Soft tints | Scheme "Mist" background |
| `--lavender-muted` | `#a890c8` | Link hover on cream | **Fails contrast as text (about 2.4:1).** Use it for hover decoration only, such as an underline color. Text color stays ink. |
| `--hero-from / via / to` | `#1a1228 → #2a1f3d → #0d0b12` | Aubergine gradient on hero, promo banner, about hero | Scheme "Dusk": `color_background` gradient setting |
| `--white` | `#ffffff` | Cards, inputs, white button | Surface color per scheme |

Contrast checks to fix while porting:
- `text-white/45` copyright text on ink is about 4.5:1, right at the limit. Raise it to 55% opacity.
- Text set in `lavender-muted` on cream is about 2.4:1. Never use it for text.
- Ink on lavender is about 11:1, and lavender on ink about 10:1. Both pass.

**Color scheme plan** (`color_scheme_group`; every background gets a foreground, at least 4 colors per scheme):
1. **Cream** (default page): bg cream, text ink, muted stone, accent lavender, button lavender/ink, button 2 ink/white, surface white, border ink at 10%
2. **Noir** (header and footer): bg ink, text white, muted white at 65%, accent lavender, button lavender/ink
3. **Dusk** (hero and promo): bg gradient aubergine, text white, button lavender/ink
4. **Lavender** (announcement, feature dock, newsletter): bg lavender, text ink, muted ink at 65%, button ink/white
5. **Mist** (soft panels, About values band): bg `#ece5f5`, text ink
6. **Paper** (cards, drawers, dialogs): bg white, text ink

Dark mode: schemes are the main tool. An optional theme setting, "Follow device dark mode" (off by default), maps Cream to Noir and Paper to Ink-soft under `prefers-color-scheme: dark`.

### 1.2 Typography

| Role | Source font | Weights used | Shopify `font_picker` default | Substitution |
|---|---|---|---|---|
| Headings (display serif) | Cormorant Garamond | 400, 500, 600, 700 | `cormorant_garamond_n5` if the library has it | Fallback chain: Cormorant → EB Garamond → Playfair Display. **Verify in the editor in Phase 2.** |
| Body, UI, buttons, navigation | Outfit | 400, 500, 600 | `outfit_n4` if the library has it | Fallback: Jost (`jost_n4`), the closest geometric sans |

I could not confirm that either Google font is in Shopify's library. The font picker docs only describe the library as Monotype plus "a selection of Google fonts". In Phase 2 I will set the defaults, test them in the editor, and report any substitution.

Font settings (every one a `font_picker`, with bold, italic, and bold-italic loaded through `font_modify`): heading, body, subheading/eyebrow, button, and navigation, plus size and weight controls for each.

**Type scale** (fluid with `clamp()`, defaults match the source):

| Token | Mobile → desktop | Source usage |
|---|---|---|
| `--text-display` | 44px → 68px | Hero h1 (`2.75rem → 4.25rem`), leading 1.1, tracking -0.01em |
| `--text-h1` | 36px → 48px | Page titles (`text-4xl md:text-5xl`) |
| `--text-h2` | 30px → 44px | Section titles (`text-3xl md:text-4xl lg:2.75rem`) |
| `--text-h3` | 24px → 30px | Card and collection titles |
| `--text-h4` | 20px → 24px | Drawer titles, "Order summary" |
| `--text-h5` | 14px, 600, uppercase, tracking 0.08em | Footer column heads, detail heads |
| `--text-h6` | 12px, 600, uppercase, tracking 0.2em | Eyebrow ("Catalog", "Our story") |
| `--text-body-lg` | 16px → 18px | Hero and lead paragraphs |
| `--text-body` | 16px | |
| `--text-sm` | 14px | Most UI text |
| `--text-xs` | 12px | Meta, badges (10px in source; raised to 11px minimum) |

All six heading levels must look different. The rules require it, so h5 and h6 get distinct case and tracking.

### 1.3 Spacing, layout, breakpoints

- Container: max 1280px; gutter 20px, then 32px at ≥768px, then 40px at ≥1280px (`.container-styleo`). Settings: page width (1200, 1280, 1440, full) and gutter.
- Section vertical rhythm: 64 / 80 / 96px (`py-16 md:py-20 lg:py-24`). Each section gets top and bottom padding settings, defaulting to this rhythm.
- Spacing scale (4px base): 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96.
- Grid gaps: 16 / 20 / 24px. Product grid columns: 2 on mobile, 3 at md, 4 at lg (settings for desktop columns 2 to 6 and mobile columns 1 or 2).
- Breakpoints: 640 / 768 / 1024 / 1280 (Tailwind defaults). The theme uses 750 / 990 / 1280 media queries, plus container queries for cards.

### 1.4 Radius, shadows, borders

| Token | Value | Use |
|---|---|---|
| `--radius-pill` | 999px | All buttons, inputs, chips, quantity selector, badges |
| `--radius-sm` | 12px | Thumbnails, cart line images, menu items |
| `--radius-md` | 16px | Product cards, info panels |
| `--radius-lg` | 24px | Collection cards, FAQ shell, summary card |
| `--radius-xl` | 32px → 40px | Hero media, promo banner, newsletter panel |
| `--shadow-sm` | `0 1px 2px rgb(15 15 16 / .06)` | Primary button, inputs |
| `--shadow-md` | `0 6px 16px rgb(15 15 16 / .08)` | Card hover |
| `--shadow-glow` | `0 10px 30px rgb(200 182 226 / .30)` | Feature dock (lavender glow) |
| `--shadow-xl` | `0 20px 40px rgb(0 0 0 / .25)` | Dropdowns, header on scroll |
| `--shadow-drawer` | `0 25px 50px rgb(0 0 0 / .25)` | Drawers |
| Border | 1px, current text color at 8 to 15% opacity | Cards, inputs |

Settings: a radius scale (sharp, soft, round; default round), a shadow intensity (none, subtle, default), and border opacity.

### 1.5 Components

- **Buttons**: pill; heights 36 / 44 / 48–52px; padding-x 16 / 24 / 32–36; 14px, medium weight, tracking 0.02em; `active: scale(.98)`; focus ring 2px lavender with 2px offset. Variants: primary (lavender on ink), secondary (ink on white), outline (ink at 20%, fills on hover), ghost, white. Arrow icons nudge 2px right on hover.
- **Inputs**: height 44px, pill (search, newsletter, promo) or 12px radius (contact form), white fill, ink border at 15%, 2px lavender focus ring. The newsletter field is a white pill that holds a 44px ink circle submit button.
- **Product card, three variants** (a setting, plus a separate mobile setting):
  - *Portrait* (grid): 3:4 media, 16px radius, cream-dark well, image zooms to 1.05 over 700ms, sale pill top left, quick add slides up from 8px below on hover (always visible on touch), title then price and compare price.
  - *Row* (list): 96px thumbnail on the left, title, price, text-link quick add.
  - *Compact*: square media, centered small text. Used for the mobile best sellers row.
- **Collection card, two variants**: *Arch* (3:4, 24px radius, ink gradient at the bottom, serif title, white pill "Shop now") and *Orb* (circle with a 2px lavender ring at 40%; used on mobile).
- **Feature dock**: a lavender pill bar that overlaps the section above it by 32 to 48px. It holds 4 icon and text items, becomes a 2×2 rounded card on mobile, and carries the lavender glow shadow.
- **Section title**: serif h2 on the left, "View all →" link on the right, aligned on the baseline.
- **Drawers** (cart, menu): slide in from the right over 300ms ease-out, with an ink overlay at 50% and `backdrop-filter: blur(4px)`.
- **Quantity selector**: pill with − value + and 40px hit areas.
- **FAQ accordion**: white 24px shell with dividers; the chevron rotates; the panel opens with a `grid-template-rows` 0fr → 1fr transition.

### 1.6 Motion

| Name | Spec | Use |
|---|---|---|
| fade-up | 0.7s ease-out, translateY 18px → 0 | Hero copy, scroll-reveal (setting) |
| fade-in | 0.5s ease-out | Hero media |
| orbit | 20s linear infinite rotate | Circular text badge |
| media-zoom | scale 1.05 over 700ms | Card hover |
| drawer | 300ms ease-out translateX | Drawers |
| reveal | 300ms, translateY 8px with opacity | Quick add on hover |

Settings: "Animate sections on scroll" (on/off) and "Animation intensity" (subtle, default, expressive). All motion stops under `prefers-reduced-motion`. View transitions are opt-in where the browser supports them.

### 1.7 Signature art direction (the uniqueness layer)

The rules say color, gradient, or animation swaps on an existing base aren't unique enough. These motifs become **architectural systems** used across the theme, not one-off sections:
1. **Halo media**: a lavender orb or arch behind a cut-out or portrait subject (hero, promo banner, About). A shared `media-halo` snippet that hero, image-with-text, promo, and featured product sections can all use, with shape options orb, arch, and none.
2. **Orbit badge**: rotating circular text badge as a block. Its text comes from a setting (default: "New collection"), and it is static under reduced motion.
3. **Dock**: the overlapping pill bar pattern, reused for trust badges, the free shipping progress bar in the cart drawer, sticky add to cart, and the mobile filter and sort bar.
4. **Dual-mode cards**: desktop and mobile get separate card variants per section, as in the source (arches on desktop, orbs on mobile; carousel on desktop, row list on mobile). This is a per-section "Mobile layout" setting, which few themes offer.
5. **Dusk bands**: deep aubergine gradient schemes that frame commerce sections on a cream canvas.

---

## 2. Page and component inventory mapped to Shopify

### 2.1 Pages

| Next.js route | Shopify template | Notes |
|---|---|---|
| `/` | `templates/index.json` | Hero, feature dock, featured collection, new arrivals, promo banner, best sellers, newsletter |
| `/shop` (`?category`, `?tag`, `?sort`, price) | `collection.json`, `collection.editorial.json`, `list-collections.json` | Category and tag become collections; price chips become native price range and filters; sort becomes `collection.sort_options` |
| `/product/[slug]` | `product.json` plus alternates | Gallery, details, trust strip, details grid, related |
| `/cart` | `cart.json` | Order summary, promo code, shipping estimate |
| `/checkout`, `/order-confirmation` | none (Tier D) | Shopify Checkout. Drop the fake checkout form, card fields, and order number generator. |
| `/account` | `<shopify-account>` plus legacy `customers/*` | See section 3.2 |
| `/search` | `search.json` | Plus predictive search in the header |
| `/wishlist` | none in THEME_STORE | Wishlist is forbidden; an app block slot replaces it |
| `/about` | `page.about.json` | Dusk hero, image with text, values band |
| `/contact` | `page.contact.json` | `{% form 'contact' %}` |
| `/faq` | `page.faq.json` | Searchable accordion plus FAQPage JSON-LD |
| `/privacy`, `/terms`, `/shipping`, `/returns` | Shopify policy pages (`.shopify-policy__container`) plus `page.returns.json` | Policies link from the footer through `shop.policies` |
| `not-found.tsx` | `404.json` | |
| none | `password.json`, `gift_card.liquid`, `blog.json`, `article.json`, and the alternates listed in section 4 | Gaps, see section 3 |

### 2.2 Components to sections, blocks, and snippets

| Next.js component | Shopify artifact |
|---|---|
| `AnnouncementBar` | `sections/announcement-bar.liquid` (blocks: `_announcement`; rotation, dismiss, links) in the header group |
| `Header` (logo, catalog dropdown, links, search toggle, icons, Sign in pill) | `sections/header.liquid`; snippets `header-menu`, `mega-menu`, `header-actions`, `menu-drawer`; `<shopify-account>` replaces the Sign in pill and the user icon |
| `MobileMenu` | `snippets/menu-drawer.liquid` (multi-level with sliding panels, localization, account) |
| `CartDrawer` | `sections/cart-drawer.liquid` (rendered through the Section Rendering API) plus `snippets/cart-line-item.liquid` |
| `Footer` | `sections/footer.liquid` (blocks: brand text, menu, newsletter, social media icons, follow on Shop, payment icons, localization, custom liquid) in the footer group |
| `Hero` (plus `CircularBadge`) | `sections/hero.liquid` (blocks: heading, text, buttons, `orbit-badge`; media-halo) |
| `FeaturesBar` | `sections/feature-dock.liquid` (blocks: `_dock-item` with icon picker and text) |
| `FeaturedCollection` | `sections/featured-collections.liquid` (blocks: collection card; desktop and mobile layouts arch/orb) |
| `NewArrivals`, `BestSellers` | `sections/product-list.liquid` (collection picker, carousel or grid, mobile layout row/compact/carousel). The presets "New arrivals" and "Best sellers" come from the same section. |
| `PromoBanner` | `sections/promo-banner.liquid` (Dusk scheme, halo media, optional real-date countdown block) |
| `Newsletter` | `sections/newsletter.liquid` (`{% form 'customer' %}`, consent text) |
| `ProductGallery` | `blocks/_product-gallery.liquid` plus `snippets/product-media.liquid`, `zoom-dialog` |
| `ProductDetails` | Main product blocks: title, rating, price, description, variant picker, quantity, buy buttons, trust strip, and so on |
| `ProductFilters` | `snippets/facets.liquid`, `facet-drawer`, `sort-by`, `active-filters` |
| `ProductCard` (3 variants) | `snippets/product-card.liquid` (`card_style`: portrait, row, compact) |
| `SearchForm` | `snippets/search-form.liquid` plus `<predictive-search>` |
| `FAQ` | `sections/faq.liquid` (blocks: `_faq-item`; optional search field) |
| `QuantitySelector` | `snippets/quantity-input.liquid` |
| `Button`, `SectionTitle` | `snippets/button.liquid`, `snippets/section-heading.liquid` |
| `PolicyPage` | `.shopify-policy__container` styling plus `sections/main-page.liquid` |

### 2.3 Source behavior that must change for compliance

| Source behavior | Problem | Replacement |
|---|---|---|
| Wishlist hearts, `/wishlist`, Zustand wishlist store | Rules §8: wishlists are app-like | Removed. Product cards and the product page get an app block slot. |
| Hard-coded promo codes (`STYLEO10`…) | Fake client-side discounts | Native discount code field (cart `discount` parameter through the Cart Ajax API) plus `discount_allocations`. **Risk:** the PDF lists "cart-level discount codes" as an app-like example, but Shopify's own Horizon ships a native cart discount field using the platform API. I'll build it on the native API only and note it for review. |
| Mock rating 4.8 (124 reviews) | Fake data | Shows only when `product.metafields.reviews.rating` exists |
| Mock checkout and order number | Not possible in a theme | Shopify Checkout (Tier D) |
| Mock tax 8% and shipping rates | Fake | Only "Taxes and shipping calculated at checkout" or `cart.taxes_included`, plus the real `/cart/shipping_rates.json` estimator |
| "Free shipping over $150" hard-coded | Must be merchant data | Setting (threshold) converted per market by `cart.currency.iso_code` rate; the bar uses the real cart total |
| Unsplash URLs, `next/image` | External assets | `image_url` / `image_tag` with srcset; placeholder SVGs in presets |
| Fake newsletter success | No backend | `{% form 'customer' %}` with `form.posted_successfully?` |
| lucide-react icons | Library | Original inline SVG icon snippet (`snippets/icon.liquid`) drawn in a 1.5px stroke style to match |

---

## 3. Gaps: Shopify UI the Next.js site lacks, designed in the same language

| Gap | Design direction |
|---|---|
| Predictive search | Expands under the Noir header (as the source search row does) into a dark panel: query suggestions as lavender chips, products as compact cards, collections, pages, and articles. Merchant-set popular searches show as chips when the field is empty. Full-screen sheet on mobile. |
| Cart drawer (real) | Keeps the source structure: lavender-tint free shipping strip, line items with 12px thumbnails, white footer. Adds discount pills, selling plan name, unit price, a note toggle, upsell row, accelerated checkout buttons (colors untouched), and an `aria-live` status. |
| Mega menu | Full-width Noir panel: menu columns on the left, 1 or 2 featured image cards on the right (arch shape, serif titles). |
| Faceted filters | Desktop: sticky left sidebar with pill-shaped option chips (same style as the source category chips), swatch filters, price range with two inputs and a slider. Mobile: "Filter and sort" dock pill opens a bottom sheet. Active filters show as removable ink pills. |
| Customer accounts (legacy) | Cream pages, white 24px cards, serif h1. Order rows as cards; addresses as a two-column card grid. |
| Gift card page | Dusk band with a white card at center, the code in a monospace pill with a copy button, a QR code (at least 120×120px, on a white tile), and an Add to Apple Wallet badge. |
| Password page | Full-bleed Dusk gradient with the halo orb and the logo or `shop.name`, `shop.password_message`, a newsletter field, and a password field in a dialog. |
| 404 | Keeps the source layout (eyebrow "404", serif heading) and adds a search field plus a product list section below. |
| Blog and article | Editorial cards in arch-top 3:2 media, eyebrow tags, serif titles. Article: reading time, table of contents, a pull-quote style in lavender, comments in white cards. |
| Pickup availability, Shop Pay Installments, unit price, tax note | Small stone-colored text rows under price and buy buttons. Pickup uses a white card with a status dot and opens a drawer listing locations. |
| Quick view / quick add | Paper dialog (desktop: 2 columns, gallery and form; mobile: bottom sheet). |
| Sticky add to cart | A dock pill pinned to the bottom: thumbnail, title, price, variant summary, lavender button. |
| Empty and error states | Large stroke icon in ink at 20%, serif heading, one primary pill button (same pattern as the source empty cart). |
| Skeletons | Cream-dark blocks with a gentle shimmer (static under reduced motion). |

### 3.1 Feature tier plan (summary; the full matrix comes in Phase 12)

- **Tier A (built)**: header, mega, dropdown and drawer navigation; announcements; predictive search; cart drawer and page; facets, sorting, AJAX pagination, load more and infinite scroll; quick add and view; recommendations (related and complementary); gallery with zoom, video, and 3D; swatches; variant images; pickup; Shop Pay Installments; unit price; gift card recipient form; accelerated checkout; selling plan picker and cart display; volume pricing and quantity rules; recently viewed (localStorage plus Section Rendering); newsletter; popup (newsletter, promo, exit intent); countdown (merchant end date, hides once expired); localization selectors; JSON-LD; analytics events through `Shopify.analytics.publish`; Custom Liquid section and blocks; shipping estimator; delivery estimate (merchant min/max business days and cutoff, labeled as an estimate); gift wrap (merchant-chosen product); cart terms checkbox; delivery date attribute; bundles and frequently bought together (multi-add); social gallery (uploaded images only).
- **Tier B (needs admin setup)**: rating display (review app writes `reviews.*`), metafield filters (Search & Discovery), complementary products (Search & Discovery), selling plans (subscription app or native), markets and currencies, B2B catalogs and pricing, pre-order (inventory policy plus selling plan), coming soon (tag `coming-soon`), local delivery messaging.
- **Tier C (app slots and events only)**: wishlist, compare, reviews submission, loyalty, back-in-stock automation, chat, live Instagram and TikTok feeds, configurators, gift registry. Each gets `@app` blocks plus documented `theme:*` events.
- **Tier D (document only)**: checkout, payments, shipping zones, taxes, order management, email and SMS, redirects, sitemap, pixels.
- **Not built in THEME_STORE**: wishlist page, compare page, search history, voice search, GA4/GTM settings, `robots.txt.liquid`, custom metaobject settings.

### 3.2 Customer accounts: decision needed later (Phase 9)

Shopify deprecated legacy customer accounts in February 2026. They aren't available to new stores or to existing stores not already using them, and a final sunset date is still to be announced. Horizon no longer ships `templates/customers/*`.

**Recommendation:** build `<shopify-account>` in the desktop and mobile header (required) and style the hosted account pages through the account component and brand settings. Still ship lean legacy `customers/*` templates for stores that use them, styled from the shared card system with no extra JS. They will be marked deprecated in the docs and can be removed in a single release when Shopify sets the sunset date.

---

## 4. Theme name, planned file tree, metafields

### 4.1 Theme name

**Proposed: "Lilac"** (noun, 1 word, 5 characters). It points to the lavender palette without naming an industry, a Shopify product, or a company. Presets (one must carry the theme name):
- **Lilac** (default; Noir header, Dusk hero, cream canvas; matches the source)
- **Ivory** (light: cream header, Mist hero, ink accents)
- **Dusk** (dark: Noir canvas throughout, lavender accents)

Fallback names, if Lilac is taken in the Theme Store at submission: **Vesper**, **Arbor**, **Mantle**.

The store brand "STYLEO" stays demo-store content only (logo text, copy). It never appears in theme code or settings defaults.

### 4.2 File tree

```
assets/
  base.css                    reset, tokens, typography, RTE, utilities, forms, buttons
  components.css              cards, drawers, dialogs, accordions, badges, swatches
  section-*.css               per-feature CSS loaded by its section (header, product, facets, cart, blog, account, gift-card, password)
  theme.js                    core: event bus (theme:*), fetch helpers, section renderer, focus trap, dialog/drawer base, money format
  header.js                   sticky modes, mega and dropdown, menu drawer
  predictive-search.js
  cart.js                     cart drawer, cart page, line updates, discount codes, notes, attributes, terms
  product-form.js             add to cart, quantity rules, gift wrap, bundle and FBT multi-add, line item properties
  variant-picker.js           option to variant resolution, URL sync, media switch, price, SKU, inventory, pickup refresh
  media-gallery.js            slider, thumbnails, zoom dialog, video, 3D, 360 sequence
  facets.js                   AJAX filters, sort, pagination, load more, infinite scroll, density
  recommendations.js          related, complementary, recently viewed
  quick-view.js
  slideshow.js                hero slideshow, carousels (scroll-snap based)
  popup.js                    newsletter, promo, exit intent
  countdown.js
  localization.js
  shipping-estimator.js
  analytics.js                standard and custom events
  qr-code.js                  gift card QR (original small generator; or Shopify's hosted lib via asset_url)
  icon-*.svg                  only where an <img> is needed; most icons inline from snippets/icon.liquid
blocks/
  (theme blocks, public)  heading, text, button, image, video, icon, spacer, divider, group, custom-liquid,
                          orbit-badge, countdown, email-signup, social-links, payment-icons, follow-on-shop,
                          menu, accordion, collection-card, product-card, testimonial, logo, contact-form
  (product blocks)        product-title, product-vendor, product-price, product-rating, product-description,
                          variant-picker, quantity, buy-buttons, pickup-availability, installments, inventory-status,
                          sku, product-badges, collapsible-tab, size-guide, delivery-estimate, shipping-info,
                          care-instructions, specs-table, gift-wrap, line-item-property, complementary-products,
                          frequently-bought-together, bundle, notify-me, share, trust-strip, volume-pricing,
                          subscription-picker, quote-request-link
  (private _ blocks)      _announcement, _slide, _dock-item, _faq-item, _mega-column, _cart-*, _footer-column, _social-tile
config/
  settings_schema.json    theme_info, logo and favicon, colors (scheme group), typography, layout, buttons, inputs,
                          cards, badges, animation, cart, search, product, social media, popup, currency, custom CSS
  settings_data.json      Lilac (current) plus Ivory and Dusk presets
layout/
  theme.liquid, password.liquid
listings/
  ivory/templates/index.json (plus sections/header-group.json if needed)
  dusk/templates/index.json
locales/
  en.default.json, en.default.schema.json
sections/
  header-group.json, footer-group.json, overlay-group.json (cart drawer, popups, sticky elements)
  announcement-bar, header, footer, footer-bottom, cart-drawer, popup
  hero, slideshow, video-banner, feature-dock, promo-banner, image-with-text, rich-text, multicolumn,
  featured-collections, collection-list, product-list, featured-product, bento-grid, logo-list,
  testimonials, social-gallery, newsletter, countdown-banner, blog-posts, faq, contact-form,
  recently-viewed, product-recommendations, quick-order-list, custom-liquid, apps, divider
  main-product, main-collection, main-collection-banner, main-list-collections, main-search,
  main-cart, main-blog, main-article, main-page, main-404, main-password, predictive-search
  main-account, main-order, main-addresses, main-login, main-register, main-reset-password, main-activate-account
snippets/
  meta-tags, structured-data, stylesheets-vars (CSS custom properties from settings), font-faces, icon,
  button, section-heading, image, media-halo, product-card, collection-card, article-card, price,
  unit-price, badges, rating, swatch, quantity-input, product-media, zoom-dialog, facets, active-filters,
  sort-by, pagination, cart-line-item, cart-summary, free-shipping-bar, localization-form, social-icons,
  payment-icons, menu-drawer, mega-menu, search-form, predictive-search-results, skip-link,
  gift-card-recipient-form, line-item-properties, delivery-estimate, analytics-events, placeholder
templates/
  index, product, product.bundle, product.preorder, product.digital, product.gift-card, product.configurator,
  collection, collection.editorial, list-collections, cart, search, blog, blog.editorial, article, page,
  page.contact, page.about, page.faq, page.size-guide, page.order-tracking, page.returns,
  page.quote-request, page.wholesale, 404, password (all .json), gift_card.liquid
  customers/ account, activate_account, addresses, login, order, register, reset_password (.liquid; legacy)
```

Not shipped: `config/markets.json`, `templates/robots.txt.liquid`, Sass, minified files, `page.wishlist`, `page.compare`.

Conventions (original, not Horizon's): CSS classes in a light BEM form (`card`, `card__media`, `card--row`); custom elements prefixed `lc-` (`<lc-drawer>`, `<lc-cart>`, `<lc-variant-picker>`); CSS custom properties prefixed `--lc-`. No class names, file contents, or JS architecture are copied from Horizon.

### 4.3 Metafields and metaobjects the theme reads

Rule: in THEME_STORE mode, theme **settings** only reference standard metaobject definitions. Custom metafields are never hard-coded as required. Merchants connect them through **dynamic sources** on block settings, and the theme degrades gracefully when they are empty.

**Standard (read directly):**

| Key | Type | Purpose |
|---|---|---|
| `product.metafields.reviews.rating` | rating | Stars on cards and the product page; AggregateRating JSON-LD |
| `product.metafields.reviews.rating_count` | number_integer | Review count |
| `product.metafields.descriptors.subtitle` | single_line_text | Card and product subtitle |
| `product.metafields.descriptors.care_guide` | multi_line_text | Care instructions block default source |
| `product.metafields.shopify--discovery--product_recommendation.complementary_products` | list.product_reference | Through the Recommendations API (`intent=complementary`), set up in Search & Discovery |
| Category metafields `shopify.color-pattern`, `shopify.size`, etc. | metaobject (standard) | Swatches through `swatch.color` / `swatch.image`; filters |

**Optional custom (connected by the merchant through dynamic sources; definitions documented in the Merchant Setup Guide):**

| Suggested key | Type | Purpose | Block / setting it feeds |
|---|---|---|---|
| `custom.size_chart` | page_reference | Size guide content | Size guide block (`page` setting) |
| `custom.specifications` | rich_text_field | Specification table | Specs block (`richtext` setting) |
| `custom.fbt_products` | list.product_reference | Frequently bought together | FBT block (`product_list`) |
| `custom.bundle_products` | list.product_reference | Bundle contents | Bundle block (`product_list`) |
| `custom.spin_images` | list.file_reference | 360° image sequence | Gallery 360 setting |
| `custom.delivery_note` | single_line_text | Local delivery and shipping note | Shipping info block |
| `custom.preorder_note` | single_line_text | Pre-order ship date message | Pre-order block |
| `custom.badge_label` | single_line_text | Custom product badge | Badges block |
| `article.metafields.custom.products` | list.product_reference | Products embedded in articles | Article "Shop the story" block |
| `custom.author_bio` (article) | multi_line_text | Author bio | Article author block |

**Tag conventions (no setup beyond tagging):** `coming-soon`, `limited-edition`, `best-seller` (or a merchant-picked collection), `gift-wrap` (excluded from recommendations), `final-sale`. Badge tags and collections are set in Theme settings → Badges. "New" uses `published_at` within N days (setting).

**Metaobjects:** none custom in THEME_STORE mode. Testimonials, FAQs, and brands are section blocks.

---

## 5. Assumptions and open points

1. Build mode THEME_STORE, industry fashion; the brief left both unset. Switching to CLIENT_CUSTOM later adds wishlist, compare, search history, voice search, and GA4/GTM settings without breaking anything.
2. Font availability (Outfit, Cormorant Garamond) gets checked in Phase 2; substitutions will be reported.
3. Horizon is used for coverage and conventions only. All code is written from scratch.
4. The native cart discount code field is a review risk (see 2.3). It can ship behind a setting, off by default, if you prefer the safer route.
5. Legacy customer templates are included but marked deprecated (see 3.2).
6. Demo imagery isn't part of the theme. Presets use Shopify placeholder SVGs.
