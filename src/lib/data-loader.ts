/**
 * Dynamic Data Loader
 * 
 * Loads question data dynamically on-demand with indexing for O(1) lookups.
 * This replaces static imports to reduce initial bundle size significantly.
 */

import type { 
  Chapter, 
  MCQQuestion, 
  ShortQuestion, 
  LongQuestion
} from '@/types';
import type { SubjectData, ChapterData } from '@/data';

type DataCache = {
  [key: string]: SubjectData;
};

type IndexMap = Map<string, {
  chapterId: string;
  questionIndex: number;
  type: 'mcq' | 'short' | 'long';
}>;

const dataCache: DataCache = {};
const questionIndex: IndexMap = new Map();
let indexBuilt = false;

async function loadSubjectData(classId: string, subject: string): Promise<SubjectData | null> {
  const cacheKey = `${classId}/${subject}`;
  
  if (dataCache[cacheKey]) {
    return dataCache[cacheKey];
  }

  try {
    const module = await import(`@/data/questions/${classId}/${subject.toLowerCase()}.json`);
    const data = module.default as SubjectData;
    dataCache[cacheKey] = data;
    return data;
  } catch (error) {
    console.error(`Failed to load data for ${classId}/${subject}:`, error);
    return null;
  }
}

function buildIndex() {
  if (indexBuilt) return;
  
  Object.values(dataCache).forEach((subjectData: SubjectData) => {
    subjectData.chapters.forEach((chapter: ChapterData) => {
      chapter.mcqs?.forEach((mcq: MCQQuestion, idx: number) => {
        questionIndex.set(mcq.id, {
          chapterId: chapter.id,
          questionIndex: idx,
          type: 'mcq'
        });
      });
      chapter.shortQuestions?.forEach((sq: ShortQuestion, idx: number) => {
        questionIndex.set(sq.id, {
          chapterId: chapter.id,
          questionIndex: idx,
          type: 'short'
        });
      });
      chapter.longQuestions?.forEach((lq: LongQuestion, idx: number) => {
        questionIndex.set(lq.id, {
          chapterId: chapter.id,
          questionIndex: idx,
          type: 'long'
        });
      });
    });
  });
  
  indexBuilt = true;
}

export async function getSubjectData(classId: string, subject: string): Promise<SubjectData | null> {
  return loadSubjectData(classId, subject);
}

export async function getChaptersForSubject(classId: string, subject: string): Promise<Chapter[]> {
  const subjectData = await loadSubjectData(classId, subject);
  if (!subjectData) return [];
  
  return subjectData.chapters.map((ch: ChapterData) => ({
    id: ch.id,
    number: ch.number,
    name: ch.name,
    mcqCount: ch.mcqs?.length || 0,
    shortCount: ch.shortQuestions?.length || 0,
    longCount: ch.longQuestions?.length || 0,
  }));
}

export async function getChapterById(
  classId: string,
  subject: string,
  chapterId: string
): Promise<Chapter | null> {
  const subjectData = await loadSubjectData(classId, subject);
  if (!subjectData) return null;

  const chapter = subjectData.chapters.find((ch: ChapterData) => ch.id === chapterId);
  if (!chapter) return null;

  return {
    id: chapter.id,
    number: chapter.number,
    name: chapter.name,
    mcqCount: chapter.mcqs?.length || 0,
    shortCount: chapter.shortQuestions?.length || 0,
    longCount: chapter.longQuestions?.length || 0,
  };
}

export async function getMcqsByChapterIds(
  classId: string,
  subject: string,
  chapterIds: string[]
): Promise<MCQQuestion[]> {
  const subjectData = await loadSubjectData(classId, subject);
  if (!subjectData || !chapterIds.length) return [];

  const chapterIdSet = new Set(chapterIds);
  const mcqs: MCQQuestion[] = [];

  for (const chapter of subjectData.chapters) {
    if (chapterIdSet.has(chapter.id) && chapter.mcqs) {
      for (const mcq of chapter.mcqs) {
        mcqs.push({
          ...mcq,
          chapterNumber: chapter.number,
          chapterName: chapter.name,
        });
      }
    }
  }

  return mcqs;
}

export async function getShortsByChapterIds(
  classId: string,
  subject: string,
  chapterIds: string[]
): Promise<ShortQuestion[]> {
  const subjectData = await loadSubjectData(classId, subject);
  if (!subjectData || !chapterIds.length) return [];

  const chapterIdSet = new Set(chapterIds);
  const shorts: ShortQuestion[] = [];

  for (const chapter of subjectData.chapters) {
    if (chapterIdSet.has(chapter.id) && chapter.shortQuestions) {
      for (const sq of chapter.shortQuestions) {
        shorts.push({
          ...sq,
          chapterNumber: chapter.number,
          chapterName: chapter.name,
        });
      }
    }
  }

  return shorts;
}

