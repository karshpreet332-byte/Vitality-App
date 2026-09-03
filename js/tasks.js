/**
 * LifeFlow Task Rendering Engine & Interactions
 * Renders categorized column grid (Screenshot 2) & chronological grouping.
 */

class TaskEngine {
  constructor() {
    this.currentViewMode = 'categories'; // 'categories' | 'chronological'
    this.activeCategoryFilter = 'all';
    this.searchQuery = '';
    this.editingTaskId = null;
  }

  init() {
    this.bindEvents();
    this.render();
  }

  bindEvents() {
    // Search input
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.render();
      });
    }

    // Category filter pills
    const filterPills = document.querySelectorAll('.filter-pill');
    filterPills.forEach(pill => {
      pill.addEventListener('click', () => {
        filterPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.activeCategoryFilter = pill.dataset.category || 'all';
        this.render();
      });
    });

    // View mode switch (Categories vs Chronological)
    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        viewButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentViewMode = btn.dataset.view;
        this.render();
      });
    });

    // Delegated click handlers for task cards
    document.addEventListener('click', (e) => {
      // Toggle task completion check
      const checkBtn = e.target.closest('.btn-check-toggle');
      if (checkBtn) {
        const taskId = checkBtn.dataset.taskId;
        this.handleToggleTask(taskId, checkBtn);
        return;
      }

      // Toggle subtask checkbox
      const subtaskCheck = e.target.closest('.subtask-checkbox');
      if (subtaskCheck) {
        const taskId = subtaskCheck.dataset.taskId;
        const subtaskId = subtaskCheck.dataset.subtaskId;
        window.store.toggleSubtask(taskId, subtaskId);
        return;
      }

      // Expand/collapse subtasks tray
      const subtaskToggle = e.target.closest('.subtasks-header-toggle');
      if (subtaskToggle) {
        const list = subtaskToggle.parentElement.querySelector('.subtasks-list');
        if (list) {
          list.classList.toggle('hidden');
        }
        return;
      }

      // Reschedule task to tomorrow
      const reschedBtn = e.target.closest('.btn-reschedule-task');
      if (reschedBtn) {
        const taskId = reschedBtn.dataset.taskId;
        window.store.rescheduleTask(taskId, 'tomorrow', 'Tomorrow');
        if (window.reminders) {
          window.reminders.showToast('⏱ Task rescheduled to Tomorrow', 'info');
        }
        return;
      }

      // Edit task
      const editBtn = e.target.closest('.btn-edit-task');
      if (editBtn) {
        const taskId = editBtn.dataset.taskId;
        this.openEditModal(taskId);
        return;
      }

      // Delete task
      const deleteBtn = e.target.closest('.btn-delete-task');
      if (deleteBtn) {
        const taskId = deleteBtn.dataset.taskId;
        if (confirm('Are you sure you want to delete this task?')) {
          window.store.deleteTask(taskId);
        }
        return;
      }
    });

    // Subscribe to store updates
    window.store.subscribe(() => {
      this.render();
    });
  }

  handleToggleTask(taskId, buttonEl) {
    buttonEl.classList.toggle('checked');
    const card = buttonEl.closest('.task-card');
    if (card) {
      card.classList.add('animate-bounce-check');
    }
    setTimeout(() => {
      const updated = window.store.toggleTaskStatus(taskId);
      if (updated && updated.status === 'completed' && window.reminders) {
        window.reminders.showToast(`✨ Completed: "${updated.title}"`, 'success');
      }
    }, 200);
  }

  getFilteredTasks() {
    let tasks = window.store.getTasks();

    // Category filter
    if (this.activeCategoryFilter !== 'all') {
      tasks = tasks.filter(t => t.category === this.activeCategoryFilter);
    }

    // Search query
    if (this.searchQuery) {
      tasks = tasks.filter(t => 
        t.title.toLowerCase().includes(this.searchQuery) ||
        (t.description && t.description.toLowerCase().includes(this.searchQuery))
      );
    }

    return tasks;
  }

  render() {
    const container = document.getElementById('tasks-view-container');
    if (!container) return;

    const filteredTasks = this.getFilteredTasks();

    if (this.currentViewMode === 'categories') {
      this.renderCategoryColumns(container, filteredTasks);
    } else {
      this.renderChronologicalSections(container, filteredTasks);
    }
  }

  renderCategoryColumns(container, tasks) {
    const categories = [
      { id: 'work', title: 'Work', icon: '💼' },
      { id: 'personal', title: 'Personal', icon: '🏠' },
      { id: 'fitness', title: 'Fitness', icon: '🏋️' }
    ];

    let html = `<div class="category-columns-grid animate-fade-in">`;

    categories.forEach(cat => {
      const catTasks = tasks.filter(t => t.category === cat.id);
      html += `
        <div class="category-column">
          <div class="column-header">
            <h3 class="column-title">${cat.icon} ${cat.title}</h3>
            <span class="column-badge">${catTasks.length}</span>
          </div>
          <div class="cards-container" data-category="${cat.id}">
            ${catTasks.length > 0 
              ? catTasks.map(t => this.generateTaskCardHtml(t)).join('') 
              : `<div class="empty-column-placeholder"><p>No ${cat.title.toLowerCase()} tasks</p></div>`
            }
          </div>
        </div>
      `;
    });

    html += `</div>`;
    container.innerHTML = html;
  }

  renderChronologicalSections(container, tasks) {
    const overdue = tasks.filter(t => t.isOverdue && t.status !== 'completed');
    const today = tasks.filter(t => (t.dueDate === 'today' || !t.dueDate) && !t.isOverdue && t.status !== 'completed');
    const upcoming = tasks.filter(t => t.dueDate === 'tomorrow' && t.status !== 'completed');
    const completed = tasks.filter(t => t.status === 'completed');

    let html = `<div class="chronological-view animate-fade-in">`;

    if (overdue.length > 0) {
      html += `
        <section class="chrono-section">
          <div class="chrono-header">
            <h3 class="chrono-title"><span style="color: var(--priority-p1);">⚠️ Overdue Tasks</span></h3>
            <span class="column-badge" style="border-color: var(--priority-p1); color: var(--priority-p1);">${overdue.length}</span>
          </div>
          <div class="chrono-grid">
            ${overdue.map(t => this.generateTaskCardHtml(t)).join('')}
          </div>
        </section>
      `;
    }

    html += `
      <section class="chrono-section">
        <div class="chrono-header">
          <h3 class="chrono-title">📅 Today's Agenda</h3>
          <span class="column-badge">${today.length}</span>
        </div>
        <div class="chrono-grid">
          ${today.length > 0 ? today.map(t => this.generateTaskCardHtml(t)).join('') : '<p style="color: var(--text-dim); padding: 12px 0;">All caught up for today!</p>'}
        </div>
      </section>

      <section class="chrono-section">
        <div class="chrono-header">
          <h3 class="chrono-title">⏱ Upcoming & Tomorrow</h3>
          <span class="column-badge">${upcoming.length}</span>
        </div>
        <div class="chrono-grid">
          ${upcoming.length > 0 ? upcoming.map(t => this.generateTaskCardHtml(t)).join('') : '<p style="color: var(--text-dim); padding: 12px 0;">No upcoming tasks scheduled.</p>'}
        </div>
      </section>
    `;

    if (completed.length > 0) {
      html += `
        <section class="chrono-section">
          <div class="chrono-header">
            <h3 class="chrono-title">✓ Completed (${completed.length})</h3>
          </div>
          <div class="chrono-grid">
            ${completed.map(t => this.generateTaskCardHtml(t)).join('')}
          </div>
        </section>
      `;
    }

    html += `</div>`;
    container.innerHTML = html;
  }

  generateTaskCardHtml(task) {
    const isCompleted = task.status === 'completed';
    const isOverdue = task.isOverdue && !isCompleted;
    
    // Subtasks summary calculation
    const hasSubtasks = Array.isArray(task.subtasks) && task.subtasks.length > 0;
    const completedSubtasks = hasSubtasks ? task.subtasks.filter(s => s.done).length : 0;
    const subtaskPercent = hasSubtasks ? Math.round((completedSubtasks / task.subtasks.length) * 100) : 0;

    // Due indicator formatting
    let dueClass = '';
    let dueIcon = '📅';
    let dueText = task.dueDisplay || 'Today';

    if (isCompleted) {
      dueClass = 'completed';
      dueIcon = '✓';
      dueText = 'Completed';
    } else if (isOverdue) {
      dueClass = 'overdue';
      dueIcon = '⚠️';
    } else if (task.dueDate === 'tomorrow') {
      dueClass = 'tomorrow';
      dueIcon = '⏱';
    }

    return `
      <div class="task-card ${isOverdue ? 'is-overdue' : ''} ${isCompleted ? 'is-completed' : ''}" 
           data-id="${task.id}" 
           data-category="${task.category}"
           data-priority="${task.priority}">
        
        <div class="card-header">
          <div>
            ${isOverdue ? `<span class="badge-overdue">OVERDUE</span>` : ''}
            ${task.priority && !isOverdue ? `<span class="badge-priority ${task.priority}">${task.priority.toUpperCase()}</span>` : ''}
          </div>
          <div class="card-actions-menu">
            <button class="btn-card-action btn-reschedule-task" data-task-id="${task.id}" title="Reschedule to Tomorrow">⏱</button>
            <button class="btn-card-action btn-edit-task" data-task-id="${task.id}" title="Edit Task">✎</button>
            <button class="btn-card-action btn-delete-task" data-task-id="${task.id}" title="Delete Task">🗑</button>
          </div>
        </div>

        <h4 class="card-title">${this.escapeHtml(task.title)}</h4>

        ${task.description ? `<p class="card-desc">${this.escapeHtml(task.description)}</p>` : ''}

        ${hasSubtasks ? `
          <div class="card-subtasks-tray">
            <div class="subtasks-header-toggle">
              <span>Subtasks: ${completedSubtasks}/${task.subtasks.length}</span>
              <span>▼</span>
            </div>
            <div class="subtasks-progress-bar">
              <div class="subtasks-progress-fill" style="width: ${subtaskPercent}%;"></div>
            </div>
            <ul class="subtasks-list hidden">
              ${task.subtasks.map(st => `
                <li class="subtask-item">
                  <input type="checkbox" 
                         class="subtask-checkbox" 
                         data-task-id="${task.id}" 
                         data-subtask-id="${st.id}" 
                         ${st.done ? 'checked' : ''}>
                  <span class="subtask-text ${st.done ? 'is-done' : ''}">${this.escapeHtml(st.text)}</span>
                </li>
              `).join('')}
            </ul>
          </div>
        ` : ''}

        <div class="card-footer">
          <div class="due-indicator ${dueClass}">
            <span>${dueIcon}</span>
            <span>${dueText}</span>
          </div>

          <button class="btn-check-toggle ${isCompleted ? 'checked' : ''}" 
                  data-task-id="${task.id}" 
                  aria-label="Mark task done">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </button>
        </div>
      </div>
    `;
  }

  openEditModal(taskId) {
    const task = window.store.getTaskById(taskId);
    if (!task) return;

    this.editingTaskId = taskId;
    const modalTitle = document.getElementById('task-modal-title');
    if (modalTitle) modalTitle.textContent = 'Edit Task';

    document.getElementById('task-input-title').value = task.title;
    document.getElementById('task-input-desc').value = task.description || '';
    document.getElementById('task-select-priority').value = task.priority || 'p3';
    document.getElementById('task-select-category').value = task.category || 'work';
    document.getElementById('task-select-due').value = task.dueDate || 'today';

    // Populate subtasks
    const container = document.getElementById('modal-subtasks-container');
    if (container) {
      container.innerHTML = '';
      if (Array.isArray(task.subtasks)) {
        task.subtasks.forEach(st => {
          this.addSubtaskInputRow(st.text);
        });
      }
    }

    const modal = document.getElementById('task-modal');
    if (modal) modal.classList.add('open');
  }

  openCreateModal(initialTitle = '') {
    this.editingTaskId = null;
    const modalTitle = document.getElementById('task-modal-title');
    if (modalTitle) modalTitle.textContent = 'Create New Task';

    document.getElementById('task-input-title').value = initialTitle;
    document.getElementById('task-input-desc').value = '';
    document.getElementById('task-select-priority').value = 'p2';
    document.getElementById('task-select-category').value = 'work';
    document.getElementById('task-select-due').value = 'today';

    const container = document.getElementById('modal-subtasks-container');
    if (container) container.innerHTML = '';

    const modal = document.getElementById('task-modal');
    if (modal) modal.classList.add('open');
  }

  addSubtaskInputRow(textValue = '') {
    const container = document.getElementById('modal-subtasks-container');
    if (!container) return;

    const row = document.createElement('div');
    row.className = 'subtask-builder-row';
    row.innerHTML = `
      <input type="text" class="form-input subtask-text-input" placeholder="Subtask details..." value="${this.escapeHtml(textValue)}" style="flex: 1;">
      <button type="button" class="btn-card-action btn-remove-subtask" style="color: var(--priority-p1); font-weight: bold;">✕</button>
    `;

    row.querySelector('.btn-remove-subtask').addEventListener('click', () => {
      row.remove();
    });

    container.appendChild(row);
  }

  saveModalForm() {
    const title = document.getElementById('task-input-title').value.trim();
    if (!title) {
      alert('Please enter a task title');
      return;
    }

    const description = document.getElementById('task-input-desc').value.trim();
    const priority = document.getElementById('task-select-priority').value;
    const category = document.getElementById('task-select-category').value;
    const dueDate = document.getElementById('task-select-due').value;

    let dueDisplay = 'Today';
    if (dueDate === 'tomorrow') dueDisplay = 'Tomorrow';
    else if (dueDate === 'yesterday') dueDisplay = 'Yesterday';

    // Collect subtasks from builder rows
    const subtasks = [];
    const rows = document.querySelectorAll('.subtask-text-input');
    rows.forEach((input, index) => {
      const text = input.value.trim();
      if (text) {
        subtasks.push({
          id: `st_${Date.now()}_${index}`,
          text: text,
          done: false
        });
      }
    });

    if (this.editingTaskId) {
      window.store.updateTask(this.editingTaskId, {
        title,
        description,
        priority,
        category,
        dueDate,
        dueDisplay,
        isOverdue: dueDate === 'yesterday',
        subtasks
      });
      if (window.reminders) {
        window.reminders.showToast('✓ Task updated successfully', 'success');
      }
    } else {
      window.store.addTask({
        title,
        description,
        priority,
        category,
        dueDate,
        dueDisplay,
        subtasks
      });
      if (window.reminders) {
        window.reminders.showToast('✨ New task created', 'success');
      }
    }

    const modal = document.getElementById('task-modal');
    if (modal) modal.classList.remove('open');
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

window.taskEngine = new TaskEngine();
