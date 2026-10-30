/*
  Header behavior.
  - <lc-header>: publishes --lc-header-height, handles sticky modes
    (always, scroll up, none) and the transparent home page state.
  - <lc-disclosure>: desktop dropdown and mega menu panels. Opens on hover
    for mouse users and on click or Enter/Space for everyone. Escape
    closes and returns focus to the toggle.
*/
(() => {
  const root = document.documentElement;
  const hoverQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
  const desktopQuery = window.matchMedia('(min-width: 990px)');

  /* -------------------------------------------------------------
     <lc-header>
  ------------------------------------------------------------- */
  class LcHeader extends HTMLElement {
    connectedCallback() {
      this.mode = this.dataset.sticky || 'always';
      this.section = this.closest('.shopify-section') || this;
      this.lastY = window.scrollY;
      this.transparentScheme = this.dataset.transparentScheme || null;
      this.solidScheme = this.dataset.scheme;

      this.resizeObserver = new ResizeObserver(() => this.measure());
      this.resizeObserver.observe(this);
      this.measure();

      this.onScroll = this.onScroll.bind(this);
      window.addEventListener('scroll', this.onScroll, { passive: true });
      this.onScroll();

      // Keep the header solid while a menu panel is open.
      this.addEventListener('lc:disclosure-toggle', () => this.updateTransparency());
      this.addEventListener('focusin', () => this.reveal());

      this.closeDrawerOnDesktop = (event) => {
        if (event.matches) window.Lilac?.dialogs.close('MenuDrawer');
      };
      desktopQuery.addEventListener('change', this.closeDrawerOnDesktop);
    }

    disconnectedCallback() {
      this.resizeObserver?.disconnect();
      window.removeEventListener('scroll', this.onScroll);
      desktopQuery.removeEventListener('change', this.closeDrawerOnDesktop);
    }

    measure() {
      const height = Math.round(this.getBoundingClientRect().height);
      root.style.setProperty('--lc-header-height', `${height}px`);
      root.style.setProperty('--lc-sticky-offset', this.mode === 'always' ? `${height}px` : '0px');
    }

    get menuOpen() {
      return Boolean(this.querySelector('lc-disclosure[open]'));
    }

    onScroll() {
      const y = Math.max(0, window.scrollY);
      const height = this.offsetHeight;
      this.classList.toggle('is-scrolled', y > 8);

      if (this.mode === 'scroll_up' && !this.menuOpen) {
        if (y > height * 2 && y > this.lastY + 6) {
          this.section.classList.add('is-header-hidden');
          root.style.setProperty('--lc-sticky-offset', '0px');
        } else if (y < this.lastY - 6 || y <= height) {
          this.section.classList.remove('is-header-hidden');
          root.style.setProperty('--lc-sticky-offset', `${height}px`);
        }
      }

      this.lastY = y;
      this.updateTransparency();
    }

    reveal() {
      this.section.classList.remove('is-header-hidden');
    }

    updateTransparency() {
      if (!this.transparentScheme) return;
      const transparent = window.scrollY <= 8 && !this.menuOpen;
      this.classList.toggle('is-transparent', transparent);
      this.classList.toggle(this.transparentScheme, transparent);
      this.classList.toggle(this.solidScheme, !transparent);
    }
  }

  /* -------------------------------------------------------------
     <lc-disclosure>
  ------------------------------------------------------------- */
  class LcDisclosure extends HTMLElement {
    connectedCallback() {
      this.toggleButton = this.querySelector(':scope > button[aria-controls]');
      this.panel = this.querySelector(':scope > [id]');
      if (!this.toggleButton || !this.panel) return;

      this.toggleButton.addEventListener('click', () => this.setOpen(!this.hasAttribute('open')));

      this.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && this.hasAttribute('open')) {
          event.stopPropagation();
          this.setOpen(false);
          this.toggleButton.focus();
        }
      });

      this.addEventListener('focusout', (event) => {
        if (!this.contains(event.relatedTarget)) this.setOpen(false);
      });

      this.addEventListener('pointerenter', () => {
        if (!hoverQuery.matches) return;
        clearTimeout(this.closeTimer);
        this.openTimer = setTimeout(() => this.setOpen(true), 80);
      });

      this.addEventListener('pointerleave', () => {
        if (!hoverQuery.matches) return;
        clearTimeout(this.openTimer);
        this.closeTimer = setTimeout(() => this.setOpen(false), 160);
      });

      this.addEventListener('theme:block:select', () => this.setOpen(true));
      this.addEventListener('theme:block:deselect', () => this.setOpen(false));
    }

    setOpen(open) {
      if (open === this.hasAttribute('open')) return;
      if (open) {
        // Only one panel at a time.
        this.closest('.menu')?.querySelectorAll('lc-disclosure[open]').forEach((other) => {
          if (other !== this) other.setOpen(false);
        });
      }
      this.toggleAttribute('open', open);
      this.toggleButton.setAttribute('aria-expanded', String(open));
      this.panel.hidden = !open;
      this.dispatchEvent(new CustomEvent('lc:disclosure-toggle', { bubbles: true, detail: { open } }));
    }
  }

  document.addEventListener('click', (event) => {
    if (event.target.closest('lc-disclosure')) return;
    document.querySelectorAll('lc-disclosure[open]').forEach((element) => element.setOpen(false));
  });

  if (!customElements.get('lc-header')) customElements.define('lc-header', LcHeader);
  if (!customElements.get('lc-disclosure')) customElements.define('lc-disclosure', LcDisclosure);
})();
