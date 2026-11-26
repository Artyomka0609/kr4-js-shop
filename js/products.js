const rubles = new Intl.NumberFormat('ru-RU', {
  style: 'currency', currency: 'RUB', minimumFractionDigits: 0, maximumFractionDigits: 2
});

function formatPrice(price) {
  return rubles.format(price);
}

function calculateDiscount(price, discountPercent) {
  return Math.round(price * discountPercent) / 100;
}

function calculateFinalPrice(price, discountPercent) {
  return Math.round((price - calculateDiscount(price, discountPercent)) * 100) / 100;
}

function getProductStatus(item) {
  return item.isAvailable ? 'В наличии' : 'Нет в наличии';
}

function createProductSummary(item) {
  return [item.title, formatPrice(item.price), getProductStatus(item)].join(' · ');
}

const productNames = new Intl.Collator('ru', {numeric: true, sensitivity: 'base'});

function getProductTitles(items) {
  return items.map(item => item.title);
}

function getAvailableProducts(items) {
  return items.filter(item => item.isAvailable);
}

function searchProducts(items, query = '') {
  const text = query.trim().toLocaleLowerCase('ru');
  return items.filter(item => item.title.toLocaleLowerCase('ru').includes(text));
}

function filterProductsByCategory(items, category = 'all') {
  return category === 'all' ? [...items] : items.filter(item => item.category === category);
}

function sortProductsByPrice(items, direction = 'asc') {
  const factor = direction === 'desc' ? -1 : 1;
  return [...items].sort((left, right) => factor * (left.price - right.price));
}

function findProductById(items, id) {
  return items.find(item => item.id === id);
}

function calculateTotalPrice(items) {
  return items.reduce((total, item) => total + item.price, 0);
}

function countAvailableProducts(items) {
  return getAvailableProducts(items).length;
}

function calculateAveragePrice(items) {
  return items.length ? Math.round(calculateTotalPrice(items) / items.length) : 0;
}

function getPreparedProducts(items, query = '', category = 'all', sort = 'default', options = {}) {
  let result = filterProductsByCategory(searchProducts(items, query), category);
  if (options.inStock) result = getAvailableProducts(result);
  const min = options.minPrice ?? 0;
  const max = options.maxPrice ?? Infinity;
  result = result.filter(item => item.price >= min && item.price <= max);
  if (sort === 'asc' || sort === 'desc') return sortProductsByPrice(result, sort);
  if (sort === 'name') result.sort((left, right) => productNames.compare(left.title, right.title));
  return result;
}
