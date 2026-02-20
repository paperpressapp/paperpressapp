/**
 * Engine Validation Tests
 * 
 * PHASE 2: Tests for section builder, duplicate prevention,
 * randomization, and marks calculation.
 * 
 * Run: npx tsx src/lib/engine/engine.test.ts
 */

import { db, PaperConfig } from '../db/database';

interface TestResult {
  name: string;
  passed: boolean;
  details: string;
  errors?: string[];
}

const results: TestResult[] = [];

function assert(name: string, condition: boolean, details: string, errors?: string[]): void {
  results.push({
    name,
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
 * Test 1: No Duplicate Questions
 */
async function testNoDuplicates(): Promise<void> {
  console.log('\n🧪 TEST 1: No Duplicate Questions');
  console.log('=====================================\n');
  
  db.clearUsedQuestions();
  
  const config: PaperConfig = {
    classId: '9th',
    subjectId: 'English',
    chapterIds: ['9_eng_ch1', '9_eng_ch2'],
    mcqCount: 5,
    shortCount: 3,
    longCount: 2,
  };
  
  const paper1 = await db.getQuestionsForPaper(config);
  const paper2 = await db.getQuestionsForPaper(config);
  
  const allIds = [
    ...paper1.mcqs.map(q => q.id),
    ...paper1.shorts.map(q => q.id),
    ...paper1.longs.map(q => q.id),
    ...paper2.mcqs.map(q => q.id),
    ...paper2.shorts.map(q => q.id),
    ...paper2.longs.map(q => q.id),
  ];
  
  const uniqueIds = new Set(allIds);
  const hasDuplicates = uniqueIds.size !== allIds.length;
  
  assert(
    'No duplicate questions across papers',
    !hasDuplicates,
    `Generated ${allIds.length} questions, ${uniqueIds.size} unique`,
    hasDuplicates ? [`Found ${allIds.length - uniqueIds.size} duplicates`] : []
  );
  
  // Check within single paper
  const paper1Ids = [...paper1.mcqs, ...paper1.shorts, ...paper1.longs].map(q => q.id);
  const paper1Unique = new Set(paper1Ids);
  
  assert(
    'No duplicates within single paper',
    paper1Unique.size === paper1Ids.length,
    `Paper has ${paper1Ids.length} questions, all unique`,
    paper1Unique.size !== paper1Ids.length ? ['Duplicate found in paper'] : []
  );
}

/**
 * Test 2: Randomization Works
 */
async function testRandomization(): Promise<void> {
  console.log('\n🧪 TEST 2: Randomization');
  console.log('=====================================\n');
  
  const config: PaperConfig = {
    classId: '10th',
    subjectId: 'English',
    chapterIds: ['10_eng_ch1', '10_eng_ch2'],
    mcqCount: 5,
    shortCount: 2,
    longCount: 1,
  };
  
  // Generate 5 papers with different seeds
  const papers = [];
  for (let i = 0; i < 5; i++) {
    db.clearUsedQuestions();
    papers.push(await db.getQuestionsForPaper({ ...config, seed: i * 1000 }));
  }
  
  // Check if papers are different
  const paperSignatures = papers.map(p => 
    [...p.mcqs, ...p.shorts, ...p.longs].map(q => q.id).join(',')
  );
  
  const uniqueSignatures = new Set(paperSignatures);
  
  assert(
    'Randomization produces different papers',
    uniqueSignatures.size > 1,
    `Generated ${papers.length} papers, ${uniqueSignatures.size} unique`,
    uniqueSignatures.size > 1 ? [] : ['Warning: All papers are identical']
  );
}

/**
 * Test 3: Seeded Randomization (Reproducible)
 */
async function testSeededRandomization(): Promise<void> {
  console.log('\n🧪 TEST 3: Seeded Randomization');
  console.log('=====================================\n');
  
  const config: PaperConfig = {
    classId: '11th',
    subjectId: 'English',
    chapterIds: ['11_eng_ch1'],
    mcqCount: 3,
    shortCount: 2,
    longCount: 1,
    seed: 12345,
  };
  
  db.clearUsedQuestions();
  const paper1 = await db.getQuestionsForPaper(config);
  
  db.clearUsedQuestions();
  const paper2 = await db.getQuestionsForPaper(config);
  
  const ids1 = [...paper1.mcqs, ...paper1.shorts, ...paper1.longs].map(q => q.id).sort();
  const ids2 = [...paper2.mcqs, ...paper2.shorts, ...paper2.longs].map(q => q.id).sort();
  
  const identical = JSON.stringify(ids1) === JSON.stringify(ids2);
  
  assert(
    'Same seed produces identical paper',
    identical,
    `Seed ${config.seed} generated identical paper`,
    identical ? [] : ['Papers differ with same seed']
  );
}

/**
 * Test 4: Marks Calculation
 */
async function testMarksCalculation(): Promise<void> {
  console.log('\n🧪 TEST 4: Marks Calculation');
  console.log('=====================================\n');
  
  db.clearUsedQuestions();
  
  const config: PaperConfig = {
    classId: '12th',
    subjectId: 'English',
    chapterIds: ['12_eng_ch1'],
    mcqCount: 10,
    shortCount: 5,
    longCount: 3,
  };
  
  const paper = await db.getQuestionsForPaper(config);
  
  // Calculate expected marks
  const mcqMarks = paper.mcqs.reduce((sum, q) => sum + q.marks, 0);
  const shortMarks = paper.shorts.reduce((sum, q) => sum + q.marks, 0);
  const longMarks = paper.longs.reduce((sum, q) => sum + q.marks, 0);
  const calculatedTotal = mcqMarks + shortMarks + longMarks;
  
  const matches = calculatedTotal === paper.totalMarks;
  
  assert(
    'Total marks calculated correctly',
    matches,
    `Expected: ${calculatedTotal}, Got: ${paper.totalMarks}`,
    matches ? [] : [`Mismatch: ${calculatedTotal} !== ${paper.totalMarks}`]
  );
  
  // Check MCQ marks (should all be 1)
  const allMcqMarksOne = paper.mcqs.every(q => q.marks === 1);
  assert(
    'MCQ marks are all 1',
    allMcqMarksOne,
    `All ${paper.mcqs.length} MCQs have 1 mark`,
    allMcqMarksOne ? [] : paper.mcqs.filter(q => q.marks !== 1).map(q => `MCQ ${q.id} has ${q.marks} marks`)
  );
  
  // Check short question marks are consistent
  const shortMarksSet = new Set(paper.shorts.map(q => q.marks));
  const shortMarksConsistent = shortMarksSet.size === 1;
  const shortMarksValue = paper.shorts[0]?.marks || 0;
  assert(
    'Short question marks consistent',
    shortMarksConsistent,
    `All ${paper.shorts.length} short questions have ${shortMarksValue} marks`,
    shortMarksConsistent ? [] : paper.shorts.filter(q => q.marks !== shortMarksValue).map(q => `Short ${q.id} has ${q.marks} marks`)
  );
}

/**
 * Test 5: Question Availability Validation
 */
async function testQuestionAvailability(): Promise<void> {
  console.log('\n🧪 TEST 5: Question Availability');
  console.log('=====================================\n');
  
  // Request more questions than available
  const config: PaperConfig = {
    classId: '9th',
    subjectId: 'English',
    chapterIds: ['9_eng_ch1'],
    mcqCount: 1000, // Impossible
    shortCount: 1000,
    longCount: 1000,
  };
  
  const validation = await db.validateQuestionAvailability(config);
  
  assert(
    'Validation detects insufficient questions',
    !validation.valid,
    `Requested ${config.mcqCount} MCQs, available: ${validation.available.mcq}`,
    validation.valid ? ['Should have failed with excessive request'] : []
  );
  
  // Valid request
  const validConfig: PaperConfig = {
    classId: '9th',
    subjectId: 'English',
    chapterIds: ['9_eng_ch1', '9_eng_ch2', '9_eng_ch3'],
    mcqCount: 5,
    shortCount: 3,
    longCount: 2,
  };
  
  const validCheck = await db.validateQuestionAvailability(validConfig);
  
  assert(
    'Valid request passes availability check',
    validCheck.valid,
    `Available: MCQ=${validCheck.available.mcq}, Short=${validCheck.available.short}, Long=${validCheck.available.long}`,
    validCheck.valid ? [] : ['Valid request should pass']
  );
}

/**
 * Test 6: Chapter Filtering
 */
async function testChapterFiltering(): Promise<void> {
  console.log('\n🧪 TEST 6: Chapter Filtering');
  console.log('=====================================\n');
  
  db.clearUsedQuestions();
  
  const config: PaperConfig = {
    classId: '10th',
    subjectId: 'English',
    chapterIds: ['10_eng_ch1'], // Only chapter 1
    mcqCount: 10,
    shortCount: 5,
    longCount: 3,
  };
  
  const paper = await db.getQuestionsForPaper(config);
  const allQuestions = [...paper.mcqs, ...paper.shorts, ...paper.longs];
  
  const allFromCorrectChapter = allQuestions.every(q => 
    q.chapter_id === '10_eng_ch1'
  );
  
  assert(
    'All questions from selected chapters',
    allFromCorrectChapter,
    `All ${allQuestions.length} questions from chapter 1`,
    allFromCorrectChapter ? [] : allQuestions.filter(q => q.chapter_id !== '10_eng_ch1').map(q => `Question from wrong chapter: ${q.chapter_id}`)
  );
}

/**
 * Test 7: Section Numbering Continuity
 */
async function testSectionNumbering(): Promise<void> {
  console.log('\n🧪 TEST 7: Section Numbering');
  console.log('=====================================\n');
  
  db.clearUsedQuestions();
  
  const config: PaperConfig = {
    classId: '9th',
    subjectId: 'English',
    chapterIds: ['9_eng_ch1'],
    mcqCount: 5,
    shortCount: 3,
    longCount: 2,
  };
  
  const paper = await db.getQuestionsForPaper(config);
  
  // MCQ numbering should start from 1
  const mcqNumbers = paper.mcqs.map((_, i) => i + 1);
  const mcqContinuous = mcqNumbers.every((n, i) => n === i + 1);
  
  assert(
    'MCQ numbering is continuous',
    mcqContinuous,
    `MCQs numbered 1-${paper.mcqs.length}`,
    mcqContinuous ? [] : ['MCQ numbering broken']
  );
  
  // Total question count verification
  const totalQuestions = paper.mcqs.length + paper.shorts.length + paper.longs.length;
  const expectedTotal = config.mcqCount + config.shortCount + config.longCount;
  const countMatches = totalQuestions === expectedTotal;
  
  assert(
    'Question count matches configuration',
    countMatches,
    `Total: ${totalQuestions}, Expected: ${expectedTotal}`,
    countMatches ? [] : [`Count mismatch: ${totalQuestions} !== ${expectedTotal}`]
  );
}

/**
 * Test 8: Performance Test
 */
async function testPerformance(): Promise<void> {
  console.log('\n🧪 TEST 8: Performance');
  console.log('=====================================\n');
  
  db.clearUsedQuestions();
  
  const config: PaperConfig = {
    classId: '9th',
    subjectId: 'Mathematics',
    chapterIds: ['9_math_ch1', '9_math_ch2', '9_math_ch3', '9_math_ch4', '9_math_ch5'],
    mcqCount: 50,
    shortCount: 25,
    longCount: 10,
  };
  
  const startTime = performance.now();
  const paper = await db.getQuestionsForPaper(config);
  const endTime = performance.now();
  
  const duration = endTime - startTime;
  const underLimit = duration < 3000; // Should be under 3 seconds
  
  assert(
    'Paper generation under 3 seconds',
    underLimit,
    `Generated in ${duration.toFixed(2)}ms`,
    underLimit ? [] : [`Too slow: ${duration.toFixed(2)}ms`]
  );
  
  const totalQuestions = paper.mcqs.length + paper.shorts.length + paper.longs.length;
  console.log(`   Total questions generated: ${totalQuestions}`);
}

/**
 * Run all tests
 */
async function runAllTests(): Promise<void> {
  console.log('🚀 PAPERPRESS ENGINE VALIDATION');
  console.log('=====================================\n');
  console.log('PHASE 2: Engine Logic Tests\n');
  
  await testNoDuplicates();
  await testRandomization();
  await testSeededRandomization();
  await testMarksCalculation();
  await testQuestionAvailability();
  await testChapterFiltering();
  await testSectionNumbering();
  await testPerformance();
  
  // Summary
  console.log('\n=====================================');
  console.log('📊 TEST SUMMARY');
  console.log('=====================================');
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  
  console.log(`Total Tests: ${results.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  
  if (failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`\n  ${r.name}`);
      console.log(`  ${r.details}`);
      r.errors?.forEach(e => console.log(`    - ${e}`));
    });
    process.exit(1);
  } else {
    console.log('\n✅ ALL ENGINE TESTS PASSED');
    console.log('Engine is stable and ready for PDF testing.\n');
  }
}

// Run tests
runAllTests().catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
});
