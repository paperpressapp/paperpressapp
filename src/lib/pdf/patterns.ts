/**
 * PaperPress — Paper Pattern Definitions
 *
 * Punjab Board (Pakistan) exam paper structures for:
 *   - Matric:       Class 9th & 10th
 *   - Intermediate: Class 11th & 12th
 *
 * One PaperPattern per class-group + subject.
 * Sections are listed in Q-number order (Q1, Q2, Q3...).
 */

export type SectionType =
  | 'mcq'
  | 'short'
  | 'long'
  | 'writing';

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
}

export interface PaperPattern {
  classGroup: 'matric' | 'intermediate';
  subject: string;
  totalMarks: number;
  timeAllowed: string;
  sections: QuestionSection[];
}

// ─────────────────────────────────────────────────────────────
// MATRIC — CLASS 9th & 10th
// ─────────────────────────────────────────────────────────────

export const MATRIC_SCIENCE: PaperPattern = {
  classGroup: 'matric',
  subject: 'Science',
  totalMarks: 60,
  timeAllowed: '2 Hours',
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
      instruction: 'Attempt any 5 short questions.',
      marksFormula: '5 × 2 = 10',
      totalMarks: 10, totalQuestions: 8, attemptCount: 5, marksPerQuestion: 2,
      type: 'short',
    },
    {
      qNumber: 3,
      title: 'Short Questions',
      instruction: 'Attempt any 5 short questions.',
      marksFormula: '5 × 2 = 10',
      totalMarks: 10, totalQuestions: 8, attemptCount: 5, marksPerQuestion: 2,
      type: 'short',
    },
    {
      qNumber: 4,
      title: 'Short Questions',
      instruction: 'Attempt any 5 short questions.',
      marksFormula: '5 × 2 = 10',
      totalMarks: 10, totalQuestions: 8, attemptCount: 5, marksPerQuestion: 2,
      type: 'short',
    },
    {
      qNumber: 5,
      title: 'Long Questions',
      instruction: 'Attempt any 2 questions.',
      marksFormula: '2 × 9 = 18',
      totalMarks: 18, totalQuestions: 3, attemptCount: 2, marksPerQuestion: 9,
      type: 'long',
      hasSubParts: true, subPartAMarks: 5, subPartBMarks: 4,
    },
  ],
};

export const MATRIC_COMPUTER: PaperPattern = {
  classGroup: 'matric',
  subject: 'Computer',
  totalMarks: 60,
  timeAllowed: '2 Hours',
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
      instruction: 'Attempt any 4 short questions.',
      marksFormula: '4 × 2 = 8',
      totalMarks: 8, totalQuestions: 6, attemptCount: 4, marksPerQuestion: 2,
      type: 'short',
    },
    {
      qNumber: 3,
      title: 'Short Questions',
      instruction: 'Attempt any 4 short questions.',
      marksFormula: '4 × 2 = 8',
      totalMarks: 8, totalQuestions: 6, attemptCount: 4, marksPerQuestion: 2,
      type: 'short',
    },
    {
      qNumber: 4,
      title: 'Short Questions',
      instruction: 'Attempt any 4 short questions.',
      marksFormula: '4 × 2 = 8',
      totalMarks: 8, totalQuestions: 6, attemptCount: 4, marksPerQuestion: 2,
      type: 'short',
    },
    {
      qNumber: 5,
      title: 'Long Questions',
      instruction: 'Attempt any 2 questions.',
      marksFormula: '2 × 8 = 16',
      totalMarks: 16, totalQuestions: 3, attemptCount: 2, marksPerQuestion: 8,
      type: 'long',
      hasSubParts: false,
    },
  ],
};

