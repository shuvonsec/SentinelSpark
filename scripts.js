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

const tablists = document.querySelectorAll('[role="tablist"]');

const activateTab = (tab, tabs, { setFocus = true } = {}) => {
  tabs.forEach((currentTab) => {
    const controlsId = currentTab.getAttribute('aria-controls');
    const panel = controlsId ? document.getElementById(controlsId) : null;
    const isActive = currentTab === tab;

    currentTab.setAttribute('aria-selected', String(isActive));
    currentTab.setAttribute('tabindex', isActive ? '0' : '-1');

    if (panel) {
      panel.toggleAttribute('hidden', !isActive);
    }
  });

  if (setFocus) {
    tab.focus();
  }
};

tablists.forEach((tablist) => {
  const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
  if (!tabs.length) return;

  const initialTab =
    tabs.find((tab) => tab.getAttribute('aria-selected') === 'true') || tabs[0];

  tabs.forEach((tab) => {
    tab.setAttribute('tabindex', tab === initialTab ? '0' : '-1');
    tab.addEventListener('click', () => activateTab(tab, tabs));
  });

  activateTab(initialTab, tabs, { setFocus: false });

  tablist.addEventListener('keydown', (event) => {
    const { key } = event;
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(key)) return;

    event.preventDefault();

    const activeElement = document.activeElement;
    const currentIndex = tabs.indexOf(activeElement);
    const selectedIndex = tabs.findIndex(
      (tab) => tab.getAttribute('aria-selected') === 'true'
    );
    const activeIndex =
      currentIndex !== -1 ? currentIndex : selectedIndex !== -1 ? selectedIndex : 0;

    let nextIndex = activeIndex;

    switch (key) {
      case 'ArrowRight':
        nextIndex = (activeIndex + 1) % tabs.length;
        break;
      case 'ArrowLeft':
        nextIndex = (activeIndex - 1 + tabs.length) % tabs.length;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = tabs.length - 1;
        break;
      default:
        break;
    }

    activateTab(tabs[nextIndex], tabs);
  });
});
