const toggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('#main-menu');
const introKey = 'bly-intro-played';
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

function playSiteIntro() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const logo = document.querySelector('.home-logo img');
  const pagePhoto = document.querySelector('.carousel-slide.active, .about-hero > img, .services-photo img, .contact-hero > img, .gallery-cards img');

  if (reducedMotion || !logo || sessionStorage.getItem(introKey) === 'true') {
    document.body.classList.add('site-entered');
    return;
  }

  sessionStorage.setItem(introKey, 'true');
  document.body.classList.add('intro-running');

  const intro = document.createElement('div');
  intro.className = 'brand-intro';
  intro.setAttribute('aria-hidden', 'true');

  if (pagePhoto) {
    const introPhoto = pagePhoto.cloneNode(true);
    introPhoto.className = 'intro-photo';
    introPhoto.removeAttribute('loading');
    introPhoto.removeAttribute('fetchpriority');
    intro.append(introPhoto);
  }

  const introLogo = logo.cloneNode(true);
  introLogo.className = 'intro-mark';
  introLogo.removeAttribute('fetchpriority');
  intro.append(introLogo);
  document.body.append(intro);

  window.setTimeout(() => {
    const introBox = introLogo.getBoundingClientRect();
    const destinationBox = logo.getBoundingClientRect();

    document.body.classList.remove('intro-running');
    document.body.classList.add('site-entered');
    intro.classList.add('is-settling');

    const moveX = destinationBox.left + destinationBox.width / 2 - (introBox.left + introBox.width / 2);
    const moveY = destinationBox.top + destinationBox.height / 2 - (introBox.top + introBox.height / 2);
    const scale = destinationBox.width / introBox.width;

    document.body.classList.add('logo-landed');

    introLogo.getAnimations().forEach((animation) => animation.cancel());
    introLogo.animate([
      { opacity: 1, filter: 'blur(0)', transform: 'translate(0, 0) scale(1)' },
      { opacity: 0, filter: 'blur(0)', transform: `translate(${moveX}px, ${moveY}px) scale(${scale})` }
    ], {
      duration: 900,
      easing: 'cubic-bezier(.22, 1, .36, 1)',
      fill: 'forwards'
    });
  }, 1120);

  window.setTimeout(() => {
    intro.remove();
  }, 2100);
}

playSiteIntro();

toggle?.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', String(!open));
  menu.classList.toggle('open', !open);
});
