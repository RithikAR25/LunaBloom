/**
 * UUID utility — generates a RFC 4122 v4 UUID.
 * Used for client-side ID generation (required by offline-first + sync architecture).
 *
 * Using crypto.randomUUID() available in React Native's Hermes engine (SDK 47+).
 */
export function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Returns the current UTC timestamp as an ISO 8601 string.
 * Used for createdAt / updatedAt fields.
 */
export function nowISO(): string {
  return new Date().toISOString();
}

/**
 * Returns today's date as an ISO 8601 date string (YYYY-MM-DD).
 */
export function todayISO(): string {
  return new Date().toISOString().split('T')[0] ?? '';
}

/**
 * Calculates the difference in calendar days between two ISO date strings.
 * Returns a positive number if dateB is after dateA.
 */
export function daysBetween(dateA: string, dateB: string): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const a = new Date(dateA).getTime();
  const b = new Date(dateB).getTime();
  return Math.round((b - a) / msPerDay);
}

/**
 * Adds N days to an ISO date string, returns result as ISO date string.
 */
export function addDays(isoDate: string, days: number): string {
  const date = new Date(isoDate);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0] ?? '';
}

/**
 * Returns true if the ISO date string is today.
 */
export function isToday(isoDate: string): boolean {
  return isoDate === todayISO();
}

/**
 * Returns true if dateA is before dateB (ISO date strings).
 */
export function isBefore(dateA: string, dateB: string): boolean {
  return dateA < dateB;
}

/**
 * Returns true if dateA is after dateB (ISO date strings).
 */
export function isAfter(dateA: string, dateB: string): boolean {
  return dateA > dateB;
}

/**
 * Returns true if testDate falls between startDate and endDate (inclusive).
 */
export function isBetween(testDate: string, startDate: string, endDate: string): boolean {
  return testDate >= startDate && testDate <= endDate;
}
