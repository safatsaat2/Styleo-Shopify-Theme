/*
  Product media.

  <lc-media-gallery>  swipeable carousel on small screens and in carousel or
                      thumbnail layouts; stacked or grid on large screens.
                      Thumbnails, arrows, counter, keyboard support, hover
                      magnifier, full screen zoom dialog, and goToMedia().
  <lc-deferred-media> poster first; loads video, external video, or 3D model
                      on request.
  <lc-spin>           360 degree viewer from an image sequence: drag, swipe,
                      or use arrow keys.
*/
(() => {
  const { Lilac } = window;
  if (customElements.get('lc-media-gallery')) return;

  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

  function loadShopifyFeature(name, onLoad) {
    if (!window.Shopify?.loadFeatures) return;
    window.Shopify.loadFeatures([{ name, version: '1.0', onLoad }]);
  }

  /* -------------------------------------------------------------
     <lc-media-gallery>
  ------------------------------------------------------------- */
  class LcMediaGallery extends HTMLElement {
    connectedCallback() {
      this.track = this.querySelector('[data-gallery-track]');
      if (!this.track) return;
      this.zoomMode = this.dataset.zoom;
      this.current = 0;

      this.querySelector('[data-gallery-prev]')?.addEventListener('click', () => this.go(this.current - 1));
      this.querySelector('[data-gallery-next]')?.addEventListener('click', () => this.go(this.current + 1));
      this.addEventListener('click', (event) => {
        const thumb = event.target.closest('[data-gallery-thumb]');
        if (thumb) this.go(Number(thumb.dataset.galleryThumb));
        const zoom = event.target.closest('[data-zoom-open]');
        if (zoom) this.openZoom(zoom.dataset.zoomOpen, zoom);
      });

      this.track.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowRight') this.go(this.current + 1);
        if (event.key === 'ArrowLeft') this.go(this.current - 1);
      });

      let frame = null;
      this.track.addEventListener(
        'scroll',
        () => {
          if (frame) return;
          frame = requestAnimationFrame(() => {
            frame = null;
            this.syncFromScroll();
          });
        },
        { passive: true }
      );

      if (this.zoomMode === 'hover') this.setupMagnifier();
      this.setupModels();
    }

    get slides() {
      return Array.from(this.track.children);
    }

    get isScroller() {
      return this.track.scrollWidth > this.track.clientWidth + 2;
    }

    go(index) {
      const slides = this.slides;
      if (!slides.length) return;
      const next = (index + slides.length) % slides.length;
      const slide = slides[next];
      if (this.isScroller) {
        this.track.scrollTo({
          left: slide.offsetLeft - this.track.offsetLeft,
          behavior: Lilac?.prefersReducedMotion() ? 'auto' : 'smooth',
        });
      } else {
        slide.scrollIntoView({ block: 'nearest', behavior: Lilac?.prefersReducedMotion() ? 'auto' : 'smooth' });
      }
      this.setActive(next);
    }

    /** Show the media for a variant. In stacked layouts it moves to the top. */
    goToMedia(mediaId) {
      const slide = this.track.querySelector(`[data-media-id="${mediaId}"]`);
      if (!slide) return;
      if (!this.isScroller && this.slides.indexOf(slide) !== 0) {
        this.track.prepend(slide);
        const thumbs = this.querySelector('.gallery__thumbs');
        const thumbItem = thumbs?.querySelector(`[data-gallery-thumb="${slide.dataset.index}"]`)?.closest('li');
        if (thumbItem) thumbs.prepend(thumbItem);
        this.reindex();
        this.setActive(0);
        return;
      }
      this.go(this.slides.indexOf(slide));
    }

    reindex() {
      this.slides.forEach((slide, index) => {
        slide.dataset.index = index;
      });
      this.querySelectorAll('.gallery__thumbs li').forEach((item, index) => {
        const thumb = item.querySelector('[data-gallery-thumb]');
        if (thumb) thumb.dataset.galleryThumb = index;
      });
    }

    syncFromScroll() {
      if (!this.isScroller) return;
      const position = Math.abs(this.track.scrollLeft);
      let closest = 0;
      let distance = Infinity;
      this.slides.forEach((slide, index) => {
        const offset = Math.abs(slide.offsetLeft - this.track.offsetLeft - position);
        if (offset < distance) {
          distance = offset;
          closest = index;
        }
      });
      if (closest !== this.current) this.setActive(closest);
    }

    setActive(index) {
      this.current = index;
      this.slides.forEach((slide, i) => {
        const active = i === index;
        slide.classList.toggle('is-active', active);
        if (!active) slide.querySelectorAll('video').forEach((video) => video.pause());
      });
      this.querySelectorAll('[data-gallery-thumb]').forEach((thumb) => {
        const active = Number(thumb.dataset.galleryThumb) === index;
        thumb.setAttribute('aria-current', String(active));
        if (active) thumb.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      });
      const counter = this.querySelector('[data-gallery-current]');
      if (counter) counter.textContent = String(index + 1);
    }

    setupMagnifier() {
      this.addEventListener('pointermove', (event) => {
        if (!finePointer.matches) return;
        const media = event.target.closest('.product-media--zoomable');
        if (!media) return;
        const image = media.querySelector('img');
        const rect = media.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        image.style.transformOrigin = `${x}% ${y}%`;
        media.classList.add('is-magnified');
      });
      this.addEventListener('pointerout', (event) => {
        const media = event.target.closest('.product-media--zoomable');
        if (media && !media.contains(event.relatedTarget)) media.classList.remove('is-magnified');
      });
    }

    openZoom(mediaId, trigger) {
      const dialog = this.querySelector('lc-dialog');
      if (!dialog) return;
      dialog.open(trigger);
      const item = dialog.querySelector(`[data-zoom-media="${mediaId}"]`);
      requestAnimationFrame(() => item?.scrollIntoView({ block: 'start' }));
    }

    setupModels() {
      const json = this.querySelector('[data-product-models]');
      if (!json) return;
      loadShopifyFeature('shopify-xr', () => {
        if (!window.ShopifyXR) return;
        window.ShopifyXR.addModels(JSON.parse(json.textContent));
        window.ShopifyXR.setupXRElements();
      });
    }
  }

  /* -------------------------------------------------------------
     <lc-deferred-media>
  ------------------------------------------------------------- */
  class LcDeferredMedia extends HTMLElement {
    connectedCallback() {
      this.querySelector('[data-deferred-load]')?.addEventListener('click', () => this.load());
    }

    load() {
      if (this.loaded) return;
      this.loaded = true;
      const template = this.querySelector('template');
      if (!template) return;
      this.append(template.content.cloneNode(true));
      this.classList.add('is-loaded');

      const video = this.querySelector('video');
      if (video) {
        video.play().catch(() => {});
        video.focus();
      }
      const iframe = this.querySelector('iframe');
      if (iframe) iframe.focus();

      const model = this.querySelector('model-viewer');
      if (model) {
        loadShopifyFeature('model-viewer-ui', () => {
          if (window.Shopify?.ModelViewerUI) {
            this.modelUI = new window.Shopify.ModelViewerUI(model);
            this.modelUI.play();
          }
        });
        // Keep swipe gestures on the model instead of the carousel.
        model.addEventListener('pointerdown', (event) => event.stopPropagation());
      }
    }
  }

  /* -------------------------------------------------------------
     <lc-spin>
  ------------------------------------------------------------- */
  class LcSpin extends HTMLElement {
    connectedCallback() {
      this.frames = Array.from(this.querySelectorAll('.spin__frame'));
      if (!this.frames.length) return;
      this.index = 0;
      this.show(0);

      const prime = () => {
        this.frames.forEach((frame) => frame.setAttribute('loading', 'eager'));
      };
      this.addEventListener('pointerenter', prime, { once: true });
      this.addEventListener('focus', prime, { once: true });

      let startX = null;
      let startIndex = 0;
      this.addEventListener('pointerdown', (event) => {
        prime();
        startX = event.clientX;
        startIndex = this.index;
        this.setPointerCapture(event.pointerId);
        this.classList.add('is-dragging');
      });
      this.addEventListener('pointermove', (event) => {
        if (startX === null) return;
        const step = this.clientWidth / this.frames.length / 1.5;
        const delta = Math.round((event.clientX - startX) / step);
        this.show(startIndex - delta);
      });
      const end = () => {
        startX = null;
        this.classList.remove('is-dragging');
      };
      this.addEventListener('pointerup', end);
      this.addEventListener('pointercancel', end);

      this.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          event.stopPropagation();
          this.show(this.index + 1);
        }
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          event.stopPropagation();
          this.show(this.index - 1);
        }
      });
    }

    show(index) {
      const count = this.frames.length;
      this.index = ((index % count) + count) % count;
      this.frames.forEach((frame, i) => frame.classList.toggle('is-active', i === this.index));
    }
  }

  customElements.define('lc-media-gallery', LcMediaGallery);
  customElements.define('lc-deferred-media', LcDeferredMedia);
  customElements.define('lc-spin', LcSpin);
})();
