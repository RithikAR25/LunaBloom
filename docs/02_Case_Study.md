# Engineering Case Study: Building LunaBloom

*By Rithik Ramachandran*

---

## Introduction

In modern application development, the default assumption is almost always "cloud-first." When building a new product, the immediate impulse is to spin up a PostgreSQL instance, attach a REST or GraphQL API, and connect it to a mobile frontend. For many applications, this is the correct approach. However, when dealing with highly sensitive personal health information (PHI)—specifically reproductive health data—the calculus changes entirely.

LunaBloom was conceived as a reaction to a market saturated with "free" health tracking applications that monetize user data. The objective was to build a comprehensive, performant, and beautifully designed menstrual cycle and women's health tracker where privacy was not merely a feature, but the foundational architectural constraint. 

This case study details the engineering journey of building LunaBloom. It explores why an offline-first architecture was mandated, how Clean Architecture principles were applied to a React Native application to maintain code quality, and the specific challenges faced when decoupling a complex user interface from a highly relational local database.

---

## The Problem

The digital health tracking ecosystem presents a paradoxical challenge to users. The more detailed and granular the data a user provides (e.g., logging exact symptoms, moods, medications, and cycle lengths), the more accurate the predictions become. However, this exact same granularity increases the severity of the privacy risk if that data is compromised, sold to third-party data brokers, or intercepted.

Furthermore, traditional cloud-dependent applications suffer from UX degradation. When a user opens an app to quickly log a symptom, they are often greeted by loading spinners as the application negotiates with a remote server. If the user is on an airplane, in a remote area, or experiencing poor cellular coverage, the application becomes practically useless.

The problem statement for LunaBloom was clear: **How do we deliver the analytical power and rich user experience of a modern, data-heavy tracking application without requiring the user's data to ever leave their physical device?**

---

## Research & Requirements

Before writing a single line of code, the project required a rigorous definition of technical constraints and product requirements.

### Core Requirements
1. **Absolute Privacy**: The application must function 100% offline. No telemetry, no cloud backups (in version 1), and no third-party analytics SDKs that might scrape data.
2. **Performance**: The app must open instantly. Querying historical averages across years of logged data must happen without noticeable UI frame drops. The target was a consistent 60 Frames Per Second (FPS) on standard mid-range mobile hardware.
3. **Complex Relational Data**: The data model isn't a simple list of key-value pairs. Cycles possess a one-to-many relationship with daily logs. Daily logs possess many-to-many conceptual relationships with specific user-defined symptoms. 
4. **Maintainability**: The codebase must be highly structured so that future contributors can easily reason about the business logic without wading through UI rendering code.

### Technological Evaluation
Given the requirement to ship to both iOS and Android natively while maintaining a single codebase, **React Native** (specifically managed via **Expo**) was selected. Expo's Continuous Native Generation (CNG) allowed for rapid iteration without the overhead of managing brittle Xcode and Gradle configurations manually.

For the persistence layer, basic Key-Value stores like `AsyncStorage` or `MMKV` were immediately disqualified. While `MMKV` is extraordinarily fast, it lacks the ability to execute complex relational queries (e.g., "Find the average cycle length over the past 6 months where the cycle was not flagged as irregular"). **SQLite** was chosen because it provides the robust relational modeling of a traditional backend database, directly on the device.

---

## Architecture Decisions

The most significant engineering decision in LunaBloom was the adoption of **Clean Architecture**. 

In the React ecosystem, it is notoriously easy to fall into the "Massive Component" anti-pattern. Developers frequently fetch data via a hook, massage that data into a usable format, calculate business logic, and render the UI—all within a single file. For a simple app, this is fine. For an application calculating reproductive health predictions based on historical variances, it is a disaster for testability.

### The Dependency Rule

Clean Architecture dictates that code dependencies can only point inward. We defined four distinct layers:

1. **Domain Layer**: The innermost circle. It contains pure TypeScript interfaces and classes representing our core entities (`Cycle`, `DailyLog`). It knows nothing about React, SQLite, or the internet. 
2. **Application Layer**: Contains "Use Cases" (e.g., `LogSymptomUseCase`). This layer orchestrates the flow of data. It takes input from the user, validates it against Domain rules, and calls repository interfaces to save it.
3. **Presentation Layer**: The UI. React Native components, Expo Router configurations, and Zustand state stores live here.
4. **Infrastructure Layer**: The outermost circle. This contains the concrete implementations of our database queries. It knows how to talk to SQLite and map SQL rows back into our pure Domain models.

### The Repository Pattern

To enforce the Dependency Rule, we utilized the Repository Pattern. The Application Layer does not import SQLite. Instead, the Domain Layer defines an interface:

```typescript
export interface ICycleRepository {
  findById(id: string): Promise<Cycle | null>;
  save(cycle: Cycle): Promise<void>;
  // ...
}
```

The Infrastructure Layer implements this interface (`SQLiteCycleRepository`). At application startup, the Presentation Layer instantiates the SQLite repositories and injects them into the Application Use Cases. 

