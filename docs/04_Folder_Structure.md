# Folder Structure

LunaBloom's repository structure is heavily influenced by Clean Architecture and feature-based modularity. The layout is designed to immediately communicate the domain and responsibilities of the code.

## Root Directory

```text
LunaBloom/
├── .expo/                # Expo-managed cache and config (auto-generated)
├── .maestro/             # Visual regression E2E test flows (YAML)
├── app/                  # Expo Router file-based routing
├── assets/               # Static assets (fonts, icons, splash screens)
├── docs/                 # Professional open source documentation
├── scripts/              # Build, audit, and utility scripts
├── src/                  # Application source code
├── __tests__/            # Global test configurations and fixtures
├── app.json              # Expo configuration
├── eas.json              # Expo Application Services build profiles
└── package.json          # Dependencies and npm scripts
```

## The `src/` Directory

The `src` directory maps directly to the layers defined in our [Architecture Guide](./03_Architecture.md).

```text
src/
├── application/          # Application Layer
│   ├── services/         # Cross-entity business logic (e.g., PrivacyService)
│   └── useCases/         # Discrete business actions (e.g., LogDailyData)
│
├── domain/               # Domain Layer (No external dependencies)
│   ├── errors/           # Standardized domain exceptions
│   ├── models/           # Core entities (Cycle.ts, DailyLog.ts)
│   ├── repositories/     # Abstract interfaces (ICycleRepository.ts)
│   ├── services/         # Domain-level services
│   └── use-cases/        # Domain-level use case definitions
│
├── infrastructure/       # Infrastructure Layer
│   ├── database/         # SQLite initialization, migrations (database.ts)
│   ├── repositories/     # Concrete SQLite repository implementations
│   └── storage/          # SecureStore wrappers (e.g., PIN storage)
│
├── presentation/         # Presentation Layer (UI & State)
│   ├── components/       # Reusable React components (forms, charts, privacy locks)
│   ├── hooks/            # Custom React hooks (useTheme)
│   └── stores/           # Zustand state management (useCycleStore.ts)
│
├── design-system/        # Global Design Tokens
│   ├── colors.ts         # Light/Dark semantic color palettes
│   ├── spacing.ts        # Standardized padding/margin tokens
│   ├── typography.ts     # Font families and scale
│   └── theme.ts          # Theme provider abstractions
│
├── constants/            # Global constants (e.g., Layout, Defaults)
└── utils/                # Pure utility functions (e.g., date formatting)
```

## Why This Structure?

1. **Isolation**: By keeping the `app/` directory (Expo Router) separate from `src/`, we decouple the routing mechanism from the UI logic. `app/` files simply import and compose screens from `src/presentation/`.
2. **Scalability**: As the app grows, finding where logic lives is deterministic. UI goes in Presentation, business rules in Application/Domain, and database logic in Infrastructure.
3. **Testability**: Because `src/domain` and `src/application` have no React Native or Expo dependencies, they can be tested using lightning-fast standard Jest unit tests without complex mocking.

---
**Next up:** Review the [Design System Guide](./05_Design_System.md) to understand how the UI is styled, or the [State Management Guide](./08_State_Management.md) to see how data flows into the Presentation layer.
