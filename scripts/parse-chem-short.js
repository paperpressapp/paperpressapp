const fs = require('fs');

const txt = fs.readFileSync('src/data/questions/9th/chemistryshort.txt', 'utf8');
const lines = txt.split('\n');

const chapters = [];
let currentChapter = null;
let chapterNum = 0;
let shortNum = 0;

for (const line of lines) {
  const trimmed = line.trim();
  
  // Check for chapter header
  const chapterMatch = trimmed.match(/^CHAPTER\s+(\d+):\s*(.+)/i);
  if (chapterMatch) {
    if (currentChapter && currentChapter.shorts.length > 0) {
      chapters.push(currentChapter);
    }
    chapterNum++;
    currentChapter = {
      name: chapterMatch[2].trim(),
      shorts: []
    };
    shortNum = 0;
    continue;
  }
  
  // Skip empty lines and total questions lines
  if (!trimmed || trimmed.match(/^\(Total:/i)) continue;
  
  // This is a short question
  if (trimmed.length > 3) {
    shortNum++;
    currentChapter.shorts.push({
      questionText: trimmed,
      difficulty: 'easy',
      marks: 3,
      id: `9_chem_ch${chapterNum}_short_${shortNum}`
    });
  }
}

// Add last chapter
if (currentChapter && currentChapter.shorts.length > 0) {
  chapters.push(currentChapter);
}

console.log('Total chapters with shorts:', chapters.length);
chapters.forEach((ch, i) => {
  console.log(`Ch${i+1}: ${ch.shorts.length} short questions`);
});

// Read existing chemistry.json
const json = JSON.parse(fs.readFileSync('src/data/questions/9th/chemistry.json', 'utf8'));

// Add short questions to chapters
chapters.forEach((ch, i) => {
  if (json.chapters[i]) {
    json.chapters[i].shortQuestions = ch.shorts;
  }
});

fs.writeFileSync('src/data/questions/9th/chemistry.json', JSON.stringify(json, null, 2));
console.log('\nSaved to chemistry.json');
