-- PaperPress Database Schema
-- Professional Exam Paper Generation Engine
-- Created: 2024
-- Objective: Replace JSON with structured SQLite architecture

-- Enable foreign key support
PRAGMA foreign_keys = ON;

-- ============================================
-- TABLE: classes
-- ============================================
CREATE TABLE IF NOT EXISTS classes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    display_order INTEGER DEFAULT 0
);

-- Insert classes
INSERT OR IGNORE INTO classes (id, name, display_order) VALUES 
    ('9th', '9th Class', 1),
    ('10th', '10th Class', 2),
    ('11th', '11th Class', 3),
    ('12th', '12th Class', 4);

-- ============================================
-- TABLE: subjects
-- ============================================
CREATE TABLE IF NOT EXISTS subjects (
    id TEXT PRIMARY KEY,
    class_id TEXT NOT NULL,
    name TEXT NOT NULL,
    code TEXT UNIQUE,
    display_order INTEGER DEFAULT 0,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
);

-- Index for subject queries
CREATE INDEX IF NOT EXISTS idx_subjects_class ON subjects(class_id);

-- ============================================
-- TABLE: chapters
-- ============================================
CREATE TABLE IF NOT EXISTS chapters (
    id TEXT PRIMARY KEY,
    subject_id TEXT NOT NULL,
    name TEXT NOT NULL,
    chapter_number INTEGER,
    total_mcq INTEGER DEFAULT 0,
    total_short INTEGER DEFAULT 0,
    total_long INTEGER DEFAULT 0,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);

-- Indexes for chapter queries
CREATE INDEX IF NOT EXISTS idx_chapters_subject ON chapters(subject_id);
CREATE INDEX IF NOT EXISTS idx_chapters_number ON chapters(chapter_number);

-- ============================================
-- TABLE: questions
-- Core table for all question types
-- ============================================
CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY,
    class_id TEXT NOT NULL,
    subject_id TEXT NOT NULL,
    chapter_id TEXT NOT NULL,
    
    -- Question classification
    type TEXT NOT NULL CHECK(type IN ('mcq', 'short', 'long', 'essay', 'grammar', 'letter', 'comprehension')),
    difficulty TEXT CHECK(difficulty IN ('easy', 'medium', 'hard')),
    marks INTEGER NOT NULL DEFAULT 1,
    
    -- Question content
    question_text TEXT NOT NULL,
    
    -- MCQ options (flattened for performance)
    option_a TEXT,
    option_b TEXT,
    option_c TEXT,
    option_d TEXT,
    correct_option INTEGER CHECK(correct_option BETWEEN 0 AND 3),
    
    -- Answer for short/long questions
    answer_text TEXT,
    
    -- Extended metadata as JSON
    metadata_json TEXT,
    
    -- Tracking
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now')),
    usage_count INTEGER DEFAULT 0,
    last_used_at INTEGER,
    
    -- Foreign keys
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
);

-- Critical indexes for query performance
CREATE INDEX IF NOT EXISTS idx_questions_class ON questions(class_id);
CREATE INDEX IF NOT EXISTS idx_questions_subject ON questions(subject_id);
CREATE INDEX IF NOT EXISTS idx_questions_chapter ON questions(chapter_id);
CREATE INDEX IF NOT EXISTS idx_questions_type ON questions(type);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_marks ON questions(marks);

-- Composite index for paper generation queries
CREATE INDEX IF NOT EXISTS idx_questions_filter ON questions(class_id, subject_id, chapter_id, type);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty_filter ON questions(class_id, subject_id, type, difficulty);

-- ============================================
-- TABLE: papers
-- Stores generated papers
-- ============================================
CREATE TABLE IF NOT EXISTS papers (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    
    -- Paper metadata
    class_id TEXT NOT NULL,
    subject_id TEXT NOT NULL,
    exam_type TEXT NOT NULL,
    
    -- Paper settings
    date TEXT NOT NULL,
    time_allowed TEXT NOT NULL,
    total_marks INTEGER NOT NULL,
    question_count INTEGER NOT NULL,
    
    -- Question IDs (JSON arrays)
    mcq_ids TEXT NOT NULL,      -- ["id1", "id2", ...]
    short_ids TEXT NOT NULL,    -- ["id1", "id2", ...]
    long_ids TEXT NOT NULL,     -- ["id1", "id2", ...]
    
    -- Settings JSON
    settings_json TEXT,
    
    -- PDF output
    pdf_path TEXT,
    
    -- Tracking
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    generated_count INTEGER DEFAULT 1,
    
    FOREIGN KEY (class_id) REFERENCES classes(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id)
);

