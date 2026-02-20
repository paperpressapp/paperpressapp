/**
 * Question Bank Migration Script
 * 
 * Converts JSON question files to SQLite database.
 * This should be run during build process to bundle the DB with the APK.
 */

import * as fs from 'fs';
import * as path from 'path';

const CLASSES = ['9th', '10th', '11th', '12th'];
const SUBJECTS = ['english', 'mathematics', 'physics', 'chemistry', 'biology', 'computer'];

interface JSONQuestion {
  id: string;
  questionText: string;
  options?: string[];
  correctOption?: number;
  answer?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  marks: number;
}

interface JSONChapter {
  id: string;
  number: number;
  name: string;
  mcqs: JSONQuestion[];
  shortQuestions: JSONQuestion[];
  longQuestions: JSONQuestion[];
}

interface JSONData {
  class: string;
  subject: string;
  chapters: JSONChapter[];
}

/**
 * Convert JSON question data to SQLite insert statements
 */
export function convertJSONToSQLite(className: string, subjectName: string): string {
  const jsonPath = path.join(process.cwd(), 'src', 'data', 'questions', className, `${subjectName}.json`);
  
  if (!fs.existsSync(jsonPath)) {
    console.warn(`File not found: ${jsonPath}`);
    return '';
  }
  
  const data: JSONData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  const inserts: string[] = [];
  
  // Convert subject name to proper case
  const subject = subjectName.charAt(0).toUpperCase() + subjectName.slice(1);
  
  data.chapters.forEach(chapter => {
    // Insert chapter metadata
    const totalMCQ = chapter.mcqs?.length || 0;
    const totalShort = chapter.shortQuestions?.length || 0;
    const totalLong = chapter.longQuestions?.length || 0;
    
    inserts.push(`
      INSERT OR REPLACE INTO chapters (id, class_id, subject, number, name, total_mcq, total_short, total_long)
      VALUES ('${chapter.id}', '${className}', '${subject}', ${chapter.number}, '${escapeSQL(chapter.name)}', ${totalMCQ}, ${totalShort}, ${totalLong});
    `);
    
    // Insert MCQs
    chapter.mcqs?.forEach(q => {
      inserts.push(`
        INSERT OR REPLACE INTO questions (id, class_id, subject, chapter_id, chapter_name, type, question_text, options, correct_option, difficulty, marks)
        VALUES ('${q.id}', '${className}', '${subject}', '${chapter.id}', '${escapeSQL(chapter.name)}', 'mcq', '${escapeSQL(q.questionText)}', '${escapeSQL(JSON.stringify(q.options || []))}', ${q.correctOption ?? 0}, '${q.difficulty}', ${q.marks});
      `);
    });
    
    // Insert short questions
    chapter.shortQuestions?.forEach(q => {
      inserts.push(`
        INSERT OR REPLACE INTO questions (id, class_id, subject, chapter_id, chapter_name, type, question_text, answer, difficulty, marks)
        VALUES ('${q.id}', '${className}', '${subject}', '${chapter.id}', '${escapeSQL(chapter.name)}', 'short', '${escapeSQL(q.questionText)}', '${escapeSQL(q.answer || '')}', '${q.difficulty}', ${q.marks});
      `);
    });
    
    // Insert long questions
    chapter.longQuestions?.forEach(q => {
      inserts.push(`
        INSERT OR REPLACE INTO questions (id, class_id, subject, chapter_id, chapter_name, type, question_text, answer, difficulty, marks)
        VALUES ('${q.id}', '${className}', '${subject}', '${chapter.id}', '${escapeSQL(chapter.name)}', 'long', '${escapeSQL(q.questionText)}', '${escapeSQL(q.answer || '')}', '${q.difficulty}', ${q.marks});
      `);
    });
  });
  
  return inserts.join('\n');
}

function escapeSQL(str: string): string {
  return str
    .replace(/'/g, "''")
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r');
}

/**
 * Generate full SQL file for all classes and subjects
 */
export function generateFullDatabase(): string {
  let sql = `
-- PaperPress Question Bank Database
-- Generated: ${new Date().toISOString()}
-- Total Classes: 4 (9th-12th)
-- Total Subjects: 6

`;
  
  sql += `PRAGMA foreign_keys = OFF;\n\n`;
  sql += `BEGIN TRANSACTION;\n\n`;
  
  let totalQuestions = 0;
  
  CLASSES.forEach(className => {
    SUBJECTS.forEach(subjectName => {
      const inserts = convertJSONToSQLite(className, subjectName);
      if (inserts) {
        sql += `-- ${className} ${subjectName}\n`;
        sql += inserts;
        sql += '\n';
        
        // Count questions
        const jsonPath = path.join(process.cwd(), 'src', 'data', 'questions', className, `${subjectName}.json`);
        if (fs.existsSync(jsonPath)) {
          const data: JSONData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
          data.chapters.forEach(ch => {
            totalQuestions += (ch.mcqs?.length || 0) + (ch.shortQuestions?.length || 0) + (ch.longQuestions?.length || 0);
          });
        }
      }
    });
  });
  
  sql += `\nCOMMIT;\n\n`;
  sql += `PRAGMA foreign_keys = ON;\n\n`;
  sql += `-- Total Questions: ${totalQuestions}\n`;
  
  return sql;
}

// If running directly
if (require.main === module) {
  const sql = generateFullDatabase();
  const outputPath = path.join(process.cwd(), 'src', 'lib', 'db', 'question_bank.sql');
  fs.writeFileSync(outputPath, sql);
  console.log(`✅ Generated SQL file: ${outputPath}`);
  
  // Count total
  const matches = sql.match(/INSERT OR REPLACE INTO questions/g);
  console.log(`📊 Total questions: ${matches?.length || 0}`);
}
