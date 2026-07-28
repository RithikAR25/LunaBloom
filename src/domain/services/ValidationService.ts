import type { CycleEntry } from '../models/Cycle';
import { MIN_NORMAL_CYCLE_LENGTH_DAYS } from '../models/Cycle';
import { daysBetween, addDays } from '../../utils/dateUtils';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface Warning {
  code: string;
  title: string;
  message: string;
}
export class ValidationService {
  /**
   * Checks if a new or updated cycle entry overlaps with any existing entries.
   * Excludes the entry itself (via excludeId) when checking an update.
   */
  public validatePeriodOverlap(
    targetStartDate: string,
    targetEndDate: string | null,
    existingCycles: CycleEntry[],
    excludeId?: string
  ): ValidationResult {
    const cyclesToCheck = existingCycles.filter((c) => c.id !== excludeId);

    for (const cycle of cyclesToCheck) {
      const existingStart = cycle.startDate;
      const existingEnd = cycle.endDate; // null means ongoing

      // We expand the bounds of the existing cycle by 1 day in each direction
      // to catch "touching" (adjacent) periods, which biologically are a single period.
      const existingStartExpanded = addDays(existingStart, -1);
      const existingEndExpanded = existingEnd ? addDays(existingEnd, 1) : null;

      if (targetEndDate === null && existingEndExpanded === null) {
        // Both ongoing -> definite overlap (can't have two ongoing periods)
        return { isValid: false, error: 'These dates overlap with an ongoing period.' };
      }

      if (targetEndDate === null && existingEndExpanded !== null) {
        if (targetStartDate <= existingEndExpanded) {
          return { isValid: false, error: 'These dates overlap or touch an existing period.' };
        }
      }

      if (existingEndExpanded === null && targetEndDate !== null) {
        if (targetEndDate >= existingStartExpanded) {
          return { isValid: false, error: 'These dates overlap or touch an existing period.' };
        }
      }

      if (targetEndDate !== null && existingEndExpanded !== null) {
        if (targetStartDate <= existingEndExpanded && targetEndDate >= existingStartExpanded) {
          return { isValid: false, error: 'These dates overlap or touch an existing period.' };
        }
      }
    }

    return { isValid: true };
  }

  /**
   * Evaluates a period entry against unusual (but biologically possible) patterns.
   * Returns a structured array of warnings if any are detected.
   */
  public getWarnings(
    targetStartDate: string,
    targetEndDate: string | null,
    existingCycles: CycleEntry[],
    avgCycleLength?: number,
    excludeId?: string
  ): Warning[] {
    const warnings: Warning[] = [];
    const cyclesToCheck = existingCycles.filter((c) => c.id !== excludeId);

    // 1. Period Duration Warnings
    if (targetEndDate) {
      const duration = daysBetween(targetStartDate, targetEndDate) + 1;
      if (duration === 1) {
        warnings.push({
          code: 'SHORT_PERIOD',
          title: 'Very Short Period',
          message: 'This period lasted only one day. If this was spotting rather than a menstrual period, you may want to record it differently. Do you want to save anyway?'
        });
      } else if (duration > 14) {
        warnings.push({
          code: 'LONG_PERIOD',
          title: 'Prolonged Period',
          message: `This period is ${duration} days long, which is longer than most menstrual periods. Please confirm these dates are correct.`
        });
      }
    }

    // 2. Cycle Length Warnings
    const previousCycles = cyclesToCheck
      .filter((c) => c.startDate < targetStartDate)
      .sort((a, b) => b.startDate.localeCompare(a.startDate));

    if (previousCycles.length > 0) {
      const mostRecentStart = previousCycles[0]!.startDate;
      const gap = daysBetween(mostRecentStart, targetStartDate);

      if (gap < MIN_NORMAL_CYCLE_LENGTH_DAYS) {
        warnings.push({
          code: 'SHORT_CYCLE',
          title: 'Short Cycle Detected',
          message: 'You logged a period very recently. Are you sure you want to start a new cycle?'
        });
      } else {
        const threshold = avgCycleLength ? avgCycleLength + 15 : 60;
        if (gap > threshold) {
          warnings.push({
            code: 'LONG_CYCLE',
            title: 'Unusually Long Cycle',
            message: `It has been ${gap} days since your last period began. This is much longer than usual. Please confirm this date is correct.`
          });
        }
      }
    }

    return warnings;
  }

