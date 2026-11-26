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
  return item.inStock ? 'В наличии' : 'Нет в наличии';
}

function createProductSummary(item) {
  return [item.name, formatPrice(item.price), getProductStatus(item)].join(' · ');
}
