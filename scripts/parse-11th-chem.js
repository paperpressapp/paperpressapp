const fs = require('fs');

const content = fs.readFileSync('src/data/questions/11th/chem_mcqs.txt', 'utf8');
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
        id: `11_chem_ch${match[1]}`,
        number: parseInt(match[1]),
        name: match[2].trim(),
        mcqs: [],
        shortQuestions: [],
        longQuestions: []
      };
    }
    continue;
  }
  
  if (currentChapter && line.includes('a)') && line.includes('b)')) {
    let raw = line;
    
    const qMatch = raw.match(/^(.+?)\s+([a-d])\)/);
    if (!qMatch) continue;
    const questionText = qMatch[1].replace(/✓|✅/g, '').trim();
    
    const optStrings = [];
    const regex = /([a-d]\))\s*([^\s].*?)(?=\s+[a-d]\)|$)/g;
    let match;
    
    while ((match = regex.exec(raw)) !== null) {
      optStrings.push(match[2].trim());
    }
    
    if (optStrings.length >= 4) {
      let correctOption = 0;
      const options = optStrings.slice(0, 4).map((opt, idx) => {
        if (opt.includes('✓') || opt.includes('✅')) {
          correctOption = idx;
          return opt.replace(/✓|✅/g, '').trim();
        }
        return opt;
      });
      
      if (options.length === 4) {
        currentChapter.mcqs.push({
          id: `11_chem_ch${currentChapter.number}_mcq_${currentChapter.mcqs.length + 1}`,
          questionText: questionText,
          options: options,
          correctOption: correctOption,
          difficulty: 'medium',
          marks: 1
        });
      }
    }
  }
}

if (currentChapter) chapters.push(currentChapter);

console.log(`Parsed ${chapters.length} chapters`);
chapters.forEach(c => console.log(`  Chapter ${c.number}: ${c.name} - ${c.mcqs.length} MCQs`));

const chemistryData = {
  class: '11th',
  subject: 'Chemistry',
  chapters: chapters
};

fs.writeFileSync('src/data/questions/11th/chemistry.json', JSON.stringify(chemistryData, null, 2));

console.log('Done! Created new 11th Chemistry JSON');
console.log('Total MCQs:', chapters.reduce((sum, c) => sum + c.mcqs.length, 0));