  /**
   * Validates a preferred name using Unicode-aware regex.
   * Ensures length is between 2 and 50 characters.
   */
  public validateName(name: string | null | undefined): ValidationResult {
    if (!name || name.trim().length === 0) {
      return { isValid: false, error: 'Name cannot be empty.' };
    }
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      return { isValid: false, error: 'Name must be at least 2 characters.' };
    }
    if (trimmed.length > 50) {
      return { isValid: false, error: 'Name cannot exceed 50 characters.' };
    }
    
    // Unicode-aware regex: allows letters from any language, spaces, hyphens, apostrophes.
    const nameRegex = /^[\p{L}\s'-]+$/u;
    if (!nameRegex.test(trimmed)) {
      return { isValid: false, error: 'Name contains invalid characters.' };
    }

    return { isValid: true };
  }

  /**
   * Enforces a product rule: Users must be between 13 and 100 years old.
   */
  public validateDateOfBirth(dobStr: string | null | undefined): ValidationResult {
    if (!dobStr) {
      return { isValid: false, error: 'Date of birth is required.' };
    }
    const dob = new Date(dobStr);
    if (isNaN(dob.getTime())) {
      return { isValid: false, error: 'Invalid date format.' };
    }

    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    if (age < 13) {
      return { isValid: false, error: 'You must be at least 13 years old.' };
    }
    if (age > 100) {
      return { isValid: false, error: 'Please enter a valid date of birth.' };
    }

    return { isValid: true };
  }

  public validateHeight(cm: number | null | undefined): ValidationResult {
    if (cm === null || cm === undefined || isNaN(cm)) {
      return { isValid: false, error: 'Height is required.' };
    }
    if (cm < 50) return { isValid: false, error: 'Height must be at least 50 cm.' };
    if (cm > 300) return { isValid: false, error: 'Height cannot exceed 300 cm.' };
    return { isValid: true };
  }

  public validateWeight(kg: number | null | undefined): ValidationResult {
    if (kg === null || kg === undefined || isNaN(kg)) {
      return { isValid: false, error: 'Weight is required.' };
    }
    if (kg < 20) return { isValid: false, error: 'Weight must be at least 20 kg.' };
    if (kg > 500) return { isValid: false, error: 'Weight cannot exceed 500 kg.' };
    return { isValid: true };
  }

  public validateCycleLength(days: number | null | undefined): ValidationResult {
    if (days === null || days === undefined || isNaN(days)) {
      return { isValid: false, error: 'Cycle length is required.' };
    }
    if (days < 15) return { isValid: false, error: 'Cycle length must be at least 15 days.' };
    if (days > 60) return { isValid: false, error: 'Cycle length cannot exceed 60 days.' };
    return { isValid: true };
  }

  public validatePeriodDuration(days: number | null | undefined): ValidationResult {
    if (days === null || days === undefined || isNaN(days)) {
      return { isValid: false, error: 'Period duration is required.' };
    }
    if (days < 1) return { isValid: false, error: 'Period duration must be at least 1 day.' };
    if (days > 14) return { isValid: false, error: 'Period duration cannot exceed 14 days.' };
    return { isValid: true };
  }

  /**
   * Ensures a date is not strictly in the future (tomorrow or later).
   */
  public validateHistoricalDate(dateStr: string | null | undefined): ValidationResult {
    if (!dateStr) return { isValid: true }; // optional end date

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return { isValid: false, error: 'Invalid date format.' };
    }
    
    // Convert both to YYYY-MM-DD for fair comparison regardless of time
    const todayStr = new Date().toISOString().split('T')[0]!;
    const targetStr = date.toISOString().split('T')[0]!;

    if (targetStr > todayStr) {
      return { isValid: false, error: 'Date cannot be in the future.' };
    }

    return { isValid: true };
  }
}
