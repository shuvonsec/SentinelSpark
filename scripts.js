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

const platformTabs = document.querySelector('.platform-tabs');
const tabButtons = platformTabs ? Array.from(platformTabs.querySelectorAll('.tab-button')) : [];

const activateTab = (button, { focus = false } = {}) => {
  const targetId = button.getAttribute('aria-controls');
  if (!targetId) return;

  const targetPanel = document.getElementById(targetId);
  if (!targetPanel) return;

  tabButtons.forEach((tab) => {
    const controlsId = tab.getAttribute('aria-controls');
    const panel = controlsId ? document.getElementById(controlsId) : null;
    const isActive = tab === button;

    tab.classList.toggle('is-active', isActive);
    tab.setAttribute('aria-selected', String(isActive));
    tab.setAttribute('tabindex', isActive ? '0' : '-1');

    if (panel) {
      panel.classList.toggle('is-active', isActive);
      if (isActive) {
        panel.removeAttribute('hidden');
      } else {
        panel.setAttribute('hidden', '');
      }
    }
  });

  if (focus) {
    button.focus();
  }
};

const focusTabByIndex = (index) => {
  if (!tabButtons.length) return;

  const boundedIndex = ((index % tabButtons.length) + tabButtons.length) % tabButtons.length;
  const targetTab = tabButtons[boundedIndex];
  if (targetTab) {
    activateTab(targetTab, { focus: true });
  }
};

if (tabButtons.length) {
  const defaultTab = tabButtons.find((tab) => tab.getAttribute('aria-selected') === 'true') || tabButtons[0];
  if (defaultTab) {
    activateTab(defaultTab);
  }

  tabButtons.forEach((button, index) => {
    button.addEventListener('click', () => {
      activateTab(button, { focus: true });
    });

    button.addEventListener('keydown', (event) => {
      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          event.preventDefault();
          focusTabByIndex(index + 1);
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          event.preventDefault();
          focusTabByIndex(index - 1);
          break;
        case 'Home':
          event.preventDefault();
          focusTabByIndex(0);
          break;
        case 'End':
          event.preventDefault();
          focusTabByIndex(tabButtons.length - 1);
          break;
        case ' ':
        case 'Enter':
          event.preventDefault();
          activateTab(button, { focus: true });
          break;
        default:
          break;
      }
    });
  });
}
