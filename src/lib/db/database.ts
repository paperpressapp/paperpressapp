/**
 * PaperPress Database Service
 * 
 * Unified database access layer that:
 * - Uses SQLite on native Android (via @capacitor-community/sqlite)
 * - Falls back to JSON files on web for development
 * 
 * Provides question retrieval, paper storage, and duplicate prevention.
 */

import { Capacitor } from '@capacitor/core';
import { sqliteService } from './sqliteService';
import type { Question, Paper, PaperConfig } from './types';

export interface QuestionRow {
  id: string;
  class_id: string;
  subject_id: string;
  chapter_id: string;
  type: 'mcq' | 'short' | 'long' | 'essay' | 'grammar' | 'letter' | 'comprehension';
  difficulty: 'easy' | 'medium' | 'hard';
  marks: number;
  question_text: string;
  option_a?: string;
  option_b?: string;
  option_c?: string;
  option_d?: string;
  correct_option?: number;
  answer_text?: string;
  metadata_json?: string;
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

class DatabaseService {
  private static instance: DatabaseService;
  private questionCache: Map<string, QuestionRow[]> = new Map();
  private usedQuestionIds: Set<string> = new Set();
  private isNative = false;
  private isInitialized = false;

  private constructor() {
    this.isNative = Capacitor.isNativePlatform();
  }

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    if (this.isNative) {
      const success = await sqliteService.initialize({
        onError: (err) => console.error('[DB] Init error:', err),
      });
      if (!success) {
        console.warn('[DB] SQLite init failed, falling back to JSON');
        this.isNative = false;
      }
    }

    this.isInitialized = true;
    console.log(`[DB] Initialized (${this.isNative ? 'SQLite' : 'JSON fallback'})`);
    return true;
  }

  private async loadQuestionsFromJSON(classId: string, subjectId: string): Promise<QuestionRow[]> {
    const cacheKey = `${classId}_${subjectId}`;

    if (this.questionCache.has(cacheKey)) {
      return this.questionCache.get(cacheKey)!;
    }

    try {
      const module = await import(`@/data/questions/${classId}/${subjectId.toLowerCase()}.json`);
      const data = module.default;

      const questions: QuestionRow[] = [];

      data.chapters.forEach((chapter: any) => {
        const chapterId = chapter.id;

        chapter.mcqs?.forEach((q: any) => {
          questions.push({
            id: q.id,
            class_id: classId,
            subject_id: `${classId}_${subjectId.toLowerCase()}`,
            chapter_id: chapterId,
            type: 'mcq',
            difficulty: q.difficulty || 'medium',
            marks: q.marks || 1,
            question_text: q.questionText,
            option_a: q.options?.[0],
            option_b: q.options?.[1],
            option_c: q.options?.[2],
            option_d: q.options?.[3],
            correct_option: q.correctOption,
          });
        });

        chapter.shortQuestions?.forEach((q: any) => {
          questions.push({
            id: q.id,
            class_id: classId,
            subject_id: `${classId}_${subjectId.toLowerCase()}`,
            chapter_id: chapterId,
            type: 'short',
            difficulty: q.difficulty || 'medium',
            marks: q.marks || 2,
            question_text: q.questionText,
            answer_text: q.answer,
          });
        });

        chapter.longQuestions?.forEach((q: any) => {
          questions.push({
            id: q.id,
            class_id: classId,
            subject_id: `${classId}_${subjectId.toLowerCase()}`,
            chapter_id: chapterId,
            type: 'long',
            difficulty: q.difficulty || 'medium',
            marks: q.marks || 9,
            question_text: q.questionText,
            answer_text: q.answer,
          });
        });
      });

      this.questionCache.set(cacheKey, questions);
      return questions;
    } catch (error) {
      console.error(`[DB] Failed to load JSON for ${classId}/${subjectId}:`, error);
      return [];
    }
  }

  private async loadQuestionsFromSQLite(
    classId: string,
    subjectId: string,
    chapterIds: string[],
    type?: 'mcq' | 'short' | 'long'
  ): Promise<QuestionRow[]> {
    const subjectIdFull = `${classId}_${subjectId.toLowerCase()}`;
    
    let sql = `SELECT * FROM questions WHERE class_id = ? AND subject_id = ?`;
    const params: any[] = [classId, subjectIdFull];

    if (chapterIds.length > 0) {
      const placeholders = chapterIds.map(() => '?').join(',');
      sql += ` AND chapter_id IN (${placeholders})`;
      params.push(...chapterIds);
    }

    if (type) {
      sql += ` AND type = ?`;
      params.push(type);
    }

    return await sqliteService.query<QuestionRow>(sql, params);
  }

