/**
 * Constants Index
 * 
 * This file exports all constants from the constants directory.
 * Import constants from here: import { APP_NAME, ROUTES, COLORS } from '@/constants';
 */

// App Constants
export {
  APP_NAME,
  APP_TAGLINE,
  APP_VERSION,
  FREE_PAPER_LIMIT,
  DEFAULT_MCQ_MARKS,
  DEFAULT_SHORT_MARKS,
  DEFAULT_LONG_MARKS,
} from './app';

// Routes Constants
export {
  ROUTES,
} from './routes';

export type {
  RoutePath,
} from './routes';

// Colors Constants
export {
  COLORS,
  SUBJECT_COLORS,
  CLASS_COLORS,
  DIFFICULTY_COLORS,
} from './colors';

export type {
  SubjectColor,
  ClassColor,
  DifficultyColor,
} from './colors';

// Classes Constants
export {
  CLASSES,
  CLASS_IDS,
  getClassById,
  isValidClassId,
} from './classes';

// Subjects Constants
export {
  SUBJECTS,
  SUBJECT_IDS,
  SUBJECT_NAMES,
  getSubjectById,
  getSubjectByName,
  isValidSubjectId,
} from './subjects';

// Paper Constants
export {
  EXAM_TYPES,
  TIME_OPTIONS,
  DEFAULT_PAPER_SETTINGS,
  MIN_QUESTIONS,
  MAX_QUESTIONS,
  DEFAULT_INSTRUCTIONS,
} from './paper';

export type {
  ExamType,
  TimeOption,
} from './paper';

// Cities Constants
export {
  PAKISTAN_CITIES,
  COMMON_INSTITUTES,
} from './cities';

export type {
  PakistanCity,
} from './cities';
