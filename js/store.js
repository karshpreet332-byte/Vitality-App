/**
 * LifeFlow State Store & LocalStorage Persistence
 * Manages Tasks, Physical Activity metrics, and End-of-Day Daily Summaries.
 */

const STORAGE_KEY = 'lifeflow_state';

const defaultSeedState = {
  user: {
    name: "",
    dateOfBirth: "",
    calculatedAge: 0,
    password: "",
    isAuthenticated: false // Gated by default: user must Sign Up or Log In first
  },
  settings: {
    userName: "",
    streakDays: 7,
    dailyStepGoal: 10000,
    dailyActiveMinGoal: 45,
    dailyFocusHoursGoal: 4.0,
    eodTriggerTime: "20:00",
    theme: "dark"
  },
  metricsToday: {
    steps: 8420,
    activeMinutes: 45,
    focusHours: 3.5,
    tasksGoal: 15
  },
  eodDraft: {
    feeling: "smile", // "sleepy" | "neutral" | "smile" | "star" | "fire"
    notes: ""
  },
  tasks: [
    {
      id: "task_1",
      title: "Finalize Q3 Budget Report",
      description: "Review departmental spending and finalize projections for the upcoming quarter...",
      priority: "p1",
      category: "work",
      dueDate: "yesterday",
      dueDisplay: "Yesterday",
      isOverdue: true,
      status: "pending",
      subtasks: [
        { id: "st_1_1", text: "Audit travel & expense receipts", done: true },
        { id: "st_1_2", text: "Consolidate departmental spreadsheets", done: false },
        { id: "st_1_3", text: "Export final PDF for leadership review", done: false }
      ]
    },
    {
      id: "task_2",
      title: "Client Sync: Project Alpha",
      description: "Review system architecture specs with engineering stakeholders.",
      priority: "p2",
      category: "work",
      dueDate: "today",
      dueDisplay: "Today, 2:00 PM",
      isOverdue: false,
      status: "pending",
      subtasks: [
        { id: "st_2_1", text: "Prepare slide deck", done: true },
        { id: "st_2_2", text: "Send demo video link", done: false }
      ]
    },
    {
      id: "task_3",
      title: "Draft Q3 Report",
      description: "Summarize sprint velocity and team roadmap goals for Q3.",
      priority: "p1",
      category: "work",
      dueDate: "today",
      dueDisplay: "Today, 5:00 PM",
      isOverdue: false,
      status: "pending",
      subtasks: []
    },
    {
      id: "task_4",
      title: "Grocery Shopping",
      description: "Pick up ingredients for meal prep.",
      priority: "p3",
      category: "personal",
      dueDate: "today",
      dueDisplay: "Completed",
      isOverdue: false,
      status: "completed",
      completedAt: new Date().toISOString(),
      subtasks: [
        { id: "st_4_1", text: "Organic oat milk & berries", done: true },
        { id: "st_4_2", text: "Chicken breast & brown rice", done: true }
      ]
    },
    {
      id: "task_5",
      title: "Call Mom",
      description: "Weekly catch-up call with family.",
      priority: "p3",
      category: "personal",
      dueDate: "tomorrow",
      dueDisplay: "Tomorrow",
      isOverdue: false,
      status: "pending",
      subtasks: []
    },
    {
      id: "task_6",
      title: "Water plants",
      description: "Water indoor monstera and balcony herbs.",
      priority: "p4",
      category: "home",
      dueDate: "today",
      dueDisplay: "Today",
      isOverdue: false,
      status: "pending",
      subtasks: []
    },
    {
      id: "task_7",
      title: "Morning Run",
      description: "5km outdoor trail jog at steady pace.",
      priority: "p2",
      category: "fitness",
      dueDate: "today",
      dueDisplay: "5km target",
      isOverdue: false,
      status: "pending",
      subtasks: []
    },
    {
      id: "task_8",
      title: "Meditation",
      description: "Mindfulness breathing session after evening workout.",
      priority: "p4",
      category: "fitness",
      dueDate: "today",
      dueDisplay: "15 minutes",
      isOverdue: false,
      status: "pending",
      subtasks: []
    }
  ],
  dailyHistory: []
};

class Store {
  constructor() {
    this.state = this.loadState();
    this.listeners = [];
  }

