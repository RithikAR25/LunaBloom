# Installation & Development Guide

Welcome to the LunaBloom development experience! This document serves as the single authoritative guide for setting up the project and beginning development. 

Since LunaBloom relies on native dependencies (via Expo and React Native) for its offline-first architecture, local setup requires some platform-specific tools.

## 1. Prerequisites & Environment Setup

Before you can run the app, you must configure your local machine for mobile development.

- **Node.js**: Active LTS version (e.g., v18 or v20).
- **Git**: For version control.
- **Platform Tools**: Xcode (macOS only) for iOS development, and Android Studio for Android development.

👉 **Action Required:** If you haven't set up your environment yet, follow our detailed **[Development Setup Guide](./09_Development_Setup.md)** to install the necessary SDKs and tools.

## 2. Installation

Once your environment is prepared, clone the repository and install the dependencies:

```bash
git clone https://github.com/RithikRamachandran/LunaBloom.git
cd LunaBloom

# We use npm to ensure compatibility with our audit scripts
npm install
```

## 3. Running the App

Expo uses the Metro bundler to serve JavaScript to the native app. 

Start the development server:

```bash
npm start
```

From here, you have two primary ways to run the application:
- **Expo Go**: Good for quick UI testing (but may lack some native modules like our custom SQLite integrations).
- **Development Builds**: Highly recommended for a full-featured LunaBloom experience (using local iOS simulators or Android emulators).

👉 **Action Required:** For a step-by-step walkthrough on how to launch the app on simulators, emulators, or physical devices, read the **[Running The App Guide](./11_Running_The_App.md)**.

## 4. Development Workflow & Scripts

The following standard npm scripts are available for daily development:

- `npm start`: Starts the Expo Metro bundler.
- `npm run test`: Runs the Jest unit test suite (Core business logic & Domain layer).
- `npm run lint`: Analyzes the codebase for ESLint rules and accessibility standards.

For advanced visual regression testing with Maestro, see our **[Testing Guide](./12_Testing.md)**.

## 5. Troubleshooting

Mobile development environments can occasionally be brittle. If you encounter caching issues, Metro errors, or unexpected crashes:

👉 **Action Required:** Check our **[Troubleshooting Guide](./16_Troubleshooting.md)** before opening an issue. It contains solutions for the most common Node, Expo, and native build errors.

---

**Next Steps:** Review the **[Architecture Guide](./03_Architecture.md)** and **[Folder Structure](./04_Folder_Structure.md)** to familiarize yourself with the Clean Architecture implementation before writing code.
