const toggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('#main-menu');
const introKey = 'bly-intro-played-v2';
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

if (contactForm) {
  const startedAt = contactForm.querySelector('[name="startedAt"]');
  startedAt.value = Date.now();
}

contactForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const submitButton = contactForm.querySelector('button[type="submit"]');
  const status = contactForm.querySelector('#contact-status');
  const formData = new FormData(contactForm);
  const payload = Object.fromEntries(formData.entries());

  submitButton.disabled = true;
  submitButton.textContent = 'Sending…';
  status.textContent = '';
  status.className = 'form-status';

  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(result.error || 'We could not send your message. Please try again.');
    }

    contactForm.reset();
    contactForm.querySelector('[name="startedAt"]').value = Date.now();
    status.textContent = 'Thanks! Your message has been sent to the store.';
    status.classList.add('is-success');
  } catch (error) {
    status.textContent = error.message;
    status.classList.add('is-error');
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Send Message';
  }
});

function playSiteIntro() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const logo = document.querySelector('.home-logo img');

  if (reducedMotion || !logo || sessionStorage.getItem(introKey) === 'true') {
    document.body.classList.add('site-entered');
    return;
  }

  sessionStorage.setItem(introKey, 'true');
  document.body.classList.add('intro-running');

  const intro = document.createElement('div');
  intro.className = 'brand-intro';
  intro.setAttribute('aria-hidden', 'true');

  const introFlare = document.createElement('div');
  introFlare.className = 'intro-flare';

  const introLogo = logo.cloneNode(true);
  introLogo.className = 'intro-mark';
  introLogo.removeAttribute('fetchpriority');
  intro.append(introFlare, introLogo);
  document.body.append(intro);

  window.setTimeout(() => {
    const introBox = introLogo.getBoundingClientRect();
    const flareBox = introFlare.getBoundingClientRect();
    const destinationBox = logo.getBoundingClientRect();

    document.body.classList.remove('intro-running');
    document.body.classList.add('site-entered');
    intro.classList.add('is-settling');

    const moveX = destinationBox.left + destinationBox.width / 2 - (introBox.left + introBox.width / 2);
    const moveY = destinationBox.top + destinationBox.height / 2 - (introBox.top + introBox.height / 2);
    const scale = destinationBox.width / introBox.width;
    const flareMoveX = destinationBox.left + destinationBox.width / 2 - (flareBox.left + flareBox.width / 2);
    const flareMoveY = destinationBox.top + destinationBox.height / 2 - (flareBox.top + flareBox.height / 2);
    const flareScale = Math.max(destinationBox.width / flareBox.width, .08);

    document.body.classList.add('logo-landed');

    introFlare.getAnimations().forEach((animation) => animation.cancel());
    introFlare.animate([
      { opacity: .72, filter: 'blur(11px) drop-shadow(0 0 16px rgba(218, 166, 55, .22)) drop-shadow(0 0 18px rgba(0, 139, 75, .18))', transform: 'translate(0, 0) scale(1) rotate(18deg)' },
      { opacity: .58, offset: .68, filter: 'blur(7px) drop-shadow(0 0 10px rgba(218, 166, 55, .16)) drop-shadow(0 0 12px rgba(0, 139, 75, .13))', transform: `translate(${flareMoveX * .72}px, ${flareMoveY * .72}px) scale(${Math.max(flareScale * 2.1, .2)}) rotate(108deg)` },
      { opacity: 0, filter: 'blur(2px)', transform: `translate(${flareMoveX}px, ${flareMoveY}px) scale(${flareScale}) rotate(172deg)` }
    ], {
      duration: 2000,
      easing: 'cubic-bezier(.22, 1, .36, 1)',
      fill: 'forwards'
    });

    introLogo.getAnimations().forEach((animation) => animation.cancel());
    introLogo.animate([
      { opacity: 1, filter: 'blur(0)', transform: 'translate(0, 0) scale(1)' },
      { opacity: 0, filter: 'blur(0)', transform: `translate(${moveX}px, ${moveY}px) scale(${scale})` }
    ], {
      duration: 2000,
      easing: 'cubic-bezier(.22, 1, .36, 1)',
      fill: 'forwards'
    });
  }, 1120);

  window.setTimeout(() => {
    intro.remove();
  }, 3400);
}

playSiteIntro();

toggle?.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', String(!open));
  menu.classList.toggle('open', !open);
});
