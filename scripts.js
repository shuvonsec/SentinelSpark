const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const root = document.documentElement;
const yearEl = document.getElementById('year');
const navToggle = document.querySelector('.nav-toggle');
const navList = document.querySelector('.nav-list');
const header = document.querySelector('.site-header');
const scrollLockTarget = document.querySelector('[data-scroll-lock]');
let tiltEnabled = false;
let observers = [];

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

function openNav() {
  navToggle?.setAttribute('aria-expanded', 'true');
  navList?.classList.add('is-open');
  scrollLockTarget?.classList.add('nav-open');
}

function closeNav() {
  navToggle?.setAttribute('aria-expanded', 'false');
  navList?.classList.remove('is-open');
  scrollLockTarget?.classList.remove('nav-open');
}

navToggle?.addEventListener('click', () => {
  const expanded = navToggle.getAttribute('aria-expanded') === 'true';
  if (expanded) {
    closeNav();
  } else {
    openNav();
  }
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeNav();
  }
});

navList?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => closeNav());
});

function enableTilt() {
  if (tiltEnabled || prefersReducedMotion.matches) return;
  tiltEnabled = true;
  document.querySelectorAll('[data-tilt]').forEach((element) => {
    const strength = element.dataset.tiltStrength ? Number(element.dataset.tiltStrength) : 10;
    element.__tiltHandler = (event) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const rotateX = ((event.clientY - centerY) / rect.height) * -strength;
      const rotateY = ((event.clientX - centerX) / rect.width) * strength;
      element.style.transform = `perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };
    element.__tiltReset = () => {
      element.style.transform = '';
    };

    element.addEventListener('pointermove', element.__tiltHandler);
    element.addEventListener('pointerleave', element.__tiltReset);
    element.addEventListener('touchend', element.__tiltReset);
  });
}

function disableTilt() {
  if (!tiltEnabled) return;
  tiltEnabled = false;
  document.querySelectorAll('[data-tilt]').forEach((element) => {
    element.removeEventListener('pointermove', element.__tiltHandler);
    element.removeEventListener('pointerleave', element.__tiltReset);
    element.removeEventListener('touchend', element.__tiltReset);
    element.style.transform = '';
  });
}

function initRevealAnimations() {
  observers.forEach((observer) => observer.disconnect());
  observers = [];

  if (prefersReducedMotion.matches) {
    document.querySelectorAll('[data-reveal]').forEach((element) => {
      element.classList.add('is-visible');
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  document.querySelectorAll('[data-reveal]').forEach((element) => {
    element.classList.remove('is-visible');
    observer.observe(element);
  });

  observers.push(observer);
}

function setHeaderState() {
  if (!header) return;
  if (window.scrollY > 32) {
    header.classList.add('is-condensed');
  } else {
    header.classList.remove('is-condensed');
  }
}

function handleMotionPreference() {
  if (prefersReducedMotion.matches) {
    root.classList.add('reduced-motion');
    disableTilt();
  } else {
    root.classList.remove('reduced-motion');
    enableTilt();
  }
  initRevealAnimations();
}

window.addEventListener('scroll', setHeaderState);
window.addEventListener('load', () => {
  setHeaderState();
  handleMotionPreference();
});

prefersReducedMotion.addEventListener('change', handleMotionPreference);
