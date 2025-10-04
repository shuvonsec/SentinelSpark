const nav = document.getElementById('mainNav');
const menuToggle = document.getElementById('menuToggle');
const yearEl = document.getElementById('year');

if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });
}

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

const navLinks = nav?.querySelectorAll('a[href^="#"]');
navLinks?.forEach((link) => {
  link.addEventListener('click', () => {
    if (nav.classList.contains('open')) {
      nav.classList.remove('open');
      menuToggle?.setAttribute('aria-expanded', 'false');
    }
  });
});
