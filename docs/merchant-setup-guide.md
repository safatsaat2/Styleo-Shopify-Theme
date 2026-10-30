# Lilac merchant setup guide

Version 1.0.0

This guide takes you from installing Lilac to a finished store. Each step says where to click in Shopify admin and which theme setting it affects. Steps marked **Optional** only matter if you use that feature.

Paths are written as **Online Store > Themes > Customize > Theme settings > Cart**. In the theme editor, Theme settings is the gear icon in the left sidebar.

---

## 1. Before you start

- Lilac is an Online Store 2.0 theme. Every page is built from sections and blocks you can add, remove, and reorder in the theme editor.
- Lilac doesn't need any apps. Some features read data that an app or a Shopify admin setting provides (reviews, subscriptions, wholesale pricing). Those are listed in [section 13](#13-apps-and-integrations).
- Lilac never loads tracking scripts. Add pixels through **Settings > Customer events**.

### Theme styles

Lilac comes in three styles. Pick one when you add the theme, or switch later under **Theme settings > Colors** (the presets change colors and fonts only, not your content).

| Style | Look | Home page |
|---|---|---|
| Lilac | Cream pages, ink text, lavender accent, dark header | Hero, feature dock, collections, product lists, promotion |
| Ivory | Paper white, softer contrast, editorial feel | Slideshow, columns, collage, testimonials, logos, blog |
| Dusk | Deep violet gradients, lavender glow | Video, collections, bento grid, countdown, social gallery |

---

## 2. Quick start (about 30 minutes)

