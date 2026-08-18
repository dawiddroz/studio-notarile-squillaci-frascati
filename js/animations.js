/* ============================================================
   animations.js — GSAP + ScrollTrigger reveal bulletproof.
   Pre-hide DOPO registerPlugin; trigger once:true; MAI onLeaveBack.
   ============================================================ */
(function () {
  'use strict';

  (function initGSAP() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      if (window.__gsapRetries === undefined) window.__gsapRetries = 0;
      if (++window.__gsapRetries > 32) return;
      setTimeout(initGSAP, 250);
      return;
    }
    gsap.registerPlugin(ScrollTrigger);

    /* Sync Lenis ↔ ScrollTrigger (idempotente, flag condiviso con main.js) */
    if (window.lenis && !window.__lenisSynced) {
      window.lenis.on('scroll', ScrollTrigger.update);
      window.__lenisSynced = true;
    }

    /* Pre-hide: solo dopo che GSAP esiste — niente blink.
       Copre anche le card delle griglie (fromTo le riporterebbe a 0 all'onEnter). */
    gsap.set('.reveal, .service-card', { opacity: 0, y: 40 });

    /* Passata 1: griglie con stagger sui figli */
    gsap.utils.toArray('.reveal-grid').forEach(function (grid) {
      ScrollTrigger.create({
        trigger: grid,
        start: 'top 82%',
        once: true,
        onEnter: function () {
          gsap.fromTo(grid.children,
            { opacity: 0, y: 40 },
            {
              opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: 'power3.out',
              onComplete: function () {
                gsap.set(grid.children, { clearProps: 'transform' });
              }
            }
          );
        }
      });
    });

    /* Passata 2: ogni .reveal fuori dalle griglie, individuale */
    gsap.utils.toArray('.reveal').forEach(function (el) {
      if (el.closest('.reveal-grid')) return;
      ScrollTrigger.create({
        trigger: el,
        start: 'top 82%',
        once: true,
        onEnter: function () {
          gsap.fromTo(el,
            { opacity: 0, y: 40 },
            {
              opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
              onComplete: function () {
                gsap.set(el, { clearProps: 'transform' });
              }
            }
          );
        }
      });
    });

    /* Parallax decorativo sulla numerazione romana (scrub, nessun reveal) */
    var numeral = document.querySelector('.story__numeral');
    if (numeral) {
      gsap.fromTo(numeral,
        { y: 70 },
        {
          y: -70, ease: 'none',
          scrollTrigger: {
            trigger: '.story',
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
          }
        }
      );
    }

    window.__gsapReady = true;
    ScrollTrigger.refresh();
  })();
})();
