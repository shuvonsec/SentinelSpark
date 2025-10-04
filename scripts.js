const nav = document.getElementById('siteNav');
const navToggle = document.getElementById('navToggle');
const navOverlay = document.getElementById('navOverlay');
const yearEl = document.getElementById('currentYear');
const pageBody = document.body;
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

if (navToggle && nav) {
  const setNavState = (isOpen) => {
    nav.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.classList.toggle('active', isOpen);
    if (pageBody) {
      pageBody.classList.toggle('menu-open', isOpen);
    }
    if (navOverlay) {
      navOverlay.classList.toggle('visible', isOpen);
    }
  };

  navToggle.addEventListener('click', () => {
    setNavState(!nav.classList.contains('open'));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (!nav.classList.contains('open')) return;
    setNavState(false);
  });

  if (navOverlay) {
    navOverlay.addEventListener('click', () => setNavState(false));
  }

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      if (nav.classList.contains('open')) {
        setNavState(false);
      }
    });
  });
}

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

const tiltElements = Array.from(document.querySelectorAll('[data-tilt]'));
const tiltHandlers = new WeakMap();
const tiltExitEvents = ['pointerleave', 'pointercancel', 'pointerup', 'blur'];

const attachTilt = (element) => {
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

  const handlePointerMove = (event) => {
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
  };

  const handleExit = () => {
    resetTilt();
  };

  element.style.setProperty('--tilt-x', '0deg');
  element.style.setProperty('--tilt-y', '0deg');
  element.style.setProperty('--tilt-elevate', '0px');

  element.addEventListener('pointermove', handlePointerMove);
  tiltExitEvents.forEach((eventName) => {
    element.addEventListener(eventName, handleExit);
  });

  tiltHandlers.set(element, {
    handlePointerMove,
    handleExit,
    resetTilt,
  });
};

const detachTilt = (element) => {
  const handlers = tiltHandlers.get(element);
  if (!handlers) return;

  handlers.resetTilt();
  element.removeEventListener('pointermove', handlers.handlePointerMove);
  tiltExitEvents.forEach((eventName) => {
    element.removeEventListener(eventName, handlers.handleExit);
  });

  element.style.removeProperty('--tilt-x');
  element.style.removeProperty('--tilt-y');
  element.style.removeProperty('--tilt-elevate');

  tiltHandlers.delete(element);
};

const syncTiltWithPreferences = () => {
  tiltElements.forEach((element) => {
    if (prefersReducedMotion.matches) {
      detachTilt(element);
    } else if (!tiltHandlers.has(element)) {
      attachTilt(element);
    }
  });
};

if (tiltElements.length) {
  syncTiltWithPreferences();

  const motionListener = (event) => {
    const mediaQuery = event && typeof event.matches === 'boolean' ? event : prefersReducedMotion;
    if (mediaQuery.matches) {
      tiltElements.forEach(detachTilt);
    } else {
      syncTiltWithPreferences();
    }
  };

  if (typeof prefersReducedMotion.addEventListener === 'function') {
    prefersReducedMotion.addEventListener('change', motionListener);
  } else if (typeof prefersReducedMotion.addListener === 'function') {
    prefersReducedMotion.addListener(motionListener);
  }
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
