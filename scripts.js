const nav = document.getElementById('siteNav');
const navToggle = document.getElementById('navToggle');
const yearEl = document.getElementById('currentYear');
const prefersReducedMotion =
  typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : { matches: false };

const updateScrollState = () => {
  if (typeof window === 'undefined') return;
  document.body.classList.toggle('is-scrolled', window.scrollY > 12);
};

updateScrollState();
window.addEventListener('scroll', updateScrollState, { passive: true });

if (navToggle && nav) {
  const closeMenu = () => {
    nav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.classList.remove('active');
  };

  navToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.classList.toggle('active', isOpen);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (!nav.classList.contains('open')) return;
    closeMenu();
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      if (!nav.classList.contains('open')) return;
      closeMenu();
    });
  });
}

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

const tiltElements = document.querySelectorAll('[data-tilt]');
const tiltCleanups = new Map();

const resetTiltStyles = (element) => {
  element.style.setProperty('--tilt-x', '0deg');
  element.style.setProperty('--tilt-y', '0deg');
  element.style.setProperty('--tilt-elevate', '0px');
};

tiltElements.forEach((element) => resetTiltStyles(element));

const disableTilt = () => {
  tiltCleanups.forEach((cleanup) => cleanup());
  tiltCleanups.clear();
  tiltElements.forEach((element) => resetTiltStyles(element));
};

const enableTilt = () => {
  if (prefersReducedMotion.matches) return;
  tiltElements.forEach((element) => {
    if (tiltCleanups.has(element)) return;

    let frameId = null;

    const resetTilt = () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
        frameId = null;
      }
      resetTiltStyles(element);
    };

    const handlePointerMove = (event) => {
      const rect = element.getBoundingClientRect();
      const offsetX = (event.clientX - rect.left) / rect.width - 0.5;
      const offsetY = (event.clientY - rect.top) / rect.height - 0.5;

      if (frameId) cancelAnimationFrame(frameId);

      frameId = requestAnimationFrame(() => {
        const rotateY = offsetX * 16;
        const rotateX = offsetY * -16;
        element.style.setProperty('--tilt-x', `${rotateY.toFixed(2)}deg`);
        element.style.setProperty('--tilt-y', `${rotateX.toFixed(2)}deg`);
        element.style.setProperty('--tilt-elevate', `${(Math.abs(rotateX) + Math.abs(rotateY)).toFixed(2)}px`);
      });
    };

    const resetEvents = ['pointerleave', 'pointercancel', 'pointerup', 'blur'];

    element.addEventListener('pointermove', handlePointerMove);
    resetEvents.forEach((eventName) => {
      element.addEventListener(eventName, resetTilt);
    });

    tiltCleanups.set(element, () => {
      element.removeEventListener('pointermove', handlePointerMove);
      resetEvents.forEach((eventName) => {
        element.removeEventListener(eventName, resetTilt);
      });
      if (frameId) {
        cancelAnimationFrame(frameId);
        frameId = null;
      }
      resetTiltStyles(element);
    });
  });
};

if (tiltElements.length && !prefersReducedMotion.matches) {
  enableTilt();
}

const tabButtons = document.querySelectorAll('.tab-button');
const panels = document.querySelectorAll('.panel');
let autoTabInterval = null;
let focusedByUser = false;

const activateTab = (button) => {
  const targetId = button.dataset.tab;
  if (!targetId) return;

  tabButtons.forEach((btn) => {
    const isActive = btn === button;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-selected', String(isActive));
    btn.setAttribute('tabindex', isActive ? '0' : '-1');
  });

  panels.forEach((panel) => {
    const isActive = panel.id === targetId;
    panel.classList.toggle('active', isActive);
    panel.setAttribute('aria-hidden', String(!isActive));
  });
};

const scheduleAutoTabs = () => {
  if (!tabButtons.length) return;
  if (prefersReducedMotion.matches) return;
  clearInterval(autoTabInterval);
  autoTabInterval = setInterval(() => {
    if (focusedByUser) return;
    const activeIndex = Array.from(tabButtons).findIndex((button) => button.classList.contains('active'));
    const nextIndex = (activeIndex + 1) % tabButtons.length;
    activateTab(tabButtons[nextIndex]);
  }, 6000);
};

if (tabButtons.length) {
  tabButtons.forEach((button) => {
    button.addEventListener('click', () => {
      focusedByUser = true;
      activateTab(button);
      scheduleAutoTabs();
    });

    button.addEventListener('focus', () => {
      focusedByUser = true;
    });

    button.addEventListener('blur', () => {
      focusedByUser = false;
    });

    button.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
      event.preventDefault();
      const buttons = Array.from(tabButtons);
      const currentIndex = buttons.indexOf(button);
      const offset = event.key === 'ArrowRight' ? 1 : -1;
      const nextIndex = (currentIndex + offset + buttons.length) % buttons.length;
      const nextButton = buttons[nextIndex];
      nextButton.focus();
      activateTab(nextButton);
      scheduleAutoTabs();
    });
  });

  scheduleAutoTabs();
}

const handleMotionPreferenceChange = (event) => {
  const shouldReduce = typeof event === 'object' && 'matches' in event ? event.matches : prefersReducedMotion.matches;

  if (shouldReduce) {
    disableTilt();
    if (autoTabInterval) {
      clearInterval(autoTabInterval);
      autoTabInterval = null;
    }
  } else {
    enableTilt();
    scheduleAutoTabs();
  }
};

if (typeof prefersReducedMotion.addEventListener === 'function') {
  prefersReducedMotion.addEventListener('change', handleMotionPreferenceChange);
} else if (typeof prefersReducedMotion.addListener === 'function') {
  prefersReducedMotion.addListener(handleMotionPreferenceChange);
}

const animatedItems = document.querySelectorAll('[data-animate]');

if (animatedItems.length) {
  if (prefersReducedMotion.matches || !('IntersectionObserver' in window)) {
    animatedItems.forEach((el) => el.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
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

window.addEventListener('beforeunload', () => {
  if (autoTabInterval) {
    clearInterval(autoTabInterval);
  }
});
