const fs = require('fs');

const content = fs.readFileSync('src/data/questions/9th/comp_long.txt', 'utf8');
const lines = content.split('\n');

const chapters = [];
let currentChapter = null;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  
  if (line.startsWith('CHAPTER')) {
    const match = line.match(/CHAPTER\s*(\d+):\s*(.+)/i);
    if (match) {
      if (currentChapter) chapters.push(currentChapter);
      currentChapter = {
        number: parseInt(match[1]),
        name: match[2].trim(),
        longQuestions: []
      };
    }
    continue;
  }
  
  if (currentChapter && (line.startsWith('Explain') || line.startsWith('Describe') || line.startsWith('Discuss') || line.startsWith('Compare') || line.startsWith('Differentiate') || line.startsWith('Define') || line.startsWith('Write') || line.startsWith('Analyze') || line.startsWith('Explore') || line.startsWith('Differentiate') || line.startsWith('Simplify') || line.startsWith('Design') || line.startsWith('Create') || line.startsWith('Perform') || line.startsWith('Add') || line.startsWith('Solve') || line.startsWith('Convert') || line.startsWith('Multiply') || line.startsWith('Divide') || line.startsWith('Calculate') || line.startsWith('Imagine') || line.startsWith('Choose') || line.startsWith('Develop'))) {
    if (line.length > 20) {
      currentChapter.longQuestions.push({
        id: `9_cs_ch${currentChapter.number}_long_${currentChapter.longQuestions.length + 1}`,
        questionText: line,
        difficulty: 'hard',
        marks: 5
      });
    }
  }
}

if (currentChapter) chapters.push(currentChapter);

console.log(`Parsed ${chapters.length} chapters`);
chapters.forEach(c => console.log(`  Chapter ${c.number}: ${c.name} - ${c.longQuestions.length} Long Questions`));

const existingData = JSON.parse(fs.readFileSync('src/data/questions/9th/computer.json', 'utf8'));

for (const newChapter of chapters) {
  const existingChapter = existingData.chapters.find(c => c.number === newChapter.number);
  if (existingChapter && newChapter.longQuestions.length > 0) {
    for (let i = 0; i < newChapter.longQuestions.length; i++) {
      newChapter.longQuestions[i].id = `9_cs_ch${newChapter.number}_long_${(existingChapter.longQuestions?.length || 0) + i + 1}`;
    }
    if (!existingChapter.longQuestions) existingChapter.longQuestions = [];
    existingChapter.longQuestions.push(...newChapter.longQuestions);
    console.log(`Chapter ${newChapter.number}: Added ${newChapter.longQuestions.length} Long Questions (total: ${existingChapter.longQuestions.length})`);
  }
}

fs.writeFileSync('src/data/questions/9th/computer.json', JSON.stringify(existingData, null, 2));

console.log('Done!');
console.log('Total Long Questions:', chapters.reduce((sum, c) => sum + c.longQuestions.length, 0));
