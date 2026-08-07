# Prediction Engine Technical Reference

## 1. Overview

The Prediction Engine is the core domain logic responsible for analyzing logged menstrual cycles, predicting future cycles, and resolving biological phases for any given date. 

**Purpose & Responsibilities:**
- Calculates cycle lengths from raw logged dates.
- Produces robust mathematical predictions for future cycle lengths using a combination of Linear Weighted Moving Averages (LWMA) and Cauchy continuous decay weighting (outlier suppression).
- Maps biological cycle phases (Menstrual, Follicular, Ovulation, Luteal) and fertility windows.
- Retroactively reconstructs historical biological phases based on factual completed cycle lengths.
- Exposes a fully indexed timeline for UI components (Calendar, Dashboard) to consume via constant-time `O(1)` lookups.

**Design Goals & Architectural Principles:**
- **Code as Truth:** The engine relies purely on pure functions and deterministic math.
- **Robustness over Brittleness:** It mathematically down-weights outliers rather than crashing or throwing away data.
- **Immutability:** The engine takes inputs and returns generated data structures. It does not mutate the `CycleEntry` database.
- **Separation of Concerns:** Prediction (math), Biology (phases), Timeline (event mapping), and UI Resolution are handled by strictly separated services.

**What the Engine Does NOT Do:**
- It does not persist data to the database.
- It does not fetch data from the network.
- It does not render UI directly.

**Complete Pipeline at a High Level:**
Raw Logged Cycles → Outlier & Variability Math (MAD) → LWMA Prediction → Historical Phase Reconstruction → Future Phase Prediction → Timeline Event Generation → Date Indexing → Fast Resolver Lookups → UI Components.

---

## 2. Architecture

```mermaid
flowchart TD
    UserLogs[User Logs Cycle] --> CycleStore[(Cycle Store)]
    CycleStore --> PredictionEngine[PredictionEngine (Facade)]
    PredictionEngine --> CyclePredictionService[CyclePredictionService]
    CyclePredictionService --> TimelineBuilder[TimelineBuilder]
    TimelineBuilder --> TimelineIndexer[TimelineIndexer]
    PredictionEngine --> DashboardMetricsBuilder[DashboardMetricsBuilder]
    PredictionEngine --> PhaseResolver[PhaseResolver]
    TimelineIndexer --> PhaseResolver
    PhaseResolver --> Calendar[Calendar UI]
    DashboardMetricsBuilder --> Dashboard[Dashboard UI]
```

---

## 3. Component Responsibilities

### `PredictionEngine` (Facade)
- **Purpose:** Provide a single entry point to the prediction sub-system.
- **Responsibilities:** Orchestrates the prediction, building, indexing, and dashboard metric generation.
- **Inputs:** `CycleEntry[]`, `avgCycleLength`, `avgPeriodDuration`, `referenceDate`.
- **Outputs:** `TimelineData` (events, intervals, index, dashboardInfo).
- **Dependencies:** `CyclePredictionService`, `TimelineBuilder`, `TimelineIndexer`, `PhaseResolver`, `DashboardMetricsBuilder`.
- **Files Involved:** `PredictionEngine.ts`

### `CyclePredictionService`
- **Purpose:** The mathematical and biological core.
- **Responsibilities:** Calculates MAD, applies LWMA with Cauchy weighting, and computes biological dates.
- **Inputs:** `CycleEntry[]`, fallback lengths.
- **Outputs:** `CyclePrediction` (future biology) and `CycleBiology` (historical biology).
- **Dependencies:** `statisticsUtils.ts`, `dateUtils.ts`.
- **Files Involved:** `services/CyclePredictionService.ts`

### `TimelineBuilder`
- **Purpose:** Converts biological dates into flat timeline events.
- **Responsibilities:** Maps logged cycles to factual intervals, maps predictions to future intervals, reconstructs historical intervals, and resolves priority conflicts between logged/predicted events.
- **Inputs:** `CycleEntry[]`, `CyclePrediction`.
- **Outputs:** `{ events: TimelineEvent[], intervals: PhaseInterval[] }`.
- **Dependencies:** `CyclePredictionService`.
- **Files Involved:** `services/TimelineBuilder.ts`