  loadState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (!parsed.user || !parsed.user.name) {
          parsed.user = {
            name: "",
            dateOfBirth: "",
            calculatedAge: 0,
            password: "",
            isAuthenticated: false
          };
        }
        return parsed;
      }
    } catch (e) {
      console.warn("Failed to parse stored LifeFlow state, using defaults:", e);
    }
    this.saveState(defaultSeedState);
    return JSON.parse(JSON.stringify(defaultSeedState));
  }

  saveState(stateToSave = this.state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.error("Error saving state to localStorage:", e);
    }
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.saveState();
    this.listeners.forEach(fn => fn(this.state));
  }

  // Task Operations
  getTasks() {
    return this.state.tasks || [];
  }

  getTaskById(id) {
    return this.state.tasks.find(t => t.id === id);
  }

  addTask(taskData) {
    const newTask = {
      id: 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      title: taskData.title.trim(),
      description: (taskData.description || '').trim(),
      priority: taskData.priority || 'p3',
      category: (taskData.category || 'work').toLowerCase(),
      dueDate: taskData.dueDate || 'today',
      dueDisplay: taskData.dueDisplay || 'Today',
      isOverdue: taskData.dueDate === 'yesterday',
      status: 'pending',
      subtasks: Array.isArray(taskData.subtasks) ? taskData.subtasks : [],
      createdAt: new Date().toISOString()
    };

    this.state.tasks.unshift(newTask);
    this.notify();
    return newTask;
  }

  updateTask(taskId, updates) {
    const taskIndex = this.state.tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      this.state.tasks[taskIndex] = {
        ...this.state.tasks[taskIndex],
        ...updates
      };
      this.notify();
      return this.state.tasks[taskIndex];
    }
    return null;
  }

  toggleTaskStatus(taskId) {
    const task = this.getTaskById(taskId);
    if (task) {
      if (task.status === 'completed') {
        task.status = 'pending';
        delete task.completedAt;
        if (task.dueDate === 'yesterday') {
          task.isOverdue = true;
        }
      } else {
        task.status = 'completed';
        task.completedAt = new Date().toISOString();
        task.isOverdue = false;
      }
      this.notify();
      return task;
    }
    return null;
  }

  deleteTask(taskId) {
    this.state.tasks = this.state.tasks.filter(t => t.id !== taskId);
    this.notify();
  }

  rescheduleTask(taskId, newDueDate = 'tomorrow', newDueDisplay = 'Tomorrow') {
    const task = this.getTaskById(taskId);
    if (task) {
      task.dueDate = newDueDate;
      task.dueDisplay = newDueDisplay;
      task.isOverdue = false;
      this.notify();
      return task;
    }
    return null;
  }

  toggleSubtask(taskId, subtaskId) {
    const task = this.getTaskById(taskId);
    if (task && Array.isArray(task.subtasks)) {
      const subtask = task.subtasks.find(st => st.id === subtaskId);
      if (subtask) {
        subtask.done = !subtask.done;
        this.notify();
        return subtask;
      }
    }
    return null;
  }

  rollOverAllLeftoversToTomorrow() {
    let count = 0;
    this.state.tasks.forEach(task => {
      if (task.status !== 'completed' && (task.dueDate === 'today' || task.dueDate === 'yesterday' || task.isOverdue)) {
        task.dueDate = 'tomorrow';
        task.dueDisplay = 'Tomorrow';
        task.isOverdue = false;
        count++;
      }
    });
    if (count > 0) {
      this.notify();
    }
    return count;
  }

  // End-of-Day Scorecard calculations
  getScorecardStats() {
    const allTasks = this.state.tasks;
    const completedTasks = allTasks.filter(t => t.status === 'completed').length;
    const totalPlanned = Math.max(allTasks.length, this.state.metricsToday.tasksGoal);
    const completionPercentage = totalPlanned > 0 ? Math.round((completedTasks / totalPlanned) * 100) : 0;

    const leftovers = allTasks.filter(t => t.status !== 'completed');

    return {
      completedCount: completedTasks,
      totalPlanned: totalPlanned,
      completionPercentage: completionPercentage,
      steps: this.state.metricsToday.steps,
      stepsGoal: this.state.settings.dailyStepGoal,
      activeMinutes: this.state.metricsToday.activeMinutes,
      focusHours: this.state.metricsToday.focusHours,
      leftoversCount: leftovers.length,
      leftovers: leftovers
    };
  }

  saveEodReview(feeling, notes) {
    const summary = {
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString(),
      scorecard: this.getScorecardStats(),
      feeling: feeling,
      notes: notes
    };

    if (!Array.isArray(this.state.dailyHistory)) {
      this.state.dailyHistory = [];
    }
    this.state.dailyHistory.unshift(summary);
    this.state.eodDraft = { feeling, notes };
    this.notify();
    return summary;
  }

  // User Profile & Authentication
  getUser() {
    if (!this.state.user) {
      this.state.user = JSON.parse(JSON.stringify(defaultSeedState.user));
    }
    return this.state.user;
  }

  setUserProfile(profile) {
    this.state.user = {
      ...this.state.user,
      ...profile,
      isAuthenticated: true
    };
    if (profile.name) {
      this.state.settings.userName = profile.name;
    }
    this.notify();
  }

  logout() {
    if (this.state.user) {
      this.state.user.isAuthenticated = false;
    }
    this.notify();
  }

  resetToSampleData() {
    this.state = JSON.parse(JSON.stringify(defaultSeedState));
    this.notify();
  }
}

// Global singleton instance
window.store = new Store();
