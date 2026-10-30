/*
  Product page behavior.

  <lc-product>             coordinates a product's picker, form, and parts.
                           On option change it renders the matching variant
                           with the option_values parameter through the
                           Section Rendering API and swaps every
                           [data-product-part]. Emits theme:variant:changed.
  <lc-variant-picker>      reports selected option value ids.
  <lc-product-form>        adds to cart with Lilac.cart.add (gift wrap and
                           required personalization fields included).
  <lc-quantity>            stepper that follows quantity rules.
  <lc-gift-recipient>      gift card recipient fields.
  <lc-gift-wrap>           gift wrap checkbox and message.
  <lc-sticky-atc>          sticky add to cart bar.
  <lc-delivery-estimate>   business-day delivery window.
  <lc-pickup-availability> pickup locations for the selected variant.
  <lc-share>               device share sheet or copy link.
  <lc-bundle>              frequently bought together, added in one request.
*/
(() => {
  const { Lilac } = window;
  if (!Lilac || customElements.get('lc-product')) return;

  const RECENT_KEY = 'lilac-recently-viewed';

  /* -------------------------------------------------------------
     <lc-product>
  ------------------------------------------------------------- */
  class LcProduct extends HTMLElement {
    connectedCallback() {
      this.renderSection = this.dataset.renderSection;
      this.productUrl = this.dataset.productUrl;
      this.variantId = this.dataset.variantId;

      this.addEventListener('lc:option-change', (event) => this.onOptionChange(event.detail));
      this.addEventListener('change', (event) => {
        if (event.target.matches('[data-selling-plan]')) this.onSellingPlanChange(event.target);
      });

      this.applyFieldConditions();
      if (this.dataset.trackRecent === 'true') this.trackRecentlyViewed();
    }

    get form() {
      return this.querySelector('form[data-product-form]');
    }

    get selectedPlan() {
      return this.querySelector('[data-selling-plan]:checked')?.value || '';
    }

    onOptionChange({ valueIds, productUrl }) {
      if (productUrl && productUrl !== this.productUrl) {
        // Combined listings: the option belongs to another product.
        if (this.dataset.urlSync === 'true') {
          window.location.assign(productUrl);
          return;
        }
        this.productUrl = productUrl;
        this.render({ valueIds, replaceAll: true });
        return;
      }
      this.render({ valueIds });
    }

    onSellingPlanChange() {
      const valueIds = this.querySelector('lc-variant-picker')?.selectedValueIds || [];
      this.render({ valueIds });
    }

    async render({ valueIds = [], replaceAll = false }) {
      this.abort?.abort();
      this.abort = new AbortController();
      const previousVariantId = this.variantId;
      const focusKey = this.focusKey();

      const url = new URL(this.productUrl, window.location.origin);
      if (valueIds.length) url.searchParams.set('option_values', valueIds.join(','));
      if (this.selectedPlan) url.searchParams.set('selling_plan', this.selectedPlan);
      url.searchParams.set('section_id', this.renderSection);

      this.classList.add('is-loading');
      try {
        const response = await fetch(url.toString(), { signal: this.abort.signal });
        if (!response.ok) throw new Error(String(response.status));
        const doc = Lilac.parseHTML(await response.text());
        const source = doc.querySelector('lc-product');
        if (!source) return;

        if (replaceAll) {
          this.innerHTML = source.innerHTML;
        } else {
          this.querySelectorAll('[data-product-part]').forEach((part) => {
            if (part.closest('lc-product') !== this) return;
            const key = part.dataset.productPart;
            const next = source.querySelector(`[data-product-part="${key}"]`);
            if (next) part.replaceWith(next);
          });
        }

        this.variantId = source.dataset.variantId;
        this.dataset.variantId = this.variantId || '';
        this.restoreFocus(focusKey);
        this.applyFieldConditions();

        const mediaId = source.dataset.variantMediaId;
        if (mediaId) this.querySelector('lc-media-gallery')?.goToMedia(mediaId);

        if (this.dataset.urlSync === 'true' && this.variantId) {
          const pageUrl = new URL(window.location.href);
          pageUrl.searchParams.set('variant', this.variantId);
          window.history.replaceState(window.history.state, '', pageUrl.toString());
        }

        Lilac.emit(Lilac.events.variantChanged, {
          sectionId: this.dataset.sectionId,
          productId: this.dataset.productId,
          variantId: this.variantId,
          previousVariantId,
        }, this);
      } catch (error) {
        if (error.name !== 'AbortError') Lilac.announce(Lilac.config.strings.cartError);
      } finally {
        this.classList.remove('is-loading');
      }
    }

    focusKey() {
      const active = document.activeElement;
      if (!active || !this.contains(active)) return null;
      if (active.dataset.optionValueId) return `[data-option-value-id="${active.dataset.optionValueId}"]`;
      if (active.matches('[data-option-select]')) return `#${CSS.escape(active.id)}`;
      if (active.id) return `#${CSS.escape(active.id)}`;
      return null;
    }

    restoreFocus(selector) {
      if (!selector) return;
      const element = this.querySelector(selector);
      if (element) element.focus({ preventScroll: true });
    }

    /* Personalization fields that only apply to one option value */
    applyFieldConditions() {
      const picker = this.querySelector('lc-variant-picker');
      const selected = picker ? picker.selectedValuesByName : {};
      this.querySelectorAll('[data-show-when-option]').forEach((field) => {
        const option = field.dataset.showWhenOption.trim().toLowerCase();
        const expected = field.dataset.showWhenValue.trim().toLowerCase();
        const matches = (selected[option] || '').toLowerCase() === expected;
        field.hidden = !matches;
        field.querySelectorAll('input, select, textarea').forEach((input) => {
          input.disabled = !matches;
        });
      });
    }

    async trackRecentlyViewed() {
      if (!(await Lilac.privacy?.preferencesAllowed?.() ?? true)) return;
      try {
        const id = Number(this.dataset.productId);
        if (!id) return;
        const list = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]').filter((item) => item !== id && typeof item === 'number');
        list.unshift(id);
        localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 12)));
      } catch (error) {
        /* storage unavailable */
      }
    }
  }

  /* -------------------------------------------------------------
     <lc-variant-picker>
  ------------------------------------------------------------- */
  class LcVariantPicker extends HTMLElement {
    connectedCallback() {
      this.addEventListener('change', (event) => {
        const target = event.target;
        if (!target.matches('.variant-picker__input, [data-option-select]')) return;

        let productUrl = target.dataset.productUrl;
        if (target.matches('select')) {
          const option = target.selectedOptions[0];
          productUrl = option?.dataset.productUrl;
        }

        const legendValue = target.closest('fieldset')?.querySelector('.variant-picker__selected');
        if (legendValue && target.matches('input')) legendValue.textContent = target.value;

        this.dispatchEvent(
          new CustomEvent('lc:option-change', {
            bubbles: true,
            detail: { valueIds: this.selectedValueIds, productUrl },
          })
        );
      });
    }

    get selectedValueIds() {
      const ids = [];
      this.querySelectorAll('[data-option-name]').forEach((option) => {
        const select = option.querySelector('select');
        if (select) {
          ids.push(select.selectedOptions[0]?.dataset.optionValueId);
        } else {
          ids.push(option.querySelector('input:checked')?.dataset.optionValueId);
        }
      });
      return ids.filter(Boolean);
    }

    get selectedValuesByName() {
      const values = {};
      this.querySelectorAll('[data-option-name]').forEach((option) => {
        const name = option.dataset.optionName.trim().toLowerCase();
        const select = option.querySelector('select');
        values[name] = select ? select.selectedOptions[0]?.textContent.trim().split(' - ')[0] : option.querySelector('input:checked')?.value;
      });
      return values;
    }
  }

  /* -------------------------------------------------------------
     <lc-quantity>
  ------------------------------------------------------------- */
  class LcQuantity extends HTMLElement {
    connectedCallback() {
      this.input = this.querySelector('input');
      this.addEventListener('click', (event) => {
        const button = event.target.closest('[data-quantity-step]');
        if (!button) return;
        const step = Number(this.input.step) || 1;
        const min = Number(this.input.min) || 1;
        const max = this.input.max ? Number(this.input.max) : Infinity;
        const direction = Number(button.dataset.quantityStep);
        const next = Math.min(max, Math.max(min, (Number(this.input.value) || min) + direction * step));
        this.input.value = next;
        this.input.dispatchEvent(new Event('change', { bubbles: true }));
        this.update();
      });
      this.input.addEventListener('change', () => this.update());
      this.update();
    }

    update() {
      const value = Number(this.input.value);
      const [minus, plus] = this.querySelectorAll('[data-quantity-step]');
      if (minus) minus.disabled = value <= (Number(this.input.min) || 1);
      if (plus) plus.disabled = this.input.max ? value >= Number(this.input.max) : false;
    }
  }

  /* -------------------------------------------------------------
     <lc-product-form>
  ------------------------------------------------------------- */
  function formDataToItem(formData) {
    const item = { id: formData.get('id'), quantity: Number(formData.get('quantity')) || 1, properties: {} };
    const plan = formData.get('selling_plan');
    if (plan) item.selling_plan = plan;
    for (const [key, value] of formData.entries()) {
      const match = key.match(/^properties\[(.+)\]$/);
      if (match && value !== '') item.properties[match[1]] = value;
    }
    return item;
  }

  class LcProductForm extends HTMLElement {
    connectedCallback() {
      this.form = this.querySelector('form');
      if (!this.form) return;
      this.form.addEventListener('submit', (event) => this.onSubmit(event));
    }

    get product() {
      return this.closest('lc-product');
    }

    showError(message) {
      const error = this.querySelector('[data-form-error]');
      if (!error) return;
      error.querySelector('span').textContent = message || '';
      error.hidden = !message;
    }

    validate() {
      // Elements outside the form join it through the form attribute.
      const invalid = Array.from(this.form.elements).find(
        (element) => !element.disabled && element.willValidate && !element.checkValidity()
      );
      if (invalid) {
        invalid.setAttribute('aria-invalid', 'true');
        invalid.focus();
        this.showError(invalid.validationMessage);
        invalid.addEventListener('input', () => invalid.removeAttribute('aria-invalid'), { once: true });
        return false;
      }
      return true;
    }

    async onSubmit(event) {
      event.preventDefault();
      const button = this.form.querySelector('[data-add-button]');
      if (!button || button.disabled || button.classList.contains('is-loading')) return;
      this.showError('');
      if (!this.validate()) return;

      button.classList.add('is-loading');
      button.setAttribute('aria-disabled', 'true');

      const formData = new FormData(this.form);
      const wrap = this.product?.querySelector('[data-gift-wrap]:checked');

      try {
        if (wrap) {
          await Lilac.cart.add({ items: [formDataToItem(formData), { id: wrap.dataset.giftWrap, quantity: 1 }] }, this);
        } else {
          await Lilac.cart.add(formData, this);
        }
        if (Lilac.config.cartType === 'page') {
          window.location.href = Lilac.config.routes.cart;
          return;
        }
        // Refresh "in your bag" quantity and quantity rules.
        const quantityPart = this.product?.querySelector('[data-product-part="quantity"]');
        if (quantityPart && this.product) {
          const valueIds = this.product.querySelector('lc-variant-picker')?.selectedValueIds || [];
          this.product.render({ valueIds });
        }
      } catch (error) {
        this.showError(error.message);
      } finally {
        button.classList.remove('is-loading');
        button.removeAttribute('aria-disabled');
      }
    }
  }

  /* -------------------------------------------------------------
     <lc-gift-recipient>
  ------------------------------------------------------------- */
  class LcGiftRecipient extends HTMLElement {
    connectedCallback() {
      this.toggle = this.querySelector('[data-recipient-toggle]');
      this.fields = this.querySelector('[data-recipient-fields]');
      const offset = this.querySelector('[data-recipient-offset]');
      if (offset) offset.value = String(new Date().getTimezoneOffset());

      const date = this.querySelector('[data-recipient-date]');
      if (date) {
        const today = new Date();
        const max = new Date();
        max.setDate(today.getDate() + 90);
        date.min = today.toISOString().slice(0, 10);
        date.max = max.toISOString().slice(0, 10);
      }

      this.toggle.addEventListener('change', () => this.update());
      this.update();
    }

    update() {
      const on = this.toggle.checked;
      this.fields.hidden = !on;
      this.fields.querySelectorAll('input, textarea').forEach((input) => {
        input.disabled = !on;
      });
      const email = this.querySelector('[data-recipient-required]');
      if (email) email.required = on;
    }
  }

  /* -------------------------------------------------------------
     <lc-gift-wrap>
  ------------------------------------------------------------- */
  class LcGiftWrap extends HTMLElement {
    connectedCallback() {
      const checkbox = this.querySelector('[data-gift-wrap]');
      const message = this.querySelector('[data-gift-message]');
      if (!checkbox || !message) return;
      checkbox.addEventListener('change', () => {
        message.hidden = !checkbox.checked;
        message.querySelector('textarea').disabled = !checkbox.checked;
      });
    }
  }

  /* -------------------------------------------------------------
     <lc-sticky-atc>
  ------------------------------------------------------------- */
  class LcStickyAtc extends HTMLElement {
    connectedCallback() {
      this.product = this.closest('lc-product');
      const anchor = this.product?.querySelector('.product__buy');
      if (!anchor) return;
      this.hidden = false;

      this.anchorObserver = new IntersectionObserver(([entry]) => {
        this.pastAnchor = !entry.isIntersecting && entry.boundingClientRect.top < 0;
        this.update();
      });
      this.anchorObserver.observe(anchor);

      const footer = document.querySelector('.section-footer');
      if (footer) {
        this.footerObserver = new IntersectionObserver(([entry]) => {
          this.footerVisible = entry.isIntersecting;
          this.update();
        });
        this.footerObserver.observe(footer);
      }
      this.update();
    }

    disconnectedCallback() {
      this.anchorObserver?.disconnect();
      this.footerObserver?.disconnect();
    }

    update() {
      const visible = Boolean(this.pastAnchor && !this.footerVisible);
      this.classList.toggle('is-visible', visible);
      this.inert = !visible;
      document.body.classList.toggle('has-sticky-atc', visible);
    }
  }

  /* -------------------------------------------------------------
     <lc-delivery-estimate>
  ------------------------------------------------------------- */
  class LcDeliveryEstimate extends HTMLElement {
    connectedCallback() {
      const min = Number(this.dataset.min) || 0;
      const max = Math.max(min, Number(this.dataset.max) || min);
      const cutoff = Number(this.dataset.cutoff);
      const skipWeekends = this.dataset.skipWeekends === 'true';
      const now = new Date();

      const start = new Date(now);
      if (now.getHours() >= cutoff) start.setDate(start.getDate() + 1);

      const addBusinessDays = (date, days) => {
        const result = new Date(date);
        let added = 0;
        while (added < days) {
          result.setDate(result.getDate() + 1);
          const day = result.getDay();
          if (!skipWeekends || (day !== 0 && day !== 6)) added += 1;
        }
        return result;
      };

      const format = new Intl.DateTimeFormat(this.dataset.locale || undefined, { weekday: 'short', month: 'short', day: 'numeric' });
      const earliest = addBusinessDays(start, min);
      const latest = addBusinessDays(start, max);
      const text = this.querySelector('[data-delivery-text]');
      if (text) {
        text.textContent = this.dataset.templateRange
          .replace('[start]', format.format(earliest))
          .replace('[end]', format.format(latest));
      }

      const cutoffText = this.querySelector('[data-delivery-cutoff]');
      if (cutoffText && now.getHours() < cutoff) {
        const deadline = new Date(now);
        deadline.setHours(cutoff, 0, 0, 0);
        const minutes = Math.max(0, Math.round((deadline - now) / 60000));
        const hours = Math.floor(minutes / 60);
        const label = hours > 0 ? `${hours}h ${minutes % 60}m` : `${minutes}m`;
        cutoffText.textContent = this.dataset.templateCutoff.replace('[time]', label);
        cutoffText.hidden = false;
      }
    }
  }

  /* -------------------------------------------------------------
     <lc-pickup-availability>
  ------------------------------------------------------------- */
  class LcPickupAvailability extends HTMLElement {
    connectedCallback() {
      if (this.hidden || !this.dataset.variantId) return;
      const url = `${this.dataset.rootUrl.replace(/\/$/, '')}/variants/${this.dataset.variantId}/?section_id=pickup-availability`;
      fetch(url)
        .then((response) => (response.ok ? response.text() : ''))
        .then((html) => {
          const content = Lilac.parseHTML(html).querySelector('.shopify-section');
          const markup = content ? content.innerHTML.trim() : '';
          if (!markup) {
            this.hidden = true;
            return;
          }
          this.innerHTML = markup;
        })
        .catch(() => {
          this.hidden = true;
        });
    }
  }

  /* -------------------------------------------------------------
     <lc-share>
  ------------------------------------------------------------- */
  class LcShare extends HTMLElement {
    connectedCallback() {
      const native = this.querySelector('[data-share-native]');
      const fallback = this.querySelector('[data-share-fallback]');
      if (navigator.share && native) {
        native.hidden = false;
        fallback.hidden = true;
        native.addEventListener('click', () => {
          navigator.share({ title: this.dataset.title, url: this.dataset.url }).catch(() => {});
        });
      }
      this.querySelector('[data-share-copy]')?.addEventListener('click', async () => {
        const status = this.querySelector('[data-share-status]');
        try {
          await navigator.clipboard.writeText(this.dataset.url);
          if (status) status.textContent = Lilac.config.strings.linkCopied || '';
        } catch (error) {
          window.prompt('', this.dataset.url);
        }
      });
    }
  }

  /* -------------------------------------------------------------
     <lc-bundle> frequently bought together
  ------------------------------------------------------------- */
  class LcBundle extends HTMLElement {
    connectedCallback() {
      this.addEventListener('change', (event) => {
        const select = event.target.closest('[data-bundle-select]');
        if (select) {
          const checkbox = select.closest('.bundle__item').querySelector('[data-bundle-variant]');
          const option = select.selectedOptions[0];
          checkbox.dataset.bundleVariant = option.value;
          checkbox.dataset.bundlePrice = option.dataset.price;
          select.closest('.bundle__item').querySelector('.bundle__price').textContent = Lilac.formatMoney(option.dataset.price);
        }
        this.updateTotal();
      });
      this.querySelector('[data-bundle-add]')?.addEventListener('click', () => this.add());
      this.updateTotal();
    }

    get selected() {
      return Array.from(this.querySelectorAll('[data-bundle-variant]')).filter((input) => input.checked);
    }

    updateTotal() {
      const total = this.selected.reduce((sum, input) => sum + Number(input.dataset.bundlePrice || 0), 0);
      const output = this.querySelector('[data-bundle-total]');
      if (output) output.textContent = Lilac.formatMoney(total);
    }

    async add() {
      const button = this.querySelector('[data-bundle-add]');
      const error = this.querySelector('[data-bundle-error]');
      const items = this.selected.map((input) => ({ id: Number(input.dataset.bundleVariant), quantity: 1 }));
      if (!items.length) return;
      button.classList.add('is-loading');
      error.hidden = true;
      try {
        await Lilac.cart.add({ items }, this);
        if (Lilac.config.cartType === 'page') window.location.href = Lilac.config.routes.cart;
      } catch (err) {
        error.textContent = err.message;
        error.hidden = false;
      } finally {
        button.classList.remove('is-loading');
      }
    }
  }

  customElements.define('lc-product', LcProduct);
  customElements.define('lc-variant-picker', LcVariantPicker);
  customElements.define('lc-quantity', LcQuantity);
  customElements.define('lc-product-form', LcProductForm);
  customElements.define('lc-gift-recipient', LcGiftRecipient);
  customElements.define('lc-gift-wrap', LcGiftWrap);
  customElements.define('lc-sticky-atc', LcStickyAtc);
  customElements.define('lc-delivery-estimate', LcDeliveryEstimate);
  customElements.define('lc-pickup-availability', LcPickupAvailability);
  customElements.define('lc-share', LcShare);
  customElements.define('lc-bundle', LcBundle);
})();
