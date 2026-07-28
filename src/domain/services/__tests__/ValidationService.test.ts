import { ValidationService } from '../ValidationService';
import type { CycleEntry } from '../../models/Cycle';

describe('ValidationService', () => {
  let service: ValidationService;

  beforeEach(() => {
    service = new ValidationService();
  });

  describe('validateName', () => {
    it('should return valid for normal names', () => {
      expect(service.validateName('Luna').isValid).toBe(true);
      expect(service.validateName('Sarah Jane').isValid).toBe(true);
      expect(service.validateName('Anne-Marie').isValid).toBe(true);
      expect(service.validateName("O'Connor").isValid).toBe(true);
    });

    it('should return valid for unicode names', () => {
      expect(service.validateName('Renée').isValid).toBe(true);
      expect(service.validateName('José').isValid).toBe(true);
      expect(service.validateName('Li').isValid).toBe(true);
      expect(service.validateName('María').isValid).toBe(true);
    });

    it('should return invalid for empty or whitespace strings', () => {
      expect(service.validateName('').isValid).toBe(false);
      expect(service.validateName('   ').isValid).toBe(false);
      expect(service.validateName(null).isValid).toBe(false);
    });

    it('should return invalid for names shorter than 2 characters', () => {
      expect(service.validateName('A').isValid).toBe(false);
    });

    it('should return invalid for names exceeding 50 characters', () => {
      const longName = 'A'.repeat(51);
      expect(service.validateName(longName).isValid).toBe(false);
    });

    it('should return invalid for names with numbers or symbols', () => {
      expect(service.validateName('Luna123').isValid).toBe(false);
      expect(service.validateName('Luna@Home').isValid).toBe(false);
      expect(service.validateName('S@rah').isValid).toBe(false);
    });
  });

  describe('validateDateOfBirth', () => {
    const today = new Date();
    
    it('should return valid for users between 13 and 100 years old', () => {
      const validDate = new Date(today.getFullYear() - 25, today.getMonth(), today.getDate());
      expect(service.validateDateOfBirth(validDate.toISOString()).isValid).toBe(true);
    });

    it('should return invalid for users under 13', () => {
      const under13 = new Date(today.getFullYear() - 10, today.getMonth(), today.getDate());
      const res = service.validateDateOfBirth(under13.toISOString());
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('13 years old');
    });

    it('should return invalid for users over 100', () => {
      const over100 = new Date(today.getFullYear() - 105, today.getMonth(), today.getDate());
      const res = service.validateDateOfBirth(over100.toISOString());
      expect(res.isValid).toBe(false);
    });

    it('should return invalid for malformed dates', () => {
      expect(service.validateDateOfBirth('invalid-date').isValid).toBe(false);
      expect(service.validateDateOfBirth(null).isValid).toBe(false);
    });
  });

  describe('validateHeight', () => {
    it('should return valid for normal heights', () => {
      expect(service.validateHeight(165).isValid).toBe(true);
      expect(service.validateHeight(50).isValid).toBe(true);
      expect(service.validateHeight(300).isValid).toBe(true);
    });

    it('should return invalid for out of bounds heights', () => {
      expect(service.validateHeight(49).isValid).toBe(false);
      expect(service.validateHeight(301).isValid).toBe(false);
    });

    it('should return invalid for null or NaN', () => {
      expect(service.validateHeight(null).isValid).toBe(false);
      expect(service.validateHeight(NaN).isValid).toBe(false);
    });
  });

  describe('validateWeight', () => {
    it('should return valid for normal weights', () => {
      expect(service.validateWeight(65).isValid).toBe(true);
      expect(service.validateWeight(20).isValid).toBe(true);
      expect(service.validateWeight(500).isValid).toBe(true);
    });

    it('should return invalid for out of bounds weights', () => {
      expect(service.validateWeight(19).isValid).toBe(false);
      expect(service.validateWeight(501).isValid).toBe(false);
    });
  });

  describe('validateCycleLength', () => {
    it('should return valid for normal cycle lengths', () => {
      expect(service.validateCycleLength(28).isValid).toBe(true);
      expect(service.validateCycleLength(15).isValid).toBe(true);
      expect(service.validateCycleLength(60).isValid).toBe(true);
    });

    it('should return invalid for out of bounds cycle lengths', () => {
      expect(service.validateCycleLength(14).isValid).toBe(false);
      expect(service.validateCycleLength(61).isValid).toBe(false);
    });
  });

  describe('validatePeriodDuration', () => {
    it('should return valid for normal period durations', () => {
      expect(service.validatePeriodDuration(5).isValid).toBe(true);
      expect(service.validatePeriodDuration(1).isValid).toBe(true);
      expect(service.validatePeriodDuration(14).isValid).toBe(true);
    });

    it('should return invalid for out of bounds period durations', () => {
      expect(service.validatePeriodDuration(0).isValid).toBe(false);
      expect(service.validatePeriodDuration(15).isValid).toBe(false);
    });
  });

  describe('validateHistoricalDate', () => {
    it('should return valid for today or past dates', () => {
      const today = new Date().toISOString().split('T')[0];
      const past = '2020-01-01';
      expect(service.validateHistoricalDate(today).isValid).toBe(true);
      expect(service.validateHistoricalDate(past).isValid).toBe(true);
    });

    it('should return invalid for future dates', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      expect(service.validateHistoricalDate(futureDate.toISOString().split('T')[0]).isValid).toBe(false);
    });

    it('should handle null dates as valid (optional end date)', () => {
      expect(service.validateHistoricalDate(null).isValid).toBe(true);
    });
  });

  describe('validatePeriodOverlap', () => {
    const existing = [
      { id: '1', startDate: '2023-01-05', endDate: '2023-01-09', isExcludedFromPredictions: false, notes: null },
      { id: '2', startDate: '2023-02-05', endDate: '2023-02-09', isExcludedFromPredictions: false, notes: null }
    ] as CycleEntry[];

    it('should be valid if completely separate', () => {
      expect(service.validatePeriodOverlap('2023-01-15', '2023-01-20', existing).isValid).toBe(true);
    });

    it('should be invalid if overlapping', () => {
      expect(service.validatePeriodOverlap('2023-01-07', '2023-01-12', existing).isValid).toBe(false);
    });

    it('should be invalid if touching (adjacent)', () => {
      // Ends on 01-04, touches 01-05
      expect(service.validatePeriodOverlap('2023-01-01', '2023-01-04', existing).isValid).toBe(false);
      // Starts on 01-10, touches 01-09
      expect(service.validatePeriodOverlap('2023-01-10', '2023-01-14', existing).isValid).toBe(false);
    });
  });

  describe('getWarnings', () => {
    const existing = [
      { id: '1', startDate: '2023-01-01', endDate: '2023-01-05', isExcludedFromPredictions: false, notes: null, createdAt: '', updatedAt: '', deletedAt: null, durationDays: null, cycleLengthDays: null, syncStatus: 'LOCAL' }
    ] as CycleEntry[];

    it('should return empty for normal cycle', () => {
      const warnings = service.getWarnings('2023-01-29', '2023-02-02', existing, 28);
      expect(warnings).toHaveLength(0);
    });

    it('should return ONE warning for 1-day period', () => {
      const warnings = service.getWarnings('2023-01-29', '2023-01-29', existing, 28);
      expect(warnings).toHaveLength(1);
      expect(warnings[0]!.code).toBe('SHORT_PERIOD');
    });

    it('should return ONE warning for >14 day period', () => {
      const warnings = service.getWarnings('2023-01-29', '2023-02-15', existing, 28);
      expect(warnings).toHaveLength(1);
      expect(warnings[0]!.code).toBe('LONG_PERIOD');
    });

    it('should return ONE warning for short cycle gap', () => {
      const warnings = service.getWarnings('2023-01-10', '2023-01-15', existing, 28);
      expect(warnings).toHaveLength(1);
      expect(warnings[0]!.code).toBe('SHORT_CYCLE');
    });

    it('should return ONE warning for long cycle gap (personalized)', () => {
      const warnings = service.getWarnings('2023-03-01', '2023-03-05', existing, 28); // 59 days later > 28+15
      expect(warnings).toHaveLength(1);
      expect(warnings[0]!.code).toBe('LONG_CYCLE');
    });

    it('should combine multiple warnings (long gap + 1-day period)', () => {
      const warnings = service.getWarnings('2023-03-01', '2023-03-01', existing, 28);
      expect(warnings).toHaveLength(2);
      expect(warnings.some(w => w.code === 'SHORT_PERIOD')).toBe(true);
      expect(warnings.some(w => w.code === 'LONG_CYCLE')).toBe(true);
    });
  });
});
