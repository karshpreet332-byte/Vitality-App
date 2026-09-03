/**
 * LifeFlow End-of-Day (EoD) Wrap-Up Engine
 * Faithful implementation of Daily Reflection & Wrap-Up modal (Screenshot 1).
 */

class EodSummaryEngine {
  constructor() {
    this.selectedFeeling = 'smile';
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    // End-of-Day review modal triggers
    const triggerButtons = document.querySelectorAll('.btn-eod-trigger');
    triggerButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.openModal();
      });
    });

    // Close button
    const closeBtn = document.getElementById('btn-close-eod');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.closeModal();
      });
    }

    // Emoji feeling selector
    const emojiButtons = document.querySelectorAll('.btn-emoji');
    emojiButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        emojiButtons.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.selectedFeeling = btn.dataset.feeling || 'smile';
      });
    });

    // Rollover all leftovers button
    const rolloverAllBtn = document.getElementById('btn-rollover-all-eod');
    if (rolloverAllBtn) {
      rolloverAllBtn.addEventListener('click', () => {
        const count = window.store.rollOverAllLeftoversToTomorrow();
        if (window.reminders) {
          window.reminders.showToast(`⤳ Rolled over ${count} incomplete task(s) to Tomorrow!`, 'success');
        }
        this.populateLeftovers();
        this.populateScorecard();
      });
    }

    // Save Draft button
    const saveDraftBtn = document.getElementById('btn-eod-save-draft');
    if (saveDraftBtn) {
      saveDraftBtn.addEventListener('click', () => {
        const notes = document.getElementById('eod-notes-input').value;
        window.store.state.eodDraft = {
          feeling: this.selectedFeeling,
          notes: notes
        };
        window.store.saveState();
        if (window.reminders) {
          window.reminders.showToast('💾 Reflection draft saved.', 'info');
        }
        this.closeModal();
      });
    }

    // Finish Day button
    const finishDayBtn = document.getElementById('btn-eod-finish');
    if (finishDayBtn) {
      finishDayBtn.addEventListener('click', () => {
        const notes = document.getElementById('eod-notes-input').value;
        window.store.saveEodReview(this.selectedFeeling, notes);
        if (window.reminders) {
          window.reminders.showToast('🎉 Awesome job today! Day wrapped up and saved.', 'success');
        }
        this.closeModal();
      });
    }

    // Single leftover item actions (reschedule / mark done) inside EoD modal
    const leftoverContainer = document.getElementById('eod-leftover-list');
    if (leftoverContainer) {
      leftoverContainer.addEventListener('click', (e) => {
        const reschedBtn = e.target.closest('.btn-leftover-reschedule');
        if (reschedBtn) {
          const taskId = reschedBtn.dataset.taskId;
          window.store.rescheduleTask(taskId, 'tomorrow', 'Tomorrow');
          this.populateLeftovers();
          this.populateScorecard();
          return;
        }

        const doneBtn = e.target.closest('.btn-leftover-done');
        if (doneBtn) {
          const taskId = doneBtn.dataset.taskId;
          window.store.toggleTaskStatus(taskId);
          this.populateLeftovers();
          this.populateScorecard();
          return;
        }
      });
    }

    // Subscribe to store updates to keep EoD modal stats reactive
    window.store.subscribe(() => {
      const modal = document.getElementById('eod-modal');
      if (modal && modal.classList.contains('open')) {
        this.populateScorecard();
        this.populateLeftovers();
      }
    });
  }

  openModal() {
    this.populateScorecard();
    this.populateLeftovers();
    this.loadDraft();

    const modal = document.getElementById('eod-modal');
    if (modal) {
      modal.classList.add('open');
    }
  }

  closeModal() {
    const modal = document.getElementById('eod-modal');
    if (modal) {
      modal.classList.remove('open');
    }
  }

  loadDraft() {
    const draft = window.store.state.eodDraft || { feeling: 'smile', notes: '' };
    this.selectedFeeling = draft.feeling || 'smile';

    const emojiButtons = document.querySelectorAll('.btn-emoji');
    emojiButtons.forEach(btn => {
      if (btn.dataset.feeling === this.selectedFeeling) {
        btn.classList.add('selected');
      } else {
        btn.classList.remove('selected');
      }
    });

    const notesInput = document.getElementById('eod-notes-input');
    if (notesInput) {
      notesInput.value = draft.notes || '';
    }
  }

  populateScorecard() {
    const stats = window.store.getScorecardStats();

    // Tasks Metric
    const tasksValEl = document.getElementById('scorecard-tasks-val');
    const tasksSubEl = document.getElementById('scorecard-tasks-sub');
    if (tasksValEl) tasksValEl.textContent = `${stats.completedCount}/${stats.totalPlanned}`;
    if (tasksSubEl) tasksSubEl.innerHTML = `↑ ${stats.completionPercentage}%`;

    // Steps Metric
    const stepsValEl = document.getElementById('scorecard-steps-val');
    const stepsSubEl = document.getElementById('scorecard-steps-sub');
    if (stepsValEl) stepsValEl.textContent = stats.steps.toLocaleString();
    if (stepsSubEl) stepsSubEl.textContent = `Goal: ${(stats.stepsGoal / 1000)}k`;

    // Active Time Metric
    const activeValEl = document.getElementById('scorecard-active-val');
    const activeSubEl = document.getElementById('scorecard-active-sub');
    if (activeValEl) activeValEl.textContent = `${stats.activeMinutes}m`;
    if (activeSubEl) activeSubEl.innerHTML = stats.activeMinutes >= 45 ? `✓ Met` : `${stats.activeMinutes}/45m`;

    // Focus Hours Metric
    const focusValEl = document.getElementById('scorecard-focus-val');
    const focusSubEl = document.getElementById('scorecard-focus-sub');
    if (focusValEl) focusValEl.textContent = `${stats.focusHours}h`;
    if (focusSubEl) focusSubEl.innerHTML = `↑ +0.5h`;
  }

  populateLeftovers() {
    const leftoverContainer = document.getElementById('eod-leftover-list');
    const leftoverBadge = document.getElementById('eod-leftover-count');
    if (!leftoverContainer) return;

    const stats = window.store.getScorecardStats();
    const leftovers = stats.leftovers;

    if (leftoverBadge) {
      leftoverBadge.textContent = `${leftovers.length} remaining`;
    }

    if (leftovers.length === 0) {
      leftoverContainer.innerHTML = `
        <div style="padding: 16px; text-align: center; color: var(--success); background: #250f22; border-radius: var(--radius-sm); border: 1px solid rgba(52, 211, 153, 0.2);">
          ✓ All planned tasks for today have been completed or scheduled!
        </div>
      `;
      return;
    }

    leftoverContainer.innerHTML = leftovers.map(task => {
      const priorityLabel = task.priority === 'p1' ? 'High Priority' : (task.priority === 'p2' ? 'Medium Priority' : 'Low Priority');
      const categoryLabel = (task.category || 'General').charAt(0).toUpperCase() + (task.category || 'General').slice(1);

      return `
        <div class="leftover-item" data-priority="${task.priority}" data-task-id="${task.id}">
          <div class="leftover-info">
            <h5 class="leftover-title">${this.escapeHtml(task.title)}</h5>
            <span class="leftover-meta">${categoryLabel} • ${priorityLabel}</span>
          </div>
          <div class="leftover-actions">
            <button class="btn-leftover-action btn-leftover-reschedule" data-task-id="${task.id}" title="Reschedule to Tomorrow">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </button>
            <button class="btn-leftover-action btn-leftover-done" data-task-id="${task.id}" title="Mark as Completed">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="9"></circle>
                <polyline points="9 12 11 14 15 10"></polyline>
              </svg>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

window.eodEngine = new EodSummaryEngine();
