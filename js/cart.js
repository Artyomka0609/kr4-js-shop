const cartKey = 'shopproject.kr4.cart.v1';
const cartLimit = 99;
let cartMemory = [];
let cartStorageAvailable = true;

function normalizeCart(value) {
  if (!Array.isArray(value)) return [];
  const quantities = new Map();
  for (const entry of value) {
    if (!entry || !Number.isSafeInteger(entry.quantity) || entry.quantity < 1) continue;
    const item = findProductById(products, entry.id);
    if (!item || !item.isAvailable) continue;
    const previous = quantities.get(item.id) || 0;
    quantities.set(item.id, Math.min(cartLimit, previous + entry.quantity));
  }
  return Array.from(quantities, ([id, quantity]) => ({id, quantity}));
}

function readCart() {
  if (!cartStorageAvailable) return cartMemory;
  let raw;
  try {
    raw = localStorage.getItem(cartKey);
  } catch {
    cartStorageAvailable = false;
    return cartMemory;
  }
  try {
    cartMemory = normalizeCart(JSON.parse(raw));
  } catch {
    cartMemory = [];
  }
  return cartMemory;
}

function changeCart(change) {
  function save() {
    const current = readCart().map(entry => ({...entry}));
    const next = change(current);
    if (next === null) return false;
    cartMemory = normalizeCart(next);
    if (cartStorageAvailable) {
      try {
        localStorage.setItem(cartKey, JSON.stringify(cartMemory));
      } catch {
        cartStorageAvailable = false;
      }
    }
    renderCart();
    return true;
  }

  // Две вкладки могут одновременно менять одну и ту же корзину.
  return navigator.locks ? navigator.locks.request(cartKey, save) : Promise.resolve(save());
}

function changeQuantity(id, action) {
  const item = findProductById(products, id);
  if (!item || !item.isAvailable) return Promise.resolve(false);
  return changeCart(entries => {
    const entry = entries.find(line => line.id === id);
    if (!entry) return action === 'add' ? [...entries, {id, quantity: 1}] : null;
    if (action === 'remove') return entries.filter(line => line.id !== id);
    const delta = action === 'decrease' ? -1 : 1;
    const quantity = entry.quantity + delta;
    if (quantity < 1 || quantity > cartLimit) return null;
    entry.quantity = quantity;
    return entries;
  });
}

function cartTotals(entries) {
  let quantity = 0;
  let total = 0;
  for (const entry of entries) {
    const item = findProductById(products, entry.id);
    quantity += entry.quantity;
    total += item.price * entry.quantity;
  }
  return {quantity, total};
}

function quantityButton(item, label, action, disabled = false) {
  const button = actionButton(label, action, item.id, 'quantity__button');
  const verb = action === 'increase' ? 'Увеличить количество' : 'Уменьшить количество';
  button.setAttribute('aria-label', verb + ' — ' + item.title);
  button.disabled = disabled;
  return button;
}

function cartRow(entry) {
  const item = findProductById(products, entry.id);
  const row = element('li', 'cart-row');
  const photo = element('a', 'cart-row__media media--' + item.category);
  photo.href = productUrl(item);
  photo.tabIndex = -1;
  photo.setAttribute('aria-hidden', 'true');
  photo.append(productImage(item));
  const info = element('div', 'cart-row__info');
  const link = element('a', 'cart-row__name', item.title);
  link.href = productUrl(item);
  info.append(link, element('span', 'muted', formatPrice(item.price) + ' за шт.'));
  const control = element('div', 'quantity');
  control.setAttribute('role', 'group');
  control.setAttribute('aria-label', 'Количество — ' + item.title);
  control.append(quantityButton(item, '−', 'decrease', entry.quantity === 1),
    element('span', 'quantity__value', entry.quantity), quantityButton(item, '+', 'increase', entry.quantity === cartLimit));
  const buttons = element('div', 'cart-row__controls');
  const remove = actionButton('Удалить', 'remove', item.id, 'text-control');
  remove.setAttribute('aria-label', 'Удалить — ' + item.title);
  buttons.append(control, remove);
  row.append(photo, info, buttons, element('strong', 'cart-row__total', formatPrice(item.price * entry.quantity)));
  return row;
}

function renderCart() {
  const entries = readCart();
  const {quantity, total} = cartTotals(entries);
  document.querySelectorAll('[data-cart-count]').forEach(node => { node.textContent = quantity; });
  document.querySelectorAll('[data-cart-total]').forEach(node => { node.textContent = formatPrice(total); });

  const list = document.querySelector('#cart-list');
  if (list) {
    const active = list.contains(document.activeElement) ? document.activeElement.dataset : null;
    list.replaceChildren(...entries.map(cartRow));
    document.querySelector('#cart-empty').hidden = entries.length !== 0;
    document.querySelector('#cart-filled').hidden = entries.length === 0;
    if (active) {
      const controls = Array.from(list.querySelectorAll('button:not(:disabled)'));
      const sameItem = controls.filter(button => button.dataset.productId === active.productId);
      const next = sameItem.find(button => button.dataset.action === active.action) || sameItem[0] || controls[0];
      (next || document.querySelector('#cart-empty a')).focus({preventScroll: true});
    }
  }

  const summary = document.querySelector('#order-items');
  if (summary && document.querySelector('#order-success').hidden) {
    const form = document.querySelector('#order-filled');
    document.querySelector('#order-empty').hidden = entries.length !== 0;
    form.hidden = entries.length === 0;
    const rows = entries.map(entry => {
      const item = findProductById(products, entry.id);
      const row = element('li', 'receipt-row');
      row.append(element('span', '', item.title + ' × ' + entry.quantity),
        element('strong', '', formatPrice(item.price * entry.quantity)));
      return row;
    });
    summary.replaceChildren(...rows);
    form.dataset.cart = JSON.stringify(entries);
  }
}

function initCart() {
  renderCart();
  window.addEventListener('storage', event => {
    if (event.key === cartKey || event.key === null) renderCart();
  });
  window.addEventListener('pageshow', renderCart);
}
