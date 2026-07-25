# Project Overview

LunaBloom is an offline-first menstrual cycle and women's health tracking application built with React Native and Expo. 

## Domain Overview

Unlike many health trackers that rely heavily on cloud synchronization and centralized databases, LunaBloom is designed from the ground up to prioritize user privacy and data sovereignty. It provides comprehensive tracking capabilities—ranging from basic cycle predictions to daily symptom logging, mood tracking, and educational insights—entirely offline.

### Key Functional Areas
- **Cycle Tracking**: Algorithm-driven period predictions based on historical cycle averages and variances.
- **Daily Logging**: Granular tracking for symptoms, moods, energy levels, and bespoke physical indicators.
- **Insights**: Data visualization that maps daily logs against cycle phases to identify patterns over time.
- **Learn**: Educational modules covering hormonal health, fertility, and wellness.
- **Privacy Core**: Immediate screen locking, local-only data persistence, and secure credential management.

## Why Offline-First?

Health data is inherently sensitive. The decision to build LunaBloom as an offline-first application was driven by the following requirements:
1. **Absolute Privacy**: By default, no personal health information (PHI) ever leaves the user's device. 
2. **Reliability**: The app remains fully functional in low-connectivity environments.
3. **Performance**: Reading from and writing to a local SQLite database ensures sub-millisecond data access times, allowing for rapid fluid UI interactions that cloud-based apps struggle to match.

While future versions of LunaBloom (v2) may introduce opt-in end-to-end encrypted cloud synchronization (via Firebase), the core architectural principle remains: **The local database is the single source of truth.**

## Target Audience
LunaBloom is targeted at individuals seeking a private, performant, and deeply customizable approach to reproductive health tracking. It caters specifically to users who are mindful of data privacy and who require an application that scales securely as their tracking needs become more sophisticated.

---
**Next up:** Read the [Architecture Guide](./03_Architecture.md) for a deep dive into how LunaBloom is structured, or explore the [Case Study](./02_Case_Study.md) for the engineering story behind its creation.