  async getQuestionsForPaper(config: PaperConfig): Promise<{
    mcqs: QuestionRow[];
    shorts: QuestionRow[];
    longs: QuestionRow[];
    totalMarks: number;
  }> {
    await this.initialize();

    const startTime = performance.now();

    let availableQuestions: QuestionRow[];

    if (this.isNative) {
      availableQuestions = await this.loadQuestionsFromSQLite(
        config.classId,
        config.subjectId,
        config.chapterIds
      );
    } else {
      availableQuestions = await this.loadQuestionsFromJSON(config.classId, config.subjectId);
      availableQuestions = availableQuestions.filter(q =>
        config.chapterIds.includes(q.chapter_id)
      );
    }

    if (config.difficulty) {
      availableQuestions = availableQuestions.filter(q => q.difficulty === config.difficulty);
    }

    if (config.excludeIds && config.excludeIds.length > 0) {
      availableQuestions = availableQuestions.filter(q => !config.excludeIds!.includes(q.id));
    }

    availableQuestions = availableQuestions.filter(q => !this.usedQuestionIds.has(q.id));

    const random = config.seed ? seededRandom(config.seed) : Math.random;
    const shuffled = [...availableQuestions].sort(() => random() - 0.5);

    const mcqs: QuestionRow[] = [];
    const shorts: QuestionRow[] = [];
    const longs: QuestionRow[] = [];

    const mcqPool = shuffled.filter(q => q.type === 'mcq');
    for (let i = 0; i < Math.min(config.mcqCount, mcqPool.length); i++) {
      mcqs.push(mcqPool[i]);
      this.usedQuestionIds.add(mcqPool[i].id);
    }

    const shortPool = shuffled.filter(q => q.type === 'short');
    for (let i = 0; i < Math.min(config.shortCount, shortPool.length); i++) {
      shorts.push(shortPool[i]);
      this.usedQuestionIds.add(shortPool[i].id);
    }

    const longPool = shuffled.filter(q => q.type === 'long');
    for (let i = 0; i < Math.min(config.longCount, longPool.length); i++) {
      longs.push(longPool[i]);
      this.usedQuestionIds.add(longPool[i].id);
    }

    const totalMarks =
      mcqs.reduce((sum, q) => sum + q.marks, 0) +
      shorts.reduce((sum, q) => sum + q.marks, 0) +
      longs.reduce((sum, q) => sum + q.marks, 0);

    const endTime = performance.now();
    console.log(`[DB] Questions selected in ${(endTime - startTime).toFixed(2)}ms`);
    console.log(`[DB] MCQs: ${mcqs.length}, Shorts: ${shorts.length}, Longs: ${longs.length}`);
    console.log(`[DB] Total Marks: ${totalMarks}`);

    return { mcqs, shorts, longs, totalMarks };
  }

  async validateQuestionAvailability(config: PaperConfig): Promise<{
    valid: boolean;
    available: { mcq: number; short: number; long: number };
    required: { mcq: number; short: number; long: number };
  }> {
    await this.initialize();

    let allQuestions: QuestionRow[];

    if (this.isNative) {
      allQuestions = await this.loadQuestionsFromSQLite(
        config.classId,
        config.subjectId,
        config.chapterIds
      );
    } else {
      allQuestions = await this.loadQuestionsFromJSON(config.classId, config.subjectId);
      allQuestions = allQuestions.filter(q => config.chapterIds.includes(q.chapter_id));
    }

    const availableQuestions = allQuestions.filter(
      q => !this.usedQuestionIds.has(q.id) && !(config.excludeIds?.includes(q.id))
    );

    const available = {
      mcq: availableQuestions.filter(q => q.type === 'mcq').length,
      short: availableQuestions.filter(q => q.type === 'short').length,
      long: availableQuestions.filter(q => q.type === 'long').length,
    };

    const required = {
      mcq: config.mcqCount,
      short: config.shortCount,
      long: config.longCount,
    };

    const valid =
      available.mcq >= required.mcq &&
      available.short >= required.short &&
      available.long >= required.long;

    return { valid, available, required };
  }

  clearUsedQuestions(): void {
    this.usedQuestionIds.clear();
    console.log('[DB] Cleared used question cache');
  }

  async getChapterStats(classId: string, subjectId: string): Promise<Map<string, {
    mcq: number;
    short: number;
    long: number;
  }>> {
    await this.initialize();

    let questions: QuestionRow[];

    if (this.isNative) {
      questions = await this.loadQuestionsFromSQLite(classId, subjectId, []);
    } else {
      questions = await this.loadQuestionsFromJSON(classId, subjectId);
    }

    const stats = new Map<string, { mcq: number; short: number; long: number }>();

    questions.forEach(q => {
      if (!stats.has(q.chapter_id)) {
        stats.set(q.chapter_id, { mcq: 0, short: 0, long: 0 });
      }
      const chapterStats = stats.get(q.chapter_id)!;
      if (q.type === 'mcq') chapterStats.mcq++;
      else if (q.type === 'short') chapterStats.short++;
      else if (q.type === 'long') chapterStats.long++;
    });

    return stats;
  }

  isUsingSQLite(): boolean {
    return this.isNative && this.isInitialized;
  }
}

export const db = DatabaseService.getInstance();
export { DatabaseService };
export type { Question, Paper, PaperConfig };
