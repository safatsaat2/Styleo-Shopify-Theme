/*
  Cart behavior shared by the cart drawer and the cart page.

  <lc-cart-items data-section-id="...">
  - Quantity steppers, typed quantities, and remove buttons call
    Lilac.cart.change. The response renders every [data-cart-section]
    in the same request, and each <lc-cart-items> swaps its
    [data-cart-content] region.
  - Discount codes apply and remove through the Cart Ajax API "discount"
    parameter.
  - Order note and cart attributes (gift message, delivery date) save in
    the background without redrawing, so typing is never interrupted.
  - Gift wrap toggle adds or removes the gift wrap product.
  - Terms agreement must be checked before the checkout button submits.
  - Free shipping and minimum order amounts convert to the customer's
    currency with the live rate when the cart isn't in the store currency.
  - Keeps focus on the equivalent control after a re-render.

  <lc-shipping-estimator>  shipping rates for an address.

  Global: header counts from <template data-cart-meta>; opens the drawer
  after an add when the cart type is drawer.
*/
(() => {
  const { Lilac } = window;
  if (!Lilac || customElements.get('lc-cart-items')) return;

  const strings = Lilac.config.strings || {};

  function rate() {
    return Number(window.Shopify?.currency?.rate) || 1;
  }

  /* -------------------------------------------------------------
     Header counts
  ------------------------------------------------------------- */
  function updateCounts(doc) {
    const meta = doc.querySelector('template[data-cart-meta]');
    if (!meta) return;
    const count = Number(meta.dataset.count) || 0;
    document.querySelectorAll('[data-cart-count]').forEach((element) => {
      element.textContent = count > 99 ? '99+' : String(count);
      element.hidden = count === 0;
    });
    document.querySelectorAll('[data-cart-label]').forEach((element) => {
      element.textContent = meta.dataset.label;
    });
  }

  /* -------------------------------------------------------------
     <lc-cart-items>
  ------------------------------------------------------------- */
  class LcCartItems extends HTMLElement {
    connectedCallback() {
      this.sectionId = this.dataset.sectionId;
      this.pending = Promise.resolve();

      this.addEventListener('click', (event) => this.onClick(event));
      this.addEventListener('submit', (event) => this.onSubmit(event));
      this.addEventListener('change', (event) => this.onChange(event));

      this.debouncedInput = Lilac.debounce((input) => {
        const line = input.closest('[data-line]');
        const value = Math.max(0, parseInt(input.value, 10) || 0);
        if (String(value) !== input.dataset.previous) this.queueChange(line, value, input);
      }, 400);

      this.debouncedSave = Lilac.debounce((field) => this.saveField(field), 500);

      this.addEventListener('input', (event) => {
        const target = event.target;
        if (target.matches('[data-line-quantity]')) this.debouncedInput(target);
        if (target.matches('[data-cart-note], textarea[data-cart-attribute]')) this.debouncedSave(target);
      });

      this.addEventListener('keydown', (event) => {
        // Enter in a quantity field updates the line instead of submitting checkout.
        if (event.key === 'Enter' && event.target.matches('[data-line-quantity]')) {
          event.preventDefault();
          this.debouncedInput(event.target);
        }
      });

      this.onCartUpdated = (event) => this.render(event.detail);
      document.addEventListener(Lilac.events.cartUpdated, this.onCartUpdated);
      this.enhance();
    }

    disconnectedCallback() {
      document.removeEventListener(Lilac.events.cartUpdated, this.onCartUpdated);
    }

    /* ---------- events ---------- */

    onClick(event) {
      const step = event.target.closest('[data-quantity-step]');
      if (step && step.closest('[data-line]')) {
        const line = step.closest('[data-line]');
        const input = line.querySelector('[data-line-quantity]');
        const next = Math.max(0, (Number(input.value) || 0) + Number(step.dataset.quantityStep));
        input.value = next;
        this.queueChange(line, next, step);
        return;
      }

      const remove = event.target.closest('[data-cart-remove]');
      if (remove) {
        this.queueChange(remove.closest('[data-line]'), 0, remove);
        return;
      }

      const removeCode = event.target.closest('[data-discount-remove]');
      if (removeCode) {
        const codes = this.appliedCodes().filter((code) => code.toLowerCase() !== removeCode.dataset.discountRemove.toLowerCase());
        this.focusTarget = { selector: '[data-discount-input]' };
        this.queue(() => Lilac.cart.update({ discount: codes.join(',') }, this));
        return;
      }

      const checkout = event.target.closest('[data-checkout-button]');
      if (checkout && !this.termsAccepted()) event.preventDefault();
    }

    onSubmit(event) {
      const discountForm = event.target.closest('[data-discount-form]');
      if (discountForm) {
        event.preventDefault();
        this.applyDiscount(discountForm);
        return;
      }
      // The cart form itself: block checkout until terms are accepted.
      if (event.submitter?.name === 'checkout' && !this.termsAccepted()) event.preventDefault();
    }

    onChange(event) {
      const target = event.target;
      if (target.matches('[data-cart-gift-wrap]')) {
        const id = Number(target.dataset.cartGiftWrap);
        this.focusTarget = { selector: `#${CSS.escape(target.id)}` };
        this.queue(() =>
          target.checked ? Lilac.cart.add({ items: [{ id, quantity: 1 }] }, this) : Lilac.cart.change({ id: String(id), quantity: 0 }, this)
        );
        return;
      }
      if (target.matches('input[data-cart-attribute], select[data-cart-attribute]')) this.saveField(target);
      if (target.matches('[data-cart-terms]')) {
        this.querySelector('[data-cart-terms-error]')?.setAttribute('hidden', '');
      }
    }

    /* ---------- requests ---------- */

    queue(task) {
      // Serialize requests so quick taps never race each other.
      this.pending = this.pending.then(task).catch((error) => Lilac.announce(error.message));
      return this.pending;
    }

    queueChange(lineElement, quantity, control) {
      this.pending = this.pending.then(() => this.change(lineElement, quantity, control));
      return this.pending;
    }

    async change(lineElement, quantity, control) {
      if (!lineElement?.isConnected) return;
      const line = Number(lineElement.dataset.line);
      this.rememberFocus(control, line);
      this.setBusy(lineElement, true);
      this.showLineError(lineElement, '');

      try {
        await Lilac.cart.change({ line, quantity }, this);
      } catch (error) {
        const input = lineElement.querySelector('[data-line-quantity]');
        if (input) input.value = input.dataset.previous;
        this.showLineError(lineElement, error.message || strings.cartError);
        Lilac.announce(error.message);
      } finally {
        if (lineElement.isConnected) this.setBusy(lineElement, false);
      }
    }

    appliedCodes() {
      const holder = this.querySelector('[data-discounts]');
      return (holder?.dataset.codes || '').split(',').map((code) => code.trim()).filter(Boolean);
    }

    async applyDiscount(form) {
      const input = form.querySelector('[data-discount-input]');
      const error = form.querySelector('[data-discount-error]');
      const code = input.value.trim();
      if (!code) return;
      const existing = this.appliedCodes();
      if (existing.some((applied) => applied.toLowerCase() === code.toLowerCase())) {
        input.value = '';
        return;
      }

      this.focusTarget = { selector: '[data-discount-input]' };
      error.hidden = true;
      await this.queue(() => Lilac.cart.update({ discount: [...existing, code].join(',') }, this));

      // Shopify drops codes that don't exist; flag them for the customer.
      const applied = this.appliedCodes().some((applied) => applied.toLowerCase() === code.toLowerCase());
      if (!applied) {
        const freshError = this.querySelector('[data-discount-error]');
        if (freshError) {
          freshError.textContent = strings.discountInvalid || '';
          freshError.hidden = false;
          this.querySelector('[data-discount-input]')?.setAttribute('aria-invalid', 'true');
        }
      }
    }

    async saveField(field) {
      const body = field.matches('[data-cart-note]')
        ? { note: field.value }
        : { attributes: { [field.dataset.cartAttribute]: field.value } };
      try {
        await Lilac.fetchJSON(`${Lilac.config.routes.cartUpdate}.js`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const status = this.querySelector('[data-cart-saved]');
        if (status) status.textContent = strings.cartSaved || '';
      } catch (error) {
        Lilac.announce(error.message);
      }
    }

    termsAccepted() {
      const terms = this.querySelector('[data-cart-terms]');
      if (!terms || terms.checked) return true;
      const error = this.querySelector('[data-cart-terms-error]');
      if (error) error.hidden = false;
      terms.focus();
      return false;
    }

    /* ---------- rendering ---------- */

    async render({ sections = {} } = {}) {
      let html = sections[this.sectionId];
      if (!html) {
        try {
          html = (await Lilac.sections.fetch([this.sectionId]))[this.sectionId];
        } catch (error) {
          return;
        }
      }
      if (!html) return;

      const doc = Lilac.parseHTML(html);
      const openDetails = Array.from(this.querySelectorAll('[data-cart-content] details')).map((details) => details.open);

      const next = doc.querySelector('[data-cart-content]');
      const current = this.querySelector('[data-cart-content]');
      if (next && current) current.replaceWith(next);

      this.querySelectorAll('[data-cart-content] details').forEach((details, index) => {
        if (openDetails[index] !== undefined) details.open = openDetails[index];
      });

      const nextPill = doc.querySelector('[data-cart-count-pill]');
      const pill = this.querySelector('[data-cart-count-pill]');
      if (nextPill && pill) pill.replaceWith(nextPill);

      const nextMeta = doc.querySelector('template[data-cart-meta]');
      const meta = this.querySelector('template[data-cart-meta]');
      if (nextMeta && meta) meta.replaceWith(nextMeta);

      updateCounts(doc);
      this.enhance();
      this.restoreFocus();
    }

    /** Client-side adjustments that depend on the customer's currency or clock. */
    enhance() {
      const shipping = this.querySelector('[data-free-shipping]');
      if (shipping && shipping.dataset.convert === 'true') {
        const threshold = Math.round(Number(shipping.dataset.threshold) * rate());
        const total = Number(shipping.dataset.total);
        const remaining = Math.max(0, threshold - total);
        const percent = threshold > 0 ? Math.min(100, Math.round((total / threshold) * 100)) : 100;
        shipping.querySelector('[data-free-shipping-text]').textContent =
          remaining > 0 ? shipping.dataset.templateRemaining.replace('[amount]', Lilac.formatMoney(remaining)) : shipping.dataset.templateComplete;
        const bar = shipping.querySelector('[data-free-shipping-bar]');
        bar.setAttribute('aria-valuenow', String(percent));
        bar.firstElementChild.style.width = `${percent}%`;
        shipping.classList.toggle('is-complete', remaining === 0);
      }

      const minimum = this.querySelector('[data-cart-minimum]');
      if (minimum && minimum.dataset.convert === 'true') {
        const required = Math.round(Number(minimum.dataset.cartMinimum) * rate());
        const below = Number(minimum.dataset.cartTotal) < required;
        minimum.hidden = !below;
        minimum.querySelector('[data-cart-minimum-text]').textContent = minimum.dataset.template.replace('[amount]', Lilac.formatMoney(required));
        this.querySelectorAll('[data-checkout-button]').forEach((button) => {
          button.disabled = below;
        });
      }

      const date = this.querySelector('input[type="date"][data-cart-attribute]');
      if (date) {
        const earliest = new Date();
        earliest.setDate(earliest.getDate() + (Number(date.dataset.leadDays) || 0));
        date.min = earliest.toISOString().slice(0, 10);
      }
    }

    rememberFocus(control, line) {
      this.focusTarget = null;
      if (!control) return;
      if (control.matches('[data-line-quantity]')) this.focusTarget = { line, selector: '[data-line-quantity]' };
      else if (control.matches('[data-quantity-step]')) {
        const increasing = Number(control.dataset.quantityStep) > 0;
        this.focusTarget = {
          line,
          selector: increasing ? '[data-quantity-step]:not([data-quantity-step^="-"])' : '[data-quantity-step^="-"]',
        };
      } else this.focusTarget = { line, selector: null };
    }

    restoreFocus() {
      // Skip when the customer already moved focus somewhere else on the page.
      const focusMovedAway = !this.contains(document.activeElement) && document.activeElement !== document.body;
      if (!this.focusTarget || focusMovedAway) {
        this.focusTarget = null;
        return;
      }
      const { line, selector } = this.focusTarget;
      this.focusTarget = null;

      let target = null;
      if (line === undefined || line === null) {
        target = selector ? this.querySelector(selector) : null;
      } else {
        const lineElement = this.querySelector(`[data-line="${line}"]`);
        target = (lineElement && selector && lineElement.querySelector(selector)) || lineElement?.querySelector('.cart-item__title');
      }
      target = target || this.querySelector('.cart-item__title, .empty-state a, [data-dialog-close]');
      target?.focus({ preventScroll: true });
    }

    setBusy(lineElement, busy) {
      lineElement.classList.toggle('is-loading', busy);
      lineElement.setAttribute('aria-busy', String(busy));
    }

    showLineError(lineElement, message) {
      const error = lineElement.querySelector('[data-line-error]');
      if (!error) return;
      error.querySelector('span').textContent = message;
      error.hidden = !message;
    }
  }

  customElements.define('lc-cart-items', LcCartItems);

  /* -------------------------------------------------------------
     <lc-shipping-estimator>
  ------------------------------------------------------------- */
  class LcShippingEstimator extends HTMLElement {
    connectedCallback() {
      this.form = this.querySelector('[data-estimator-form]');
      this.country = this.querySelector('[data-estimator-country]');
      this.province = this.querySelector('[data-estimator-province]');
      this.provinceField = this.querySelector('[data-estimator-province-field]');
      this.results = this.querySelector('[data-estimator-results]');
      if (!this.form || !this.country) return;

      const preferred = this.dataset.defaultCountry;
      if (preferred && Array.from(this.country.options).some((option) => option.value === preferred)) {
        this.country.value = preferred;
      }
      this.updateProvinces();
      this.country.addEventListener('change', () => this.updateProvinces());
      this.form.addEventListener('submit', (event) => {
        event.preventDefault();
        this.estimate();
      });
    }

    updateProvinces() {
      const option = this.country.selectedOptions[0];
      let provinces = [];
      try {
        provinces = JSON.parse(option?.dataset.provinces || '[]');
      } catch (error) {
        provinces = [];
      }
      this.province.innerHTML = '';
      provinces.forEach(([value, label]) => {
        const item = document.createElement('option');
        item.value = value;
        item.textContent = label;
        this.province.append(item);
      });
      this.provinceField.hidden = provinces.length === 0;
    }

    params() {
      const params = new URLSearchParams();
      params.set('shipping_address[country]', this.country.value);
      if (!this.provinceField.hidden) params.set('shipping_address[province]', this.province.value);
      params.set('shipping_address[zip]', this.querySelector('[data-estimator-zip]').value.trim());
      return params.toString();
    }

    async estimate() {
      const button = this.querySelector('[data-estimator-submit]');
      button.classList.add('is-loading');
      this.results.innerHTML = '';
      const cartUrl = Lilac.config.routes.cart;
      const query = this.params();

      try {
        const prepare = await fetch(`${cartUrl}/prepare_shipping_rates.json?${query}`, { method: 'POST' });
        if (!prepare.ok) {
          const data = await prepare.json().catch(() => ({}));
          throw new Error(Object.entries(data).map(([field, messages]) => `${field} ${[].concat(messages).join(', ')}`).join('. ') || strings.cartError);
        }

        let rates = null;
        for (let attempt = 0; attempt < 10 && rates === null; attempt += 1) {
          const response = await fetch(`${cartUrl}/async_shipping_rates.json?${query}`);
          const data = await response.json();
          if (data && Array.isArray(data.shipping_rates)) rates = data.shipping_rates;
          else await new Promise((resolve) => setTimeout(resolve, 500));
        }
        this.showRates(rates || []);
      } catch (error) {
        this.results.innerHTML = '';
        const message = document.createElement('p');
        message.className = 'form-message form-message--error';
        message.textContent = error.message;
        this.results.append(message);
      } finally {
        button.classList.remove('is-loading');
      }
    }

    showRates(rates) {
      this.results.innerHTML = '';
      if (!rates.length) {
        const message = document.createElement('p');
        message.textContent = strings.noShippingRates || '';
        this.results.append(message);
        return;
      }
      const heading = document.createElement('p');
      heading.className = 'shipping-estimator__heading';
      heading.textContent = (strings.shippingRatesFound || '').replace('[count]', rates.length);
      const list = document.createElement('ul');
      list.className = 'shipping-estimator__list';
      list.setAttribute('role', 'list');
      rates.forEach((shippingRate) => {
        const item = document.createElement('li');
        const name = document.createElement('span');
        name.textContent = shippingRate.presentment_name || shippingRate.name;
        const price = document.createElement('span');
        const cents = Math.round(parseFloat(shippingRate.price) * 100);
        price.textContent = cents === 0 ? strings.free || Lilac.formatMoney(0) : Lilac.formatMoney(cents);
        item.append(name, price);
        list.append(item);
      });
      this.results.append(heading, list);
    }
  }

  customElements.define('lc-shipping-estimator', LcShippingEstimator);

  /* -------------------------------------------------------------
     Counts and drawer opening for changes made anywhere
  ------------------------------------------------------------- */
  document.addEventListener(Lilac.events.cartUpdated, (event) => {
    const { action, sections = {}, openDrawer, source } = event.detail;

    const html = Object.values(sections).find((value) => value && value.includes('data-cart-meta'));
    if (html) updateCounts(Lilac.parseHTML(html));
    else if (!document.querySelector('lc-cart-items')) {
      Lilac.cart
        .get()
        .then((cart) => {
          document.querySelectorAll('[data-cart-count]').forEach((element) => {
            element.textContent = cart.item_count > 99 ? '99+' : String(cart.item_count);
            element.hidden = cart.item_count === 0;
          });
        })
        .catch(() => {});
    }

    // Adds from inside the cart (gift wrap, suggestions) don't reopen the drawer.
    const fromCart = source instanceof Element && source.closest('lc-cart-items, .cart-drawer');
    if (action === 'add' && openDrawer !== false && !fromCart && Lilac.config.cartType === 'drawer') {
      const drawer = Lilac.dialogs.get('CartDrawer');
      if (drawer && !drawer.isOpen) {
        // Close other dialogs (quick view) before showing the cart.
        document.querySelectorAll('lc-dialog').forEach((dialog) => {
          if (dialog !== drawer && dialog.isOpen) dialog.close();
        });
        window.setTimeout(() => drawer.open(document.querySelector('.header__cart')), 60);
      }
    }
  });

  document.addEventListener(Lilac.events.cartOpen, () => Lilac.dialogs.open('CartDrawer'));
})();
