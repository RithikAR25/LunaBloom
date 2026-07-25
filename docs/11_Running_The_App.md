# Running the App

LunaBloom uses Expo, which provides multiple ways to build, run, and test the application depending on what you are trying to achieve.

## The Three Modes of Execution

### 1. Expo Go (Development Mode)
Expo Go is a pre-built app available on the App Store and Google Play. It contains the standard Expo SDK native modules.
- **When to use**: For rapid UI prototyping, styling changes, and modifying purely JavaScript/TypeScript files.
- **How to run**: `npm start`, then scan the QR code.
- **Limitations**: LunaBloom uses custom native code (e.g., `expo-sqlite`). Certain features may not work or may crash when running inside Expo Go, as Expo Go does not include these custom native bindings.

### 2. Development Builds (Continuous Native Generation)
A Development Build is a custom version of Expo Go generated specifically for LunaBloom. It includes all of our custom native dependencies (like Expo SQLite).
- **When to use**: For active development and testing native features. This is the **recommended** way to develop LunaBloom.
- **How to run locally**:
  - `npx expo run:ios` (Requires macOS and Xcode)
  - `npx expo run:android` (Requires Android Studio)
- **How it works**: Expo uses Continuous Native Generation (CNG) to compile the `ios/` and `android/` folders on the fly. You do not need to manually edit native code.

### 3. Release Builds (Production)
A Release Build is the highly optimized, minified version of the app intended for end-users. Metro bundler is not used during a release build (the JS bundle is embedded directly into the native binary).
- **When to use**: For profiling performance (like 60FPS theme switching), final QA testing, or submitting to the App Store / Google Play.
- **How to run**: Release builds are typically compiled in the cloud using Expo Application Services (EAS). See the [Release Process Guide](./13_Release_Process.md) for instructions on creating these.

## Summary Checklist for Developers

1. **Working on UI/Colors?** -> Use `npm start` with Expo Go.
2. **Working on Native Modules?** -> Use `npx expo run:android` or `npx expo run:ios`.
3. **Checking Performance?** -> Create a local production build or use an EAS Preview build.

---
**Next up:** Learn how we ensure quality in the [Testing Guide](./12_Testing.md).
