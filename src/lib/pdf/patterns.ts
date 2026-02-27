/**
 * PaperPress — Paper Pattern Definitions
 * 
 * Punjab Board (Pakistan) exam paper structures
 * Based on official syllabus specifications
 */

import type { ShortQuestion, LongQuestion } from "@/types";

export type SectionType = 'mcq' | 'short' | 'long' | 'writing' | 'translation';

export interface QuestionSection {
  qNumber: number;
  title: string;
  instruction: string;
  marksFormula: string;
  totalMarks: number;
  totalQuestions: number;
  attemptCount: number;
  marksPerQuestion: number;
  type: SectionType;
  hasSubParts?: boolean;
  subPartAMarks?: number;
  subPartBMarks?: number;
  specialNote?: string;
  writingPrompt?: string;
  answerLines?: number;
  chapters?: number[];
}

export interface PaperPattern {
  classGroup: 'matric' | 'intermediate';
  classId: string;
  subject: string;
  totalMarks: number;
  timeAllowed: string;
  sections: QuestionSection[];
  description?: string;
}

export const PAPER_PATTERNS: Record<string, PaperPattern> = {
  // ─────────────────────────────────────────────────────────────
  // MATRIC — CLASS 9th & 10th
  // ─────────────────────────────────────────────────────────────
  
  '9th_english': {
    classGroup: 'matric',
    classId: '9th',
    subject: 'English',
    totalMarks: 75,
    timeAllowed: '2.5 Hours',
    description: 'English (Matric) - Total Marks: 75',
    sections: [
      {
        qNumber: 1,
        title: 'Objective (MCQs)',
        instruction: 'Choose the correct answer. (Spelling / Synonyms / Grammar)',
        marksFormula: '19 × 1 = 19',
        totalMarks: 19, totalQuestions: 19, attemptCount: 19, marksPerQuestion: 1,
        type: 'mcq',
      },
      {
        qNumber: 2,
        title: 'Short Questions',
        instruction: 'Attempt any 5 short questions out of 8.',
        marksFormula: '5 × 2 = 10',
        totalMarks: 10, totalQuestions: 8, attemptCount: 5, marksPerQuestion: 2,
        type: 'short',
      },
      {
        qNumber: 3,
        title: 'Translation (Urdu to English)',
        instruction: 'Translate the following sentences into English.',
        marksFormula: '5 × 1 = 5',
        totalMarks: 5, totalQuestions: 5, attemptCount: 5, marksPerQuestion: 1,
        type: 'translation',
        writingPrompt: 'Translate the following sentences from Urdu into English:',
        answerLines: 8,
      },
      {
        qNumber: 4,
        title: 'Summary / Poem Paraphrase',
        instruction: 'Write the summary of the poem or paraphrase the given stanza.',
        marksFormula: '5 Marks',
        totalMarks: 5, totalQuestions: 1, attemptCount: 1, marksPerQuestion: 5,
        type: 'writing',
        writingPrompt: 'Write the summary of the poem / Paraphrase the given stanza:',
        answerLines: 10,
      },
      {
        qNumber: 5,
        title: 'Essay / Paragraph / Letter / Story',
        instruction: 'Attempt the following.',
        marksFormula: '15 Marks',
        totalMarks: 15, totalQuestions: 1, attemptCount: 1, marksPerQuestion: 15,
        type: 'writing',
        writingPrompt: 'Write an essay / paragraph / letter / story on the given topic:',
        answerLines: 20,
      },
      {
        qNumber: 6,
        title: 'Change of Voice (Active / Passive)',
        instruction: 'Change the voice of the following sentences.',
        marksFormula: '5 × 1 = 5',
        totalMarks: 5, totalQuestions: 5, attemptCount: 5, marksPerQuestion: 1,
        type: 'writing',
        writingPrompt: 'Change the voice of the following sentences:',
        answerLines: 10,
      },
      {
        qNumber: 7,
        title: 'Translation (Paragraphs into Urdu)',
        instruction: 'Attempt any 2 paragraphs out of 3.',
        marksFormula: '2 × 4 = 8',
        totalMarks: 8, totalQuestions: 3, attemptCount: 2, marksPerQuestion: 4,
        type: 'translation',
        writingPrompt: 'Translate the following paragraph(s) into Urdu:',
        answerLines: 12,
      },
    ],
  },

  '10th_english': {
    classGroup: 'matric',
    classId: '10th',
    subject: 'English',
    totalMarks: 75,
    timeAllowed: '2.5 Hours',
    description: 'English (Matric) - Total Marks: 75',
    sections: [
      {
        qNumber: 1,
        title: 'Objective (MCQs)',
        instruction: 'Choose the correct answer. (Spelling / Synonyms / Grammar)',
        marksFormula: '19 × 1 = 19',
        totalMarks: 19, totalQuestions: 19, attemptCount: 19, marksPerQuestion: 1,
        type: 'mcq',
      },
      {
        qNumber: 2,
        title: 'Short Questions',
        instruction: 'Attempt any 5 short questions out of 8.',
        marksFormula: '5 × 2 = 10',
        totalMarks: 10, totalQuestions: 8, attemptCount: 5, marksPerQuestion: 2,
        type: 'short',
      },
      {
        qNumber: 3,
        title: 'Translation (Urdu to English)',
        instruction: 'Translate the following sentences into English.',
        marksFormula: '5 × 1 = 5',
        totalMarks: 5, totalQuestions: 5, attemptCount: 5, marksPerQuestion: 1,
        type: 'translation',
        writingPrompt: 'Translate the following sentences from Urdu into English:',
        answerLines: 8,
      },
      {
        qNumber: 4,
        title: 'Summary / Poem Paraphrase',
        instruction: 'Write the summary of the poem or paraphrase the given stanza.',
        marksFormula: '5 Marks',
        totalMarks: 5, totalQuestions: 1, attemptCount: 1, marksPerQuestion: 5,
        type: 'writing',
        writingPrompt: 'Write the summary of the poem / Paraphrase the given stanza:',
        answerLines: 10,
      },
      {
        qNumber: 5,
        title: 'Essay / Paragraph / Letter / Story',
        instruction: 'Attempt the following.',
        marksFormula: '15 Marks',
        totalMarks: 15, totalQuestions: 1, attemptCount: 1, marksPerQuestion: 15,
        type: 'writing',
        writingPrompt: 'Write an essay / paragraph / letter / story on the given topic:',
        answerLines: 20,
      },
      {
        qNumber: 6,
        title: 'Change of Voice (Active / Passive)',
        instruction: 'Change the voice of the following sentences.',
        marksFormula: '5 × 1 = 5',
        totalMarks: 5, totalQuestions: 5, attemptCount: 5, marksPerQuestion: 1,
        type: 'writing',
        writingPrompt: 'Change the voice of the following sentences:',
        answerLines: 10,
      },
      {
        qNumber: 7,
        title: 'Translation (Paragraphs into Urdu)',
        instruction: 'Attempt any 2 paragraphs out of 3.',
        marksFormula: '2 × 4 = 8',
        totalMarks: 8, totalQuestions: 3, attemptCount: 2, marksPerQuestion: 4,
        type: 'translation',
        writingPrompt: 'Translate the following paragraph(s) into Urdu:',
        answerLines: 12,
      },
    ],
  },

  '9th_physics': {
    classGroup: 'matric',
    classId: '9th',
    subject: 'Physics',
    totalMarks: 60,
    timeAllowed: '2 Hours',
    description: 'Physics (Matric) - Total Marks: 60',
    sections: [
      {
        qNumber: 1,
        title: 'Objective (MCQs)',
        instruction: 'Circle the correct answer.',
        marksFormula: '12 × 1 = 12',
        totalMarks: 12, totalQuestions: 12, attemptCount: 12, marksPerQuestion: 1,
        type: 'mcq',
      },
      {
        qNumber: 2,
        title: 'Short Questions',
        instruction: 'Attempt any 5 short questions out of 8.',
        marksFormula: '5 × 2 = 10',
        totalMarks: 10, totalQuestions: 8, attemptCount: 5, marksPerQuestion: 2,
        type: 'short',
      },
      {
        qNumber: 3,
        title: 'Short Questions',
        instruction: 'Attempt any 5 short questions out of 8.',
        marksFormula: '5 × 2 = 10',
        totalMarks: 10, totalQuestions: 8, attemptCount: 5, marksPerQuestion: 2,
        type: 'short',
      },
      {
        qNumber: 4,
        title: 'Short Questions',
        instruction: 'Attempt any 5 short questions out of 8.',
        marksFormula: '5 × 2 = 10',
        totalMarks: 10, totalQuestions: 8, attemptCount: 5, marksPerQuestion: 2,
        type: 'short',
      },
      {
        qNumber: 5,
        title: 'Long Questions',
        instruction: 'Attempt any 2 questions out of 3.',
        marksFormula: '2 × 9 = 18',
        totalMarks: 18, totalQuestions: 3, attemptCount: 2, marksPerQuestion: 9,
        type: 'long',
        hasSubParts: true, subPartAMarks: 5, subPartBMarks: 4,
        specialNote: 'Each question has two parts: (a) Theory [5 marks] + (b) Numerical [4 marks]',
      },
    ],
  },

  '10th_physics': {
    classGroup: 'matric',
    classId: '10th',
    subject: 'Physics',
    totalMarks: 60,
    timeAllowed: '2 Hours',
    description: 'Physics (Matric) - Total Marks: 60',
    sections: [
      {
        qNumber: 1,
        title: 'Objective (MCQs)',
        instruction: 'Circle the correct answer.',
        marksFormula: '12 × 1 = 12',
        totalMarks: 12, totalQuestions: 12, attemptCount: 12, marksPerQuestion: 1,
        type: 'mcq',
      },
      {
        qNumber: 2,
        title: 'Short Questions',
        instruction: 'Attempt any 5 short questions out of 8.',
        marksFormula: '5 × 2 = 10',
        totalMarks: 10, totalQuestions: 8, attemptCount: 5, marksPerQuestion: 2,
        type: 'short',
      },
      {
        qNumber: 3,
        title: 'Short Questions',
        instruction: 'Attempt any 5 short questions out of 8.',
        marksFormula: '5 × 2 = 10',
        totalMarks: 10, totalQuestions: 8, attemptCount: 5, marksPerQuestion: 2,
        type: 'short',
      },
      {
        qNumber: 4,
        title: 'Short Questions',
        instruction: 'Attempt any 5 short questions out of 8.',
        marksFormula: '5 × 2 = 10',
        totalMarks: 10, totalQuestions: 8, attemptCount: 5, marksPerQuestion: 2,
        type: 'short',
      },
      {
        qNumber: 5,
        title: 'Long Questions',
        instruction: 'Attempt any 2 questions out of 3.',
        marksFormula: '2 × 9 = 18',
        totalMarks: 18, totalQuestions: 3, attemptCount: 2, marksPerQuestion: 9,
        type: 'long',
        hasSubParts: true, subPartAMarks: 5, subPartBMarks: 4,
        specialNote: 'Each question has two parts: (a) Theory [5 marks] + (b) Numerical [4 marks]',
      },
    ],
  },

  '9th_chemistry': {
    classGroup: 'matric',
    classId: '9th',
    subject: 'Chemistry',
    totalMarks: 60,
    timeAllowed: '2 Hours',
    description: 'Chemistry (Matric) - Total Marks: 60',
    sections: [
      {
        qNumber: 1,
        title: 'Objective (MCQs)',
        instruction: 'Circle the correct answer.',
        marksFormula: '12 × 1 = 12',
        totalMarks: 12, totalQuestions: 12, attemptCount: 12, marksPerQuestion: 1,
        type: 'mcq',
      },
      {
        qNumber: 2,
        title: 'Short Questions',
        instruction: 'Attempt any 5 short questions out of 8.',
        marksFormula: '5 × 2 = 10',
        totalMarks: 10, totalQuestions: 8, attemptCount: 5, marksPerQuestion: 2,
        type: 'short',
      },
      {
        qNumber: 3,
        title: 'Short Questions',
        instruction: 'Attempt any 5 short questions out of 8.',
        marksFormula: '5 × 2 = 10',
        totalMarks: 10, totalQuestions: 8, attemptCount: 5, marksPerQuestion: 2,
        type: 'short',
      },
      {
        qNumber: 4,
        title: 'Short Questions',
        instruction: 'Attempt any 5 short questions out of 8.',
        marksFormula: '5 × 2 = 10',
        totalMarks: 10, totalQuestions: 8, attemptCount: 5, marksPerQuestion: 2,
        type: 'short',
      },
      {
        qNumber: 5,
        title: 'Long Questions',
        instruction: 'Attempt any 2 questions out of 3.',
        marksFormula: '2 × 9 = 18',
        totalMarks: 18, totalQuestions: 3, attemptCount: 2, marksPerQuestion: 9,
        type: 'long',
        hasSubParts: true, subPartAMarks: 5, subPartBMarks: 4,
      },
    ],
  },

  '10th_chemistry': {
    classGroup: 'matric',
    classId: '10th',
    subject: 'Chemistry',
    totalMarks: 60,
    timeAllowed: '2 Hours',
    description: 'Chemistry (Matric) - Total Marks: 60',
    sections: [
      {
        qNumber: 1,
        title: 'Objective (MCQs)',
        instruction: 'Circle the correct answer.',
        marksFormula: '12 × 1 = 12',
        totalMarks: 12, totalQuestions: 12, attemptCount: 12, marksPerQuestion: 1,
        type: 'mcq',
      },
      {
        qNumber: 2,
        title: 'Short Questions',
        instruction: 'Attempt any 5 short questions out of 8.',
        marksFormula: '5 × 2 = 10',
        totalMarks: 10, totalQuestions: 8, attemptCount: 5, marksPerQuestion: 2,
        type: 'short',
      },
      {
        qNumber: 3,
        title: 'Short Questions',
        instruction: 'Attempt any 5 short questions out of 8.',
        marksFormula: '5 × 2 = 10',
        totalMarks: 10, totalQuestions: 8, attemptCount: 5, marksPerQuestion: 2,
        type: 'short',
      },
      {
        qNumber: 4,
        title: 'Short Questions',
        instruction: 'Attempt any 5 short questions out of 8.',
        marksFormula: '5 × 2 = 10',
        totalMarks: 10, totalQuestions: 8, attemptCount: 5, marksPerQuestion: 2,
        type: 'short',
      },
      {
        qNumber: 5,
        title: 'Long Questions',
        instruction: 'Attempt any 2 questions out of 3.',
        marksFormula: '2 × 9 = 18',
        totalMarks: 18, totalQuestions: 3, attemptCount: 2, marksPerQuestion: 9,
        type: 'long',
        hasSubParts: true, subPartAMarks: 5, subPartBMarks: 4,
      },
    ],
  },

  '9th_biology': {
    classGroup: 'matric',
    classId: '9th',
    subject: 'Biology',
    totalMarks: 60,
    timeAllowed: '2 Hours',
    description: 'Biology (Matric) - Total Marks: 60',
    sections: [
      {
        qNumber: 1,
        title: 'Objective (MCQs)',
        instruction: 'Circle the correct answer.',
        marksFormula: '12 × 1 = 12',
        totalMarks: 12, totalQuestions: 12, attemptCount: 12, marksPerQuestion: 1,
        type: 'mcq',
      },
      {
        qNumber: 2,
        title: 'Short Questions',
        instruction: 'Attempt any 5 short questions out of 8.',
        marksFormula: '5 × 2 = 10',
        totalMarks: 10, totalQuestions: 8, attemptCount: 5, marksPerQuestion: 2,
        type: 'short',
      },
      {
        qNumber: 3,
        title: 'Short Questions',
        instruction: 'Attempt any 5 short questions out of 8.',
        marksFormula: '5 × 2 = 10',
        totalMarks: 10, totalQuestions: 8, attemptCount: 5, marksPerQuestion: 2,
        type: 'short',
      },
      {
        qNumber: 4,
        title: 'Short Questions',
        instruction: 'Attempt any 5 short questions out of 8.',
        marksFormula: '5 × 2 = 10',
        totalMarks: 10, totalQuestions: 8, attemptCount: 5, marksPerQuestion: 2,
        type: 'short',
      },
      {
        qNumber: 5,
        title: 'Long Questions',
        instruction: 'Attempt any 2 questions out of 3.',
        marksFormula: '2 × 9 = 18',
        totalMarks: 18, totalQuestions: 3, attemptCount: 2, marksPerQuestion: 9,
        type: 'long',
        hasSubParts: true, subPartAMarks: 5, subPartBMarks: 4,
      },
    ],
  },

  '10th_biology': {
    classGroup: 'matric',
    classId: '10th',
    subject: 'Biology',
    totalMarks: 60,
    timeAllowed: '2 Hours',
    description: 'Biology (Matric) - Total Marks: 60',
    sections: [
      {
        qNumber: 1,
        title: 'Objective (MCQs)',
        instruction: 'Circle the correct answer.',
        marksFormula: '12 × 1 = 12',
        totalMarks: 12, totalQuestions: 12, attemptCount: 12, marksPerQuestion: 1,
        type: 'mcq',
      },
      {
        qNumber: 2,
        title: 'Short Questions',
        instruction: 'Attempt any 5 short questions out of 8.',
        marksFormula: '5 × 2 = 10',
        totalMarks: 10, totalQuestions: 8, attemptCount: 5, marksPerQuestion: 2,
        type: 'short',
      },
      {
        qNumber: 3,
        title: 'Short Questions',
        instruction: 'Attempt any 5 short questions out of 8.',
        marksFormula: '5 × 2 = 10',
        totalMarks: 10, totalQuestions: 8, attemptCount: 5, marksPerQuestion: 2,
        type: 'short',
      },
      {
        qNumber: 4,
        title: 'Short Questions',
        instruction: 'Attempt any 5 short questions out of 8.',
        marksFormula: '5 × 2 = 10',
        totalMarks: 10, totalQuestions: 8, attemptCount: 5, marksPerQuestion: 2,
        type: 'short',
      },
      {
        qNumber: 5,
        title: 'Long Questions',
        instruction: 'Attempt any 2 questions out of 3.',
        marksFormula: '2 × 9 = 18',
        totalMarks: 18, totalQuestions: 3, attemptCount: 2, marksPerQuestion: 9,
        type: 'long',
        hasSubParts: true, subPartAMarks: 5, subPartBMarks: 4,
      },
    ],
  },

  '9th_mathematics': {
    classGroup: 'matric',
    classId: '9th',
    subject: 'Mathematics',
    totalMarks: 75,
    timeAllowed: '2.5 Hours',
    description: 'Mathematics (Matric) - Total Marks: 75',
    sections: [
      {
        qNumber: 1,
        title: 'Objective (MCQs)',
        instruction: 'Circle the correct answer.',
        marksFormula: '15 × 1 = 15',
        totalMarks: 15, totalQuestions: 15, attemptCount: 15, marksPerQuestion: 1,
        type: 'mcq',
      },
      {
        qNumber: 2,
        title: 'Short Questions',
        instruction: 'Attempt any 6 short questions out of 9.',
        marksFormula: '6 × 2 = 12',
        totalMarks: 12, totalQuestions: 9, attemptCount: 6, marksPerQuestion: 2,
        type: 'short',
      },
      {
        qNumber: 3,
        title: 'Short Questions',
        instruction: 'Attempt any 6 short questions out of 9.',
        marksFormula: '6 × 2 = 12',
        totalMarks: 12, totalQuestions: 9, attemptCount: 6, marksPerQuestion: 2,
        type: 'short',
      },
      {
        qNumber: 4,
        title: 'Short Questions',
        instruction: 'Attempt any 6 short questions out of 9.',
        marksFormula: '6 × 2 = 12',
        totalMarks: 12, totalQuestions: 9, attemptCount: 6, marksPerQuestion: 2,
        type: 'short',
      },
      {
        qNumber: 5,
        title: 'Long Questions',
        instruction: 'Attempt any 3 questions. Q9 (Theorem) is Compulsory.',
        marksFormula: '3 × 8 = 24',
        totalMarks: 24, totalQuestions: 5, attemptCount: 3, marksPerQuestion: 8,
        type: 'long',
        hasSubParts: true, subPartAMarks: 4, subPartBMarks: 4,
        specialNote: 'Note: Q9 (Theorem) is Compulsory (8 Marks). Other questions have parts (a) and (b) (4+4 marks each).',
      },
    ],
  },

  '10th_mathematics': {
    classGroup: 'matric',
    classId: '10th',
    subject: 'Mathematics',
    totalMarks: 75,
    timeAllowed: '2.5 Hours',
    description: 'Mathematics (Matric) - Total Marks: 75',
    sections: [
      {
        qNumber: 1,
        title: 'Objective (MCQs)',
        instruction: 'Circle the correct answer.',
        marksFormula: '15 × 1 = 15',
        totalMarks: 15, totalQuestions: 15, attemptCount: 15, marksPerQuestion: 1,
        type: 'mcq',
      },
      {
        qNumber: 2,
        title: 'Short Questions',
        instruction: 'Attempt any 6 short questions out of 9.',
        marksFormula: '6 × 2 = 12',
        totalMarks: 12, totalQuestions: 9, attemptCount: 6, marksPerQuestion: 2,
        type: 'short',
      },
      {
        qNumber: 3,
        title: 'Short Questions',
        instruction: 'Attempt any 6 short questions out of 9.',
        marksFormula: '6 × 2 = 12',
        totalMarks: 12, totalQuestions: 9, attemptCount: 6, marksPerQuestion: 2,
        type: 'short',
      },
      {
        qNumber: 4,
        title: 'Short Questions',
        instruction: 'Attempt any 6 short questions out of 9.',
        marksFormula: '6 × 2 = 12',
        totalMarks: 12, totalQuestions: 9, attemptCount: 6, marksPerQuestion: 2,
        type: 'short',
      },
      {
        qNumber: 5,
        title: 'Long Questions',
        instruction: 'Attempt any 3 questions. Q9 (Theorem) is Compulsory.',
        marksFormula: '3 × 8 = 24',
        totalMarks: 24, totalQuestions: 5, attemptCount: 3, marksPerQuestion: 8,
        type: 'long',
        hasSubParts: true, subPartAMarks: 4, subPartBMarks: 4,
        specialNote: 'Note: Q9 (Theorem) is Compulsory (8 Marks). Other questions have parts (a) and (b) (4+4 marks each).',
      },
    ],
  },

  '9th_computer': {
    classGroup: 'matric',
    classId: '9th',
    subject: 'Computer',
    totalMarks: 60,
    timeAllowed: '2 Hours',
    description: 'Computer Science (Matric) - Total Marks: 60',
    sections: [
      {
        qNumber: 1,
        title: 'Objective (MCQs)',
        instruction: 'Circle the correct answer.',
        marksFormula: '12 × 1 = 12',
        totalMarks: 12, totalQuestions: 12, attemptCount: 12, marksPerQuestion: 1,
        type: 'mcq',
      },
      {
        qNumber: 2,
        title: 'Short Questions',
        instruction: 'Attempt any 4 short questions out of 6.',
        marksFormula: '4 × 2 = 8',
        totalMarks: 8, totalQuestions: 6, attemptCount: 4, marksPerQuestion: 2,
        type: 'short',
      },
      {
        qNumber: 3,
        title: 'Short Questions',
        instruction: 'Attempt any 4 short questions out of 6.',
        marksFormula: '4 × 2 = 8',
        totalMarks: 8, totalQuestions: 6, attemptCount: 4, marksPerQuestion: 2,
        type: 'short',
      },
      {
        qNumber: 4,
        title: 'Short Questions',
        instruction: 'Attempt any 4 short questions out of 6.',
        marksFormula: '4 × 2 = 8',
        totalMarks: 8, totalQuestions: 6, attemptCount: 4, marksPerQuestion: 2,
        type: 'short',
      },
      {
        qNumber: 5,
        title: 'Long Questions',
        instruction: 'Attempt any 2 questions out of 3.',
        marksFormula: '2 × 8 = 16',
        totalMarks: 16, totalQuestions: 3, attemptCount: 2, marksPerQuestion: 8,
        type: 'long',
      },
    ],
  },

  '10th_computer': {
    classGroup: 'matric',
    classId: '10th',
    subject: 'Computer',
    totalMarks: 60,
    timeAllowed: '2 Hours',
    description: 'Computer Science (Matric) - Total Marks: 60',
    sections: [
      {
        qNumber: 1,
        title: 'Objective (MCQs)',
        instruction: 'Circle the correct answer.',
        marksFormula: '12 × 1 = 12',
        totalMarks: 12, totalQuestions: 12, attemptCount: 12, marksPerQuestion: 1,
        type: 'mcq',
      },
      {
        qNumber: 2,
        title: 'Short Questions',
        instruction: 'Attempt any 4 short questions out of 6.',
        marksFormula: '4 × 2 = 8',
        totalMarks: 8, totalQuestions: 6, attemptCount: 4, marksPerQuestion: 2,
        type: 'short',
      },
      {
        qNumber: 3,
        title: 'Short Questions',
        instruction: 'Attempt any 4 short questions out of 6.',
        marksFormula: '4 × 2 = 8',
        totalMarks: 8, totalQuestions: 6, attemptCount: 4, marksPerQuestion: 2,
        type: 'short',
      },
      {
        qNumber: 4,
        title: 'Short Questions',
        instruction: 'Attempt any 4 short questions out of 6.',
        marksFormula: '4 × 2 = 8',
        totalMarks: 8, totalQuestions: 6, attemptCount: 4, marksPerQuestion: 2,
        type: 'short',
      },
      {
        qNumber: 5,
        title: 'Long Questions',
        instruction: 'Attempt any 2 questions out of 3.',
        marksFormula: '2 × 8 = 16',
        totalMarks: 16, totalQuestions: 3, attemptCount: 2, marksPerQuestion: 8,
        type: 'long',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // INTERMEDIATE — CLASS 11th & 12th
  // ─────────────────────────────────────────────────────────────

  '11th_english': {
    classGroup: 'intermediate',
    classId: '11th',
    subject: 'English',
    totalMarks: 100,
    timeAllowed: '3 Hours',
    description: 'English (Intermediate) - Total Marks: 100',
    sections: [
      {
        qNumber: 1,
        title: 'Objective (MCQs)',
        instruction: 'Choose the correct answer. (Synonyms / Prepositions / Correction)',
        marksFormula: '20 × 1 = 20',
        totalMarks: 20, totalQuestions: 20, attemptCount: 20, marksPerQuestion: 1,
        type: 'mcq',
      },
      {
        qNumber: 2,
        title: 'Short Questions (Prose)',
        instruction: 'Attempt any 6 short questions out of 9 from Book I.',
        marksFormula: '6 × 2 = 12',
        totalMarks: 12, totalQuestions: 9, attemptCount: 6, marksPerQuestion: 2,
        type: 'short',
      },
      {
        qNumber: 3,
        title: 'Short Questions (Plays/Heroes)',
        instruction: 'Attempt any 6 short questions out of 9.',
        marksFormula: '6 × 2 = 12',
        totalMarks: 12, totalQuestions: 9, attemptCount: 6, marksPerQuestion: 2,
        type: 'short',
      },
      {
        qNumber: 4,
        title: 'Short Questions (Poems/Novel)',
        instruction: 'Attempt any 4 short questions out of 6.',
        marksFormula: '4 × 2 = 8',
        totalMarks: 8, totalQuestions: 6, attemptCount: 4, marksPerQuestion: 2,
        type: 'short',
      },
      {
        qNumber: 5,
        title: 'Letter / Application Writing',
        instruction: 'Write a letter/application on the given topic.',
        marksFormula: '10 Marks',
        totalMarks: 10, totalQuestions: 1, attemptCount: 1, marksPerQuestion: 10,
        type: 'writing',
        writingPrompt: 'Write a letter/application on the given topic:',
        answerLines: 15,
      },
      {
        qNumber: 6,
        title: 'Story Writing',
        instruction: 'Write a story on the given outline/topic.',
        marksFormula: '10 Marks',
        totalMarks: 10, totalQuestions: 1, attemptCount: 1, marksPerQuestion: 10,
        type: 'writing',
        writingPrompt: 'Write a story on the given outline/topic:',
        answerLines: 15,
      },
      {
        qNumber: 7,
        title: 'Explanation of Stanza',
        instruction: 'Explain the given stanza with reference to the context.',
        marksFormula: '5 Marks',
        totalMarks: 5, totalQuestions: 1, attemptCount: 1, marksPerQuestion: 5,
        type: 'writing',
        writingPrompt: 'Explain the following stanza with reference to the context:',
        answerLines: 10,
      },
      {
        qNumber: 8,
        title: 'Punctuation / Translation',
        instruction: 'Attempt the following.',
        marksFormula: '15 Marks',
        totalMarks: 15, totalQuestions: 1, attemptCount: 1, marksPerQuestion: 15,
        type: 'writing',
        writingPrompt: '',
        answerLines: 15,
      },
    ],
  },

  '12th_english': {
    classGroup: 'intermediate',
    classId: '12th',
    subject: 'English',
    totalMarks: 100,
    timeAllowed: '3 Hours',
    description: 'English (Intermediate) - Total Marks: 100',
    sections: [
      {
        qNumber: 1,
        title: 'Objective (MCQs)',
        instruction: 'Choose the correct answer. (Synonyms / Prepositions / Correction)',
        marksFormula: '20 × 1 = 20',
        totalMarks: 20, totalQuestions: 20, attemptCount: 20, marksPerQuestion: 1,
        type: 'mcq',
      },
      {
        qNumber: 2,
        title: 'Short Questions (Prose)',
        instruction: 'Attempt any 6 short questions out of 9 from Book I.',
        marksFormula: '6 × 2 = 12',
        totalMarks: 12, totalQuestions: 9, attemptCount: 6, marksPerQuestion: 2,
        type: 'short',
      },
      {
        qNumber: 3,
        title: 'Short Questions (Plays/Heroes)',
        instruction: 'Attempt any 6 short questions out of 9.',
        marksFormula: '6 × 2 = 12',
        totalMarks: 12, totalQuestions: 9, attemptCount: 6, marksPerQuestion: 2,
        type: 'short',
      },
      {
        qNumber: 4,
        title: 'Short Questions (Poems/Novel)',
        instruction: 'Attempt any 4 short questions out of 6.',
        marksFormula: '4 × 2 = 8',
        totalMarks: 8, totalQuestions: 6, attemptCount: 4, marksPerQuestion: 2,
        type: 'short',
      },
      {
        qNumber: 5,
        title: 'Letter / Application Writing',
        instruction: 'Write a letter/application on the given topic.',
        marksFormula: '10 Marks',
        totalMarks: 10, totalQuestions: 1, attemptCount: 1, marksPerQuestion: 10,
        type: 'writing',
        writingPrompt: 'Write a letter/application on the given topic:',
        answerLines: 15,
      },
      {
        qNumber: 6,
        title: 'Story Writing',
        instruction: 'Write a story on the given outline/topic.',
        marksFormula: '10 Marks',
        totalMarks: 10, totalQuestions: 1, attemptCount: 1, marksPerQuestion: 10,
        type: 'writing',
        writingPrompt: 'Write a story on the given outline/topic:',
        answerLines: 15,
      },
      {
        qNumber: 7,
        title: 'Explanation of Stanza',
        instruction: 'Explain the given stanza with reference to the context.',
        marksFormula: '5 Marks',
        totalMarks: 5, totalQuestions: 1, attemptCount: 1, marksPerQuestion: 5,
        type: 'writing',
        writingPrompt: 'Explain the following stanza with reference to the context:',
        answerLines: 10,
      },
      {
        qNumber: 8,
        title: 'Punctuation / Translation',
        instruction: 'Attempt the following.',
        marksFormula: '15 Marks',
        totalMarks: 15, totalQuestions: 1, attemptCount: 1, marksPerQuestion: 15,
        type: 'writing',
        writingPrompt: '',
        answerLines: 15,
      },
    ],
  },

  '11th_physics': {
    classGroup: 'intermediate',
    classId: '11th',
    subject: 'Physics',
    totalMarks: 85,
    timeAllowed: '3 Hours',
    description: 'Physics (Intermediate) - Total Marks: 85',
    sections: [
      {
        qNumber: 1,
        title: 'Objective (MCQs)',
        instruction: 'Circle the correct answer.',
        marksFormula: '17 × 1 = 17',
        totalMarks: 17, totalQuestions: 17, attemptCount: 17, marksPerQuestion: 1,
        type: 'mcq',
      },
      {
        qNumber: 2,
        title: 'Short Questions',
        instruction: 'Attempt any 8 short questions out of 12.',
        marksFormula: '8 × 2 = 16',
        totalMarks: 16, totalQuestions: 12, attemptCount: 8, marksPerQuestion: 2,
        type: 'short',
      },
      {
        qNumber: 3,
        title: 'Short Questions',
        instruction: 'Attempt any 8 short questions out of 12.',
        marksFormula: '8 × 2 = 16',
        totalMarks: 16, totalQuestions: 12, attemptCount: 8, marksPerQuestion: 2,
        type: 'short',
      },
      {
        qNumber: 4,
        title: 'Short Questions',
        instruction: 'Attempt any 6 short questions out of 9.',
        marksFormula: '6 × 2 = 12',
        totalMarks: 12, totalQuestions: 9, attemptCount: 6, marksPerQuestion: 2,
        type: 'short',
      },
      {
        qNumber: 5,
        title: 'Long Questions',
        instruction: 'Attempt any 3 questions out of 5.',
        marksFormula: '3 × 8 = 24',
        totalMarks: 24, totalQuestions: 5, attemptCount: 3, marksPerQuestion: 8,
        type: 'long',
        hasSubParts: true, subPartAMarks: 4, subPartBMarks: 4,
        specialNote: 'Each question has two parts: (a) Theory [4 marks] + (b) Numerical [4 marks]',
      },
    ],
  },

  '12th_physics': {
    classGroup: 'intermediate',
    classId: '12th',
    subject: 'Physics',
    totalMarks: 85,
    timeAllowed: '3 Hours',
    description: 'Physics (Intermediate) - Total Marks: 85',
    sections: [
      {
        qNumber: 1,
        title: 'Objective (MCQs)',
        instruction: 'Circle the correct answer.',
        marksFormula: '17 × 1 = 17',
        totalMarks: 17, totalQuestions: 17, attemptCount: 17, marksPerQuestion: 1,
        type: 'mcq',
      },
      {
        qNumber: 2,
        title: 'Short Questions',
        instruction: 'Attempt any 8 short questions out of 12.',
        marksFormula: '8 × 2 = 16',
        totalMarks: 16, totalQuestions: 12, attemptCount: 8, marksPerQuestion: 2,
        type: 'short',
      },
      {
        qNumber: 3,
        title: 'Short Questions',
        instruction: 'Attempt any 8 short questions out of 12.',
        marksFormula: '8 × 2 = 16',
        totalMarks: 16, totalQuestions: 12, attemptCount: 8, marksPerQuestion: 2,
        type: 'short',
      },
      {
        qNumber: 4,
        title: 'Short Questions',
        instruction: 'Attempt any 6 short questions out of 9.',
        marksFormula: '6 × 2 = 12',
        totalMarks: 12, totalQuestions: 9, attemptCount: 6, marksPerQuestion: 2,
        type: 'short',
      },
      {
        qNumber: 5,
        title: 'Long Questions',
        instruction: 'Attempt any 3 questions out of 5.',
        marksFormula: '3 × 8 = 24',
        totalMarks: 24, totalQuestions: 5, attemptCount: 3, marksPerQuestion: 8,
        type: 'long',
        hasSubParts: true, subPartAMarks: 4, subPartBMarks: 4,
        specialNote: 'Each question has two parts: (a) Theory [4 marks] + (b) Numerical [4 marks]',
      },
    ],
  },

  '11th_chemistry': {
    classGroup: 'intermediate',
    classId: '11th',
    subject: 'Chemistry',
    totalMarks: 85,
    timeAllowed: '3 Hours',
    description: 'Chemistry (Intermediate) - Total Marks: 85',
    sections: [
      {
        qNumber: 1,
        title: 'Objective (MCQs)',
        instruction: 'Circle the correct answer.',
        marksFormula: '17 × 1 = 17',
        totalMarks: 17, totalQuestions: 17, attemptCount: 17, marksPerQuestion: 1,
        type: 'mcq',
      },
      {
        qNumber: 2,
        title: 'Short Questions',
        instruction: 'Attempt any 8 short questions out of 12.',
        marksFormula: '8 × 2 = 16',
        totalMarks: 16, totalQuestions: 12, attemptCount: 8, marksPerQuestion: 2,
        type: 'short',
      },
      {
        qNumber: 3,
        title: 'Short Questions',
        instruction: 'Attempt any 8 short questions out of 12.',
        marksFormula: '8 × 2 = 16',
        totalMarks: 16, totalQuestions: 12, attemptCount: 8, marksPerQuestion: 2,
        type: 'short',
      },
      {
        qNumber: 4,
        title: 'Short Questions',
        instruction: 'Attempt any 6 short questions out of 9.',
        marksFormula: '6 × 2 = 12',
        totalMarks: 12, totalQuestions: 9, attemptCount: 6, marksPerQuestion: 2,
        type: 'short',
      },
      {
        qNumber: 5,
        title: 'Long Questions',
        instruction: 'Attempt any 3 questions out of 5.',
        marksFormula: '3 × 8 = 24',
        totalMarks: 24, totalQuestions: 5, attemptCount: 3, marksPerQuestion: 8,
        type: 'long',
        hasSubParts: true, subPartAMarks: 4, subPartBMarks: 4,
        specialNote: 'Each question has two parts: (a) Theory [4 marks] + (b) Numerical/Reaction [4 marks]',
      },
    ],
  },

  '12th_chemistry': {
    classGroup: 'intermediate',
    classId: '12th',
    subject: 'Chemistry',
    totalMarks: 85,
    timeAllowed: '3 Hours',
    description: 'Chemistry (Intermediate) - Total Marks: 85',
    sections: [
      {
        qNumber: 1,
        title: 'Objective (MCQs)',
        instruction: 'Circle the correct answer.',
        marksFormula: '17 × 1 = 17',
        totalMarks: 17, totalQuestions: 17, attemptCount: 17, marksPerQuestion: 1,
        type: 'mcq',
      },
      {
        qNumber: 2,
        title: 'Short Questions',
        instruction: 'Attempt any 8 short questions out of 12.',
        marksFormula: '8 × 2 = 16',
        totalMarks: 16, totalQuestions: 12, attemptCount: 8, marksPerQuestion: 2,
        type: 'short',
      },
      {
        qNumber: 3,
        title: 'Short Questions',
        instruction: 'Attempt any 8 short questions out of 12.',
        marksFormula: '8 × 2 = 16',
        totalMarks: 16, totalQuestions: 12, attemptCount: 8, marksPerQuestion: 2,
        type: 'short',
      },
      {
        qNumber: 4,
        title: 'Short Questions',
        instruction: 'Attempt any 6 short questions out of 9.',
        marksFormula: '6 × 2 = 12',
        totalMarks: 12, totalQuestions: 9, attemptCount: 6, marksPerQuestion: 2,
        type: 'short',
      },
      {
        qNumber: 5,
        title: 'Long Questions',
        instruction: 'Attempt any 3 questions out of 5.',
        marksFormula: '3 × 8 = 24',
        totalMarks: 24, totalQuestions: 5, attemptCount: 3, marksPerQuestion: 8,
        type: 'long',
        hasSubParts: true, subPartAMarks: 4, subPartBMarks: 4,
        specialNote: 'Each question has two parts: (a) Theory [4 marks] + (b) Numerical/Reaction [4 marks]',
      },
    ],
  },

  '11th_biology': {
    classGroup: 'intermediate',
    classId: '11th',
    subject: 'Biology',
    totalMarks: 85,
    timeAllowed: '3 Hours',
    description: 'Biology (Intermediate) - Total Marks: 85',
    sections: [
      {
        qNumber: 1,
        title: 'Objective (MCQs)',
        instruction: 'Circle the correct answer.',
        marksFormula: '17 × 1 = 17',
        totalMarks: 17, totalQuestions: 17, attemptCount: 17, marksPerQuestion: 1,
        type: 'mcq',
      },
      {
        qNumber: 2,
        title: 'Short Questions',
        instruction: 'Attempt any 8 short questions out of 12.',
        marksFormula: '8 × 2 = 16',
        totalMarks: 16, totalQuestions: 12, attemptCount: 8, marksPerQuestion: 2,
        type: 'short',
      },
      {
        qNumber: 3,
        title: 'Short Questions',
        instruction: 'Attempt any 8 short questions out of 12.',
        marksFormula: '8 × 2 = 16',
        totalMarks: 16, totalQuestions: 12, attemptCount: 8, marksPerQuestion: 2,
        type: 'short',
      },
      {
        qNumber: 4,
        title: 'Short Questions',
        instruction: 'Attempt any 6 short questions out of 9.',
        marksFormula: '6 × 2 = 12',
        totalMarks: 12, totalQuestions: 9, attemptCount: 6, marksPerQuestion: 2,
        type: 'short',
      },
      {
        qNumber: 5,
        title: 'Long Questions',
        instruction: 'Attempt any 3 questions out of 5.',
        marksFormula: '3 × 8 = 24',
        totalMarks: 24, totalQuestions: 5, attemptCount: 3, marksPerQuestion: 8,
        type: 'long',
        hasSubParts: true, subPartAMarks: 4, subPartBMarks: 4,
      },
    ],
  },

  '12th_biology': {
    classGroup: 'intermediate',
    classId: '12th',
    subject: 'Biology',
    totalMarks: 85,
    timeAllowed: '3 Hours',
    description: 'Biology (Intermediate) - Total Marks: 85',
    sections: [
      {
        qNumber: 1,
        title: 'Objective (MCQs)',
        instruction: 'Circle the correct answer.',
        marksFormula: '17 × 1 = 17',
        totalMarks: 17, totalQuestions: 17, attemptCount: 17, marksPerQuestion: 1,
        type: 'mcq',
      },
      {
        qNumber: 2,
        title: 'Short Questions',
        instruction: 'Attempt any 8 short questions out of 12.',
        marksFormula: '8 × 2 = 16',
        totalMarks: 16, totalQuestions: 12, attemptCount: 8, marksPerQuestion: 2,
        type: 'short',
      },
      {
        qNumber: 3,
        title: 'Short Questions',
        instruction: 'Attempt any 8 short questions out of 12.',
        marksFormula: '8 × 2 = 16',
        totalMarks: 16, totalQuestions: 12, attemptCount: 8, marksPerQuestion: 2,
        type: 'short',
      },
      {
        qNumber: 4,
        title: 'Short Questions',
        instruction: 'Attempt any 6 short questions out of 9.',
        marksFormula: '6 × 2 = 12',
        totalMarks: 12, totalQuestions: 9, attemptCount: 6, marksPerQuestion: 2,
        type: 'short',
      },
      {
        qNumber: 5,
        title: 'Long Questions',
        instruction: 'Attempt any 3 questions out of 5.',
        marksFormula: '3 × 8 = 24',
        totalMarks: 24, totalQuestions: 5, attemptCount: 3, marksPerQuestion: 8,
        type: 'long',
        hasSubParts: true, subPartAMarks: 4, subPartBMarks: 4,
      },
    ],
  },

  '11th_computer': {
    classGroup: 'intermediate',
    classId: '11th',
    subject: 'Computer',
    totalMarks: 75,
    timeAllowed: '3 Hours',
    description: 'Computer Science (Intermediate) - Total Marks: 75',
    sections: [
      {
        qNumber: 1,
        title: 'Objective (MCQs)',
        instruction: 'Circle the correct answer.',
        marksFormula: '15 × 1 = 15',
        totalMarks: 15, totalQuestions: 15, attemptCount: 15, marksPerQuestion: 1,
        type: 'mcq',
      },
      {
        qNumber: 2,
        title: 'Short Questions',
        instruction: 'Attempt any 6 short questions out of 9.',
        marksFormula: '6 × 2 = 12',
        totalMarks: 12, totalQuestions: 9, attemptCount: 6, marksPerQuestion: 2,
        type: 'short',
      },
      {
        qNumber: 3,
        title: 'Short Questions',
        instruction: 'Attempt any 6 short questions out of 9.',
        marksFormula: '6 × 2 = 12',
        totalMarks: 12, totalQuestions: 9, attemptCount: 6, marksPerQuestion: 2,
        type: 'short',
      },
      {
        qNumber: 4,
        title: 'Short Questions',
        instruction: 'Attempt any 6 short questions out of 9.',
        marksFormula: '6 × 2 = 12',
        totalMarks: 12, totalQuestions: 9, attemptCount: 6, marksPerQuestion: 2,
        type: 'short',
      },
      {
        qNumber: 5,
        title: 'Long Questions',
        instruction: 'Attempt any 3 questions out of 5.',
        marksFormula: '3 × 8 = 24',
        totalMarks: 24, totalQuestions: 5, attemptCount: 3, marksPerQuestion: 8,
        type: 'long',
      },
    ],
  },

  '12th_computer': {
    classGroup: 'intermediate',
    classId: '12th',
    subject: 'Computer',
    totalMarks: 75,
    timeAllowed: '3 Hours',
    description: 'Computer Science (Intermediate) - Total Marks: 75',
    sections: [
      {
        qNumber: 1,
        title: 'Objective (MCQs)',
        instruction: 'Circle the correct answer.',
        marksFormula: '15 × 1 = 15',
        totalMarks: 15, totalQuestions: 15, attemptCount: 15, marksPerQuestion: 1,
        type: 'mcq',
      },
      {
        qNumber: 2,
        title: 'Short Questions',
        instruction: 'Attempt any 6 short questions out of 9.',
        marksFormula: '6 × 2 = 12',
        totalMarks: 12, totalQuestions: 9, attemptCount: 6, marksPerQuestion: 2,
        type: 'short',
      },
      {
        qNumber: 3,
        title: 'Short Questions',
        instruction: 'Attempt any 6 short questions out of 9.',
        marksFormula: '6 × 2 = 12',
        totalMarks: 12, totalQuestions: 9, attemptCount: 6, marksPerQuestion: 2,
        type: 'short',
      },
      {
        qNumber: 4,
        title: 'Short Questions',
        instruction: 'Attempt any 6 short questions out of 9.',
        marksFormula: '6 × 2 = 12',
        totalMarks: 12, totalQuestions: 9, attemptCount: 6, marksPerQuestion: 2,
        type: 'short',
      },
      {
        qNumber: 5,
        title: 'Long Questions',
        instruction: 'Attempt any 3 questions out of 5.',
        marksFormula: '3 × 8 = 24',
        totalMarks: 24, totalQuestions: 5, attemptCount: 3, marksPerQuestion: 8,
        type: 'long',
      },
    ],
  },

  '11th_mathematics': {
    classGroup: 'intermediate',
    classId: '11th',
    subject: 'Mathematics',
    totalMarks: 100,
    timeAllowed: '3 Hours',
    description: 'Mathematics (Intermediate) - Total Marks: 100',
    sections: [
      {
        qNumber: 1,
        title: 'Objective (MCQs)',
        instruction: 'Circle the correct answer.',
        marksFormula: '20 × 1 = 20',
        totalMarks: 20, totalQuestions: 20, attemptCount: 20, marksPerQuestion: 1,
        type: 'mcq',
      },
      {
        qNumber: 2,
        title: 'Short Questions',
        instruction: 'Attempt any 8 short questions out of 12.',
        marksFormula: '8 × 2 = 16',
        totalMarks: 16, totalQuestions: 12, attemptCount: 8, marksPerQuestion: 2,
        type: 'short',
      },
      {
        qNumber: 3,
        title: 'Short Questions',
        instruction: 'Attempt any 8 short questions out of 12.',
        marksFormula: '8 × 2 = 16',
        totalMarks: 16, totalQuestions: 12, attemptCount: 8, marksPerQuestion: 2,
        type: 'short',
      },
      {
        qNumber: 4,
        title: 'Short Questions',
        instruction: 'Attempt any 9 short questions out of 13.',
        marksFormula: '9 × 2 = 18',
        totalMarks: 18, totalQuestions: 13, attemptCount: 9, marksPerQuestion: 2,
        type: 'short',
      },
      {
        qNumber: 5,
        title: 'Long Questions',
        instruction: 'Attempt any 3 questions out of 5.',
        marksFormula: '3 × 10 = 30',
        totalMarks: 30, totalQuestions: 5, attemptCount: 3, marksPerQuestion: 10,
        type: 'long',
        hasSubParts: true, subPartAMarks: 5, subPartBMarks: 5,
        specialNote: 'Each question has two parts (a) and (b), 5+5 marks each.',
      },
    ],
  },

  '12th_mathematics': {
    classGroup: 'intermediate',
    classId: '12th',
    subject: 'Mathematics',
    totalMarks: 100,
    timeAllowed: '3 Hours',
    description: 'Mathematics (Intermediate) - Total Marks: 100',
    sections: [
      {
        qNumber: 1,
        title: 'Objective (MCQs)',
        instruction: 'Circle the correct answer.',
        marksFormula: '20 × 1 = 20',
        totalMarks: 20, totalQuestions: 20, attemptCount: 20, marksPerQuestion: 1,
        type: 'mcq',
      },
      {
        qNumber: 2,
        title: 'Short Questions',
        instruction: 'Attempt any 8 short questions out of 12.',
        marksFormula: '8 × 2 = 16',
        totalMarks: 16, totalQuestions: 12, attemptCount: 8, marksPerQuestion: 2,
        type: 'short',
      },
      {
        qNumber: 3,
        title: 'Short Questions',
        instruction: 'Attempt any 8 short questions out of 12.',
        marksFormula: '8 × 2 = 16',
        totalMarks: 16, totalQuestions: 12, attemptCount: 8, marksPerQuestion: 2,
        type: 'short',
      },
      {
        qNumber: 4,
        title: 'Short Questions',
        instruction: 'Attempt any 9 short questions out of 13.',
        marksFormula: '9 × 2 = 18',
        totalMarks: 18, totalQuestions: 13, attemptCount: 9, marksPerQuestion: 2,
        type: 'short',
      },
      {
        qNumber: 5,
        title: 'Long Questions',
        instruction: 'Attempt any 3 questions out of 5.',
        marksFormula: '3 × 10 = 30',
        totalMarks: 30, totalQuestions: 5, attemptCount: 3, marksPerQuestion: 10,
        type: 'long',
        hasSubParts: true, subPartAMarks: 5, subPartBMarks: 5,
        specialNote: 'Each question has two parts (a) and (b), 5+5 marks each.',
      },
    ],
  },
};

export function getPattern(classId: string | undefined, subject: string | undefined): PaperPattern | undefined {
  if (!classId || !subject) {
    return undefined;
  }
  try {
    const key = `${classId.toLowerCase()}_${subject.toLowerCase()}`;
    return PAPER_PATTERNS[key];
  } catch (error) {
    console.error('Error in getPattern:', error);
    return undefined;
  }
}

export function getPatternKey(classId: string | undefined, subject: string | undefined): string {
  if (!classId || !subject) {
    return 'default';
  }
  try {
    return `${classId.toLowerCase()}_${subject.toLowerCase()}`;
  } catch (error) {
    return 'default';
  }
}

export function getAllPatterns(): PaperPattern[] {
  return Object.values(PAPER_PATTERNS);
}

export function getPatternsByClass(classId: string | undefined): PaperPattern[] {
  if (!classId) {
    return [];
  }
  try {
    return getAllPatterns().filter(p => p.classId.toLowerCase() === classId.toLowerCase());
  } catch (error) {
    return [];
  }
}

// Legacy compatibility functions for patternTemplate.ts

export function resolvePaperPattern(classId: string, subject: string): PaperPattern {
  const pattern = getPattern(classId, subject);
  if (!pattern) {
    // Return a default pattern if not found
    return {
      classGroup: 'matric',
      classId,
      subject,
      totalMarks: 60,
      timeAllowed: '2 Hours',
      sections: [
        { qNumber: 1, title: 'Objective', instruction: 'Circle correct answer', marksFormula: '12×1=12', totalMarks: 12, totalQuestions: 12, attemptCount: 12, marksPerQuestion: 1, type: 'mcq' },
        { qNumber: 2, title: 'Short', instruction: 'Attempt 5', marksFormula: '5×2=10', totalMarks: 10, totalQuestions: 8, attemptCount: 5, marksPerQuestion: 2, type: 'short' },
        { qNumber: 3, title: 'Long', instruction: 'Attempt 2', marksFormula: '2×9=18', totalMarks: 18, totalQuestions: 3, attemptCount: 2, marksPerQuestion: 9, type: 'long' },
      ],
    };
  }
  return pattern;
}

export function distributeShorts(pattern: PaperPattern, questions: ShortQuestion[]): { section: QuestionSection; questions: ShortQuestion[] }[] {
  const shortSections = pattern.sections.filter(s => s.type === 'short');
  const result: { section: QuestionSection; questions: ShortQuestion[] }[] = [];
  
  shortSections.forEach(section => {
    const sectionQuestions = questions.slice(0, section.totalQuestions);
    result.push({ section, questions: sectionQuestions });
  });
  
  return result;
}

export function distributeLongs(pattern: PaperPattern, questions: LongQuestion[]): { section: QuestionSection; questions: LongQuestion[] }[] {
  const longSections = pattern.sections.filter(s => s.type === 'long');
  const result: { section: QuestionSection; questions: LongQuestion[] }[] = [];
  
  longSections.forEach(section => {
    const sectionQuestions = questions.slice(0, section.totalQuestions);
    result.push({ section, questions: sectionQuestions });
  });
  
  return result;
}
