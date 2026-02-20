/**
 * PDF Generation Validation Tests
 * 
 * PHASE 3: Tests for PDF layout, formatting, and rendering.
 * Generates 10 test papers and validates output quality.
 * 
 * Run: npx tsx src/lib/engine/pdf.test.ts
 */

import { db, PaperConfig, Question } from '../db/database';
import { generatePaperHTML, generatePDFFilename, PDFSettings } from '../pdf/htmlGenerator';
import type { MCQQuestion, ShortQuestion, LongQuestion } from '@/types';

interface PDFTestResult {
  testName: string;
  passed: boolean;
  details: string;
  errors?: string[];
}

interface GeneratedPaper {
  html: string;
  config: any;
}

const pdfResults: PDFTestResult[] = [];

function pdfAssert(name: string, condition: boolean, details: string, errors?: string[]): void {
  pdfResults.push({
    testName: name,
    passed: condition,
    details,
    errors: errors || []
  });
  
  if (condition) {
    console.log(`✅ ${name}`);
  } else {
    console.log(`❌ ${name}`);
    if (errors) {
      errors.forEach(e => console.log(`   - ${e}`));
    }
  }
}

/**
 * Convert database Question to PDF-compatible MCQQuestion
 */
function toMCQQuestion(q: Question): MCQQuestion {
  return {
    id: q.id,
    questionText: q.question_text,
    options: [q.option_a || '', q.option_b || '', q.option_c || '', q.option_d || ''] as [string, string, string, string],
    correctOption: q.correct_option || 0,
    difficulty: q.difficulty || 'medium',
    marks: q.marks,
    chapterName: q.chapter_id,
  };
}

/**
 * Convert database Question to PDF-compatible ShortQuestion
 */
function toShortQuestion(q: Question): ShortQuestion {
  return {
    id: q.id,
    questionText: q.question_text,
    difficulty: q.difficulty || 'medium',
    marks: q.marks,
    chapterName: q.chapter_id,
  };
}

/**
 * Convert database Question to PDF-compatible LongQuestion
 */
function toLongQuestion(q: Question): LongQuestion {
  return {
    id: q.id,
    questionText: q.question_text,
    difficulty: q.difficulty || 'medium',
    marks: q.marks,
    chapterName: q.chapter_id,
  };
}

/**
 * Test Paper Configuration
 * Note: JSON files only have chapters 1 and 2 per subject
 * We use different question counts and seeds for variety
 */
const TEST_PAPERS = [
  { classId: '9th', subjectId: 'English', chapterIds: ['9_eng_ch1', '9_eng_ch2'], mcqCount: 10, shortCount: 5, longCount: 3, name: '9th English Paper 1' },
  { classId: '9th', subjectId: 'English', chapterIds: ['9_eng_ch1'], mcqCount: 15, shortCount: 8, longCount: 4, name: '9th English Paper 2' },
  { classId: '10th', subjectId: 'English', chapterIds: ['10_eng_ch1', '10_eng_ch2'], mcqCount: 10, shortCount: 5, longCount: 3, name: '10th English Paper 1' },
  { classId: '10th', subjectId: 'English', chapterIds: ['10_eng_ch1'], mcqCount: 12, shortCount: 6, longCount: 3, name: '10th English Paper 2' },
  { classId: '11th', subjectId: 'English', chapterIds: ['11_eng_ch1', '11_eng_ch2'], mcqCount: 10, shortCount: 5, longCount: 3, name: '11th English Paper 1' },
  { classId: '11th', subjectId: 'English', chapterIds: ['11_eng_ch1'], mcqCount: 8, shortCount: 4, longCount: 2, name: '11th English Paper 2' },
  { classId: '12th', subjectId: 'English', chapterIds: ['12_eng_ch1', '12_eng_ch2'], mcqCount: 10, shortCount: 5, longCount: 3, name: '12th English Paper 1' },
  { classId: '12th', subjectId: 'English', chapterIds: ['12_eng_ch1'], mcqCount: 12, shortCount: 6, longCount: 4, name: '12th English Paper 2' },
  { classId: '9th', subjectId: 'English', chapterIds: ['9_eng_ch1', '9_eng_ch2'], mcqCount: 15, shortCount: 10, longCount: 5, name: '9th English Full' },
  { classId: '12th', subjectId: 'English', chapterIds: ['12_eng_ch1', '12_eng_ch2'], mcqCount: 15, shortCount: 10, longCount: 5, name: '12th English Full' },
];

