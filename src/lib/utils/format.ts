/**
 * Format Utilities
 * 
 * Helper functions for formatting dates, numbers, and text.
 */

import { format } from 'date-fns';

/**
 * Format a date string to readable format
 * @param dateString - ISO date string
 * @returns Formatted date like "15 Jan 2025"
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return format(date, 'd MMM yyyy');
  } catch {
    return dateString;
  }
}

/**
 * Format a date string to readable format with time
 * @param dateString - ISO date string
 * @returns Formatted date and time like "15 Jan 2025, 3:30 PM"
 */
export function formatDateTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    return format(date, 'd MMM yyyy, h:mm a');
  } catch {
    return dateString;
  }
}

/**
 * Format marks with proper pluralization
 * @param marks - Number of marks
 * @returns Formatted string like "85 Marks" or "1 Mark"
 */
export function formatMarks(marks: number): string {
  return `${marks} Mark${marks === 1 ? '' : 's'}`;
}

/**
 * Format question count with proper pluralization
 * @param count - Number of questions
 * @returns Formatted string like "25 Questions" or "1 Question"
 */
export function formatQuestionCount(count: number): string {
  return `${count} Question${count === 1 ? '' : 's'}`;
}

/**
 * Truncate text to specified length without cutting words
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text with "..." if needed
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  
  // Find the last space before maxLength
  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace === -1) {
    // No space found, just cut at maxLength
    return truncated + '...';
  }
  
  return truncated.slice(0, lastSpace) + '...';
}

/**
 * Format a number with commas
 * @param num - Number to format
 * @returns Formatted string like "1,234"
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}
