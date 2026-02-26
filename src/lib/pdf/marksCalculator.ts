/**
 * Marks Calculator
 * Automatic calculation with custom marks support
 */

import type { MCQQuestion, ShortQuestion, LongQuestion } from '@/types';
import { QUESTION_MARKS } from '@/types/question';

export interface CustomMarks {
  mcq?: number;
  short?: number;
  long?: number;
}

export interface MarksBreakdown {
  mcq: {
    count: number;
    marksPerQuestion: number;
    total: number;
  };
  short: {
    count: number;
    marksPerQuestion: number;
    total: number;
    attemptCount: number;
    attemptedMarks: number;
  };
  long: {
    count: number;
    marksPerQuestion: number;
    total: number;
    attemptCount: number;
    attemptedMarks: number;
  };
  total: number;
  attemptTotal: number;
}

export interface MarksValidation {
  valid: boolean;
  headerTotal: number;
  calculatedTotal: number;
  mismatch: number;
  error?: string;
}

export function calculateMarks(
  mcqs: MCQQuestion[],
  shorts: ShortQuestion[],
  longs: LongQuestion[],
  attemptRules?: {
    shortAttempt?: number;
    longAttempt?: number;
  },
  customMarks?: CustomMarks
): MarksBreakdown {
  const mcqCount = mcqs.length;
  const shortCount = shorts.length;
  const longCount = longs.length;

  const mcqMarksPerQ = customMarks?.mcq || QUESTION_MARKS.mcq;
  const shortMarksPerQ = customMarks?.short || QUESTION_MARKS.short;
  const longMarksPerQ = customMarks?.long || QUESTION_MARKS.long;

  const mcqMarks = mcqCount * mcqMarksPerQ;
  const shortMarks = shortCount * shortMarksPerQ;
  const longMarks = longCount * longMarksPerQ;

  const shortAttempt = attemptRules?.shortAttempt || shortCount;
  const longAttempt = attemptRules?.longAttempt || longCount;

  const attemptShortMarks = shortAttempt * shortMarksPerQ;
  const attemptLongMarks = longAttempt * longMarksPerQ;

  const total = mcqMarks + shortMarks + longMarks;
  const attemptTotal = mcqMarks + attemptShortMarks + attemptLongMarks;

  return {
    mcq: {
      count: mcqCount,
      marksPerQuestion: mcqMarksPerQ,
      total: mcqMarks,
    },
    short: {
      count: shortCount,
      marksPerQuestion: shortMarksPerQ,
      total: shortMarks,
      attemptCount: shortAttempt,
      attemptedMarks: attemptShortMarks,
    },
    long: {
      count: longCount,
      marksPerQuestion: longMarksPerQ,
      total: longMarks,
      attemptCount: longAttempt,
      attemptedMarks: attemptLongMarks,
    },
    total,
    attemptTotal,
  };
}

export function validateMarks(
  headerTotal: number,
  mcqs: MCQQuestion[],
  shorts: ShortQuestion[],
  longs: LongQuestion[],
  customMarks?: CustomMarks
): MarksValidation {
  const calculated = calculateMarks(mcqs, shorts, longs, undefined, customMarks);
  const calculatedTotal = calculated.total;
  const mismatch = Math.abs(headerTotal - calculatedTotal);

  if (mismatch === 0) {
    return {
      valid: true,
      headerTotal,
      calculatedTotal,
      mismatch: 0,
    };
  }

  return {
    valid: false,
    headerTotal,
    calculatedTotal,
    mismatch,
    error: `Total marks mismatch: Header shows ${headerTotal}, but calculated total is ${calculatedTotal}`,
  };
}

export function formatMarksDisplay(breakdown: MarksBreakdown): string {
  const parts: string[] = [];

  if (breakdown.mcq.count > 0) {
    parts.push(`MCQ: ${breakdown.mcq.count} × ${breakdown.mcq.marksPerQuestion} = ${breakdown.mcq.total}`);
  }

  if (breakdown.short.count > 0) {
    parts.push(`Short: ${breakdown.short.count} × ${breakdown.short.marksPerQuestion} = ${breakdown.short.total}`);
  }

  if (breakdown.long.count > 0) {
    parts.push(`Long: ${breakdown.long.count} × ${breakdown.long.marksPerQuestion} = ${breakdown.long.total}`);
  }

  parts.push(`Total: ${breakdown.total} marks`);

  return parts.join(' | ');
}

export function generateAttemptText(
  attemptCount: number,
  totalQuestions: number,
  marksPerQuestion: number
): string {
  const totalMarks = attemptCount * marksPerQuestion;
  
  if (attemptCount >= totalQuestions) {
    return `Attempt all (${attemptCount} × ${marksPerQuestion} = ${totalMarks} Marks)`;
  }
  return `Attempt any ${attemptCount} (${attemptCount} × ${marksPerQuestion} = ${totalMarks} Marks)`;
}
