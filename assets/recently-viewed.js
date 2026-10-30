/*
  <lc-recently-viewed>  products this shopper viewed, newest first.

  product.js saves product ids in localStorage (lilac-recently-viewed).
  Runs only when the shopper allows preference cookies.
  This element renders its own section on the search page with an
  `id:` query, keeps the saved order, and stays hidden when empty.
*/
(() => {
  const { Lilac } = window;
  if (!Lilac || customElements.get('lc-recently-viewed')) return;

  const STORAGE_KEY = 'lilac-recently-viewed';
  // Rendered by file name: instance ids only resolve on their own template.
  const SECTION_FILE = 'recently-viewed';

  function readIds() {
    try {
      const list = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(list) ? list.filter((id) => typeof id === 'number') : [];
    } catch (error) {
      return [];
    }
  }

  class LcRecentlyViewed extends HTMLElement {
    connectedCallback() {
      this.querySelector('[data-recently-viewed-clear]')?.addEventListener('click', () => this.clear());
      if (window.Shopify?.designMode) return;
      this.load();
    }

    async load() {
      if (!(await Lilac.privacy?.preferencesAllowed?.() ?? true)) return;
      const exclude = Number(this.dataset.exclude);
      const limit = Number(this.dataset.limit) || 4;
      const ids = readIds().filter((id) => id !== exclude).slice(0, limit);
      if (!ids.length) return;

      const url = new URL(Lilac.config.routes.search, window.location.origin);
      url.searchParams.set('q', ids.map((id) => `id:${id}`).join(' OR '));
      url.searchParams.set('type', 'product');
      url.searchParams.set('options[prefix]', 'none');

      try {
        const doc = await Lilac.sections.fetchOne(SECTION_FILE, url.pathname + url.search);
        const items = Array.from(doc.querySelectorAll('[data-recently-viewed-list] > [data-product-id]'));
        if (!items.length) return;

        // Search results come back in relevance order; restore viewing order.
        items.sort((a, b) => ids.indexOf(Number(a.dataset.productId)) - ids.indexOf(Number(b.dataset.productId)));
        this.querySelector('[data-recently-viewed-list]').replaceChildren(...items);
        this.hidden = false;
        Lilac.observeReveals?.(this);
      } catch (error) {
        /* Leave the section hidden when the lookup fails. */
      }
    }

    clear() {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        /* storage unavailable */
      }
      if (window.Shopify?.designMode) return;
      this.hidden = true;
      Lilac.announce(Lilac.config.strings?.recentlyCleared);
    }
  }

  customElements.define('lc-recently-viewed', LcRecentlyViewed);
})();
