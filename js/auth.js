/**
 * LifeFlow Authentication & Profile Onboarding Manager
 * Handles Sign-Up (Name, Date of Birth, Password), Login, Age Calculation, and Session Management.
 */

class AuthManager {
  constructor() {
    this.authScreen = null;
    this.appContainer = null;
    this.activeTab = 'signup'; // 'signup' | 'login'
  }

  init() {
    this.authScreen = document.getElementById('auth-screen');
    this.appContainer = document.getElementById('app-main-view');

    this.bindEvents();
    this.checkSession();
  }

  bindEvents() {
    // Tab switcher between Sign Up and Log In
    const tabButtons = document.querySelectorAll('.auth-tab-btn');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeTab = btn.dataset.tab;
        this.toggleTabForms();
      });
    });

    // Password Show/Hide Toggle for Sign Up
    const toggleSignupPass = document.getElementById('btn-toggle-signup-pass');
    if (toggleSignupPass) {
      toggleSignupPass.addEventListener('click', () => {
        const input = document.getElementById('signup-password');
        if (input) {
          const isPass = input.type === 'password';
          input.type = isPass ? 'text' : 'password';
          toggleSignupPass.textContent = isPass ? '🙈' : '👁️';
        }
      });
    }

    // Password Show/Hide Toggle for Login
    const toggleLoginPass = document.getElementById('btn-toggle-login-pass');
    if (toggleLoginPass) {
      toggleLoginPass.addEventListener('click', () => {
        const input = document.getElementById('login-password');
        if (input) {
          const isPass = input.type === 'password';
          input.type = isPass ? 'text' : 'password';
          toggleLoginPass.textContent = isPass ? '🙈' : '👁️';
        }
      });
    }

    // Sign Up Form Submission
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
      signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSignUp();
      });
    }

    // Login Form Submission
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleLogin();
      });
    }

    // Profile Avatar Logout Dropdown Trigger
    const profileBtn = document.getElementById('btn-user-profile');
    const profileDropdown = document.getElementById('profile-dropdown');
    if (profileBtn && profileDropdown) {
      profileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        profileDropdown.classList.toggle('show');
      });

      document.addEventListener('click', () => {
        profileDropdown.classList.remove('show');
      });
    }

    // Logout Action
    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleLogout();
      });
    }

    // Review Carried-over banner action
    const reviewBannerBtn = document.getElementById('btn-review-carried-over');
    if (reviewBannerBtn) {
      reviewBannerBtn.addEventListener('click', () => {
        if (window.eodEngine) {
          window.eodEngine.openModal();
        }
      });
    }
  }

  toggleTabForms() {
    const signupSection = document.getElementById('signup-section');
    const loginSection = document.getElementById('login-section');

    if (this.activeTab === 'signup') {
      if (signupSection) signupSection.classList.remove('hidden');
      if (loginSection) loginSection.classList.add('hidden');
    } else {
      if (signupSection) signupSection.classList.add('hidden');
      if (loginSection) loginSection.classList.remove('hidden');
    }
  }

  checkSession() {
    const user = window.store.getUser();
    if (user && user.isAuthenticated) {
      this.showApp(user);
    } else {
      this.showAuthScreen();
    }
  }

  handleSignUp() {
    const nameInput = document.getElementById('signup-name');
    const dobInput = document.getElementById('signup-dob');
    const passInput = document.getElementById('signup-password');

    const name = nameInput ? nameInput.value.trim() : '';
    const dob = dobInput ? dobInput.value : '';
    const password = passInput ? passInput.value : '';

    if (!name || name.length < 2) {
      alert('Please enter your full name (minimum 2 characters).');
      return;
    }

    if (!dob) {
      alert('Please select your date of birth.');
      return;
    }

    if (!password || password.length < 6) {
      alert('Please set a password with at least 6 characters.');
      return;
    }

    const calculatedAge = this.calculateAge(dob);

    const userProfile = {
      name: name,
      dateOfBirth: dob,
      calculatedAge: calculatedAge,
      password: password,
      isAuthenticated: true
    };

    window.store.setUserProfile(userProfile);
    this.showApp(userProfile);

    if (window.reminders) {
      window.reminders.showToast(`✨ Welcome to LifeFlow, ${name}! Your wellness profile is ready.`, 'success');
    }
  }

  handleLogin() {
    const nameInput = document.getElementById('login-name');
    const passInput = document.getElementById('login-password');

    const name = nameInput ? nameInput.value.trim() : '';
    const password = passInput ? passInput.value : '';

    if (!name) {
      alert('Please enter your name.');
      return;
    }

    if (!password) {
      alert('Please enter your password.');
      return;
    }

    const existingUser = window.store.getUser();

    // Check credentials against saved user or allow demo authentication
    if (existingUser && existingUser.name) {
      if (existingUser.name.toLowerCase() === name.toLowerCase() && existingUser.password === password) {
        existingUser.isAuthenticated = true;
        window.store.setUserProfile(existingUser);
        this.showApp(existingUser);
        if (window.reminders) {
          window.reminders.showToast(`✨ Welcome back, ${existingUser.name}!`, 'success');
        }
        return;
      }
    }

    // Default fallback demo login
    if (name.toLowerCase() === 'alex' && (password === 'password123' || password.length >= 6)) {
      const demoUser = {
        name: 'Alex',
        dateOfBirth: '1994-05-12',
        calculatedAge: 32,
        password: password,
        isAuthenticated: true
      };
      window.store.setUserProfile(demoUser);
      this.showApp(demoUser);
      if (window.reminders) {
        window.reminders.showToast('✨ Welcome back, Alex!', 'success');
      }
      return;
    }

    alert('Invalid name or password. Please verify your credentials or create a new account.');
  }

  handleLogout() {
    window.store.logout();
    this.showAuthScreen();
    if (window.reminders) {
      window.reminders.showToast('🔒 You have been logged out.', 'info');
    }
  }

  calculateAge(dateOfBirthString) {
    const dob = new Date(dateOfBirthString);
    const diffMs = Date.now() - dob.getTime();
    const ageDate = new Date(diffMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970) || 28;
  }

  showApp(user) {
    if (this.authScreen) {
      this.authScreen.classList.add('hidden');
    }
    if (this.appContainer) {
      this.appContainer.classList.remove('hidden');
    }

    // Update greeting and avatar labels in UI
    const greetingEl = document.getElementById('user-greeting-name');
    if (greetingEl) {
      greetingEl.textContent = `Good morning, ${user.name}.`;
    }

    const avatarNameEl = document.getElementById('dropdown-user-name');
    if (avatarNameEl) {
      avatarNameEl.textContent = user.name;
    }

    const avatarAgeEl = document.getElementById('dropdown-user-age');
    if (avatarAgeEl && user.calculatedAge) {
      avatarAgeEl.textContent = `${user.calculatedAge} yrs old`;
    }
  }

  showAuthScreen() {
    if (this.authScreen) {
      this.authScreen.classList.remove('hidden');
    }
    if (this.appContainer) {
      this.appContainer.classList.add('hidden');
    }
  }
}

window.authManager = new AuthManager();
