/**
 * Calculation Utilities
 * 
 * Helper functions for mathematical calculations.
 */

/**
 * Calculate total marks for a paper
 * @param mcqCount - Number of MCQ questions
 * @param shortCount - Number of short questions
 * @param longCount - Number of long questions
 * @param mcqMarks - Marks per MCQ (default: 1)
 * @param shortMarks - Marks per short question (default: 5)
 * @param longMarks - Marks per long question (default: 10)
 * @returns Total marks
 */
export function calculateTotalMarks(
  mcqCount: number,
  shortCount: number,
  longCount: number,
  mcqMarks: number = 1,
  shortMarks: number = 5,
  longMarks: number = 10
): number {
  return (mcqCount * mcqMarks) + (shortCount * shortMarks) + (longCount * longMarks);
}

/**
 * Calculate total marks for an array of questions
 * @param questions - Array of questions with marks property
 * @returns Sum of marks
 */
export function calculateSectionMarks(questions: Array<{ marks: number }>): number {
  return questions.reduce((total, question) => total + question.marks, 0);
}

/**
 * Calculate percentage progress
 * @param current - Current value
 * @param total - Total value
 * @returns Percentage (0-100)
 */
export function calculateProgress(current: number, total: number): number {
  if (total === 0) {
    return 0;
  }
  const percentage = (current / total) * 100;
  return Math.min(100, Math.max(0, percentage));
}

/**
 * Calculate percentage of a value
 * @param value - The value
 * @param total - The total
 * @returns Percentage as number
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) {
    return 0;
  }
  return Math.round((value / total) * 100);
}

/**
 * Round a number to specified decimal places
 * @param num - Number to round
 * @param decimals - Number of decimal places
 * @returns Rounded number
 */
export function round(num: number, decimals: number = 0): number {
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
}

/**
 * Clamp a number between min and max
 * @param num - Number to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped number
 */
export function clamp(num: number, min: number, max: number): number {
  return Math.min(Math.max(num, min), max);
}
