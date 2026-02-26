import fs from 'fs';
import path from 'path';

interface Question {
  id: string;
  questionText: string;
  options?: string[];
  correctOption?: number;
  difficulty: 'easy' | 'medium' | 'hard';
  marks: number;
  [key: string]: unknown;
}

interface Chapter {
  id: string;
  number: number;
  name: string;
  mcqs: Question[];
  shorts: Question[];
  longs: Question[];
}

interface QuestionFile {
  class: string;
  subject: string;
  chapters: Chapter[];
}

function validateQuestion(question: Question, type: string): string[] {
  const errors: string[] = [];
  
  if (!question.id) errors.push('Missing id');
  if (!question.questionText) errors.push('Missing questionText');
  if (!question.difficulty) errors.push('Missing difficulty');
  if (!question.marks) errors.push('Missing marks');
  
  if (type === 'mcq') {
    if (!question.options || question.options.length !== 4) {
      errors.push('MCQ must have exactly 4 options');
    }
    if (question.correctOption === undefined || question.correctOption < 0 || question.correctOption > 3) {
      errors.push('MCQ must have valid correctOption (0-3)');
    }
  }
  
  return errors;
}

function validateChapter(chapter: Chapter, className: string, subject: string): string[] {
  const errors: string[] = [];
  
  if (!chapter.id) errors.push('Chapter missing id');
  if (!chapter.number) errors.push('Chapter missing number');
  if (!chapter.name) errors.push('Chapter missing name');
  
  chapter.mcqs?.forEach((q, i) => {
    const qErrors = validateQuestion(q, 'mcq');
    if (qErrors.length > 0) {
      errors.push(`MCQ ${i + 1}: ${qErrors.join(', ')}`);
    }
  });
  
  chapter.shorts?.forEach((q, i) => {
    const qErrors = validateQuestion(q, 'short');
    if (qErrors.length > 0) {
      errors.push(`Short ${i + 1}: ${qErrors.join(', ')}`);
    }
  });
  
  chapter.longs?.forEach((q, i) => {
    const qErrors = validateQuestion(q, 'long');
    if (qErrors.length > 0) {
      errors.push(`Long ${i + 1}: ${qErrors.join(', ')}`);
    }
  });
  
  return errors;
}

function validateQuestionFile(filePath: string): { valid: boolean; errors: string[]; stats: { mcqs: number; shorts: number; longs: number } } {
  const errors: string[] = [];
  const stats = { mcqs: 0, shorts: 0, longs: 0 };
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const data: QuestionFile = JSON.parse(content);
    
    if (!data.class) errors.push('Missing class');
    if (!data.subject) errors.push('Missing subject');
    if (!data.chapters || !Array.isArray(data.chapters)) {
      errors.push('Missing chapters array');
    }
    
    if (data.chapters) {
      data.chapters.forEach((chapter, i) => {
        const chapterErrors = validateChapter(chapter, data.class, data.subject);
        chapterErrors.forEach(e => errors.push(`Chapter ${i + 1}: ${e}`));
        
        stats.mcqs += chapter.mcqs?.length || 0;
        stats.shorts += chapter.shorts?.length || 0;
        stats.longs += chapter.longs?.length || 0;
      });
    }
    
  } catch (e) {
    errors.push(`Failed to read/parse file: ${e}`);
  }
  
  return {
    valid: errors.length === 0,
    errors,
    stats
  };
}

function scanQuestionsDirectory(): void {
  const questionsDir = path.join(process.cwd(), 'src/data/questions');
  const classes = ['9th', '10th', '11th', '12th'];
  
  console.log('📚 Question Bank Validator');
  console.log('='.repeat(50));
  
  let totalMcqs = 0;
  let totalShorts = 0;
  let totalLongs = 0;
  let totalErrors = 0;
  
  classes.forEach(className => {
    const classDir = path.join(questionsDir, className);
    if (!fs.existsSync(classDir)) return;
    
    const files = fs.readdirSync(classDir).filter(f => f.endsWith('.json'));
    
    files.forEach(file => {
      const filePath = path.join(classDir, file);
      const result = validateQuestionFile(filePath);
      
      const subject = file.replace('.json', '').toUpperCase();
      console.log(`\n📖 ${className} - ${subject}`);
      console.log(`   MCQs: ${result.stats.mcqs} | Shorts: ${result.stats.shorts} | Longs: ${result.stats.longs}`);
      
      if (result.valid) {
        console.log('   ✅ Valid');
      } else {
        console.log('   ❌ Errors:');
        result.errors.forEach(e => {
          console.log(`      - ${e}`);
          totalErrors++;
        });
      }
      
      totalMcqs += result.stats.mcqs;
      totalShorts += result.stats.shorts;
      totalLongs += result.stats.longs;
    });
  });
  
  console.log('\n' + '='.repeat(50));
  console.log(`📊 Total: ${totalMcqs} MCQs, ${totalShorts} Shorts, ${totalLongs} Longs`);
  console.log(`❌ Total Errors: ${totalErrors}`);
  console.log('='.repeat(50));
}

scanQuestionsDirectory();
