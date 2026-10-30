/*
  <lc-quick-order>  bulk order table.

  Keeps quantities on quantity rules (minimum, increment, maximum), shows
  each line total with volume pricing (quantity price breaks), and adds every
  row with a quantity to the cart in one Lilac.cart.add request.
*/
(() => {
  const { Lilac } = window;
  if (!Lilac || customElements.get('lc-quick-order')) return;

  const strings = Lilac.config.strings || {};

  class LcQuickOrder extends HTMLElement {
    connectedCallback() {
      this.form = this.querySelector('[data-quick-order-form]');
      this.submit = this.querySelector('[data-quick-order-submit]');
      this.error = this.querySelector('[data-quick-order-error]');
      this.count = this.querySelector('[data-quick-order-count]');
      this.subtotal = this.querySelector('[data-quick-order-subtotal]');
      if (!this.form) return;

      this.form.addEventListener('input', (event) => {
        if (event.target.matches('.quick-order__input')) this.update();
      });
      this.form.addEventListener('change', (event) => {
        if (event.target.matches('.quick-order__input')) {
          this.normalize(event.target);
          this.update();
        }
      });
      this.form.addEventListener('reset', () => window.setTimeout(() => this.update()));
      this.form.addEventListener('submit', (event) => {
        event.preventDefault();
        this.addToCart();
      });

      this.update();
    }

    get rows() {
      return Array.from(this.querySelectorAll('.quick-order__row'));
    }

    /** Round a quantity to the variant's rules; 0 stays 0. */
    normalize(input) {
      let quantity = Math.max(0, Math.floor(Number(input.value) || 0));
      if (quantity > 0) {
        const min = Number(input.dataset.min) || 1;
        const step = Number(input.step) || 1;
        const max = Number(input.max) || Infinity;
        quantity = Math.max(quantity, min);
        quantity = Math.ceil(quantity / step) * step;
        if (quantity > max) quantity = Math.floor(max / step) * step;
      }
      input.value = quantity;
    }

    unitPrice(row, quantity) {
      let price = Number(row.dataset.price) || 0;
      let breaks = [];
      try {
        breaks = JSON.parse(row.dataset.breaks || '[]');
      } catch (error) {
        breaks = [];
      }
      breaks.forEach(([minimum, breakPrice]) => {
        if (quantity >= minimum && breakPrice < price) price = breakPrice;
      });
      return price;
    }

    update() {
      let items = 0;
      let subtotal = 0;

      this.rows.forEach((row) => {
        const input = row.querySelector('.quick-order__input');
        const quantity = Math.max(0, Math.floor(Number(input?.value) || 0));
        const lineTotal = quantity * this.unitPrice(row, quantity);
        items += quantity;
        subtotal += lineTotal;
        row.classList.toggle('is-selected', quantity > 0);
        const output = row.querySelector('[data-line-total]');
        if (output) output.textContent = Lilac.formatMoney(lineTotal);
      });

      const template = items === 1 ? strings.quickOrderItemsOne : strings.quickOrderItemsOther;
      if (this.count && template) this.count.textContent = template.replace('[count]', items);
      if (this.subtotal) this.subtotal.textContent = Lilac.formatMoney(subtotal);
      if (this.submit) this.submit.disabled = items === 0;
      this.items = items;
    }

    async addToCart() {
      this.rows.forEach((row) => {
        const input = row.querySelector('.quick-order__input');
        if (input) this.normalize(input);
      });
      this.update();

      const items = this.rows
        .map((row) => ({
          id: Number(row.dataset.variantId),
          quantity: Number(row.querySelector('.quick-order__input')?.value) || 0,
        }))
        .filter((item) => item.quantity > 0);
      if (!items.length || this.submit.classList.contains('is-loading')) return;

      this.error.hidden = true;
      this.submit.classList.add('is-loading');
      this.submit.setAttribute('aria-disabled', 'true');

      try {
        await Lilac.cart.add({ items }, this);
        const total = items.reduce((sum, item) => sum + item.quantity, 0);
        Lilac.announce((strings.quickOrderAdded || '').replace('[count]', total));
        this.form.reset();
        if (Lilac.config.cartType === 'page') window.location.href = Lilac.config.routes.cart;
      } catch (error) {
        this.error.textContent = error.message || strings.cartError;
        this.error.hidden = false;
      } finally {
        this.submit.classList.remove('is-loading');
        this.submit.removeAttribute('aria-disabled');
      }
    }
  }

  customElements.define('lc-quick-order', LcQuickOrder);
})();
