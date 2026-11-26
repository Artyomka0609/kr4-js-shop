const themeKey = 'shopproject.theme.v1';
const themeButton = document.querySelector('#theme-toggle');

function applyTheme(value) {
  const dark = value === 'dark';
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  themeButton.setAttribute('aria-pressed', String(dark));
  themeButton.title = dark ? 'Включить светлую тему' : 'Включить тёмную тему';
  themeButton.firstElementChild.textContent = dark ? '☀' : '☾';
}

let savedTheme = 'light';
try {
  savedTheme = localStorage.getItem(themeKey);
} catch {
  // При закрытом хранилище переключатель продолжает работать на странице.
}
applyTheme(savedTheme);
themeButton.addEventListener('click', () => {
  const value = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(value);
  try { localStorage.setItem(themeKey, value); } catch { /* Тема уже применена. */ }
});
window.addEventListener('storage', event => {
  if (event.key === themeKey || event.key === null) applyTheme(event.newValue);
});

const siteMenu = document.querySelector('#site-nav');
const menuButton = document.querySelector('#menu-toggle');
const compactHeader = matchMedia('(max-width: 47.99rem)');
let menuOpen = false;

function displayMenu() {
  menuButton.hidden = !compactHeader.matches;
  siteMenu.hidden = compactHeader.matches && !menuOpen;
  menuButton.setAttribute('aria-expanded', String(!siteMenu.hidden));
}
menuButton.addEventListener('click', () => {
  menuOpen = !menuOpen;
  displayMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuOpen && compactHeader.matches) {
    menuOpen = false;
    displayMenu();
    menuButton.focus();
  }
});
compactHeader.addEventListener('change', displayMenu);
displayMenu();
