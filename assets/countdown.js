/*
  <lc-countdown data-end="ISO date">
  Ticks once a second toward a merchant-set end date. At zero it shows the
  expired text, or hides itself (and the closest [data-countdown-wrapper]).
*/
(() => {
  if (customElements.get('lc-countdown')) return;

  const pad = (value) => String(value).padStart(2, '0');

  class LcCountdown extends HTMLElement {
    connectedCallback() {
      this.end = Date.parse(this.dataset.end);
      if (Number.isNaN(this.end)) return;
      this.units = {
        days: this.querySelector('[data-unit="days"]'),
        hours: this.querySelector('[data-unit="hours"]'),
        minutes: this.querySelector('[data-unit="minutes"]'),
        seconds: this.querySelector('[data-unit="seconds"]'),
      };
      this.tick();
      this.timer = setInterval(() => this.tick(), 1000);
    }

    disconnectedCallback() {
      clearInterval(this.timer);
    }

    tick() {
      const remaining = this.end - Date.now();
      if (remaining <= 0) {
        clearInterval(this.timer);
        this.expire();
        return;
      }
      const total = Math.floor(remaining / 1000);
      this.units.days.textContent = pad(Math.floor(total / 86400));
      this.units.hours.textContent = pad(Math.floor((total % 86400) / 3600));
      this.units.minutes.textContent = pad(Math.floor((total % 3600) / 60));
      this.units.seconds.textContent = pad(total % 60);
    }

    expire() {
      const text = this.dataset.expiredText;
      if (text) {
        const message = document.createElement('p');
        message.className = 'countdown__expired';
        message.textContent = text;
        this.replaceWith(message);
        return;
      }
      const wrapper = this.closest('[data-countdown-wrapper]');
      if (wrapper && !window.Lilac?.config.designMode) wrapper.hidden = true;
      else this.hidden = true;
    }
  }

  customElements.define('lc-countdown', LcCountdown);
})();
