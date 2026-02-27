const fs = require('fs');

const content = fs.readFileSync('src/data/questions/11th/chem_short.txt', 'utf8');
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
        shortQuestions: []
      };
    }
    continue;
  }
  
  if (currentChapter && (line.startsWith('Q.') || line.match(/^[a-z]+\)/i) || line.match(/^[a-z]{2,}\)/i))) {
    if (line.length > 10 && line.includes('?')) {
      let qText = line.replace(/^[a-z]+\)\s*/i, '').trim();
      if (qText.startsWith('a)') || qText.startsWith('b)')) {
        qText = line.split(/\)\s*/).slice(1).join(') ').trim();
      }
      
      if (qText.includes('?')) {
        currentChapter.shortQuestions.push({
          id: `11_chem_ch${currentChapter.number}_short_${currentChapter.shortQuestions.length + 1}`,
          questionText: qText,
          difficulty: 'medium',
          marks: 2
        });
      }
    }
  }
}

if (currentChapter) chapters.push(currentChapter);

console.log(`Parsed ${chapters.length} chapters`);
chapters.forEach(c => console.log(`  Chapter ${c.number}: ${c.shortQuestions.length} Short Questions`));

const existingData = JSON.parse(fs.readFileSync('src/data/questions/11th/chemistry.json', 'utf8'));

for (const newChapter of chapters) {
  const existingChapter = existingData.chapters.find(c => c.number === newChapter.number);
  if (existingChapter && newChapter.shortQuestions.length > 0) {
    for (let i = 0; i < newChapter.shortQuestions.length; i++) {
      newChapter.shortQuestions[i].id = `11_chem_ch${newChapter.number}_short_${(existingChapter.shortQuestions?.length || 0) + i + 1}`;
    }
    if (!existingChapter.shortQuestions) existingChapter.shortQuestions = [];
    existingChapter.shortQuestions.push(...newChapter.shortQuestions);
    console.log(`Chapter ${newChapter.number}: Added ${newChapter.shortQuestions.length} Short Questions (total: ${existingChapter.shortQuestions.length})`);
  }
}

fs.writeFileSync('src/data/questions/11th/chemistry.json', JSON.stringify(existingData, null, 2));

console.log('Done!');
console.log('Total Short Questions:', chapters.reduce((sum, c) => sum + c.shortQuestions.length, 0));
