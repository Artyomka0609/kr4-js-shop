function fieldError(field) {
  const value = field.value.trim();
  switch (field.name) {
    case 'name':
      return value.length >= 2 ? '' : 'Введите имя, минимум два символа.';
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && !field.validity.typeMismatch
        ? '' : 'Введите адрес почты, например name@example.ru.';
    case 'phone': {
      const digits = value.replace(/\D/g, '');
      return /^[+\d()\s-]+$/.test(value) && /^[78]\d{10}$/.test(digits)
        ? '' : 'Введите 11 цифр номера. Первая цифра — 7 или 8.';
    }
    case 'topic':
      return value ? '' : 'Выберите тему заявки.';
    case 'agreement':
      return field.checked ? '' : 'Подтвердите согласие на обработку данных.';
    default:
      return '';
  }
}

function showFieldError(field, message) {
  document.getElementById(field.id + '-error').textContent = message;
  if (message) field.setAttribute('aria-invalid', 'true');
  else field.removeAttribute('aria-invalid');
}

function resetRequestForm(form) {
  form.reset();
  form.hidden = false;
  form.querySelectorAll('[data-validate]').forEach(field => showFieldError(field, ''));
  form.querySelector('[data-form-status]').textContent = '';
}

async function finishCheckout(form) {
  const formArea = document.querySelector('#order-filled');
  const expected = formArea.dataset.cart;
  const entries = readCart();
  const total = cartTotals(entries);
  const cleared = await changeCart(current => {
    if (!current.length || JSON.stringify(current) !== expected) return null;
    return [];
  });
  if (!cleared) {
    renderCart();
    form.querySelector('[data-form-status]').textContent = 'Состав корзины изменился. Проверьте товары перед оформлением.';
    return;
  }
  form.reset();
  formArea.hidden = true;
  document.querySelector('#order-empty').hidden = true;
  const success = document.querySelector('#order-success');
  success.querySelector('p').textContent = 'Количество товаров — ' + total.quantity + '. Сумма — ' +
    formatPrice(total.total) + '. Учебная заявка оформлена.';
  success.hidden = false;
  success.querySelector('h2').focus();
}

function initRequestForms() {
  document.querySelectorAll('[data-request-form]').forEach(form => {
    const fields = Array.from(form.querySelectorAll('[data-validate]'));
    const status = form.querySelector('[data-form-status]');
    let submitting = false;
    form.addEventListener('input', event => {
      const field = event.target;
      if (field.getAttribute('aria-invalid') === 'true') showFieldError(field, fieldError(field));
      if (!form.querySelector('[aria-invalid="true"]')) status.textContent = '';
    });
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (submitting) return;
      const invalid = [];
      for (const field of fields) {
        const message = fieldError(field);
        showFieldError(field, message);
        if (message) invalid.push(field);
      }
      if (invalid.length) {
        status.textContent = 'Исправьте отмеченные поля.';
        invalid[0].focus();
        return;
      }
      submitting = true;
      try {
        if (form.dataset.requestForm === 'checkout') {
          await finishCheckout(form);
        } else {
          const success = document.getElementById(form.dataset.success);
          success.querySelector('p').textContent = form.dataset.productName
            ? 'Учебная заявка оформлена на товар «' + form.dataset.productName + '».'
            : 'Учебная заявка по теме «' + form.elements.topic.selectedOptions[0].textContent + '» принята.';
          form.reset();
          form.hidden = true;
          success.hidden = false;
          success.querySelector('h3').focus();
        }
      } finally {
        submitting = false;
      }
    });
  });
}
