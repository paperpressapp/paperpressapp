/**
 * Data Access Layer
 * 
 * This module provides functions to load and query question data
 * from the JSON files stored in the data directory.
 */

import type {
  Chapter,
  MCQQuestion,
  ShortQuestion,
  LongQuestion,
  Question,
  ClassName,
  SubjectName,
} from '@/types';

// Import chapter structure files
import chapters9th from './chapters/9th.json';
import chapters10th from './chapters/10th.json';
import chapters11th from './chapters/11th.json';
import chapters12th from './chapters/12th.json';

// Import 9th class question files
import physics9th from './questions/9th/physics.json';
import chemistry9th from './questions/9th/chemistry.json';
import biology9th from './questions/9th/biology.json';
import mathematics9th from './questions/9th/mathematics.json';
import computer9th from './questions/9th/computer.json';
import english9th from './questions/9th/english.json';

// Import 10th class question files
import physics10th from './questions/10th/physics.json';
import chemistry10th from './questions/10th/chemistry.json';
import biology10th from './questions/10th/biology.json';
import mathematics10th from './questions/10th/mathematics.json';
import computer10th from './questions/10th/computer.json';
import english10th from './questions/10th/english.json';

// Import 11th class question files
import physics11th from './questions/11th/physics.json';
import chemistry11th from './questions/11th/chemistry.json';
import biology11th from './questions/11th/biology.json';
import mathematics11th from './questions/11th/mathematics.json';
import computer11th from './questions/11th/computer.json';
import english11th from './questions/11th/english.json';

// Import 12th class question files
import physics12th from './questions/12th/physics.json';
import chemistry12th from './questions/12th/chemistry.json';
import biology12th from './questions/12th/biology.json';
import mathematics12th from './questions/12th/mathematics.json';
import computer12th from './questions/12th/computer.json';
import english12th from './questions/12th/english.json';

// Type for subject data structure
interface SubjectData {
  class: string;
  subject: string;
  chapters: ChapterData[];
}

interface ChapterData extends Chapter {
  mcqs: MCQQuestion[];
  shortQuestions: ShortQuestion[];
  longQuestions: LongQuestion[];
}

// Map classId to chapters data
const chaptersMap: Record<string, { class: string; subjects: Array<{ name: string; chapters: Chapter[] }> }> = {
  '9th': chapters9th,
  '10th': chapters10th,
  '11th': chapters11th,
  '12th': chapters12th,
};

// Map classId and subject to question data
const questionsMap: Record<string, Record<string, SubjectData>> = {
  '9th': {
    'Physics': physics9th as SubjectData,
    'Chemistry': chemistry9th as SubjectData,
    'Biology': biology9th as SubjectData,
    'Mathematics': mathematics9th as SubjectData,
    'Computer': computer9th as SubjectData,
    'English': english9th as SubjectData,
  },
  '10th': {
    'Physics': physics10th as SubjectData,
    'Chemistry': chemistry10th as SubjectData,
    'Biology': biology10th as SubjectData,
    'Mathematics': mathematics10th as SubjectData,
    'Computer': computer10th as SubjectData,
    'English': english10th as SubjectData,
  },
  '11th': {
    'Physics': physics11th as SubjectData,
    'Chemistry': chemistry11th as SubjectData,
    'Biology': biology11th as SubjectData,
    'Mathematics': mathematics11th as SubjectData,
    'Computer': computer11th as SubjectData,
    'English': english11th as SubjectData,
  },
  '12th': {
    'Physics': physics12th as SubjectData,
    'Chemistry': chemistry12th as SubjectData,
    'Biology': biology12th as SubjectData,
    'Mathematics': mathematics12th as SubjectData,
    'Computer': computer12th as SubjectData,
    'English': english12th as SubjectData,
  },
};

/**
 * Get entire subject data object
 * @param classId - Class identifier (9th, 10th, 11th, 12th)
 * @param subject - Subject name
 * @returns Subject data or null if not found
 */
export function getSubjectData(classId: string, subject: string): SubjectData | null {
  if (!questionsMap[classId]) {
    return null;
  }
  return questionsMap[classId][subject] || null;
}

/**
 * Get chapters for a specific subject
 * @param classId - Class identifier
 * @param subject - Subject name
 * @returns Array of chapters or empty array
 */
export function getChaptersForSubject(classId: string, subject: string): Chapter[] {
  const subjectData = getSubjectData(classId, subject);
  if (!subjectData) {
    return [];
  }
  return subjectData.chapters.map((ch) => ({
    id: ch.id,
    number: ch.number,
    name: ch.name,
    mcqCount: ch.mcqs?.length || 0,
    shortCount: ch.shortQuestions?.length || 0,
    longCount: ch.longQuestions?.length || 0,
  }));
}

/**
 * Get a single chapter by ID
 * @param classId - Class identifier
 * @param subject - Subject name
 * @param chapterId - Chapter ID
 * @returns Chapter or null
 */
