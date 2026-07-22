/**
 * App-wide constants
 * Business logic constants that don't belong in design tokens.
 */

/** Minimum number of completed cycles before insights are shown */
export const MIN_CYCLES_FOR_INSIGHTS = 2;

/** Maximum number of cycles used in prediction algorithm */
export const MAX_CYCLES_FOR_PREDICTION = 12;

/** After how many days of period with no end-date to prompt the user */
export const PERIOD_END_REMINDER_DAYS = 8;

/** Days past predicted start before showing a "period is late" alert */
export const LATE_PERIOD_ALERT_DAYS = 7;

/** ISO 8601 date format string (for documentation purposes) */
export const ISO_DATE_FORMAT = 'YYYY-MM-DD';

/** Minimum cycle length considered medically plausible */
export const MIN_CYCLE_LENGTH_DAYS = 15;

/** Maximum cycle length considered medically plausible */
export const MAX_CYCLE_LENGTH_DAYS = 90;

/** Fertile window: days before ovulation */
export const FERTILE_WINDOW_DAYS_BEFORE_OVULATION = 5;

/** Fertile window: days after ovulation */
export const FERTILE_WINDOW_DAYS_AFTER_OVULATION = 1;

/** Estimated ovulation day (from cycle start, using 14-day rule adjusted for cycle length) */
export const OVULATION_DAYS_BEFORE_NEXT_PERIOD = 14;