1. **Logo:** Theme settings > Logo and favicon. Upload your logo, and a light version for dark backgrounds (used on the dark header, footer, password page, and gift card page). Add a favicon (at least 32 x 32px, square).
2. **Colors:** Theme settings > Colors. Adjust the six color schemes (Cream, Noir, Dusk, Lavender, Mist, Paper). Every section has a color scheme setting that uses these.
3. **Fonts:** Theme settings > Typography. Headings use Cormorant (a serif), body text uses Outfit. Pick any font from Shopify's library.
4. **Menus:** Online Store > Navigation. Set up the main menu and a footer menu ([section 4](#4-navigation)).
5. **Home page:** Customize the home page sections ([section 5](#5-home-page)).
6. **Social links:** Theme settings > Social media.
7. **Cart:** Theme settings > Cart. Choose a drawer or a cart page and set the free shipping threshold ([section 9](#9-cart)).
8. **Pages:** Create your contact, about, FAQ, and other pages and assign their templates ([section 10](#10-pages)).
9. **Policies:** Settings > Policies. Lilac styles these pages automatically; link them in the footer menu.
10. **Preview on a phone:** Use the device toggle at the top of the editor. Most sections have separate mobile layout settings.

---

## 3. Theme settings reference

| Group | What to set |
|---|---|
| Logo and favicon | Logo, logo for dark backgrounds, logo widths for large and small screens, favicon |
| Colors | The six color schemes; the page scheme; the scheme for drawers and dialogs; **Follow device dark mode** (uses the dark mode scheme when the shopper's device is in dark mode) |
| Typography | Heading, body, subheading, and menu fonts, with size, letter spacing, and text case |
| Layout | Page width and margins, space between sections, grid spacing, corner style, shadows, border strength, scroll animations, page transitions, back to top button |
| Buttons | Font, size, text case, corner radius, secondary button style, hover effect |
| Inputs | Height, corner radius, border thickness and strength |
| Product cards | Card style on large and small screens (portrait, row, compact), image shape and fit, second image on hover, vendor, rating, color swatches, quick add, quick view |
| Collection cards | Arch, orb, or minimal style; text inside or below; product count |
| Badges | Sale, new, best-seller, limited edition, and sold out badges ([section 7.4](#74-badges)) |
| Product pages | Swatch shape and size, low stock threshold, coming soon tag, delivery estimate |
| Cart | Cart type, note, discount codes, free shipping, gift wrap, terms, minimum order, delivery date |
| Search | Predictive search, vendor and price in results, popular searches |
| Currency format | Show currency codes (useful when you sell in several currencies) |
| Social media | Account links, WhatsApp chat button |

Add your own CSS under **Theme settings > Custom CSS**, or per section under each section's **Custom CSS** field. Custom code isn't covered by theme support.

---

## 4. Navigation

### Main menu

1. Go to **Online Store > Navigation** and open **Main menu**.
2. Add top-level links. Nest links under a top-level link to make a dropdown; nest one more level for a mega menu column.
3. In the theme editor, open **Header** and pick the menu and the **Menu style** (dropdown or mega menu).

**Mega menu images:** In the Header section, add a **Mega menu promotion** block. Set **Menu item** to the title of the top-level link (capitalization doesn't matter), then add an image, heading, and link. Promotions show beside that menu's columns; add one or two per menu for the best layout.

### Mobile menu

The mobile drawer uses the same main menu, with sliding panels for each level. It also shows the account link, country and language selectors, and an optional button (Header > **Drawer button**).

### Footer menus

Create one or more menus (for example "Shop" and "Help") and add a **Menu** block for each to the **Footer** section.

### Customer account menu

With Shopify's customer accounts, the header shows the account button. Its dropdown lists the links in the **Customer account main menu** (handle `customer-account-main-menu`), which Shopify creates for you; edit it under **Online Store > Navigation**. Turn customer accounts on under **Settings > Customer accounts**.

---

## 5. Home page

Open **Customize** on the home page. Click **Add section** to see every section, grouped by category.

| Section | Use it for |
|---|---|
| Hero | Large heading with halo image (arch, orb, or frame), buttons, orbit badge, optional countdown |
| Slideshow | Several slides that rotate; autoplay pauses on hover and for keyboard focus |
| Video | Uploaded video or a YouTube or Vimeo link, as a background loop or with a play button |
| Feature dock | The pill-shaped strip of benefits (shipping, returns, support) |
| Featured collections | Collection cards in a grid or carousel |
| Product list | Products from one collection in a grid or carousel ("New arrivals" and "Best sellers" are presets) |
| Featured product | One product with its buy buttons, on any page |
| Promotion banner | A Dusk band with an image and a call to action |
| Countdown | A timer to a real end date ([section 12](#12-honest-marketing)) |
| Image with text | Image beside text, with shape and position options |
| Multicolumn | Columns with icons or images |
| Collage | Mixed-size image tiles that link to collections or pages |
| Bento grid | Tiles of different sizes, each holding its own blocks |
| Custom section | A free layout built from blocks (headings, text, buttons, images, cards, groups) |
| Rich text | A centered statement |
| Testimonials | Customer quotes |
| Logo list | Press or partner logos |
| Social gallery | Your own uploaded images styled as a social feed, linked to your profile (no live feed) |
| Blog posts | Latest posts from a blog |
| Newsletter | Email signup |
| Recently viewed | Products this shopper looked at |
| Divider | A line, ornament, or color fade between sections |
| Custom Liquid, Apps | Code snippets and app blocks |

### Building with blocks

The **Custom section**, **Bento grid** tiles, and **Group** block accept any theme block: Heading, Text, Button, Image, Video, Icon, Spacer, Divider, Group, Accordion, Product card, Collection card, Testimonial, Menu, Email signup, Social media links, Payment icons, Countdown, Orbit badge, Conditional message, and Custom Liquid. Groups can hold groups, so you can build columns, cards, and icon rows.

**Heading tags:** The Heading block has a separate **HTML tag** setting. Keep one H1 per page (the hero or page title already provides it) and use H2 or H3 elsewhere. The size setting only changes how it looks.

---

## 6. Collections and search

### Filters

Filters come from the **Shopify Search & Discovery** app (free, by Shopify).

1. Install Search & Discovery, then open **Filters**.
2. Add filters such as availability, price, product type, vendor, color, and size. Metafield filters work too.
3. In the theme editor, open a collection and select the **Product grid** section. Turn on **Enable filtering** and choose **Filter layout** (sidebar, above products, or drawer). On phones, filters always open in a drawer.

**Color swatches in filters:** Use Shopify's category metafields (for example **Color**) on your products. Swatch colors and images then show in filters and on product cards.

### Product grid settings

Products per page, columns on desktop and mobile, pagination (page numbers, load more button, or infinite scroll), product count, grid density toggle, and sorting.

**Promotion tiles:** Add a **Promotion** block to the Product grid to place an image tile between products.

### Collection banner

Shows the collection title, description, and image. Set the collection image under **Products > Collections**.

### Alternate templates

`collection.editorial` is for lookbook-style collections: a Dusk banner with a framed image, three columns, filters above the products, infinite scroll, and a newsletter signup. Assign it on the collection's admin page under **Theme template**.

### Search

- **Predictive search** shows suggestions, products, collections, pages, and articles as shoppers type (Theme settings > Search).
- **Popular searches** shows chips when the search field is empty. Enter one term per line.
- Improve results with **Search & Discovery > Synonyms** and **Product boosts**.

---

## 7. Product pages

### 7.1 Blocks

Select the **Product information** section to add, remove, and reorder its blocks:

| Block | Notes |
|---|---|
| Title, vendor, price, SKU, description | Price shows sale price, unit price, and Shop Pay Installments |
| Rating | Needs a reviews app that saves the standard reviews metafields ([section 13](#13-apps-and-integrations)) |
| Badges | Uses the rules in Theme settings > Badges |
| Inventory | Low stock message from real tracked inventory ([section 12](#12-honest-marketing)) |
| Variant picker | Buttons, swatches, or dropdowns; combined listings switch products |
| Quantity, Quantity rules | Follows minimums, maximums, and increments; shows volume pricing |
| Quick order list | Every variant in a table for bulk orders ([section 11](#11-wholesale-b2b)) |
| Purchase options | Subscriptions and other selling plans |
| Buy buttons | Add to cart, accelerated checkout buttons, gift card recipient form |
| Pickup availability | Locations from Settings > Locations with local pickup turned on |
| Delivery estimate | Business-day window ([section 7.3](#73-delivery-estimate)) |
| Shipping info, Digital note, Trust icons | Short text rows |
| Collapsible tab, Care, Specifications, Size guide | Accordion rows; Size guide opens a page in a drawer |
| Custom field | Text, dropdown, checkbox, or text area saved on the order (engraving, initials). Can show only for one option value |
| Gift wrap | Adds your gift wrap product with an optional message ([section 9](#9-cart)) |
| Notify me | Sold out or coming soon request form ([section 7.5](#75-back-in-stock-requests)) |
| Conditional message | Text shown only when conditions match: a product tag (for example "Buy 2, get 1 free" on products tagged `bogo`), signed-in or signed-out customers, a customer tag (members, VIP, or wholesale tiers), or the shopper's country. Describe only discounts you've created in Shopify admin |
| Complementary products | "Pairs well with" from Search & Discovery |
| Frequently bought together | Products you choose, added in one click |
| Share, Quote request, Divider, Custom Liquid, Apps | |

Section settings include gallery layout (stacked, two-column grid, thumbnails on the left or below, or carousel), media width, zoom, video looping, sticky product info, breadcrumbs, and the sticky add to cart bar.

### 7.2 Product templates

Assign templates on each product's admin page under **Theme template**:

| Template | For |
|---|---|
| Default | Most products |
| `product.bundle` | Bundles: adds frequently bought together and complementary products |
| `product.configurator` | Personalized products: custom fields, gift wrap, quote request |
| `product.digital` | Downloads and services: digital note, no shipping messaging |
| `product.gift-card` | Gift cards: recipient form so shoppers can send it to someone |
| `product.preorder` | Pre-orders: purchase options, inventory note, and a notify me form ([section 7.6](#76-pre-orders-and-coming-soon)) |
| `product.event` | Events, classes, and bookings: one variant per date or ticket type, a required attendee name, venue details, and a group booking request link |

### 7.3 Delivery estimate

Theme settings > Product pages: set the minimum and maximum business days, the same-day cutoff hour, and whether weekends count. The block shows "Arrives between [date] and [date]" and is always labeled as an estimate. Set times in your store's time zone (Settings > General).

### 7.4 Badges

| Badge | Shows when |
|---|---|
| Sale | The variant has a compare-at price above its price |
| New | The product was published within **Days a product counts as new** |
| Best seller | The product is in the **Best-seller collection** or has the **Best-seller product tag** |
| Limited edition | The product has the **Limited edition product tag** (default `limited-edition`) |
| Sold out | No variant is available |
| Coming soon | The product has the **Coming soon product tag** (default `coming-soon`) |

### 7.5 Back-in-stock requests

The **Notify me** block sends you a contact form email with the shopper's email, the product, and the variant. Lilac doesn't send restock emails itself. Reply manually, or use a back-in-stock app for automatic emails (add its app block and remove Notify me).

### 7.6 Pre-orders and coming soon

- **Coming soon:** Tag the product `coming-soon`. The buy button changes to "Coming soon" and Notify me appears.
- **Pre-order:** Track quantity and turn on **Continue selling when out of stock** (Products > [product] > Inventory). When stock reaches zero, the button reads "Pre-order" on any template. For pre-order selling plans (deposits, delayed charges), use an app and assign `product.preorder`, which adds Purchase options, Notify me, and a shipping tab. Add the expected ship date to the description or a Collapsible tab.

### 7.7 Metafields

Lilac reads these standard metafields automatically:

| Metafield | Used for |
|---|---|
| `reviews.rating`, `reviews.rating_count` | Stars on cards and product pages, and rating data for search engines. Written by reviews apps |
| `descriptors.subtitle` | Subtitle under the product title |
| `descriptors.care_guide` | Default text for the Care block |
| Category metafields (Color, Size, and others) | Swatches and filters |

Connect any other metafield yourself through **dynamic sources**: click the database icon next to a block setting and choose a metafield. Suggested definitions (create them under **Settings > Custom data > Products**):

| Suggested key | Type | Connect it to |
|---|---|---|
| `custom.size_chart` | Page | Size guide block > Page |
| `custom.specifications` | Rich text | Specifications block > Content |
| `custom.fbt_products` | Product list | Frequently bought together > Products |
| `custom.delivery_note` | Single line text | Shipping info block > Text |
| `custom.badge_label` | Single line text | A Text block near the title |
| `custom.products` (articles) | Product list | Blog post > Shop the story > Products |
| `custom.author_bio` (articles) | Multi-line text | Blog post > Author > Bio |

When a metafield is empty, the block hides.

---

## 8. Quick view, quick add, and recommendations

- **Quick add:** Theme settings > Product cards > **Quick add**. Single-variant products add straight to the cart; products with options open quick view.
- **Quick view:** Opens the product's gallery and buy form in a dialog without leaving the page.
- **Product recommendations:** The section under product pages updates automatically from your sales data. Choose **Related** or **Complementary** (complementary uses Search & Discovery).
- **Recently viewed:** Saved only in the shopper's own browser. Nothing shows until they view a product, and they can clear the history. If you use Shopify's cookie banner (**Settings > Customer privacy**), history is saved only for shoppers who allow preference cookies.

---

## 9. Cart

Theme settings > Cart:

| Setting | Notes |
|---|---|
| Cart type | **Drawer** slides in after adding; **Page** goes to /cart |
| Order note | Notes save as the shopper types |
| Discount code field | Applies and removes codes in the cart. Codes are checked by Shopify |
| Free shipping progress | Enter the threshold in your store's currency. Converted automatically for other currencies. Create the matching free shipping rate under **Settings > Shipping and delivery** |
| Gift wrap product | See below |
| Require terms agreement | Shows a checkbox linked to the page you choose |
| Minimum order subtotal | Shows a message and blocks the checkout button below this amount |
| Delivery date picker | Saves the chosen date as a cart attribute on the order |
| Delivery time slots | One slot per line (for example "9 AM to 12 PM"). Shows a time picker next to the date; the choice is saved with the order |

**Gift wrap setup:**

1. Create a product named "Gift wrap" with a price, an image, and **Track quantity** off.
2. Lilac leaves the selected gift wrap product (and any product tagged `gift-wrap`) out of recommendations. Hide it from search engines too (in the product's **Search engine listing**, or with the `seo.hidden` metafield).
3. Select it in **Theme settings > Cart > Gift wrap product**.
4. Add the **Gift wrap** block to product pages if you want the option there too.

**Important:** The terms checkbox and the minimum order work in the cart only. Accelerated checkout buttons (Shop Pay, Apple Pay) skip the cart. To enforce a minimum or terms for every order, use **Checkout rules** or a Shopify Functions app.

**Cart page blocks:** Discounts, Cart options (note, gift wrap, terms, delivery date), Shipping estimator, Checkout, Payment icons, Text, Custom Liquid, and Apps. The **Cart suggestions** section shows recommended products.

---

## 10. Pages

Create each page under **Online Store > Pages > Add page**, then choose its **Theme template**:

| Page | Template | Then |
|---|---|---|
| Contact | `page.contact` | Edit the form fields and contact cards in the editor |
| About | `page.about` | Replace the story text, image, values, and team |
| FAQ | `page.faq` | Add question groups; FAQ data for search engines is added automatically |
| Size guide | `page.size-guide` | Link it from the Size guide block |
| Order tracking | `page.order-tracking` | Explains where to find tracking; includes an order help form |
| Returns | `page.returns` | Return steps and a request form |
| Quote request | `page.quote-request` | Pick this page in the product Quote request block |
| Wholesale | `page.wholesale` | Benefits and an application form |
| Quick order | `page.quick-order` | Choose a collection in the Quick order list section |
| Any other page | `page` | Title and content |

**Contact forms:** Every form (contact, quote, returns, wholesale, notify me) emails the address in **Settings > Notifications > Sender email**. Each email includes the form name so you can tell them apart.

### Blog

- Create blogs and posts under **Online Store > Blog posts**. Each post's reading time is calculated automatically.
- `blog.editorial` makes the first post large. Assign it on the blog's admin page.
- On the post page you can turn on the table of contents, related posts, author bio, share buttons, and comments. Comments follow the blog's comment setting (disabled, moderated, or published automatically).

### Age verification

For age-restricted products, turn on **Age verification** under **Customize > Overlays**. Shoppers confirm their age once (remembered for the number of days you choose). It's a soft, theme-level check that shoppers can bypass, not a legal age verification. Check the laws where you sell and use checkout or app-based verification when required.

### Account and data requests

Shoppers with Shopify's customer accounts manage their own details. For other requests, such as deleting an account or exporting data, point shoppers to your contact page; handle them under **Customers** in Shopify admin.

### 404, password, and gift card pages

- **404:** Edit the text, search field, and product list under **Customize > Other pages > 404 page**.
- **Password page:** Shows while your store is password protected (**Online Store > Preferences**). It has an email signup so you can collect launch subscribers.
- **Gift card page:** What a gift card recipient sees. It uses your logo for dark backgrounds, shows the balance, a QR code for in-store use, and Add to Apple Wallet.

---

## 11. Wholesale (B2B)

Lilac supports Shopify's built-in B2B features (on plans that include them):

1. Create companies and catalogs under **Customers > Companies** and **Products > Catalogs**.
2. In a catalog, set prices, **quantity rules** (minimum, maximum, increment), and **volume pricing** (price breaks).
3. Add the **Quantity rules** block to product pages. It shows the rules and a volume pricing table for signed-in buyers.
4. Create a "Quick order" page with the `page.quick-order` template, or add the **Quick order list** block to product pages. Buyers enter quantities for many variants and add them all at once.
5. Signed-in buyers see their company and location on the account page.

Prices, rules, and volume pricing follow the buyer's catalog automatically. Shoppers who aren't B2B buyers see your regular prices.

---

## 12. Honest marketing

Lilac never invents urgency or social proof. Use these features as intended:

- **Countdowns** (Hero, Countdown section, Countdown block) need a real end date and time. They hide when the time passes and never restart. Use them only for offers that actually end.
- **Low stock messages** use your real inventory and appear only when the variant tracks quantity and is at or below **Low stock threshold**.
- **Testimonials** should be real customer words, used with permission, with the star rating they actually gave.
- **Ratings** come only from a reviews app's data. Without it, no stars show.
- There are no fake "people viewing", "recently bought", or visitor counters.

---

## 13. Apps and integrations

Most sections have an **Apps** block, and there's a standalone **Apps** section. Use them to place app content without code.

| Feature | Where it goes | Notes |
|---|---|---|
| Product reviews | Product information > Apps; any section's app block | Choose an app that writes `reviews.rating` and `reviews.rating_count` so stars appear on cards and in search results |
| Wishlist, compare | Product information > Apps; Customer account > Apps | Not built into the theme |
| Subscriptions | Shopify Subscriptions or another app | Lilac shows selling plans in the Purchase options block and in the cart |
| Back-in-stock emails | Product information > Apps | Replaces the Notify me block |
| Loyalty and rewards | Customer account > Apps; Apps section | |
| Live chat | App embeds (Customize > App embeds) | Or the WhatsApp button in Theme settings > Social media |
| Instagram or TikTok feeds | Apps section | The Social gallery section uses your own uploaded images only |
| Product configurators, gift registries | Product information > Apps; Apps section | |
| Analytics and ads pixels | Settings > Customer events | Lilac publishes extra events for custom pixels (listed below) |

**Custom events for pixels:** `lilac_quick_view_opened`, `lilac_filters_updated`, `lilac_search_opened`, and `lilac_cart_error`. Developers can find payloads and the JavaScript API in the developer notes (`docs/events.md`).

**Follow on Shop:** Turn on **Show Follow on Shop** in the Footer section. It needs Shop Pay turned on.

---

## 14. Customer accounts

Under **Settings > Customer accounts**:

- **Customer accounts (recommended):** Shoppers sign in with a one-time code. Shopify hosts the account pages. Lilac shows the account button in the header; style the hosted pages in the checkout and accounts editor (**Settings > Checkout > Customize**).
- **Legacy customer accounts:** The order page includes a **Buy again** button that adds the order's available items back to the cart. Shopify has deprecated these and will retire them on a date still to be announced. If your store still uses them, Lilac includes styled sign in, register, account, order, addresses, password reset, and activation pages. Plan to move to customer accounts.

---

## 15. Markets and languages

- Add countries and currencies under **Settings > Markets**, and languages under **Settings > Languages**.
- Turn on the country and language selectors in the **Header** and **Footer**.
- Translate your content with the **Translate & Adapt** app. All theme text is translatable.
- Prices, free shipping thresholds, and minimum orders convert automatically for each market's currency.

---

## 16. Search engines and social sharing

Lilac adds titles, descriptions, canonical links, social sharing images, and structured data (organization, site search, breadcrumbs, products, articles, and FAQs) for you. What you control:

- **Titles and descriptions:** Each product, collection, page, and post has a **Search engine listing** section. The home page uses **Online Store > Preferences**.
- **Social sharing image:** Online Store > Preferences.
- **Alt text:** Add it to every image (click the image in Products or Files). It's read by screen readers and search engines.
- Filtered, tagged, and search result pages are kept out of search results automatically to avoid duplicates.
- Shopify creates your sitemap and robots.txt. Lilac doesn't change them.

---

## 17. Accessibility and speed

Lilac is built for keyboard and screen reader use and respects reduced motion settings. To keep your store accessible and fast:

- Add alt text to images; leave it empty only for purely decorative images.
- Check that text stays readable on images. Use the overlay settings on image sections.
- Keep one H1 per page (see [Building with blocks](#building-with-blocks)).
- Upload images at around 2000px wide for full-width sections and 1200px for others. Shopify sizes them for each screen.
- Prefer uploaded videos to embedded ones in the first section.
- Keep the number of apps low; each app embed adds code to every page.

---

## 18. What Lilac doesn't do

These are handled by Shopify admin or apps, not the theme: checkout design and logic (use **Settings > Checkout**), payments, shipping rates and zones, taxes, order management, email and SMS notifications, URL redirects (**Online Store > Navigation > URL redirects**), and your sitemap.

---

## 19. Troubleshooting

| Problem | Fix |
|---|---|
| No filters on collections | Install Search & Discovery and add filters; turn on **Enable filtering** in the Product grid |
| Stars don't show | Your reviews app must write `reviews.rating`; check the app's theme integration settings |
| Countdown doesn't appear | The end date is missing, uses the wrong format (YYYY-MM-DD), or has passed |
| Low stock message never shows | The variant must track quantity; check **Low stock threshold** |
| Free shipping bar is wrong | Check the threshold and your free shipping rate in Settings > Shipping and delivery |
| Cart drawer doesn't open after adding | Theme settings > Cart > Cart type must be **Drawer** |
| Pickup block is empty | Turn on local pickup for a location in Settings > Shipping and delivery |
| Recently viewed is empty | It fills as the shopper views products; it's per browser |
| Mega menu image missing | The promotion block's **Menu item** must match the top-level link title exactly |
| Account button missing | Turn on customer accounts in Settings > Customer accounts and **Show account** in the Header |

Still stuck? Use the documentation and support links on the theme's card in **Online Store > Themes** (the **...** menu).
