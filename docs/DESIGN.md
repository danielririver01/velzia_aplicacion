# Velzia Design System

## Overview

Velzia uses an **"Obsidian Dark"** design system — a premium, always-dark interface inspired by modern fintech and food-tech applications. The design prioritizes clarity, hierarchy, and a luxury feel through glassmorphism effects, subtle glows, and precise typography.

---

## Design Principles

1. **Always Dark** — The interface is permanently in dark mode. There is no light mode toggle.
2. **Obsidian Surfaces** — Backgrounds use near-black tones (#050505, #0f0f10) rather than pure black.
3. **Premium Glass** — Cards and surfaces use glassmorphism with subtle borders and blur effects.
4. **Orange as Accent** — The brand orange (#f97316) is used sparingly for CTAs, active states, and brand identity.
5. **Typography Hierarchy** — Bold headings (Outfit), clean body text (Inter), with extreme letter-spacing for labels.
6. **Micro-interactions** — Hover states, active scaling, and subtle transitions enhance the premium feel.

---

## Color Palette

### Backgrounds

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg-deep` | `#050505` | Page background, deepest layer |
| `--bg-surface` | `#0f0f10` | Card backgrounds, elevated surfaces |
| `--bg-surface-hover` | `#161618` | Hover state for cards |
| `#141414` | — | Alternative card background |
| `#0a0a0a` | — | Input backgrounds, nested surfaces |
| `#262626` | — | Borders, dividers |

### Brand Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--primary` | `#f97316` | CTAs, brand accent, active states |
| `--primary-glow` | `rgba(249, 115, 22, 0.2)` | Glow effects, shadows |
| `#f2460d` | — | Alternative primary (legacy) |
| `#d63a0a` | — | Primary hover state |

### Text Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--text-main` | `#ffffff` | Primary text |
| `--text-muted` | `#a1a1aa` | Secondary text |
| `--text-dim` | `#71717a` | Tertiary text, labels |
| `#71717a` | — | Disabled text |

### Accent Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--accent-cyan` | `#06b6d4` | Info, links |
| `--accent-purple` | `#a855f7` | Special features |
| `#10b981` | — | Success, active states |
| `#ef4444` | — | Error, destructive actions |
| `#f59e0b` | — | Warning, pending states |

### Status Colors

| Status | Background | Text |
|--------|------------|------|
| **Pending** | `orange-500/10` | `orange-400` |
| **Confirmed** | `blue-500/10` | `blue-400` |
| **Preparing** | `purple-500/10` | `purple-400` |
| **Ready** | `green-500/10` | `green-400` |
| **Delivered** | `gray-500/10` | `gray-400` |
| **Cancelled** | `red-500/10` | `red-400` |

---

## Typography

### Font Families

| Font | Weight | Usage |
|------|--------|-------|
| **Outfit** | 400-900 | Headings, titles, brand text |
| **Inter** | 400-700 | Body text, inputs, labels |

### Text Scale

| Element | Size | Weight | Tracking | Transform |
|---------|------|--------|----------|-----------|
| Page Title | `text-3xl` (30px) | `font-black` (900) | `tracking-[-0.06em]` | `uppercase` |
| Section Title | `text-xl` (20px) | `font-bold` (700) | Normal | None |
| Card Title | `text-lg` (18px) | `font-black` (900) | `tracking-tight` | None |
| Body Text | `text-sm` (14px) | `font-medium` (500) | Normal | None |
| Label | `text-[10px]` | `font-black` (900) | `tracking-[0.2em]` | `uppercase` |
| Micro Label | `text-[9px]` | `font-black` (900) | `tracking-widest` | `uppercase` |
| Caption | `text-xs` (12px) | `font-bold` (700) | Normal | None |

---

## Spacing & Layout

### Page Layout

```html
<div class="px-6 pb-32 pt-10 max-w-md mx-auto">
  <!-- Content -->
</div>
```

- **Max Width**: `max-w-md` (448px) for mobile-first
- **Horizontal Padding**: `px-6` (24px)
- **Top Padding**: `pt-10` (40px)
- **Bottom Padding**: `pb-32` (128px) — accommodates bottom navigation

### Card Spacing

- **Card Padding**: `p-5` or `p-6` (20-24px)
- **Card Border Radius**: `rounded-2xl` (16px) or `rounded-3xl` (24px)
- **Card Gap**: `gap-2` to `gap-4` (8-16px)
- **Section Margin**: `mb-6` to `mb-8` (24-32px)

---

## Components

### Cards

**Standard Card:**
```html
<div class="bg-white dark:bg-[#141414] rounded-2xl border border-gray-100 dark:border-[#262626] p-5 shadow-sm">
  <!-- Content -->
</div>
```

**Glass Card:**
```html
<div class="glass-surface rounded-2xl p-5">
  <!-- Content -->
</div>
```

**Metric Card:**
```html
<div class="bg-white dark:bg-[#141414] p-3.5 rounded-xl border border-orange-100 dark:border-orange-500/10 shadow-sm flex flex-col items-center">
  <span class="text-[8px] font-black uppercase text-orange-600/60 dark:text-orange-400/60 tracking-widest">Label</span>
  <span class="text-xl font-black mt-1 text-text-main dark:text-white">Value</span>
</div>
```

### Buttons

**Primary Button:**
```html
<button class="w-full bg-[#f2460d] hover:bg-[#d63a0a] text-white font-black py-4 rounded-2xl shadow-xl shadow-orange-500/20 active:scale-95 transition-all uppercase tracking-widest text-xs">
  Action
</button>
```

**Secondary Button:**
```html
<button class="w-full bg-[#141414] hover:bg-[#1a1a1a] text-white font-bold py-3 rounded-2xl border border-[#262626] transition-all">
  Action
</button>
```

**Ghost Button:**
```html
<button class="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-primary transition-all duration-300 flex items-center gap-2 group">
  <span class="w-1.5 h-1.5 rounded-full bg-zinc-800 group-hover:bg-primary transition-colors"></span>
  Action
</button>
```

### Inputs

**Standard Input:**
```html
<input type="text" 
  class="w-full px-5 py-4 bg-[#f8f9fa] dark:bg-[#0a0a0a] rounded-2xl border border-gray-100 dark:border-[#262626] focus:ring-2 focus:ring-[#f2460d]/20 focus:border-[#f2460d] outline-none transition-all font-bold text-gray-900 dark:text-white"
  placeholder="Placeholder">
```

**Input Label:**
```html
<label class="block text-[10px] font-black text-gray-600 dark:text-gray-500 uppercase tracking-widest mb-2.5 ml-1">
  LABEL TEXT
</label>
```

### Toggle Switch

```html
<label class="relative inline-flex items-center cursor-pointer">
  <input type="checkbox" class="sr-only peer">
  <div class="w-12 h-6 bg-red-500/10 dark:bg-red-500/20 peer-focus:outline-none rounded-full peer 
    peer-checked:after:translate-x-6 peer-checked:after:border-white 
    after:content-[''] after:absolute after:top-[2px] after:start-[2px] 
    after:bg-white after:border-gray-300 after:border after:rounded-full 
    after:h-5 after:w-5 after:transition-all 
    peer-checked:bg-emerald-600 peer-checked:shadow-[0_0_15px_rgba(5,150,105,0.4)]">
  </div>
</label>
```

### Status Badge

```html
<div class="flex items-center gap-1.5">
  <span class="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.4)]"></span>
  <span class="text-[9px] font-black uppercase tracking-widest text-green-600 dark:text-green-400">
    Activo
  </span>
</div>
```

### Settings Row

```html
<a href="#" class="settings-row flex items-center justify-between p-5 border-b border-gray-50 dark:border-[#262626] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-all">
  <div class="flex items-center gap-4">
    <div class="w-10 h-10 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-xl flex items-center justify-center">
      <span class="material-symbols-outlined text-[20px]">icon_name</span>
    </div>
    <span class="font-bold text-sm dark:text-white">Setting Label</span>
  </div>
  <span class="material-symbols-outlined text-gray-500 dark:text-gray-600 text-[18px]">chevron_right</span>
</a>
```

---

## Icons

**Icon Library:** Material Symbols Outlined

**Icon Sizes:**
- Small: `text-[14px]`
- Medium: `text-[18px]` or `text-[20px]`
- Large: `text-[24px]`
- XLarge: `text-[32px]`

**Icon Usage:**
```html
<span class="material-symbols-outlined text-[20px]">icon_name</span>
```

---

## Effects

### Glassmorphism

```css
.glass-surface {
  background: var(--bg-surface);
  backdrop-filter: blur(20px);
  border: 1px solid var(--border-subtle);
  box-shadow: var(--shadow-premium);
}
```

### Shadows

| Effect | Value |
|--------|-------|
| Premium Shadow | `0 25px 50px -12px rgba(0, 0, 0, 0.5)` |
| Card Shadow | `shadow-sm` or `shadow-lg` |
| Button Shadow | `shadow-xl shadow-orange-500/20` |
| Glow Shadow | `shadow-[0_0_15px_rgba(5,150,105,0.4)]` |

### Borders

| Style | Value |
|-------|-------|
| Subtle | `border-white/5` |
| Light | `border-gray-100 dark:border-[#262626]` |
| Accent | `border-orange-500/10` |

### Transitions

- **Default:** `transition-all`
- **Duration:** `duration-300` or `duration-700`
- **Active Scale:** `active:scale-95`

---

## Layout Patterns

### Dashboard Header

```html
<header class="flex justify-between items-center mb-10">
  <div class="flex flex-col">
    <h1 class="text-3xl font-black tracking-[-0.06em] text-white leading-none uppercase">
      Restaurant Name
    </h1>
    <span class="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Workspace</span>
  </div>
  <!-- Toggle or Action -->
</header>
```

### Stats Grid

```html
<div class="grid grid-cols-3 gap-2">
  <!-- 3-column metric cards -->
</div>
```

### Settings List

```html
<div class="bg-white dark:bg-[#141414] rounded-3xl shadow-sm border border-gray-100 dark:border-[#262626] overflow-hidden">
  <!-- Settings rows with border-b between them -->
</div>
```

---

## Responsive Breakpoints

The application is **mobile-first** with a max-width container:

- **Mobile**: Default (up to 448px)
- **Tablet**: Not specifically designed
- **Desktop**: Not specifically designed

---

## Accessibility

- **Focus States**: `focus:ring-2 focus:ring-[#f2460d]/20 focus:border-[#f2460d]`
- **Selection Color**: `selection:bg-orange-500/30`
- **Text Contrast**: White text on dark backgrounds ensures readability
- **Active States**: `active:scale-95` provides tactile feedback

---

## CSS Architecture

### File Structure

```
static/CSS/
├── design_tokens.css    # CSS variables, base styles
├── output.css           # Tailwind CSS output
├── login.css            # Login page styles
├── dashboard.css        # Dashboard styles
├── settings.css         # Settings page styles
├── subscription.css     # Subscription page styles
├── qr.css               # QR page styles
└── public/              # Public menu styles
    ├── public_base.css
    ├── menu_public.css
    ├── menu_categories.css
    ├── menu_category_products.css
    ├── menu_novedades.css
    └── footer.css
```

### CSS Variables

All design tokens are defined in `design_tokens.css` and referenced throughout the application.

### Dark Mode

The application uses Tailwind's `dark:` prefix with `class` strategy, but the interface is **always dark** — the `dark` class is permanently applied to the `<html>` element.

---

## Brand Identity

### Logo

The Velzia logo is an SVG icon featuring a stylized flame/rocket shape in orange (#f97316) with white and dark accents.

### Favicon

A simplified SVG favicon using the same orange brand color.

### Brand Voice

- **Professional** — Clean, minimal UI
- **Premium** — Glassmorphism, subtle animations
- **Efficient** — Quick access to key metrics
- **Modern** — Contemporary design patterns

---

## Update History

| Date | Change |
|------|--------|
| 2026-05-08 | Initial Design System documentation |
