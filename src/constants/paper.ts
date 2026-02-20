/**
 * Paper Constants
 * 
 * Constants related to paper generation and configuration.
 */

/** Available exam types for papers */
export const EXAM_TYPES = [
  'Annual Exam',
  'Mid-Term Exam',
  'Monthly Test',
  'Practice Paper',
  'Unit Test',
] as const;

/** Type for exam type values */
export type ExamType = typeof EXAM_TYPES[number];

/** Available time duration options */
export const TIME_OPTIONS = [
  '30 Minutes',
  '1 Hour',
  '1.5 Hours',
  '2 Hours',
  '2.5 Hours',
  '3 Hours',
] as const;

/** Type for time option values */
export type TimeOption = typeof TIME_OPTIONS[number];

/** Default paper settings */
export const DEFAULT_PAPER_SETTINGS = {
  title: 'Test Paper',
  examType: 'Practice Paper' as ExamType,
  timeAllowed: '2 Hours' as TimeOption,
  includeInstructions: true,
} as const;

/** Minimum questions required for each type */
export const MIN_QUESTIONS = {
  mcq: 0,
  short: 0,
  long: 0,
} as const;

/** Maximum questions allowed for each type */
export const MAX_QUESTIONS = {
  mcq: 100,
  short: 50,
  long: 30,
} as const;

/** Default instructions text for papers */
export const DEFAULT_INSTRUCTIONS = [
  'Answer all questions.',
  'Use of calculator is not allowed unless specified.',
  'Write your name and roll number on the answer sheet.',
  'Marks are indicated against each question.',
] as const;