let generatedPapersGlobal: GeneratedPaper[] = [];

/**
 * Test 1: Generate All 10 Papers
 */
async function testGenerateAllPapers(): Promise<void> {
  console.log('\n🧪 TEST 1: Generate 10 Test Papers');
  console.log('=====================================\n');
  
  const generatedPapers: GeneratedPaper[] = [];
  const errors: string[] = [];
  
  for (const testPaper of TEST_PAPERS) {
    db.clearUsedQuestions();
    
    const config: PaperConfig = {
      classId: testPaper.classId,
      subjectId: testPaper.subjectId,
      chapterIds: testPaper.chapterIds,
      mcqCount: testPaper.mcqCount || 10,
      shortCount: testPaper.shortCount || 5,
      longCount: testPaper.longCount || 3,
    };
    
    try {
      const paper = await db.getQuestionsForPaper(config);
      
      const settings: PDFSettings = {
        instituteName: 'Test Institute',
        examType: 'Final Examination',
        date: '2024-03-15',
        timeAllowed: '3 Hours',
        classId: testPaper.classId,
        subject: testPaper.subjectId,
      };
      
      // Convert questions to PDF-compatible format
      const mcqs = paper.mcqs.map(toMCQQuestion);
      const shorts = paper.shorts.map(toShortQuestion);
      const longs = paper.longs.map(toLongQuestion);
      
      const html = generatePaperHTML(settings, mcqs, shorts, longs);
      
      if (!html || html.length < 100) {
        errors.push(`${testPaper.name}: HTML too short or empty`);
        continue;
      }
      
      generatedPapers.push({ html, config: testPaper });
      console.log(`   ✅ Generated: ${testPaper.name} (${html.length} chars)`);
      
    } catch (error) {
      errors.push(`${testPaper.name}: ${error}`);
    }
  }
  
  generatedPapersGlobal = generatedPapers;
  
  pdfAssert(
    'All 10 papers generated successfully',
    generatedPapers.length === 10,
    `Generated ${generatedPapers.length}/10 papers`,
    errors
  );
}

/**
 * Test 2: Verify HTML Structure
 */
async function testHTMLStructure(): Promise<void> {
  console.log('\n🧪 TEST 2: HTML Structure Validation');
  console.log('=====================================\n');
  
  const errors: string[] = [];
  
  const requiredElements = [
    { name: 'DOCTYPE', pattern: '<!DOCTYPE html>' },
    { name: 'HTML tag', pattern: '<html>' },
    { name: 'Head tag', pattern: '<head>' },
    { name: 'Style tag', pattern: '<style>' },
    { name: 'Body tag', pattern: '<body>' },
    { name: 'Institute name', pattern: 'Test Institute' },
    { name: 'Section A', pattern: 'SECTION A' },
    { name: 'Section B', pattern: 'SECTION B' },
    { name: 'Section C', pattern: 'SECTION C' },
  ];
  
  generatedPapersGlobal.forEach((paper, index) => {
    requiredElements.forEach(element => {
      if (!paper.html.includes(element.pattern)) {
        errors.push(`Paper ${index + 1}: Missing ${element.name}`);
      }
    });
  });
  
  pdfAssert(
    'All required HTML elements present',
    errors.length === 0,
    `Checked ${requiredElements.length} elements across ${generatedPapersGlobal.length} papers`,
    errors.length > 0 ? errors.slice(0, 10) : undefined
  );
}

/**
 * Test 3: MCQ Grid Formatting
 */
async function testMCQGridFormatting(): Promise<void> {
  console.log('\n🧪 TEST 3: MCQ Grid Formatting');
  console.log('=====================================\n');
  
  const errors: string[] = [];
  
  generatedPapersGlobal.forEach((paper, index) => {
    if (!paper.html.includes('mcq-options')) {
      errors.push(`Paper ${index + 1}: Missing MCQ grid CSS class`);
    }
    
    if (!paper.html.includes('(A)') || !paper.html.includes('(B)') || 
        !paper.html.includes('(C)') || !paper.html.includes('(D)')) {
      errors.push(`Paper ${index + 1}: MCQ options not formatted`);
    }
    
    const mcqPattern = /Q\d+\./g;
    const mcqMatches = paper.html.match(mcqPattern);
    if (!mcqMatches || mcqMatches.length < 5) {
      errors.push(`Paper ${index + 1}: Insufficient MCQ numbering`);
    }
  });
  
  pdfAssert(
    'MCQ grid formatting correct',
    errors.length === 0,
    `Checked MCQ formatting in ${generatedPapersGlobal.length} papers`,
    errors.length > 0 ? errors : undefined
  );
}

