function element(tag, classes = '', text) {
  const node = document.createElement(tag);
  if (classes) node.classList.add(...classes.split(' '));
  if (text !== undefined) node.textContent = text;
  return node;
}

function productUrl(item) {
  return 'product.html?id=' + encodeURIComponent(item.id);
}

function productImage(item, lazy = true) {
  const image = element('img', 'product-image');
  image.src = item.image;
  image.alt = item.alt;
  image.width = 800;
  image.height = 520;
  image.loading = lazy ? 'lazy' : 'eager';
  image.decoding = 'async';
  return image;
}

function stockLabel(item) {
  const label = element('span', 'stock', getProductStatus(item));
  if (!item.isAvailable) label.classList.add('stock--out');
  return label;
}

function priceLabel(item) {
  const line = element('div', 'price');
  line.append(element('strong', '', formatPrice(item.price)));
  if (item.oldPrice) {
    const old = element('del', '', formatPrice(item.oldPrice));
    old.setAttribute('aria-label', 'Прежняя цена ' + formatPrice(item.oldPrice));
    line.append(old);
  }
  return line;
}

function actionButton(text, action, id, classes = 'button button--primary') {
  const button = element('button', classes, text);
  button.type = 'button';
  button.dataset.action = action;
  button.dataset.productId = id;
  return button;
}

function productActions(item) {
  const group = element('div', 'product-actions');
  const add = actionButton(item.isAvailable ? 'В корзину' : 'Нет в наличии', 'add', item.id);
  add.disabled = !item.isAvailable;
  if (item.isAvailable) add.setAttribute('aria-label', 'В корзину — ' + item.title);
  group.append(add);
  if (item.isAvailable) {
    const quick = actionButton('Быстрый заказ', 'quick', item.id, 'button button--text');
    quick.setAttribute('aria-label', 'Быстрый заказ — ' + item.title);
    group.append(quick);
  }
  return group;
}

function specsTable(item) {
  const table = element('table', 'specs');
  const caption = element('caption', 'visually-hidden', 'Характеристики модели ' + item.title);
  const body = element('tbody');
  for (const [label, value] of item.specs) {
    const row = element('tr');
    const title = element('th', '', label);
    title.scope = 'row';
    row.append(title, element('td', '', value));
    body.append(row);
  }
  table.append(caption, body);
  return table;
}

function createProductCard(item) {
  const card = element('article', 'product-card');
  card.dataset.productId = item.id;
  const media = element('a', 'product-card__media media--' + item.category);
  media.href = productUrl(item);
  media.tabIndex = -1;
  media.setAttribute('aria-hidden', 'true');
  media.append(productImage(item));
  if (item.badge) media.append(element('span', 'product-card__badge', item.badge));
  const body = element('div', 'product-card__body');
  const heading = element('h3', 'product-card__title');
  const link = element('a', '', item.title);
  link.href = productUrl(item);
  heading.append(link);
  const details = element('details', 'product-card__specs');
  details.append(element('summary', '', 'Характеристики'), specsTable(item));
  body.append(stockLabel(item), heading, element('p', 'product-card__description', item.description),
    details, priceLabel(item), productActions(item));
  card.append(media, body);
  return card;
}

function renderProducts(container, items) {
  const cards = document.createDocumentFragment();
  for (const item of items) cards.append(createProductCard(item));
  container.replaceChildren(cards);
}

function renderProductPage() {
  const container = document.querySelector('#product-detail');
  if (!container) return;
  const id = new URLSearchParams(location.search).get('id') ?? products[0].id;
  const item = findProductById(products, id);
  const current = document.querySelector('#current-product');
  if (!item) {
    current.textContent = 'Товар не найден';
    document.title = 'Товар не найден — ShopProject';
    document.querySelector('#unknown-product').hidden = false;
    return;
  }
  current.textContent = item.title;
  document.title = item.title + ' — ShopProject';
  const media = element('div', 'product-detail__media media--' + item.category);
  media.append(productImage(item, false));
  const information = element('div', 'product-detail__info');
  const category = element('a', 'category-link', categories[item.category]);
  category.href = 'catalog.html?category=' + encodeURIComponent(item.category);
  information.append(category, element('h1', '', item.title), stockLabel(item),
    element('p', 'lead', item.description), priceLabel(item), productActions(item));
  container.append(media, information);
  const specs = document.querySelector('#product-specifications');
  specs.append(specsTable(item));
  specs.hidden = false;
}

function renderComparison() {
  const body = document.querySelector('#comparison-rows');
  if (!body) return;
  for (const item of products) {
    const specs = new Map(item.specs);
    const row = element('tr');
    const model = element('th');
    model.scope = 'row';
    const link = element('a', '', item.title);
    link.href = productUrl(item);
    model.append(link);
    row.append(model);
    const features = item.specs.filter(([label]) => !['Подключение', 'Вес', 'Питание'].includes(label));
    for (const value of [categories[item.category], specs.get('Подключение'),
      features.map(([label, detail]) => label + ' — ' + detail).join('. '),
      specs.get('Вес'), specs.get('Питание'), getProductStatus(item), formatPrice(item.price)]) {
      row.append(element('td', '', value));
    }
    body.append(row);
  }
}
