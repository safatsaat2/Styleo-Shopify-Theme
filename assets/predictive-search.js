/*
  <lc-predictive-search>
  Combobox search field that renders the predictive-search section through
  the Predictive Search API. Arrow keys move through results with
  aria-activedescendant; Enter opens the highlighted result.
*/
(() => {
  if (customElements.get('lc-predictive-search')) return;

  const SECTION_ID = 'predictive-search';
  const RESOURCE_TYPES = 'product,collection,query,page,article';

  class LcPredictiveSearch extends HTMLElement {
    connectedCallback() {
      this.enabled = this.dataset.enabled === 'true';
      this.input = this.querySelector('input[type="search"]');
      this.form = this.querySelector('form');
      this.results = this.querySelector('[data-predictive-results]');
      this.status = this.querySelector('[data-predictive-status]');
      this.resetButton = this.querySelector('button[type="reset"]');
      this.cache = new Map();
      this.activeIndex = -1;

      this.input.addEventListener('input', () => this.onInput());
      this.input.addEventListener('keydown', (event) => this.onKeydown(event));
      this.form.addEventListener('reset', () => {
        window.setTimeout(() => {
          this.onInput();
          this.input.focus();
        });
      });
      this.form.addEventListener('submit', (event) => {
        if (!this.input.value.trim()) event.preventDefault();
      });

      this.results.addEventListener('pointermove', (event) => {
        const option = event.target.closest('[role="option"]');
        if (option) this.select(this.options.indexOf(option), false);
      });

      document.addEventListener('theme:dialog:opened', (event) => {
        if (event.detail.id !== this.closest('lc-dialog')?.id) return;
        window.Lilac?.emit(window.Lilac.events.searchOpened, { source: 'header' });
        if (this.input.value.trim()) this.onInput();
      });

      this.search = window.Lilac.debounce((terms) => this.fetchResults(terms), 220);
      this.updateReset();
    }

    get options() {
      return Array.from(this.results.querySelectorAll('[role="option"]'));
    }

    onInput() {
      const terms = this.input.value.trim();
      this.updateReset();
      if (!this.enabled) return;
      if (!terms) {
        this.abort?.abort();
        this.clear();
        return;
      }
      this.search(terms);
    }

    updateReset() {
      if (this.resetButton) this.resetButton.hidden = this.input.value.length === 0;
    }

    async fetchResults(terms) {
      if (this.cache.has(terms)) {
        this.render(this.cache.get(terms));
        return;
      }

      this.abort?.abort();
      this.abort = new AbortController();
      this.results.querySelector('.predictive')?.classList.add('is-loading');

      const url = new URL(this.dataset.resultsUrl, window.location.origin);
      url.searchParams.set('q', terms);
      url.searchParams.set('section_id', SECTION_ID);
      url.searchParams.set('resources[type]', RESOURCE_TYPES);
      url.searchParams.set('resources[limit]', '8');
      url.searchParams.set('resources[limit_scope]', 'each');
      url.searchParams.set('resources[options][prefix]', 'last');

      try {
        const response = await fetch(url.toString(), { signal: this.abort.signal });
        if (!response.ok) throw new Error(String(response.status));
        const doc = window.Lilac.parseHTML(await response.text());
        const html = doc.getElementById(`shopify-section-${SECTION_ID}`)?.innerHTML || '';
        this.cache.set(terms, html);
        // Ignore responses for terms the customer already changed.
        if (this.input.value.trim() === terms) this.render(html);
      } catch (error) {
        if (error.name !== 'AbortError') this.clear();
      }
    }

    render(html) {
      this.results.innerHTML = html;
      this.activeIndex = -1;
      this.input.removeAttribute('aria-activedescendant');
      this.classList.add('has-results');
      this.input.setAttribute('aria-expanded', 'true');
      const summary = this.results.querySelector('[data-predictive-count]');
      if (summary && this.status) this.status.textContent = summary.dataset.predictiveCount;
    }

    clear() {
      this.results.innerHTML = '';
      this.classList.remove('has-results');
      this.input.setAttribute('aria-expanded', 'false');
      this.input.removeAttribute('aria-activedescendant');
      this.activeIndex = -1;
      if (this.status) this.status.textContent = '';
    }

    onKeydown(event) {
      const options = this.options;
      if (!options.length) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          this.select(this.activeIndex + 1 >= options.length ? 0 : this.activeIndex + 1);
          break;
        case 'ArrowUp':
          event.preventDefault();
          this.select(this.activeIndex - 1 < 0 ? options.length - 1 : this.activeIndex - 1);
          break;
        case 'Enter': {
          const active = options[this.activeIndex];
          if (active) {
            event.preventDefault();
            active.querySelector('a')?.click();
          }
          break;
        }
        default:
          break;
      }
    }

    select(index, scroll = true) {
      const options = this.options;
      options.forEach((option, i) => option.setAttribute('aria-selected', String(i === index)));
      this.activeIndex = index;
      const active = options[index];
      if (!active) return;
      this.input.setAttribute('aria-activedescendant', active.id);
      if (scroll) active.scrollIntoView({ block: 'nearest' });
    }
  }

  customElements.define('lc-predictive-search', LcPredictiveSearch);
})();
