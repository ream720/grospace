/**
 * Utility functions for handling dates in Firestore
 */

/**
 * Safely convert any date-like value to a Date object
 */
export function toDate(value: any): Date | null {
  if (!value) return null;
  
  // Already a Date object
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }
  
  // Firestore Timestamp
  if (value && typeof value.toDate === 'function') {
    try {
      return value.toDate();
    } catch {
      return null;
    }
  }
  
  // String or number
  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  
  return null;
}

/**
 * Safely format a date with fallback
 */
export function formatDateSafe(
  date: any, 
  formatFn: (date: Date) => string, 
  fallback: string = 'Unknown'
): string {
  const validDate = toDate(date);
  return validDate ? formatFn(validDate) : fallback;
}

/**
 * Check if a date value is valid
 */
export function isValidDate(date: any): boolean {
  return toDate(date) !== null;
}