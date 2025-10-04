const nav = document.getElementById('siteNav');
const navToggle = document.getElementById('navToggle');
const yearEl = document.getElementById('currentYear');

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

const parallaxItems = document.querySelectorAll('[data-parallax]');

if (parallaxItems.length && !prefersReducedMotion.matches) {
  const bounds = { width: window.innerWidth, height: window.innerHeight };
  let targetX = 0;
  let targetY = 0;
  let ticking = false;

  const updateParallax = () => {
    parallaxItems.forEach((el) => {
      const depth = Number(el.dataset.parallax) || 12;
      const offsetX = targetX / depth;
      const offsetY = targetY / depth;
      el.style.setProperty('--parallax-x', `${offsetX}px`);
      el.style.setProperty('--parallax-y', `${offsetY}px`);
    });

    ticking = false;
  };

  window.addEventListener('pointermove', (event) => {
    const centerX = bounds.width / 2;
    const centerY = bounds.height / 2;

    targetX = ((event.clientX - centerX) / centerX) * 24;
    targetY = ((event.clientY - centerY) / centerY) * 24;

    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateParallax);
    }
  });

  window.addEventListener('resize', () => {
    bounds.width = window.innerWidth;
    bounds.height = window.innerHeight;
  });
}
