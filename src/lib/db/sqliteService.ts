/**
 * SQLite Service for PaperPress
 * 
 * Handles database initialization, queries, and data management.
 * Uses @capacitor-community/sqlite on native Android.
 * Falls back to JSON on web for development.
 */

import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import type { DBQuestion, DBChapter } from './schema';

const DB_NAME = 'paperpress_db';
const DB_VERSION = 1;

export interface SQLiteServiceConfig {
  onReady?: () => void;
  onError?: (error: Error) => void;
}

class SQLiteService {
  private sqlite: SQLiteConnection;
  private db: SQLiteDBConnection | null = null;
  private isInitialized = false;
  private isNative = false;

  constructor() {
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
    this.isNative = Capacitor.isNativePlatform();
  }

  /**
   * Initialize the database
   * On native: creates/opens SQLite database
   * On web: uses JSON fallback
   */
  async initialize(config?: SQLiteServiceConfig): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }

    try {
      if (this.isNative) {
        await this.initializeNative();
      } else {
        console.log('[SQLite] Running on web - using JSON fallback');
      }

      this.isInitialized = true;
      config?.onReady?.();
      return true;
    } catch (error) {
      console.error('[SQLite] Initialization failed:', error);
      config?.onError?.(error as Error);
      return false;
    }
  }

  /**
   * Initialize native SQLite database
   */
  private async initializeNative(): Promise<void> {
    console.log('[SQLite] Initializing native database...');

    try {
      const ret = await this.sqlite.checkConnectionsConsistency();
      const isConn = (await this.sqlite.isConnection(DB_NAME, false)).result;

      if (ret.result && isConn) {
        this.db = await this.sqlite.retrieveConnection(DB_NAME, false);
      } else {
        this.db = await this.sqlite.createConnection(
          DB_NAME,
          false,
          'no-encryption',
          DB_VERSION,
          false
        );
      }

      await this.db.open();
      console.log('[SQLite] Database opened successfully');

      await this.initializeSchema();
    } catch (error) {
      console.error('[SQLite] Native initialization error:', error);
      throw error;
    }
  }

  /**
   * Initialize database schema and seed data if needed
   */
  private async initializeSchema(): Promise<void> {
    if (!this.db) return;

    const tableCheck = await this.db.query(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='questions'"
    );

    if (!tableCheck.values || tableCheck.values.length === 0) {
      console.log('[SQLite] Creating schema and seeding data...');
      await this.seedDatabase();
    } else {
      console.log('[SQLite] Schema already exists');
    }
  }

  /**
   * Seed database with initial data
   */
  private async seedDatabase(): Promise<void> {
    if (!this.db) return;

    console.log('[SQLite] Seeding database from JSON...');

    const schemaStatements = this.getSchemaSQL();
    
    for (const statement of schemaStatements) {
      if (statement.trim()) {
        try {
          await this.db.execute(statement);
        } catch (error) {
          console.warn('[SQLite] Schema statement failed:', statement.substring(0, 50), error);
        }
      }
    }

    await this.seedQuestionsFromJSON();

    console.log('[SQLite] Database seeded successfully');
  }

  /**
   * Seed questions from JSON files
   */
  private async seedQuestionsFromJSON(): Promise<void> {
    if (!this.db) return;

    const CLASSES = ['9th', '10th', '11th', '12th'];
    const SUBJECTS = ['english', 'mathematics', 'physics', 'chemistry', 'biology', 'computer'];
    
    let totalInserted = 0;

    for (const classId of CLASSES) {
      for (const subject of SUBJECTS) {
        try {
          const module = await import(`@/data/questions/${classId}/${subject}.json`);
          const data = module.default;
          const subjectId = `${classId}_${subject}`;

          await this.db.run(
            `INSERT OR IGNORE INTO subjects (id, class_id, name) VALUES (?, ?, ?)`,
            [subjectId, classId, data.subject || subject]
          );

          for (const chapter of data.chapters) {
            const chapterId = chapter.id;

            await this.db.run(
              `INSERT OR IGNORE INTO chapters (id, subject_id, name, chapter_number) VALUES (?, ?, ?, ?)`,
              [chapterId, subjectId, chapter.name, chapter.number || 0]
            );

            if (chapter.mcqs) {
              for (const mcq of chapter.mcqs) {
                await this.db.run(
                  `INSERT OR IGNORE INTO questions (id, class_id, subject_id, chapter_id, type, difficulty, marks, question_text, option_a, option_b, option_c, option_d, correct_option) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                  [mcq.id, classId, subjectId, chapterId, 'mcq', mcq.difficulty || 'medium', mcq.marks || 1, mcq.questionText, mcq.options?.[0] || '', mcq.options?.[1] || '', mcq.options?.[2] || '', mcq.options?.[3] || '', mcq.correctOption ?? 0]
                );
                totalInserted++;
              }
            }

            if (chapter.shortQuestions) {
              for (const short of chapter.shortQuestions) {
                await this.db.run(
                  `INSERT OR IGNORE INTO questions (id, class_id, subject_id, chapter_id, type, difficulty, marks, question_text, answer_text) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                  [short.id, classId, subjectId, chapterId, 'short', short.difficulty || 'medium', short.marks || 2, short.questionText, short.answer || '']
                );
                totalInserted++;
              }
            }

            if (chapter.longQuestions) {
              for (const long of chapter.longQuestions) {
                await this.db.run(
                  `INSERT OR IGNORE INTO questions (id, class_id, subject_id, chapter_id, type, difficulty, marks, question_text, answer_text) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                  [long.id, classId, subjectId, chapterId, 'long', long.difficulty || 'medium', long.marks || 9, long.questionText, long.answer || '']
                );
                totalInserted++;
              }
            }
          }
        } catch (error) {
          console.warn(`[SQLite] Failed to seed ${classId}/${subject}:`, error);
        }
      }
    }

    console.log(`[SQLite] Inserted ${totalInserted} questions from JSON`);
  }

  /**
   * Get seed SQL statements
   */
  private getSchemaSQL(): string[] {
    return [
      `CREATE TABLE IF NOT EXISTS classes (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        display_order INTEGER DEFAULT 0
      )`,
      `INSERT OR IGNORE INTO classes (id, name, display_order) VALUES 
        ('9th', '9th Class', 1),
        ('10th', '10th Class', 2),
        ('11th', '11th Class', 3),
        ('12th', '12th Class', 4)`,
      `CREATE TABLE IF NOT EXISTS subjects (
        id TEXT PRIMARY KEY,
        class_id TEXT NOT NULL,
        name TEXT NOT NULL,
        code TEXT UNIQUE,
        display_order INTEGER DEFAULT 0,
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
      )`,
      `CREATE INDEX IF NOT EXISTS idx_subjects_class ON subjects(class_id)`,
      `CREATE TABLE IF NOT EXISTS chapters (
        id TEXT PRIMARY KEY,
        subject_id TEXT NOT NULL,
        name TEXT NOT NULL,
        chapter_number INTEGER,
        total_mcq INTEGER DEFAULT 0,
        total_short INTEGER DEFAULT 0,
        total_long INTEGER DEFAULT 0,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
      )`,
      `CREATE INDEX IF NOT EXISTS idx_chapters_subject ON chapters(subject_id)`,
      `CREATE TABLE IF NOT EXISTS questions (
        id TEXT PRIMARY KEY,
        class_id TEXT NOT NULL,
        subject_id TEXT NOT NULL,
        chapter_id TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('mcq', 'short', 'long', 'essay', 'grammar', 'letter', 'comprehension')),
        difficulty TEXT CHECK(difficulty IN ('easy', 'medium', 'hard')),
        marks INTEGER NOT NULL DEFAULT 1,
        question_text TEXT NOT NULL,
        option_a TEXT,
        option_b TEXT,
        option_c TEXT,
        option_d TEXT,
        correct_option INTEGER CHECK(correct_option BETWEEN 0 AND 3),
        answer_text TEXT,
        metadata_json TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER DEFAULT (strftime('%s', 'now')),
        usage_count INTEGER DEFAULT 0,
        last_used_at INTEGER,
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
        FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
      )`,
      `CREATE INDEX IF NOT EXISTS idx_questions_class ON questions(class_id)`,
      `CREATE INDEX IF NOT EXISTS idx_questions_subject ON questions(subject_id)`,
      `CREATE INDEX IF NOT EXISTS idx_questions_chapter ON questions(chapter_id)`,
      `CREATE INDEX IF NOT EXISTS idx_questions_type ON questions(type)`,
      `CREATE INDEX IF NOT EXISTS idx_questions_filter ON questions(class_id, subject_id, chapter_id, type)`,
      `CREATE TABLE IF NOT EXISTS papers (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        class_id TEXT NOT NULL,
        subject_id TEXT NOT NULL,
        exam_type TEXT NOT NULL,
        date TEXT NOT NULL,
        time_allowed TEXT NOT NULL,
        total_marks INTEGER NOT NULL,
        question_count INTEGER NOT NULL,
        mcq_ids TEXT NOT NULL,
        short_ids TEXT NOT NULL,
        long_ids TEXT NOT NULL,
        settings_json TEXT,
        pdf_path TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        generated_count INTEGER DEFAULT 1,
        FOREIGN KEY (class_id) REFERENCES classes(id),
        FOREIGN KEY (subject_id) REFERENCES subjects(id)
      )`,
      `CREATE INDEX IF NOT EXISTS idx_papers_created ON papers(created_at DESC)`,
      `CREATE TABLE IF NOT EXISTS paper_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        paper_id TEXT NOT NULL,
        question_id TEXT NOT NULL,
        used_at INTEGER DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY (paper_id) REFERENCES papers(id) ON DELETE CASCADE,
        FOREIGN KEY (question_id) REFERENCES questions(id)
      )`,
      `CREATE INDEX IF NOT EXISTS idx_history_question ON paper_history(question_id)`,
    ];
  }

  /**
   * Execute a query on the database
   */
  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    if (!this.isNative || !this.db) {
      throw new Error('Database not initialized or not on native platform');
    }

    try {
      const result = await this.db.query(sql, params);
      return (result.values || []) as T[];
    } catch (error) {
      console.error('[SQLite] Query error:', sql, error);
      throw error;
    }
  }

  /**
   * Execute a statement (INSERT, UPDATE, DELETE)
   */
  async execute(sql: string, params: any[] = []): Promise<void> {
    if (!this.isNative || !this.db) {
      throw new Error('Database not initialized or not on native platform');
    }

    try {
      await this.db.run(sql, params);
    } catch (error) {
      console.error('[SQLite] Execute error:', sql, error);
      throw error;
    }
  }

  /**
   * Check if running on native platform
   */
  isNativePlatform(): boolean {
    return this.isNative;
  }

  /**
   * Check if database is initialized
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    if (this.db && this.isNative) {
      try {
        await this.sqlite.closeConnection(DB_NAME, false);
        this.db = null;
        this.isInitialized = false;
        console.log('[SQLite] Database closed');
      } catch (error) {
        console.error('[SQLite] Close error:', error);
      }
    }
  }
}

export const sqliteService = new SQLiteService();
export default sqliteService;
