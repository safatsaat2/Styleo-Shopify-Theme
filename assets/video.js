/*
  <lc-video>
  - External videos (YouTube, Vimeo): show the poster and a play button;
    the iframe loads only after the customer presses play.
  - Self-hosted videos: markup lives in a <template> and loads when the
    section scrolls into view. Background videos autoplay muted and loop,
    unless the customer prefers reduced motion. A pause button is always
    available for autoplaying video.
*/
(() => {
  if (customElements.get('lc-video')) return;

  class LcVideo extends HTMLElement {
    connectedCallback() {
      this.autoplay = this.dataset.autoplay === 'true';
      this.playButton = this.querySelector('[data-video-play]');
      this.pauseButton = this.querySelector('[data-video-pause]');
      this.target = this.querySelector('[data-video-target]');

      this.playButton?.addEventListener('click', () => this.load(true));
      this.pauseButton?.addEventListener('click', () => this.togglePause());

      if (this.autoplay && !window.Lilac?.prefersReducedMotion()) {
        this.observer = new IntersectionObserver(
          (entries) => {
            if (entries.some((entry) => entry.isIntersecting)) {
              this.observer.disconnect();
              this.load(false);
            }
          },
          { rootMargin: '200px' }
        );
        this.observer.observe(this);
      }
    }

    disconnectedCallback() {
      this.observer?.disconnect();
    }

    load(userInitiated) {
      if (this.loaded) {
        this.video?.play();
        return;
      }
      this.loaded = true;
      const template = this.querySelector('template');
      if (!template) return;
      const content = template.content.cloneNode(true);
      this.target.replaceChildren(content);
      this.classList.add('is-loaded', userInitiated ? 'is-interactive' : 'is-background');

      this.video = this.target.querySelector('video');
      const iframe = this.target.querySelector('iframe');

      if (this.video) {
        if (!userInitiated) {
          this.video.muted = true;
          this.video.loop = true;
          this.video.setAttribute('playsinline', '');
        } else {
          this.video.controls = true;
        }
        this.video.play().catch(() => {
          // Autoplay blocked: fall back to controls.
          this.video.controls = true;
        });
        if (this.pauseButton) this.pauseButton.hidden = userInitiated;
      }

      if (iframe && userInitiated) iframe.focus();
      if (this.playButton) this.playButton.hidden = true;
    }

    togglePause() {
      if (!this.video) return;
      if (this.video.paused) this.video.play();
      else this.video.pause();
      const paused = this.video.paused;
      this.pauseButton.setAttribute('aria-label', paused ? this.pauseButton.dataset.labelPlay : this.pauseButton.dataset.labelPause);
      this.pauseButton.querySelector('[data-icon-pause]').hidden = paused;
      this.pauseButton.querySelector('[data-icon-play]').hidden = !paused;
    }
  }

  customElements.define('lc-video', LcVideo);
})();
