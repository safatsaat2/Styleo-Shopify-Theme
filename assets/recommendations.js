/*
  <lc-recommendations data-url="..." data-target="selector">
  Loads Product Recommendations API results when the element nears the
  viewport and swaps in the matching content. Hides itself when there is
  nothing to recommend.
*/
(() => {
  if (customElements.get('lc-recommendations')) return;

  class LcRecommendations extends HTMLElement {
    connectedCallback() {
      if (this.loaded) return;
      this.observer = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          this.observer.disconnect();
          this.load();
        },
        { rootMargin: '0px 0px 400px 0px' }
      );
      this.observer.observe(this);
    }

    disconnectedCallback() {
      this.observer?.disconnect();
    }

    async load() {
      this.loaded = true;
      try {
        const response = await fetch(this.dataset.url);
        if (!response.ok) throw new Error(String(response.status));
        const doc = window.Lilac.parseHTML(await response.text());
        const selector = this.dataset.target;
        const next = doc.querySelector(selector);
        const current = this.querySelector(selector);
        if (!next || !next.innerHTML.trim()) {
          this.hidden = true;
          return;
        }
        if (current) current.replaceWith(next);
        window.Lilac.observeReveals?.(this);
      } catch (error) {
        this.hidden = true;
      }
    }
  }

  customElements.define('lc-recommendations', LcRecommendations);
})();
