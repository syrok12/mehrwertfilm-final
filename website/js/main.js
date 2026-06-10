/* ═══════════════════════════════════════════════════════════
   MEHRWERTFILM – main.js
   Requires: GSAP 3.12 (gsap, ScrollTrigger, ScrollToPlugin)
             Splitting.js
   All scripts loaded with defer — runs after DOM ready
   ═══════════════════════════════════════════════════════════ */

window.addEventListener('load', init);

function init() {
  // Guard: GSAP and Splitting must be loaded
  if (typeof gsap === 'undefined' || typeof Splitting === 'undefined') {
    console.warn('Mehrwertfilm: GSAP or Splitting.js not loaded');
    // Fallback — show everything immediately
    document.querySelectorAll('.hero__eyebrow, .hero__subline, .hero__actions, .hero__stats')
      .forEach(el => { el.style.opacity = '1'; });
    return;
  }

  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

  /* ── 1. SPLITTING TEXT ────────────────────────────────── */
  Splitting({ target: '[data-splitting]', by: 'chars' });

  /* ── 2. CUSTOM CURSOR ─────────────────────────────────── */
  initCursor();

  /* ── 3. NAV SCROLL BEHAVIOR ───────────────────────────── */
  initNav();

  /* ── 4. HERO ENTRANCE ─────────────────────────────────── */
  initHeroEntrance();

  /* ── 5. SECTION TEXT REVEALS ──────────────────────────── */
  initTextReveals();

  /* ── 6. MARQUEE ───────────────────────────────────────── */
  initMarquee();

  /* ── 7. SERVICE CARDS ─────────────────────────────────── */
  initServiceCards();

  /* ── 8. PORTFOLIO REVEAL ──────────────────────────────── */
  initPortfolio();

  /* ── 9. STATS COUNTERS ────────────────────────────────── */
  initCounters();

  /* ── 10. TESTIMONIALS ─────────────────────────────────── */
  initTestimonials();

  /* ── 11. CTA SECTION ──────────────────────────────────── */
  initCta();

  /* ── 12. SMOOTH ANCHOR SCROLL ─────────────────────────── */
  initAnchorScroll();

  /* ── 13. MOBILE MENU ──────────────────────────────────── */
  initMobileMenu();

  /* ── Refresh ScrollTrigger after layout settles ───────── */
  ScrollTrigger.refresh();
}

/* ═══════════════════════════════════════════════════════════
   CURSOR
   ═══════════════════════════════════════════════════════════ */
function initCursor() {
  const cursor = document.getElementById('cursor');
  if (!cursor || matchMedia('(pointer: coarse)').matches) return;

  const dot  = cursor.querySelector('.cursor__dot');
  const ring = cursor.querySelector('.cursor__ring');
  let mx = window.innerWidth / 2;
  let my = window.innerHeight / 2;
  let rx = mx, ry = my;

  window.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    gsap.to(dot, { x: mx, y: my, duration: 0.08, overwrite: true });
  });

  gsap.ticker.add(() => {
    rx += (mx - rx) * 0.1;
    ry += (my - ry) * 0.1;
    gsap.set(ring, { x: rx, y: ry });
  });

  document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => {
      gsap.to(ring, { scale: 1.8, opacity: 0.5, duration: 0.35, overwrite: true });
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(ring, { scale: 1, opacity: 1, duration: 0.35, overwrite: true });
    });
  });
}

/* ═══════════════════════════════════════════════════════════
   NAV
   ═══════════════════════════════════════════════════════════ */
function initNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;

  ScrollTrigger.create({
    start: 'top -72px',
    onEnter:     () => nav.classList.add('nav--scrolled'),
    onLeaveBack: () => nav.classList.remove('nav--scrolled'),
  });
}

/* ═══════════════════════════════════════════════════════════
   HERO ENTRANCE
   ═══════════════════════════════════════════════════════════ */
function initHeroEntrance() {
  // Initial states must be set BEFORE the timeline runs
  gsap.set('.hero__eyebrow',       { y: 20 });
  gsap.set('.hero__headline-line', { yPercent: 115 });
  gsap.set('.hero__subline',       { y: 30 });
  gsap.set('.hero__actions',       { y: 20 });
  gsap.set('.hero__stats',         { y: 20 });

  const tl = gsap.timeline({ delay: 0.2 });

  tl.to('.hero__eyebrow', {
    opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
  });

  tl.to('.hero__headline-line', {
    yPercent: 0,
    duration: 1.1,
    stagger: 0.12,
    ease: 'power4.out',
  }, '-=0.3');

  tl.to('.hero__subline', {
    opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
  }, '-=0.5');

  tl.to('.hero__actions', {
    opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
  }, '-=0.5');

  tl.to('.hero__stats', {
    opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
  }, '-=0.4');
}