export const MATRIC_MATHEMATICS: PaperPattern = {
  classGroup: 'matric',
  subject: 'Mathematics',
  totalMarks: 75,
  timeAllowed: '2.5 Hours',
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
      instruction: 'Attempt any 6 short questions.',
      marksFormula: '6 × 2 = 12',
      totalMarks: 12, totalQuestions: 9, attemptCount: 6, marksPerQuestion: 2,
      type: 'short',
    },
    {
      qNumber: 3,
      title: 'Short Questions',
      instruction: 'Attempt any 6 short questions.',
      marksFormula: '6 × 2 = 12',
      totalMarks: 12, totalQuestions: 9, attemptCount: 6, marksPerQuestion: 2,
      type: 'short',
    },
    {
      qNumber: 4,
      title: 'Short Questions',
      instruction: 'Attempt any 6 short questions.',
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
      specialNote: 'Note: Q9 (Theorem) is Compulsory (8 Marks).',
    },
  ],
};

export const MATRIC_ENGLISH: PaperPattern = {
  classGroup: 'matric',
  subject: 'English',
  totalMarks: 75,
  timeAllowed: '2.5 Hours',
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
      instruction: 'Attempt any 5 short questions.',
      marksFormula: '5 × 2 = 10',
      totalMarks: 10, totalQuestions: 8, attemptCount: 5, marksPerQuestion: 2,
      type: 'short',
    },
    {
      qNumber: 3,
      title: 'Translation of Paragraphs into Urdu',
      instruction: 'Attempt any 2 out of 3 paragraphs.',
      marksFormula: '2 × 4 = 8',
      totalMarks: 8, totalQuestions: 3, attemptCount: 2, marksPerQuestion: 4,
      type: 'writing',
      writingPrompt: 'Translate the following paragraph(s) into Urdu:',
      answerLines: 12,
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
      title: 'Essay / Letter / Story / Dialogue',
      instruction: 'Attempt the following.',
      marksFormula: '15 Marks',
      totalMarks: 15, totalQuestions: 1, attemptCount: 1, marksPerQuestion: 15,
      type: 'writing',
      writingPrompt: 'Write an essay / letter / story / dialogue on the given topic:',
      answerLines: 22,
    },
    {
      qNumber: 6,
      title: 'Change of Voice (Active / Passive)',
      instruction: 'Change the voice of the following sentences.',
      marksFormula: '5 Marks',
      totalMarks: 5, totalQuestions: 5, attemptCount: 5, marksPerQuestion: 1,
      type: 'writing',
      writingPrompt: 'Change the voice of the following sentences:',
      answerLines: 10,
    },
    {
      qNumber: 7,
      title: 'Translation (Urdu to English)',
      instruction: 'Translate the following sentences into English.',
      marksFormula: '5 Marks',
      totalMarks: 5, totalQuestions: 5, attemptCount: 5, marksPerQuestion: 1,
      type: 'writing',
      writingPrompt: 'Translate the following sentences from Urdu into English:',
      answerLines: 10,
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// INTERMEDIATE — CLASS 11th & 12th
// ─────────────────────────────────────────────────────────────

export const INTER_SCIENCE: PaperPattern = {
  classGroup: 'intermediate',
  subject: 'Science',
  totalMarks: 85,
  timeAllowed: '3 Hours',
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
      instruction: 'Attempt any 8 short questions.',
      marksFormula: '8 × 2 = 16',
      totalMarks: 16, totalQuestions: 12, attemptCount: 8, marksPerQuestion: 2,
      type: 'short',
    },
    {
      qNumber: 3,
      title: 'Short Questions',
      instruction: 'Attempt any 8 short questions.',
      marksFormula: '8 × 2 = 16',
      totalMarks: 16, totalQuestions: 12, attemptCount: 8, marksPerQuestion: 2,
      type: 'short',
    },
    {
      qNumber: 4,
      title: 'Short Questions',
      instruction: 'Attempt any 6 short questions.',
      marksFormula: '6 × 2 = 12',
      totalMarks: 12, totalQuestions: 9, attemptCount: 6, marksPerQuestion: 2,
      type: 'short',
    },
    {
      qNumber: 5,
      title: 'Long Questions',
      instruction: 'Attempt any 3 questions.',
      marksFormula: '3 × 8 = 24',
      totalMarks: 24, totalQuestions: 5, attemptCount: 3, marksPerQuestion: 8,
      type: 'long',
      hasSubParts: true, subPartAMarks: 4, subPartBMarks: 4,
    },
  ],
};