This abstraction proved to be the most valuable architectural decision of the project. It meant that we could write hundreds of Jest unit tests for our cycle prediction algorithms by passing in an "In-Memory" mock repository, running tests in milliseconds without ever touching a real database.

---

## Major Challenges

### Challenge 1: The Offline-First Schema Design
Designing a database schema for an application that never talks to a server sounds easy, until you plan for the future. We knew that Version 2 of LunaBloom would likely include an opt-in, end-to-end encrypted cloud sync feature for users who wanted device backups. 

If we designed the schema using standard auto-incrementing integer IDs, merging data from two different devices (e.g., an iPad and an iPhone) would result in catastrophic primary key collisions. 

**The Solution:**
We enforced UUID v4 for all primary keys across all tables. Furthermore, we implemented a strict "Soft Delete" policy. No `DELETE` SQL statements are ever executed during normal app operation. Instead, records are timestamped with a `deleted_at` value. We also added a `sync_status` column (defaulting to `'LOCAL'`). 
This means that when v2 cloud sync is implemented, the local database already possesses the exact tombstoning architecture required to resolve sync conflicts.

### Challenge 2: UI Responsiveness During Heavy Queries
React Native runs its JavaScript on a single thread. When calculating insights—for example, mapping a user's average pain levels against specific cycle days over a two-year period—the required SQLite queries and subsequent JavaScript data transformations can block the JS thread, causing the UI to freeze or drop frames.

**The Solution:**
We adopted a highly aggressive caching strategy in our Zustand stores. The Presentation Layer never waits for a deep calculation to happen on the fly. 
When a user logs a new symptom, the Application Use Case performs the calculation in the background, updates the database, and then updates the thin Zustand store. The UI merely reacts to the store changing. By decoupling the read-heavy UI from the write-heavy database logic, the app achieves a perceived latency of zero.

### Challenge 3: Dark Mode and The Design System
Early in development, styling was handled via standard `StyleSheet.create` using hardcoded hex values. When the requirement for a dynamic Dark Mode was introduced, the UI code became littered with ternary operators checking the current theme. This was unmaintainable.

**The Solution:**
We halted feature development and refactored the entire presentation layer to use a strict Design Token architecture. We created `src/design-system/` and defined semantic color tokens (`backgroundPrimary`, `surfaceElevated`, `textSecondary`). 
We built a custom `useTheme()` hook that subscribes to the device's system theme and provides the correct color palette to the components. This completely eradicated inline ternary logic and resulted in a theme-switching experience that operates flawlessly at 60 FPS.

---

## Interesting Engineering Decisions

### 1. Zustand Over Redux
In an architecture as heavily structured as LunaBloom, one might expect Redux to be the state management tool of choice. However, Redux's heavily opinionated middleware (like Thunks or Sagas) tends to blur the lines of Clean Architecture by pulling business logic into the state layer.
By using Zustand, we treated the global state strictly as a "dumb" in-memory cache of our Domain Models. The stores simply call the Application Use Cases and store the result, maintaining absolute separation of concerns.

### 2. E2E Testing with Maestro
Testing a React Native application is notoriously difficult. Appium is heavy, and Detox requires complex native builds. We chose **Maestro** for our visual regression and end-to-end testing. Because Maestro operates via YAML scripts and interacts with the UI hierarchy directly from the outside, it perfectly simulated real user behavior (like navigating tabs and toggling themes) without requiring us to embed test IDs deep into the native code.

---

## Lessons Learned

1. **Upfront Abstraction Pays Dividends**: The decision to implement Clean Architecture felt like overkill during the first week of development. Writing interfaces for simple database queries felt redundant. However, by week four, when the cycle prediction logic became immensely complex, the ability to test that logic in pure Node.js isolation saved an unquantifiable amount of debugging time.
2. **Offline-First is Hard**: Managing application state when you cannot rely on a server to validate data forces you to write incredibly robust client-side validation. The Domain layer must be bulletproof, as there is no backend API to catch bad data.
3. **Types are Documentation**: Enforcing strict TypeScript not only prevented runtime errors but served as the best possible documentation for the data model. A new contributor can look at `Cycle.ts` and instantly understand the entire domain.

---

## Future Improvements

While LunaBloom v1.0.0 is a stable, production-ready release, the roadmap is clear. 

The immediate next step is implementing the opt-in **v2 Cloud Sync**. The database is already primed for this with its UUIDs and `sync_status` flags. The challenge will be implementing secure end-to-end encryption (E2EE) on the client side before the payload is dispatched to a Firebase backend, ensuring that even the database administrators cannot read the user's health logs.

Additionally, we plan to implement a local data export feature, allowing users to extract their SQLite data into a CSV format. This reinforces the core philosophy of the application: the user owns their data.

---

## Results

LunaBloom successfully achieves its primary objective: providing a rich, analytical, and performant health tracking experience without compromising user privacy. 

By strictly adhering to Clean Architecture, the project maintains a codebase that is scalable, highly testable, and welcoming to open-source contributors. The offline-first methodology guarantees reliability in any network condition and ensures that sensitive data remains exactly where it belongs—in the hands of the user.

*If you are interested in exploring the codebase, please visit the repository and read through the [Architecture Guide](./03_Architecture.md).*