/* ═══════════════════════════════════════════════════════════
   SPLITTING TEXT REVEALS (section headers)
   ═══════════════════════════════════════════════════════════ */
function initTextReveals() {
  document.querySelectorAll('.section-title[data-splitting]').forEach(el => {
    const chars = el.querySelectorAll('.char');
    if (!chars.length) return;

    gsap.from(chars, {
      scrollTrigger: {
        trigger: el,
        start: 'top 82%',
      },
      yPercent: 110,
      opacity: 0,
      duration: 0.8,
      stagger: 0.025,
      ease: 'power4.out',
    });
  });

  // Section eyebrows
  document.querySelectorAll('.section-eyebrow').forEach(el => {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: 'top 88%' },
      opacity: 0, x: -20, duration: 0.6, ease: 'power3.out',
    });
  });
}

/* ═══════════════════════════════════════════════════════════
   MARQUEE
   ═══════════════════════════════════════════════════════════ */
function initMarquee() {
  const inner = document.getElementById('marqueeInner');
  const track = document.getElementById('marqueeTrack');
  if (!inner || !track) return;

  const marqueeTween = gsap.to(inner, {
    xPercent: -50,
    duration: 28,
    ease: 'none',
    repeat: -1,
  });

  track.addEventListener('mouseenter', () => marqueeTween.timeScale(0.25));
  track.addEventListener('mouseleave', () => marqueeTween.timeScale(1));
}

/* ═══════════════════════════════════════════════════════════
   SERVICE CARDS
   ═══════════════════════════════════════════════════════════ */
function initServiceCards() {
  gsap.from('.service-card', {
    scrollTrigger: {
      trigger: '.services__grid',
      start: 'top 78%',
    },
    y: 60,
    opacity: 0,
    duration: 0.9,
    stagger: 0.15,
    ease: 'power3.out',
  });
}

/* ═══════════════════════════════════════════════════════════
   PORTFOLIO REVEAL (clip-path wipe)
   ═══════════════════════════════════════════════════════════ */
function initPortfolio() {
  gsap.from('.reel-item', {
    scrollTrigger: {
      trigger: '.portfolio__reel',
      start: 'top 80%',
    },
    clipPath: 'inset(100% 0% 0% 0%)',
    duration: 1.2,
    stagger: 0.1,
    ease: 'power4.inOut',
  });
}

/* ═══════════════════════════════════════════════════════════
   STATS COUNTERS
   ═══════════════════════════════════════════════════════════ */
function initCounters() {
  // Counters in hero (run on page load after a short delay)
  const heroCounters = document.querySelectorAll('.hero__stats .counter');
  gsap.delayedCall(1.2, () => animateCounters(heroCounters));

  // Counters in stats section (on scroll)
  ScrollTrigger.create({
    trigger: '.stats',
    start: 'top 72%',
    once: true,
    onEnter: () => {
      const statsCounters = document.querySelectorAll('.stat-block .counter');
      animateCounters(statsCounters);
    },
  });
}

function animateCounters(counters) {
  counters.forEach(el => {
    const target    = parseFloat(el.dataset.target);
    const isDecimal = el.dataset.decimal === 'true';
    const obj       = { val: 0 };

    gsap.to(obj, {
      val: target,
      duration: 2.2,
      ease: 'power2.out',
      onUpdate() {
        el.textContent = isDecimal
          ? obj.val.toFixed(1)
          : Math.round(obj.val).toString();
      },
      onComplete() {
        el.textContent = isDecimal ? target.toFixed(1) : target.toString();
      },
    });
  });
}

/* ═══════════════════════════════════════════════════════════
   TESTIMONIALS
   ═══════════════════════════════════════════════════════════ */
