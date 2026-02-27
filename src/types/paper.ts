/**
 * Paper Types
 * 
 * Types for exam papers, paper generation, and settings.
 */

import type { ClassName, SubjectName, MCQQuestion, ShortQuestion, LongQuestion } from './question';

export interface CustomMarks {
  mcq?: number;
  short?: number;
  long?: number;
}

export interface PaperSettings {
  title: string;
  examType?: string;
  date: string;
  timeAllowed: string;
  totalMarks: number;
  includeInstructions: boolean;
  instituteName: string;
  instituteLogo?: string | null;
  customHeader?: string;
  customSubHeader?: string;
  showLogo?: boolean;
  showWatermark?: boolean;
  customMarks: CustomMarks;
  includeAnswerSheet: boolean;
  includeMarkingScheme: boolean;
  syllabus?: string;
  instituteAddress?: string;
  instituteEmail?: string;
  institutePhone?: string;
  instituteWebsite?: string;
  attemptRules?: {
    shortAttempt?: number;
    longAttempt?: number;
  };
}

export interface GeneratedPaper {
  id: string;
  userId?: string;
  classId: ClassName;
  subject: SubjectName;
  title: string;
  examType?: string;
  date: string;
  timeAllowed: string;
  totalMarks: number;
  questionCount: number;
  mcqCount: number;
  shortCount: number;
  longCount: number;
  mcqIds: string[];
  shortIds: string[];
  longIds: string[];
  createdAt: string;
  instituteName: string;
  instituteLogo?: string | null;
  showLogo?: boolean;
  showWatermark?: boolean;
  customHeader?: string;
  customSubHeader?: string;
  includeAnswerSheet?: boolean;
  includeMarkingScheme?: boolean;
  customMarks?: CustomMarks;
  syllabus?: string;
  instituteAddress?: string;
  instituteEmail?: string;
  institutePhone?: string;
  instituteWebsite?: string;
  includeBubbleSheet?: boolean;
}

export interface PaperData {
  classId: ClassName;
  subject: SubjectName;
  settings: PaperSettings;
  mcqs: MCQQuestion[];
  shorts: ShortQuestion[];
  longs: LongQuestion[];
}

/**
 * Question counts by type
 */
export interface QuestionCounts {
  mcq: number;
  short: number;
  long: number;
}

/**
 * Paper statistics
 */
export interface PaperStats {
  totalQuestions: number;
  totalMarks: number;
  mcqsSelected: number;
  shortsSelected: number;
  longsSelected: number;
}