export const INTER_COMPUTER: PaperPattern = {
  classGroup: 'intermediate',
  subject: 'Computer',
  totalMarks: 75,
  timeAllowed: '3 Hours',
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
      instruction: 'Attempt any 6 short questions.',
      marksFormula: '6 × 2 = 12',
      totalMarks: 12, totalQuestions: 9, attemptCount: 6, marksPerQuestion: 2,
      type: 'short',
    },
    {
      qNumber: 3,
      title: 'Short Questions',
      instruction: 'Attempt any 6 short questions.',
      marksFormula: '6 × 2 = 12',
      totalMarks: 12, totalQuestions: 9, attemptCount: 6, marksPerQuestion: 2,
      type: 'short',
    },
    {
      qNumber: 4,
      title: 'Short Questions',
      instruction: 'Attempt any 6 short questions.',
      marksFormula: '6 × 2 = 12',
      totalMarks: 12, totalQuestions: 9, attemptCount: 6, marksPerQuestion: 2,
      type: 'short',
    },
    {
      qNumber: 5,
      title: 'Long Questions',
      instruction: 'Attempt any 3 questions.',
      marksFormula: '3 × 8 = 24',
      totalMarks: 24, totalQuestions: 5, attemptCount: 3, marksPerQuestion: 8,
      type: 'long',
      hasSubParts: false,
    },
  ],
};

export const INTER_MATHEMATICS: PaperPattern = {
  classGroup: 'intermediate',
  subject: 'Mathematics',
  totalMarks: 100,
  timeAllowed: '3 Hours',
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
      instruction: 'Attempt any 8 short questions.',
      marksFormula: '8 × 2 = 16',
      totalMarks: 16, totalQuestions: 12, attemptCount: 8, marksPerQuestion: 2,
      type: 'short',
    },
    {
      qNumber: 3,
      title: 'Short Questions',
      instruction: 'Attempt any 8 short questions.',
      marksFormula: '8 × 2 = 16',
      totalMarks: 16, totalQuestions: 12, attemptCount: 8, marksPerQuestion: 2,
      type: 'short',
    },
    {
      qNumber: 4,
      title: 'Short Questions',
      instruction: 'Attempt any 9 short questions.',
      marksFormula: '9 × 2 = 18',
      totalMarks: 18, totalQuestions: 13, attemptCount: 9, marksPerQuestion: 2,
      type: 'short',
    },
    {
      qNumber: 5,
      title: 'Long Questions',
      instruction: 'Attempt any 3 questions.',
      marksFormula: '3 × 10 = 30',
      totalMarks: 30, totalQuestions: 5, attemptCount: 3, marksPerQuestion: 10,
      type: 'long',
      hasSubParts: true, subPartAMarks: 5, subPartBMarks: 5,
    },
  ],
};

