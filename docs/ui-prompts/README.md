# LunaBloom — UI Prompts & Stitch Design Registry

**Stitch Project ID:** `3929023419273108988`  
**Design System ID:** `assets/11031544015476034641`  
**Design System:** LunaBloom — Inter font, dark mode, #7C3AED primary purple, ROUND_TWELVE  
**Stitch Link:** [Open in Stitch](https://stitch.withgoogle.com/projects/3929023419273108988)

---

## Purpose

This folder documents every screen's Stitch prompt, generated screen reference, acceptance criteria, and component mapping. It serves as the bridge between Stitch-generated designs and React Native implementation.

## Workflow

```
1. Screen prompt written here (docs/ui-prompts/)
            ↓
2. Stitch generates the screen design
            ↓
3. Developer implements using design system tokens
            ↓
4. Stitch screen ID is recorded here for reference
            ↓
5. PR reviewed against acceptance criteria
```

## Key Principle

**Stitch generates the visual design. Developers implement the layout using our design tokens.**  
Stitch output is a reference — not copy-pasteable code. All implementation uses `useTheme()`, design system tokens, and the Repository Pattern. No business logic lives in screens.

---

## Screen Registry

| Screen | Route | Stitch Screen ID | Status |
|---|---|---|---|
| Dashboard | `/(tabs)/index` | `94145823cd5e44bba0e333674cd272d2` | ✅ Generated |
| Calendar | `/(tabs)/calendar` | See `02_calendar.md` | ✅ Generated |
| Daily Log | `/(tabs)/log` | See `03_daily-log.md` | ✅ Generated |
| Insights | `/(tabs)/insights` | See `04_insights.md` | ✅ Generated |
| Settings | `/(tabs)/settings` | See `05_settings.md` | ✅ Generated |
| Onboarding | `/onboarding` | See `06_onboarding.md` | ✅ Generated |
| Learn | `/learn` | `07_learn.md` | 🔲 Pending |
| PIN Lock | `/(auth)/lock` | `08_pin-lock.md` | 🔲 Pending |

---

## Design Decisions Carried Into Stitch

| Decision | Value |
|---|---|
| Primary color | `#7C3AED` / dark mode `#A78BFA` |
| Background | `#0C0C14` |
| Surface | `#16162A` |
| Font | Inter (all weights) |
| Corner radius | 12pt cards, pill buttons |
| No pink, no florals | Enforced in all prompts |
| Phase + icon always paired | Enforced in all prompts |
| Minimum touch target | 44×44pt |