### `TimelineIndexer`
- **Purpose:** Performance optimization.
- **Responsibilities:** Groups `TimelineEvent`s by date string into a hash map for `O(1)` lookups.
- **Inputs:** `TimelineEvent[]`.
- **Outputs:** `Map<string, TimelineEvent[]>`.
- **Dependencies:** None.
- **Files Involved:** `services/TimelineIndexer.ts`

### `PhaseResolver`
- **Purpose:** Queries the generated timeline for a specific date.
- **Responsibilities:** Looks up the active phase, calculates current cycle day, and determines fertility status.
- **Inputs:** `dateStr`, `PhaseInterval[]`, `Map<string, TimelineEvent[]>`.
- **Outputs:** `PhaseInfo`.
- **Dependencies:** None.
- **Files Involved:** `services/PhaseResolver.ts`

### `DashboardMetricsBuilder`
- **Purpose:** Extracts top-level metrics for dashboard UI.
- **Responsibilities:** Calculates days until next period and formats predicted cycle length.
- **Inputs:** `referenceDate`, `CyclePrediction`.
- **Outputs:** `PredictionSummary`.
- **Dependencies:** `dateUtils.ts`.
- **Files Involved:** `services/DashboardMetricsBuilder.ts`

---

## 4. Data Models

### `CyclePrediction`
- **Fields:** `fertileWindowStart`, `fertileWindowEnd`, `ovulationDate`, `nextPeriodStart`, `nextPeriodEnd`, `predictedCycleLength`, `predictedPeriodDuration`, `confidence`, `explanation`.
- **Meaning:** Represents the fully calculated biological future for the upcoming cycle.
- **Produced by:** `CyclePredictionService`.
- **Consumed by:** `TimelineBuilder`, `DashboardMetricsBuilder`.
- **Persistence:** Transient.

### `CycleBiology`
- **Fields:** `periodStart`, `periodEnd`, `follicularStart`, `follicularEnd`, `fertileWindowStart`, `fertileWindowEnd`, `ovulationDate`, `lutealStart`, `lutealEnd`.
- **Meaning:** The exact biological mapping for a single cycle (historical or predicted).
- **Produced by:** `CyclePredictionService`.
- **Consumed by:** `TimelineBuilder`.
- **Persistence:** Transient.

### `PhaseInterval`
- **Fields:** `phase` (MENSTRUAL, FOLLICULAR, OVULATION, LUTEAL), `startDate`, `endDate`, `source`, `confidence`.
- **Meaning:** A continuous block of time representing a biological phase. Phases are mutually exclusive per day.
- **Produced by:** `TimelineBuilder`.
- **Consumed by:** `PhaseResolver`.
- **Persistence:** Transient.

### `TimelineEvent`
- **Fields:** `id`, `type` (PERIOD, FERTILE_WINDOW, OVULATION), `date`, `duration`, `source`, `priority`, `confidence`.
- **Meaning:** Functional events that map to the calendar. Unlike phases, events can overlap (e.g., fertile window overlaps follicular phase).
- **Produced by:** `TimelineBuilder`.
- **Consumed by:** `TimelineIndexer`, `PhaseResolver`.
- **Persistence:** Transient.

### `PredictionSummary`
- **Fields:** `predictedCycleLength`, `daysUntilNextPeriod`, `nextPeriodDate`, `confidence`.
- **Meaning:** Data payload specifically formatted for the Dashboard UI.
- **Produced by:** `DashboardMetricsBuilder`.
- **Consumed by:** (Dashboard UI - implementation cannot be determined from current codebase).
- **Persistence:** Transient.

---

## 5. Complete Prediction Pipeline

1. **Cycle length recalculation:** The system calculates the known lengths of completed cycles. Cycles explicitly marked `isExcludedFromPredictions` are filtered out.
2. **PredictionEngine execution:** The facade `generateTimeline()` is called with `CycleEntry[]`.
3. **Variability Measurement:** `CyclePredictionService` computes the Median and Median Absolute Deviation (MAD) of the cycle lengths.
4. **Future prediction:** A weighted sum is calculated using an LWMA recency weight multiplied by a Cauchy outlier weight based on the MAD.
5. **Historical reconstruction:** `TimelineBuilder` loops through logged cycles. For completed cycles, it passes the known length to `predictHistoricalCycle()` to reconstruct past biology.
6. **Timeline generation:** `TimelineBuilder` emits `PhaseInterval`s and `TimelineEvent`s for both historical facts and the predicted future. Conflicts are resolved by priority.
7. **Index creation:** `TimelineIndexer` groups events by date.
8. **Resolver lookup:** The UI calls `PhaseResolver.getPhaseForDate()` iteratively for calendar rendering.
9. **UI rendering:** `DayCell` renders colors and dots based on the resolved `PhaseInfo`.

