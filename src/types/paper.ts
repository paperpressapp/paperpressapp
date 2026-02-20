/**
 * Paper Types
 * 
 * Types for exam papers, paper generation, and settings.
 */

import type { ClassName, SubjectName, MCQQuestion, ShortQuestion, LongQuestion } from './question';

/**
 * Paper header/settings configuration
 */
export interface PaperSettings {
  /** Paper title */
  title: string;
  
  /** Type of exam (e.g., "Monthly Test", "Final Exam") */
  examType: string;
  
  /** Exam date */
  date: string;
  
  /** Time allowed for the exam */
  timeAllowed: string;
  
  /** Total marks for the paper */
  totalMarks: number;
  
  /** Whether to include instructions section */
  includeInstructions: boolean;
  
  /** Institute/school name to display on paper */
  instituteName: string;
  
  /** Institute logo as base64 data URL (optional) */
  instituteLogo?: string | null;
  
  /** Custom header text (e.g., "Punjab Board Examination") */
  customHeader?: string;
  
  /** Custom subheader text (e.g., "Annual Examination 2024") */
  customSubHeader?: string;
  
  /** Whether to show logo on paper */
  showLogo?: boolean;
}

/**
 * Complete paper data for generation
 */
export interface PaperData {
  /** Class identifier */
  classId: ClassName;
  
  /** Subject name */
  subject: SubjectName;
  
  /** Paper settings */
  settings: PaperSettings;
  
  /** Selected MCQ questions */
  mcqs: MCQQuestion[];
  
  /** Selected short questions */
  shorts: ShortQuestion[];
  
  /** Selected long questions */
  longs: LongQuestion[];
}

/**
 * Generated paper metadata
 */
export interface GeneratedPaper {
  id: string;
  userId?: string;
  classId: ClassName;
  subject: SubjectName;
  title: string;
  examType: string;
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
  customHeader?: string;
  customSubHeader?: string;
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
