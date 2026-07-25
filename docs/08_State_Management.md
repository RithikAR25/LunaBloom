# State Management Guide

LunaBloom uses **Zustand** for global state management. Zustand was chosen over Redux or Context API because of its minimalistic boilerplate, excellent TypeScript support, and high performance (avoiding unnecessary provider re-renders).

## Thin Stores Strategy

In alignment with our [Clean Architecture](./03_Architecture.md), our Zustand stores are intentionally kept **"thin"**. 

The stores live in the Presentation layer (`src/presentation/stores/`). Their primary responsibilities are:
1. Holding the in-memory representation of Domain Models so React components can render them synchronously.
2. Providing action functions that React components can call.
3. Invoking Application Use Cases to perform actual business logic.

**Crucially, business logic does not live in the stores.**

### Anti-Pattern (What we avoid)
```typescript
// BAD: Business logic and data manipulation inside the store
const useCycleStore = create((set) => ({
  cycles: [],
  logPeriod: (date) => {
    // ❌ Logic to find active cycle, calculate overlap, and mutate DB directly
  }
}));
```

### Correct Pattern (What we do)
```typescript
// GOOD: Store delegates to a Use Case
const useCycleStore = create((set, get) => ({
  cycles: [],
  logPeriod: async (date) => {
    // ✅ Retrieve the injected repository
    const repo = getRepository('cycle');
    
    // ✅ Instantiate and execute the Use Case
    const useCase = new LogPeriodUseCase(repo);
    const updatedCycles = await useCase.execute(date);
    
    // ✅ Update the local state with the result
    set({ cycles: updatedCycles });
  }
}));
```

## State Flow

When a user interacts with the UI, the flow of state is as follows:
1. A React Component calls a store action (e.g., `useCycleStore.getState().logPeriod()`).
2. The Store invokes the corresponding Use Case from the Application layer.
3. The Use Case executes, interacts with Domain Repositories (SQLite), and returns updated Domain Models.
4. The Store receives the updated models and calls `set()`.
5. Zustand triggers a targeted re-render of only the React Components subscribed to that specific state slice.

*(For a visual representation of this, see the [Flow Diagram](./assets/flow-diagram.md).)*

## Managing Hydration & Loading

Because data must be loaded from SQLite on app startup, the root `AppProviders` component (in `app/_layout.tsx`) calls hydration methods on the stores:
- `useProfileStore.getState().loadProfile()`
- `useCycleStore.getState().loadCycles()`

Components should check the `isLoading` flag on the stores before rendering content that depends on database data, ensuring a smooth offline-first experience without flickering empty states.

---
**Next up:** Check the [Development Setup Guide](./09_Development_Setup.md) to get the app running on your machine.
