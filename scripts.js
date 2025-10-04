const nav = document.getElementById('siteNav');
const navToggle = document.getElementById('navToggle');
const yearEl = document.getElementById('currentYear');
const prefersReducedMotion =
  typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };

const updateScrollState = () => {
  if (typeof window === 'undefined') return;
  document.body.classList.toggle('is-scrolled', window.scrollY > 12);
};

updateScrollState();
window.addEventListener('scroll', updateScrollState, { passive: true });

if (nav && navToggle) {
  navToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    navToggle.classList.toggle('active', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      if (nav.classList.contains('open')) {
        nav.classList.remove('open');
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
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

if (tabButtons.length && panels.length) {
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
}

const animatedItems = document.querySelectorAll('[data-animate]');

if (animatedItems.length) {
  if (prefersReducedMotion.matches || !('IntersectionObserver' in window)) {
    animatedItems.forEach((el) => el.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -40px' }
    );

    animatedItems.forEach((el) => observer.observe(el));
  }
}

const parallaxItems = document.querySelectorAll('[data-parallax]');

if (parallaxItems.length && !prefersReducedMotion.matches) {
  const updateParallax = () => {
    const scrollY = window.scrollY || window.pageYOffset;
    parallaxItems.forEach((item) => {
      const depth = parseFloat(item.dataset.parallax || '0.3');
      const offset = scrollY * depth * -0.08;
      item.style.setProperty('--parallax-offset', `${offset.toFixed(2)}px`);
    });
  };

  updateParallax();
  window.addEventListener('scroll', updateParallax, { passive: true });
}

const counters = document.querySelectorAll('[data-count]');

if (counters.length) {
  const playCounter = (element) => {
    if (element.dataset.played === 'true') return;
    element.dataset.played = 'true';

    const targetValue = parseFloat(element.dataset.count || '0');
    const decimals = parseInt(element.dataset.decimals || '0', 10);

    if (prefersReducedMotion.matches || !window.requestAnimationFrame) {
      element.textContent = targetValue.toFixed(decimals);
      return;
    }

    const duration = 1800;
    let start = null;

    const animate = (timestamp) => {
      if (start === null) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = targetValue * eased;
      element.textContent = current.toFixed(decimals);
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  };

  if (prefersReducedMotion.matches || !('IntersectionObserver' in window)) {
    counters.forEach((counter) => playCounter(counter));
  } else {
    const counterObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            playCounter(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );

    counters.forEach((counter) => counterObserver.observe(counter));
  }
}
