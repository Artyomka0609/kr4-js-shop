function initShoppingButtons() {
  const timers = new WeakMap();
  const status = document.querySelector('#shop-status');
  document.addEventListener('click', async event => {
    const button = event.target.closest('button[data-action]');
    if (!button || button.disabled) return;
    const action = button.dataset.action;
    if (!['add', 'increase', 'decrease', 'remove'].includes(action)) return;
    const id = button.dataset.productId;
    const item = findProductById(products, id);
    if (!item) return;
    const changed = await changeQuantity(id, action);
    if (action === 'add') {
      button.textContent = changed ? 'Добавлено' : 'Уже 99 в корзине';
      clearTimeout(timers.get(button));
      timers.set(button, setTimeout(() => { button.textContent = 'В корзину'; }, 1400));
    }
    const totals = cartTotals(readCart());
    status.textContent = item.title + '. В корзине ' + totals.quantity + ' шт. на ' + formatPrice(totals.total) + '.';
  });
}

function initSpotlight() {
  const link = document.querySelector('#spotlight-link');
  if (!link) return;
  const entries = [
    {category: 'audio', title: 'Наушники Sony', image: 'images/desk-hero-1280.webp',
      sources: 'images/desk-hero-640.webp 640w, images/desk-hero-1280.webp 1280w',
      alt: 'Графитовые наушники, клавиатура и мышь на деревянном столе'},
    {category: 'mice', title: 'Мыши Logitech', image: 'images/category-mice.webp',
      alt: 'Светлая мышь на зелёном коврике'},
    {category: 'keyboards', title: 'Клавиатуры Logitech', image: 'images/category-keyboards.webp',
      alt: 'Светлая клавиатура на деревянной поверхности'}
  ];
  const choices = Array.from(document.querySelectorAll('[data-slide]'));
  function showSlide(index) {
    const slide = entries[index];
    const items = filterProductsByCategory(products, slide.category);
    const lowest = Math.min(...items.map(item => item.price));
    link.href = 'catalog.html?category=' + slide.category;
    document.querySelector('#spotlight-source').srcset = slide.sources || slide.image;
    const image = document.querySelector('#spotlight-image');
    image.src = slide.image;
    image.alt = slide.alt;
    document.querySelector('#spotlight-name').textContent = slide.title;
    document.querySelector('#spotlight-price').textContent = 'От ' + formatPrice(lowest);
    choices.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
  }
  for (const button of choices) {
    button.addEventListener('click', () => showSlide(Number(button.dataset.slide)));
  }
  document.querySelector('#starting-price').textContent = formatPrice(Math.min(...products.map(item => item.price)));
  document.querySelector('#assortment-size').textContent = products.length + ' моделей в трёх категориях';
  showSlide(0);
}

initSpotlight();

const featuredGrid = document.querySelector('#popular-grid');
if (featuredGrid) {
  const featuredIds = ['wh-ch520', 'm100', 'k120'];
  renderProducts(featuredGrid, featuredIds.map(id => findProductById(products, id)));
}
renderProductPage();
if (document.querySelector('#catalog-controls')) initCatalog();
initCart();
initShoppingButtons();
initRequestForms();
initOrderDialog();
