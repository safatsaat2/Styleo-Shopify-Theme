/*
  Content page helpers.
  <lc-toc>     builds a table of contents from h2 and h3 headings in the
               target element. Stays hidden with fewer than two headings.
  <lc-faq>     filters FAQ questions as the customer types.
  <lc-prefill> fills form fields marked [data-prefill="param"] from the
               page URL, for example ?product=Linen+shirt.
*/
(() => {
  if (customElements.get('lc-toc')) return;

  const slug = (text) =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^\p{L}\p{N}]+/gu, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60);

  class LcToc extends HTMLElement {
    connectedCallback() {
      const target = document.querySelector(this.dataset.target);
      const list = this.querySelector('[data-toc-list]');
      if (!target || !list) return;
      const headings = Array.from(target.querySelectorAll('h2, h3'));
      if (headings.length < 2) return;

      const used = new Set();
      headings.forEach((heading) => {
        if (!heading.id) {
          let id = slug(heading.textContent) || 'section';
          while (used.has(id) || document.getElementById(id)) id = `${id}-${used.size + 1}`;
          heading.id = id;
        }
        used.add(heading.id);
        const item = document.createElement('li');
        item.className = `article__toc-item article__toc-item--${heading.tagName.toLowerCase()}`;
        const link = document.createElement('a');
        link.href = `#${heading.id}`;
        link.textContent = heading.textContent.trim();
        item.append(link);
        list.append(item);
      });
      this.hidden = false;

      // Highlight the section in view.
      const links = Array.from(list.querySelectorAll('a'));
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            links.forEach((link) => link.removeAttribute('aria-current'));
            list.querySelector(`a[href="#${CSS.escape(entry.target.id)}"]`)?.setAttribute('aria-current', 'location');
          });
        },
        { rootMargin: '0px 0px -70% 0px' }
      );
      headings.forEach((heading) => observer.observe(heading));
    }
  }

  class LcFaq extends HTMLElement {
    connectedCallback() {
      const input = this.querySelector('[data-faq-search]');
      const status = this.querySelector('[data-faq-status]');
      if (!input) return;
      const items = Array.from(this.querySelectorAll('[data-faq-item]'));
      const groups = Array.from(this.querySelectorAll('.faq__group'));
      const template = status?.dataset.template || '';

      const filter = window.Lilac?.debounce
        ? window.Lilac.debounce(() => this.apply(input, items, groups, status, template), 150)
        : () => this.apply(input, items, groups, status, template);
      input.addEventListener('input', filter);
    }

    apply(input, items, groups, status) {
      const query = input.value.trim().toLowerCase();
      let matches = 0;
      items.forEach((item) => {
        const match = !query || item.textContent.toLowerCase().includes(query);
        item.hidden = !match;
        if (match) matches += 1;
        if (query && match) item.open = true;
      });
      groups.forEach((group) => {
        const visible = group.querySelector('[data-faq-item]:not([hidden])');
        group.hidden = !visible;
      });
      if (status) {
        const strings = window.Lilac?.config.strings || {};
        status.textContent = query ? (matches ? (strings.faqResults || '').replace('[count]', matches) : strings.faqNoResults || '') : '';
      }
    }
  }

  class LcPrefill extends HTMLElement {
    connectedCallback() {
      const params = new URLSearchParams(window.location.search);
      this.querySelectorAll('[data-prefill]').forEach((field) => {
        const keys = field.dataset.prefill.split(',').map((key) => key.trim());
        const values = keys.map((key) => params.get(key)).filter(Boolean);
        if (values.length && !field.value) field.value = values.join(' / ');
      });
    }
  }

  customElements.define('lc-toc', LcToc);
  customElements.define('lc-faq', LcFaq);
  customElements.define('lc-prefill', LcPrefill);
})();
