/* The Craft Hub — scroll motion
   Three film chapters drive the page:
   hero  : 2.mp4 loops behind the word LION; scroll scales the word until the film fills the screen
   lager : 3.mp4 pours the pint as you scroll (currentTime scrubbed)
   journey: 1.mp4 packing line scrubbed across the three development stages */
(function () {
  const html = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';

  if (reduceMotion || !hasGsap) {
    html.classList.add('no-motion');
    document.querySelectorAll('video[data-scrub]').forEach((v) => { v.pause(); });
  } else {
    gsap.registerPlugin(ScrollTrigger);
    setupHero();
    document.querySelectorAll('[data-chapter]').forEach(setupChapter);
    setupReveals();
  }
  setupHeader();
  setupNav();
  setupModal();
  setupForm();
  unlockVideosOnTouch();

  /* ---------- Hero: LION letter mask ---------- */
  function setupHero() {
    const hero = document.querySelector('.hero');
    const word = document.getElementById('heroWord');
    const letters = word.querySelectorAll('span');
    const stem = letters[1]; // the "I": scaling from its centre keeps the viewport inside a solid stroke

    const setOrigin = () => {
      const w = word.getBoundingClientRect();
      const i = stem.getBoundingClientRect();
      const x = ((i.left + i.width / 2 - w.left) / w.width) * 100;
      word.style.transformOrigin = x.toFixed(2) + '% 50%';
    };
    setOrigin();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { setOrigin(); ScrollTrigger.refresh(); });
    window.addEventListener('resize', setOrigin);

    const copy = hero.querySelectorAll('.hero__copy > *');
    gsap.set(copy, { autoAlpha: 0, y: 40 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: '+=230%',
        pin: true,
        scrub: 0.7,
        anticipatePin: 1
      }
    });
    tl.to('.hero__hint', { autoAlpha: 0, duration: 0.08, ease: 'none' }, 0)
      .to(word, { scale: 24, duration: 1, ease: 'power2.in' }, 0)
      .to('.hero__mask', { autoAlpha: 0, duration: 0.18, ease: 'none' }, 0.78)
      .to('.hero__scrim', { opacity: 1, duration: 0.3, ease: 'none' }, 0.72)
      .to(copy, { autoAlpha: 1, y: 0, duration: 0.35, stagger: 0.07, ease: 'power2.out' }, 0.9);
  }

  /* ---------- Film chapters: scrub the video with scroll ---------- */
  function setupChapter(section) {
    const video = section.querySelector('video[data-scrub]');
    const steps = section.querySelectorAll('.step');
    const fill = section.querySelector('.chapter__railfill');
    const length = parseInt(section.dataset.length || '300', 10);

    video.pause();

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: '+=' + length + '%',
        pin: true,
        scrub: 0.8,
        anticipatePin: 1
      }
    });

    // Video scrub is added once metadata is known so duration is accurate.
    const attachVideo = () => {
      tl.to(video, { currentTime: video.duration, duration: 1, ease: 'none' }, 0);
    };
    if (video.readyState >= 1) attachVideo();
    else video.addEventListener('loadedmetadata', attachVideo, { once: true });

    if (fill) tl.to(fill, { scaleY: 1, duration: 1, ease: 'none' }, 0);

    // Each step owns an equal slice of the scroll; it arrives early in its slice and leaves at the end.
    const n = steps.length;
    steps.forEach((step, i) => {
      const slice = 1 / n;
      const start = i * slice;
      const end = start + slice;
      tl.fromTo(step, { autoAlpha: 0, y: 36 }, { autoAlpha: 1, y: 0, duration: slice * 0.3, ease: 'power2.out' }, start + slice * 0.05);
      if (i < n - 1) tl.to(step, { autoAlpha: 0, y: -28, duration: slice * 0.22, ease: 'power2.in' }, end - slice * 0.24);
    });
  }

  /* ---------- Reveals for editorial sections ---------- */
  function setupReveals() {
    ScrollTrigger.batch('.reveal', {
      start: 'top 88%',
      once: true,
      onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out', overwrite: true })
    });
  }

  /* ---------- Header state ---------- */
  function setupHeader() {
    const head = document.getElementById('siteHead');
    const onScroll = () => head.classList.toggle('is-scrolled', window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- iOS needs a user gesture before currentTime can be scrubbed ---------- */
  function unlockVideosOnTouch() {
    const videos = document.querySelectorAll('video[data-scrub]');
    const unlock = () => {
      videos.forEach((v) => {
        const p = v.play();
        if (p && p.then) p.then(() => v.pause()).catch(() => {});
        else v.pause();
      });
    };
    window.addEventListener('touchstart', unlock, { once: true, passive: true });
  }

  /* ---------- Collapsible navigation for tablet and phone ---------- */
  function setupNav() {
    const head = document.getElementById('siteHead');
    const toggle = head.querySelector('.nav-toggle');
    const nav = document.getElementById('siteNav');
    if (!toggle || !nav) return;
    const narrow = window.matchMedia('(max-width: 860px)');

    const setOpen = (open, moveFocus) => {
      head.classList.toggle('is-open', open);
      document.body.classList.toggle('nav-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      if (moveFocus) {
        const target = open ? nav.querySelector('a') : toggle;
        if (target) setTimeout(() => target.focus(), open ? 120 : 0);
      }
    };
    const isOpen = () => head.classList.contains('is-open');

    toggle.addEventListener('click', () => setOpen(!isOpen(), true));
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false, false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && isOpen()) setOpen(false, true); });
    narrow.addEventListener('change', (e) => { if (!e.matches && isOpen()) setOpen(false, false); });
    document.addEventListener('nav:close', () => { if (isOpen()) setOpen(false, false); });
  }

  /* ---------- Registry modal ---------- */
  function setupModal() {
    const dialog = document.getElementById('registryModal');
    if (!dialog) return;
    const supported = typeof dialog.showModal === 'function';
    let opener = null;

    const open = (from) => {
      opener = from || null;
      if (supported) dialog.showModal(); else dialog.setAttribute('open', '');
      document.body.classList.add('modal-open');
      const first = dialog.querySelector('input');
      if (first) setTimeout(() => first.focus(), 60);
    };
    const close = () => {
      if (supported) dialog.close(); else dialog.removeAttribute('open');
    };

    document.querySelectorAll('[data-open-registry]').forEach((el) => {
      el.addEventListener('click', (e) => { e.preventDefault(); document.dispatchEvent(new CustomEvent('nav:close')); open(el); });
    });
    dialog.querySelectorAll('[data-close-registry]').forEach((el) => el.addEventListener('click', close));

    // Click on the dimmed backdrop (the dialog element itself, outside the panel) closes it.
    dialog.addEventListener('click', (e) => { if (e.target === dialog) close(); });
    dialog.addEventListener('cancel', (e) => { e.preventDefault(); close(); });
    dialog.addEventListener('close', () => {
      document.body.classList.remove('modal-open');
      if (opener && typeof opener.focus === 'function') opener.focus();
    });
  }

  /* ---------- Registry form: no backend yet, so hand off to the visitor's email app ---------- */
  function setupForm() {
    const form = document.getElementById('registryForm');
    const note = document.getElementById('formNote');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const first = form.firstName;
      const email = form.email;
      [first, email].forEach((f) => f.removeAttribute('aria-invalid'));
      note.classList.remove('is-error');

      if (!first.value.trim()) {
        first.setAttribute('aria-invalid', 'true'); first.focus();
        note.classList.add('is-error'); note.textContent = 'Add your first name so we know who to write to.';
        return;
      }
      if (!email.checkValidity()) {
        email.setAttribute('aria-invalid', 'true'); email.focus();
        note.classList.add('is-error'); note.textContent = 'That email address doesn’t look complete.';
        return;
      }
      const interests = [...form.querySelectorAll('input[name="interest"]:checked')].map((c) => c.value);
      const body = [
        'Please add me to the Craft Hub early registry.',
        '',
        'First name: ' + first.value.trim(),
        'Email: ' + email.value.trim(),
        'Interests: ' + (interests.length ? interests.join(', ') : 'Not specified')
      ].join('\n');
      const href = 'mailto:thecrafthubco@gmail.com?subject=' + encodeURIComponent('Early registry: ' + first.value.trim()) + '&body=' + encodeURIComponent(body);
      window.location.href = href;
      note.textContent = 'Your email app should open with the registration ready to send. If it doesn’t, email thecrafthubco@gmail.com directly.';
    });
  }
})();
