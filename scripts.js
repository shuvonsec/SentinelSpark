const nav = document.getElementById('siteNav');
const navToggle = document.getElementById('navToggle');
const yearEl = document.getElementById('currentYear');
const prefersReducedMotion =
  typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : { matches: false };

const updateScrollState = () => {
  if (typeof window === 'undefined') return;
  document.body.classList.toggle('is-scrolled', window.scrollY > 16);

  const doc = document.documentElement;
  const scrollHeight = doc.scrollHeight - doc.clientHeight;
  const progress = scrollHeight > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollHeight)) : 0;
  document.body.style.setProperty('--scroll-progress', progress.toFixed(3));
};

updateScrollState();
window.addEventListener('scroll', updateScrollState, { passive: true });
window.addEventListener('resize', updateScrollState);

if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.classList.toggle('active', isOpen);
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      if (nav.classList.contains('open')) {
        nav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.classList.remove('active');
      }
    });
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
