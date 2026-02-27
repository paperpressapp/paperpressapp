/**
 * Question Types
 * 
 * Types for questions, exams, and question banks.
 */

/**
 * Available class names
 */
export type ClassName = '9th' | '10th' | '11th' | '12th';

/**
 * Available subject names
 */
export type SubjectName = 'Physics' | 'Chemistry' | 'Biology' | 'Mathematics' | 'Computer' | 'English';

/**
 * Question types
 */
export type QuestionType = 'mcq' | 'short' | 'long';

/**
 * Difficulty levels for questions
 */
export type Difficulty = 'easy' | 'medium' | 'hard';

/**
 * Marks for each question type (Punjab Board standard)
 */
export const QUESTION_MARKS = {
  mcq: 1,
  short: 2,
  long: 5,
} as const;

/**
 * Multiple Choice Question
 */
export interface MCQQuestion {
  /** Unique identifier */
  id: string;
  
  /** Question text */
  questionText: string;
  
  /** Array of 4 options */
  options: [string, string, string, string];
  
  /** Index of correct option (0-3) */
  correctOption: number;
  
  /** Difficulty level */
  difficulty: Difficulty;
  
  /** Marks for this question (default: 1) */
  marks: number;
  
  /** Custom marks (override default marks) */
  customMarks?: number;
  
  /** Chapter number (optional) */
  chapterNumber?: number;
  
  /** Chapter name (optional) */
  chapterName?: string;
  
  /** Topic (optional) */
  topic?: string;
  
  /** Subtopics (optional) */
  subtopics?: string[];
}

/**
 * Short Answer Question (5 marks)
 */
export interface ShortQuestion {
  /** Unique identifier */
  id: string;
  
  /** Question text */
  questionText: string;
  
  /** Difficulty level */
  difficulty: Difficulty;
  
  /** Marks for this question (default: 5) */
  marks: number;
  
  /** Custom marks (override default marks) */
  customMarks?: number;
  
  /** Chapter number (optional) */
  chapterNumber?: number;
  
  /** Chapter name (optional) */
  chapterName?: string;
  
  /** Topic (optional) */
  topic?: string;
  
  /** Subtopics (optional) */
  subtopics?: string[];
}

/**
 * Long Answer Question (10 marks)
 */
export interface LongQuestion {
  /** Unique identifier */
  id: string;
  
  /** Question text */
  questionText: string;
  
  /** Difficulty level */
  difficulty: Difficulty;
  
  /** Marks for this question (default: 10) */
  marks: number;
  
  /** Custom marks (override default marks) */
  customMarks?: number;
  
  /** Chapter number (optional) */
  chapterNumber?: number;
  
  /** Chapter name (optional) */
  chapterName?: string;
  
  /** Topic (optional) */
  topic?: string;
  
  /** Subtopics (optional) */
  subtopics?: string[];
}

/**
 * Union type for all question types
 */
export type Question = MCQQuestion | ShortQuestion | LongQuestion;

/**
 * Type guard to check if a question is an MCQ
 */
export function isMCQQuestion(question: Question): question is MCQQuestion {
  return 'options' in question && Array.isArray(question.options);
}

/**
 * Type guard to check if a question is a Short question
 */
export function isShortQuestion(question: Question): question is ShortQuestion {
  return !isMCQQuestion(question) && question.marks === 5;
}

/**
 * Type guard to check if a question is a Long question
 */
export function isLongQuestion(question: Question): question is LongQuestion {
  return !isMCQQuestion(question) && question.marks === 10;
}
