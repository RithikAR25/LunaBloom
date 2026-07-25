# LunaBloom Performance Profiling Report

## Methodology
Before any optimization is applied (e.g., adding `React.memo`, `useMemo`, or `useCallback`), we must capture baseline metrics.
Profiling should be conducted using the **React Native DevTools Profiler** and **Flashlight** (for Android) or **Instruments** (for iOS).

## Test Scenarios

### 1. Theme Switching (Light -> Dark)
- **Action**: User toggles the theme from the settings screen.
- **Expected**: Theme switches within 16ms to maintain 60FPS. No unnecessary component tree re-renders outside of the `ThemeProvider` context subscribers.
- **Baseline Metric**: [To be recorded during QA run]
- **Observations**: 
  - *Note: Look for cascading re-renders in list items. If list items are re-rendering unnecessarily, consider `React.memo` for the list item components.*

### 2. Tab Navigation
- **Action**: User navigates rapidly between the 3 main bottom tabs.
- **Expected**: Instant tab switching. No JS thread locking.
- **Baseline Metric**: [To be recorded during QA run]
- **Observations**:
  - *Note: Ensure heavy screens are lazy-loaded or use InteractionManager to defer heavy processing until the transition completes.*

### 3. List Scrolling (Content/Education Tab)
- **Action**: User scrolls through a long list of articles/videos.
- **Expected**: Smooth 60FPS scroll performance. JS thread FPS > 50.
- **Baseline Metric**: [To be recorded during QA run]
- **Observations**:
  - *Note: Check if `FlashList` or `FlatList` is rendering too many items off-screen.*

## Profiling Tools to Use
1. **React Profiler**: To identify which components are rendering and why (record why each component rendered).
2. **Flipper/React Native DevTools**: To monitor JS/UI thread FPS and memory leaks.
3. **Maestro**: To automate the interactions consistently during profiling.
