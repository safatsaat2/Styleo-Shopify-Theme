/*
  Quick view for product cards.
  Any [data-quick-view="product url"] link opens a dialog with the product's
  media, options, and buy buttons, rendered by the quick-view section.
  The product and gallery scripts and styles load on first use.
  Without JavaScript, the link opens the product page.
*/
(() => {
  const { Lilac } = window;
  if (!Lilac || window.LilacQuickView) return;

  const DIALOG_ID = 'QuickViewDialog';
  const loaded = new Set();

  function loadScript(src) {
    if (!src || loaded.has(src) || document.querySelector(`script[src="${src}"]`)) return Promise.resolve();
    loaded.add(src);
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = resolve;
      document.head.append(script);
    });
  }

  function loadStyle(href) {
    if (!href || document.querySelector(`link[href="${href}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.append(link);
  }

  function ensureDialog() {
    let wrapper = document.getElementById(DIALOG_ID);
    if (wrapper) return wrapper;
    const template = document.getElementById('QuickViewTemplate');
    if (!template) return null;
    document.body.append(template.content.cloneNode(true));
    wrapper = document.getElementById(DIALOG_ID);
    return wrapper;
  }

  async function open(url, trigger) {
    const wrapper = ensureDialog();
    if (!wrapper) {
      window.location.href = url;
      return;
    }
    const body = wrapper.querySelector('[data-quick-view-body]');
    body.innerHTML = wrapper.querySelector('template[data-quick-view-loading]').innerHTML;
    customElements.whenDefined('lc-dialog').then(() => wrapper.open(trigger));

    const assets = Lilac.config.assets || {};
    loadStyle(assets.productCss);

    try {
      const target = new URL(url, window.location.origin);
      target.searchParams.set('section_id', 'quick-view');
      const [response] = await Promise.all([
        fetch(target.toString()),
        loadScript(assets.galleryJs),
        loadScript(assets.productJs),
      ]);
      if (!response.ok) throw new Error(String(response.status));
      const doc = Lilac.parseHTML(await response.text());
      const product = doc.querySelector('lc-product');
      if (!product) throw new Error('empty');
      body.replaceChildren(product);
      wrapper.querySelector('dialog').setAttribute('aria-labelledby', 'QuickViewTitle');
      Lilac.emit(Lilac.events.quickviewOpened, { productUrl: url, productId: product.dataset.productId });
    } catch (error) {
      window.location.href = url;
    }
  }

  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-quick-view]');
    if (!trigger) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button === 1) return;
    event.preventDefault();
    open(trigger.dataset.quickView, trigger);
  });

  window.LilacQuickView = { open };
})();
