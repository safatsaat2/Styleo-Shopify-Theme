# Lilac JavaScript events and API

Apps and Custom Liquid code can hook into the theme through DOM events and `window.Lilac`.
All events are `CustomEvent`s that bubble to `document`.

```js
document.addEventListener('theme:cart:updated', (event) => {
  console.log(event.detail.action, event.detail.cart);
});
```

| Event | Fired when | `event.detail` |
|---|---|---|
| `theme:cart:updated` | Any cart change made through `Lilac.cart` (add, change, update, refresh) | `{ action: 'add' \| 'change' \| 'update' \| 'refresh', source, cart \| null, items \| null, sections }`. `cart` is set for change, update, and refresh; `items` for add. `sections` holds rendered HTML keyed by section id. |
| `theme:cart:error` | A cart request fails | `{ action, source, message, status }` |
| `theme:cart:open` | Dispatch it to open the cart drawer (cart type "Drawer") | `{ source }` |
| `theme:variant:changed` | A product form selects a new variant | `{ sectionId, productId, variant, previousVariantId }` |
| `theme:quickview:opened` | The quick view dialog shows a product | `{ productUrl, productId }` |
| `theme:filters:updated` | Collection or search results re-render after filtering, sorting, or paging | `{ sectionId, url }` |
| `theme:search:opened` | The header search panel opens | `{ source }` |
| `theme:dialog:opened` / `theme:dialog:closed` | Any `<lc-dialog>` opens or closes | `{ id, dialog }` |
| `theme:section:load` | Theme editor re-renders a section | `{ sectionId }` (dispatched on the section) |
| `theme:block:select` / `theme:block:deselect` | Theme editor selects a block | `{ blockId, sectionId }` (dispatched on the block) |

## `window.Lilac`

| Member | Purpose |
|---|---|
| `Lilac.cart.add(formDataOrItems, source?)` | POST `/cart/add.js`; also renders every section marked `[data-cart-section]` |
| `Lilac.cart.change({ line \| id, quantity, properties?, selling_plan? })` | POST `/cart/change.js` |
| `Lilac.cart.update(body)` | POST `/cart/update.js` (note, attributes, `discount`, `updates`) |
| `Lilac.cart.get()` / `Lilac.cart.refresh()` | Read the cart; re-render cart sections after an app changed the cart |
| `Lilac.sections.fetch(ids, url?)` | Section Rendering API, up to 5 section ids |
| `Lilac.dialogs.open(id, trigger?)` / `close(id)` | Open or close any `<lc-dialog>` by id |
| `Lilac.formatMoney(cents)` | Format with the shop's money format |
| `Lilac.announce(text)` | Polite screen reader announcement |
| `Lilac.track(name, payload)` | Publishes `lilac_<name>` through `Shopify.analytics.publish` for Customer Events pixels |

Apps that change the cart through their own requests should call `Lilac.cart.refresh()` afterward so the drawer, count, and totals update.

Shopify publishes the standard storefront events (page viewed, product viewed, collection viewed, search submitted, product added to cart, checkout started) on its own. The theme doesn't duplicate them.

## Custom analytics events

`Lilac.track` publishes these through `Shopify.analytics.publish`. Subscribe to them in a Customer Events custom pixel with `analytics.subscribe('lilac_quick_view_opened', callback)`.

| Event | Published when | Payload |
|---|---|---|
| `lilac_quick_view_opened` | The quick view dialog shows a product | `{ productId, url }` |
| `lilac_filters_updated` | Filters, sorting, or paging change collection or search results | `{ url }` |
| `lilac_search_opened` | The header search panel opens | `{}` |
| `lilac_cart_error` | A cart request fails | `{ action, status }` |

The theme never loads tracking scripts or pixels itself.
