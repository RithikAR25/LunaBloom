# Testing Guide

LunaBloom utilizes a multi-layered testing strategy to ensure absolute stability and reliability for our users.

## 1. Unit Testing
We use **Jest** for all unit tests. Because LunaBloom adheres to Clean Architecture, the Domain and Application layers are 100% independent of React Native and Expo. This means business logic tests run instantaneously in a pure Node environment.

- **Run all unit tests**: `npm test`
- **Location**: Test files are located in `__tests__/` (for global setups) or alongside the files they test (e.g., `src/domain/use-cases/CalculateCycle.test.ts`).

## 2. Static Analysis & Type Checking
TypeScript and ESLint are our first line of defense.
- **Type Checking**: Run `npm run typecheck` (`tsc --noEmit`) to verify all types.
- **Linting**: Run `npm run lint` to enforce code style and catch potential errors.

## 3. Accessibility Testing
Accessibility is not an afterthought. We use `eslint-plugin-react-native-a11y` to statically analyze our components.
For manual checks, refer to our comprehensive [Accessibility Checklist](./Accessibility_Checklist.md), which includes verifying dynamic type scaling and screen reader (TalkBack/VoiceOver) logical ordering.

## 4. Visual Regression & E2E Testing (Maestro)
We use **Maestro** for end-to-end visual flows. Maestro parses YAML files to simulate real user interactions on a physical device or emulator.

- **Location**: Test flows are stored in `.maestro/`.
- **Key Flows**: 
  - `app_launch.yaml`: Verifies the app boots successfully without white screens.
  - `theme_switch.yaml`: Verifies that UI elements react correctly to dark mode toggles.
- **How to run**: 
  1. Ensure a Development Build or Release Build is running on your emulator.
  2. Install the Maestro CLI.
  3. Run `maestro test .maestro/` from the repository root.

## 5. Security & Compliance Audits
Before any release, we run a full audit pass:
- **Command**: `npm run audit:all`
- **What it does**: Checks for vulnerable npm packages (`npm audit --audit-level=high`) and validates all open-source licenses using `license-checker-rseaily`.

---
**Next up:** Learn how these tests fit into our deployment pipeline in the [Release Process Guide](./13_Release_Process.md).
