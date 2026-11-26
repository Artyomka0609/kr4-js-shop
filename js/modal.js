function initOrderDialog() {
  const dialog = document.querySelector('#order-dialog');
  if (!dialog) return;
  const form = dialog.querySelector('form');
  const productName = dialog.querySelector('#quick-product');
  let opener;

  function openRequest(item, trigger) {
    if (item && !item.inStock) return;
    opener = trigger || document.querySelector('main');
    resetRequestForm(form);
    form.dataset.productName = item ? item.name : '';
    form.elements.topic.value = item ? 'product' : 'consultation';
    productName.textContent = item ? createProductSummary(item) : '';
    productName.hidden = !item;
    dialog.querySelector('#quick-success').hidden = true;
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
    form.elements.name.focus({preventScroll: true});
  }

  document.addEventListener('click', event => {
    const trigger = event.target.closest('[data-action="quick"], [data-open-request]');
    if (!trigger) return;
    const id = trigger.dataset.productId;
    const item = id ? findProductById(products, id) : null;
    if (id && !item) return;
    openRequest(item, trigger);
  });
  dialog.querySelector('[data-close-dialog]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right ||
        event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    if (opener && opener.isConnected) opener.focus({preventScroll: true});
  });
  function openFromLink() {
    if (location.hash === '#order-dialog' && !dialog.open) openRequest(null);
  }
  window.addEventListener('hashchange', openFromLink);
  openFromLink();
}