---

## 6. Mathematical Algorithms

### Linear Weighted Moving Average (LWMA)
- **Purpose:** Give more predictive power to recent cycles.
- **Inputs:** `n` (number of cycles), `i` (recency index, where `n` is most recent).
- **Formula:** `weight = (2 * i) / (n * (n + 1))`
- **Location:** `CyclePredictionService.ts`

### Median Absolute Deviation (MAD)
- **Purpose:** A robust measure of cycle variability, highly resistant to outliers compared to Standard Deviation.
- **Inputs:** Array of cycle lengths, median cycle length.
- **Formula:** `median(|x - medianVal|)`
- **Location:** `statisticsUtils.ts`

### Cauchy Continuous Decay Weighting
- **Purpose:** Softly down-weight anomalous cycles (outliers) instead of hard-deleting them.
- **Inputs:** `distance` (from median), `mad`.
- **Formula:** `1 / (1 + (distance / (mad * 2.5))^2)`
- **Location:** `statisticsUtils.ts`

### Confidence Calculation
- **Purpose:** Assign HIGH/MEDIUM/LOW reliability to predictions.
- **Inputs:** `n` (number of cycles), `mad` (variability).
- **Rules:**
  - `HIGH`: `n >= 3` AND `mad <= 2`
  - `MEDIUM`: `n >= 2` AND `mad <= 5`
  - `LOW`: Otherwise.
- **Location:** `CyclePredictionService.ts`

---

## 7. Biological Model

The engine hardcodes standard clinical assumptions:
- **Fixed Luteal Assumption:** Ovulation always occurs exactly **14 days** before the start of the next cycle. (`cycleLength - 14`).
- **Fertile Window:** Sperm lives up to 5 days. The window starts **5 days before ovulation** and ends on the day of ovulation. (`addDays(ovulationDate, -5)`).
- **Follicular Phase:** Starts the day after the period ends and runs until the day *before* ovulation.
- **Luteal Phase:** Starts the day *after* ovulation and runs until the day before the next period.

---

## 8. Historical Reconstruction

Historical reconstruction ensures the calendar accurately reflects the user's biological reality for past months. 
- **Facts:** Logged period start dates and end dates are undeniable facts (`source: 'LOGGED'`).
- **Reconstruction:** For any completed cycle, the true length is known (Days between Period A and Period B). The engine passes this exact, factual cycle length into the biological model (`predictHistoricalCycle()`). 
- **Result:** Ovulation and fertile windows are mapped perfectly onto the calendar retroactively (`source: 'RECONSTRUCTED'`), rather than relying on historical averages.
- **Conflict Resolution:** If a predicted event overlaps a logged event (e.g. a period arrives early), `LOGGED` priority strictly overrides `PREDICTED` priority, and the timeline builder purges the invalid prediction.

---

## 9. Future Prediction

- **Length Prediction:** Combines LWMA and Cauchy weights.
- **Future Phases:** Mapped forward from the last logged period using the predicted cycle length (`source: 'PREDICTED'`).
- **Degradation:** If cycles are highly variable (`mad > 5`) or there are fewer than 2 cycles, confidence degrades to `LOW`, triggering fallback UI states.
- **Defaults:** If no completed cycles exist, the engine relies on `fallbackAvgCycleLength` (default 28) and `predictedPeriodDuration` (default 5).
- **Horizon Limit:** Configured via `PredictionConfig.MAX_PREDICTED_CYCLES` (currently set to `1`).

---

## 10. Timeline Generation

1. **Mapping Logged Cycles:** `TimelineBuilder` loops through database entries, creating `LOGGED` period events.
2. **Mapping Reconstructed Phases:** It calculates the biology for past cycles, emitting `RECONSTRUCTED` events (Priority 85/95).
3. **Mapping Predictions:** It calculates biology for the next cycle, emitting `PREDICTED` events (Priority 55/65).
4. **Conflict Resolution:** `resolveConflicts()` filters events of the same type. `LOGGED` (Priority 100/5) > `RECONSTRUCTED` (3/4) > `PREDICTED` (1/2).

