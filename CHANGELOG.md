# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-07-24

### Added
- **Visual Regression Testing**: Integrated Maestro for automated UI verification flows.
- **Accessibility Improvements**: Added `eslint-plugin-react-native-a11y` and established an accessibility checklist to ensure inclusive design.
- **Performance Profiling**: Created profiling methodologies to monitor React Native UI and JS thread performance across theme switching and complex navigation.

- **Advanced Validation System**: Implemented an intelligent domain-level rules engine that rejects impossible data (e.g., overlapping periods, future dates) and surfaces granular, personalized warnings for unusual biological patterns (1-day spotting, prolonged bleeding, irregularly short/long cycles).
- **Architecture Audit**: Conducted a comprehensive static dependency audit, resulting in an architecture health score of 98/100.
- **Release Automation Preparedness**: Configured `eas.json` for streamlined Expo Application Services builds (development, preview, and production profiles).
- **QA Automation**: Added custom `audit:all` scripts for security and license compliance checking.

### Changed
- **Dependency Injection**: Relocated `RepositoryProvider` to `app/providers/` to act as a strict Composition Root, ensuring the infrastructure layer has zero knowledge of application state.
- Shifted project focus from design token migration to production readiness and final QA sign-off.
- Bumped application version to `1.0.0` in preparation for initial store release.

### Fixed
- **Circular Dependencies**: Eliminated a high-severity store circular dependency by injecting `ICycleRepository` directly into `useProfileStore`.
- **Infrastructure Leak**: Stripped `DatabaseProvider` of UI themes and presentation layer concerns.
