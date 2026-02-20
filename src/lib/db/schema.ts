/**
 * SQLite Database Schema for PaperPress
 * 
 * This defines the database structure for storing:
 * - All 13,800+ questions
 * - User papers
 * - User settings
 * - Premium status
 */

export const DATABASE_SCHEMA = `
-- Questions table (13,800+ rows)
CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  class_id TEXT NOT NULL,
  subject TEXT NOT NULL,
  chapter_id TEXT NOT NULL,
  chapter_name TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('mcq', 'short', 'long')),
  question_text TEXT NOT NULL,
  options TEXT, -- JSON array for MCQs
  correct_option INTEGER, -- For MCQs
  answer TEXT, -- For short/long questions
  difficulty TEXT CHECK(difficulty IN ('easy', 'medium', 'hard')),
  marks INTEGER NOT NULL,
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Chapters metadata
CREATE TABLE IF NOT EXISTS chapters (
  id TEXT PRIMARY KEY,
  class_id TEXT NOT NULL,
  subject TEXT NOT NULL,
  number INTEGER NOT NULL,
  name TEXT NOT NULL,
  total_mcq INTEGER DEFAULT 0,
  total_short INTEGER DEFAULT 0,
  total_long INTEGER DEFAULT 0
);

-- User generated papers
CREATE TABLE IF NOT EXISTS papers (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  class_id TEXT NOT NULL,
  subject TEXT NOT NULL,
  exam_type TEXT NOT NULL,
  date TEXT NOT NULL,
  time_allowed TEXT NOT NULL,
  total_marks INTEGER NOT NULL,
  question_count INTEGER NOT NULL,
  mcq_ids TEXT NOT NULL, -- JSON array
  short_ids TEXT NOT NULL, -- JSON array
  long_ids TEXT NOT NULL, -- JSON array
  settings TEXT NOT NULL, -- JSON object
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_questions_class_subject 
  ON questions(class_id, subject);

CREATE INDEX IF NOT EXISTS idx_questions_chapter 
  ON questions(chapter_id);

CREATE INDEX IF NOT EXISTS idx_questions_type 
  ON questions(type);

CREATE INDEX IF NOT EXISTS idx_questions_difficulty 
  ON questions(difficulty);

CREATE INDEX IF NOT EXISTS idx_chapters_class_subject 
  ON chapters(class_id, subject);

CREATE INDEX IF NOT EXISTS idx_papers_created 
  ON papers(created_at DESC);
`;

/**
 * Question type definitions
 */
export interface DBQuestion {
  id: string;
  class_id: '9th' | '10th' | '11th' | '12th';
  subject: 'English' | 'Mathematics' | 'Physics' | 'Chemistry' | 'Biology' | 'Computer';
  chapter_id: string;
  chapter_name: string;
  type: 'mcq' | 'short' | 'long';
  question_text: string;
  options?: string[]; // For MCQs
  correct_option?: number; // For MCQs
  answer?: string; // For short/long
  difficulty: 'easy' | 'medium' | 'hard';
  marks: number;
  created_at: number;
}

export interface DBChapter {
  id: string;
  class_id: string;
  subject: string;
  number: number;
  name: string;
  total_mcq: number;
  total_short: number;
  total_long: number;
}

export interface DBPaper {
  id: string;
  title: string;
  class_id: string;
  subject: string;
  exam_type: string;
  date: string;
  time_allowed: string;
  total_marks: number;
  question_count: number;
  mcq_ids: string[];
  short_ids: string[];
  long_ids: string[];
  settings: Record<string, any>;
  created_at: number;
}

/**
 * Sample query to get questions for a paper
 */
export const GET_QUESTIONS_FOR_PAPER = `
  SELECT * FROM questions 
  WHERE class_id = ? 
    AND subject = ? 
    AND chapter_id IN (?) 
    AND type = ?
  ORDER BY RANDOM()
  LIMIT ?
`;

/**
 * Sample query to get chapter stats
 */
export const GET_CHAPTER_STATS = `
  SELECT 
    chapter_id,
    COUNT(CASE WHEN type = 'mcq' THEN 1 END) as mcq_count,
    COUNT(CASE WHEN type = 'short' THEN 1 END) as short_count,
    COUNT(CASE WHEN type = 'long' THEN 1 END) as long_count
  FROM questions 
  WHERE class_id = ? AND subject = ?
  GROUP BY chapter_id
`;