function initTestimonials() {
  const TESTIMONIALS = [
    {
      text: 'Mehrwertfilm hat unser komplexes Produkt so erklärt, dass selbst unser Vertrieb erstaunt war. Die Anfragen haben sich innerhalb von drei Monaten verdreifacht.',
      name: 'Thomas Brinkmann',
      role: 'Geschäftsführer, Brinkmann Maschinenbau GmbH',
    },
    {
      text: 'Endlich ein Produktionsteam, das wirklich versteht, was B2B-Marketing bedeutet. Das Video hat auf der Messe mehr Aufmerksamkeit erzeugt als unser kompletter Stand.',
      name: 'Sabine Hoffmann',
      role: 'Marketing Director, Phoenix Industrial AG',
    },
    {
      text: 'Professionell, schnell und das Ergebnis übertrifft alle Erwartungen. Wir arbeiten bereits an unserem dritten Projekt mit Mehrwertfilm.',
      name: 'Michael Kern',
      role: 'Vertriebsleiter, Kern Antriebstechnik GmbH',
    },
  ];

  const textEl  = document.getElementById('testiText');
  const nameEl  = document.getElementById('testiName');
  const roleEl  = document.getElementById('testiRole');
  const dotsEl  = document.getElementById('testiDots');
  const btnPrev = document.getElementById('testiBtnPrev');
  const btnNext = document.getElementById('testiBtnNext');
  if (!textEl || !dotsEl) return;

  let current = 0;
  let isAnimating = false;

  // Build dots
  TESTIMONIALS.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'testi-dot' + (i === 0 ? ' testi-dot--active' : '');
    dot.setAttribute('aria-label', `Testimonial ${i + 1}`);
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    dot.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(dot);
  });

  function goTo(index) {
    if (isAnimating || index === current) return;
    isAnimating = true;

    const stage = document.getElementById('testiStage');
    gsap.to(stage, {
      opacity: 0, y: -16, duration: 0.35, ease: 'power2.in',
      onComplete() {
        current = (index + TESTIMONIALS.length) % TESTIMONIALS.length;
        textEl.textContent = TESTIMONIALS[current].text;
        nameEl.textContent = TESTIMONIALS[current].name;
        roleEl.textContent = TESTIMONIALS[current].role;
        updateDots();
        gsap.fromTo(stage,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out',
            onComplete() { isAnimating = false; }
          }
        );
      },
    });
  }

  function updateDots() {
    dotsEl.querySelectorAll('.testi-dot').forEach((dot, i) => {
      dot.classList.toggle('testi-dot--active', i === current);
      dot.setAttribute('aria-selected', i === current ? 'true' : 'false');
    });
  }

  btnNext && btnNext.addEventListener('click', () => goTo(current + 1));
  btnPrev && btnPrev.addEventListener('click', () => goTo(current - 1));

  // Auto-advance every 6 seconds
  let autoplay = setInterval(() => goTo(current + 1), 6000);
  const inner = document.querySelector('.testimonials__inner');
  if (inner) {
    inner.addEventListener('mouseenter', () => clearInterval(autoplay));
    inner.addEventListener('mouseleave', () => {
      autoplay = setInterval(() => goTo(current + 1), 6000);
    });
  }

  // Reveal on scroll
  gsap.from('.testimonials__inner', {
    scrollTrigger: { trigger: '.testimonials', start: 'top 75%' },
    opacity: 0, y: 40, duration: 1, ease: 'power3.out',
  });
}

/* ═══════════════════════════════════════════════════════════
   CTA SECTION
   ═══════════════════════════════════════════════════════════ */
function initCta() {
  gsap.from('.cta-section__inner', {
    scrollTrigger: { trigger: '.cta-section', start: 'top 75%' },
    opacity: 0, y: 40, duration: 1, ease: 'power3.out',
  });

  const ctaChars = document.querySelectorAll('.cta-section__headline .char');
  if (ctaChars.length) {
    gsap.from(ctaChars, {
      scrollTrigger: { trigger: '.cta-section__headline', start: 'top 80%' },
      yPercent: 110, opacity: 0,
      duration: 0.7, stagger: 0.02, ease: 'power4.out',
    });
  }
}

/* ═══════════════════════════════════════════════════════════
   SMOOTH ANCHOR SCROLL
   ═══════════════════════════════════════════════════════════ */
function initAnchorScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      gsap.to(window, {
        duration: 1.2,
        scrollTo: { y: target, offsetY: 72 },
        ease: 'power3.inOut',
      });
      // Close mobile menu if open
      const menu = document.getElementById('mobileMenu');
      const btn  = document.getElementById('hamburger');
      if (menu && menu.classList.contains('is-open')) {
        menu.classList.remove('is-open');
        btn && btn.classList.remove('is-open');
        btn && btn.setAttribute('aria-expanded', 'false');
      }
    });
  });
}

/* ═══════════════════════════════════════════════════════════
   MOBILE MENU
   ═══════════════════════════════════════════════════════════ */
function initMobileMenu() {
  const btn  = document.getElementById('hamburger');
  const menu = document.getElementById('mobileMenu');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('is-open');
    btn.classList.toggle('is-open', isOpen);
    btn.setAttribute('aria-expanded', isOpen.toString());
    menu.setAttribute('aria-hidden', (!isOpen).toString());
  });
}
