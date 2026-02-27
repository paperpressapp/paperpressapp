const fs = require('fs');

const txt = fs.readFileSync('src/data/questions/9th/chemistrymcq.txt', 'utf8');
const lines = txt.split('\n');

const chapters = [];
let currentChapter = null;
let chapterNum = 0;
let mcqNum = 0;

for (const line of lines) {
  const trimmed = line.trim();
  
  // Check for chapter header
  const chapterMatch = trimmed.match(/^CHAPTER\s+(\d+):\s*(.+)/i);
  if (chapterMatch) {
    if (currentChapter && currentChapter.mcqs.length > 0) {
      chapters.push(currentChapter);
    }
    chapterNum++;
    currentChapter = {
      name: chapterMatch[2].trim(),
      mcqs: []
    };
    mcqNum = 0;
    continue;
  }
  
  // Check for MCQ line (contains ✅)
  if (trimmed.includes('✅') && trimmed.match(/[A-D]\)\s*.+\s+[A-D]\)\s*.+\s+[A-D]\)\s*.+\s+[A-D]\)\s*.+/)) {
    // Split by ✅
    const parts = trimmed.split('✅');
    if (parts.length < 2) continue;
    
    const questionAndOpts = parts[0].trim();
    const answerPart = parts[1].trim();
    
    // Get correct answer letter
    const correctMatch = answerPart.match(/^([A-D])\)/);
    if (!correctMatch) continue;
    const correctLetter = correctMatch[1];
    const correctIdx = correctLetter.charCodeAt(0) - 65;
    
    // Extract options - split by looking for pattern "Letter) " at word boundaries
    const options = [];
    
    // Find all A) B) C) D) positions
    const posA = questionAndOpts.indexOf('A)');
    const posB = questionAndOpts.indexOf('B)');
    const posC = questionAndOpts.indexOf('C)');
    const posD = questionAndOpts.indexOf('D)');
    
    if (posA === -1 || posB === -1) continue;
    
    // Extract each option
    const optA = questionAndOpts.substring(posA + 2, posB).trim();
    const optB = posC > 0 ? questionAndOpts.substring(posB + 2, posC).trim() : questionAndOpts.substring(posB + 2).trim();
    const optC = posD > 0 ? questionAndOpts.substring(posC + 2, posD).trim() : questionAndOpts.substring(posC + 2).trim();
    const optD = posD > 0 ? questionAndOpts.substring(posD + 2).trim() : '';
    
    options.push(optA, optB, optC, optD);
    
    // Extract question - everything before A)
    const question = questionAndOpts.substring(0, posA).trim();
    
    if (question && options[0] && options[1]) {
      mcqNum++;
      currentChapter.mcqs.push({
        questionText: question,
        options: options,
        correctOption: correctIdx,
        difficulty: 'easy',
        marks: 1,
        id: `9_chem_ch${chapterNum}_mcq_${mcqNum}`
      });
    }
  }
}

// Add last chapter
if (currentChapter && currentChapter.mcqs.length > 0) {
  chapters.push(currentChapter);
}

console.log('Total chapters:', chapters.length);
chapters.forEach((ch, i) => {
  console.log(`Ch${i+1}: ${ch.name.substring(0, 35)} - ${ch.mcqs.length} MCQs`);
});

// Create JSON
const json = {
  class: '9th',
  subject: 'Chemistry',
  chapters: chapters.map((ch, i) => ({
    id: `9_chem_ch${i+1}`,
    number: i + 1,
    name: ch.name,
    mcqs: ch.mcqs,
    shortQuestions: [],
    longQuestions: []
  }))
};

fs.writeFileSync('src/data/questions/9th/chemistry.json', JSON.stringify(json, null, 2));
console.log('\nSaved to chemistry.json');