export async function getLongsByChapterIds(
  classId: string,
  subject: string,
  chapterIds: string[]
): Promise<LongQuestion[]> {
  const subjectData = await loadSubjectData(classId, subject);
  if (!subjectData || !chapterIds.length) return [];

  const chapterIdSet = new Set(chapterIds);
  const longs: LongQuestion[] = [];

  for (const chapter of subjectData.chapters) {
    if (chapterIdSet.has(chapter.id) && chapter.longQuestions) {
      for (const lq of chapter.longQuestions) {
        longs.push({
          ...lq,
          chapterNumber: chapter.number,
          chapterName: chapter.name,
        });
      }
    }
  }

  return longs;
}

export async function getQuestionById(
  classId: string,
  subject: string,
  questionId: string
): Promise<(MCQQuestion | ShortQuestion | LongQuestion) & { type: 'mcq' | 'short' | 'long' } | null> {
  const subjectData = await loadSubjectData(classId, subject);
  if (!subjectData) return null;

  for (const chapter of subjectData.chapters) {
    if (chapter.mcqs) {
      const mcq = chapter.mcqs.find((q: MCQQuestion) => q.id === questionId);
      if (mcq) {
        return { ...mcq, type: 'mcq' as const, chapterNumber: chapter.number, chapterName: chapter.name };
      }
    }
    if (chapter.shortQuestions) {
      const short = chapter.shortQuestions.find((q: ShortQuestion) => q.id === questionId);
      if (short) {
        return { ...short, type: 'short' as const, chapterNumber: chapter.number, chapterName: chapter.name };
      }
    }
    if (chapter.longQuestions) {
      const long = chapter.longQuestions.find((q: LongQuestion) => q.id === questionId);
      if (long) {
        return { ...long, type: 'long' as const, chapterNumber: chapter.number, chapterName: chapter.name };
      }
    }
  }

  return null;
}

export async function getQuestionsByIds(
  classId: string,
  subject: string,
  questionIds: string[]
): Promise<Array<(MCQQuestion | ShortQuestion | LongQuestion) & { type: 'mcq' | 'short' | 'long' }>> {
  if (!questionIds.length) return [];
  
  const questions: Array<(MCQQuestion | ShortQuestion | LongQuestion) & { type: 'mcq' | 'short' | 'long' }> = [];
  
  for (const id of questionIds) {
    const question = await getQuestionById(classId, subject, id);
    if (question) {
      questions.push(question);
    }
  }
  
  return questions;
}

export async function getChapterQuestionCounts(
  classId: string,
  subject: string
): Promise<Array<{ chapterId: string; chapterName: string; mcqCount: number; shortCount: number; longCount: number }>> {
  const subjectData = await loadSubjectData(classId, subject);
  if (!subjectData) return [];

  return subjectData.chapters.map((chapter: ChapterData) => ({
    chapterId: chapter.id,
    chapterName: chapter.name,
    mcqCount: chapter.mcqs?.length || 0,
    shortCount: chapter.shortQuestions?.length || 0,
    longCount: chapter.longQuestions?.length || 0,
  }));
}

export async function getAvailableQuestionCounts(
  classId: string,
  subject: string,
  chapterIds: string[]
): Promise<{ mcqs: number; shorts: number; longs: number }> {
  const [mcqs, shorts, longs] = await Promise.all([
    getMcqsByChapterIds(classId, subject, chapterIds),
    getShortsByChapterIds(classId, subject, chapterIds),
    getLongsByChapterIds(classId, subject, chapterIds),
  ]);

  return {
    mcqs: mcqs.length,
    shorts: shorts.length,
    longs: longs.length,
  };
}

export async function searchQuestions(
  classId: string,
  subject: string,
  chapterIds: string[],
  query: string,
  type: 'mcq' | 'short' | 'long'
): Promise<(MCQQuestion | ShortQuestion | LongQuestion)[]> {
  if (!query.trim() || !chapterIds.length) return [];

  const searchTerm = query.toLowerCase().trim();

  switch (type) {
    case 'mcq': {
      const mcqs = await getMcqsByChapterIds(classId, subject, chapterIds);
      return mcqs.filter((q: MCQQuestion) => q.questionText.toLowerCase().includes(searchTerm));
    }
    case 'short': {
      const shorts = await getShortsByChapterIds(classId, subject, chapterIds);
      return shorts.filter((q: ShortQuestion) => q.questionText.toLowerCase().includes(searchTerm));
    }
    case 'long': {
      const longs = await getLongsByChapterIds(classId, subject, chapterIds);
      return longs.filter((q: LongQuestion) => q.questionText.toLowerCase().includes(searchTerm));
    }
  }
}

