# Lilac 1.0.0 final QA

Build mode: THEME_STORE. Date: 2026-10-30.

**Automated checks (all passing):**

| Check | Command | Result |
|---|---|---|
| Shopify Theme Check | `shopify theme check` | 0 offenses |
| Translation keys | `node tools/check-locales.mjs` | All keys resolve |
| Rules evidence | `node tools/rules-check.mjs` | 40 of 40 pass |
| Accessibility and performance audit | `node tools/audit.mjs` | No findings |
| JavaScript syntax | `node --check assets/*.js` | All files parse |
| Settings text style | Script over `en.default.schema.json` (ampersands, questions, British spelling, banned terms, sentence case) | No findings |

**Not verified yet (needs a live store):** Lighthouse scores, browser and webview testing, the theme editor experience, and every storefront flow. See [Before submission](#4-before-submission).

---

## 1. Theme Store rules compliance

Status: **Done** means the requirement is met in code. **Manual** means it can only be verified on a store or outside the code.

### Exclusivity, uniqueness, design (rules sections 1 to 3)

| Requirement | Status | Where |
|---|---|---|
| No designer credits or affiliate links | Done | No external links in theme files; `theme_author` is the theme name |
| Original code, not derived from Dawn or Horizon | Done | All files written from scratch; Horizon used only as a structure reference |
| Architectural uniqueness | Done | Halo media (`snippets/media-halo.liquid`), orbit badge, feature dock, dual desktop and mobile card styles, Dusk bands, bento grid |
| Professional, consistent design; clear hierarchy; flexible layouts | Manual | Review in the demo store with real content |
| Settings organized, merchant-friendly | Done | `config/settings_schema.json` (14 groups with headers and info text) |

### Features (rules section 4)

| Requirement | Status | Where |
|---|---|---|
| Sections Everywhere | Done | All `templates/*.json` |
| Discounts in cart, checkout, order | Done | `snippets/cart-line-item.liquid`, `snippets/cart-discounts.liquid`, `snippets/cart-checkout.liquid`, `sections/main-order.liquid` |
| Accelerated checkout on product and cart, colors untouched | Done | `snippets/product-buy-buttons.liquid` (`payment_button`), `snippets/cart-checkout.liquid` (`content_for_additional_checkout_buttons`) |
| Faceted filtering on collection and search | Done | `snippets/facets.liquid`, `sections/main-collection.liquid`, `sections/main-search.liquid` |
| Gift card template | Done | `templates/gift_card.liquid` |
| Image focal points | Done | `snippets/image.liquid` |
| Social sharing image (`page_image`) | Done | `snippets/meta-tags.liquid` |
| Country and language selectors | Done | `snippets/localization-form.liquid` in header, footer, and menu drawer |
| Multi-level menus | Done | `snippets/header-menu.liquid`, `snippets/menu-drawer.liquid` |
| Newsletter forms | Done | `snippets/newsletter-form.liquid` |
| Pickup availability on product page | Done | `sections/pickup-availability.liquid`, Pickup block |
| Related product recommendations | Done | `sections/product-recommendations.liquid` |
| Complementary products | Done | Complementary block in `snippets/product-info-blocks.liquid` |
| Rich media in product, featured product, quick view | Done | `snippets/product-gallery.liquid` and `snippets/product-media.liquid` used by all three |
| Search template and predictive search | Done | `templates/search.json`, `sections/predictive-search.liquid` |
| Selling plans in cart | Done | `snippets/cart-line-item.liquid` (`selling_plan_allocation`) |
| Shop Pay Installments on product page | Done | `snippets/product-price-block.liquid` (`payment_terms`) |
| Unit pricing on collection, product, cart | Done | `snippets/price.liquid`, `snippets/cart-line-item.liquid` |
| Variant images | Done | `assets/product.js`, `assets/media-gallery.js` |
| Follow on Shop (`login_button`), colors untouched | Done | `sections/footer.liquid` |
| `<shopify-account>` in desktop and mobile header | Done | `sections/header.liquid` (one component shown at every width) |

### Templates, sections, blocks (rules section 5)

| Requirement | Status | Where |
|---|---|---|
| All required templates in the required formats | Done | `templates/` (checked by `tools/rules-check.mjs`) |
| Custom Liquid section with a `liquid` setting, on all templates | Done | `sections/custom-liquid.liquid` (no template restriction) |
| Header and footer in section groups | Done | `sections/header-group.json`, `sections/footer-group.json` |
| Main product elements as individual blocks | Done | `sections/main-product.liquid` (34 block types) |
| `@app` blocks in main and featured product | Done | `sections/main-product.liquid`, `sections/featured-product.liquid` |
| Custom Liquid blocks where app blocks go | Done | Product, cart, footer, hero, image with text, rich text, announcement, article; `blocks/custom-liquid.liquid` |
| No `config/markets.json` | Done | Not present |

### Lighthouse (rules section 6)

| Requirement | Status | Where |
|---|---|---|
| Performance 60+ average (home, collection, product; desktop and mobile) | Manual | Run on the benchmark store. Groundwork: deferred scripts, preloaded fonts and CSS, LCP images eager with high priority, lazy loading, per-section CSS |
| Accessibility 90+ average | Manual | Run on the benchmark store. Groundwork listed under section 12 below |

### Pages (rules section 7)

| Requirement | Status | Where |
|---|---|---|
| Payment icons via `enabled_payment_types` and `payment_type_svg_tag`, full color | Done | `snippets/payment-icons.liquid` |
| `<html lang="{{ request.locale.iso_code }}">` | Done | `layout/theme.liquid`, `layout/password.liquid`, `templates/gift_card.liquid` |
| `routes` for storefront URLs | Done | All links use `routes.*`; the only literal path is `/admin` on the password page (no route exists), with `rel="nofollow"` |
| `content_for_header` not modified or parsed | Done | Output once, unchanged |
| Product page: title, price, unit price, compare-at, description, options; all media viewable; variant images; taxes included; option pickers; quantity; add to cart; price and sold out updates; first available variant | Done | `sections/main-product.liquid`, `snippets/product-info-blocks.liquid`, `snippets/product-price-block.liquid`, `assets/product.js` |
| Product page: recommendations, rich media, accelerated checkout on by default, pickup, installments | Done | See section 4 rows above |
| Gift card recipient form (`form.email`, `form.name`, `form.message`, `send_on`) | Done | `snippets/gift-card-recipient.liquid` |
| Swatches with `swatch.color` and `swatch.image` | Done | `snippets/variant-picker.liquid` |
| Collection page: title, description, image; title links; price; media; unit price; varied ratios; sale badge; sorting; empty message; price range; pagination | Done | `sections/main-collection-banner.liquid`, `sections/main-collection.liquid`, `snippets/product-card.liquid`, `snippets/price.liquid` |
| Collection list: title, `featured_image`, pagination | Done | `sections/main-list-collections.liquid`, `snippets/collection-card.liquid` |
| Cart page: line title, unit price, image, final price, quantity, options; total; taxes included; checkout button submits the form; refreshes all lines; quantity change; empty message; notes; selling plans; automatic discounts; accelerated checkout on by default | Done | `sections/main-cart.liquid`, `snippets/cart-line-item.liquid`, `snippets/cart-checkout.liquid`, `assets/cart.js` |
| Page: title and content; contact alternate | Done | `sections/main-page.liquid`, `templates/page.contact.json` |
| Blog: title; article title links, image, `excerpt_or_content`; pagination | Done | `sections/main-blog.liquid`, `snippets/article-card.liquid` |
| Article: title, comments, `published_at`; paginated comments; works without moderation; messages | Done | `sections/main-article.liquid` |
| Search: no results message, `object_type`, pagination | Done | `sections/main-search.liquid` |
| 404: clear message, ways forward | Done | `sections/main-404.liquid` |
| Gift card: Apple Wallet, code, QR at least 120 x 120px, logo or `shop.name` | Done | `templates/gift_card.liquid` (QR at 160px) |
| Password: logo or `shop.name`, `shop.password_message`, password entry | Done | `sections/main-password.liquid` |

### Consistency and functionality (rules section 8)

| Requirement | Status | Where |
|---|---|---|
| Consistent RTE styling | Done | `.rte` in `assets/base.css`, used for descriptions, articles, pages, and blocks |
| Scripts hosted on Shopify | Done | All scripts from `asset_url` or `shopify_asset_url` (QR library) |
| No interference with the editor or admin | Done | Editor events only re-dispatched for components (`assets/theme.js`) |
| Shopify-domain links use `rel="nofollow"` | Done | No Shopify-domain links; `powered_by_link` is output unchanged |
| Protocol-relative asset URLs | Done | YouTube and Vimeo embeds use `//`; all other assets come from Shopify filters |
| Licenses for third-party plugins and images | Done | No third-party plugins or images; placeholders are `placeholder_svg_tag` |
| No app-dependent features | Done | Reviews, wishlists, and similar features are app slots only |
| No app-like features needing API access | Done | No wishlist, scheduling, or Instagram feed. The cart discount field uses Shopify's native Cart API `discount` parameter (no app or private API), as Shopify's own themes do |
| No fake urgency, stock, or viewer data | Done | Countdowns need a real end date and hide after it; low stock reads real inventory; no viewer counters |

### Browsers, assets, SEO, accessibility, social (rules sections 9 to 13)

| Requirement | Status | Where |
|---|---|---|
| Desktop, mobile, and webview browsers | Manual | Test on the listed browsers; code uses only widely supported features with fallbacks (`:has()` used only for progressive styling) |
| No Sass; no minified files | Done | Plain `.css` and `.js` only |
| SEO metadata (title, description, canonical) | Done | `snippets/meta-tags.liquid` |
| Rich product snippets | Done | `snippets/product-structured-data.liquid` |
| No `robots.txt.liquid` | Done | Not present |
| Keyboard access, including dropdowns | Done | `lc-disclosure` menus, dialogs with focus trap (`assets/theme.js`, `assets/header.js`) |
| Visible focus | Done | `:focus-visible` rings in `assets/base.css`; forced colors support in `assets/components.css` |
| Alt attributes on all images | Done | `image_tag` with `alt` everywhere; decorative images use empty alt |
| Unique input IDs with matching labels | Done | IDs include section or block ids |
| Valid HTML | Done | Theme Check clean; nested `main` and unclosed elements fixed during the build |
| Contrast 4.5:1 and 3:1 | Done | Muted colors set at AA in default schemes; accent text uses `--lc-accent-text` (darkened on light schemes) |
| Focus order matches DOM order | Done | No positive `tabindex` (checked by `tools/audit.mjs`) |
| Touch targets at least 24 x 24px | Done | Icon buttons 44 x 44px; inputs and buttons 44px tall by default |
| h1 to h6 visually distinct | Done | `assets/base.css` (size, case, and tracking per level) |
| Social media icons | Done | `snippets/social-icons.liquid` |
| Open Graph and Twitter tags | Done | `snippets/meta-tags.liquid` |
| Social placeholders empty | Done | Social link settings have no placeholder or default |

### Settings, fonts, colors, images (rules sections 14 to 17)

| Requirement | Status | Where |
|---|---|---|
| Text style and terminology | Done | Scripted check over every editor string (no ampersands, questions, British spellings, or banned terms) |
| Instructional defaults, no Lorem Ipsum | Done | Defaults explain what to write |
| Favicon setting; logo works at any aspect ratio | Done | `config/settings_schema.json`, `snippets/logo.liquid` |
| Every setting has a label | Done | Theme Check |
| Header and footer `link_list` defaults are `main-menu` or `footer` | Done | Fixed in this phase: the account menu setting (default `customer-account-main-menu`) was removed; the account component uses Shopify's standard menu |
| Resource defaults exist in every store | Done | No resource setting has a default |
| Standard metaobject definitions only | Done | No metaobject settings |
| `theme_info` | Done | `config/settings_schema.json` |
| Editor changes show in the preview | Done | `shopify:section:*` and `shopify:block:*` handlers in `assets/theme.js` and components |
| Font pickers with defaults, bold and italic via `font_modify` | Done | `config/settings_schema.json`, `snippets/theme-styles.liquid` |
| At least 4 colors; every background has a foreground; `color` type | Done | `color_scheme_group` with 6 schemes |
| Responsive images; load as needed | Done | `snippets/image.liquid` with `widths` and `sizes`; lazy below the fold |
| Section and preset names follow the guidelines; placeholders in presets | Done | Presets use `placeholder_svg_tag` |

### Pre-launch (rules sections 18 to 22)

| Requirement | Status | Where |
|---|---|---|
| Theme and preset names: 1 to 2 words, under 30 characters, nouns; one preset named after the theme | Done | Lilac (theme and preset), Ivory, Dusk |
| Names distinct from existing Theme Store themes | Manual | Search the Theme Store and other platforms for Lilac, Ivory, and Dusk before submitting |
| `/listings` folder for each extra preset | Done | `listings/ivory/templates/index.json`, `listings/dusk/templates/index.json` |
| Preset install state matches its demo | Manual | Build each demo store from its preset |
| Version number and release notes | Done | `theme_version` 1.0.0, `docs/release-notes.md`, `CHANGELOG.md` |
| Demo store per preset (Bogus Gateway or test mode, real content, no apps) | Manual | Partner task |
| Documentation and public support contact form | Manual | Content is ready (`docs/merchant-setup-guide.md`, `docs/documentation-outline.md`); publish it and **replace the `example.com` URLs in `theme_info`** |
| Support within two business days | Manual | Partner process |

---

## 2. Feature Coverage Matrix

The spec's catalog has 22 numbered groups. Groups 23 and 24 cover its required pages and extensibility layer, which make 24.

Status key: **Built** (in the theme) · **Built, needs setup** (theme UI reads admin data) · **App slot** (app block, Custom Liquid, and events) · **Admin only** (Shopify controls it; documented) · **Not built** (not allowed in THEME_STORE mode, or not possible).

### 1. Home page and website design

| Feature | Status | File or setting |
|---|---|---|
| JSON template home page, drag and drop | Built | `templates/index.json` |
| Header layouts (logo left or center, menu below, mega) | Built | Header > Layout |
| Sticky header (always, on scroll up, off) | Built | Header > Sticky header |
| Transparent header over first section | Built | Header > Transparent on home page |
| Announcement bar (rotating, dismissible) | Built | `sections/announcement-bar.liquid` |
| Mega menu with images and columns | Built | Header > Mega menu promotion blocks |
| Dropdown multi-level navigation; mobile drawer | Built | `snippets/header-menu.liquid`, `snippets/menu-drawer.liquid` |
| Predictive search bar | Built | `sections/predictive-search.liquid` |
| Hero, slideshow, video banner (self-hosted or YouTube and Vimeo, poster, reduced motion) | Built | `sections/hero.liquid`, `slideshow.liquid`, `video-banner.liquid` |
| Promotional banners | Built | `sections/promo-banner.liquid` |
| Featured products and collections | Built | `featured-product.liquid`, `featured-collections.liquid`, `product-list.liquid` |
| Best sellers, new arrivals, trending (collection per section) | Built | Product list presets |
| Recently viewed | Built | `sections/recently-viewed.liquid` |
| Recommended products | Built | `sections/product-recommendations.liquid` |
| Featured brands, logo list | Built | `sections/logo-list.liquid` |
| Category grids and bento grids | Built | `collage.liquid`, `bento-grid.liquid` |
| Collection carousels and product sliders | Built | Featured collections and product list carousel layouts |
| Testimonials | Built | `sections/testimonials.liquid`, testimonial block |
| Trust badges | Built | Feature dock, Trust block, Trust strip preset |
| Full-color payment icons | Built | `snippets/payment-icons.liquid` |
| Social icons | Built | `snippets/social-icons.liquid` |
| Newsletter signup | Built | `sections/newsletter.liquid` |
| Popup (newsletter, promo, exit intent; accessible, frequency limit, lazy loaded) | Built | `sections/popup.liquid`, `assets/popup.js` |
| Countdown (real end date only) | Built | `snippets/countdown.liquid` |
| Back to top | Built | Theme settings > Layout |
| Blog section | Built | `sections/blog-posts.liquid` |
| Custom sections; Custom Liquid section and block | Built | `sections/section.liquid`, `custom-liquid.liquid`, `blocks/custom-liquid.liquid` |
| Several home page looks | Built | Presets Lilac, Ivory, Dusk plus `/listings` |
| Live Instagram and TikTok feeds | App slot | Social gallery (uploaded images) plus app block |

### 2. Products and product pages

| Feature | Status | File or setting |
|---|---|---|
| Gallery, zoom (hover and fullscreen), video, 3D, AR | Built | `snippets/product-gallery.liquid`, `assets/media-gallery.js` |
| Variant images, swatches (color and image), size buttons | Built | `snippets/variant-picker.liquid` |
| Variant price, SKU, barcode, inventory | Built | Price, SKU, Inventory blocks |
| Rich-text description; specifications table | Built | Description, Specifications blocks |
| Availability and real low stock | Built | `snippets/inventory-status.liquid` |
| Badges (sale, new, best seller, limited, sold out) | Built | `snippets/badges.liquid`, Theme settings > Badges |
| Frequently bought together (multi-add) | Built | FBT block |
| Related and complementary recommendations | Built | Recommendations section, Complementary block |
| Cross-sell and upsell | Built | Complementary, FBT, Cart suggestions |
| Tabs and accordions; size guide; care; shipping info | Built | Collapsible tab, Size guide, Care, Shipping info blocks |
| Delivery estimate (labeled estimate) | Built | Delivery estimate block, Theme settings > Product pages |
| Page layouts (stacked, grid, thumbnails left or below, carousel) | Built | Product information > Gallery layout |
| Sticky add to cart; quick add; quick view | Built | `sections/main-product.liquid`, `sections/quick-view.liquid` |
| Gift card recipient form | Built | `snippets/gift-card-recipient.liquid` |
| Pickup; Shop Pay Installments; tax note | Built | Pickup block, price block |
| Volume pricing and quantity rules | Built, needs setup | Quantity rules block (B2B catalogs) |
| Pre-order | Built, needs setup | Button switch on `continue` policy; `product.preorder` |
| Coming soon | Built, needs setup | Tag set in Theme settings > Product pages |
| Subscriptions | Built, needs setup | Purchase options block (selling plans) |
| Digital products | Built | `product.digital`, Digital note block |
| Personalization and custom fields (conditional) | Built | Custom field block |
| Gift wrapping | Built, needs setup | Gift wrap block, Theme settings > Cart |
| Bundles | Built, needs setup | `product.bundle`, FBT with product list metafield |
| 360-degree view | Built, needs setup | Image sequence marked through alt text, documented in the gallery setting |
| Event tickets and bookings | Built | `templates/product.event.json` (added in this phase) |
| Back-in-stock request | Built | Notify me block (contact form) |
| Promotion messages by product tag (Buy X Get Y) | Built | Conditional message block (added in this phase) |
| Product comparison | Not built | CLIENT_CUSTOM only |
| Back-in-stock automation, waitlists, configurators, gift registry | App slot | Product information > Apps |

### 3. Collection pages

| Feature | Status | File or setting |
|---|---|---|
| Banners and descriptions | Built | `sections/main-collection-banner.liquid` |
| Subcategory navigation (menus, collection chips) | Built | Collection banner link chips, nested menus |
| Grid and list views, density toggle | Built | Product grid > Show density toggle |
| Native filters (price, availability, vendor, type, options) | Built, needs setup | Search & Discovery |
| Metafield filters | Built, needs setup | Search & Discovery |
| Sorting | Built | `snippets/results-toolbar.liquid` |
| AJAX filtering and pagination | Built | `assets/facets.js` |
| Infinite scroll, load more, pagination fallback | Built | Product grid > Pagination |
| Product count, active filter pills, clear all, mobile drawer | Built | `snippets/active-filters.liquid`, `snippets/facets-drawer.liquid` |
| Editorial layout; promo tiles in grid | Built | `collection.editorial`, Promotion block |
| Empty collection message; unit price; price range | Built | `sections/main-collection.liquid`, `snippets/price.liquid` |

### 4. Search

| Feature | Status | File or setting |
|---|---|---|
| Predictive search (products, collections, pages, articles, queries) | Built | `sections/predictive-search.liquid` |
| Popular searches | Built | Theme settings > Search |
| No-results recommendations | Built | `sections/main-search.liquid` |
| Results with filters, sorting, type tabs, pagination | Built | `sections/main-search.liquid` |
| Search by name, SKU, vendor, type, tags, description | Admin only | Native Shopify search |
| Typo tolerance, synonyms, boosts | Built, needs setup | Search & Discovery |
| Voice search, search history | Not built | CLIENT_CUSTOM only |
| Visual and AI search | App slot | Apps section, app embeds |

### 5. Cart

| Feature | Status | File or setting |
|---|---|---|
| AJAX add; drawer and page (cart type) | Built | `sections/cart-drawer.liquid`, `sections/main-cart.liquid` |
| Quantity update and remove; notes | Built | `assets/cart.js` |
| Gift messages | Built | Gift wrap message (cart options) |
| Discount codes and automatic discounts | Built | `snippets/cart-discounts.liquid` |
| Free shipping progress (converted per currency) | Built | `snippets/cart-free-shipping.liquid` |
| Upsells and recommendations | Built | `sections/cart-upsell.liquid` |
| Shipping estimator | Built | `snippets/shipping-estimator.liquid` |
| Taxes note; gift cards; selling plans; unit price | Built | `snippets/cart-checkout.liquid`, `snippets/cart-line-item.liquid` |
| Accelerated checkout | Built | `snippets/cart-checkout.liquid` |
| Terms checkbox | Built | Theme settings > Cart |
| Delivery date and time slots | Built | Theme settings > Cart (time slots added in this phase) |
| Minimum order message | Built | Theme settings > Cart (soft check) |
| Save for later | Not built | CLIENT_CUSTOM only |
| Persistent cart, recovery, reminders, true min and max enforcement | Admin only | Shopify cart, Shopify Email, checkout rules |

### 6. Checkout

| Feature | Status | File or setting |
|---|---|---|
| Express checkout on product and cart | Built | Buy buttons, cart checkout |
| Pre-checkout terms and delivery date | Built | Cart options |
| Age verification (soft gate) | Built | `sections/age-verification.liquid` (added in this phase; labeled not legal-grade) |
| Checkout button submits the cart form | Built | `snippets/cart-checkout.liquid` |
| One-page and guest checkout, autocomplete, shipping methods, taxes, fraud, validation, confirmation, customization | Admin only | Shopify Checkout |

### 7. Customer accounts

| Feature | Status | File or setting |
|---|---|---|
| `<shopify-account>` in header | Built | `sections/header.liquid` |
| Legacy login, register, reset, activate, account, addresses (country and province), orders, order detail with tracking | Built | `sections/main-*.liquid`, `templates/customers/*.json` |
| Reorder | Built | Buy again on `sections/main-order.liquid` (added in this phase) |
| Recently viewed | Built | `sections/recently-viewed.liquid` |
| Downloadable purchase links | Not built | Not exposed to themes in legacy accounts; digital apps send links |
| Social login, verification, new accounts UI, profile picture, subscriptions portal, returns, store credit | Admin only | Shopify customer accounts |
| Account deletion request | Built | Contact page, documented in the guide |
| Loyalty, rewards, referrals | App slot | Customer account > Apps |
| Guest wishlist | Not built | CLIENT_CUSTOM only |

### 8. Payment

| Feature | Status | File or setting |
|---|---|---|
| Full-color payment icons | Built | `snippets/payment-icons.liquid` |
| Accelerated checkout (colors untouched) | Built | Buy buttons, cart |
| Shop Pay Installments | Built | Price block |
| Gift card messaging | Built | Gift card template, cart |
| Currency selector and money formatting | Built | Localization form, Theme settings > Currency format |
| Gateways, COD, bank transfer, BNPL, refunds | Admin only | Settings > Payments |

### 9. Shipping and delivery

| Feature | Status | File or setting |
|---|---|---|
| Delivery estimates; shipping info and policy link | Built | Delivery estimate, Shipping info blocks |
| Shipping estimator; pickup; free shipping bar | Built | Cart, Pickup block |
| Local delivery messaging | Built, needs setup | Shipping info block with `custom.delivery_note` |
| Tracking in order template | Built | `sections/main-order.liquid` |
| Zones, rates, carriers, labels, notifications | Admin only | Settings > Shipping and delivery |

### 10. Order management

| Feature | Status | File or setting |
|---|---|---|
| Order detail page | Built | `sections/main-order.liquid` |
| Order tracking page | Built | `templates/page.order-tracking.json` |
| Returns page and form | Built | `templates/page.returns.json` |
| Fulfillment, refunds, exchanges, invoices, tagging, exports | Admin only | Shopify admin, Shopify Flow |

### 11. Discounts and promotions

| Feature | Status | File or setting |
|---|---|---|
| Line and order discounts, allocations, compare-at, savings | Built | Cart, price snippet |
| Automatic discounts; code field | Built | `snippets/cart-discounts.liquid` |
| Volume pricing display | Built, needs setup | Quantity rules block |
| Buy X Get Y messaging by tag | Built | Conditional message block (added in this phase) |
| Promo banners and announcements | Built | Promotion banner, announcement bar |
| Flash sale with real countdown | Built | Countdown section and blocks |
| Creating discounts and rules | Admin only | Shopify admin > Discounts |

### 12. Wishlist and compare

| Feature | Status | File or setting |
|---|---|---|
| Wishlist, compare, share | Not built | Not allowed in THEME_STORE mode |
| Wishlist and compare apps | App slot | Product information > Apps, Customer account > Apps |

### 13. Reviews and ratings

| Feature | Status | File or setting |
|---|---|---|
| Stars on cards and product pages | Built, needs setup | `snippets/rating.liquid` (`reviews.rating`) |
| AggregateRating in JSON-LD when data exists | Built, needs setup | `snippets/product-structured-data.liquid` |
| Rating filter and sort | Built, needs setup | Search & Discovery |
| Testimonials; FAQ accordions | Built | Testimonials section, FAQ section |
| Written, photo, video reviews; moderation; requests | App slot | Product information > Apps |

### 14. Marketing and engagement

| Feature | Status | File or setting |
|---|---|---|
| Newsletter with marketing consent | Built | `{% form 'customer' %}` in `snippets/newsletter-form.liquid` |
| Popups and exit intent | Built | `sections/popup.liquid` |
| Quote, wholesale, and lead forms | Built | `sections/contact-form.liquid`, page templates |
| WhatsApp button; social links; share buttons | Built | Theme settings > Social media, Share block |
| Consent awareness (customer privacy API) | Built | `Lilac.privacy` in `assets/theme.js` (added in this phase) |
| Email, SMS, push, automations, segments, affiliates, loyalty | Admin only / App slot | Shopify Email and Messaging; app embeds |

### 15. SEO

| Feature | Status | File or setting |
|---|---|---|
| Meta title, description, canonical, Open Graph, Twitter | Built | `snippets/meta-tags.liquid` |
| JSON-LD: Product, AggregateRating, BreadcrumbList, Organization, WebSite, Article, FAQPage | Built | `product-structured-data`, `breadcrumbs`, `header`, `main-article`, `faq` |
| Breadcrumbs; alt text; responsive lazy images; internal linking; 404 | Built | Breadcrumbs snippet, image snippet, menu and collection blocks |
| noindex for search, tag, and filtered pages | Built | `snippets/meta-tags.liquid` |
| hreflang | Admin only | Shopify outputs it through `content_for_header` |
| Redirects, sitemap, robots.txt | Admin only | Shopify admin; no `robots.txt.liquid` |

### 16. Blog and content

| Feature | Status | File or setting |
|---|---|---|
| Blog index with tag filter; article pages | Built | `main-blog.liquid`, `main-article.liquid` |
| Featured image, author and bio, related posts, tags | Built | Article blocks |
| Article search | Built | Search type tabs |
| Pagination; share (links and Web Share API); reading time; table of contents | Built | `snippets/share-buttons.liquid`, `assets/content.js` |
| Comments with moderation messages | Built | `sections/main-article.liquid` |
| RTE styling; video embeds; products in articles | Built | `.rte`, Shop the story block |
| Author profile pages | Not built | CLIENT_CUSTOM only (needs a custom metaobject) |

### 17. International

| Feature | Status | File or setting |
|---|---|---|
| Language and country or currency selectors | Built | `snippets/localization-form.liquid` |
| Locale files; regional prices; currency format | Built, needs setup | `locales/`, Markets |
| Tax and duties notices | Built | Price block, cart checkout |
| Address formats with country and province | Built | `snippets/address-fields.liquid`, `assets/customer.js` |
| Country-specific messages | Built | Conditional message block > Country codes (added in this phase) |
| Tax rules, VAT, duties, local payments; geolocation | Admin only | Settings > Markets, Shopify Geolocation app |

### 18. Mobile and UX

| Feature | Status | File or setting |
|---|---|---|
| Responsive, touch-friendly layouts | Built | All CSS; 44px controls |
| Mobile navigation, search, cart, filters | Built | Menu drawer, search panel, cart drawer, filter drawer |
| Sticky add to cart; quick add; quick view | Built | Product information settings |
| Lazy loading; skeleton loaders | Built | `snippets/image.liquid`, shimmer in `assets/components.css` |
| Animations with reduced motion | Built | `assets/base.css` reduced motion rule |
| View transitions | Built | Theme settings > Layout > Page transitions |
| Keyboard and screen reader support | Built | Dialogs, menus, live region |
| High contrast | Built | Forced colors rules (added in this phase) |
| Dark mode | Built | Theme settings > Colors > Follow device dark mode |
| theme-color and apple-touch-icon | Built | `snippets/head-assets.liquid` |
| PWA and service worker | Not built | Not possible in a theme |

### 19. Analytics

| Feature | Status | File or setting |
|---|---|---|
| Standard storefront events | Admin only | Shopify publishes them itself; the theme doesn't duplicate them |
| Custom events through `Shopify.analytics.publish` | Built | `lilac_*` events in `assets/theme.js` (wired in Phase 11) |
| GA4 and GTM settings | Not built | CLIENT_CUSTOM only |
| Pixels, reports, ads tracking | Admin only | Settings > Customer events |

### 20. Advanced features

| Feature | Status | File or setting |
|---|---|---|
| B2B pricing, quantity rules, volume pricing, catalogs | Built, needs setup | Quantity rules block, account company details |
| Quick order list | Built | `sections/quick-order-list.liquid`, Quick order block |
| Quote and request-a-price forms | Built | `page.quote-request`, Quote block |
| Browse-based recommendations | Built | Recently viewed, Recommendations API |
| Subscriptions display | Built, needs setup | Purchase options block, cart |
| Membership and tier messages by customer tag | Built | Conditional message block > Customer tag (added in this phase) |
| Digital products; event tickets; booking inquiry; waitlist form | Built | `product.digital`, `product.event`, Quote block, Notify me |
| Custom product builder (line item properties) | Built | `product.configurator`, Custom field blocks |
| AI assistant, chatbot, visual search, dynamic pricing, loyalty, referrals, marketplace, scheduling, registry, restock automation | App slot | App embeds, Apps section, app blocks |

### 21. Security and performance

| Feature | Status | File or setting |
|---|---|---|
| Valid HTML; `{% form %}` with errors and success messages | Built | All forms |
| Shopify spam protection | Built | Native through `{% form %}` |
| Customer privacy API | Built | `Lilac.privacy` |
| No secrets; plain CSS and JS; per-section assets | Built | `assets/section-*.css`, feature scripts loaded by sections |
| Core Web Vitals groundwork | Built | Eager LCP images, explicit sizes, deferred scripts |
| Error handling (cart errors, network, empty states) | Built | `theme:cart:error`, empty states |
| HTTPS, PCI, fraud, authentication, data requests | Admin only | Shopify platform |

### 22. Shopify theme features

| Feature | Status | File or setting |
|---|---|---|
| JSON templates, sections, theme blocks, nested blocks, snippets, section groups | Built | `templates/`, `sections/`, `blocks/`, `snippets/` |
| Theme, section, block settings; dynamic sources | Built | All schemas |
| Standard metafields and metaobjects only | Built | `reviews.*`, `descriptors.*`, category metafields |
| Cart, Predictive Search, Section Rendering, Recommendations APIs | Built | `assets/theme.js`, feature scripts |
| Localization and Markets; customer accounts | Built | Localization form, account component |
| App blocks and app embed compatibility | Built | `@app` in key sections |
| Native filters and sorting | Built | Facets |
| Payment icons; accelerated checkout | Built | See above |
| Editor compatibility (`request.design_mode`, section and block events) | Built | `assets/theme.js`, components |
| Shopify CLI compatible; Theme Check clean | Built | 0 offenses |

### 23. Required pages and templates

| Page | Status | Template |
|---|---|---|
| Home, product (and 7 alternates), collection (and editorial), collection list, search, cart | Built | `index`, `product.*`, `collection.*`, `list-collections`, `search`, `cart` |
| Blog (and editorial), article | Built | `blog.*`, `article` |
| About, contact, FAQ, size guide, order tracking, returns, quote request, wholesale, quick order | Built | `page.*` |
| Legacy customer pages (7) | Built | `customers/*` |
| 404, password, gift card | Built | `404`, `password`, `gift_card.liquid` |
| Policies (styled) | Built | `.shopify-policy__container` in `assets/base.css`; footer links |
| Wishlist, compare | Not built | CLIENT_CUSTOM only |

### 24. Extensibility layer

| Feature | Status | File or setting |
|---|---|---|
| App block and Custom Liquid in key sections and product, cart, account areas | Built | Product, featured product, cart, cart drawer, footer, header, account, order, article, testimonials, social gallery, contact form, custom section |
| Documented events (`theme:cart:updated`, `theme:variant:changed`, `theme:quickview:opened`, `theme:filters:updated`, `theme:search:opened`, and more) | Built | `docs/events.md` |
| `window.Lilac` API | Built | `assets/theme.js` |
| Metafields and metaobjects documented | Built | `docs/merchant-setup-guide.md` section 7.7 |

---

## 3. Needs admin setup, an app, or isn't possible

| Item | Needs | Reason |
|---|---|---|
| Filters (including metafield and rating filters) | Search & Discovery app (free, Shopify) | Filters are configured outside the theme |
| Synonyms, boosts, complementary products | Search & Discovery app | Configured in the app |
| Star ratings and rating data | A reviews app writing `reviews.rating` | Themes can't collect reviews |
| Subscriptions and pre-order plans | Shopify Subscriptions or another app | Selling plans are created by apps |
| B2B prices, quantity rules, volume pricing | Shopify B2B (plan-dependent) | Catalogs are configured in admin |
| Markets, currencies, languages | Settings > Markets and Languages; Translate & Adapt | Admin configuration |
| Pickup availability | Local pickup on a location | Admin configuration |
| Free shipping rate | Settings > Shipping and delivery | The bar shows progress only |
| Gift wrap | A merchant-created product | The theme adds the chosen product |
| Coming soon, best seller, limited edition | Product tags or a collection | Badge rules read admin data |
| Customer accounts | Settings > Customer accounts | Shopify hosts new accounts |
| Minimum order and terms for every order | Checkout rules or a Shopify Functions app | Express checkout skips the cart |
| Real age verification | Checkout or app-based verification | The theme gate is soft and can be bypassed |
| Restock emails, waitlists | A back-in-stock app | Needs a backend; Notify me only emails the merchant |
| Wishlist, compare | An app | Not allowed in Theme Store themes |
| Live Instagram and TikTok feeds | An app | Needs API access |
| Loyalty, referrals, chat, AI search, registries, scheduling | Apps | Need a backend |
| Pixels and analytics | Settings > Customer events | Never hard-coded in Theme Store themes |
| Checkout, payments, shipping rates, taxes, orders, notifications, redirects, sitemap | Shopify admin | Platform-controlled |
| Downloadable purchase links in legacy accounts | Digital downloads app | Not exposed to the theme |
| PWA and service worker | Not possible | Themes can't register a service worker at the store root |

---

## 4. Before submission

1. Replace `theme_documentation_url` and `theme_support_url` in `config/settings_schema.json` with live URLs.
2. Publish the documentation and a support contact form (name, email, store URL, problem description, file upload, auto-responder).
3. Push to a development store with `shopify theme dev` and test every template, the theme editor, and each preset.
4. Run Lighthouse on the benchmark store (home, collection, product; desktop and mobile). Targets: performance 60+, accessibility 90+.
5. Test on Safari, Chrome, Firefox, Edge, Mobile Safari, Chrome Mobile, Samsung Internet, and the Instagram, Facebook, and Pinterest webviews.
6. Build one demo store per preset with real content, test payments, and no apps.
7. Confirm Lilac, Ivory, and Dusk aren't used by existing themes on the Theme Store or other platforms.
8. Confirm the default fonts (Cormorant, Outfit) load in the editor's font picker.

## 5. Changes made in this phase

| Gap | Fix | Files |
|---|---|---|
| Header account menu setting defaulted to `customer-account-main-menu` (rules require `main-menu` or `footer`) | Setting removed; the account component uses Shopify's standard account menu | `sections/header.liquid`, `sections/header-group.json` |
| Video embeds used `https://` URLs | Protocol-relative URLs | `sections/video-banner.liquid`, `blocks/video.liquid` |
| No consent check for browsing history | `Lilac.privacy.preferencesAllowed()`; recently viewed saves and loads only with consent | `assets/theme.js`, `assets/product.js`, `assets/recently-viewed.js` |
| No age verification gate (catalog group 6) | Soft age check in the overlay group, off by default, with a persistent dialog | `sections/age-verification.liquid`, `assets/age-gate.js`, `assets/theme.js` |
| No Buy X Get Y, membership, or country messages (groups 11, 17, 20) | Conditional message product block and theme block | `snippets/conditional-message.liquid`, `blocks/conditional-message.liquid`, `sections/main-product.liquid` |
| No delivery time slots (group 5) | Time slot picker saved as a cart attribute | `snippets/cart-options.liquid`, `assets/cart.js`, `config/settings_schema.json` |
| No reorder links (group 7) | Buy again form on the legacy order page | `sections/main-order.liquid` |
| No event or booking product layout (groups 2, 20) | `product.event` template; calendar and location icons for tabs | `templates/product.event.json`, `sections/main-product.liquid` |
| No high contrast support (group 18) | Forced colors rules | `assets/components.css` |
| No repeatable rules evidence | 40-check script | `tools/rules-check.mjs` |