---

## 11. Resolver

`PhaseResolver` processes a specific calendar date in `O(1)` complexity:
1. **Cycle Day Lookup:** Finds the most recent `MENSTRUAL` phase before the target date.
2. **Phase Lookup:** Finds the `PhaseInterval` overlapping the date.
3. **Fertility Lookup:** Checks the `TimelineEvent` map for `FERTILE_WINDOW` or `OVULATION` events on that exact date.
4. **Confidence resolution:** If the interval confidence is `LOW`, fertility is forcibly downgraded to `unknown`.

---

## 12. Calendar Rendering Pipeline

1. `CycleCalendar.tsx` mounts and creates a `PredictionEngine` instance.
2. It calls `generateTimeline()` once.
3. It loops over the days of the visible month, calling `engine.getPhaseForDate()` for each day (`O(1)` lookup).
4. Data is mapped to `DayState` (`none`, `menstrual`, `predicted_menstrual`, `follicular`, `ovulatory`, `luteal`).
5. Passed as props to `CalendarGrid.tsx` -> `DayCell.tsx`.
6. **Rendering rules (`DayCell.tsx`):**
   - **Backgrounds:** `menstrual`, `follicular`, `ovulatory`, `luteal` hex codes.
   - **Prediction Styling:** Opacity is reduced to `1A` (from `33`) and borders become `dashed` if `source === 'PREDICTED'`.
   - **Fertility Dots:** Rendered as an absolute-positioned colored dot if `fertilityStatus` is `fertile` or `possible`.

---

## 13. Dashboard Pipeline

1. `PredictionEngine` calls `DashboardMetricsBuilder`.
2. Emits `PredictionSummary` containing `daysUntilNextPeriod`, `predictedCycleLength`, `nextPeriodDate`, and `confidence`.
3. *(Note: The actual UI consumption of this payload cannot be determined from the current codebase as Dashboard components are not present/linked in the analyzed files).*

---

## 14. Insights Pipeline

*(Note: Insights functionality, statistics charts, and empty states cannot be determined from the current implementation. No Insights UI components currently import `PredictionEngine` in the analyzed codebase).*

---

## 15. Performance

- **Build Complexity:** `O(N)` where N is the number of logged cycles. Building the timeline is highly efficient.
- **Index Complexity:** `TimelineIndexer` creates a `Map<string, TimelineEvent[]>`. Insertion is `O(M)` where M is the number of generated events.
- **Lookup Complexity:** `PhaseResolver` operates in `O(1)` for event lookups via the Map, and `O(P)` for interval lookups (where P is the very small number of generated phase intervals, typically < 10).
- **Why Indexer Exists:** Without it, rendering a 35-day calendar grid would require 35 array scans (`O(D * M)`). The indexer reduces this to `O(D)` for the entire month.

---

## 16. Complete Scenario Walkthroughs

### Scenario A (New User - July 15)
- **Logged Cycles:** 1 (July 15).
- **Completed Cycles:** 0.
- **Calculated Lengths:** None.
- **Median & MAD:** N/A.
- **Confidence:** `LOW` (n=0). Explanation: "More cycle history will improve predictions."
- **Prediction:** Fallback length `28`. Next period: `August 12`. Ovulation: `July 29`.
- **Calendar Rendering:** Shows logged period for July 15-19. Shows dashed predicted period starting August 12.

### Scenario B (Two Cycles - June 21, July 15)
- **Logged Cycles:** 2.
- **Completed Cycles:** 1 (24 days).
- **Median & MAD:** Median 24, MAD 0.
- **Confidence:** `LOW` (n=1).
- **Prediction:** Length `24`. Next period: `August 8`. Ovulation: `July 25`.
- **Historical Reconstruction:** June 21 cycle reconstructed using exactly 24 days. Ovulation placed on `July 7`.