export function getChapterById(
  classId: string,
  subject: string,
  chapterId: string
): Chapter | null {
  const subjectData = getSubjectData(classId, subject);
  if (!subjectData) {
    return null;
  }

  const chapter = subjectData.chapters.find((ch) => ch.id === chapterId);
  if (!chapter) {
    return null;
  }

  return {
    id: chapter.id,
    number: chapter.number,
    name: chapter.name,
    mcqCount: chapter.mcqs?.length || 0,
    shortCount: chapter.shortQuestions?.length || 0,
    longCount: chapter.longQuestions?.length || 0,
  };
}

/**
 * Get MCQs from specified chapters
 * @param classId - Class identifier
 * @param subject - Subject name
 * @param chapterIds - Array of chapter IDs
 * @returns Array of MCQ questions with chapter info
 */
export function getMcqsByChapterIds(
  classId: string,
  subject: string,
  chapterIds: string[]
): MCQQuestion[] {
  const subjectData = getSubjectData(classId, subject);
  if (!subjectData || !chapterIds.length) {
    return [];
  }

  const mcqs: MCQQuestion[] = [];

  subjectData.chapters.forEach((chapter) => {
    if (chapterIds.includes(chapter.id) && chapter.mcqs) {
      chapter.mcqs.forEach((mcq) => {
        mcqs.push({
          ...mcq,
          chapterNumber: chapter.number,
          chapterName: chapter.name,
        });
      });
    }
  });

  return mcqs;
}

/**
 * Get short questions from specified chapters
 * @param classId - Class identifier
 * @param subject - Subject name
 * @param chapterIds - Array of chapter IDs
 * @returns Array of short questions with chapter info
 */
export function getShortsByChapterIds(
  classId: string,
  subject: string,
  chapterIds: string[]
): ShortQuestion[] {
  const subjectData = getSubjectData(classId, subject);
  if (!subjectData || !chapterIds.length) {
    return [];
  }

  const shorts: ShortQuestion[] = [];

  subjectData.chapters.forEach((chapter) => {
    if (chapterIds.includes(chapter.id) && chapter.shortQuestions) {
      chapter.shortQuestions.forEach((sq) => {
        shorts.push({
          ...sq,
          chapterNumber: chapter.number,
          chapterName: chapter.name,
        });
      });
    }
  });

  return shorts;
}

/**
 * Get long questions from specified chapters
 * @param classId - Class identifier
 * @param subject - Subject name
 * @param chapterIds - Array of chapter IDs
 * @returns Array of long questions with chapter info
 */
export function getLongsByChapterIds(
  classId: string,
  subject: string,
  chapterIds: string[]
): LongQuestion[] {
  const subjectData = getSubjectData(classId, subject);
  if (!subjectData || !chapterIds.length) {
    return [];
  }

  const longs: LongQuestion[] = [];

  subjectData.chapters.forEach((chapter) => {
    if (chapterIds.includes(chapter.id) && chapter.longQuestions) {
      chapter.longQuestions.forEach((lq) => {
        longs.push({
          ...lq,
          chapterNumber: chapter.number,
          chapterName: chapter.name,
        });
      });
    }
  });

  return longs;
}

/**
 * Get a question by its ID
 * @param classId - Class identifier
 * @param subject - Subject name
 * @param questionId - Question ID
 * @returns Question with type and chapter info, or null
 */
export function getQuestionById(
  classId: string,
  subject: string,
  questionId: string
): (Question & { type: 'mcq' | 'short' | 'long'; chapterNumber?: number; chapterName?: string }) | null {
  const subjectData = getSubjectData(classId, subject);
  if (!subjectData) {
    return null;
  }

  for (const chapter of subjectData.chapters) {
    // Check MCQs
    const mcq = chapter.mcqs?.find((q) => q.id === questionId);
    if (mcq) {
      return {
        ...mcq,
        type: 'mcq',
        chapterNumber: chapter.number,
        chapterName: chapter.name,
      };
    }

    // Check short questions
    const short = chapter.shortQuestions?.find((q) => q.id === questionId);
    if (short) {
      return {
        ...short,
        type: 'short',
        chapterNumber: chapter.number,
        chapterName: chapter.name,
      };
    }

    // Check long questions
    const long = chapter.longQuestions?.find((q) => q.id === questionId);
    if (long) {
      return {
        ...long,
        type: 'long',
        chapterNumber: chapter.number,
        chapterName: chapter.name,
      };
    }
  }

  return null;
}

/**
 * Get multiple questions by their IDs
 * @param classId - Class identifier
 * @param subject - Subject name
 * @param questionIds - Array of question IDs
 * @returns Array of questions in order of IDs
 */
export function getQuestionsByIds(
  classId: string,
  subject: string,
  questionIds: string[]
): Array<Question & { type: 'mcq' | 'short' | 'long'; chapterNumber?: number; chapterName?: string }> {
  if (!questionIds.length) {
    return [];
  }

  const questions: Array<Question & { type: 'mcq' | 'short' | 'long'; chapterNumber?: number; chapterName?: string }> = [];

  for (const id of questionIds) {
    const question = getQuestionById(classId, subject, id);
    if (question) {
      questions.push(question);
    }
  }

  return questions;
}

