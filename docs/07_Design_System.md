# LunaBloom — Design System

**Version:** 1.0.0  
**Status:** Active  
**Date:** 2026-07-22  

> This document is the **single source of truth** for all visual decisions in LunaBloom. No color, font size, spacing value, or animation duration may be used in code that is not defined here first.

---

## Table of Contents
1. [Design Philosophy](#1-design-philosophy)
2. [Color Palette](#2-color-palette)
3. [Typography](#3-typography)
4. [Spacing Scale](#4-spacing-scale)
5. [Border Radius](#5-border-radius)
6. [Elevation & Shadows](#6-elevation--shadows)
7. [Icons](#7-icons)
8. [Motion & Animation](#8-motion--animation)
9. [Component States](#9-component-states)
10. [Accessibility Requirements](#10-accessibility-requirements)
11. [Token File Reference](#11-token-file-reference)

---

## 1. Design Philosophy

### Guiding Principles

| Principle | Implementation |
|---|---|
| **Calm & Trustworthy** | Muted, desaturated tones; no harsh contrast; generous whitespace |
| **Modern & Premium** | Clean typography; subtle depth; smooth transitions |
| **Inclusive** | No stereotypical feminine imagery; abstract, cycle-inspired forms |
| **Accessible** | WCAG 2.1 AA contrast; no color-only information; large touch targets |
| **Focused** | One primary action per screen; clear information hierarchy |

### Inspiration
Apple Health · Calm · Notion · Headspace · Fitbit

### Anti-Patterns (Explicitly Avoided)
- Excessive pinks or hot pinks
- Floral imagery
- Stereotypically "girly" decorative elements
- Busy backgrounds or textures
- Neon or overly saturated colors

---

## 2. Color Palette

### 2.1 Brand Colors

| Token | Light Mode | Dark Mode | Usage |
|---|---|---|---|
| `color.brand.primary` | `#7C3AED` | `#A78BFA` | Primary actions, active tab, CTA buttons |
| `color.brand.secondary` | `#0D9488` | `#2DD4BF` | Secondary actions, fertile window indicator |
| `color.brand.accent` | `#F97316` | `#FB923C` | Highlights, ovulation marker, warm emphasis |

### 2.2 Cycle Phase Colors

These colors are used consistently on the calendar, charts, dashboard phase card, and all phase indicators. They must always be paired with an icon/shape for color-blind accessibility.

| Phase | Token | Light Mode | Dark Mode | Hex (Light) |
|---|---|---|---|---|
| Menstrual | `color.phase.menstrual` | `#BE185D` | `#F472B6` | Deep rose |
| Follicular | `color.phase.follicular` | `#15803D` | `#4ADE80` | Sage green |
| Ovulatory | `color.phase.ovulatory` | `#D97706` | `#FCD34D` | Warm amber |
| Luteal | `color.phase.luteal` | `#7C3AED` | `#A78BFA` | Soft purple |
| Predicted | `color.phase.predicted` | `#94A3B8` | `#475569` | Slate (dashed border) |

### 2.3 Neutral Colors

| Token | Light Mode | Dark Mode | Usage |
|---|---|---|---|
| `color.background` | `#F8FAFC` | `#0C0C14` | Screen backgrounds |
| `color.surface` | `#FFFFFF` | `#16162A` | Cards, sheets, inputs |
| `color.surfaceElevated` | `#FFFFFF` | `#1E1E35` | Elevated cards, modals |
| `color.border` | `#E2E8F0` | `#2A2A45` | Dividers, input borders |
| `color.borderSubtle` | `#F1F5F9` | `#1A1A30` | Very subtle dividers |

### 2.4 Text Colors

| Token | Light Mode | Dark Mode | Usage |
|---|---|---|---|
| `color.text.primary` | `#0F172A` | `#F1F5F9` | Headings, body text |
| `color.text.secondary` | `#475569` | `#94A3B8` | Subtitles, captions, labels |
| `color.text.tertiary` | `#94A3B8` | `#475569` | Placeholder text, hints |
| `color.text.inverse` | `#FFFFFF` | `#0F172A` | Text on colored backgrounds |
| `color.text.disabled` | `#CBD5E1` | `#334155` | Disabled state text |
| `color.text.link` | `#7C3AED` | `#A78BFA` | Hyperlinks, tappable text |

### 2.5 Semantic Colors

| Token | Value | Usage |
|---|---|---|
| `color.semantic.success` | `#22C55E` | Positive states, period ended, data saved |
| `color.semantic.warning` | `#F59E0B` | Caution states, low confidence predictions |
| `color.semantic.error` | `#EF4444` | Errors, validation failures, danger actions |
| `color.semantic.info` | `#3B82F6` | Informational notices, tips |

### 2.6 Overlay Colors

| Token | Value | Usage |
|---|---|---|
| `color.overlay.light` | `rgba(0,0,0,0.4)` | Modal backdrop (light theme) |
| `color.overlay.dark` | `rgba(0,0,0,0.7)` | Modal backdrop (dark theme) |
| `color.overlay.surface` | `rgba(255,255,255,0.08)` | Glassmorphism effect (dark theme) |

---

## 3. Typography

### 3.1 Typeface

**Primary Font:** Inter (Google Fonts)  
Weights used: 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)

Loaded via `expo-font` and `@expo-google-fonts/inter`. Falls back to system default if font load fails.

### 3.2 Type Scale

| Token | Size | Line Height | Weight | Usage |
|---|---|---|---|---|
| `text.display` | 34sp | 1.2 | Bold (700) | Onboarding headlines only |
| `text.heading1` | 28sp | 1.25 | Bold (700) | Screen titles |
| `text.heading2` | 22sp | 1.3 | SemiBold (600) | Section headers, card titles |
| `text.heading3` | 18sp | 1.35 | SemiBold (600) | Sub-section headers |
| `text.body` | 15sp | 1.55 | Regular (400) | Body text, descriptions |
| `text.bodyMedium` | 15sp | 1.55 | Medium (500) | Emphasized body text |
| `text.label` | 13sp | 1.4 | Medium (500) | Form labels, tags, badges |
| `text.caption` | 12sp | 1.4 | Regular (400) | Helper text, timestamps |
| `text.micro` | 10sp | 1.3 | Medium (500) | Tiny labels, indicators |

> **sp = scale-independent pixels.** React Native's `sp` (via font size) responds to user system font size settings automatically.

### 3.3 Typography Rules

- Never use fewer than 12sp for any visible text (accessibility minimum)
- Headings are always `color.text.primary`
- Body text line height is always ≥ 1.5 (readability)
- Letter spacing: 0 for body text; `-0.5` for large headings; `+0.5` for ALL CAPS labels
- Never use more than 3 typeface weights on a single screen
- Text on colored backgrounds must pass 4.5:1 WCAG contrast ratio

---

## 4. Spacing Scale

All spacing values are multiples of **4pt** (the base unit).

| Token | Value | Common Usage |
|---|---|---|
| `spacing.1` | 4pt | Icon padding, micro gaps |
| `spacing.2` | 8pt | Between related items, icon-text gap |
| `spacing.3` | 12pt | Small padding inside components |
| `spacing.4` | 16pt | Standard component padding, list item spacing |
| `spacing.5` | 20pt | Section padding |
| `spacing.6` | 24pt | Card padding, section gaps |
| `spacing.8` | 32pt | Large section gaps |
| `spacing.10` | 40pt | Screen top padding |
| `spacing.12` | 48pt | Large visual separation |
| `spacing.16` | 64pt | Screen-level margins |
| `spacing.20` | 80pt | Bottom of screen padding (above tab bar) |

**Screen horizontal padding:** `spacing.4` (16pt) on both sides

---

## 5. Border Radius

| Token | Value | Usage |
|---|---|---|
| `radius.xs` | 4pt | Tags, chips, small badges |
| `radius.sm` | 8pt | Input fields, small buttons |
| `radius.md` | 12pt | Cards, standard components |
| `radius.lg` | 16pt | Large cards, modal sheets |
| `radius.xl` | 24pt | Bottom sheet top corners, feature cards |
| `radius.2xl` | 32pt | Pill-shaped large elements |
| `radius.full` | 9999pt | Circular elements (avatars, FABs, badges) |

---

## 6. Elevation & Shadows

Used to express depth hierarchy. Dark theme shadows use colored glow instead of black shadows.

| Token | Light Shadow | Dark Glow | Usage |
|---|---|---|---|
| `elevation.1` | `0 1px 2px rgba(0,0,0,0.05)` | `0 0 0 1px rgba(255,255,255,0.05)` | Subtle surface lift (input focus) |
| `elevation.2` | `0 2px 8px rgba(0,0,0,0.08)` | `0 4px 16px rgba(0,0,0,0.4)` | Cards, list items |
| `elevation.3` | `0 4px 16px rgba(0,0,0,0.12)` | `0 8px 24px rgba(0,0,0,0.5)` | Floating action elements |
| `elevation.4` | `0 8px 32px rgba(0,0,0,0.16)` | `0 16px 40px rgba(0,0,0,0.6)` | Modals, bottom sheets |

---

## 7. Icons

### 7.1 Icon Library

**Primary:** `@expo/vector-icons` (Ionicons set)  
**Supplementary:** Custom SVG icons for cycle-phase symbols and brand-specific icons

### 7.2 Icon Sizes

| Token | Size | Usage |
|---|---|---|
| `icon.xs` | 14pt | Inline text icons |
| `icon.sm` | 18pt | Button icons, list item icons |
| `icon.md` | 22pt | Navigation tab icons (standard) |
| `icon.lg` | 28pt | Feature icons, empty state icons |
| `icon.xl` | 40pt | Illustration-grade icons |

### 7.3 Cycle Phase Icons

Each phase has a unique icon shape used alongside color for color-blind accessibility:

| Phase | Icon | Shape |
|---|---|---|
| Menstrual | `water-outline` (Ionicons) | Drop |
| Follicular | `leaf-outline` | Leaf |
| Ovulatory | `sunny-outline` | Sun |
| Luteal | `moon-outline` | Moon |

---

## 8. Motion & Animation

All animations use **React Native Reanimated 3** (runs on the UI thread; never blocks JS thread).

### 8.1 Duration Scale

| Token | Duration | Usage |
|---|---|---|
| `motion.instant` | 100ms | Toggle states, checkbox, switch |
| `motion.fast` | 200ms | Button press feedback, micro-interactions |
| `motion.normal` | 300ms | Screen transitions, card entrances |
| `motion.slow` | 500ms | Feature reveals, onboarding animations |
| `motion.slowest` | 800ms | Loading skeletons, progress bars |

### 8.2 Easing Curves

| Token | Curve | Usage |
|---|---|---|
| `motion.easing.standard` | `Easing.inOut(Easing.ease)` | Default transitions |
| `motion.easing.enter` | `Easing.out(Easing.back(1.5))` | Elements entering the screen |
| `motion.easing.exit` | `Easing.in(Easing.ease)` | Elements leaving the screen |
| `motion.easing.spring` | `withSpring({ damping: 15 })` | Interactive, bouncy elements |

### 8.3 Animation Patterns

| Pattern | When Used | Implementation |
|---|---|---|
| **Fade in** | Screen load, card entrance | `opacity: 0 → 1` over `motion.normal` |
| **Slide up** | Bottom sheet, modals | `translateY: 100 → 0` over `motion.normal` |
| **Scale press** | All tappable elements | `scale: 1 → 0.97` on press, back to 1 on release |
| **Stagger entrance** | Dashboard cards, list items | Sequential fade-in with 50ms delay between items |
| **Shake** | PIN error, validation failure | `translateX: 0 → ±8 → 0` (3 oscillations) |
| **Pulse** | Loading, ovulation day indicator | `opacity: 1 → 0.4 → 1` looping |

### 8.4 Accessibility: Reduce Motion

Always respect `AccessibilityInfo.isReduceMotionEnabled()`. When reduce motion is on:
- Replace animations with instant state changes
- Keep only opacity fades (safest animation type)
- Never autoplay animations

---

## 9. Component States

Every interactive component must visually represent all states:

### 9.1 Button States

| State | Visual Treatment |
|---|---|
| **Default** | Brand primary background, full opacity |
| **Pressed** | Scale `0.97`, slightly darker background |
| **Focused** | 2pt brand-colored focus ring |
| **Disabled** | 40% opacity, cursor not-allowed (web) |
| **Loading** | Activity indicator replaces label, disabled |
| **Success** | Green background + checkmark, then reverts |

### 9.2 Input States

| State | Visual Treatment |
|---|---|
| **Default** | `color.border` border, `color.surface` background |
| **Focused** | `color.brand.primary` border (2pt), `elevation.1` |
| **Filled** | Same as default with `color.text.primary` value |
| **Error** | `color.semantic.error` border, error message below |
| **Disabled** | `color.surface` background, 50% opacity, no focus |

### 9.3 List Item / Card States

| State | Visual Treatment |
|---|---|
| **Default** | `color.surface` background, `elevation.2` |
| **Pressed** | Scale `0.98`, slightly darker background |
| **Selected** | Left accent border (`color.brand.primary`, 3pt) |
| **Disabled** | 40% opacity, no press interaction |

### 9.4 Calendar Day States

| State | Visual Treatment |
|---|---|
| **Default day** | No background, `color.text.primary` |
| **Today** | White ring outline around number |
| **Period day** | `color.phase.menstrual` background, white text |
| **Fertile window** | `color.phase.ovulatory` background, 60% opacity |
| **Ovulation day** | `color.phase.ovulatory` background, star icon |
| **Predicted** | Dashed border in phase color, lighter background |
| **Logged (data exists)** | Dot indicator below date number |
| **Selected** | Brand primary background, white text |

### 9.5 Empty States

Every screen with dynamic content must have a designed empty state:

| Screen | Empty State Message |
|---|---|
| Dashboard | "Welcome to LunaBloom. Start by logging your first period." |
| Calendar | "No cycles recorded yet. Tap + to log your first period." |
| Insights | "Track 2 complete cycles to unlock your personalized insights." |
| Log | "Nothing logged today. How are you feeling?" |
| Learn | Always has content — no empty state needed |

Empty states include:
- A soft, abstract illustration (SVG)
- A brief, actionable message
- A primary CTA button

---

## 10. Accessibility Requirements

All components must pass these requirements before being considered complete:

### 10.1 Contrast Ratios (WCAG 2.1 AA)

| Text Size | Minimum Contrast |
|---|---|
| Regular text (< 18pt) | 4.5:1 |
| Large text (≥ 18pt bold, ≥ 24pt regular) | 3:1 |
| UI components (borders, icons) | 3:1 |

Verify with the Expo accessibility inspector or [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/).

### 10.2 Touch Target Sizes

- Minimum: 44 × 44pt (Apple HIG / Google Material minimum)
- Recommended: 48 × 48pt
- If a visual element is smaller, extend the hit area using `hitSlop`

### 10.3 Screen Reader Support

Every interactive element requires:

```typescript
<Pressable
  accessibilityRole="button"
  accessibilityLabel="Start period today"
  accessibilityHint="Records today as the first day of your period"
>
```

- `accessibilityRole`: button, link, checkbox, radio, etc.
- `accessibilityLabel`: What it is (replaces visual text for screen readers)
- `accessibilityHint`: What it does (optional but recommended for non-obvious actions)
- `accessibilityState`: `{ disabled, checked, selected, expanded }`

### 10.4 Color-Blind Safety

Never use color alone to convey meaning. Always pair with:
- An icon or symbol
- A text label
- A pattern or shape

Cycle phases use both color AND unique icons (see Section 7.3).

### 10.5 Dynamic Text

- All text must scale with the user's system font size
- Test at 200% font scale to ensure no overflow or clipping
- Use `sp` units (React Native `fontSize`) — never fixed pixel sizes
- Cards and containers must accommodate multi-line overflow at large sizes

---

## 11. Token File Reference

| Token File | Location | Contents |
|---|---|---|
| Colors | `src/design-system/tokens/colors.ts` | All color values |
| Typography | `src/design-system/tokens/typography.ts` | Fonts, sizes, weights, line heights |
| Spacing | `src/design-system/tokens/spacing.ts` | Spacing scale |
| Border Radius | `src/design-system/tokens/borderRadius.ts` | Radius values |
| Shadows | `src/design-system/tokens/shadows.ts` | Elevation shadows |
| Motion | `src/design-system/tokens/motion.ts` | Durations, easing |
| Light Theme | `src/design-system/themes/light.ts` | Assembled light theme object |
| Dark Theme | `src/design-system/themes/dark.ts` | Assembled dark theme object |
| Index | `src/design-system/index.ts` | Re-exports everything |

---

*Design System v1.0.0 — Source of truth for all LunaBloom visual decisions.*
