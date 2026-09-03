/**
 * LifeFlow Smart Reminders & Toast Engine
 * Dispatches floating notifications and scans for leftover/overdue items.
 */

class ReminderEngine {
  constructor() {
    this.toastContainer = null;
  }

  init() {
    this.toastContainer = document.getElementById('toast-container');
    this.bindEvents();
    this.checkOverdueTasks();
  }

  bindEvents() {
    const bellBtn = document.getElementById('btn-bell-reminders');
    if (bellBtn) {
      bellBtn.addEventListener('click', () => {
        const stats = window.store.getScorecardStats();
        if (stats.leftoversCount > 0) {
          this.showToast(`⚠️ You have ${stats.leftoversCount} unfinished tasks remaining.`, 'warning');
        } else {
          this.showToast(`✨ All tasks are up to date! Great work.`, 'success');
        }
      });
    }

    const streakBtn = document.getElementById('btn-streak-flame');
    if (streakBtn) {
      streakBtn.addEventListener('click', () => {
        const days = window.store.state.settings.streakDays || 7;
        this.showToast(`🔥 ${days}-Day Activity Streak! Keep the momentum going.`, 'info');
      });
    }
  }

  checkOverdueTasks() {
    setTimeout(() => {
      const overdueTasks = window.store.getTasks().filter(t => t.isOverdue && t.status !== 'completed');
      if (overdueTasks.length > 0) {
        this.showToast(`⚠️ ${overdueTasks.length} task is overdue: "${overdueTasks[0].title}"`, 'warning');
      }
    }, 1200);
  }

  showToast(message, type = 'info', duration = 4500) {
    if (!this.toastContainer) return;

    let icon = '✨';
    if (type === 'warning') icon = '⚠️';
    else if (type === 'success') icon = '✓';
    else if (type === 'error') icon = '✕';

    const toast = document.createElement('div');
    toast.className = `toast toast-${type} animate-fade-in`;
    toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <span class="toast-message">${message}</span>
      <div class="toast-actions">
        <button class="toast-btn toast-dismiss">✕</button>
      </div>
    `;

    toast.querySelector('.toast-dismiss').addEventListener('click', () => {
      toast.remove();
    });

    this.toastContainer.appendChild(toast);

    // Trigger show class for transition
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
}

window.reminders = new ReminderEngine();