/**
 * Search questions by text query
 * @param classId - Class identifier
 * @param subject - Subject name
 * @param chapterIds - Array of chapter IDs to search in
 * @param query - Search query
 * @param type - Question type to filter by
 * @returns Array of matching questions
 */
export function searchQuestions(
  classId: string,
  subject: string,
  chapterIds: string[],
  query: string,
  type: 'mcq' | 'short' | 'long'
): Question[] {
  if (!query.trim() || !chapterIds.length) {
    return [];
  }

  const searchTerm = query.toLowerCase().trim();
  const results: Question[] = [];

  switch (type) {
    case 'mcq': {
      const mcqs = getMcqsByChapterIds(classId, subject, chapterIds);
      results.push(...mcqs.filter((q) => q.questionText.toLowerCase().includes(searchTerm)));
      break;
    }
    case 'short': {
      const shorts = getShortsByChapterIds(classId, subject, chapterIds);
      results.push(...shorts.filter((q) => q.questionText.toLowerCase().includes(searchTerm)));
      break;
    }
    case 'long': {
      const longs = getLongsByChapterIds(classId, subject, chapterIds);
      results.push(...longs.filter((q) => q.questionText.toLowerCase().includes(searchTerm)));
      break;
    }
  }

  return results;
}

/**
 * Filter questions by difficulty
 * @param questions - Array of questions to filter
 * @param difficulty - Difficulty level ('all' for no filtering)
 * @returns Filtered array
 */
export function filterByDifficulty<T extends Question>(
  questions: T[],
  difficulty: 'easy' | 'medium' | 'hard' | 'all'
): T[] {
  if (difficulty === 'all') {
    return [...questions];
  }
  return questions.filter((q) => q.difficulty === difficulty);
}

/**
 * Get random questions for paper generation
 * @param classId - Class identifier
 * @param subject - Subject name
 * @param chapterIds - Array of chapter IDs
 * @param mcqCount - Number of MCQs needed
 * @param shortCount - Number of short questions needed
 * @param longCount - Number of long questions needed
 * @param difficulty - Difficulty filter ('mixed' for all)
 * @returns Object with random selections
 */
export function getRandomQuestions(
  classId: string,
  subject: string,
  chapterIds: string[],
  mcqCount: number,
  shortCount: number,
  longCount: number,
  difficulty: 'mixed' | 'easy' | 'medium' | 'hard' = 'mixed'
): { mcqs: MCQQuestion[]; shorts: ShortQuestion[]; longs: LongQuestion[] } {
  // Get all questions from selected chapters
  let mcqs = getMcqsByChapterIds(classId, subject, chapterIds);
  let shorts = getShortsByChapterIds(classId, subject, chapterIds);
  let longs = getLongsByChapterIds(classId, subject, chapterIds);

  // Filter by difficulty if specified
  if (difficulty !== 'mixed') {
    mcqs = filterByDifficulty(mcqs, difficulty);
    shorts = filterByDifficulty(shorts, difficulty);
    longs = filterByDifficulty(longs, difficulty);
  }

  // Helper function to shuffle array
  function shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Get random selections (don't exceed available)
  return {
    mcqs: shuffle(mcqs).slice(0, Math.min(mcqCount, mcqs.length)),
    shorts: shuffle(shorts).slice(0, Math.min(shortCount, shorts.length)),
    longs: shuffle(longs).slice(0, Math.min(longCount, longs.length)),
  };
}

/**
 * Get question counts for each chapter
 * @param classId - Class identifier
 * @param subject - Subject name
 * @returns Array of chapter counts
 */
export function getChapterQuestionCounts(
  classId: string,
  subject: string
): Array<{ chapterId: string; chapterName: string; mcqCount: number; shortCount: number; longCount: number }> {
  const subjectData = getSubjectData(classId, subject);
  if (!subjectData) {
    return [];
  }

  return subjectData.chapters.map((chapter) => ({
    chapterId: chapter.id,
    chapterName: chapter.name,
    mcqCount: chapter.mcqs?.length || 0,
    shortCount: chapter.shortQuestions?.length || 0,
    longCount: chapter.longQuestions?.length || 0,
  }));
}

/**
 * Get total available question counts for selected chapters
 * @param classId - Class identifier
 * @param subject - Subject name
 * @param chapterIds - Array of chapter IDs
 * @returns Object with total counts
 */
export function getAvailableQuestionCounts(
  classId: string,
  subject: string,
  chapterIds: string[]
): { mcqs: number; shorts: number; longs: number } {
  const mcqs = getMcqsByChapterIds(classId, subject, chapterIds);
  const shorts = getShortsByChapterIds(classId, subject, chapterIds);
  const longs = getLongsByChapterIds(classId, subject, chapterIds);

  return {
    mcqs: mcqs.length,
    shorts: shorts.length,
    longs: longs.length,
  };
}

// Re-export types for convenience
export type { SubjectData, ChapterData };
