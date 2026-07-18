const toggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('#main-menu');
const introKey = 'bly-intro-played-v2';
const carousel = document.querySelector('.photo-carousel');
const slides = [...document.querySelectorAll('.carousel-slide')];
const slideButtons = [...document.querySelectorAll('.carousel-status button')];
const contactForm = document.querySelector('#contact-form');
let currentSlide = 0;
let carouselTimer;

function getPacificDate() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date());
  const date = Object.fromEntries(parts.map(({ type, value }) => [type, value]));

  return `${date.year}-${date.month}-${date.day}`;
}

function showBirthdayAnnouncement() {
  const birthday = '2026-07-18';
  const existingAnnouncement = document.querySelector('.birthday-announcement');

  if (getPacificDate() !== birthday) {
    existingAnnouncement?.remove();
    return;
  }

  if (existingAnnouncement) return;

  const announcement = document.createElement('aside');
  announcement.className = 'birthday-announcement';
  announcement.setAttribute('aria-label', 'Birthday announcement');
  announcement.innerHTML = `
    <p><span class="birthday-kicker">Today we celebrate our owner</span>
      <strong>Happy Birthday, Dave Wilson!</strong>
      <span class="birthday-wish">From all of us at The Bly Outdoor Store</span>
    </p>
  `;

  document.body.prepend(announcement);
  scheduleBirthdayConfetti();
}

function launchBirthdayConfetti() {
  if (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    document.querySelector('.birthday-confetti-screen')
  ) return;

  const announcement = document.querySelector('.birthday-announcement');
  if (!announcement) return;

  const headlineBox = announcement.querySelector('strong').getBoundingClientRect();
  const colors = ['#008b4b', '#daa637', '#ffe175', '#ffffff', '#282329'];
  const confetti = document.createElement('div');
  confetti.className = 'birthday-confetti-screen';
  confetti.setAttribute('aria-hidden', 'true');
  announcement.classList.add('is-celebrating');

  for (let index = 0; index < 110; index += 1) {
    const piece = document.createElement('i');
    const left = headlineBox.left + headlineBox.width * Math.random();
    const burstX = (Math.random() - .5) * 42;
    const drift = burstX * .65 + (Math.random() - .5) * 16;
    const delay = Math.random() * .1;
    const duration = 2.8 + Math.random() * 2.2;
    const size = 6 + Math.random() * 8;

    piece.style.setProperty('--confetti-left', `${left}px`);
    piece.style.setProperty('--confetti-top', `${headlineBox.top + headlineBox.height * (.25 + Math.random() * .5)}px`);
    piece.style.setProperty('--confetti-burst-x', `${burstX}vw`);
    piece.style.setProperty('--confetti-burst-y', `${-7 - Math.random() * 15}vh`);
    piece.style.setProperty('--confetti-drift', `${drift}vw`);
    piece.style.setProperty('--confetti-delay', `${delay}s`);
    piece.style.setProperty('--confetti-duration', `${duration}s`);
    piece.style.setProperty('--confetti-size', `${size}px`);
    piece.style.setProperty('--confetti-color', colors[index % colors.length]);
    piece.style.setProperty('--confetti-spin', `${360 + Math.random() * 720}deg`);
    confetti.append(piece);
  }

  document.body.append(confetti);
  window.setTimeout(() => announcement.classList.remove('is-celebrating'), 1800);
  window.setTimeout(() => confetti.remove(), 6200);
}

function scheduleBirthdayConfetti() {
  const waitForIntro = () => {
    if (document.body.classList.contains('intro-running')) {
      window.setTimeout(waitForIntro, 200);
      return;
    }

    window.setTimeout(launchBirthdayConfetti, 350);
  };

  window.setTimeout(waitForIntro, 100);
}

showBirthdayAnnouncement();
window.setInterval(showBirthdayAnnouncement, 60000);

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
