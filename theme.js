// POPCORN PARDNER — theme.js
// Runs immediately (loaded in <head>) to apply saved theme before paint,
// preventing a flash of the wrong theme on page load.

(function () {
  if (localStorage.getItem('popcornPardnerTheme') === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();

function toggleTheme() {
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  if (isLight) {
    document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('popcornPardnerTheme', 'dark');
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('popcornPardnerTheme', 'light');
  }
  updateThemeButton();
}

function updateThemeButton() {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  btn.textContent = isLight ? '🌙 Dark' : '☀ Light';
  btn.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
}

document.addEventListener('DOMContentLoaded', updateThemeButton);
