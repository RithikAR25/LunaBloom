# LunaBloom Roadmap

This document outlines the high-level trajectory for LunaBloom. As an open-source project, this roadmap is subject to change based on community feedback and contributions.

## Completed Milestones (v1.0.0)
- **Offline-First Architecture**: Complete segregation of Domain logic from UI, with local SQLite persistence.
- **Design System**: Fully migrated to a strict token-driven design system supporting Light/Dark modes.
- **Core Tracking**: Implementation of `Cycle`, `DailyLog`, `HealthNote`, and `CustomSymptom` domains.
- **QA Automation**: Integration of Maestro visual regression testing and accessibility static analysis.
- **Release Ready**: EAS profiles configured for production builds.

## Future Milestones

### v1.x (Short-term Enhancements)
- **Opt-in Crash Monitoring**: Integrate Sentry (or similar) as an opt-in feature to track production crashes while respecting the offline-first privacy model.
- **Data Export & Import**: Allow users to export their local SQLite data to CSV or JSON formats for portability, and import data back into the app.
- **Rich Notifications**: Implement local push notifications (via `expo-notifications`) to remind users to log daily symptoms or alert them of upcoming cycle phases.
- **Enhanced Insights**: More granular charts and data visualizations correlating specific symptoms with cycle phases over a 6-month period.

### v2.0 (The Cloud Update)
- **Opt-in Firebase Sync**: Introduce a `SyncService` in the Infrastructure layer that acts on the `sync_status` flag in SQLite. 
  - *Goal*: Allow users who *choose* to enable cloud backup to securely sync their data across multiple devices.
  - *Constraint*: End-to-end encryption must be implemented to ensure the server never sees raw PHI.
- **Authentication**: Integrate secure authentication (OAuth/Email) purely as a gateway for the cloud sync feature, keeping the app entirely usable without an account.

### Future Explorations
- **Wearable Integrations**: Sync basal body temperature (BBT) or sleep data directly from Apple HealthKit and Google Fit to auto-populate daily logs.
- **AI-Driven Recommendations**: Utilize on-device machine learning (CoreML/TensorFlow Lite) to generate highly personalized educational content and cycle phase predictions without sending data to a server.

---
**Next up:** Want to help us reach these milestones? Read our [Contributing Guide](./15_Contributing.md).
