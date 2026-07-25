# Development Setup Guide

This guide covers everything you need to know to get LunaBloom running on your local machine. Because this project uses Expo and React Native, the setup process is streamlined but requires specific environment configurations depending on your target platform (iOS vs. Android).

## Prerequisites

Before cloning the repository, ensure you have the following installed:

1. **Git**: [Download Git](https://git-scm.com/downloads)
2. **Node.js**: [Download Node.js](https://nodejs.org/en/) (Active LTS version, e.g., v18 or v20).
3. **npm**: Included with Node.js. (We use `npm` to ensure compatibility with our audit scripts).
4. **VS Code**: [Download VS Code](https://code.visualstudio.com/).
   - *Recommended Extensions*: ESLint, Prettier, React Native Tools, Expo Tools.

### Platform-Specific Prerequisites

**For iOS Development (macOS only)**
- Install Xcode from the Mac App Store.
- Open Xcode -> Settings -> Locations and ensure the Command Line Tools are selected.
- Install CocoaPods: `sudo gem install cocoapods`.

**For Android Development (Windows, macOS, Linux)**
- Install [Android Studio](https://developer.android.com/studio).
- Open Android Studio -> SDK Manager -> SDK Platforms: Install Android 14 (API Level 34).
- Under SDK Tools: Ensure Android SDK Build-Tools and Android Emulator are installed.
- Configure your `ANDROID_HOME` environment variable:
  - **macOS/Linux** (in `~/.bashrc` or `~/.zshrc`):
    ```bash
    export ANDROID_HOME=$HOME/Library/Android/sdk
    export PATH=$PATH:$ANDROID_HOME/emulator
    export PATH=$PATH:$ANDROID_HOME/platform-tools
    ```
  - **Windows**: Add `%LOCALAPPDATA%\Android\Sdk` to your Environment Variables under `ANDROID_HOME`, and append `%ANDROID_HOME%\platform-tools` to your `Path`.

## Clone and Install

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/LunaBloom.git
   cd LunaBloom
   ```

2. Install dependencies:
   ```bash
   npm install
   ```
   *(If you are on a corporate network and encounter `UNABLE_TO_VERIFY_LEAF_SIGNATURE` errors, you may need to run `npm install --strict-ssl=false` or correctly configure your Node root CAs).*

## Starting the Metro Bundler

Expo uses the Metro bundler to serve your JavaScript to the native app.
Start it with:
```bash
npm start
```
This will open an Expo CLI interface in your terminal. 

## Running the App

### Option A: Expo Go (Fastest for UI tweaks)
1. Download the **Expo Go** app on your physical iOS or Android device.
2. Ensure your phone and computer are on the same Wi-Fi network.
3. Scan the QR code presented in your terminal with your phone's camera (iOS) or the Expo Go app (Android).

### Option B: Local Simulators (Development Builds)
Because LunaBloom uses custom native code (like SQLite), you may encounter limitations with Expo Go. It is highly recommended to run a Development Build.

1. **Run on iOS Simulator (macOS only)**: Press `i` in the Expo terminal.
2. **Run on Android Emulator**: Press `a` in the Expo terminal. 

For full instructions on the differences between these modes, see [Running the App](./11_Running_The_App.md).

## Troubleshooting
If you run into Metro cache issues or dependency conflicts, refer to the [Troubleshooting Guide](./16_Troubleshooting.md).

---
**Next up:** Check [Running the App](./11_Running_The_App.md) to understand Expo's build modes, or review the [Testing Guide](./12_Testing.md) to see how to run the Maestro visual tests.
