/*
  <lc-announcements>: rotates announcement slides, supports arrows,
  pause and play, swipe, and dismissal stored in localStorage.
  Rotation pauses while the bar is hovered or focused, and never runs
  for customers who prefer reduced motion.
*/
(() => {
  if (customElements.get('lc-announcements')) return;

  class LcAnnouncements extends HTMLElement {
    connectedCallback() {
      this.slides = Array.from(this.querySelectorAll('.announcement-bar__slide'));
      this.index = 0;
      this.delay = Number(this.dataset.autoplay) || 0;
      this.paused = window.Lilac?.prefersReducedMotion?.() || false;
      this.pauseButton = this.querySelector('[data-announcement-pause]');

      this.querySelector('[data-announcement-prev]')?.addEventListener('click', () => this.go(this.index - 1, true));
      this.querySelector('[data-announcement-next]')?.addEventListener('click', () => this.go(this.index + 1, true));
      this.pauseButton?.addEventListener('click', () => this.setPaused(!this.paused, true));
      this.querySelector('[data-announcement-dismiss]')?.addEventListener('click', () => this.dismiss());

      this.addEventListener('mouseenter', () => this.hold(true));
      this.addEventListener('mouseleave', () => this.hold(false));
      this.addEventListener('focusin', () => this.hold(true));
      this.addEventListener('focusout', (event) => {
        if (!this.contains(event.relatedTarget)) this.hold(false);
      });

      this.setupSwipe();
      this.updatePauseButton();
      this.schedule();

      this.addEventListener('theme:block:select', (event) => {
        const slide = event.target.closest?.('.announcement-bar__slide');
        if (slide) {
          this.go(this.slides.indexOf(slide), true);
          this.setPaused(true);
        }
      });
    }

    disconnectedCallback() {
      clearTimeout(this.timer);
    }

    go(index, userInitiated = false) {
      if (!this.slides.length) return;
      const next = (index + this.slides.length) % this.slides.length;
      this.slides.forEach((slide, i) => {
        slide.hidden = i !== next;
        slide.classList.toggle('is-active', i === next);
      });
      this.index = next;
      if (userInitiated) this.schedule();
    }

    schedule() {
      clearTimeout(this.timer);
      if (!this.delay || this.paused || this.holding || this.slides.length < 2) return;
      this.timer = setTimeout(() => {
        this.go(this.index + 1);
        this.schedule();
      }, this.delay);
    }

    hold(value) {
      this.holding = value;
      this.schedule();
    }

    setPaused(value) {
      this.paused = value;
      this.updatePauseButton();
      this.schedule();
    }

    updatePauseButton() {
      if (!this.pauseButton) return;
      this.pauseButton.setAttribute(
        'aria-label',
        this.paused ? this.pauseButton.dataset.labelPlay : this.pauseButton.dataset.labelPause
      );
      this.pauseButton.querySelector('.announcement-bar__pause-icon').hidden = this.paused;
      this.pauseButton.querySelector('.announcement-bar__play-icon').hidden = !this.paused;
    }

    setupSwipe() {
      let startX = null;
      this.addEventListener('touchstart', (event) => {
        startX = event.touches[0].clientX;
      }, { passive: true });
      this.addEventListener('touchend', (event) => {
        if (startX === null) return;
        const delta = event.changedTouches[0].clientX - startX;
        if (Math.abs(delta) > 40) this.go(this.index + (delta < 0 ? 1 : -1), true);
        startX = null;
      });
    }

    dismiss() {
      const key = this.dataset.dismissKey;
      try {
        if (key) localStorage.setItem(key, '1');
      } catch (error) {
        /* storage can be unavailable in private mode */
      }
      this.hidden = true;
      document.getElementById('MainContent')?.focus({ preventScroll: true });
    }
  }

  customElements.define('lc-announcements', LcAnnouncements);
})();