-- Indexes for paper queries
CREATE INDEX IF NOT EXISTS idx_papers_class ON papers(class_id);
CREATE INDEX IF NOT EXISTS idx_papers_subject ON papers(subject_id);
CREATE INDEX IF NOT EXISTS idx_papers_created ON papers(created_at DESC);

-- ============================================
-- TABLE: paper_history
-- Tracks paper generation to avoid repeats
-- ============================================
CREATE TABLE IF NOT EXISTS paper_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    paper_id TEXT NOT NULL,
    question_id TEXT NOT NULL,
    used_at INTEGER DEFAULT (strftime('%s', 'now')),
    
    FOREIGN KEY (paper_id) REFERENCES papers(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id)
);

-- Index for duplicate prevention
CREATE INDEX IF NOT EXISTS idx_history_paper ON paper_history(paper_id);
CREATE INDEX IF NOT EXISTS idx_history_question ON paper_history(question_id);
CREATE INDEX IF NOT EXISTS idx_history_recent ON paper_history(used_at DESC);

-- ============================================
-- TABLE: user_settings
-- ============================================
CREATE TABLE IF NOT EXISTS user_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- ============================================
-- VIEWS for common queries
-- ============================================

-- View: Chapter statistics
CREATE VIEW IF NOT EXISTS v_chapter_stats AS
SELECT 
    c.id as chapter_id,
    c.name as chapter_name,
    c.subject_id,
    COUNT(CASE WHEN q.type = 'mcq' THEN 1 END) as mcq_count,
    COUNT(CASE WHEN q.type = 'short' THEN 1 END) as short_count,
    COUNT(CASE WHEN q.type = 'long' THEN 1 END) as long_count,
    COUNT(CASE WHEN q.type = 'essay' THEN 1 END) as essay_count,
    COUNT(CASE WHEN q.type = 'grammar' THEN 1 END) as grammar_count,
    COUNT(*) as total_questions
FROM chapters c
LEFT JOIN questions q ON c.id = q.chapter_id
GROUP BY c.id, c.name, c.subject_id;

-- View: Question bank overview
CREATE VIEW IF NOT EXISTS v_question_overview AS
SELECT 
    cl.name as class_name,
    s.name as subject_name,
    COUNT(*) as total_questions,
    COUNT(CASE WHEN q.type = 'mcq' THEN 1 END) as mcq_count,
    COUNT(CASE WHEN q.type = 'short' THEN 1 END) as short_count,
    COUNT(CASE WHEN q.type = 'long' THEN 1 END) as long_count,
    COUNT(CASE WHEN q.difficulty = 'easy' THEN 1 END) as easy_count,
    COUNT(CASE WHEN q.difficulty = 'medium' THEN 1 END) as medium_count,
    COUNT(CASE WHEN q.difficulty = 'hard' THEN 1 END) as hard_count
FROM questions q
JOIN classes cl ON q.class_id = cl.id
JOIN subjects s ON q.subject_id = s.id
GROUP BY cl.name, s.name;

-- ============================================
-- TRIGGERS for automatic updates
-- ============================================

-- Trigger: Update question usage count
CREATE TRIGGER IF NOT EXISTS trg_question_used
AFTER INSERT ON paper_history
BEGIN
    UPDATE questions 
    SET usage_count = usage_count + 1,
        last_used_at = NEW.used_at
    WHERE id = NEW.question_id;
END;

-- Trigger: Update chapter totals
CREATE TRIGGER IF NOT EXISTS trg_chapter_totals
AFTER INSERT ON questions
BEGIN
    UPDATE chapters 
    SET total_mcq = (SELECT COUNT(*) FROM questions WHERE chapter_id = NEW.chapter_id AND type = 'mcq'),
        total_short = (SELECT COUNT(*) FROM questions WHERE chapter_id = NEW.chapter_id AND type = 'short'),
        total_long = (SELECT COUNT(*) FROM questions WHERE chapter_id = NEW.chapter_id AND type = 'long')
    WHERE id = NEW.chapter_id;
END;

-- ============================================
-- OPTIMIZATION settings
-- ============================================

-- Enable WAL mode for better performance
PRAGMA journal_mode = WAL;

-- Set cache size (50MB)
PRAGMA cache_size = -50000;

-- Enable memory-mapped I/O
PRAGMA mmap_size = 268435456;

-- Optimize for query speed
PRAGMA synchronous = NORMAL;

-- Analyze for query planner
ANALYZE;
