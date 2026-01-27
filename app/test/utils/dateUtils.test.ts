import { describe, it, expect } from 'vitest';
import { toDate, formatDateSafe, isValidDate } from '../../lib/utils/dateUtils';
import { format } from 'date-fns';

describe('Date Utilities', () => {
  describe('toDate', () => {
    it('should return null for null/undefined values', () => {
      expect(toDate(null)).toBe(null);
      expect(toDate(undefined)).toBe(null);
      expect(toDate('')).toBe(null);
    });

    it('should return valid Date objects as-is', () => {
      const date = new Date('2024-01-01');
      expect(toDate(date)).toBe(date);
    });

    it('should return null for invalid Date objects', () => {
      const invalidDate = new Date('invalid');
      expect(toDate(invalidDate)).toBe(null);
    });

    it('should convert valid date strings to Date objects', () => {
      const dateString = '2024-01-01T00:00:00.000Z';
      const result = toDate(dateString);
      expect(result).toBeInstanceOf(Date);
      expect(result?.toISOString()).toBe('2024-01-01T00:00:00.000Z');
    });

    it('should convert timestamps to Date objects', () => {
      const timestamp = 1704067200000; // 2024-01-01 00:00:00 UTC
      const result = toDate(timestamp);
      expect(result).toBeInstanceOf(Date);
      expect(result?.getTime()).toBe(timestamp);
    });

    it('should handle Firestore Timestamp-like objects', () => {
      const mockTimestamp = {
        toDate: () => new Date('2024-01-01T00:00:00.000Z')
      };
      const result = toDate(mockTimestamp);
      expect(result).toBeInstanceOf(Date);
      expect(result?.toISOString()).toBe('2024-01-01T00:00:00.000Z');
    });

    it('should return null for invalid date strings', () => {
      expect(toDate('invalid-date')).toBe(null);
      expect(toDate('not-a-date')).toBe(null);
    });

    it('should return null for objects without toDate method', () => {
      expect(toDate({})).toBe(null);
      expect(toDate({ someProperty: 'value' })).toBe(null);
    });
  });

  describe('formatDateSafe', () => {
    it('should format valid dates using the provided formatter', () => {
      const date = new Date('2024-01-01T12:00:00.000Z');
      const formatter = (d: Date) => d.getFullYear().toString();
      const result = formatDateSafe(date, formatter);
      expect(result).toBe('2024');
    });

    it('should return fallback for invalid dates', () => {
      const formatter = (d: Date) => format(d, 'yyyy-MM-dd');
      const result = formatDateSafe('invalid-date', formatter, 'Unknown');
      expect(result).toBe('Unknown');
    });

    it('should use default fallback when none provided', () => {
      const formatter = (d: Date) => d.getFullYear().toString();
      const result = formatDateSafe(null, formatter);
      expect(result).toBe('Unknown');
    });

    it('should handle date strings', () => {
      const formatter = (d: Date) => d.getFullYear().toString();
      const result = formatDateSafe('2024-01-01T12:00:00.000Z', formatter);
      expect(result).toBe('2024');
    });

    it('should handle custom fallback values', () => {
      const formatter = (d: Date) => d.getFullYear().toString();
      const result = formatDateSafe(null, formatter, 'N/A');
      expect(result).toBe('N/A');
    });
  });

  describe('isValidDate', () => {
    it('should return true for valid dates', () => {
      expect(isValidDate(new Date('2024-01-01'))).toBe(true);
      expect(isValidDate('2024-01-01')).toBe(true);
      expect(isValidDate(1704067200000)).toBe(true);
    });

    it('should return false for invalid dates', () => {
      expect(isValidDate(null)).toBe(false);
      expect(isValidDate(undefined)).toBe(false);
      expect(isValidDate('invalid-date')).toBe(false);
      expect(isValidDate(new Date('invalid'))).toBe(false);
      expect(isValidDate({})).toBe(false);
    });

    it('should handle Firestore Timestamp-like objects', () => {
      const mockTimestamp = {
        toDate: () => new Date('2024-01-01T00:00:00.000Z')
      };
      expect(isValidDate(mockTimestamp)).toBe(true);
    });

    it('should handle broken Firestore Timestamp-like objects', () => {
      const mockTimestamp = {
        toDate: () => { throw new Error('Invalid timestamp'); }
      };
      expect(isValidDate(mockTimestamp)).toBe(false);
    });
  });
});