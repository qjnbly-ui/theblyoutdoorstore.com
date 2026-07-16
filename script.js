const toggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('#main-menu');
const gate = document.querySelector('#coming-soon-gate');
const gateForm = document.querySelector('#gate-form');
const passwordInput = document.querySelector('#site-password');
const gateError = document.querySelector('#gate-error');
const accessKey = 'bly-development-access';

function unlockSite() {
  gate?.classList.add('is-unlocked');
  document.body.classList.remove('gate-locked');
}

if (sessionStorage.getItem(accessKey) === 'granted') {
  unlockSite();
} else {
  document.body.classList.add('gate-locked');
  window.addEventListener('load', () => passwordInput?.focus());
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
