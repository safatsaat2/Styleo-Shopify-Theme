/*
  Lilac core runtime.

  Exposes window.Lilac with:
  - events / on / emit      documented theme:* CustomEvents for apps and custom code
  - fetchJSON               fetch wrapper with readable errors
  - sections                Section Rendering API helpers
  - cart                    Cart Ajax API wrapper that emits theme:cart:updated
  - formatMoney             shop money format renderer
  - dialogs                 <lc-dialog> wrapper around native <dialog>
  - announce                polite screen reader announcements
  - track                   Shopify.analytics custom events

  Feature scripts (header.js, cart.js, product-form.js, ...) load after this
  file with `defer` and build on window.Lilac.
*/
(() => {
  'use strict';

  const config = window.LilacConfig || {};
  const root = document.documentElement;

  /* -------------------------------------------------------------
     Events
     Every event bubbles from `document` unless a target is given.
     detail payloads are documented in docs/events.md.
  ------------------------------------------------------------- */
  const events = Object.freeze({
    cartUpdated: 'theme:cart:updated',
    cartError: 'theme:cart:error',
    cartOpen: 'theme:cart:open',
    variantChanged: 'theme:variant:changed',
    quickviewOpened: 'theme:quickview:opened',
    filtersUpdated: 'theme:filters:updated',
    searchOpened: 'theme:search:opened',
    dialogOpened: 'theme:dialog:opened',
    dialogClosed: 'theme:dialog:closed',
    sectionLoaded: 'theme:section:load',
    blockSelected: 'theme:block:select',
    blockDeselected: 'theme:block:deselect',
  });

  function emit(name, detail = {}, target = document) {
    target.dispatchEvent(new CustomEvent(name, { bubbles: true, composed: true, detail }));
  }

  function on(name, handler, target = document) {
    target.addEventListener(name, handler);
    return () => target.removeEventListener(name, handler);
  }

  /* -------------------------------------------------------------
     Small utilities
  ------------------------------------------------------------- */
  function debounce(fn, wait = 250) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), wait);
    };
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function prefersReducedMotion() {
    return reducedMotion.matches;
  }

  function announce(message) {
    const region = document.getElementById('LilacLiveRegion');
    if (!region || !message) return;
    // Clear first so repeated identical messages are read again.
    region.textContent = '';
    window.setTimeout(() => {
      region.textContent = message;
    }, 60);
  }

  function parseHTML(html) {
    return new DOMParser().parseFromString(html, 'text/html');
  }

  /* -------------------------------------------------------------
     Network
  ------------------------------------------------------------- */
  class ThemeRequestError extends Error {
    constructor(message, { status = 0, data = null } = {}) {
      super(message);
      this.name = 'ThemeRequestError';
      this.status = status;
      this.data = data;
    }
  }

  async function fetchJSON(url, options = {}) {
    let response;
    try {
      response = await fetch(url, {
        credentials: 'same-origin',
        ...options,
        headers: { Accept: 'application/json', ...(options.headers || {}) },
      });
    } catch (error) {
      if (error.name === 'AbortError') throw error;
      throw new ThemeRequestError(config.strings?.networkError || 'Network error');
    }

    let data = null;
    const text = await response.text();
    if (text) {
      try {
        data = JSON.parse(text);
      } catch (error) {
        data = null;
      }
    }

    if (!response.ok || (data && data.status && data.status >= 400)) {
      const message =
        (data && (data.description || data.message || data.errors)) ||
        config.strings?.cartError ||
        response.statusText;
      throw new ThemeRequestError(typeof message === 'string' ? message : JSON.stringify(message), {
        status: response.status,
        data,
      });
    }
    return data;
  }

  /* -------------------------------------------------------------
     Section Rendering API
  ------------------------------------------------------------- */
  const sections = {
    /**
     * Fetch rendered HTML for up to five sections.
     * @param {string[]} ids section ids (section.id, not type)
     * @param {string} [url] page URL to render the sections for
     * @returns {Promise<Record<string, string>>}
     */
    async fetch(ids, url = window.location.pathname + window.location.search, options = {}) {
      const target = new URL(url, window.location.origin);
      target.searchParams.set('sections', ids.join(','));
      return fetchJSON(target.toString(), options);
    },

    /** Fetch one section and return its parsed document. */
    async fetchOne(id, url, options = {}) {
      const target = new URL(url || window.location.href, window.location.origin);
      target.searchParams.set('section_id', id);
      const response = await fetch(target.toString(), { credentials: 'same-origin', ...options });
      if (!response.ok) throw new ThemeRequestError(config.strings?.cartError || 'Error', { status: response.status });
      return parseHTML(await response.text());
    },

    /**
     * Replace elements on the page with their counterparts from rendered HTML.
     * Each entry: { html, selector } where selector matches in both documents.
     */
    replace(entries) {
      for (const { html, selector } of entries) {
        if (!html) continue;
        const source = parseHTML(html).querySelector(selector);
        const target = document.querySelector(selector);
        if (source && target) target.replaceWith(source);
      }
    },
  };

  /* -------------------------------------------------------------
     Cart Ajax API
     Each call can request sections to render in the same round trip.
     Listeners receive { action, cart?, items?, sections, source }.
  ------------------------------------------------------------- */
  function sectionIdsForCart() {
    return Array.from(document.querySelectorAll('[data-cart-section]'))
      .map((element) => element.dataset.cartSection)
      .filter((value, index, list) => value && list.indexOf(value) === index)
      .slice(0, 5);
  }

  async function cartRequest(url, body, action, source) {
    const sectionIds = sectionIdsForCart();

    if (body instanceof FormData) {
      if (sectionIds.length) {
        body.append('sections', sectionIds.join(','));
        body.append('sections_url', window.location.pathname);
      }
    } else if (sectionIds.length) {
      body.sections = sectionIds.join(',');
      body.sections_url = window.location.pathname;
    }

    try {
      const data = await fetchJSON(url, {
        method: 'POST',
        headers: body instanceof FormData ? { 'X-Requested-With': 'XMLHttpRequest' } : { 'Content-Type': 'application/json' },
        body: body instanceof FormData ? body : JSON.stringify(body),
      });
      // /cart/add.js returns the added item (or { items }); change and update return the cart.
      const isCart = Boolean(data && data.token);
      let items = null;
      if (!isCart && data) items = Array.isArray(data.items) ? data.items : data.id ? [data] : null;

      emit(events.cartUpdated, {
        action,
        source,
        cart: isCart ? data : null,
        items,
        sections: (data && data.sections) || {},
      });
      return data;
    } catch (error) {
      emit(events.cartError, { action, source, message: error.message, status: error.status });
      throw error;
    }
  }

  const cart = {
    /** Add items. Accepts FormData from a product form or { items: [...] }. */
    add(body, source = null) {
      return cartRequest(`${config.routes.cartAdd}.js`, body, 'add', source);
    },

    /** Change one line by its 1-based index or key. */
    change({ line, id, quantity, properties, selling_plan }, source = null) {
      const body = { quantity };
      if (line) body.line = line;
      if (id) body.id = id;
      if (properties) body.properties = properties;
      if (selling_plan !== undefined) body.selling_plan = selling_plan;
      return cartRequest(`${config.routes.cartChange}.js`, body, 'change', source);
    },

    /** Update note, attributes, discount codes, or many quantities. */
    update(body, source = null) {
      return cartRequest(`${config.routes.cartUpdate}.js`, body, 'update', source);
    },

    /** Read the cart without changing it. */
    get() {
      return fetchJSON(`${config.routes.cart}.js`);
    },

    /** Re-render cart sections without a change (after an external update). */
    async refresh(source = null) {
      const ids = sectionIdsForCart();
      const [data, rendered] = await Promise.all([
        cart.get(),
        ids.length ? sections.fetch(ids) : Promise.resolve({}),
      ]);
      emit(events.cartUpdated, { action: 'refresh', source, cart: data, items: null, sections: rendered || {} });
      return data;
    },
  };

  /* -------------------------------------------------------------
     Money formatting (mirrors shop.money_format placeholders)
  ------------------------------------------------------------- */
  function formatMoney(cents, format = config.currencyCodeEnabled ? config.moneyWithCurrencyFormat : config.moneyFormat) {
    const value = typeof cents === 'string' ? Number(cents.replace(/[^0-9-]/g, '')) : Math.round(Number(cents) || 0);
    const placeholder = /\{\{\s*(\w+)\s*\}\}/;
    const template = format || '${{amount}}';

    function group(number, decimals, thousands = ',', decimal = '.') {
      const fixed = (number / 100).toFixed(decimals);
      const [whole, fraction] = fixed.split('.');
      const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, thousands);
      return fraction ? `${grouped}${decimal}${fraction}` : grouped;
    }

    const match = template.match(placeholder);
    const style = match ? match[1] : 'amount';
    const formatters = {
      amount: () => group(value, 2),
      amount_no_decimals: () => group(value, 0),
      amount_with_comma_separator: () => group(value, 2, '.', ','),
      amount_no_decimals_with_comma_separator: () => group(value, 0, '.', ','),
      amount_with_apostrophe_separator: () => group(value, 2, "'", '.'),
      amount_no_decimals_with_space_separator: () => group(value, 0, ' ', ','),
      amount_with_space_separator: () => group(value, 2, ' ', ','),
      amount_with_period_and_space_separator: () => group(value, 2, ' ', '.'),
    };
    const formatted = (formatters[style] || formatters.amount)();
    return template.replace(placeholder, formatted);
  }

  /* -------------------------------------------------------------
     Scroll lock (shared by dialogs, drawers, menus)
  ------------------------------------------------------------- */
  const scrollLocks = new Set();

  function lockScroll(owner) {
    scrollLocks.add(owner);
    root.classList.add('is-locked');
  }

  function unlockScroll(owner) {
    scrollLocks.delete(owner);
    if (scrollLocks.size === 0) root.classList.remove('is-locked');
  }

  const FOCUSABLE =
    'a[href], area[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), iframe, [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';

  function focusableIn(container) {
    return Array.from(container.querySelectorAll(FOCUSABLE)).filter(
      (element) => element.offsetParent !== null || element === document.activeElement
    );
  }

  /* -------------------------------------------------------------
     <lc-dialog>
     Wraps a native <dialog> so it gets top-layer stacking, inert
     background, and Escape handling from the browser. Adds open and
     close animations, scroll lock, trigger focus return, and events.

     Markup:
       <button data-dialog-open="CartDrawer" aria-haspopup="dialog">...</button>
       <lc-dialog id="CartDrawer">
         <dialog class="dialog dialog--drawer" aria-labelledby="...">
           ... <button data-dialog-close>...</button>
         </dialog>
       </lc-dialog>
  ------------------------------------------------------------- */
  class LcDialog extends HTMLElement {
    connectedCallback() {
      this.dialog = this.querySelector(':scope > dialog');
      if (!this.dialog || this.bound) return;
      this.bound = true;

      // data-persistent dialogs (the age check) close only through their own buttons.
      const persistent = this.hasAttribute('data-persistent');

      this.dialog.addEventListener('cancel', (event) => {
        event.preventDefault();
        if (!persistent) this.close();
      });

      // A click on the dialog element itself lands on the backdrop area.
      this.dialog.addEventListener('click', (event) => {
        if (event.target === this.dialog && !persistent) this.close();
      });

      this.addEventListener('click', (event) => {
        if (event.target.closest('[data-dialog-close]')) {
          event.preventDefault();
          this.close();
        }
      });
    }

    get isOpen() {
      return Boolean(this.dialog && this.dialog.open);
    }

    open(trigger = null) {
      if (!this.dialog || this.isOpen) return;
      this.trigger = trigger || document.activeElement;
      this.dialog.showModal();
      lockScroll(this);
      this.setTriggersExpanded(true);

      requestAnimationFrame(() => {
        this.dialog.classList.add('is-open');
        const preferred = this.dialog.querySelector('[autofocus], [data-dialog-focus]');
        (preferred || focusableIn(this.dialog)[0] || this.dialog).focus({ preventScroll: true });
      });

      emit(events.dialogOpened, { id: this.id, dialog: this });
    }

    close() {
      if (!this.isOpen || this.closing) return;
      this.closing = true;
      this.dialog.classList.remove('is-open');

      const finish = () => {
        this.dialog.close();
        this.closing = false;
        unlockScroll(this);
        this.setTriggersExpanded(false);
        if (this.trigger && this.trigger.isConnected) this.trigger.focus({ preventScroll: true });
        emit(events.dialogClosed, { id: this.id, dialog: this });
      };

      if (prefersReducedMotion()) {
        finish();
        return;
      }
      const duration = parseFloat(getComputedStyle(this.dialog).transitionDuration) || 0;
      if (duration === 0) {
        finish();
        return;
      }
      let done = false;
      const once = () => {
        if (done) return;
        done = true;
        finish();
      };
      this.dialog.addEventListener('transitionend', once, { once: true });
      window.setTimeout(once, duration * 1000 + 80);
    }

    toggle(trigger) {
      if (this.isOpen) this.close();
      else this.open(trigger);
    }

    setTriggersExpanded(expanded) {
      document.querySelectorAll(`[data-dialog-open="${this.id}"][aria-expanded]`).forEach((element) => {
        element.setAttribute('aria-expanded', String(expanded));
      });
    }

    disconnectedCallback() {
      unlockScroll(this);
    }
  }

  if (!customElements.get('lc-dialog')) customElements.define('lc-dialog', LcDialog);

  const dialogs = {
    get(id) {
      const element = document.getElementById(id);
      return element instanceof LcDialog ? element : null;
    },
    open(id, trigger) {
      dialogs.get(id)?.open(trigger);
    },
    close(id) {
      dialogs.get(id)?.close();
    },
  };

  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-dialog-open]');
    if (!trigger) return;
    const dialog = dialogs.get(trigger.dataset.dialogOpen);
    if (!dialog) return; // Without the dialog, links fall back to their href.
    event.preventDefault();
    dialog.toggle(trigger);
  });

  /* -------------------------------------------------------------
     <lc-back-to-top>
  ------------------------------------------------------------- */
  class LcBackToTop extends HTMLElement {
    connectedCallback() {
      this.hidden = false;
      this.button = this.querySelector('button');
      this.button.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
        document.getElementById('MainContent')?.focus({ preventScroll: true });
      });
      this.onScroll = () => {
        const visible = window.scrollY > window.innerHeight * 1.5;
        this.classList.toggle('is-visible', visible);
        this.button.tabIndex = visible ? 0 : -1;
      };
      this.onScroll();
      window.addEventListener('scroll', this.onScroll, { passive: true });
    }

    disconnectedCallback() {
      window.removeEventListener('scroll', this.onScroll);
    }
  }

  if (!customElements.get('lc-back-to-top')) customElements.define('lc-back-to-top', LcBackToTop);

  /* -------------------------------------------------------------
     <lc-localization>: submits the country/language form on change.
     A visible submit button covers browsers without JavaScript.
  ------------------------------------------------------------- */
  class LcLocalization extends HTMLElement {
    connectedCallback() {
      const form = this.querySelector('form');
      if (!form) return;
      this.querySelectorAll('select').forEach((select) => {
        select.addEventListener('change', () => {
          if (form.requestSubmit) form.requestSubmit();
          else form.submit();
        });
      });
    }
  }

  if (!customElements.get('lc-localization')) customElements.define('lc-localization', LcLocalization);

  /* -------------------------------------------------------------
     Scroll reveal for [data-reveal]
  ------------------------------------------------------------- */
  let revealObserver = null;

  function observeReveals(scope = document) {
    if (!revealObserver) return;
    scope.querySelectorAll('[data-reveal]:not(.is-revealed)').forEach((element) => {
      revealObserver.observe(element);
    });
  }

  function setupReveal() {
    const enabled = config.animations && !config.designMode && !prefersReducedMotion() && 'IntersectionObserver' in window;
    if (!enabled) return;
    root.classList.add('reveal-on');
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-revealed');
          revealObserver.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 }
    );
    observeReveals();
  }

  /* -------------------------------------------------------------
     Analytics: custom events for Shopify Customer Events (web pixels).
     Standard events (page_viewed, product_viewed, product_added_to_cart,
     search_submitted, collection_viewed, ...) are published by Shopify.
  ------------------------------------------------------------- */
  function track(name, payload = {}) {
    try {
      window.Shopify?.analytics?.publish?.(`lilac_${name}`, payload);
    } catch (error) {
      /* analytics must never break the storefront */
    }
  }

  /* -------------------------------------------------------------
     Customer privacy
     Personalization (recently viewed) runs only when the shopper allows
     preference cookies through Shopify's consent banner. Stores without
     a banner or region that needs consent report "allowed".
  ------------------------------------------------------------- */
  let privacyReady = null;

  function loadPrivacy() {
    if (!privacyReady) {
      privacyReady = new Promise((resolve) => {
        if (window.Shopify?.customerPrivacy) return resolve(window.Shopify.customerPrivacy);
        if (!window.Shopify?.loadFeatures) return resolve(null);
        window.Shopify.loadFeatures([{ name: 'consent-tracking-api', version: '0.1' }], (error) => {
          resolve(error ? null : window.Shopify.customerPrivacy || null);
        });
      });
    }
    return privacyReady;
  }

  const privacy = {
    async preferencesAllowed() {
      const api = await loadPrivacy();
      if (!api?.preferencesProcessingAllowed) return true;
      return api.preferencesProcessingAllowed();
    },
  };

  // Theme interactions Shopify doesn't publish itself, for Customer Events pixels.
  on(events.quickviewOpened, (event) => track('quick_view_opened', { productId: event.detail.productId, url: event.detail.productUrl }));
  on(events.filtersUpdated, (event) => track('filters_updated', { url: event.detail.url }));
  on(events.searchOpened, () => track('search_opened'));
  on(events.cartError, (event) => track('cart_error', { action: event.detail.action, status: event.detail.status }));

  /* -------------------------------------------------------------
     Theme editor bridge
     Re-dispatches editor events as theme:* events so components can
     open the right slide, drawer, or tab for the selected block.
  ------------------------------------------------------------- */
  if (config.designMode) {
    document.addEventListener('shopify:section:load', (event) => {
      observeReveals(event.target);
      emit(events.sectionLoaded, { sectionId: event.detail.sectionId }, event.target);
    });
    document.addEventListener('shopify:section:unload', () => {
      // Dialogs inside removed sections release their scroll lock on disconnect.
    });
    document.addEventListener('shopify:block:select', (event) => {
      emit(events.blockSelected, { blockId: event.detail.blockId, sectionId: event.detail.sectionId }, event.target);
    });
    document.addEventListener('shopify:block:deselect', (event) => {
      emit(events.blockDeselected, { blockId: event.detail.blockId, sectionId: event.detail.sectionId }, event.target);
    });
  }

  /* -------------------------------------------------------------
     Quick add from product cards (single-variant products).
     Products with options use [data-quick-view] links instead.
  ------------------------------------------------------------- */
  document.addEventListener('submit', async (event) => {
    const form = event.target.closest('form[data-quick-add-form]');
    if (!form) return;
    event.preventDefault();

    const button = event.submitter || form.querySelector('[type="submit"]');
    if (button?.classList.contains('is-loading')) return;
    button?.classList.add('is-loading');
    button?.setAttribute('aria-disabled', 'true');

    try {
      await cart.add(new FormData(form), form);
      if (config.cartType === 'page') window.location.href = config.routes.cart;
    } catch (error) {
      announce(error.message);
    } finally {
      button?.classList.remove('is-loading');
      button?.removeAttribute('aria-disabled');
    }
  });

  /* -------------------------------------------------------------
     Default cart feedback (cart.js replaces this when loaded)
  ------------------------------------------------------------- */
  on(events.cartUpdated, (event) => {
    if (event.defaultPrevented || event.detail.announced) return;
    const { action, items } = event.detail;
    if (action === 'add' && items && items[0]) {
      announce((config.strings?.cartAdded || '').replace('[title]', items[0].product_title || items[0].title || ''));
    } else if (action !== 'refresh') {
      announce(config.strings?.cartUpdated);
    }
  });

  /* -------------------------------------------------------------
     Public API
  ------------------------------------------------------------- */
  window.Lilac = Object.assign(window.Lilac || {}, {
    config,
    events,
    emit,
    on,
    debounce,
    announce,
    parseHTML,
    prefersReducedMotion,
    fetchJSON,
    ThemeRequestError,
    sections,
    cart,
    formatMoney,
    lockScroll,
    unlockScroll,
    focusableIn,
    dialogs,
    observeReveals,
    privacy,
    track,
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupReveal, { once: true });
  } else {
    setupReveal();
  }
})();
