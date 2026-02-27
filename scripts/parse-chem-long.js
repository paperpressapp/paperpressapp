const fs = require('fs');

const content = fs.readFileSync('src/data/questions/9th/chemistrylong.txt', 'utf8');
const lines = content.split('\n');

const chapters = [];
let currentChapter = null;
let questionCount = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  
  if (line.startsWith('CHAPTER')) {
    if (currentChapter) {
      chapters.push(currentChapter);
    }
    
    const match = line.match(/CHAPTER (\d+): (.+)/);
    if (match) {
      currentChapter = {
        id: parseInt(match[1]),
        title: match[2],
        longQuestions: []
      };
      questionCount = 0;
    }
  } else if (line && !line.startsWith('(') && currentChapter) {
    questionCount++;
    if (questionCount <= 20) {
      currentChapter.longQuestions.push({
        id: questionCount,
        questionText: line,
        difficulty: 'medium',
        marks: 5
      });
    }
  }
}

if (currentChapter) {
  chapters.push(currentChapter);
}

const existingData = JSON.parse(fs.readFileSync('src/data/questions/9th/chemistry.json', 'utf8'));

for (const chapter of chapters) {
  const existingChapter = existingData.chapters.find(c => c.number === chapter.id);
  if (existingChapter) {
    existingChapter.longQuestions = chapter.longQuestions;
  }
}

fs.writeFileSync('src/data/questions/9th/chemistry.json', JSON.stringify(existingData, null, 2));

const totalLong = chapters.reduce((sum, c) => sum + c.longQuestions.length, 0);
console.log(`Added ${totalLong} long questions across ${chapters.length} chapters`);
