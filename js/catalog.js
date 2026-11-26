function initCatalog() {
  const form = document.querySelector('#catalog-controls');
  if (!form) return;
  const fields = form.elements;
  const results = document.querySelector('#catalog-grid');
  const count = document.querySelector('#catalog-result-count');
  const empty = document.querySelector('#catalog-empty');
  const error = document.querySelector('#range-error');
  const panel = document.querySelector('#filter-panel');
  const toggle = document.querySelector('#filter-toggle');
  const smallScreen = matchMedia('(max-width: 55rem)');
  let filtersOpen = false;

  function displayFilters() {
    panel.hidden = smallScreen.matches && !filtersOpen;
    toggle.setAttribute('aria-expanded', String(!panel.hidden));
  }

  function readUrl() {
    const params = new URLSearchParams(location.search);
    fields.q.value = params.get('q') || '';
    const category = params.get('category');
    fields.category.value = Object.hasOwn(categories, category) ? category : 'all';
    const sort = params.get('sort');
    fields.sort.value = ['asc', 'desc', 'name'].includes(sort) ? sort : 'default';
    fields.min.value = params.get('min') || '';
    fields.max.value = params.get('max') || '';
    fields.available.checked = params.get('available') === '1';
  }

  function writeUrl() {
    const url = new URL(location.href);
    const pairs = {q: fields.q.value.trim(), category: fields.category.value === 'all' ? '' : fields.category.value,
      sort: fields.sort.value === 'default' ? '' : fields.sort.value, min: fields.min.value,
      max: fields.max.value, available: fields.available.checked ? '1' : ''};
    for (const [key, value] of Object.entries(pairs)) {
      if (value) url.searchParams.set(key, value);
      else url.searchParams.delete(key);
    }
    if (url.href !== location.href && location.protocol !== 'file:') history.replaceState(null, '', url);
  }

  function updateCatalog() {
    const min = fields.min.valueAsNumber;
    const max = fields.max.valueAsNumber;
    const invalid = !fields.min.validity.valid || !fields.max.validity.valid || min > max;
    error.textContent = invalid ? 'Введите целые цены от нуля. Цена «от» должна быть не больше цены «до».' : '';
    fields.min.setAttribute('aria-invalid', String(invalid));
    fields.max.setAttribute('aria-invalid', String(invalid));
    if (invalid) return;
    const filtered = getPreparedProducts(products, fields.q.value, fields.category.value, fields.sort.value, {
      inStock: fields.available.checked,
      minPrice: Number.isNaN(min) ? 0 : min,
      maxPrice: Number.isNaN(max) ? Infinity : max
    });
    renderProducts(results, filtered);
    count.textContent = 'Показано ' + filtered.length + ' из ' + products.length;
    empty.hidden = filtered.length !== 0;
    writeUrl();
  }

  function resetFilters() {
    fields.q.value = '';
    fields.category.value = 'all';
    fields.sort.value = 'default';
    fields.available.checked = false;
    fields.min.value = '';
    fields.max.value = '';
    updateCatalog();
  }

  toggle.addEventListener('click', () => {
    filtersOpen = !filtersOpen;
    displayFilters();
  });
  smallScreen.addEventListener('change', displayFilters);
  form.addEventListener('input', event => {
    if (event.target.matches('input[type="search"], input[type="number"]')) updateCatalog();
  });
  form.addEventListener('change', event => {
    if (event.target.matches('select, input[type="checkbox"]')) updateCatalog();
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    updateCatalog();
    if (smallScreen.matches && !error.textContent) {
      filtersOpen = false;
      displayFilters();
      toggle.focus();
    }
  });
  form.addEventListener('reset', event => {
    event.preventDefault();
    resetFilters();
  });
  document.querySelector('#clear-empty').addEventListener('click', () => {
    resetFilters();
    fields.q.focus();
  });
  window.addEventListener('popstate', () => {
    readUrl();
    updateCatalog();
  });
  readUrl();
  displayFilters();
  updateCatalog();
  renderComparison();
  document.querySelector('#catalog-statistics').textContent =
    'Моделей в наличии — ' + countAvailableProducts(products) + ' из ' + products.length +
    '. Средняя цена по каталогу — ' + formatPrice(calculateAveragePrice(products)) + '.';
}
