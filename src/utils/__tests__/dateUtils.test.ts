import { todayISO, daysBetween, addDays } from '../dateUtils';

describe('dateUtils', () => {
  describe('addDays', () => {
    it('should correctly add days treating the string as a calendar date', () => {
      expect(addDays('2026-08-11', 0)).toBe('2026-08-11');
      expect(addDays('2026-08-11', 1)).toBe('2026-08-12');
      expect(addDays('2026-08-11', 3)).toBe('2026-08-14');
      expect(addDays('2026-08-11', 4)).toBe('2026-08-15');
    });

    it('should correctly roll over months and years', () => {
      expect(addDays('2026-08-30', 2)).toBe('2026-09-01');
      expect(addDays('2026-12-30', 3)).toBe('2027-01-02');
      expect(addDays('2026-02-28', 1)).toBe('2026-03-01');
    });
  });

  describe('daysBetween', () => {
    it('should correctly calculate the difference between calendar dates', () => {
      expect(daysBetween('2026-08-11', '2026-08-13')).toBe(2);
      expect(daysBetween('2026-08-11', '2026-08-11')).toBe(0);
      expect(daysBetween('2026-08-13', '2026-08-11')).toBe(-2);
      expect(daysBetween('2026-12-30', '2027-01-02')).toBe(3);
    });
  });

  describe('todayISO', () => {
    const originalDate = global.Date;

    afterEach(() => {
      global.Date = originalDate;
    });

    it('should return the local date regardless of UTC offset (Positive offset simulation)', () => {
      class MockDatePositive extends originalDate {
        constructor() {
          // Pass the UTC equivalent time to the underlying Date
          super(Date.UTC(2026, 7, 10, 20, 0, 0));
        }
        getFullYear() { return 2026; }
        getMonth() { return 7; }
        getDate() { return 11; }
      }
      
      // @ts-ignore
      global.Date = MockDatePositive;

      expect(todayISO()).toBe('2026-08-11');
    });

    it('should return the local date regardless of UTC offset (Negative offset simulation)', () => {
      class MockDateNegative extends originalDate {
        constructor() {
          // Pass the UTC equivalent time to the underlying Date
          super(Date.UTC(2026, 7, 14, 2, 0, 0));
        }
        getFullYear() { return 2026; }
        getMonth() { return 7; }
        getDate() { return 13; }
      }
      
      // @ts-ignore
      global.Date = MockDateNegative;

      expect(todayISO()).toBe('2026-08-13');
    });
  });
});
