# Lilac release notes

## 1.0.0

First release.

### Design

- Three styles: **Lilac** (cream and ink with a lavender accent), **Ivory** (paper white, editorial), and **Dusk** (deep violet gradients).
- Six color schemes, with optional device dark mode.
- Halo media: images in an arch, an orb, or a frame with a lavender glow.
- Rotating orbit badge, pill-shaped feature dock, and separate card styles for large and small screens.

### Navigation and search

- Header with dropdown or mega menus. Mega menus can show image promotions.
- Mobile menu drawer with sliding levels, account link, and country and language selectors.
- Sticky and transparent header options.
- Announcement bar with rotation and an option to dismiss.
- Predictive search with suggestions, products, collections, pages, articles, and popular searches.

### Home page and content

- 28 sections you can add to any page, including hero, slideshow, video, product lists, bento grid, collage, testimonials, social gallery, countdown, and newsletter.
- Custom section built from 21 theme blocks, including nested groups, cards, accordions, and icons.
- Divider section with line, ornament, and color fade styles.
- Popup for newsletter signups, promotions, or exit intent.
- Optional age verification (a soft, theme-level check).
- Conditional message block that shows offers or notices by product tag, customer tag, sign-in status, or country.

### Products

- Product information section with 34 block types plus app blocks.
- Gallery in stacked, grid, thumbnail, or carousel layouts, with zoom, video, and 3D models (including AR).
- Variant swatches, combined listings, and variant images.
- Price display with sale prices, unit prices, and Shop Pay Installments.
- Pickup availability.
- Business-day delivery estimate.
- Low stock messages from real inventory.
- Purchase options (selling plans), gift card recipient form, custom fields, gift wrap, size guide drawer, frequently bought together, and complementary products.
- Sticky add to cart.
- Quick view and quick add from product cards.
- Templates for bundles, configurable products, digital products, gift cards, pre-orders, and events or bookings.

### Collections and search results

- Filters from Search & Discovery in a sidebar, above the products, or in a drawer. Swatches, price range, and removable active filters.
- Sorting, and a grid density toggle.
- Page numbers, a load more button, or infinite scroll.
- Promotion tiles in the product grid.

### Cart

- Cart drawer or cart page.
- Free shipping progress bar, converted for each currency.
- Discount codes applied in the cart, order notes, and gift wrap.
- Terms checkbox, minimum order message, and delivery date and time slot pickers.
- Shipping estimator.
- Product suggestions and accelerated checkout buttons.

### Pages

- Blog with tag filters and an editorial layout.
- Blog posts with reading time, a table of contents, related posts, an author bio, "Shop the story" products, and comments.
- Page templates for contact, about, FAQ (with search), size guide, order tracking, returns, quote requests, wholesale, and quick order.
- 404 page, password page with email signup, and a gift card page with a QR code and Apple Wallet.

### Customer accounts and wholesale

- Account button for Shopify's customer accounts.
- Styled legacy account pages for stores that still use them: sign in, register, account, order with tracking and Buy again, addresses, reset password, and activate account.
- B2B support: company and location details, quantity rules, a volume pricing table, and a quick order list (as a section and a product block).
- Recently viewed products, saved only with the shopper's consent where Shopify's cookie banner is used.

### Search engines, accessibility, and performance

- Structured data for organization, site search, breadcrumbs, products (with ratings from reviews apps), articles, and FAQs.
- Duplicate filtered, tagged, and search result pages are kept out of search results.
- Skip link, keyboard-friendly menus and dialogs, screen reader announcements for cart and filter changes, and visible focus rings.
- Animations and autoplay stop when the shopper prefers reduced motion.
- Windows high contrast mode support.
- No external scripts. Fonts and core CSS are preloaded.
- The first section's images load first; other images load lazily at the right size.
- Every script loads without blocking the page.

### For developers and apps

- App blocks in most sections, an Apps section, and Custom Liquid sections and blocks.
- Documented `theme:*` events and a `window.Lilac` JavaScript API.
- Custom analytics events for Customer Events pixels.

### Known limitations

- The cart's terms checkbox and minimum order are not enforced for accelerated checkout buttons. Use checkout rules to enforce them for every order.
- Notify me sends you an email; it doesn't send restock emails to shoppers.
- Legacy customer account pages will be removed in a future release after Shopify retires legacy accounts.
- Wishlists, product comparison, live social feeds, and reviews submission need apps.
