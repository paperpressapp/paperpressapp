/**
 * Database Seed Generator
 * 
 * This script generates SQL INSERT statements from JSON question files.
 * Run during development to create the seed SQL for the APK.
 * 
 * Usage: npx ts-node src/lib/db/generate-seed.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface MCQ {
  id: string;
  questionText: string;
  options: string[];
  correctOption: number;
  difficulty?: string;
  marks?: number;
}

interface ShortQuestion {
  id: string;
  questionText: string;
  answer: string;
  difficulty?: string;
  marks?: number;
}

interface LongQuestion {
  id: string;
  questionText: string;
  answer: string;
  difficulty?: string;
  marks?: number;
}

interface Chapter {
  id: string;
  name: string;
  number: number;
  mcqs?: MCQ[];
  shortQuestions?: ShortQuestion[];
  longQuestions?: LongQuestion[];
}

interface SubjectData {
  subject: string;
  chapters: Chapter[];
}

const CLASSES = ['9th', '10th', '11th', '12th'];
const SUBJECTS = ['english', 'mathematics', 'physics', 'chemistry', 'biology', 'computer'];

function escapeSql(str: string): string {
  if (!str) return '';
  return str.replace(/'/g, "''").replace(/\n/g, ' ').replace(/\r/g, '');
}

function generateSubjectId(classId: string, subject: string): string {
  return `${classId.toLowerCase()}_${subject.toLowerCase()}`;
}

function generateChapterId(classId: string, subject: string, chapterNumber: number): string {
  return `${classId.toLowerCase()}_${subject.toLowerCase()}_ch${chapterNumber}`;
}

async function generateSeedSQL(): Promise<string> {
  const statements: string[] = [];
  const questionsDir = path.join(process.cwd(), 'src', 'data', 'questions');

  statements.push('-- PaperPress Database Seed Data');
  statements.push(`-- Generated: ${new Date().toISOString()}`);
  statements.push('-- Total questions: Loading...\n');

  let totalQuestions = 0;
  const subjectsInserts: string[] = [];
  const chaptersInserts: string[] = [];
  const questionsInserts: string[] = [];

  for (const classId of CLASSES) {
    for (const subject of SUBJECTS) {
      const filePath = path.join(questionsDir, classId, `${subject}.json`);

      if (!fs.existsSync(filePath)) {
        console.log(`Skipping: ${filePath} (not found)`);
        continue;
      }

      console.log(`Processing: ${classId}/${subject}`);
      const data: SubjectData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const subjectId = generateSubjectId(classId, subject);

      subjectsInserts.push(
        `INSERT OR IGNORE INTO subjects (id, class_id, name) VALUES ('${subjectId}', '${classId}', '${escapeSql(data.subject || subject)}');`
      );

      for (const chapter of data.chapters) {
        const chapterId = chapter.id || generateChapterId(classId, subject, chapter.number);

        chaptersInserts.push(
          `INSERT OR IGNORE INTO chapters (id, subject_id, name, chapter_number) VALUES ('${chapterId}', '${subjectId}', '${escapeSql(chapter.name)}', ${chapter.number || 0});`
        );

        if (chapter.mcqs) {
          for (const mcq of chapter.mcqs) {
            totalQuestions++;
            questionsInserts.push(
              `INSERT OR IGNORE INTO questions (id, class_id, subject_id, chapter_id, type, difficulty, marks, question_text, option_a, option_b, option_c, option_d, correct_option) VALUES ('${mcq.id}', '${classId}', '${subjectId}', '${chapterId}', 'mcq', '${mcq.difficulty || 'medium'}', ${mcq.marks || 1}, '${escapeSql(mcq.questionText)}', '${escapeSql(mcq.options?.[0] || '')}', '${escapeSql(mcq.options?.[1] || '')}', '${escapeSql(mcq.options?.[2] || '')}', '${escapeSql(mcq.options?.[3] || '')}', ${mcq.correctOption ?? 0});`
            );
          }
        }

        if (chapter.shortQuestions) {
          for (const short of chapter.shortQuestions) {
            totalQuestions++;
            questionsInserts.push(
              `INSERT OR IGNORE INTO questions (id, class_id, subject_id, chapter_id, type, difficulty, marks, question_text, answer_text) VALUES ('${short.id}', '${classId}', '${subjectId}', '${chapterId}', 'short', '${short.difficulty || 'medium'}', ${short.marks || 2}, '${escapeSql(short.questionText)}', '${escapeSql(short.answer || '')}');`
            );
          }
        }

        if (chapter.longQuestions) {
          for (const long of chapter.longQuestions) {
            totalQuestions++;
            questionsInserts.push(
              `INSERT OR IGNORE INTO questions (id, class_id, subject_id, chapter_id, type, difficulty, marks, question_text, answer_text) VALUES ('${long.id}', '${classId}', '${subjectId}', '${chapterId}', 'long', '${long.difficulty || 'medium'}', ${long.marks || 9}, '${escapeSql(long.questionText)}', '${escapeSql(long.answer || '')}');`
            );
          }
        }
      }
    }
  }

  statements.push(`-- Total questions: ${totalQuestions}\n`);
  statements.push('-- Subjects');
  statements.push(...subjectsInserts);
  statements.push('\n-- Chapters');
  statements.push(...chaptersInserts);
  statements.push('\n-- Questions');
  statements.push(...questionsInserts);

  return statements.join('\n');
}

async function main() {
  console.log('Generating seed SQL from JSON files...\n');

  const sql = await generateSeedSQL();
  const outputPath = path.join(process.cwd(), 'src', 'lib', 'db', 'seed.sql');

  fs.writeFileSync(outputPath, sql, 'utf-8');

  console.log(`\n✅ Seed SQL generated: ${outputPath}`);
  console.log(`📊 Ready for SQLite integration`);
}

main().catch(console.error);
