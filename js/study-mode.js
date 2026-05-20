/* ============================================================
   LEARNSEC — Study Mode + Mobile Navigation
   Comfortable reading theme & hamburger menu for mobile
   ============================================================ */

(function () {
  'use strict';

  var STORAGE_KEY = 'learnsec_study_mode';

  /* ---- Study Mode ---- */
  function isStudyMode() {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'on';
    } catch (e) {
      return false;
    }
  }

  function applyStudyMode(on) {
    document.documentElement.setAttribute('data-study', on ? 'on' : 'off');
  }

  function toggleStudyMode() {
    var on = !isStudyMode();
    try {
      localStorage.setItem(STORAGE_KEY, on ? 'on' : 'off');
    } catch (e) { /* quota exceeded — ignore */ }
    applyStudyMode(on);
    updateToggleButton(on);
  }

  function updateToggleButton(on) {
    var btn = document.querySelector('.study-toggle-btn');
    if (!btn) return;
    btn.setAttribute('aria-pressed', String(on));
    btn.innerHTML = on
      ? '\u{1F4D6} Study Mode Uit'
      : '\u{1F4D6} Study Mode Aan';
  }

  /* ---- Hamburger Menu ---- */
  function initHamburger() {
    var btn = document.querySelector('.hamburger-btn');
    var aside = document.querySelector('aside');
    var backdrop = document.querySelector('.sidebar-backdrop');
    if (!btn || !aside) return;

    btn.addEventListener('click', function () {
      var open = aside.classList.toggle('sidebar-open');
      btn.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
      if (backdrop) backdrop.classList.toggle('active', open);
    });

    // Close on backdrop click
    if (backdrop) {
      backdrop.addEventListener('click', function () {
        closeSidebar(btn, aside, backdrop);
      });
    }

    // Close on nav link click
    aside.querySelectorAll('nav a').forEach(function (link) {
      link.addEventListener('click', function () {
        closeSidebar(btn, aside, backdrop);
      });
    });

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && aside.classList.contains('sidebar-open')) {
        closeSidebar(btn, aside, backdrop);
      }
    });
  }

  function closeSidebar(btn, aside, backdrop) {
    aside.classList.remove('sidebar-open');
    btn.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
    if (backdrop) backdrop.classList.remove('active');
  }

  /* ---- Init ---- */
  document.addEventListener('DOMContentLoaded', function () {
    // Apply study mode (backup — inline script handles FOUC)
    var on = isStudyMode();
    applyStudyMode(on);
    updateToggleButton(on);

    // Study toggle button — use both click and touchend for mobile reliability
    var toggleBtn = document.querySelector('.study-toggle-btn');
    if (toggleBtn) {
      var handled = false;
      toggleBtn.addEventListener('touchend', function (e) {
        e.preventDefault();
        handled = true;
        toggleStudyMode();
      });
      toggleBtn.addEventListener('click', function () {
        if (!handled) toggleStudyMode();
        handled = false;
      });
    }

    // Hamburger menu
    initHamburger();
  });
})();
