/* ============================================================
   counters.js — IntersectionObserver + rAF, zero GSAP.
   Valori iniziali nel HTML (no-JS safe).
   ============================================================ */
(function () {
  'use strict';

  function initCounters() {
    var counters = document.querySelectorAll('.counter');
    if (!counters.length) return;

    counters.forEach(function (el) {
      var target = parseFloat(el.dataset.count);
      var suffix = el.dataset.suffix || '';
      var decimals = el.dataset.decimals ? parseInt(el.dataset.decimals, 10) : 0;
      var animated = false;

      var observer = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !animated) {
            animated = true;
            obs.disconnect();
            var start = performance.now();

            function tick() {
              var p = Math.min((performance.now() - start) / 1800, 1);
              var eased = 1 - Math.pow(1 - p, 3);
              var value = target * eased;
              el.textContent = value.toFixed(decimals) + suffix;
              if (p < 1) {
                requestAnimationFrame(tick);
              } else {
                el.textContent = target.toFixed(decimals) + suffix;
              }
            }
            requestAnimationFrame(tick);
          }
        });
      }, { threshold: 0.3 });

      observer.observe(el);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCounters);
  } else {
    initCounters();
  }
})();
