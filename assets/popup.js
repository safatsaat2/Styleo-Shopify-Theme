/*
  <lc-popup> opens its <lc-dialog> after a delay or on exit intent.
  - Shown at most once per frequency window (localStorage).
  - Never opens over another open dialog.
  - Opens right away after a signup through the popup's form so the
    customer sees the confirmation or error.
  - In the theme editor it opens while the section is selected.
*/
(() => {
  if (customElements.get('lc-popup')) return;

  const DAY = 86400000;

  class LcPopup extends HTMLElement {
    connectedCallback() {
      this.dialog = this.querySelector('lc-dialog');
      if (!this.dialog) return;
      this.key = `lilac-popup-${this.dataset.key}`;
      this.delay = (Number(this.dataset.delay) || 0) * 1000;
      this.frequency = (Number(this.dataset.frequency) || 0) * DAY;
      this.exitIntent = this.dataset.exitIntent === 'true';

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

      // After a signup the page reloads with the form's success or error message.
      const submitted = this.querySelector('.newsletter-form .form-message');
      if (submitted) {
        requestAnimationFrame(() => this.dialog.open());
        return;
      }

      if (this.recentlyShown()) return;

      if (this.delay >= 0) this.timer = setTimeout(() => this.show(), this.delay);
      if (this.exitIntent && window.matchMedia('(hover: hover)').matches) {
        this.onMouseOut = (event) => {
          if (!event.relatedTarget && event.clientY <= 0) this.show();
        };
        document.addEventListener('mouseout', this.onMouseOut);
      }
    }

    disconnectedCallback() {
      clearTimeout(this.timer);
      if (this.onMouseOut) document.removeEventListener('mouseout', this.onMouseOut);
    }

    recentlyShown() {
      try {
        const last = Number(localStorage.getItem(this.key)) || 0;
        return Date.now() - last < Math.max(this.frequency, 1);
      } catch (error) {
        return false;
      }
    }

    show() {
      if (this.shown) return;
      const otherOpen = Array.from(document.querySelectorAll('lc-dialog')).some((dialog) => dialog.isOpen);
      if (otherOpen) {
        // Try again later instead of stacking dialogs.
        this.timer = setTimeout(() => this.show(), 8000);
        return;
      }
      this.shown = true;
      clearTimeout(this.timer);
      if (this.onMouseOut) document.removeEventListener('mouseout', this.onMouseOut);
      try {
        localStorage.setItem(this.key, String(Date.now()));
      } catch (error) {
        /* storage unavailable */
      }
      this.dialog.open();
    }
  }

  customElements.define('lc-popup', LcPopup);
})();
