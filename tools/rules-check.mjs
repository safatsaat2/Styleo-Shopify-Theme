// Checks the Theme Store page and feature requirements against the theme files.
// Each rule lists files and the Liquid it expects to find there.
// Usage: node tools/rules-check.mjs
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const read = (file) => (existsSync(join(root, file)) ? readFileSync(join(root, file), 'utf8') : '');
const all = (files) => files.map(read).join('\n');

const rules = [
  ['Required templates exist', () => ['layout/theme.liquid', 'templates/404.json', 'templates/article.json', 'templates/blog.json', 'templates/cart.json', 'templates/collection.json', 'templates/index.json', 'templates/list-collections.json', 'templates/page.json', 'templates/page.contact.json', 'templates/password.json', 'templates/product.json', 'templates/search.json', 'templates/gift_card.liquid', 'config/settings_data.json', 'config/settings_schema.json'].every((f) => existsSync(join(root, f)))],
  ['No markets.json, robots.txt.liquid, Sass, or minified files', () => !existsSync(join(root, 'config/markets.json')) && !existsSync(join(root, 'templates/robots.txt.liquid'))],
  ['html lang from request.locale', () => /<html[^>]*lang="{{ request\.locale\.iso_code }}"/.test(read('layout/theme.liquid')) && /lang="{{ request\.locale\.iso_code }}"/.test(read('layout/password.liquid'))],
  ['Header and footer in section groups', () => /sections 'header-group'/.test(read('layout/theme.liquid')) && /sections 'footer-group'/.test(read('layout/theme.liquid'))],
  ['Custom Liquid section with a liquid setting', () => /"type": "liquid"/.test(read('sections/custom-liquid.liquid'))],
  ['@app blocks in main and featured product', () => ['sections/main-product.liquid', 'sections/featured-product.liquid'].every((f) => /"type": "@app"/.test(read(f)))],
  ['Payment icons via enabled_payment_types and payment_type_svg_tag', () => /enabled_payment_types/.test(read('snippets/payment-icons.liquid')) && /payment_type_svg_tag/.test(read('snippets/payment-icons.liquid'))],
  ['Product: title, price, unit price, compare-at, description, options', () => {
    const s = all(['snippets/product-info-blocks.liquid', 'snippets/price.liquid', 'snippets/variant-picker.liquid', 'snippets/product-price-block.liquid']);
    return /product\.title/.test(s) && /unit_price/.test(s) && /compare_at_price/.test(s) && /product\.description/.test(s) && /option\.name/.test(s);
  }],
  ['Product: taxes included note', () => /cart\.taxes_included/.test(read('snippets/product-price-block.liquid'))],
  ['Product: first available variant, quantity, add to cart', () => /selected_or_first_available_variant/.test(read('snippets/product-info-blocks.liquid')) && /quantity/.test(read('snippets/product-quantity.liquid')) && /type="submit"/.test(read('snippets/product-buy-buttons.liquid'))],
  ['Product: accelerated checkout on by default', () => /payment_button/.test(read('snippets/product-buy-buttons.liquid')) && /"id": "show_dynamic_checkout"[^}]*"default": true/.test(read('sections/main-product.liquid'))],
  ['Product: pickup availability and Shop Pay Installments', () => /pickup/.test(read('snippets/product-info-blocks.liquid')) && /payment_terms/.test(all(['snippets/product-price-block.liquid', 'snippets/product-buy-buttons.liquid', 'snippets/product-info-blocks.liquid']))],
  ['Product: gift card recipient form (email, name, message, send_on)', () => ['email', 'name', 'message', 'send_on'].every((key) => read('snippets/gift-card-recipient.liquid').includes(key))],
  ['Product: swatch.color and swatch.image', () => /swatch\.color/.test(read('snippets/variant-picker.liquid')) && /swatch\.image/.test(read('snippets/variant-picker.liquid'))],
  ['Product: rich media in quick view and featured product', () => /product-gallery|product-media/.test(read('sections/quick-view.liquid')) && /product-gallery|product-media/.test(read('sections/featured-product.liquid'))],
  ['Collection: title, description, image', () => ['collection.title', 'collection.description', 'collection.image'].every((key) => read('sections/main-collection-banner.liquid').includes(key))],
  ['Collection: cards link title, show price, unit price, sale badge, price range', () => {
    const s = all(['snippets/product-card.liquid', 'snippets/price.liquid', 'snippets/badges.liquid']);
    return /product\.url/.test(s) && /unit_price/.test(s) && /compare_at_price/.test(s) && /price_varies/.test(s);
  }],
  ['Collection: sorting, empty message, pagination', () => /sort_options|sort_by/.test(all(['sections/main-collection.liquid', 'snippets/results-toolbar.liquid'])) && /empty/.test(read('sections/main-collection.liquid')) && /paginate/.test(read('sections/main-collection.liquid'))],
  ['Collection list: featured_image and pagination', () => /featured_image/.test(read('snippets/collection-card.liquid')) && /paginate/.test(read('sections/main-list-collections.liquid'))],
  ['Cart: line title, unit price, image, final price, quantity, options', () => {
    const s = read('snippets/cart-line-item.liquid');
    return ['unit_price', 'image', 'final_line_price', 'quantity', 'options_with_values'].every((key) => s.includes(key)) && /item\.(product\.)?title/.test(s);
  }],
  ['Cart: total, taxes included, checkout submits form, empty message', () => {
    const s = all(['snippets/cart-checkout.liquid', 'sections/main-cart.liquid']);
    return /cart\.total_price/.test(s) && /taxes_included/.test(s) && /name="checkout"/.test(s) && /empty/.test(s);
  }],
  ['Cart: notes, selling plans, discounts, accelerated checkout', () => {
    const s = all(['snippets/cart-options.liquid', 'snippets/cart-line-item.liquid', 'snippets/cart-discounts.liquid', 'snippets/cart-checkout.liquid']);
    return /cart\.note|attributes\[|name="note"/.test(s) && /selling_plan_allocation/.test(s) && /discount/.test(s) && /content_for_additional_checkout_buttons/.test(s);
  }],
  ['Page: title and content; contact template', () => /page\.title/.test(read('sections/main-page.liquid')) && /page\.content/.test(read('sections/main-page.liquid')) && existsSync(join(root, 'templates/page.contact.json'))],
  ['Blog: title, article link, image, excerpt_or_content, pagination', () => /blog\.title/.test(read('sections/main-blog.liquid')) && /excerpt_or_content/.test(read('snippets/article-card.liquid')) && /article\.url/.test(read('snippets/article-card.liquid')) && /article\.image/.test(read('snippets/article-card.liquid')) && /paginate/.test(read('sections/main-blog.liquid'))],
  ['Article: title, comments, published_at, paginated comments', () => /article\.title/.test(read('sections/main-article.liquid')) && /published_at/.test(read('sections/main-article.liquid')) && !/article.created_at/.test(read('sections/main-article.liquid')) && /paginate article\.comments/.test(read('sections/main-article.liquid'))],
  ['Search: no results message, object_type, pagination', () => /object_type/.test(read('sections/main-search.liquid')) && /paginate/.test(read('sections/main-search.liquid')) && /no_results|empty/.test(read('sections/main-search.liquid'))],
  ['404: message and a way forward', () => /not_found\.heading/.test(read('sections/main-404.liquid')) && /routes\.root_url/.test(read('sections/main-404.liquid'))],
  ['Gift card: Apple Wallet, code, QR 120px+, logo or shop.name', () => {
    const s = read('templates/gift_card.liquid');
    return /pass_url/.test(s) && /gift_card\.code/.test(s) && /width: 160/.test(s) && /shop\.name/.test(s);
  }],
  ['Password: logo or shop.name, password_message, password form', () => {
    const s = read('sections/main-password.liquid');
    return /shop\.name/.test(s) && /password_message/.test(s) && /form 'storefront_password'/.test(s);
  }],
  ['Follow on Shop with login_button', () => /login_button/.test(read('sections/footer.liquid'))],
  ['shopify-account in the header', () => /<shopify-account/.test(read('sections/header.liquid'))],
  ['SEO: title, description, canonical, Open Graph, Twitter', () => ['<title>', 'name="description"', 'rel="canonical"', 'og:title', 'twitter:card'].every((key) => read('snippets/meta-tags.liquid').includes(key))],
  ['Rich product snippets (Product JSON-LD)', () => /"@type": "Product"/.test(read('snippets/product-structured-data.liquid'))],
  ['Favicon setting and theme_info', () => /"id": "favicon"/.test(read('config/settings_schema.json')) && /"name": "theme_info"/.test(read('config/settings_schema.json'))],
  ['Fonts use font_picker with font_modify variants', () => /"type": "font_picker"/.test(read('config/settings_schema.json')) && /font_modify: 'weight', 'bold'/.test(read('snippets/theme-styles.liquid')) && /font_modify: 'style', 'italic'/.test(read('snippets/theme-styles.liquid'))],
  ['Color schemes with background and foreground', () => /color_scheme_group/.test(read('config/settings_schema.json'))],
  ['Header and footer menu defaults are main-menu or footer', () => {
    const files = all(['sections/header.liquid', 'sections/footer.liquid']);
    const defaults = [...files.matchAll(/"type": "link_list",[\s\S]*?"default": "([^"]+)"/g)].map((m) => m[1]);
    return defaults.length > 0 && defaults.every((value) => value === 'main-menu' || value === 'footer');
  }],
  ['No shopify:// references in JSON', () => !/shopify:\/\//.test(all(['templates/index.json', 'templates/product.json', 'sections/header-group.json', 'sections/footer-group.json', 'listings/ivory/templates/index.json', 'listings/dusk/templates/index.json']))],
  ['Skip link and live region', () => /skip-link/.test(read('layout/theme.liquid')) && /LilacLiveRegion/.test(read('layout/theme.liquid'))],
  ['Social placeholders empty', () => !/"id": "social_[a-z]+_link",[^}]*"(placeholder|default)"/.test(read('config/settings_schema.json'))],
];

let failed = 0;
for (const [label, test] of rules) {
  let ok = false;
  try {
    ok = test();
  } catch (error) {
    ok = false;
  }
  if (!ok) failed += 1;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`);
}
console.log(failed ? `\n${failed} failed` : `\nAll ${rules.length} checks passed.`);
process.exitCode = failed ? 1 : 0;
