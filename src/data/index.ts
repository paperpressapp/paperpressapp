/**
 * Data Access Layer
 * 
 * This module provides functions to load and query question data
 * from the JSON files stored in the data directory.
 * 
 * IMPORTANT: This module now uses dynamic imports for better performance.
 * All functions are async and return Promises.
 */

export * from '@/lib/data-loader';

import type {
  Chapter,
  MCQQuestion,
  ShortQuestion,
  LongQuestion,
} from '@/types';

export interface ChapterData extends Chapter {
  mcqs: MCQQuestion[];
  shortQuestions: ShortQuestion[];
  longQuestions: LongQuestion[];
}

export interface SubjectData {
  class: string;
  subject: string;
  chapters: ChapterData[];
}
