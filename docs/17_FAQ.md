# Developer FAQ

### Why Expo instead of bare React Native?
Expo has matured significantly with the introduction of Continuous Native Generation (CNG) and Expo Router. It provides an excellent developer experience, handles complex native module linking automatically via Config Plugins, and integrates perfectly with our CI/CD pipeline using EAS. We lose no native capabilities while gaining massive productivity.

### Why SQLite for a local database?
SQLite provides sub-millisecond query times and full relational data modeling. For an offline-first app like LunaBloom, alternatives like `AsyncStorage` or `MMKV` are insufficient for complex data relationships (e.g., joining daily logs to specific cycles and querying historical averages).

### Why Zustand instead of Redux?
Zustand provides a simpler, less boilerplate-heavy approach to state management. In our architecture, the global state is simply an in-memory cache of the Domain Models. We do not need the complex middleware ecosystem of Redux, as our business logic is encapsulated in the Application Layer's Use Cases.

### Why Clean Architecture for a mobile app?
Mobile apps are notorious for becoming tightly coupled to their UI frameworks (like React) or their local storage mechanisms. By enforcing strict boundaries, we ensure that our core business logic—menstrual cycle prediction algorithms and health data validation—can be exhaustively unit tested in pure Node without spinning up simulators or mocking native modules.

### Can Firebase or Cloud Sync be added?
Yes. The architecture explicitly supports this. Because our Application Layer relies on Repository Interfaces rather than direct SQLite calls, a future developer can write a `FirebaseCycleRepository`, implement the `ICycleRepository` interface, and inject it into the application. The business logic will not need to change.

### Can I replace SQLite with WatermelonDB or Realm?
Absolutely. Similar to the Firebase question, you would simply create a new folder in `src/infrastructure/repositories/`, implement the Domain interfaces using your database of choice, and update the `RepositoryProvider` to inject your new repositories.

---
**Next up:** If you're ready to get started, review the [Development Setup](./09_Development_Setup.md).
