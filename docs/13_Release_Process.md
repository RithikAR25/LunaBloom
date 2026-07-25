# Release Process

LunaBloom uses **Expo Application Services (EAS)** to automate and manage the creation of production binaries for iOS and Android. 

Before triggering any release build, ensure you have gone through the pre-flight checks outlined below.

## 1. Pre-Flight Checklist
Before bumping the version, you must complete the full QA suite. This is formalized in our [Release Checklist](./release_checklist.md).
- **Automated Tests**: Run `npm test` and `npm run typecheck`.
- **Security Audit**: Run `npm run audit:all`.
- **E2E Visual Tests**: Execute the Maestro suite (`maestro test .maestro/`).
- **Performance Profiling**: Verify that the production build maintains a stable 60FPS during theme switching (as defined in `Performance_Report.md`).

## 2. Versioning & Changelog
LunaBloom follows [Semantic Versioning](https://semver.org/).
1. Bump the `"version"` field in both `app.json` and `package.json`.
2. Document all notable changes, additions, and fixes in `CHANGELOG.md` under the new version header.

## 3. Building with EAS
We maintain three profiles in `eas.json`: `development`, `preview`, and `production`.

### Building for Internal QA (Preview)
If you need to distribute the app to internal testers before store submission:
```bash
eas build --profile preview --platform all
```

### Building for Production (Stores)
To generate the final `.aab` (Android) and `.ipa` (iOS) files for the app stores:
```bash
eas build --profile production --platform all
```

## 4. Store Submission
EAS can automatically submit your production builds to TestFlight and the Google Play Console using the `eas submit` command.

- **iOS**: `eas submit -p ios --latest`
- **Android**: `eas submit -p android --latest`

*Note: You must have your Apple Developer and Google Play service credentials configured in your Expo account for automatic submission to work.*

---
**Next up:** Look toward the future with our [Roadmap](./14_Roadmap.md).