export const INTER_ENGLISH: PaperPattern = {
  classGroup: 'intermediate',
  subject: 'English',
  totalMarks: 100,
  timeAllowed: '3 Hours',
  sections: [
    {
      qNumber: 1,
      title: 'Objective (MCQs)',
      instruction: 'Choose the correct answer. (Synonyms / Prepositions / Grammar)',
      marksFormula: '20 × 1 = 20',
      totalMarks: 20, totalQuestions: 20, attemptCount: 20, marksPerQuestion: 1,
      type: 'mcq',
    },
    {
      qNumber: 2,
      title: 'Short Questions (Book I / II — Prose)',
      instruction: 'Attempt any 6 short questions.',
      marksFormula: '6 × 2 = 12',
      totalMarks: 12, totalQuestions: 9, attemptCount: 6, marksPerQuestion: 2,
      type: 'short',
    },
    {
      qNumber: 3,
      title: 'Short Questions (Plays / Heroes)',
      instruction: 'Attempt any 6 short questions.',
      marksFormula: '6 × 2 = 12',
      totalMarks: 12, totalQuestions: 9, attemptCount: 6, marksPerQuestion: 2,
      type: 'short',
    },
    {
      qNumber: 4,
      title: 'Short Questions (Poems / Novel)',
      instruction: 'Attempt any 4 short questions.',
      marksFormula: '4 × 2 = 8',
      totalMarks: 8, totalQuestions: 6, attemptCount: 4, marksPerQuestion: 2,
      type: 'short',
    },
    {
      qNumber: 5,
      title: 'Letter / Application Writing',
      instruction: 'Write a letter / application on the given topic.',
      marksFormula: '10 Marks',
      totalMarks: 10, totalQuestions: 1, attemptCount: 1, marksPerQuestion: 10,
      type: 'writing',
      writingPrompt: 'Write a letter / application on the given topic:',
      answerLines: 16,
    },
    {
      qNumber: 6,
      title: 'Story Writing',
      instruction: 'Write a story on the given topic.',
      marksFormula: '10 Marks',
      totalMarks: 10, totalQuestions: 1, attemptCount: 1, marksPerQuestion: 10,
      type: 'writing',
      writingPrompt: 'Write a story on the given topic:',
      answerLines: 16,
    },
    {
      qNumber: 7,
      title: 'Explanation with Reference to Context',
      instruction: 'Explain the following stanza with reference to the context.',
      marksFormula: '5 Marks',
      totalMarks: 5, totalQuestions: 1, attemptCount: 1, marksPerQuestion: 5,
      type: 'writing',
      writingPrompt: 'Explain the following stanza with reference to the context:',
      answerLines: 10,
    },
    {
      qNumber: 8,
      title: 'Punctuation / Translation of Passage',
      instruction: 'Punctuate the passage OR translate into Urdu.',
      marksFormula: '15 Marks',
      totalMarks: 15, totalQuestions: 1, attemptCount: 1, marksPerQuestion: 15,
      type: 'writing',
      writingPrompt: 'Punctuate the following passage OR translate it into Urdu:',
      answerLines: 20,
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// RESOLVER
// ─────────────────────────────────────────────────────────────

export function resolvePaperPattern(classId: string, subject: string): PaperPattern {
  const isMatric = classId === '9th' || classId === '10th';
  const s = subject.toLowerCase().trim();

  if (isMatric) {
    if (s === 'english') return MATRIC_ENGLISH;
    if (s === 'mathematics' || s === 'maths') return MATRIC_MATHEMATICS;
    if (s === 'computer') return MATRIC_COMPUTER;
    return MATRIC_SCIENCE;
  } else {
    if (s === 'english') return INTER_ENGLISH;
    if (s === 'mathematics' || s === 'maths') return INTER_MATHEMATICS;
    if (s === 'computer') return INTER_COMPUTER;
    return INTER_SCIENCE;
  }
}

export function distributeShorts(
  pattern: PaperPattern,
  shorts: import('@/types').ShortQuestion[]
): Array<{ section: QuestionSection; questions: import('@/types').ShortQuestion[] }> {
  const shortSections = pattern.sections.filter(s => s.type === 'short');
  if (!shortSections.length || !shorts.length) return [];

  const result: Array<{ section: QuestionSection; questions: import('@/types').ShortQuestion[] }> = [];
  let pool = [...shorts];

  shortSections.forEach((sec, idx) => {
    const isLast = idx === shortSections.length - 1;
    const take = isLast ? pool.length : Math.min(sec.totalQuestions, pool.length);
    result.push({ section: sec, questions: pool.splice(0, take) });
  });

  return result;
}

export function distributeLongs(
  pattern: PaperPattern,
  longs: import('@/types').LongQuestion[]
): Array<{ section: QuestionSection; questions: import('@/types').LongQuestion[] }> {
  const longSections = pattern.sections.filter(s => s.type === 'long');
  if (!longSections.length || !longs.length) return [];
  return longSections.map(sec => ({ section: sec, questions: longs }));
}