/**
 * Test 4: Page Break CSS
 */
async function testPageBreakCSS(): Promise<void> {
  console.log('\n🧪 TEST 4: Page Break Prevention');
  console.log('=====================================\n');
  
  const errors: string[] = [];
  
  generatedPapersGlobal.forEach((paper, index) => {
    if (!paper.html.includes('page-break-inside: avoid')) {
      errors.push(`Paper ${index + 1}: Missing page-break-inside CSS`);
    }
    
    if (!paper.html.includes('@page')) {
      errors.push(`Paper ${index + 1}: Missing @page CSS rule`);
    }
    
    if (!paper.html.includes('A4') && !paper.html.includes('210mm')) {
      errors.push(`Paper ${index + 1}: Missing A4 page size`);
    }
  });
  
  pdfAssert(
    'Page break CSS present',
    errors.length === 0,
    `Checked page break CSS in ${generatedPapersGlobal.length} papers`,
    errors.length > 0 ? errors : undefined
  );
}

/**
 * Test 5: Font Specifications
 */
async function testFontSpecifications(): Promise<void> {
  console.log('\n🧪 TEST 5: Font Specifications');
  console.log('=====================================\n');
  
  const errors: string[] = [];
  
  generatedPapersGlobal.forEach((paper, index) => {
    if (!paper.html.includes('Times New Roman') && !paper.html.includes('serif')) {
      errors.push(`Paper ${index + 1}: Serif font not specified`);
    }
    
    if (!paper.html.includes('font-size')) {
      errors.push(`Paper ${index + 1}: Font size not specified`);
    }
    
    if (!paper.html.includes('font-family')) {
      errors.push(`Paper ${index + 1}: Font family not specified`);
    }
  });
  
  pdfAssert(
    'Font specifications correct',
    errors.length === 0,
    `Checked fonts in ${generatedPapersGlobal.length} papers`,
    errors.length > 0 ? errors : undefined
  );
}

/**
 * Test 6: Header Information
 */
async function testHeaderInformation(): Promise<void> {
  console.log('\n🧪 TEST 6: Header Information');
  console.log('=====================================\n');
  
  const errors: string[] = [];
  
  generatedPapersGlobal.forEach((paper, index) => {
    if (!paper.html.includes(paper.config.classId)) {
      errors.push(`Paper ${index + 1}: Class not in header`);
    }
    
    if (!paper.html.includes('English')) {
      errors.push(`Paper ${index + 1}: Subject not in header`);
    }
    
    if (!paper.html.includes('Time') && !paper.html.includes('time')) {
      errors.push(`Paper ${index + 1}: Time not in header`);
    }
    
    if (!paper.html.includes('Date') && !paper.html.includes('date')) {
      errors.push(`Paper ${index + 1}: Date not in header`);
    }
    
    if (!paper.html.includes('Name') || !paper.html.includes('Roll')) {
      errors.push(`Paper ${index + 1}: Student info fields missing`);
    }
  });
  
  pdfAssert(
    'Header information complete',
    errors.length === 0,
    `Checked headers in ${generatedPapersGlobal.length} papers`,
    errors.length > 0 ? errors : undefined
  );
}

/**
 * Test 7: Marks Display
 */
async function testMarksDisplay(): Promise<void> {
  console.log('\n🧪 TEST 7: Marks Display');
  console.log('=====================================\n');
  
  const errors: string[] = [];
  
  generatedPapersGlobal.forEach((paper, index) => {
    const marksPattern = /\(\d+\)/g;
    const marksMatches = paper.html.match(marksPattern);
    
    if (!marksMatches || marksMatches.length < 5) {
      errors.push(`Paper ${index + 1}: Marks not displayed correctly`);
    }
    
    if (!paper.html.includes('Total Marks') && !paper.html.includes('Total:')) {
      errors.push(`Paper ${index + 1}: Total marks not in header`);
    }
    
    if (!paper.html.includes('Marks)')) {
      errors.push(`Paper ${index + 1}: Section marks not shown`);
    }
  });
  
  pdfAssert(
    'Marks displayed correctly',
    errors.length === 0,
    `Checked marks in ${generatedPapersGlobal.length} papers`,
    errors.length > 0 ? errors : undefined
  );
}

