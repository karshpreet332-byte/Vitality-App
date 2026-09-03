# Design System & UI/UX Guidelines (`DESIGN.md`)
# Project: LifeFlow / VITALITY — Dark Pink & Baby Pink Aesthetic

> **Source PRD**: [PRD.md](file:///c:/Users/karsh/Desktop/project/PRD.md)  
> **Source Agent Guide**: [AGENTS.md](file:///c:/Users/karsh/Desktop/project/AGENTS.md)  
> **Theme Concept**: *Velvet Rose & Baby Pink Minimalist Glass*  
> **Visual Identity**: Deep velvet dark pinks and obsidian plum backgrounds paired with soft baby pink accents, crisp hairline thin borders (1px), subtle luminous neon pink glows, and cursive handwriting accents.

---

## 1. Aesthetic Philosophy & Visual Identity

The LifeFlow UI blends a modern, futuristic dark mode with a gentle, energetic pastel palette:
1. **Dark Pink Foundations**: Deep, muted plum, velvet magenta, and dark rose backgrounds create a sleek, eye-comforting dark canvas (`#120711` / `#1a0b18` / `#261023`).
2. **Baby Pink Highlights**: Soft pastel baby pink (`#fbcfe8`) and vibrant neon rose (`#f472b6`) highlights make interactive elements, active states, and metrics pop with high contrast.
3. **Thin Border Architecture**: Precision $1\text{px}$ hairline borders frame cards, modals, navigation pills, and input controls, giving the application a clean, structured, high-end look.
4. **Frosted Glassmorphism**: Translucent panels with background blurs (`backdrop-filter: blur(14px)`) and subtle pink rim lighting.
5. **Cursive Accents**: Strategic integration of **`Playwrite DE LA Guides`** cursive font for welcome headings, daily wrap-up titles, and reflective wellness notes.

---

## 2. Color Palette & Token Specifications

```
Palette Architecture:
┌────────────────────────────────────────────────────────┐
│  --bg-app: #120711 (Obsidian Noir Plum)                │
│  ┌──────────────────────────────────────────────────┐  │
│  │  --bg-surface: #1a0b18 (Dark Velvet Pink)        │  │
│  │  ┌────────────────────────────────────────────┐  │  │
│  │  │  --bg-surface-elevated: #261023            │  │  │
│  │  │  Border: 1px solid rgba(251, 207, 232, 0.14)│  │  │
│  │  │  Text: #fdf2f8 | Accent: #f472b6           │  │  │
│  │  └────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

### 2.1 CSS Custom Properties (`css/variables.css`)

```css
:root {
  /* ==========================================================================
     Theme: Dark Pink & Baby Pink Palette
     ========================================================================== */

  /* Background Layers (Dark Velvet & Obsidian Plum) */
  --bg-app: #120711;                 /* Base canvas - Deep obsidian plum */
  --bg-surface: #1a0b18;             /* Cards, sidebars, panels */
  --bg-surface-elevated: #261023;    /* Modals, dropdowns, hovered items */
  --bg-surface-hover: #32152f;       /* Interactive hover state */
  --bg-input: #170916;               /* Form input backgrounds */
  --bg-input-light: #ffffff;         /* Quick task input light style */

  /* Primary Brand & Accents (Baby Pink & Rose) */
  --baby-pink: #fbcfe8;              /* Soft pastel baby pink - Text & icons */
  --baby-pink-light: #fdf2f8;        /* Brightest blush white - Primary text */
  --pink-accent: #f472b6;            /* Neon Rose - Active tabs, primary buttons */
  --pink-accent-hover: #ec4899;      /* Deepened rose on hover */
  --pink-gradient: linear-gradient(135deg, #f472b6 0%, #db2777 100%);
  --pink-glow: rgba(244, 114, 182, 0.35); /* Neon halo glow */
  --dark-pink-solid: #9d174d;        /* Deep fuchsia / dark pink anchor */
  --dark-pink-muted: #701a4f;        /* Subdued category tags & badges */

  /* Priority Palette */
  --priority-p1: #fb7185;            /* P1 Urgent: Vivid Coral Rose */
  --priority-p1-bg: rgba(251, 113, 133, 0.15);
  --priority-p1-border: rgba(251, 113, 133, 0.4);

  --priority-p2: #f472b6;            /* P2 High: Vibrant Pink */
  --priority-p2-bg: rgba(244, 114, 182, 0.15);
  --priority-p2-border: rgba(244, 114, 182, 0.4);

  --priority-p3: #c084fc;            /* P3 Medium: Soft Violet Orchid */
  --priority-p3-bg: rgba(192, 132, 252, 0.15);
  --priority-p3-border: rgba(192, 132, 252, 0.4);

  --priority-p4: #94a3b8;            /* P4 Low: Muted Slate Mauve */
  --priority-p4-bg: rgba(148, 163, 184, 0.12);
  --priority-p4-border: rgba(148, 163, 184, 0.3);

  /* Status & Banner Colors */
  --banner-carried-over-bg: #fde68a; /* Warm yellow banner for carried-over tasks */
  --banner-carried-over-text: #78350f;
  --success: #34d399;                /* Mint Emerald for Completed Tasks */
  --warning: #fbbf24;                /* Amber Gold */
  --activity: #38bdf8;               /* Cyan for Physical Workouts / Steps */

  /* Text Hierarchy */
  --text-primary: #fdf2f8;           /* Crisp blush white */
  --text-secondary: #fbcfe8;         /* Baby pink secondary */
  --text-muted: #b485a7;             /* Muted dusky pink for timestamps/subtitles */
  --text-dim: #7a5070;               /* Dimmed labels & placeholder text */

  /* Typography Stacks */
  --font-family-base: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-family-handwritten: "Playwrite DE LA Guides", cursive;

  /* Thin Borders & Outlines (1px Architecture) */
  --border-width: 1px;
  --border-subtle: 1px solid rgba(251, 207, 232, 0.12); /* Hairline subtle outline */
  --border-medium: 1px solid rgba(251, 207, 232, 0.22); /* Card outlines & inputs */
  --border-focus: 1px solid #f472b6;                    /* Active input & focus ring */
  --border-accent: 1px solid rgba(244, 114, 182, 0.45); /* Highlighted cards */
  --border-card: 1px solid rgba(251, 207, 232, 0.14);

  /* Radii */
  --radius-xs: 4px;
  --radius-sm: 8px;
  --radius-md: 14px;
  --radius-lg: 20px;
  --radius-xl: 24px;
  --radius-full: 9999px;

  /* Shadows & Glassmorphic Glows */
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.4);
  --shadow-card: 0 10px 30px -5px rgba(12, 4, 11, 0.7), 0 0 1px 1px rgba(251, 207, 232, 0.08);
  --shadow-glow-pink: 0 0 20px -3px rgba(244, 114, 182, 0.35);
  --shadow-modal: 0 25px 50px -12px rgba(0, 0, 0, 0.95), 0 0 0 1px rgba(251, 207, 232, 0.18);
}
```

---

## 3. Typography & Font Specifications

### 3.1 Google Fonts Embedding

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playwrite+DE+LA+Guides&display=swap" rel="stylesheet">
```

### 3.2 Font Classes & Application Guidelines

```css
.playwrite-de-la-guides-regular,
.font-handwritten {
  font-family: "Playwrite DE LA Guides", var(--font-family-handwritten);
  font-weight: 400;
  font-style: normal;
  letter-spacing: 0.5px;
}
```

- **`Playwrite DE LA Guides`**: Used for Auth Welcome titles (*"Welcome to LifeFlow"*), End-of-Day reflection headings (*"Daily Reflection & Wrap-Up"*), and reflective notes.
- **`Inter` (Sans-Serif)**: Used for all UI inputs, task titles, timestamps, numeric stats, and form buttons to preserve crisp legibility.

---

## 4. Component Design Specifications

### 4.1 Welcome & Authentication Screen (`#auth-screen`)
- **Gate Lifecycle**:
  - The application defaults to an unauthenticated state (`isAuthenticated = false`).
  - The main dashboard (`#app-main-view`) is hidden (`display: none` via `.hidden`) on initial page load to eliminate layout flickering.
  - The full-screen `#auth-screen` canvas is rendered until the user inputs their details on the Sign-Up or Log-In form.
- **Container**: Full-screen centered canvas (`min-height: 100vh`) with dark velvet background and background blur halo.
- **Card**:
  - Background: `var(--bg-surface)` (`#1a0b18`).
  - Border: `1px solid rgba(251, 207, 232, 0.18)`.
  - Radius: `var(--radius-xl)` ($24\text{px}$).
  - Padding: $40\text{px} \times 36\text{px}$.
  - Box Shadow: `var(--shadow-modal)`.
- **Tab Switcher**:
  - Pill-shaped container with `1px solid rgba(251, 207, 232, 0.12)` border.
  - Active tab: Neon rose gradient (`var(--pink-gradient)`) with white text.
- **Sign-Up Form Fields (Mandatory Prerequisite)**:
  1. **Full Name**: Single-line text input with $1\text{px}$ border.
  2. **Date of Birth (DOB)**: Standard calendar date-picker styled in dark velvet with baby pink icon indicator.
  3. **Password**: Password input accompanied by an interactive show/hide eye toggle icon button.
- **Submit Button**:
  - Full-width button with `var(--pink-gradient)` and glowing pink hover aura. Unlocks and transitions into the personal dashboard.

---

### 4.2 Top Carried-Over Alert Banner (`.carried-over-banner`)
- **Visual Styling (Matching Reference Screenshot 3)**:
  - Background: Solid warm pastel amber `#fde68a`.
  - Text: Dark amber `#78350f`, font size $13\text{px}$, font weight $600$.
  - Left: `⚠️ 2 tasks carried over from yesterday`.
  - Right: `Review` interactive button/link that opens the Leftover resolver or End-of-Day wrap-up.

```html
<div class="carried-over-banner">
  <div class="banner-content">
    <span>⚠️ 2 tasks carried over from yesterday</span>
    <button class="btn-banner-action">Review</button>
  </div>
</div>
```

---

### 4.3 Personalized Dashboard Greeting
- **Visual Hierarchy**:
  - Title: `Good morning, [Name].` ($2.25\text{rem}$, font-weight $800$, color `var(--text-primary)`).
  - Subtitle: `Today's focus: Deep Work & Recovery` (color `var(--baby-pink)`).
  - Right: Streak badge (`🔥 7 Days`) and `Wrap Up Day` primary button.

---

### 4.4 Task Cards & Categorized Columns
- **Task Cards (`.task-card`)**:
  - Background: `var(--bg-surface)` (`#1a0b18`).
  - Border: `1px solid var(--border-card)`.
  - Left indicator strip: $4\text{px}$ solid color (Coral Rose for Overdue/P1, Pink for Work, Green for Personal, Cyan for Fitness).
  - Overdue badge: `OVERDUE` pill tag in vibrant coral rose.
  - Checkbox: Custom circular check button on bottom-right that animates with a bounce on completion.

---

### 4.5 Daily Reflection & Wrap-Up Modal (`#eod-modal`)
- **Header**: Cursive title in *Playwrite DE LA Guides* with sunrise emoji 🌅.
- **Scorecards (4-Box Grid)**: Tasks (`12/15`), Steps (`8,420`), Active Time (`45m`), Focus Hours (`3.5h`).
- **Feeling Emojis**: 5 selectable emojis (`😴`, `😐`, `🙂`, `🤩`, `🔥`) with glowing neon rose ring.
- **Leftover Resolver**: Lists incomplete tasks with `⤳ Move all remaining to tomorrow` one-click bulk rollover button.

---

## 5. Developer Implementation Quick Reference

1. Keep all borders at strictly `1px` width with translucent baby pink tint `rgba(251, 207, 232, 0.14)`.
2. Ensure the full-screen Auth screen seamlessly transitions into the dashboard upon successful Sign Up or Login.
3. Keep user profile data (`name`, `dateOfBirth`, `calculatedAge`, `password`, `isAuthenticated`) saved and persistent in `localStorage`.
