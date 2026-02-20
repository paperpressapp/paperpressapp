/**
 * PDF Generation Test
 * 
 * Verifies that the PDF engine produces correct output.
 * Run this before building the APK.
 */

import { generatePaperHTML, generatePDFFilename } from './htmlGenerator';
import type { PDFSettings } from './htmlGenerator';
import type { MCQQuestion, ShortQuestion, LongQuestion } from '@/types';

// Test data matching actual types
const testMCQs: MCQQuestion[] = [
  {
    id: 'test_1',
    questionText: 'What is 2+2?',
    options: ['3', '4', '5', '6'],
    correctOption: 1,
    difficulty: 'easy',
    marks: 1,
    chapterNumber: 1,
    chapterName: 'Basic Arithmetic',
  },
  {
    id: 'test_2',
    questionText: 'The derivative of x² is:',
    options: ['x', '2x', 'x²', '2'],
    correctOption: 1,
    difficulty: 'medium',
    marks: 1,
    chapterNumber: 1,
    chapterName: 'Basic Arithmetic',
  },
];

const testShorts: ShortQuestion[] = [
  {
    id: 'test_3',
    questionText: 'Define differentiation.',
    difficulty: 'easy',
    marks: 2,
    chapterNumber: 1,
    chapterName: 'Basic Arithmetic',
  },
  {
    id: 'test_4',
    questionText: 'What is the chain rule?',
    difficulty: 'medium',
    marks: 2,
    chapterNumber: 1,
    chapterName: 'Basic Arithmetic',
  },
];

const testLongs: LongQuestion[] = [
  {
    id: 'test_5',
    questionText: 'Explain the concept of limits and continuity with examples.',
    difficulty: 'hard',
    marks: 9,
    chapterNumber: 1,
    chapterName: 'Basic Arithmetic',
  },
];

const testSettings: PDFSettings = {
  instituteName: 'Test Institute',
  examType: 'Final Examination',
  date: '2024-03-15',
  timeAllowed: '3 Hours',
  classId: '10th',
  subject: 'Mathematics',
};

/**
 * Run PDF generation test
 */
export function testPDFGeneration(): { passed: boolean; html: string; errors: string[] } {
  const errors: string[] = [];
  
  try {
    // Test 1: Generate HTML
    console.log('🧪 Test 1: Generating HTML...');
    const html = generatePaperHTML(testSettings, testMCQs, testShorts, testLongs);
    
    if (!html || html.length < 100) {
      errors.push('❌ Generated HTML is too short or empty');
    } else {
      console.log('✅ HTML generated successfully');
    }
    
    // Test 2: Check structure
    console.log('🧪 Test 2: Checking HTML structure...');
    
    const requiredElements = [
      '<!DOCTYPE html>',
      '<html>',
      '<head>',
      '<style>',
      '<body>',
      'Test Institute',
      'Mathematics - 10th Class',
      'SECTION A',
      'SECTION B',
      'SECTION C',
    ];
    
    requiredElements.forEach(element => {
      if (!html.includes(element)) {
        errors.push(`❌ Missing required element: ${element}`);
      }
    });
    
    if (errors.length === 0) {
      console.log('✅ All required elements present');
    }
    
    // Test 3: Check MCQ formatting
    console.log('🧪 Test 3: Checking MCQ formatting...');
    
    if (!html.includes('Q1.') || !html.includes('Q2.')) {
      errors.push('❌ MCQ numbering missing');
    }
    
    if (!html.includes('(A)') || !html.includes('(B)') || !html.includes('(C)') || !html.includes('(D)')) {
      errors.push('❌ MCQ options not formatted correctly');
    }
    
    if (!html.includes('mcq-options') || !html.includes('mcq-option')) {
      errors.push('❌ MCQ grid CSS classes missing');
    }
    
    if (errors.filter(e => e.includes('MCQ')).length === 0) {
      console.log('✅ MCQ formatting correct');
    }
    
    // Test 4: Check marks formatting
    console.log('🧪 Test 4: Checking marks formatting...');
    
    if (!html.includes('(2)') || !html.includes('(9)')) {
      errors.push('❌ Marks not formatted correctly');
    }
    
    if (!html.includes('short-q') || !html.includes('long-q')) {
      errors.push('❌ Question type CSS classes missing');
    }
    
    if (errors.filter(e => e.includes('marks')).length === 0) {
      console.log('✅ Marks formatting correct');
    }
    
    // Test 5: Check filename generation
    console.log('🧪 Test 5: Checking filename generation...');
    
    const filename = generatePDFFilename('10th', 'Mathematics', '2024-03-15');
    if (!filename.includes('10th') || !filename.includes('Mathematics') || !filename.includes('20240315')) {
      errors.push('❌ Filename generation incorrect');
    } else {
      console.log('✅ Filename generation correct:', filename);
    }
    
    // Test 6: Check page break prevention
    console.log('🧪 Test 6: Checking page break CSS...');
    
    if (!html.includes('page-break-inside: avoid')) {
      errors.push('❌ Page break prevention CSS missing');
    } else {
      console.log('✅ Page break prevention CSS present');
    }
    
    // Test 7: Check font family
    console.log('🧪 Test 7: Checking font family...');
    
    if (!html.includes('Times New Roman') && !html.includes('serif')) {
      errors.push('❌ Serif font not specified');
    } else {
      console.log('✅ Serif font specified');
    }
    
    // Summary
    console.log('\n📊 Test Summary:');
    console.log(`Total checks: 7`);
    console.log(`Passed: ${7 - errors.length}`);
    console.log(`Failed: ${errors.length}`);
    
    if (errors.length > 0) {
      console.log('\n❌ Errors found:');
      errors.forEach(e => console.log(e));
    } else {
      console.log('\n✅ All tests passed!');
    }
    
    return {
      passed: errors.length === 0,
      html,
      errors,
    };
    
  } catch (error) {
    const errorMsg = `❌ Critical error: ${error instanceof Error ? error.message : String(error)}`;
    console.error(errorMsg);
    return {
      passed: false,
      html: '',
      errors: [errorMsg],
    };
  }
}

/**
 * Run full validation test
 */
export function runFullValidation(): void {
  console.log('🚀 Running PaperPress PDF Generation Tests\n');
  console.log('==========================================\n');
  
  const result = testPDFGeneration();
  
  console.log('\n==========================================');
  if (result.passed) {
    console.log('✅ ALL TESTS PASSED - Ready for production');
  } else {
    console.log('❌ TESTS FAILED - Fix issues before building APK');
    console.log('\nIssues to fix:');
    result.errors.forEach(e => console.log(`  - ${e}`));
  }
  console.log('==========================================\n');
}

// Run if executed directly
if (typeof window !== 'undefined') {
  // Expose to window for browser testing
  (window as any).testPDF = runFullValidation;
}
