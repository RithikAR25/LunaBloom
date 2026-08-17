/**
 * UUID utility — generates a RFC 4122 v4 UUID.
 * Used for client-side ID generation (required by offline-first + sync architecture).
 *
 * Using crypto.randomUUID() available in React Native's Hermes engine (SDK 47+).
 */
export function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
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
 * Uses local calendar getters to ensure it represents the user's actual local day.
 */
export function todayISO(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculates the difference in calendar days between two ISO date strings.
 * Returns a positive number if dateB is after dateA.
 */
export function daysBetween(dateA: string, dateB: string): number {
  const [yearA, monthA, dayA] = dateA.split('-').map(Number);
  const [yearB, monthB, dayB] = dateB.split('-').map(Number);
  
  if (!yearA || !monthA || !dayA || !yearB || !monthB || !dayB) return 0;
  
  const a = Date.UTC(yearA, monthA - 1, dayA);
  const b = Date.UTC(yearB, monthB - 1, dayB);
  
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((b - a) / msPerDay);
}

/**
 * Adds N days to an ISO date string, returns result as ISO date string.
 * Uses pure UTC calendar math to avoid local timezone off-by-one errors.
 */
export function addDays(isoDate: string, days: number): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  if (!year || !month || !day) return isoDate;
  
  const date = new Date(Date.UTC(year, month - 1, day + days));
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

/**
 * Formats an ISO date string (YYYY-MM-DD) into a short, readable format (e.g., "Oct 15").
 */
export function formatDateShort(isoDate: string): string {
  if (!isoDate) return '';
  const parts = isoDate.split('-');
  if (parts.length < 3) return isoDate;
  
  const month = parseInt(parts[1]!, 10);
  const day = parseInt(parts[2]!.split('T')[0]!, 10);
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[month - 1]} ${day}`;
}

/**
 * Formats an ISO date string (YYYY-MM-DD) into a compact format (e.g., "AUG 17").
 * Month uses 3-letter uppercase abbreviation, day is numeric without leading zero.
 */
export function formatDateCompact(isoDate: string): string {
  if (!isoDate) return '';
  const parts = isoDate.split('-');
  if (parts.length < 3) return isoDate;
  
  const month = parseInt(parts[1]!, 10);
  const day = parseInt(parts[2]!.split('T')[0]!, 10);
  
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  return `${months[month - 1]} ${day}`;
}
