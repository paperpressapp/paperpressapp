/**
 * JSON to SQLite Migration Script
 * 
 * Converts PaperPress JSON question bank to SQLite database.
 */

import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = path.join(process.cwd(), 'src', 'data', 'questions');
const OUTPUT_FILE = path.join(process.cwd(), 'src', 'lib', 'db', 'paperpress.db.sql');

const CLASSES = ['9th', '10th', '11th', '12th'];
const SUBJECTS = ['english', 'mathematics', 'physics', 'chemistry', 'biology', 'computer'];

const stats = {
  totalQuestions: 0,
  totalChapters: 0,
  byClass: {} as Record<string, number>,
  bySubject: {} as Record<string, number>,
  byType: { mcq: 0, short: 0, long: 0, essay: 0, grammar: 0, letter: 0, comprehension: 0 },
  errors: [] as string[],
};

function escapeSQL(str: string | undefined): string {
  if (!str) return '';
  return str.replace(/'/g, "''").replace(/\\/g, '\\\\').trim();
}

function detectQuestionType(q: any): string {
  if (q.options && Array.isArray(q.options)) return 'mcq';
  if (q.marks === 1 || q.marks === 2) return 'short';
  if (q.marks >= 5) return 'long';
  
  const text = (q.questionText || '').toLowerCase();
  if (text.includes('essay')) return 'essay';
  if (text.includes('letter')) return 'letter';
  if (text.includes('grammar') || text.includes('fill in the blanks')) return 'grammar';
  if (text.includes('comprehension')) return 'comprehension';
  
  return 'short';
}

function convertQuestionToSQL(q: any, classId: string, subjectId: string, chapterId: string): string | null {
  try {
    const type = detectQuestionType(q);
    const difficulty = q.difficulty || 'medium';
    const marks = q.marks || (type === 'mcq' ? 1 : type === 'long' ? 9 : 2);
    
    stats.totalQuestions++;
    stats.byClass[classId] = (stats.byClass[classId] || 0) + 1;
    stats.bySubject[subjectId] = (stats.bySubject[subjectId] || 0) + 1;
    stats.byType[type as keyof typeof stats.byType]++;
    
    const metadata = JSON.stringify({ originalId: q.id });
    
    if (type === 'mcq') {
      return `INSERT INTO questions (id, class_id, subject_id, chapter_id, type, difficulty, marks, question_text, option_a, option_b, option_c, option_d, correct_option, metadata_json) VALUES ('${escapeSQL(q.id)}', '${classId}', '${subjectId}', '${chapterId}', 'mcq', '${difficulty}', ${marks}, '${escapeSQL(q.questionText)}', '${escapeSQL(q.options?.[0])}', '${escapeSQL(q.options?.[1])}', '${escapeSQL(q.options?.[2])}', '${escapeSQL(q.options?.[3])}', ${q.correctOption ?? 0}, '${escapeSQL(metadata)}');`;
    } else {
      return `INSERT INTO questions (id, class_id, subject_id, chapter_id, type, difficulty, marks, question_text, answer_text, metadata_json) VALUES ('${escapeSQL(q.id)}', '${classId}', '${subjectId}', '${chapterId}', '${type}', '${difficulty}', ${marks}, '${escapeSQL(q.questionText)}', '${escapeSQL(q.answer)}', '${escapeSQL(metadata)}');`;
    }
  } catch (error) {
    stats.errors.push(`Error converting question ${q.id}: ${error}`);
    return null;
  }
}

function convertSubjectToSQL(classId: string, subjectFile: string): string {
  const filePath = path.join(DATA_DIR, classId, subjectFile);
  const subjectName = subjectFile.replace('.json', '');
  const subjectId = `${classId}_${subjectName}`;
  
  if (!fs.existsSync(filePath)) {
    stats.errors.push(`File not found: ${filePath}`);
    return '';
  }
  
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const sqlParts: string[] = [];
    
    sqlParts.push(`\n-- Subject: ${classId} ${subjectName}`);
    sqlParts.push(`INSERT OR IGNORE INTO subjects (id, class_id, name, code) VALUES ('${subjectId}', '${classId}', '${subjectName.charAt(0).toUpperCase() + subjectName.slice(1)}', '${subjectName.substring(0, 3).toUpperCase()}');`);
    
    data.chapters?.forEach((chapter: any) => {
      stats.totalChapters++;
      const chapterId = chapter.id || `${subjectId}_ch${chapter.number}`;
      
      sqlParts.push(`INSERT OR IGNORE INTO chapters (id, subject_id, name, chapter_number) VALUES ('${chapterId}', '${subjectId}', '${escapeSQL(chapter.name)}', ${chapter.number});`);
      
      chapter.mcqs?.forEach((q: any) => {
        const sql = convertQuestionToSQL(q, classId, subjectId, chapterId);
        if (sql) sqlParts.push(sql);
      });
      
      chapter.shortQuestions?.forEach((q: any) => {
        const sql = convertQuestionToSQL(q, classId, subjectId, chapterId);
        if (sql) sqlParts.push(sql);
      });
      
      chapter.longQuestions?.forEach((q: any) => {
        const sql = convertQuestionToSQL(q, classId, subjectId, chapterId);
        if (sql) sqlParts.push(sql);
      });
    });
    
    return sqlParts.join('\n');
  } catch (error) {
    stats.errors.push(`Error processing ${filePath}: ${error}`);
    return '';
  }
}

export function runMigration(): { success: boolean; sql: string; stats: typeof stats } {
  console.log('🚀 Starting JSON to SQLite Migration\n');
  console.log('=====================================\n');
  
  const sqlParts: string[] = [];
  
  const schemaPath = path.join(process.cwd(), 'src', 'lib', 'db', 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    sqlParts.push(fs.readFileSync(schemaPath, 'utf-8'));
    console.log('✅ Schema loaded');
  }
  
  sqlParts.push('\n-- MIGRATED DATA');
  
  CLASSES.forEach(classId => {
    SUBJECTS.forEach(subjectFile => {
      const sql = convertSubjectToSQL(classId, `${subjectFile}.json`);
      if (sql) {
        sqlParts.push(sql);
        console.log(`✅ Migrated: ${classId} ${subjectFile}`);
      }
    });
  });
  
  sqlParts.push(`\n-- Total Questions: ${stats.totalQuestions}`);
  sqlParts.push(`-- Total Chapters: ${stats.totalChapters}`);
  
  const fullSQL = sqlParts.join('\n');
  fs.writeFileSync(OUTPUT_FILE, fullSQL);
  
  console.log('\n=====================================');
  console.log('📊 MIGRATION STATISTICS');
  console.log('=====================================');
  console.log(`Total Questions: ${stats.totalQuestions}`);
  console.log(`Total Chapters: ${stats.totalChapters}`);
  console.log('By Class:', stats.byClass);
  console.log('By Subject:', stats.bySubject);
  console.log('By Type:', stats.byType);
  
  if (stats.errors.length > 0) {
    console.log('\n❌ ERRORS:');
    stats.errors.forEach(e => console.log(`  - ${e}`));
  }
  
  console.log(`\n✅ Output: ${OUTPUT_FILE}`);
  
  return {
    success: stats.errors.length === 0,
    sql: fullSQL,
    stats,
  };
}

// Run migration
runMigration();
