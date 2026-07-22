# ADR-0001: Use Expo Router for Navigation

| Field | Value |
|---|---|
| **Status** | Accepted |
| **Date** | 2026-07-22 |
| **Deciders** | Lead Developer |
| **Supersedes** | — |

---

## Context

LunaBloom requires navigation between multiple screens organized into groups (onboarding, main tabs, education, fertility, authentication lock). The navigation system must support:

- Deep linking (for future notification taps navigating to specific screens)
- Web output (for a potential future companion web dashboard)
- Type-safe route parameters
- Clean URL-based screen organization
- Future scalability without major refactoring

Two primary options exist in the Expo/React Native ecosystem: **Expo Router** and **React Navigation**.

---

## Decision

**Use Expo Router** as the navigation solution for LunaBloom.

---

## Alternatives Considered

### Option A: React Navigation
- The most widely used React Native navigation library
- Mature, well-documented, large community
- Requires manual deep link configuration
- No file-based routing — screens are registered imperatively
- No built-in web support
- No typed routes without third-party plugins
- Will remain supported but is not the Expo team's strategic direction

### Option B: Expo Router ✅ Chosen
- Built and maintained by the Expo team — first-class SDK citizen
- File-based routing (like Next.js) — screen location = URL path
- Automatic deep linking with zero configuration
- Typed routes via generated `expo-router/types`
- Supports web output via Metro bundler
- Built-in `Stack`, `Tabs`, `Drawer` layouts
- Active development; SDK 57 target

### Option C: React Native Navigation (Wix)
- Native-first navigation with best performance
- Very heavy — complex setup, native code
- Overkill for a health tracking app
- Poor Expo compatibility — eliminated immediately

---

## Trade-offs

| Consideration | Impact |
|---|---|
| Expo Router is newer than React Navigation | Less legacy documentation; fewer Stack Overflow answers for edge cases |
| File-based routing requires discipline | Folder structure IS the navigation structure — must keep `app/` clean |
| Typed routes require build step | `npx expo customize tsconfig.json` must be run to enable typed routes |
| Long-term alignment | Expo team is investing heavily in Expo Router |

---

## Consequences

**Positive:**
- Automatic deep linking enables notification tap-to-screen with zero configuration
- File-based routing makes the codebase self-documenting
- Typed routes catch navigation errors at compile time
- Future web companion app is architecturally supported from day one

**Negative:**
- Less mature ecosystem; some third-party libraries may have React Navigation assumptions
- Requires understanding of Expo Router's layout system (`_layout.tsx`, route groups)

---

## References
- [Expo Router Documentation v57](https://docs.expo.dev/versions/v57.0.0/sdk/router/)
