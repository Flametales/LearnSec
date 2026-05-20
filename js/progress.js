/* ============================================================
   LEARNSEC — Progress Tracking
   localStorage-based progress for checkboxes and phase completion
   ============================================================ */

(function () {
  'use strict';

  const STORAGE_KEY = 'learnsec_progress';

  function load() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
      return {};
    }
  }

  function save(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function getPhaseId() {
    const meta = document.querySelector('meta[name="phase-id"]');
    return meta ? meta.content : 'global';
  }

  /* ---- Checkbox persistence ---- */
  function initCheckboxes() {
    const data = load();
    const phase = getPhaseId();
    const boxes = document.querySelectorAll('.checklist input[type="checkbox"]');

    boxes.forEach(function (box, i) {
      const key = phase + '_cb_' + (box.id || i);

      // Restore state
      if (data[key]) {
        box.checked = true;
        box.closest('li')?.classList.add('completed');
      }

      // Save on change
      box.addEventListener('change', function () {
        const d = load();
        d[key] = box.checked;
        save(d);

        if (box.checked) {
          box.closest('li')?.classList.add('completed');
        } else {
          box.closest('li')?.classList.remove('completed');
        }

        updateProgressBars();
        updatePhaseProgress();
      });
    });
  }

  /* ---- Progress bar calculation ---- */
  function updateProgressBars() {
    document.querySelectorAll('.progress-bar-container').forEach(function (container) {
      const scope = container.dataset.scope || 'section';
      let parent;

      if (scope === 'page') {
        parent = document;
      } else {
        parent = container.closest('section') || container.closest('.module') || document;
      }

      const total = parent.querySelectorAll('.checklist input[type="checkbox"]').length;
      const checked = parent.querySelectorAll('.checklist input[type="checkbox"]:checked').length;

      if (total === 0) return;

      const pct = Math.round((checked / total) * 100);
      const fill = container.querySelector('.progress-bar .fill');
      const label = container.querySelector('.progress-bar-pct');

      if (fill) fill.style.width = pct + '%';
      if (label) label.textContent = checked + '/' + total + ' \u00B7 ' + pct + '%';
    });
  }

  /* ---- Phase-level progress for hub page ---- */
  function updatePhaseProgress() {
    const data = load();
    const phase = getPhaseId();

    // Count checked items for this phase
    const total = document.querySelectorAll('.checklist input[type="checkbox"]').length;
    const checked = document.querySelectorAll('.checklist input[type="checkbox"]:checked').length;

    if (total > 0) {
      data['_phase_' + phase + '_total'] = total;
      data['_phase_' + phase + '_checked'] = checked;
      save(data);
    }
  }

  /* ---- Hub page: load progress from all phases ---- */
  function initHubProgress() {
    const data = load();

    document.querySelectorAll('.phase-card[data-phase]').forEach(function (card) {
      const p = card.dataset.phase;
      const total = data['_phase_' + p + '_total'] || 0;
      const checked = data['_phase_' + p + '_checked'] || 0;
      const pct = total > 0 ? Math.round((checked / total) * 100) : 0;

      const fill = card.querySelector('.phase-progress .fill');
      const label = card.querySelector('.phase-pct');

      if (fill) fill.style.width = pct + '%';
      if (label) label.textContent = pct + '%';
    });
  }

  /* ---- Init ---- */
  document.addEventListener('DOMContentLoaded', function () {
    initCheckboxes();
    updateProgressBars();
    updatePhaseProgress();
    initHubProgress();
  });
})();
