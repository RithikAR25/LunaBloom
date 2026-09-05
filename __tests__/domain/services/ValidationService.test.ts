import { describe, it, expect, afterEach } from '@jest/globals';
import { ValidationService } from '../../../src/domain/services/ValidationService';

describe('ValidationService - validateDateOfBirth Timezone Fix', () => {
  const validationService = new ValidationService();
  const RealDate = Date;

  const mockDate = (isoTime: string) => {
    class MockDate extends RealDate {
      constructor(...args: any[]) {
        if (args.length > 0) {
          // @ts-ignore
          super(...args);
        } else {
          super(isoTime);
        }
      }
    }
    // @ts-ignore
    global.Date = MockDate;
    global.Date.UTC = RealDate.UTC;
    global.Date.now = () => new RealDate(isoTime).getTime();
  };

  afterEach(() => {
    global.Date = RealDate;
  });

  describe('Local Date Validation (No Timezone Shift)', () => {
    it('handles a normal DOB correctly', () => {
      // Mock today as 2026-09-06
      mockDate('2026-09-06T12:00:00.000Z');
      
      // 20 years old
      const res = validationService.validateDateOfBirth('2006-09-06');
      expect(res.isValid).toBe(true);

      // Exactly 13 years old
      const res13 = validationService.validateDateOfBirth('2013-09-06');
      expect(res13.isValid).toBe(true);
      
      // 12 years and 364 days old
      const res12 = validationService.validateDateOfBirth('2013-09-07');
      expect(res12.isValid).toBe(false);
      expect(res12.error).toBe('You must be at least 13 years old.');
    });

    it('preserves birthday boundaries seamlessly (simulating cross-timezone date strings)', () => {
      // Using parseISODateLocal instead of new Date(string) ensures that the exact
      // yyyy, mm, dd values passed in the string are passed into the local new Date(y, m, d)
      // constructor. This eliminates the UTC shift anomaly for users born exactly 13 years ago.
      
      // Test the exact 13th birthday
      mockDate('2013-05-15T00:00:00.000Z'); // Today is May 15, 2013 (Local could be late night May 14 or early May 15)
      
      const res13 = validationService.validateDateOfBirth('2000-05-15');
      expect(res13.isValid).toBe(true);
      // If we used `new Date("2000-05-15")`, in UTC-5 this evaluates to 2000-05-14 locally.
      // 2013 - 2000 = 13.
      // But because it evaluated to 14th, the day comparison passes, or if we evaluate
      // "2000-05-16" on May 15, it fails accurately.
      
      // Check invalid (born May 16th, which is tomorrow's birthday)
      const res12 = validationService.validateDateOfBirth('2000-05-16');
      expect(res12.isValid).toBe(false);
    });

    it('rejects invalid or future dates', () => {
      mockDate('2026-09-06T12:00:00.000Z');

      // Future date
      const resFuture = validationService.validateDateOfBirth('2030-01-01');
      expect(resFuture.isValid).toBe(false);
      
      // Too old (101 years old)
      const resOld = validationService.validateDateOfBirth('1920-01-01');
      expect(resOld.isValid).toBe(false);
      expect(resOld.error).toBe('Please enter a valid date of birth.');
      
      // Complete garbage format
      const resGarbage = validationService.validateDateOfBirth('potato');
      expect(resGarbage.isValid).toBe(false);
      expect(resGarbage.error).toBe('Invalid date format.');
    });
  });
});
