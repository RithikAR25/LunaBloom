# Troubleshooting Guide

This document covers common issues you might encounter while setting up or developing LunaBloom.

## Dependency & Installation Issues

### `UNABLE_TO_VERIFY_LEAF_SIGNATURE` during `npm install`
**Issue**: This typically occurs on corporate networks or Windows machines where Node.js cannot verify the SSL certificates of the npm registry.
**Solution**: 
If you are behind a corporate proxy, you may need to configure npm to use your system's certificate authority or disable strict SSL temporarily (not recommended for security reasons, but often necessary for local dev):
```bash
npm config set strict-ssl false
```
Alternatively, set your Node options:
```bash
# PowerShell
$env:NODE_OPTIONS="--use-system-ca"
```

### Expo Native Module Conflicts
**Issue**: The app crashes immediately upon launch in Expo Go.
**Solution**: LunaBloom utilizes custom native code (e.g., advanced SQLite wrappers). These often cannot run inside the standard Expo Go app. You must build a Development Build instead. See [Running the App](./11_Running_The_App.md).

## Metro Bundler Issues

### Stale Cache
**Issue**: Changes to your React components aren't reflecting, or you see bizarre import errors after switching Git branches.
**Solution**: Clear the Metro bundler cache.
```bash
npm start -- --clear
```

### Watchman Crawl Errors (macOS)
**Issue**: Metro complains about file watching limits or Watchman fails.
**Solution**: Reinstall Watchman or clear its state.
```bash
watchman watch-del-all
brew reinstall watchman
```

## Android Studio / Emulator Issues

### Emulator Doesn't Boot
**Issue**: Running `npx expo run:android` fails because it can't find an emulator.
**Solution**:
1. Ensure your `ANDROID_HOME` environment variable is set correctly (see [Development Setup](./09_Development_Setup.md)).
2. Open Android Studio, go to the Virtual Device Manager, and launch an emulator manually before running the Expo command.

## Windows-Specific Issues

### Path Too Long Errors
**Issue**: npm or Gradle fails with "path too long" errors.
**Solution**: Enable Long Paths in Windows 10/11 via the Registry Editor or Group Policy Editor, and ensure Git is configured to support long paths:
```bash
git config --system core.longpaths true
```

---
**Next up:** Still have questions? Check the [FAQ](./17_FAQ.md).
