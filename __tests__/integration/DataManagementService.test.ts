import { DataManagementService, ExportPayload } from '../../src/application/services/DataManagementService';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

describe('DataManagementService Integration', () => {
  let mockProfileRepo: any;
  let mockCycleRepo: any;
  let mockLogRepo: any;
  let service: any; // Use any to access private methods for testing if needed

  beforeEach(() => {
    mockProfileRepo = {
      get: jest.fn<any>().mockResolvedValue({ id: '1', name: 'Test' }),
      save: jest.fn<any>().mockResolvedValue(undefined),
    };
    mockCycleRepo = {
      getAll: jest.fn<any>().mockResolvedValue([{ id: 'c1', startDate: '2026-01-01' }]),
      save: jest.fn<any>().mockResolvedValue(undefined),
    };
    mockLogRepo = {
      getAll: jest.fn<any>().mockResolvedValue([{ date: '2026-01-01', symptoms: ['cramps'] }]),
      save: jest.fn<any>().mockResolvedValue(undefined),
    };

    service = new DataManagementService(mockProfileRepo, mockCycleRepo, mockLogRepo);
  });

  describe('Payload Validation', () => {
    it('should throw if payload is not an object', () => {
      expect(() => service['validatePayload'](null)).toThrow('Invalid backup format.');
      expect(() => service['validatePayload']('string')).toThrow('Invalid backup format.');
    });

    it('should throw if version is unsupported', () => {
      const payload = { version: 999 };
      expect(() => service['validatePayload'](payload)).toThrow('Unsupported backup version.');
    });

    it('should throw if data section is missing', () => {
      const payload = { version: 1 };
      expect(() => service['validatePayload'](payload)).toThrow('Backup is missing data section.');
    });

    it('should throw if cycles array is missing', () => {
      const payload = { version: 1, data: { profile: {} } };
      expect(() => service['validatePayload'](payload)).toThrow('Backup is missing cycles array.');
    });

    it('should throw if dailyLogs array is missing', () => {
      const payload = { version: 1, data: { profile: {}, cycles: [] } };
      expect(() => service['validatePayload'](payload)).toThrow('Backup is missing daily logs array.');
    });

    it('should pass validation for a correct payload', () => {
      const payload: ExportPayload = {
        version: 1,
        exportDate: '2026-07-23T00:00:00.000Z',
        data: {
          profile: { id: '1' },
          cycles: [],
          dailyLogs: [],
        }
      };
      expect(() => service['validatePayload'](payload)).not.toThrow();
    });
  });
});
