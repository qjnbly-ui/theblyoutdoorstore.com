(() => {
  const isHomePage = window.location.pathname === '/' || window.location.pathname.endsWith('/index.html');
  const forced = new URLSearchParams(window.location.search).get('bigfoot') === '1';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const compactLayout = window.matchMedia('(max-width: 899px)').matches;
  const saveData = navigator.connection?.saveData;
  const heistKey = 'bly-bigfoot-letter-heist-v2';

  if (!isHomePage || reducedMotion || compactLayout || saveData) return;
  if (!forced && (sessionStorage.getItem(heistKey) === 'true' || Math.random() > .42)) return;

  const scriptUrl = document.currentScript.src;
  const posePaths = [1, 2, 3, 4, 5].map((number) => new URL(`../assets/bigfoot-heist-pose-${number}.png`, scriptUrl).href);
  const runPaths = [1, 2, 3, 4].map((number) => new URL(`../assets/bigfoot-run-${number}.png`, scriptUrl).href);
  const kickPaths = [1, 2, 3].map((number) => new URL(`../assets/bigfoot-kick-${number}.png`, scriptUrl).href);
  const sleep = (milliseconds) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));

  function prepareLetter(heading) {
    heading.setAttribute('aria-label', 'Family Owned. Bly Rooted.');
    heading.innerHTML = '<span aria-hidden="true">Family Owned.</span><br><span class="bigfoot-letter-line" aria-hidden="true"><span class="bigfoot-letter-slot"><span class="bigfoot-letter">B</span></span>ly Rooted.</span>';

    return {
      glyph: heading.querySelector('.bigfoot-letter'),
      slot: heading.querySelector('.bigfoot-letter-slot')
    };
  }

  function loadPose(image) {
    if (image.complete && image.naturalWidth) return Promise.resolve();

    return new Promise((resolve, reject) => {
      image.addEventListener('load', resolve, { once: true });
      image.addEventListener('error', reject, { once: true });
    });
  }

  function setPose(images, index) {
    images.forEach((image, imageIndex) => image.classList.toggle('is-active', imageIndex === index));
  }

  function setRunPose(images, letter, index, actorWidth, actorHeight) {
    const handPositions = [
      [.355, .31, -7],
      [.235, .355, 4],
      [.355, .31, -7],
      [.35, .325, -3]
    ];
    const [handX, handY, rotation] = handPositions[index];

    setPose(images, index);
    letter.style.left = `${actorWidth * handX}px`;
    letter.style.top = `${actorHeight * handY}px`;
    letter.style.transform = `translate(-50%, -50%) rotate(${rotation}deg) scale(.42)`;
  }

  function makeStolenLetter(glyph, windowElement, windowLeft, windowTop) {
    const rect = glyph.getBoundingClientRect();
    const headingStyle = window.getComputedStyle(glyph.closest('h2'));
    const stolen = document.createElement('span');

    stolen.className = 'bigfoot-stolen-letter';
    stolen.textContent = 'B';
    stolen.setAttribute('aria-hidden', 'true');
    stolen.style.top = `${window.scrollY + rect.top - windowTop}px`;
    stolen.style.left = `${window.scrollX + rect.left - windowLeft}px`;
    stolen.style.fontFamily = headingStyle.fontFamily;
    stolen.style.fontSize = headingStyle.fontSize;
    stolen.style.fontWeight = headingStyle.fontWeight;
    stolen.style.lineHeight = headingStyle.lineHeight;
    stolen.style.letterSpacing = headingStyle.letterSpacing;
    stolen.style.textTransform = headingStyle.textTransform;
    stolen.style.color = headingStyle.color;
    windowElement.append(stolen);

    return { stolen, rect };
  }

  async function runHeist(photo, heading) {
    if (!forced) sessionStorage.setItem(heistKey, 'true');

    const originalHeading = heading.innerHTML;
    const originalLabel = heading.getAttribute('aria-label');
    const { glyph, slot } = prepareLetter(heading);
    const photoRect = photo.getBoundingClientRect();
    const headingRect = heading.getBoundingClientRect();
    const letterRect = glyph.getBoundingClientRect();
    const actorHeight = Math.max(210, Math.min(photoRect.height * .47, 250));
    const actorWidth = actorHeight * (560 / 640);
    const handX = .855;
    const handY = .155;
    const windowLeft = window.scrollX + photoRect.right;
    const windowTop = window.scrollY + letterRect.top + letterRect.height * .5 - actorHeight * handY;
    const windowWidth = Math.max(headingRect.right - photoRect.right + 40, actorWidth * 1.35);
    const actorLeft = letterRect.left + letterRect.width * .5 - photoRect.right - actorWidth * handX;

    const actorWindow = document.createElement('span');
    actorWindow.className = 'bigfoot-heist-actor-window';
    actorWindow.setAttribute('aria-hidden', 'true');
    actorWindow.style.left = `${windowLeft}px`;
    actorWindow.style.top = `${windowTop}px`;
    actorWindow.style.width = `${windowWidth}px`;
    actorWindow.style.height = `${actorHeight}px`;

    const letterWindow = document.createElement('span');
    letterWindow.className = 'bigfoot-heist-letter-window';
    letterWindow.setAttribute('aria-hidden', 'true');
    letterWindow.style.left = `${windowLeft}px`;
    letterWindow.style.top = `${windowTop}px`;
    letterWindow.style.width = `${windowWidth}px`;
    letterWindow.style.height = `${actorHeight}px`;

    const actor = document.createElement('span');
    actor.className = 'bigfoot-heist-actor';
    actor.style.left = `${actorLeft}px`;
    actor.style.width = `${actorWidth}px`;
    actor.style.height = `${actorHeight}px`;

    const images = posePaths.map((source) => {
      const image = document.createElement('img');
      image.src = source;
      image.alt = '';
      image.decoding = 'async';
      actor.append(image);
      return image;
    });

    const runImages = runPaths.map((source) => {
      const image = document.createElement('img');
      image.src = source;
      image.alt = '';
      image.decoding = 'async';
      image.className = 'bigfoot-run-frame';
      return image;
    });

    const kickImages = kickPaths.map((source) => {
      const image = document.createElement('img');
      image.src = source;
      image.alt = '';
      image.decoding = 'async';
      image.className = 'bigfoot-kick-frame';
      return image;
    });

    actorWindow.append(actor);
    heading.classList.add('bigfoot-heist-heading');
    document.body.append(actorWindow, letterWindow);

    let stolenLetter;
    let auxiliaryStage;
    let completed = false;

    try {
      await Promise.all([...images, ...runImages, ...kickImages].map(loadPose));

      setPose(images, 0);
      await actor.animate([
        { transform: 'translateX(-70%)' },
        { transform: 'translateX(18%)' }
      ], { duration: 900, easing: 'cubic-bezier(.16, 1, .3, 1)', fill: 'forwards' }).finished;

      await sleep(800);
      await actor.animate([
        { transform: 'translateX(18%)' },
        { transform: 'translateX(-12%)' }
      ], { duration: 340, easing: 'cubic-bezier(.4, 0, .2, 1)', fill: 'forwards' }).finished;

      setPose(images, 1);
      await actor.animate([
        { transform: 'translateX(-12%)' },
        { transform: 'translateX(-3%)' }
      ], { duration: 520, easing: 'cubic-bezier(.4, 0, .2, 1)', fill: 'forwards' }).finished;

      setPose(images, 2);
      await actor.animate([
        { transform: 'translateX(-3%)' },
        { transform: 'translateX(0)' }
      ], { duration: 260, easing: 'ease-out', fill: 'forwards' }).finished;
      await sleep(260);

      const { stolen, rect: startRect } = makeStolenLetter(glyph, letterWindow, windowLeft, windowTop);
      stolenLetter = stolen;
      slot.style.width = `${startRect.width}px`;
      glyph.style.visibility = 'hidden';
      await sleep(180);
      window.requestAnimationFrame(() => slot.classList.add('is-stolen'));

      const stolenLeft = window.scrollX + startRect.left - windowLeft;
      const stolenTop = window.scrollY + startRect.top - windowTop;
      const startCenterX = stolenLeft + startRect.width * .5;
      const startCenterY = stolenTop + startRect.height * .5;
      const chestX = actorLeft + actorWidth * .34;
      const chestY = actorHeight * .32;
      const pullX = chestX - startCenterX;
      const pullY = chestY - startCenterY;

      setPose(images, 3);
      await stolen.animate([
        { transform: 'translate3d(0, 0, 0) rotate(0deg) scale(1)' },
        { transform: `translate3d(${pullX}px, ${pullY}px, 0) rotate(8deg) scale(.72)` }
      ], { duration: 620, easing: 'cubic-bezier(.4, 0, .2, 1)', fill: 'forwards' }).finished;

      await sleep(360);
      setPose(images, 4);
      const retreatDistance = actorWidth * .82;
      await Promise.all([
        actor.animate([
          { transform: 'translateX(0)' },
          { transform: `translateX(${-retreatDistance}px)` }
        ], { duration: 1050, easing: 'cubic-bezier(.55, 0, .8, .25)', fill: 'forwards' }).finished,
        stolen.animate([
          { transform: `translate3d(${pullX}px, ${pullY}px, 0) rotate(8deg) scale(.72)` },
          { transform: `translate3d(${pullX - retreatDistance}px, ${pullY}px, 0) rotate(-5deg) scale(.72)` }
        ], { duration: 1050, easing: 'cubic-bezier(.55, 0, .8, .25)', fill: 'forwards' }).finished
      ]);

      actorWindow.style.display = 'none';
      letterWindow.style.display = 'none';
      await sleep(Math.max(480, Math.min(850, photoRect.width * .9)));

      const runnerWindow = document.createElement('span');
      runnerWindow.className = 'bigfoot-runner-window';
      runnerWindow.setAttribute('aria-hidden', 'true');
      runnerWindow.style.left = `${window.scrollX}px`;
      runnerWindow.style.top = `${window.scrollY + photoRect.bottom - actorHeight}px`;
      runnerWindow.style.width = `${photoRect.left}px`;
      runnerWindow.style.height = `${actorHeight}px`;

      const runner = document.createElement('span');
      runner.className = 'bigfoot-runner';
      runner.style.left = `${photoRect.left}px`;
      runner.style.width = `${actorWidth}px`;
      runner.style.height = `${actorHeight}px`;
      runImages.forEach((image) => runner.append(image));

      stolen.getAnimations().forEach((animation) => animation.cancel());
      stolen.style.transformOrigin = 'center';
      runner.append(stolen);
      runnerWindow.append(runner);
      document.body.append(runnerWindow);

      let runFrame = 0;
      let runTimer;
      setRunPose(runImages, stolen, runFrame, actorWidth, actorHeight);

      try {
        runTimer = window.setInterval(() => {
          runFrame = (runFrame + 1) % runImages.length;
          setRunPose(runImages, stolen, runFrame, actorWidth, actorHeight);
        }, 115);

        const runDistance = photoRect.left + actorWidth + 32;
        const runDuration = Math.max(900, Math.min(1300, runDistance * 1.8));
        await runner.animate([
          { transform: 'translateX(0)' },
          { transform: `translateX(${-runDistance}px)` }
        ], { duration: runDuration, easing: 'linear', fill: 'forwards' }).finished;
      } finally {
        window.clearInterval(runTimer);
        runnerWindow.remove();
      }

      await sleep(2400);

      const returnStage = document.createElement('span');
      auxiliaryStage = returnStage;
      returnStage.className = 'bigfoot-return-stage';
      returnStage.setAttribute('aria-hidden', 'true');
      returnStage.style.left = `${window.scrollX}px`;
      returnStage.style.top = `${window.scrollY + photoRect.bottom - actorHeight}px`;
      returnStage.style.width = `${window.innerWidth}px`;
      returnStage.style.height = `${actorHeight}px`;

      const letterGroundTop = actorHeight - startRect.height * 1.2;
      const rollTargetX = Math.max(90, photoRect.left - Math.min(105, actorWidth * .48));
      stolen.style.left = '0';
      stolen.style.top = `${letterGroundTop}px`;
      stolen.style.transformOrigin = 'center';
      stolen.style.transform = `translate3d(${-startRect.width - 28}px, 0, 0) rotate(-720deg) scale(1)`;
      returnStage.append(stolen);
      document.body.append(returnStage);

      await stolen.animate([
        { transform: `translate3d(${-startRect.width - 28}px, 0, 0) rotate(-720deg) scale(1)` },
        { transform: `translate3d(${rollTargetX}px, 0, 0) rotate(0deg) scale(1)` }
      ], { duration: 1250, easing: 'cubic-bezier(.18, .72, .28, 1)', fill: 'forwards' }).finished;

      await sleep(650);

      const returner = document.createElement('span');
      returner.className = 'bigfoot-runner bigfoot-returner is-running-right';
      const kickContactX = .88;
      const kickLeft = rollTargetX - actorWidth * kickContactX;
      returner.style.left = `${-actorWidth - 20}px`;
      returner.style.width = `${actorWidth}px`;
      returner.style.height = `${actorHeight}px`;
      runImages.forEach((image) => returner.append(image));
      kickImages.forEach((image) => returner.append(image));
      returnStage.append(returner);

      let approachFrame = 0;
      let approachTimer;
      let windupTimer;
      kickImages.forEach((image) => image.classList.remove('is-active'));
      setPose(runImages, approachFrame);

      try {
        approachTimer = window.setInterval(() => {
          approachFrame = (approachFrame + 1) % runImages.length;
          setPose(runImages, approachFrame);
        }, 115);

        windupTimer = window.setTimeout(() => {
          window.clearInterval(approachTimer);
          runImages.forEach((image) => image.classList.remove('is-active'));
          setPose(kickImages, 0);
        }, 560);

        await returner.animate([
          { transform: 'translateX(0)' },
          { transform: `translateX(${kickLeft + actorWidth + 20}px)` }
        ], { duration: 720, easing: 'linear', fill: 'forwards' }).finished;
      } finally {
        window.clearInterval(approachTimer);
        window.clearTimeout(windupTimer);
      }

      returner.classList.remove('is-running-right');
      returner.style.left = `${kickLeft}px`;
      returner.style.transform = 'translateX(0)';
      returner.getAnimations().forEach((animation) => animation.cancel());
      runImages.forEach((image) => image.classList.remove('is-active'));
      if (!kickImages[0].classList.contains('is-active')) setPose(kickImages, 0);

      stolen.getAnimations().forEach((animation) => animation.cancel());
      stolen.style.transform = `translate3d(${rollTargetX}px, 0, 0) rotate(0deg) scale(1)`;
      setPose(kickImages, 1);

      const targetX = startRect.left;
      const targetY = window.scrollY + startRect.top - Number.parseFloat(returnStage.style.top) - letterGroundTop;
      const flightMidX = rollTargetX + (targetX - rollTargetX) * .48;
      const flightMidY = targetY * .35 - Math.max(95, actorHeight * .48);
      const letterFlight = stolen.animate([
        { transform: `translate3d(${rollTargetX}px, 0, 0) rotate(0deg) scale(1)` },
        { offset: .48, transform: `translate3d(${flightMidX}px, ${flightMidY}px, 0) rotate(390deg) scale(.84)` },
        { transform: `translate3d(${targetX}px, ${targetY}px, 0) rotate(720deg) scale(1)` }
      ], { duration: 980, easing: 'cubic-bezier(.22, .62, .3, 1)', fill: 'forwards' });

      await sleep(145);
      setPose(kickImages, 2);
      await sleep(535);
      slot.classList.remove('is-stolen');
      await letterFlight.finished;

      glyph.style.visibility = '';
      stolen.remove();
      await sleep(360);

      kickImages.forEach((image) => image.classList.remove('is-active'));
      returner.classList.add('is-running-left');
      let exitFrame = 0;
      let exitTimer;
      setPose(runImages, exitFrame);

      try {
        exitTimer = window.setInterval(() => {
          exitFrame = (exitFrame + 1) % runImages.length;
          setPose(runImages, exitFrame);
        }, 115);

        await returner.animate([
          { transform: 'translateX(0)' },
          { transform: `translateX(${-kickLeft - actorWidth - 30}px)` }
        ], { duration: 720, easing: 'linear', fill: 'forwards' }).finished;
      } finally {
        window.clearInterval(exitTimer);
        returnStage.remove();
      }

      completed = true;
    } finally {
      stolenLetter?.remove();
      auxiliaryStage?.remove();
      actorWindow.remove();
      letterWindow.remove();
      heading.classList.remove('bigfoot-heist-heading');

      if (!completed) {
        heading.innerHTML = originalHeading;
        if (originalLabel === null) heading.removeAttribute('aria-label');
        else heading.setAttribute('aria-label', originalLabel);
      }
    }
  }

  function watchForHeist() {
    const section = document.querySelector('main .about');
    const photo = section?.querySelector('.about-photo');
    const heading = section?.querySelector('h2');
    if (!section || !photo || !heading) return;

    let dwellTimer;
    const observer = new IntersectionObserver(([entry]) => {
      window.clearTimeout(dwellTimer);
      if (!entry.isIntersecting || entry.intersectionRatio < .62) return;

      dwellTimer = window.setTimeout(() => {
        const rect = section.getBoundingClientRect();
        if (rect.bottom < 120 || rect.top > window.innerHeight - 120) return;

        observer.disconnect();
        runHeist(photo, heading).catch(() => {});
      }, forced ? 600 : 2400 + Math.random() * 2600);
    }, { threshold: [.62] });

    observer.observe(section);
  }

  if (document.readyState === 'complete') {
    watchForHeist();
  } else {
    window.addEventListener('load', watchForHeist, { once: true });
  }
})();
