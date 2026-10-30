/*
  <lc-age-gate> opens its persistent dialog until the shopper confirms.
  The confirmation is stored in localStorage for the merchant's chosen
  number of days. In the theme editor it opens while the section is selected.
*/
(() => {
  if (customElements.get('lc-age-gate')) return;

  const DAY = 86400000;
  const KEY = 'lilac-age-confirmed';

  class LcAgeGate extends HTMLElement {
    connectedCallback() {
      this.dialog = this.querySelector('lc-dialog');
      if (!this.dialog) return;
      this.days = Number(this.dataset.days) || 30;

      this.querySelector('[data-age-gate-confirm]')?.addEventListener('click', () => this.confirm());
      this.querySelector('[data-age-gate-decline]')?.addEventListener('click', () => this.decline());

      const sectionId = this.dataset.sectionId;
      if (window.Lilac?.config.designMode) {
        document.addEventListener('shopify:section:select', (event) => {
          if (event.detail.sectionId === sectionId) this.dialog.open();
        });
        document.addEventListener('shopify:section:deselect', (event) => {
          if (event.detail.sectionId === sectionId) this.dialog.close();
        });
        return;
      }

      if (!this.confirmed()) requestAnimationFrame(() => this.dialog.open());
    }

    confirmed() {
      try {
        const saved = Number(localStorage.getItem(KEY)) || 0;
        return Date.now() - saved < this.days * DAY;
      } catch (error) {
        return false;
      }
    }

    confirm() {
      try {
        localStorage.setItem(KEY, String(Date.now()));
      } catch (error) {
        /* storage unavailable: the check shows again next visit */
      }
      this.dialog.close();
    }

    decline() {
      this.querySelector('[data-age-gate-buttons]').hidden = true;
      const message = this.querySelector('[data-age-gate-declined]');
      message.hidden = false;
      message.focus?.();
    }
  }

  customElements.define('lc-age-gate', LcAgeGate);
})();