### Scenario D (Five Dates - Mar 24, Apr 21, May 25, Jun 21, Jul 15)
- **Completed Cycle Lengths:** `[24, 27, 34, 28]` (Recent to oldest).
- **Median:** `27.5`.
- **MAD:** `2.0`.
- **Weighted Prediction:** The 34-day outlier is squashed by the Cauchy formula (weight `~0.37` in outlier decay resulting in combined relative weight of `0.07`). Resulting prediction: `27 days`.
- **Confidence:** `HIGH` (n=4, MAD=2.0).
- **Next Period:** `August 11`.
- **Ovulation:** `July 27`.
- **Calendar Rendering:** Mar, Apr, May, Jun cycles are historically reconstructed with absolute precision. Aug 11 period is dashed (predicted). Confidence indicators are high.

---

## 17. Design Decisions

- **Why MAD over Standard Deviation?** Menstrual data is highly susceptible to one-off massive outliers (stress, illness). StdDev squares the distance, meaning one 60-day cycle destroys the metric. MAD uses medians, making it mathematically immune to extreme outliers.
- **Why Cauchy Continuous Decay over Hard Deletion?** Hard-deleting cycles (e.g., throwing away any cycle > 40 days) destroys data. The Cauchy formula gracefully soft-weights them. An outlier might only exert 5% influence, but it is preserved in the mathematical dataset.
- **Why Timeline Indexing?** Mobile UI threads require 60fps. Rendering a calendar cell must be instant. Grouping events into a Hash Map ensures date resolution never drops frames.
- **Why Mutually Exclusive Phases + Fertility Overlay?** Biologically, the follicular phase continues *through* the fertile window up until ovulation. The engine correctly models biological phases as mutually exclusive blocks (`PhaseInterval`), and the fertile window as a functional overlay (`TimelineEvent`).

---

## 18. Extension Guide

- **Adding New Phases:** Add the phase to `CyclePhase` in `PhaseInterval.ts`. Update `TimelineBuilder` to map the interval, and update `PhaseResolver` and `DayCell.tsx` colors.
- **Changing the Biological Model:** If medical guidance changes (e.g., dynamic luteal phases instead of fixed 14-day), modify `calculateCycleBiology()` in `CyclePredictionService.ts`. No timeline or UI code needs to change.
- **Adding New Confidence Models:** Adjust the threshold rules in `CyclePredictionService.ts`. If new variables (e.g., age, weight) are introduced, pass them into `predict()`.

---

## 19. File Reference

- `PredictionEngine.ts`: Facade. Dependencies: All prediction services. Used by: `CycleCalendar.tsx`.
- `CyclePredictionService.ts`: Math & Biology. Dependencies: `statisticsUtils.ts`, `dateUtils.ts`. Used by: `PredictionEngine`, `TimelineBuilder`.
- `TimelineBuilder.ts`: Event mapping. Dependencies: `CyclePredictionService`. Used by: `PredictionEngine`.
- `PhaseResolver.ts`: Lookup logic. Dependencies: None. Used by: `PredictionEngine`.
- `TimelineIndexer.ts`: Hash mapping. Dependencies: None. Used by: `PredictionEngine`.
- `statisticsUtils.ts`: MAD and Cauchy logic. Dependencies: None. Used by: `CyclePredictionService`.
- `CycleCalendar.tsx`: UI mounting point. Dependencies: `PredictionEngine`, `CalendarGrid.tsx`. Used by: Screen routers.
- `DayCell.tsx`: Visual cell component. Dependencies: `useTheme`. Used by: `CalendarGrid.tsx`.

---

## 20. Glossary

- **Cycle Length:** Days from the start of one period to the day before the next period.
- **Prediction:** A mathematical forecast of future cycle phases based on historical patterns.
- **Historical Reconstruction:** Retroactively calculating the biological phases of past completed cycles using their actual, factual lengths.
- **Timeline Event:** A specific functional occurrence (e.g., FERTILE_WINDOW, PERIOD) that can overlap other events.
- **Phase Interval:** A continuous, mutually exclusive biological block of time (FOLLICULAR, LUTEAL).
- **MAD:** Median Absolute Deviation. A robust statistical measure of how irregular a user's cycles are.
- **LWMA:** Linear Weighted Moving Average. Gives more weight to recent cycles.
- **Fertile Window:** The 6-day period (5 days prior + ovulation day) where conception is possible.
- **Fixed Luteal Assumption:** The medical convention that ovulation occurs precisely 14 days before the start of the next cycle.
- **Prediction Horizon:** The maximum number of future cycles the engine is allowed to forecast (currently 1).
