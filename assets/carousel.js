/*
  Scroll-snap carousels.

  <lc-carousel>
    [data-carousel-track]  horizontal scroller (.scroller)
    [data-carousel-prev] / [data-carousel-next]  buttons
    [data-carousel-dots]   optional list that gets one button per slide

  <lc-slideshow> adds autoplay with a pause button, one slide per view,
  and makes off-screen slides inert so keyboard focus stays visible.
  Autoplay pauses on hover and focus, and never runs with reduced motion.
*/
(() => {
  if (customElements.get('lc-carousel')) return;

  const rtl = () => document.documentElement.dir === 'rtl';

  class LcCarousel extends HTMLElement {
    connectedCallback() {
      this.track = this.querySelector('[data-carousel-track]');
      if (!this.track) return;
      this.prevButton = this.querySelector('[data-carousel-prev]');
      this.nextButton = this.querySelector('[data-carousel-next]');
      this.dotsList = this.querySelector('[data-carousel-dots]');

      this.prevButton?.addEventListener('click', () => this.step(-1));
      this.nextButton?.addEventListener('click', () => this.step(1));

      this.buildDots();

      let frame = null;
      this.track.addEventListener(
        'scroll',
        () => {
          if (frame) return;
          frame = requestAnimationFrame(() => {
            frame = null;
            this.update();
          });
        },
        { passive: true }
      );

      this.resizeObserver = new ResizeObserver(() => this.update());
      this.resizeObserver.observe(this.track);

      this.addEventListener('theme:block:select', (event) => {
        const slide = this.slides.find((item) => item.contains(event.target));
        if (slide) this.goTo(this.slides.indexOf(slide), false);
      });

      this.update();
    }

    disconnectedCallback() {
      this.resizeObserver?.disconnect();
    }

    get slides() {
      return Array.from(this.track.children).filter((child) => !child.hidden);
    }

    get scrollPosition() {
      return Math.abs(this.track.scrollLeft);
    }

    get perPage() {
      const first = this.slides[0];
      if (!first) return 1;
      return Math.max(1, Math.round(this.track.clientWidth / first.getBoundingClientRect().width));
    }

    get currentIndex() {
      const slides = this.slides;
      const position = this.scrollPosition;
      let closest = 0;
      let distance = Infinity;
      slides.forEach((slide, index) => {
        const offset = Math.abs(Math.abs(slide.offsetLeft - this.track.offsetLeft) - position);
        if (offset < distance) {
          distance = offset;
          closest = index;
        }
      });
      return closest;
    }

    step(direction) {
      const target = this.currentIndex + direction * this.perPage;
      this.goTo(Math.max(0, Math.min(target, this.slides.length - 1)));
    }

    goTo(index, smooth = true) {
      const slide = this.slides[index];
      if (!slide) return;
      const left = slide.offsetLeft - this.track.offsetLeft;
      this.track.scrollTo({
        left: rtl() ? -Math.abs(left) : left,
        behavior: smooth && !window.Lilac?.prefersReducedMotion() ? 'smooth' : 'auto',
      });
    }

    buildDots() {
      if (!this.dotsList) return;
      const label = this.dotsList.dataset.label || 'Slide [index] of [count]';
      this.dotsList.innerHTML = '';
      const pages = this.slides.length;
      for (let i = 0; i < pages; i += 1) {
        const item = document.createElement('li');
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'carousel__dot';
        button.setAttribute('aria-label', label.replace('[index]', i + 1).replace('[count]', pages));
        button.addEventListener('click', () => this.goTo(i));
        item.append(button);
        this.dotsList.append(item);
      }
    }

    update() {
      const max = this.track.scrollWidth - this.track.clientWidth;
      const position = this.scrollPosition;
      if (this.prevButton) this.prevButton.disabled = position <= 2;
      if (this.nextButton) this.nextButton.disabled = position >= max - 2;
      this.classList.toggle('is-scrollable', max > 2);

      const current = this.currentIndex;
      this.dotsList?.querySelectorAll('.carousel__dot').forEach((dot, index) => {
        dot.setAttribute('aria-current', String(index === current));
      });
      this.onIndexChange?.(current);
    }
  }

  class LcSlideshow extends LcCarousel {
    connectedCallback() {
      super.connectedCallback();
      if (!this.track) return;
      this.delay = Number(this.dataset.autoplay) || 0;
      this.paused = window.Lilac?.prefersReducedMotion?.() || false;
      this.pauseButton = this.querySelector('[data-slideshow-pause]');
      this.pauseButton?.addEventListener('click', () => this.setPaused(!this.paused));

      this.addEventListener('mouseenter', () => this.hold(true));
      this.addEventListener('mouseleave', () => this.hold(false));
      this.addEventListener('focusin', () => this.hold(true));
      this.addEventListener('focusout', (event) => {
        if (!this.contains(event.relatedTarget)) this.hold(false);
      });
      this.addEventListener('theme:block:select', () => this.setPaused(true));

      this.updatePauseButton();
      this.schedule();
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      clearTimeout(this.timer);
    }

    onIndexChange(current) {
      this.slides.forEach((slide, index) => {
        slide.inert = index !== current;
        slide.classList.toggle('is-active', index === current);
      });
    }

    schedule() {
      clearTimeout(this.timer);
      if (!this.delay || this.paused || this.holding || this.slides.length < 2) return;
      this.timer = setTimeout(() => {
        const next = this.currentIndex + 1 >= this.slides.length ? 0 : this.currentIndex + 1;
        this.goTo(next);
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
      this.pauseButton.setAttribute('aria-label', this.paused ? this.pauseButton.dataset.labelPlay : this.pauseButton.dataset.labelPause);
      this.pauseButton.querySelector('[data-icon-pause]').hidden = this.paused;
      this.pauseButton.querySelector('[data-icon-play]').hidden = !this.paused;
    }
  }

  customElements.define('lc-carousel', LcCarousel);
  customElements.define('lc-slideshow', LcSlideshow);
})();
