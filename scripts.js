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

const tabList = document.querySelector('.platform-tabs');
const tabButtons = tabList ? Array.from(tabList.querySelectorAll('.tab-button')) : [];

if (tabButtons.length) {
  const activateTab = (targetTab, { focus = false } = {}) => {
    tabButtons.forEach((button) => {
      const isActive = button === targetTab;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-selected', String(isActive));
      button.setAttribute('tabindex', isActive ? '0' : '-1');

      const panelId = button.getAttribute('aria-controls');
      const panel = panelId ? document.getElementById(panelId) : null;
      if (panel) {
        panel.classList.toggle('is-active', isActive);
        if (isActive) {
          panel.removeAttribute('hidden');
        } else {
          panel.setAttribute('hidden', '');
        }
      }

      if (isActive && focus) {
        button.focus();
      }
    });
  };

  tabButtons.forEach((button) => {
    button.addEventListener('click', () => {
      activateTab(button);
    });

    button.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft' && event.key !== 'Home' && event.key !== 'End') {
        return;
      }

      event.preventDefault();
      const currentIndex = tabButtons.indexOf(button);

      if (event.key === 'Home') {
        activateTab(tabButtons[0], { focus: true });
        return;
      }

      if (event.key === 'End') {
        activateTab(tabButtons[tabButtons.length - 1], { focus: true });
        return;
      }

      const direction = event.key === 'ArrowRight' ? 1 : -1;
      const nextIndex = (currentIndex + direction + tabButtons.length) % tabButtons.length;
      activateTab(tabButtons[nextIndex], { focus: true });
    });
  });
}