export function filterByDifficulty<T extends { difficulty?: string }>(
  questions: T[],
  difficulty: 'easy' | 'medium' | 'hard' | 'all'
): T[] {
  if (difficulty === 'all') return [...questions];
  return questions.filter((q) => q.difficulty === difficulty);
}

export async function getRandomQuestions(
  classId: string,
  subject: string,
  chapterIds: string[],
  mcqCount: number,
  shortCount: number,
  longCount: number,
  difficulty: 'mixed' | 'easy' | 'medium' | 'hard' = 'mixed'
): Promise<{ mcqs: MCQQuestion[]; shorts: ShortQuestion[]; longs: LongQuestion[] }> {
  let mcqs = await getMcqsByChapterIds(classId, subject, chapterIds);
  let shorts = await getShortsByChapterIds(classId, subject, chapterIds);
  let longs = await getLongsByChapterIds(classId, subject, chapterIds);

  if (difficulty !== 'mixed') {
    mcqs = filterByDifficulty(mcqs, difficulty);
    shorts = filterByDifficulty(shorts, difficulty);
    longs = filterByDifficulty(longs, difficulty);
  }

  function shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  function getTopicQuestions<T extends { topic?: string; chapterNumber?: number }>(
    questions: T[],
    topic: string
  ): T[] {
    return questions.filter(q => q.topic === topic);
  }

  function getChapterQuestions<T extends { chapterNumber?: number }>(
    questions: T[],
    chapterNumber: number
  ): T[] {
    return questions.filter(q => q.chapterNumber === chapterNumber);
  }

  function selectFromChapters<T extends { topic?: string; chapterNumber?: number }>(
    questions: T[],
    count: number,
    chapterIds: string[],
    exercisePriority: number = 0.5
  ): T[] {
    if (questions.length === 0) return [];
    if (count === 0) return [];

    const chapterNumbers = chapterIds.map(id => {
      const parts = id.split('_');
      return parseInt(parts[parts.length - 1], 10);
    }).filter(n => !isNaN(n));

    if (chapterNumbers.length === 0) {
      return shuffle(questions).slice(0, Math.min(count, questions.length));
    }

    const exerciseQuestions = getTopicQuestions(questions, 'Exercise');
    const additionalQuestions = getTopicQuestions(questions, 'Additional');

    const exerciseCount = Math.ceil(count * exercisePriority);
    const additionalCount = count - exerciseCount;

    const perChapterExercise = Math.ceil(exerciseCount / chapterNumbers.length);
    const perChapterAdditional = Math.ceil(additionalCount / chapterNumbers.length);

    const selected: T[] = [];

    for (const chapterNum of chapterNumbers) {
      const chapterExercise = getChapterQuestions(exerciseQuestions, chapterNum);
      const chapterAdditional = getChapterQuestions(additionalQuestions, chapterNum);

      const shuffledExercise = shuffle(chapterExercise);
      const shuffledAdditional = shuffle(chapterAdditional);

      selected.push(...shuffledExercise.slice(0, perChapterExercise));
      selected.push(...shuffledAdditional.slice(0, perChapterAdditional));
    }

    const finalShuffled = shuffle(selected);
    return finalShuffled.slice(0, Math.min(count, questions.length));
  }

  const selectedMcqs = selectFromChapters(mcqs, mcqCount, chapterIds, 0.5);
  const selectedShorts = selectFromChapters(shorts, shortCount, chapterIds, 0.5);
  const selectedLongs = selectFromChapters(longs, longCount, chapterIds, 0.5);

  const remainingMcqs = mcqCount - selectedMcqs.length;
  const remainingShorts = shortCount - selectedShorts.length;
  const remainingLongs = longCount - selectedLongs.length;

  const availableMcqIds = new Set(selectedMcqs.map(q => q.id));
  const availableShortIds = new Set(selectedShorts.map(q => q.id));
  const availableLongIds = new Set(selectedLongs.map(q => q.id));

  const fallbackMcqs = shuffle(mcqs.filter(q => !availableMcqIds.has(q.id))).slice(0, remainingMcqs);
  const fallbackShorts = shuffle(shorts.filter(q => !availableShortIds.has(q.id))).slice(0, remainingShorts);
  const fallbackLongs = shuffle(longs.filter(q => !availableLongIds.has(q.id))).slice(0, remainingLongs);

  return {
    mcqs: [...selectedMcqs, ...fallbackMcqs],
    shorts: [...selectedShorts, ...fallbackShorts],
    longs: [...selectedLongs, ...fallbackLongs],
  };
}

export function preloadSubjectData(classId: string, subject: string): void {
  loadSubjectData(classId, subject);
}
