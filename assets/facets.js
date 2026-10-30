/*
  <lc-facets> collection and search results.

  - Filter and sort forms submit through the Section Rendering API; every
    [data-facets-region] is swapped with its counterpart from the response.
  - Links marked [data-facet-link] (remove filter, clear all, page numbers)
    load the same way. Browser back and forward restore earlier states.
  - "Load more" and infinite scroll append the next page to the grid.
  - Grid size buttons switch between comfortable and compact columns.
  - Emits theme:filters:updated after each update.

  Every control is a real form or link, so the page works without JavaScript.
*/
(() => {
  const { Lilac } = window;
  if (!Lilac || customElements.get('lc-facets')) return;

  const DENSITY_KEY = 'lilac-grid-density';

  class LcFacets extends HTMLElement {
    connectedCallback() {
      this.sectionId = this.dataset.sectionId;
      this.mode = this.dataset.pagination || 'pages';

      this.addEventListener('change', (event) => {
        const form = event.target.closest('form[data-facets-form], form[data-sort-form]');
        if (!form || event.target.type === 'number') return;
        this.submitForm(form);
      });

      this.debouncedPrice = Lilac.debounce((form) => this.submitForm(form), 700);
      this.addEventListener('input', (event) => {
        if (event.target.type === 'number' && event.target.closest('form[data-facets-form]')) {
          this.debouncedPrice(event.target.form);
        }
      });

      this.addEventListener('submit', (event) => {
        const form = event.target.closest('form[data-facets-form], form[data-sort-form]');
        if (!form) return;
        event.preventDefault();
        this.submitForm(form);
      });

      this.addEventListener('click', (event) => this.onClick(event));

      this.onPopState = (event) => {
        if (event.state && event.state.lilacFacets === this.sectionId) {
          this.render(window.location.href, { push: false });
        }
      };
      window.addEventListener('popstate', this.onPopState);
      window.history.replaceState({ ...(window.history.state || {}), lilacFacets: this.sectionId }, '');

      this.applyDensity(this.storedDensity());
      this.setupInfinite();
    }

    disconnectedCallback() {
      window.removeEventListener('popstate', this.onPopState);
      this.infiniteObserver?.disconnect();
    }

    onClick(event) {
      const link = event.target.closest('a[data-facet-link]');
      if (link && this.contains(link)) {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.button === 1) return;
        event.preventDefault();
        this.render(link.href);
        return;
      }

      const more = event.target.closest('a[data-load-more]');
      if (more && this.contains(more)) {
        event.preventDefault();
        this.loadMore(more, true);
        return;
      }

      const toggle = event.target.closest('[data-facet-more]');
      if (toggle) {
        const panel = toggle.closest('.facet__panel');
        panel.classList.add('is-expanded');
        toggle.setAttribute('aria-expanded', 'true');
        toggle.hidden = true;
        panel.querySelector('.facet__value--extra input:not(:disabled)')?.focus();
        return;
      }

      const density = event.target.closest('[data-density]');
      if (density) {
        this.applyDensity(density.dataset.density);
        try {
          localStorage.setItem(DENSITY_KEY, density.dataset.density);
        } catch (error) {
          /* storage unavailable */
        }
      }
    }

    urlFromForm(form) {
      const params = new URLSearchParams();
      for (const [key, value] of new FormData(form).entries()) {
        if (value !== '') params.append(key, value);
      }
      const url = new URL(form.getAttribute('action') || window.location.pathname, window.location.origin);
      url.search = params.toString();
      return url.toString();
    }

    submitForm(form) {
      this.render(this.urlFromForm(form));
    }

    sectionUrl(url) {
      const target = new URL(url, window.location.origin);
      target.searchParams.set('section_id', this.sectionId);
      return target.toString();
    }

    captureState() {
      const open = {};
      this.querySelectorAll('[data-facets-region]').forEach((region) => {
        open[region.dataset.facetsRegion] = Array.from(region.querySelectorAll('details')).map((details) => details.open);
      });
      const active = document.activeElement;
      return {
        open,
        focusId: active && this.contains(active) ? active.id : null,
        drawerScroll: this.querySelector('.facets-drawer__body')?.scrollTop || 0,
      };
    }

    restoreState(state) {
      Object.entries(state.open).forEach(([key, values]) => {
        const region = this.querySelector(`[data-facets-region="${key}"]`);
        if (!region) return;
        region.querySelectorAll('details').forEach((details, index) => {
          if (values[index] !== undefined) details.open = values[index];
        });
      });
      const drawerBody = this.querySelector('.facets-drawer__body');
      if (drawerBody) drawerBody.scrollTop = state.drawerScroll;
      if (state.focusId) document.getElementById(state.focusId)?.focus({ preventScroll: true });
    }

    async render(url, { push = true } = {}) {
      this.abort?.abort();
      this.abort = new AbortController();
      const state = this.captureState();
      this.classList.add('is-loading');
      this.setAttribute('aria-busy', 'true');

      try {
        const response = await fetch(this.sectionUrl(url), { signal: this.abort.signal });
        if (!response.ok) throw new Error(String(response.status));
        const doc = Lilac.parseHTML(await response.text());

        this.querySelectorAll('[data-facets-region]').forEach((region) => {
          const next = doc.querySelector(`[data-facets-region="${region.dataset.facetsRegion}"]`);
          if (next) region.replaceWith(next);
        });

        this.restoreState(state);
        this.applyDensity(this.storedDensity());
        this.setupInfinite();
        Lilac.observeReveals?.(this);

        if (push) {
          const clean = new URL(url, window.location.origin);
          clean.searchParams.delete('section_id');
          window.history.pushState({ lilacFacets: this.sectionId }, '', clean.toString());
        }

        const count = this.querySelector('[data-facets-region="count"]');
        if (count) Lilac.announce(count.textContent.trim());
        Lilac.emit(Lilac.events.filtersUpdated, { sectionId: this.sectionId, url }, this);
      } catch (error) {
        if (error.name !== 'AbortError') window.location.href = url;
      } finally {
        this.classList.remove('is-loading');
        this.removeAttribute('aria-busy');
      }
    }

    async loadMore(link, focusNew) {
      if (this.loadingMore) return;
      this.loadingMore = true;
      link.classList.add('is-loading');

      try {
        const response = await fetch(this.sectionUrl(link.href));
        if (!response.ok) throw new Error(String(response.status));
        const doc = Lilac.parseHTML(await response.text());
        const grid = this.querySelector('[data-results-grid]');
        const nextItems = Array.from(doc.querySelectorAll('[data-results-grid] > [data-grid-item]'));
        const firstNew = nextItems[0];
        nextItems.forEach((item) => grid.append(item));

        const pagination = this.querySelector('[data-facets-region="pagination"]');
        const nextPagination = doc.querySelector('[data-facets-region="pagination"]');
        if (pagination && nextPagination) pagination.replaceWith(nextPagination);

        Lilac.observeReveals?.(this);
        this.setupInfinite();
        const progress = this.querySelector('.pagination__progress-text');
        if (progress) Lilac.announce(progress.textContent.trim());
        if (focusNew && firstNew) firstNew.querySelector('a.card__link, a')?.focus({ preventScroll: true });
      } catch (error) {
        window.location.href = link.href;
      } finally {
        this.loadingMore = false;
        link.classList.remove('is-loading');
      }
    }

    setupInfinite() {
      this.infiniteObserver?.disconnect();
      if (this.mode !== 'infinite') return;
      const trigger = this.querySelector('a[data-infinite]');
      if (!trigger) return;
      this.infiniteObserver = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) this.loadMore(trigger, false);
        },
        { rootMargin: '0px 0px 600px 0px' }
      );
      this.infiniteObserver.observe(trigger);
    }

    storedDensity() {
      try {
        return localStorage.getItem(DENSITY_KEY) || 'comfortable';
      } catch (error) {
        return 'comfortable';
      }
    }

    applyDensity(density) {
      const grid = this.querySelector('[data-results-grid]');
      const columns = Number(this.dataset.columns) || 4;
      const mobileColumns = Number(this.dataset.columnsMobile) || 2;
      if (grid) {
        if (density === 'compact') {
          grid.style.setProperty('--cols', String(Math.min(columns + 1, 6)));
          grid.style.setProperty('--cols-mobile', String(mobileColumns === 1 ? 2 : 3));
          grid.classList.add('results-grid--compact');
        } else {
          grid.style.setProperty('--cols', String(columns));
          grid.style.setProperty('--cols-mobile', String(mobileColumns));
          grid.classList.remove('results-grid--compact');
        }
      }
      this.querySelectorAll('[data-density]').forEach((button) => {
        button.setAttribute('aria-pressed', String(button.dataset.density === density));
      });
    }
  }

  /* Keeps the two price inputs in order */
  class LcPriceRange extends HTMLElement {
    connectedCallback() {
      const [min, max] = this.querySelectorAll('input');
      if (!min || !max) return;
      const limit = Number(this.dataset.max) || Infinity;
      this.addEventListener('change', () => {
        if (Number(min.value) > limit) min.value = limit;
        if (Number(max.value) > limit) max.value = limit;
        if (min.value && max.value && Number(min.value) > Number(max.value)) {
          [min.value, max.value] = [max.value, min.value];
        }
      });
    }
  }

  customElements.define('lc-facets', LcFacets);
  customElements.define('lc-price-range', LcPriceRange);
})();
