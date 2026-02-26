/**
 * PDF Validation Utility
 * Task 11: Pre-Generation Validation
 */

import type { MCQQuestion, ShortQuestion, LongQuestion } from '@/types';

export interface ValidationError {
  type: 'error' | 'warning';
  code: string;
  message: string;
  field?: string;
  questionIndex?: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export function validatePaperData(
  settings: {
    instituteName: string;
    subject: string;
    classId: string;
    date: string;
    timeAllowed: string;
    title: string;
  },
  mcqs: MCQQuestion[],
  shorts: ShortQuestion[],
  longs: LongQuestion[]
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (!settings.instituteName?.trim()) {
    errors.push({
      type: 'error',
      code: 'MISSING_INSTITUTE',
      message: 'Institute name is required',
      field: 'instituteName',
    });
  }

  if (!settings.subject?.trim()) {
    errors.push({
      type: 'error',
      code: 'MISSING_SUBJECT',
      message: 'Subject is required',
      field: 'subject',
    });
  }

  if (!settings.classId?.trim()) {
    errors.push({
      type: 'error',
      code: 'MISSING_CLASS',
      message: 'Class is required',
      field: 'classId',
    });
  }

  if (!settings.date?.trim()) {
    errors.push({
      type: 'error',
      code: 'MISSING_DATE',
      message: 'Date is required',
      field: 'date',
    });
  }

  if (!settings.title?.trim()) {
    errors.push({
      type: 'error',
      code: 'MISSING_TITLE',
      message: 'Paper title is required',
      field: 'title',
    });
  }

  mcqs.forEach((mcq, index) => {
    if (!mcq.questionText?.trim()) {
      errors.push({
        type: 'error',
        code: 'EMPTY_QUESTION',
        message: `MCQ #${index + 1} has no question text`,
        questionIndex: index,
      });
    }

    if (!mcq.options || mcq.options.length < 4) {
      errors.push({
        type: 'error',
        code: 'MISSING_OPTIONS',
        message: `MCQ #${index + 1} is missing options`,
        questionIndex: index,
      });
    } else {
      mcq.options.forEach((opt, optIndex) => {
        if (!opt?.trim()) {
          errors.push({
            type: 'error',
            code: 'EMPTY_OPTION',
            message: `MCQ #${index + 1} option ${String.fromCharCode(65 + optIndex)} is empty`,
            questionIndex: index,
          });
        }
      });
    }

    if (mcq.correctOption === undefined || mcq.correctOption < 0 || mcq.correctOption > 3) {
      warnings.push({
        type: 'warning',
        code: 'INVALID_CORRECT_OPTION',
        message: `MCQ #${index + 1} has no correct answer marked`,
        questionIndex: index,
      });
    }
  });

  shorts.forEach((sq, index) => {
    if (!sq.questionText?.trim()) {
      errors.push({
        type: 'error',
        code: 'EMPTY_QUESTION',
        message: `Short Question #${index + 1} has no question text`,
        questionIndex: index,
      });
    }
  });

  longs.forEach((lq, index) => {
    if (!lq.questionText?.trim()) {
      errors.push({
        type: 'error',
        code: 'EMPTY_QUESTION',
        message: `Long Question #${index + 1} has no question text`,
        questionIndex: index,
      });
    }
  });

  const allQuestions = [...mcqs, ...shorts, ...longs];
  const questionTexts = allQuestions.map(q => q.questionText?.trim().toLowerCase());
  const duplicates = questionTexts.filter((text, index) => 
    text && questionTexts.indexOf(text) !== index
  );

  if (duplicates.length > 0) {
    warnings.push({
      type: 'warning',
      code: 'DUPLICATE_QUESTIONS',
      message: `${duplicates.length} duplicate question(s) found`,
    });
  }

  const totalQuestions = mcqs.length + shorts.length + longs.length;
  if (totalQuestions === 0) {
    errors.push({
      type: 'error',
      code: 'NO_QUESTIONS',
      message: 'At least one question is required',
    });
  }

  if (totalQuestions > 100) {
    errors.push({
      type: 'error',
      code: 'TOO_MANY_QUESTIONS',
      message: 'Maximum 100 questions allowed',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function formatValidationErrors(result: ValidationResult): string {
  const lines: string[] = [];

  result.errors.forEach(err => {
    lines.push(`Error: ${err.message}`);
  });

  result.warnings.forEach(warn => {
    lines.push(`Warning: ${warn.message}`);
  });

  return lines.join('\n');
}
