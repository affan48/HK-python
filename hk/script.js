(function () {
  const slides      = document.querySelectorAll('.slide');
  const dots        = document.querySelectorAll('.dot');
  const prevBtn     = document.getElementById('prev-btn');
  const nextBtn     = document.getElementById('next-btn');
  const currentNumEl = document.getElementById('current-num');
  const progressBar = document.getElementById('progress-bar');

  const TOTAL    = slides.length;
  const DURATION = 5000; // ms per slide

  let current       = 0;
  let autoplayTimer = null;
  let progressStart = null;
  let progressRaf   = null;
  let isPaused      = false;

  /* Zero-pad number e.g. 1 → "01" */
  function pad(n) {
    return String(n + 1).padStart(2, '0');
  }

  /* Go to a specific slide */
  function goTo(index, userTriggered = false) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    dots[current].setAttribute('aria-selected', 'false');

    current = (index + TOTAL) % TOTAL;

    slides[current].classList.add('active');
    dots[current].classList.add('active');
    dots[current].setAttribute('aria-selected', 'true');
    currentNumEl.textContent = pad(current);

    if (userTriggered) {
      resetAutoplay();
    }
  }

  /* ── PROGRESS BAR ── */
  function startProgress() {
    cancelAnimationFrame(progressRaf);
    progressBar.style.transition = 'none';
    progressBar.style.width = '0%';

    progressStart = performance.now();

    function tick(now) {
      const elapsed = now - progressStart;
      const pct = Math.min((elapsed / DURATION) * 100, 100);
      progressBar.style.width = pct + '%';
      if (pct < 100) {
        progressRaf = requestAnimationFrame(tick);
      }
    }
    progressRaf = requestAnimationFrame(tick);
  }

  function stopProgress() {
    cancelAnimationFrame(progressRaf);
    progressBar.style.width = '0%';
  }

  /* ── AUTOPLAY ── */
  function startAutoplay() {
    clearInterval(autoplayTimer);
    startProgress();
    autoplayTimer = setInterval(() => {
      if (!isPaused) {
        goTo(current + 1);
        startProgress();
      }
    }, DURATION);
  }

  function resetAutoplay() {
    startAutoplay();
  }

  /* ── PAUSE ON HOVER ── */
  const hero = document.querySelector('.hero');
  hero.addEventListener('mouseenter', () => {
    isPaused = true;
    stopProgress();
  });
  hero.addEventListener('mouseleave', () => {
    isPaused = false;
    startAutoplay();
  });

  /* ── ARROW BUTTONS ── */
  prevBtn.addEventListener('click', () => goTo(current - 1, true));
  nextBtn.addEventListener('click', () => goTo(current + 1, true));

  /* ── DOT INDICATORS ── */
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => goTo(i, true));
  });

  /* ── KEYBOARD NAVIGATION ── */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  goTo(current - 1, true);
    if (e.key === 'ArrowRight') goTo(current + 1, true);
  });

  /* ── TOUCH / SWIPE ── */
  let touchStartX = 0;
  hero.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  hero.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) {
      goTo(dx < 0 ? current + 1 : current - 1, true);
    }
  }, { passive: true });

  /* ── START ── */
  startAutoplay();
})();
