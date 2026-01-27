import { describe, it, expect } from 'vitest';
import { cleanFirestoreData, deepCleanFirestoreData } from '../../lib/utils/firestoreUtils';

describe('Firestore Utilities', () => {
  describe('cleanFirestoreData', () => {
    it('should remove undefined values', () => {
      const data = {
        name: 'Test Plant',
        variety: 'Cherry Tomato',
        seedSource: undefined,
        expectedHarvestDate: undefined,
        notes: 'Some notes',
        plantedDate: new Date('2024-01-01'),
      };

      const cleaned = cleanFirestoreData(data);

      expect(cleaned).toEqual({
        name: 'Test Plant',
        variety: 'Cherry Tomato',
        notes: 'Some notes',
        plantedDate: new Date('2024-01-01'),
      });
      expect(cleaned.seedSource).toBeUndefined();
      expect(cleaned.expectedHarvestDate).toBeUndefined();
    });

    it('should keep null values', () => {
      const data = {
        name: 'Test Plant',
        seedSource: null,
        expectedHarvestDate: undefined,
      };

      const cleaned = cleanFirestoreData(data);

      expect(cleaned).toEqual({
        name: 'Test Plant',
        seedSource: null,
      });
    });

    it('should keep empty strings', () => {
      const data = {
        name: 'Test Plant',
        seedSource: '',
        notes: undefined,
      };

      const cleaned = cleanFirestoreData(data);

      expect(cleaned).toEqual({
        name: 'Test Plant',
        seedSource: '',
      });
    });

    it('should handle empty objects', () => {
      const data = {};
      const cleaned = cleanFirestoreData(data);
      expect(cleaned).toEqual({});
    });

    it('should handle objects with all undefined values', () => {
      const data = {
        field1: undefined,
        field2: undefined,
      };

      const cleaned = cleanFirestoreData(data);
      expect(cleaned).toEqual({});
    });
  });

  describe('deepCleanFirestoreData', () => {
    it('should recursively clean nested objects', () => {
      const data = {
        name: 'Test Plant',
        dimensions: {
          length: 10,
          width: undefined,
          height: 5,
        },
        environment: {
          temperature: {
            min: 20,
            max: undefined,
          },
          humidity: undefined,
        },
        notes: undefined,
      };

      const cleaned = deepCleanFirestoreData(data);

      expect(cleaned).toEqual({
        name: 'Test Plant',
        dimensions: {
          length: 10,
          height: 5,
        },
        environment: {
          temperature: {
            min: 20,
          },
        },
      });
    });

    it('should preserve Date objects', () => {
      const date = new Date('2024-01-01');
      const data = {
        name: 'Test Plant',
        plantedDate: date,
        expectedHarvestDate: undefined,
      };

      const cleaned = deepCleanFirestoreData(data);

      expect(cleaned).toEqual({
        name: 'Test Plant',
        plantedDate: date,
      });
    });

    it('should preserve arrays', () => {
      const data = {
        name: 'Test Plant',
        tags: ['tomato', 'vegetable'],
        photos: undefined,
      };

      const cleaned = deepCleanFirestoreData(data);

      expect(cleaned).toEqual({
        name: 'Test Plant',
        tags: ['tomato', 'vegetable'],
      });
    });

    it('should remove empty nested objects', () => {
      const data = {
        name: 'Test Plant',
        dimensions: {
          length: undefined,
          width: undefined,
        },
        environment: {
          temperature: undefined,
        },
      };

      const cleaned = deepCleanFirestoreData(data);

      expect(cleaned).toEqual({
        name: 'Test Plant',
      });
    });
  });
});