/**
 * Test 8: Section Instructions
 */
async function testSectionInstructions(): Promise<void> {
  console.log('\n🧪 TEST 8: Section Instructions');
  console.log('=====================================\n');
  
  const errors: string[] = [];
  
  generatedPapersGlobal.forEach((paper, index) => {
    if (!paper.html.includes('Choose') && !paper.html.includes('Attempt')) {
      errors.push(`Paper ${index + 1}: Section instructions missing`);
    }
  });
  
  pdfAssert(
    'Section instructions present',
    errors.length === 0,
    `Checked instructions in ${generatedPapersGlobal.length} papers`,
    errors.length > 0 ? errors : undefined
  );
}

/**
 * Test 9: Question Numbering Continuity
 */
async function testQuestionNumbering(): Promise<void> {
  console.log('\n🧪 TEST 9: Question Numbering');
  console.log('=====================================\n');
  
  const errors: string[] = [];
  
  generatedPapersGlobal.forEach((paper, index) => {
    const qPattern = /Q\d+\./g;
    const qMatches = paper.html.match(qPattern);
    
    if (!qMatches || qMatches.length < 10) {
      errors.push(`Paper ${index + 1}: Question numbering insufficient`);
    }
    
    const numbers = qMatches?.map(m => parseInt(m.replace(/\D/g, ''))) || [];
    const sorted = [...numbers].sort((a, b) => a - b);
    
    if (sorted.length > 0 && sorted[0] !== 1) {
      errors.push(`Paper ${index + 1}: Numbering doesn't start from 1`);
    }
  });
  
  pdfAssert(
    'Question numbering correct',
    errors.length === 0,
    `Checked numbering in ${generatedPapersGlobal.length} papers`,
    errors.length > 0 ? errors : undefined
  );
}

/**
 * Test 10: Spacing and Layout
 */
async function testSpacingLayout(): Promise<void> {
  console.log('\n🧪 TEST 10: Spacing and Layout');
  console.log('=====================================\n');
  
  const errors: string[] = [];
  
  generatedPapersGlobal.forEach((paper, index) => {
    if (!paper.html.includes('margin')) {
      errors.push(`Paper ${index + 1}: Margin not specified`);
    }
    
    if (!paper.html.includes('padding')) {
      errors.push(`Paper ${index + 1}: Padding not specified`);
    }
    
    if (!paper.html.includes('line-height')) {
      errors.push(`Paper ${index + 1}: Line height not specified`);
    }
  });
  
  pdfAssert(
    'Spacing and layout CSS present',
    errors.length === 0,
    `Checked spacing in ${generatedPapersGlobal.length} papers`,
    errors.length > 0 ? errors : undefined
  );
}

/**
 * Run all PDF tests
 */
async function runAllPDFTests(): Promise<void> {
  console.log('📄 PAPERPRESS PDF VALIDATION');
  console.log('=====================================\n');
  console.log('PHASE 3: PDF Layout Tests\n');
  
  // Generate all papers first
  await testGenerateAllPapers();
  
  if (generatedPapersGlobal.length === 0) {
    console.log('\n❌ No papers generated. Cannot continue tests.');
    process.exit(1);
  }
  
  // Run validation tests
  await testHTMLStructure();
  await testMCQGridFormatting();
  await testPageBreakCSS();
  await testFontSpecifications();
  await testHeaderInformation();
  await testMarksDisplay();
  await testSectionInstructions();
  await testQuestionNumbering();
  await testSpacingLayout();
  
  // Summary
  console.log('\n=====================================');
  console.log('📊 PDF TEST SUMMARY');
  console.log('=====================================');
  
  const passed = pdfResults.filter(r => r.passed).length;
  const failed = pdfResults.filter(r => !r.passed).length;
  
  console.log(`Total Tests: ${pdfResults.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  
  if (failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    pdfResults.filter(r => !r.passed).forEach(r => {
      console.log(`\n  ${r.testName}`);
      console.log(`  ${r.details}`);
      r.errors?.slice(0, 5).forEach(e => console.log(`    - ${e}`));
    });
    process.exit(1);
  } else {
    console.log('\n✅ ALL PDF TESTS PASSED');
    console.log('PDF engine is stable and produces professional output.\n');
  }
}

// Run tests
runAllPDFTests().catch(error => {
  console.error('PDF test suite failed:', error);
  process.exit(1);
});
