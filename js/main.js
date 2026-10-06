/* =========================================================
   CHENAB CATTLE FARM — main.js
   navigation · hero · scroll animations · counters · parallax
   horizontal experience · gallery lightbox · cattle modal
   testimonials · contact form
   ========================================================= */
(function () {
  'use strict';

  var doc = document;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGSAP = !!(window.gsap && window.ScrollTrigger);

  if (!hasGSAP) doc.documentElement.classList.add('no-gsap');

  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };

  /* ---------------------------------------------------------
     PRELOADER
  --------------------------------------------------------- */
  var preloaderDone = false;
  function hidePreloader() {
    if (preloaderDone) return;
    preloaderDone = true;
    var p = $('#preloader');
    if (p) p.classList.add('is-done');
    startHero();
  }

  /* ---------------------------------------------------------
     NAVIGATION
  --------------------------------------------------------- */
  var nav = $('#nav');
  function onScroll() {
    if (!nav) return;
    nav.classList.toggle('is-scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* mobile menu */
  var menu = $('#mobileMenu');
  var burger = $('.nav__burger');
  function setMenu(open) {
    if (!menu) return;
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    if (burger) burger.setAttribute('aria-expanded', String(open));
    doc.body.classList.toggle('menu-open', open);
  }
  if (burger) burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
  if (menu) {
    menu.addEventListener('click', function (e) {
      if (e.target === menu || e.target.closest('.mmenu__close') || e.target.closest('a')) setMenu(false);
    });
  }
  doc.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu && menu.classList.contains('is-open')) setMenu(false);
  });

  /* active nav link */
  var navLinks = $$('.nav__links a');
  var sections = $$('main section[id]');
  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        navLinks.forEach(function (a) {
          a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------------------------------------------------------
     HERO — split title, entrance timeline, dust particles
  --------------------------------------------------------- */
  var heroStarted = false;

  function splitHeroTitle() {
    var title = $('[data-hero-title]');
    if (!title) return;
    var frag = doc.createDocumentFragment();
    var parts = [];
    Array.prototype.forEach.call(title.childNodes, function (n) { parts.push(n); });
    parts.forEach(function (node) {
      if (node.nodeType === 3) {
        node.textContent.split(/(\s+)/).forEach(function (word) {
          if (!word.trim()) { frag.appendChild(doc.createTextNode(word)); return; }
          var w = doc.createElement('span');
          w.className = 'w';
          var inner = doc.createElement('span');
          inner.textContent = word;
          w.appendChild(inner);
          frag.appendChild(w);
        });
      } else if (node.nodeType === 1) {
        var w2 = doc.createElement('span');
        w2.className = 'w';
        var inner2 = doc.createElement('span');
        inner2.appendChild(node.cloneNode(true));
        w2.appendChild(inner2);
        frag.appendChild(w2);
        frag.appendChild(doc.createTextNode(' '));
      }
    });
    title.innerHTML = '';
    title.appendChild(frag);
  }

  function startHero() {
    if (heroStarted) return;
    heroStarted = true;
    if (!hasGSAP || reduceMotion) return;

    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo('.hero__bg', { scale: 1.16, autoAlpha: 0.4 }, { scale: 1, autoAlpha: 1, duration: 2.2, ease: 'power2.out' })
      .fromTo('[data-hero-title] .w > span', { yPercent: 118 }, { yPercent: 0, duration: 1.15, stagger: 0.055 }, 0.35)
      .fromTo('[data-hero-line]', { y: 26, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.95, stagger: 0.16 }, 0.75)
      .fromTo('[data-hero-btn]', { y: 28, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.85, stagger: 0.14 }, 1.1)
      .fromTo('.hero__scroll', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.9 }, 1.5);
  }

  splitHeroTitle();

  /* dust / light particles */
  function initDust() {
    var canvas = $('[data-dust]');
    if (!canvas || reduceMotion) return;
    var ctx = canvas.getContext('2d');
    var hero = canvas.parentElement;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, parts = [], running = false, raf = null;

    function resize() {
      W = hero.offsetWidth; H = hero.offsetHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = W < 700 ? 22 : 46;
      parts = [];
      for (var i = 0; i < count; i++) {
        parts.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: Math.random() * 1.9 + 0.5,
          s: Math.random() * 0.22 + 0.05,
          a: Math.random() * 0.45 + 0.12,
          p: Math.random() * Math.PI * 2
        });
      }
    }

    function draw() {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        p.y -= p.s;
        p.p += 0.008;
        p.x += Math.sin(p.p) * 0.28;
        if (p.y < -8) { p.y = H + 8; p.x = Math.random() * W; }
        var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        g.addColorStop(0, 'rgba(233,205,144,' + p.a + ')');
        g.addColorStop(1, 'rgba(233,205,144,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener('resize', function () { resize(); }, { passive: true });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        var vis = en[0].isIntersecting;
        if (vis && !running) { running = true; draw(); }
        else if (!vis && running) { running = false; if (raf) cancelAnimationFrame(raf); }
      }, { threshold: 0.02 }).observe(hero);
    } else {
      running = true; draw();
    }
  }
  initDust();

  /* ---------------------------------------------------------
     TESTIMONIAL CAROUSEL
  --------------------------------------------------------- */
  (function testimonials() {
    var track = $('[data-tst-track]');
    if (!track) return;
    var slides = $$('.tst-slide', track);
    var dotsWrap = $('[data-tst-dots]');
    var idx = 0, timer = null;

    slides.forEach(function (_, i) {
      var b = doc.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'Go to testimonial ' + (i + 1));
      b.addEventListener('click', function () { go(i); restart(); });
      dotsWrap.appendChild(b);
    });
    var dots = $$('button', dotsWrap);

    function go(i) {
      idx = (i + slides.length) % slides.length;
      track.style.transform = 'translateX(' + (-idx * 100) + '%)';
      dots.forEach(function (d, k) { d.classList.toggle('is-active', k === idx); });
    }
    function restart() {
      if (reduceMotion) return;
      clearInterval(timer);
      timer = setInterval(function () { go(idx + 1); }, 6500);
    }

    $$('[data-tst]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        go(idx + (btn.dataset.tst === 'next' ? 1 : -1));
        restart();
      });
    });

    var shell = $('.tst__shell');
    if (shell) {
      shell.addEventListener('mouseenter', function () { clearInterval(timer); });
      shell.addEventListener('mouseleave', restart);
      var sx = 0;
      shell.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
      shell.addEventListener('touchend', function (e) {
        var dx = e.changedTouches[0].clientX - sx;
        if (Math.abs(dx) > 45) { go(idx + (dx < 0 ? 1 : -1)); restart(); }
      }, { passive: true });
    }

    go(0);
    restart();
  })();

  /* ---------------------------------------------------------
     GALLERY LIGHTBOX
  --------------------------------------------------------- */
  (function lightbox() {
    var lb = $('#lightbox');
    if (!lb) return;
    var items = $$('.m-item');
    var img = $('.lightbox__img', lb);
    var cap = $('.lightbox__cap', lb);
    var count = $('.lightbox__count', lb);
    var idx = 0;

    function show(i) {
      idx = (i + items.length) % items.length;
      var src = items[idx].querySelector('img');
      img.src = src.getAttribute('src');
      img.alt = src.alt;
      cap.textContent = src.alt;
      count.textContent = ('0' + (idx + 1)).slice(-2) + ' / ' + ('0' + items.length).slice(-2);
    }
    function open(i) {
      show(i);
      lb.classList.add('is-open');
      lb.setAttribute('aria-hidden', 'false');
      doc.body.style.overflow = 'hidden';
      $('.lightbox__close', lb).focus();
    }
    function close() {
      lb.classList.remove('is-open');
      lb.setAttribute('aria-hidden', 'true');
      doc.body.style.overflow = '';
    }

    items.forEach(function (it, i) {
      it.addEventListener('click', function () { open(i); });
    });
    $('.lightbox__close', lb).addEventListener('click', close);
    $('.lightbox__arrow--prev', lb).addEventListener('click', function (e) { e.stopPropagation(); show(idx - 1); });
    $('.lightbox__arrow--next', lb).addEventListener('click', function (e) { e.stopPropagation(); show(idx + 1); });
    lb.addEventListener('click', function (e) {
      if (e.target === lb || e.target.classList.contains('lightbox__stage')) close();
    });
    doc.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
  })();

  /* ---------------------------------------------------------
     CATTLE DETAIL MODAL
  --------------------------------------------------------- */
  (function cattleModal() {
    var modal = $('#cattleModal');
    if (!modal) return;

    var data = [
      {
        name: 'Noor', cat: 'Premium Cows', img: 'assets/img/about-1.jpg',
        alt: 'Premium Sahiwal cow standing in a green field',
        specs: ['Sahiwal', '3 Years', '420 kg'],
        desc: 'Noor is a deep red Sahiwal cow from our own breeding line. She has a strong frame, a calm temperament and has been raised on fresh green fodder with mineral-balanced concentrate.',
        extras: ['Milk yield: 14–16 litres per day', 'Vaccinated & dewormed — record card available', 'Pedigree: home-bred, 3rd generation on our farm']
      },
      {
        name: 'Sher', cat: 'Bulls', img: 'assets/img/card-bulls.jpg',
        alt: 'Powerful white Tharparkar bull grazing',
        specs: ['Tharparkar', '2 Years', '510 kg'],
        desc: 'Sher is a heavy-boned bull with excellent muscling and a straight top line. Handled daily, he is comfortable around people and has been tested for steady weight gain.',
        extras: ['Daily gain: approx. 1.2 kg', 'Hoof care and health checks every week', 'Suitable for breeding and Eid']
      },
      {
        name: 'Gulabi', cat: 'Calves', img: 'assets/img/cattle-calf-1.jpg',
        alt: 'Healthy young brown calf in green grass',
        specs: ['Sahiwal Calf', '8 Months', '120 kg'],
        desc: 'Gulabi was born on our farm and hand-raised alongside her mother. Fully weaned, healthy and playful — an ideal starter animal for a new farmer or a family herd.',
        extras: ['Weaned at 6 months on quality feed', 'Ear-tagged, vaccinated and vet-checked', 'Can be seen with the mother on request']
      },
      {
        name: 'Doodh', cat: 'Dairy Cattle', img: 'assets/img/exp-trough.jpg',
        alt: 'Dairy cattle feeding at a trough inside a clean shed',
        specs: ['Friesian Cross', '4 Years', '380 kg'],
        desc: 'A proven milking cow averaging 18–22 litres daily across two milkings. Kept in a clean, ventilated shed with a strict feeding and hygiene routine.',
        extras: ['Average yield: 18–22 litres/day', 'Milk record book available on request', 'Comfortable in local climate conditions']
      },
      {
        name: 'Eid Collection', cat: 'Eid / Qurbani Collection', img: 'assets/img/cattle-bulls-2.jpg',
        alt: 'Two strong bulls grazing in an open field',
        specs: ['Sahiwal × Cholistani', '1–2 Years', '450–600 kg'],
        desc: 'Our seasonal Qurbani line: healthy, vaccinated bulls selected weeks before Eid. Animals are fattened on green fodder and inspected daily before delivery.',
        extras: ['Booking opens 6–8 weeks before Eid', 'Delivery available across Punjab & Islamabad', 'Weight verified on site in front of you']
      }
    ];

    var img = $('#modalImg'), cat = $('#modalCat'), title = $('#modalTitle'),
        specs = $('#modalSpecs'), desc = $('#modalDesc'), extra = $('#modalExtra'), wa = $('#modalWa');

    function open(i) {
      var d = data[i];
      if (!d) return;
      img.src = d.img; img.alt = d.alt;
      cat.textContent = d.cat;
      title.textContent = d.name;
      desc.textContent = d.desc;
      specs.innerHTML = '';
      ['Breed', 'Age', 'Weight'].forEach(function (label, k) {
        var li = doc.createElement('li');
        li.innerHTML = '<span>' + label + '</span>' + d.specs[k];
        specs.appendChild(li);
      });
      extra.innerHTML = '';
      d.extras.forEach(function (t) {
        var li = doc.createElement('li');
        li.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#i-check"></use></svg><span>' + t + '</span>';
        extra.appendChild(li);
      });
      wa.href = 'https://wa.me/923001234567?text=' + encodeURIComponent('Assalam o Alaikum, I would like details about "' + d.name + '" (' + d.cat + ') from your website.');
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      doc.body.style.overflow = 'hidden';
      $('.modal__close', modal).focus();
    }
    function close() {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      doc.body.style.overflow = '';
    }

    $$('[data-cattle]').forEach(function (btn) {
      btn.addEventListener('click', function () { open(parseInt(btn.dataset.cattle, 10)); });
    });
    $$('[data-modal-close]', modal).forEach(function (el) { el.addEventListener('click', close); });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) close();
    });
  })();

  /* ---------------------------------------------------------
     CONTACT FORM
  --------------------------------------------------------- */
  (function contactForm() {
    var form = $('#contactForm');
    if (!form) return;
    var ok = $('#formOk');

    function validate(field) {
      var input = $('input, textarea', field);
      var v = input.value.trim();
      var valid = true;
      if (input.name === 'name') valid = v.length >= 2;
      if (input.name === 'phone') valid = v.replace(/\D/g, '').length >= 10;
      if (input.name === 'message') valid = v.length >= 5;
      field.classList.toggle('is-invalid', !valid);
      return valid;
    }

    $$('.field', form).forEach(function (field) {
      var input = $('input, textarea', field);
      input.addEventListener('blur', function () { if (input.value) validate(field); });
      input.addEventListener('input', function () { field.classList.remove('is-invalid'); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var valid = true;
      $$('.field', form).forEach(function (f) { if (!validate(f)) valid = false; });
      if (!valid) return;
      form.reset();
      ok.classList.add('is-visible');
      setTimeout(function () { ok.classList.remove('is-visible'); }, 6000);
    });
  })();

  /* year */
  var yr = $('[data-year]');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------------------------------------------------------
     GSAP ANIMATIONS
  --------------------------------------------------------- */
  function initAnimations() {
    if (!hasGSAP) {
      counters(false);
      return;
    }
    gsap.registerPlugin(ScrollTrigger);

    if (reduceMotion) {
      gsap.set('[data-reveal],[data-stagger] > *', { autoAlpha: 1 });
      counters(false);
      return;
    }

    /* initial hidden states */
    gsap.set('[data-hero-line]', { autoAlpha: 0, y: 26 });
    gsap.set('[data-hero-btn]', { autoAlpha: 0, y: 28 });
    gsap.set('.hero__scroll', { autoAlpha: 0 });
    gsap.set('.hero__bg', { autoAlpha: 0 });

    /* scroll reveals */
    gsap.utils.toArray('[data-reveal]').forEach(function (el) {
      gsap.fromTo(el, { y: 36, autoAlpha: 0 }, {
        y: 0, autoAlpha: 1, duration: 1.05, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });

    /* staggered groups */
    gsap.utils.toArray('[data-stagger]').forEach(function (wrap) {
      gsap.fromTo(wrap.children, { y: 34, autoAlpha: 0 }, {
        y: 0, autoAlpha: 1, duration: 0.95, ease: 'power3.out', stagger: 0.08,
        scrollTrigger: { trigger: wrap, start: 'top 86%', once: true }
      });
    });

    /* parallax images */
    gsap.utils.toArray('[data-parallax]').forEach(function (wrap) {
      var im = wrap.querySelector('img');
      if (!im) return;
      gsap.fromTo(im, { yPercent: -5, scale: 1.14 }, {
        yPercent: 5, scale: 1.14, ease: 'none',
        scrollTrigger: { trigger: wrap, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });

    /* hero parallax */
    gsap.to('.hero__bg', {
      yPercent: 16, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });

    /* horizontal experience (desktop only) */
    var xpWrap = $('[data-xp]');
    var track = xpWrap && xpWrap.querySelector('.xp__track');
    if (xpWrap && track && window.gsap.matchMedia) {
      var mm = gsap.matchMedia();
      mm.add('(min-width: 761px)', function () {
        var dist = function () { return Math.max(0, track.scrollWidth - xpWrap.clientWidth); };
        var tween = gsap.to(track, {
          x: function () { return -dist(); },
          ease: 'none',
          scrollTrigger: {
            trigger: '.xp',
            start: 'top top',
            end: function () { return '+=' + (dist() + window.innerHeight * 0.3); },
            scrub: 0.8,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true
          }
        });
        return function () { tween.scrollTrigger && tween.scrollTrigger.kill(); tween.kill(); gsap.set(track, { x: 0 }); };
      });
    }

    counters(true);

    window.addEventListener('load', function () {
      hidePreloader();
      ScrollTrigger.refresh();
    });
    setTimeout(function () { ScrollTrigger.refresh(); }, 1500);
  }

  /* counters */
  function counters(animate) {
    $$('[data-count]').forEach(function (el) {
      var target = parseFloat(el.dataset.count);
      var suffix = el.dataset.suffix || '';
      if (!animate) { el.textContent = target + suffix; return; }
      var obj = { v: 0 };
      gsap.to(obj, {
        v: target, duration: 2, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        onUpdate: function () { el.textContent = Math.round(obj.v) + suffix; }
      });
    });
  }

  /* boot */
  try {
    initAnimations();
  } catch (err) {
    doc.documentElement.classList.add('no-gsap');
    if (window.gsap) {
      try { gsap.set('[data-reveal],[data-stagger] > *,[data-hero-line],[data-hero-btn],.hero__scroll,.hero__bg', { autoAlpha: 1 }); } catch (e) {}
    }
    counters(false);
    if (window.console) console.warn('Animations fallback:', err);
  }

  window.addEventListener('load', hidePreloader);
  setTimeout(hidePreloader, 2600);

  if (doc.readyState === 'complete') hidePreloader();
})();
