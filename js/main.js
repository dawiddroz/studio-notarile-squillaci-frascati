/* ============================================================
   main.js — Lenis, burger, orari live, sticky CTA, anchor,
   safety net. NIENTE GSAP (vedi animations.js).
   ============================================================ */
(function () {
  'use strict';

  /* ---------- Lenis (una istanza, retry-loop) ---------- */
  (function initLenis() {
    if (typeof Lenis === 'undefined') {
      if (window.__lenisRetries === undefined) window.__lenisRetries = 0;
      if (++window.__lenisRetries > 40) return;
      setTimeout(initLenis, 250);
      return;
    }
    window.lenis = new Lenis({
      duration: 1.2,
      easing: function (t) { return 1 - Math.pow(1 - t, 3); },
      smoothWheel: true
    });
    if (typeof ScrollTrigger !== 'undefined' && !window.__lenisSynced) {
      window.lenis.on('scroll', ScrollTrigger.update);
      window.__lenisSynced = true;
    }
    function raf(time) {
      window.lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  })();

  /* ---------- Burger menu ---------- */
  function initBurger() {
    var burger = document.getElementById('navBurger');
    var menu = document.getElementById('navMenu');
    if (!burger || !menu) return;
    burger.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        menu.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Anchor smooth scroll (con Lenis se attivo) ---------- */
  function initAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var hash = link.getAttribute('href');
        if (hash.length < 2) return;
        var target = document.querySelector(hash);
        if (!target) return;
        e.preventDefault();
        if (window.lenis) {
          window.lenis.scrollTo(target, { offset: -76, duration: 1.2 });
        } else {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  /* ---------- Orari live (indice 0 = DOMENICA, tutti valorizzati) ---------- */
  var HOURS = [
    { open: null, close: null },                     // 0 Domenica — chiuso
    { open: 32400, close: 68400 },                   // 1 Lunedì   09:00–19:00
    { open: 32400, close: 68400 },                   // 2 Martedì
    { open: 32400, close: 68400 },                   // 3 Mercoledì
    { open: 32400, close: 68400 },                   // 4 Giovedì
    { open: 32400, close: 68400 },                   // 5 Venerdì
    { open: null, close: null }                      // 6 Sabato — chiuso
  ];
  var DAY_NAMES = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];

  function formatTime(seconds) {
    var h = Math.floor(seconds / 3600);
    var m = Math.floor((seconds % 3600) / 60);
    return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
  }

  function initHours() {
    var pill = document.getElementById('hoursPill');
    var table = document.querySelector('.hours-table');
    var now = new Date();
    var day = now.getDay();                 // 0 = Domenica
    var seconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    var today = HOURS[day];
    var message = '';
    var isOpen = false;

    if (today && today.open !== null) {
      if (seconds >= today.open && seconds < today.close) {
        isOpen = true;
        message = 'Aperto ora — chiudiamo alle ' + formatTime(today.close);
      } else if (seconds < today.open) {
        message = 'Chiuso ora — apriamo alle ' + formatTime(today.open);
      } else {
        var next = day;
        var steps = 1;
        while (steps <= 7) {
          next = (day + steps) % 7;
          if (HOURS[next] && HOURS[next].open !== null) break;
          steps++;
        }
        message = steps === 1
          ? 'Chiuso ora — riapriamo domani alle 09:00'
          : 'Chiuso ora — riapriamo ' + DAY_NAMES[next] + ' alle 09:00';
      }
    } else {
      var reopen = 1;
      while (reopen <= 7 && !(HOURS[reopen] && HOURS[reopen].open !== null)) reopen++;
      message = reopen === 1
        ? 'Chiuso ora — riapriamo domani alle 09:00'
        : 'Chiuso ora — riapriamo ' + DAY_NAMES[reopen] + ' alle 09:00';
    }

    if (pill) {
      pill.textContent = message;
      pill.classList.add(isOpen ? 'is-open' : 'is-closed');
    }

    /* Evidenzia il giorno corrente nella tabella (0=Domenica → data-day 7) */
    if (table) {
      var row = table.querySelector('tr[data-day="' + (day === 0 ? 7 : day) + '"]');
      if (row) row.classList.add('is-today');
    }
  }

  /* ---------- Sticky CTA mobile ---------- */
  function initStickyCta() {
    var cta = document.querySelector('.sticky-cta');
    var hero = document.querySelector('.hero');
    if (!cta || !hero) return;
    var threshold = hero.offsetHeight - 100;
    var ticking = false;
    function update() {
      ticking = false;
      if (window.scrollY > threshold) {
        cta.classList.add('is-visible');
      } else {
        cta.classList.remove('is-visible');
      }
    }
    window.addEventListener('scroll', function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }, { passive: true });
    update();
  }

  /* ---------- Safety net: rivela SOLO se GSAP non è mai partito ---------- */
  setTimeout(function () {
    if (window.__gsapReady) return;
    var els = document.querySelectorAll(
      '.reveal, .service-card, .hero__badge, .hero__title .word span, .hero__subtitle, .hero__cta, .hero__rating, .hero__media'
    );
    for (var i = 0; i < els.length; i++) {
      els[i].style.opacity = '1';
      els[i].style.transform = 'none';
    }
  }, 4000);

  function init() {
    initBurger();
    initAnchors();
    initHours();
    initStickyCta();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
