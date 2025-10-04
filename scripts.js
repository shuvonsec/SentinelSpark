const nav = document.getElementById('siteNav');
const navToggle = document.getElementById('navToggle');
const yearEl = document.getElementById('currentYear');
const header = document.querySelector('.site-header');

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
const prefersReducedMotion =
  typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : { matches: false };

if (header) {
  const setHeaderState = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 24);
  };

  setHeaderState();
  window.addEventListener('scroll', setHeaderState, { passive: true });
}

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

const tiltItems = document.querySelectorAll('[data-tilt]');

if (tiltItems.length) {
  const resetTilt = (el) => {
    el.style.setProperty('--tilt-x', '0deg');
    el.style.setProperty('--tilt-y', '0deg');
    el.style.setProperty('--tilt-glow-x', '50%');
    el.style.setProperty('--tilt-glow-y', '50%');
    el.classList.remove('is-tilting');
  };

  const activateTilt = (event, el) => {
    const bounds = el.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    const normX = x / bounds.width;
    const normY = y / bounds.height;
    const maxTilt = 12;
    const rotateX = (0.5 - normY) * maxTilt;
    const rotateY = (normX - 0.5) * maxTilt;

    el.style.setProperty('--tilt-x', `${rotateX}deg`);
    el.style.setProperty('--tilt-y', `${rotateY}deg`);
    el.style.setProperty('--tilt-glow-x', `${normX * 100}%`);
    el.style.setProperty('--tilt-glow-y', `${normY * 100}%`);
    el.classList.add('is-tilting');
  };

  tiltItems.forEach((item) => {
    resetTilt(item);

    if (prefersReducedMotion.matches) {
      item.classList.add('tilt-disabled');
      return;
    }

    item.addEventListener('pointermove', (event) => {
      activateTilt(event, item);
    });

    item.addEventListener('pointerleave', () => {
      resetTilt(item);
    });

    item.addEventListener('pointerdown', () => {
      item.classList.add('is-active');
    });

    item.addEventListener('pointerup', () => {
      item.classList.remove('is-active');
      resetTilt(item);
    });

    item.addEventListener('pointercancel', () => {
      item.classList.remove('is-active');
      resetTilt(item);
    });
  });
}
