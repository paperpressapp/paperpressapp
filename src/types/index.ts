/**
 * Type Definitions Index
 * 
 * This file exports all types from the types directory.
 * Import types from here: import { User, Profile, Question } from '@/types';
 */

// Authentication Types
export type {
  SignUpData,
  SignInData,
  User,
} from './auth';

// Profile Types
export * from './profile';

// Question Types
export type {
  ClassName,
  SubjectName,
  QuestionType,
  Difficulty,
  MCQQuestion,
  ShortQuestion,
  LongQuestion,
  Question,
} from './question';

export {
  QUESTION_MARKS,
  isMCQQuestion,
  isShortQuestion,
  isLongQuestion,
} from './question';

// Chapter Types
export type {
  Chapter,
} from './chapter';

// Paper Types
export type {
  PaperSettings,
  PaperData,
  GeneratedPaper,
  QuestionCounts,
  PaperStats,
} from './paper';

// Subject Types
export type {
  Subject,
} from './subject';

// Class Types
export type {
  ClassInfo,
} from './class';

// Database Types (from Supabase)
export type {
  Database,
} from './supabase';
