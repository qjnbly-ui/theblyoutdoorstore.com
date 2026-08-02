(() => {
  const photo = document.querySelector('.story-photo');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = navigator.connection?.saveData;
  const forced = new URLSearchParams(window.location.search).get('bigfoot') === '1';
  const seenKey = 'bly-about-bigfoot-wave-v1';

  if (!photo || reducedMotion || saveData) return;
  if (!forced && (sessionStorage.getItem(seenKey) === 'true' || Math.random() > .62)) return;

  const scriptUrl = document.currentScript.src;
  const peeker = document.createElement('span');
  const bigfoot = document.createElement('img');

  peeker.className = 'about-bigfoot-peeker';
  peeker.setAttribute('aria-hidden', 'true');
  bigfoot.src = new URL('../assets/about-bigfoot-wave.png', scriptUrl).href;
  bigfoot.alt = '';
  bigfoot.decoding = 'async';
  peeker.append(bigfoot);
  photo.append(peeker);

  function play() {
    if (!forced) sessionStorage.setItem(seenKey, 'true');
    peeker.classList.add('is-playing');
    peeker.addEventListener('animationend', () => peeker.remove(), { once: true });
  }

  function queueWave() {
    const delay = forced ? 350 : 900 + Math.random() * 4200;
    window.setTimeout(play, delay);
  }

  function waitUntilVisible() {
    if (!('IntersectionObserver' in window)) {
      queueWave();
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      queueWave();
    }, { threshold: .35 });

    observer.observe(photo);
  }

  if (bigfoot.complete && bigfoot.naturalWidth) {
    waitUntilVisible();
  } else {
    bigfoot.addEventListener('load', waitUntilVisible, { once: true });
    bigfoot.addEventListener('error', () => peeker.remove(), { once: true });
  }
})();
