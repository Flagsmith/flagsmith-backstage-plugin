/**
 * Consistent date formatting utilities
 */

/**
 * Format a date as a short date string (e.g., "1/15/2024")
 */
export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString();
};

/**
 * Format a date with time (e.g., "1/15/2024, 10:30 AM")
 */
export const formatDateTime = (date: string | Date): string => {
  return new Date(date).toLocaleString();
};

/**
 * Format a date as short month and day (e.g., "Jan 15")
 */
export const formatShortDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Check if a date is in the future
 */
export const isFutureDate = (date: string | Date): boolean => {
  return new Date(date) > new Date();
};
