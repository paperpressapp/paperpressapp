const fs = require('fs');

const content = fs.readFileSync('src/data/questions/9th/computershort.txt', 'utf8');
const lines = content.split('\n');

const chapters = [];
let currentChapter = null;
let currentSection = null;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  
  if (line.startsWith('CHAPTER')) {
    const match = line.match(/CHAPTER\s*(\d+):\s*(.+)/i);
    if (match) {
      if (currentChapter) chapters.push(currentChapter);
      currentChapter = {
        id: `9_cs_ch${match[1]}`,
        number: parseInt(match[1]),
        name: match[2].trim(),
        mcqs: [],
        shortQuestions: [],
        longQuestions: []
      };
    }
    continue;
  }
  
  if (line.includes('Exercise Short Questions') || line.includes('Additional Short Questions')) {
    currentSection = line;
    continue;
  }
  
  if (currentChapter && line.length > 10 && !line.includes('?')) {
    const qMatch = line.match(/^[A-Z][^?]+\?$/);
    if (qMatch) {
      currentChapter.shortQuestions.push({
        id: `9_cs_ch${currentChapter.number}_short_${currentChapter.shortQuestions.length + 1}`,
        questionText: line,
        difficulty: 'medium',
        marks: 2
      });
    }
  }
  
  if (currentChapter && line.includes('?') && !line.startsWith('What') && !line.startsWith('Explain') && !line.startsWith('Describe') && !line.startsWith('Differentiate') && !line.startsWith('Define') && !line.startsWith('List') && !line.startsWith('How') && !line.startsWith('Why') && !line.startsWith('When') && !line.startsWith('Where') && !line.startsWith('Who')) {
    continue;
  }
  
  if (currentChapter && (line.startsWith('What') || line.startsWith('Explain') || line.startsWith('Describe') || line.startsWith('Differentiate') || line.startsWith('Define') || line.startsWith('List') || line.startsWith('How') || line.startsWith('Why') || line.startsWith('When') || line.startsWith('Where') || line.startsWith('Who') || line.startsWith('Give') || line.startsWith('State') || line.startsWith('Write') || line.startsWith('Convert') || line.startsWith('Add') || line.startsWith('Subtract') || line.startsWith('Multiply') || line.startsWith('Divide') || line.startsWith('Perform'))) {
    if (line.includes('?')) {
      currentChapter.shortQuestions.push({
        id: `9_cs_ch${currentChapter.number}_short_${currentChapter.shortQuestions.length + 1}`,
        questionText: line,
        difficulty: 'medium',
        marks: 2
      });
    }
  }
}

if (currentChapter) chapters.push(currentChapter);

console.log(`Parsed ${chapters.length} chapters`);
chapters.forEach(c => console.log(`  Chapter ${c.number}: ${c.name} - ${c.shortQuestions.length} Short Questions`));

const existingData = JSON.parse(fs.readFileSync('src/data/questions/9th/computer.json', 'utf8'));

for (const newChapter of chapters) {
  const existingChapter = existingData.chapters.find(c => c.number === newChapter.number);
  if (existingChapter && newChapter.shortQuestions.length > 0) {
    for (let i = 0; i < newChapter.shortQuestions.length; i++) {
      newChapter.shortQuestions[i].id = `9_cs_ch${newChapter.number}_short_${existingChapter.shortQuestions.length + i + 1}`;
    }
    existingChapter.shortQuestions.push(...newChapter.shortQuestions);
    console.log(`Chapter ${newChapter.number}: Added ${newChapter.shortQuestions.length} Short Questions (total: ${existingChapter.shortQuestions.length})`);
  }
}

fs.writeFileSync('src/data/questions/9th/computer.json', JSON.stringify(existingData, null, 2));

console.log('Done!');
console.log('Total Short Questions:', chapters.reduce((sum, c) => sum + c.shortQuestions.length, 0));
