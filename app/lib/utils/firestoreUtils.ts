/**
 * Utility functions for Firestore data handling
 */

/**
 * Remove undefined values from an object before sending to Firestore
 * Firestore doesn't allow undefined values, so we need to filter them out
 */
export function cleanFirestoreData<T extends Record<string, any>>(data: T): Partial<T> {
  const cleaned: Partial<T> = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      cleaned[key as keyof T] = value;
    }
  }
  
  return cleaned;
}

/**
 * Recursively clean nested objects for Firestore
 */
export function deepCleanFirestoreData<T extends Record<string, any>>(data: T): Partial<T> {
  const cleaned: Partial<T> = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        // Recursively clean nested objects
        const cleanedNested = deepCleanFirestoreData(value);
        if (Object.keys(cleanedNested).length > 0) {
          cleaned[key as keyof T] = cleanedNested as T[keyof T];
        }
      } else {
        cleaned[key as keyof T] = value;
      }
    }
  }
  
  return cleaned;
}