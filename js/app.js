/**
 * LifeFlow Main App Entry Point
 * Coordinates task engine, EoD wrap-up engine, quick-add bar, and navigation.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize subsystems
  window.authManager.init();
  window.taskEngine.init();
  window.eodEngine.init();
  window.reminders.init();

  // Quick Add Task Bar
  const quickAddInput = document.getElementById('quick-add-input');
  const quickAddBtn = document.getElementById('btn-quick-add');
  const expandModalBtn = document.getElementById('btn-expand-modal');

  function submitQuickAdd() {
    if (!quickAddInput) return;
    const title = quickAddInput.value.trim();
    if (!title) return;

    // Detect category if specified with hashtag (e.g. "Buy vitamins #personal")
    let category = 'work';
    let cleanTitle = title;
    if (title.toLowerCase().includes('#personal')) {
      category = 'personal';
      cleanTitle = title.replace(/#personal/gi, '').trim();
    } else if (title.toLowerCase().includes('#fitness')) {
      category = 'fitness';
      cleanTitle = title.replace(/#fitness/gi, '').trim();
    } else if (title.toLowerCase().includes('#home')) {
      category = 'home';
      cleanTitle = title.replace(/#home/gi, '').trim();
    }

    window.store.addTask({
      title: cleanTitle,
      category: category,
      priority: 'p2',
      dueDate: 'today',
      dueDisplay: 'Today'
    });

    quickAddInput.value = '';
    if (window.reminders) {
      window.reminders.showToast(`✨ Added: "${cleanTitle}"`, 'success');
    }
  }

  if (quickAddBtn) {
    quickAddBtn.addEventListener('click', submitQuickAdd);
  }

  if (quickAddInput) {
    quickAddInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        submitQuickAdd();
      }
    });
  }

  if (expandModalBtn) {
    expandModalBtn.addEventListener('click', () => {
      const initialText = quickAddInput ? quickAddInput.value : '';
      window.taskEngine.openCreateModal(initialText);
    });
  }

  // Task Creation / Edit Modal Handlers
  const taskModal = document.getElementById('task-modal');
  const btnCloseTaskModal = document.getElementById('btn-close-task-modal');
  const btnCancelTaskModal = document.getElementById('btn-cancel-task-modal');
  const btnSaveTaskModal = document.getElementById('btn-save-task-modal');
  const btnAddSubtaskModal = document.getElementById('btn-add-subtask-row');

  if (btnCloseTaskModal) {
    btnCloseTaskModal.addEventListener('click', () => {
      taskModal.classList.remove('open');
    });
  }

  if (btnCancelTaskModal) {
    btnCancelTaskModal.addEventListener('click', () => {
      taskModal.classList.remove('open');
    });
  }

  if (btnSaveTaskModal) {
    btnSaveTaskModal.addEventListener('click', () => {
      window.taskEngine.saveModalForm();
    });
  }

  if (btnAddSubtaskModal) {
    btnAddSubtaskModal.addEventListener('click', () => {
      window.taskEngine.addSubtaskInputRow();
    });
  }

  // Close modals when clicking backdrop
  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        backdrop.classList.remove('open');
      }
    });
  });

  // Global Keyboard Shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-backdrop.open').forEach(m => m.classList.remove('open'));
    }
  });

  // Reset to Sample Data link/button
  const btnResetData = document.getElementById('btn-reset-sample-data');
  if (btnResetData) {
    btnResetData.addEventListener('click', (e) => {
      e.preventDefault();
      if (confirm('Reset all tasks and metrics back to sample demo data?')) {
        window.store.resetToSampleData();
        if (window.reminders) {
          window.reminders.showToast('🔄 Sample data restored successfully', 'info');
        }
      }
    });
  }
});
