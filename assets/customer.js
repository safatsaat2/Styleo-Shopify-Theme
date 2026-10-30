/*
  Legacy customer account pages.

  <lc-address-form>   fills the province list for the selected country and
                      restores saved values. Country options come from
                      all_country_option_tags, which carry data-provinces.
  form[data-confirm]  asks before submitting (deleting an address).
*/
(() => {
  if (customElements.get('lc-address-form')) return;

  class LcAddressForm extends HTMLElement {
    connectedCallback() {
      this.country = this.querySelector('[data-country-select]');
      this.province = this.querySelector('[data-province-select]');
      this.provinceField = this.querySelector('[data-province-field]');
      if (!this.country || !this.province) return;

      this.selectDefault(this.country);
      this.updateProvinces();
      this.selectDefault(this.province);
      this.country.addEventListener('change', () => this.updateProvinces());
    }

    selectDefault(select) {
      const value = select.dataset.default;
      if (!value) return;
      const option = Array.from(select.options).find((item) => item.value === value || item.textContent.trim() === value);
      if (option) option.selected = true;
    }

    updateProvinces() {
      const option = this.country.options[this.country.selectedIndex];
      let provinces = [];
      try {
        provinces = JSON.parse(option?.dataset.provinces || '[]');
      } catch (error) {
        provinces = [];
      }

      this.province.replaceChildren(
        ...provinces.map(([value, label]) => {
          const item = document.createElement('option');
          item.value = value;
          item.textContent = label;
          return item;
        })
      );

      const hasProvinces = provinces.length > 0;
      this.provinceField.hidden = !hasProvinces;
      this.province.disabled = !hasProvinces;
    }
  }

  customElements.define('lc-address-form', LcAddressForm);

  document.addEventListener('submit', (event) => {
    const form = event.target.closest('form[data-confirm]');
    if (form && !window.confirm(form.dataset.confirm)) event.preventDefault();
  });
})();
