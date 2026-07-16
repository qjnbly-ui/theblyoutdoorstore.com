const toggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('#main-menu');
const gate = document.querySelector('#coming-soon-gate');
const gateForm = document.querySelector('#gate-form');
const passwordInput = document.querySelector('#site-password');
const gateError = document.querySelector('#gate-error');
const accessKey = 'bly-development-access';
const carousel = document.querySelector('.photo-carousel');
const slides = [...document.querySelectorAll('.carousel-slide')];
const slideButtons = [...document.querySelectorAll('.carousel-status button')];
const contactForm = document.querySelector('#contact-form');
let currentSlide = 0;
let carouselTimer;

function showSlide(index) {
  currentSlide = (index + slides.length) % slides.length;

  slides.forEach((slide, slideIndex) => {
    slide.classList.toggle('active', slideIndex === currentSlide);
  });

  slideButtons.forEach((button, buttonIndex) => {
    const active = buttonIndex === currentSlide;
    button.classList.toggle('active', active);
    button.setAttribute('aria-current', active ? 'true' : 'false');
  });
}

function startCarousel() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || slides.length < 2) return;
  window.clearInterval(carouselTimer);
  carouselTimer = window.setInterval(() => showSlide(currentSlide + 1), 6000);
}

slideButtons.forEach((button) => {
  button.addEventListener('click', () => {
    showSlide(Number(button.dataset.slide));
    startCarousel();
  });
});

carousel?.addEventListener('mouseenter', () => window.clearInterval(carouselTimer));
carousel?.addEventListener('mouseleave', startCarousel);
startCarousel();

contactForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = new FormData(contactForm);
  const subject = form.get('subject');
  const body = [
    form.get('message'),
    '',
    `Name: ${form.get('name')}`,
    `Email: ${form.get('email')}`,
    `Phone: ${form.get('phone') || 'Not provided'}`
  ].join('\n');
  window.location.href = `mailto:info@theblyoutdoorstore.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});

function unlockSite() {
  gate?.classList.add('is-unlocked');
  document.body.classList.remove('gate-locked');
}

if (gate) {
  if (sessionStorage.getItem(accessKey) === 'granted') {
    unlockSite();
  } else {
    document.body.classList.add('gate-locked');
    window.addEventListener('load', () => passwordInput?.focus());
  }
}

gateForm?.addEventListener('submit', (event) => {
  event.preventDefault();

  if (passwordInput.value === 'Dave26') {
    sessionStorage.setItem(accessKey, 'granted');
    gateError.textContent = '';
    unlockSite();
  } else {
    gateError.textContent = 'That password is incorrect. Please try again.';
    passwordInput.select();
  }
});

toggle?.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', String(!open));
  menu.classList.toggle('open', !open);
});
