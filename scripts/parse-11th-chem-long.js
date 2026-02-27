const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, '../src/data/questions/11th/chem_long.txt');
const outputFile = path.join(__dirname, '../src/data/questions/11th/chemistry.json');

const content = fs.readFileSync(inputFile, 'utf8');
const lines = content.split('\n');

let chemistryData = JSON.parse(fs.readFileSync(outputFile, 'utf8'));

const chapterPatterns = [
  'CHAPTER 1', 'CHAPTER 2', 'CHAPTER 3', 'CHAPTER 4', 'CHAPTER 5', 'CHAPTER 6',
  'CHAPTER 7', 'CHAPTER 8', 'CHAPTER 9', 'CHAPTER 10', 'CHAPTER 11', 'CHAPTER 12',
  'CHAPTER 13', 'CHAPTER 14', 'CHAPTER 15', 'CHAPTER 16'
];

let currentChapter = null;
let currentChapterIndex = 0;

function getDifficulty(marks) {
  if (marks <= 2) return 'easy';
  if (marks <= 4) return 'medium';
  return 'hard';
}

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  
  for (let j = 0; j < chapterPatterns.length; j++) {
    if (line.includes(chapterPatterns[j])) {
      currentChapterIndex = j + 1;
      currentChapter = `Chapter ${currentChapterIndex}`;
      break;
    }
  }
  
  if (line.match(/^Q\.\d+\s/)) {
    const questionText = line.replace(/^Q\.\d+\s+/, '').trim();
    
    if (questionText && currentChapter) {
      let marks = 3;
      if (line.includes('NUMERICAL PROBLEMS')) continue;
      if (questionText.includes('Calculate') || questionText.includes('numerical')) {
        marks = 5;
      }
      
      const question = {
        id: `11th-chem-long-${currentChapterIndex}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        questionText: questionText,
        difficulty: getDifficulty(marks),
        marks: marks,
        chapter: currentChapter
      };
      
      if (!chemistryData.long) {
        chemistryData.long = [];
      }
      chemistryData.long.push(question);
    }
  }
}

fs.writeFileSync(outputFile, JSON.stringify(chemistryData, null, 2));

console.log(`Added ${chemistryData.long.length} Long Questions to 11th Chemistry`);
