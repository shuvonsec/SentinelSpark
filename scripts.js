const nav = document.getElementById('siteNav');
const navToggle = document.getElementById('navToggle');
const navOverlay = document.getElementById('navOverlay');
const yearEl = document.getElementById('currentYear');
const prefersReducedMotion =
  typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : { matches: false };

const updateScrollState = () => {
  if (typeof window === 'undefined') return;
  document.body.classList.toggle('is-scrolled', window.scrollY > 16);
};

updateScrollState();
window.addEventListener('scroll', updateScrollState, { passive: true });

const setNavState = (isOpen) => {
  if (!nav || !navToggle) return;
  nav.classList.toggle('open', isOpen);
  navToggle.setAttribute('aria-expanded', String(isOpen));
  navToggle.classList.toggle('active', isOpen);
  document.body.classList.toggle('nav-open', isOpen);
  if (navOverlay) {
    navOverlay.classList.toggle('is-active', isOpen);
    navOverlay.setAttribute('aria-hidden', 'true');
  }
};

const closeNav = () => setNavState(false);

if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    const isOpen = !nav.classList.contains('open');
    setNavState(isOpen);
  });

  if (navOverlay) {
    navOverlay.addEventListener('click', closeNav);
  }

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (!nav.classList.contains('open')) return;

    closeNav();
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      if (nav.classList.contains('open')) {
        closeNav();
      }
    });
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 900 && nav.classList.contains('open')) {
      closeNav();
    }
  });
}

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

const tiltElements = document.querySelectorAll('[data-tilt]');

if (tiltElements.length && !prefersReducedMotion.matches) {
  tiltElements.forEach((element) => {
    element.style.setProperty('--tilt-x', '0deg');
    element.style.setProperty('--tilt-y', '0deg');
    element.style.setProperty('--tilt-elevate', '0px');

    let frameId = null;

    const resetTilt = () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
        frameId = null;
      }
      element.style.setProperty('--tilt-x', '0deg');
      element.style.setProperty('--tilt-y', '0deg');
      element.style.setProperty('--tilt-elevate', '0px');
    };

    element.addEventListener('pointermove', (event) => {
      const rect = element.getBoundingClientRect();
      const offsetX = (event.clientX - rect.left) / rect.width - 0.5;
      const offsetY = (event.clientY - rect.top) / rect.height - 0.5;

      if (frameId) cancelAnimationFrame(frameId);

      frameId = requestAnimationFrame(() => {
        const rotateY = offsetX * 18;
        const rotateX = offsetY * -18;
        element.style.setProperty('--tilt-x', `${rotateY.toFixed(2)}deg`);
        element.style.setProperty('--tilt-y', `${rotateX.toFixed(2)}deg`);
        element.style.setProperty('--tilt-elevate', `${(Math.abs(rotateX) + Math.abs(rotateY)).toFixed(2)}px`);
      });
    });

    ['pointerleave', 'pointercancel', 'pointerup', 'blur'].forEach((eventName) => {
      element.addEventListener(eventName, resetTilt);
    });
  });
}

const tabButtons = document.querySelectorAll('.tab-button');
const panels = document.querySelectorAll('.panel');

tabButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const targetId = button.dataset.tab;
    if (!targetId) return;

    tabButtons.forEach((btn) => {
      const isActive = btn === button;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', String(isActive));
    });

    panels.forEach((panel) => {
      const isActive = panel.id === targetId;
      panel.classList.toggle('active', isActive);
      panel.setAttribute('aria-hidden', String(!isActive));
    });
  });
});

const animatedItems = document.querySelectorAll('[data-animate]');

if (animatedItems.length) {
  if (prefersReducedMotion.matches || !('IntersectionObserver' in window)) {
    animatedItems.forEach((el) => el.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px -40px',
      }
    );

    animatedItems.forEach((el) => observer.observe(el));
  }
}
