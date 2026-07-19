function getPacificMonthAndDay() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date());
  const date = Object.fromEntries(parts.map(({ type, value }) => [type, value]));

  return `${date.month}-${date.day}`;
}

function showBirthdayAnnouncement() {
  const birthday = '07-18';
  const existingAnnouncement = document.querySelector('.birthday-announcement');
  const isHomePage = window.location.pathname === '/' || window.location.pathname === '/index.html';

  if (getPacificMonthAndDay() !== birthday) {
    existingAnnouncement?.remove();
    return;
  }

  if (existingAnnouncement) return;

  const announcement = document.createElement('aside');
  announcement.className = `birthday-announcement ${isHomePage ? 'birthday-announcement-home' : ''}`;
  announcement.setAttribute('aria-label', 'Birthday announcement');
  announcement.innerHTML = `
    <p><span class="birthday-kicker">Today we celebrate our owner</span>
      <strong>Happy Birthday, Dave Wilson!</strong>
      <span class="birthday-wish">From all of us at The Bly Outdoor Store</span>
    </p>
    ${isHomePage ? '' : `
      <span class="birthday-wildlife-runner" aria-hidden="true">
        <i class="birthday-wildlife-shadow"></i>
        <span class="birthday-wildlife-sprite">
          <img src="/assets/cougar-run-sprite.png" alt="">
        </span>
      </span>
    `}
  `;

  document.body.prepend(announcement);
  if (isHomePage) scheduleBirthdayConfetti();
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
