const fs = require('fs');

const content = fs.readFileSync('src/data/questions/11th/computermcqupdate.txt', 'utf8');
const lines = content.split('\n');

const chapters = [];
let currentChapter = null;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  
  if (line.startsWith('UNIT ') && line.includes('ADDITIONAL')) {
    if (currentChapter) chapters.push(currentChapter);
    
    const match = line.match(/UNIT (\d+): (.+?) - ADDITIONAL/i);
    if (match) {
      currentChapter = {
        number: parseInt(match[1]),
        name: match[2].trim(),
        mcqs: []
      };
    }
    continue;
  }
  
  if (currentChapter && line.includes('a)') && line.includes('b)')) {
    let raw = line;
    
    const qMatch = raw.match(/^(.+?)\s+[a]\)/);
    if (!qMatch) continue;
    const questionText = qMatch[1].trim();
    
    const optStrings = [];
    const optMatches = raw.matchAll(/([a-d]\))\s*([^a-d][^\s].*?)(?=\s+[a-d]\)|$)/g);
    for (const m of optMatches) {
      optStrings.push(m[2].trim());
    }
    
    if (optStrings.length < 4) {
      const simple = raw.split(/(?<=[a-d]\))/);
      optStrings.length = 0;
      for (const s of simple) {
        const t = s.trim();
        if (t.match(/^[a-d]\)/)) {
          optStrings.push(t.substring(2).trim());
        }
      }
    }
    
    if (optStrings.length >= 4) {
      let correctOption = 0;
      const options = optStrings.slice(0, 4).map((opt, idx) => {
        if (opt.includes('✅')) {
          correctOption = idx;
          return opt.replace('✅', '').trim();
        }
        return opt;
      });
      
      if (options.length === 4) {
        currentChapter.mcqs.push({
          id: '',
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

const existingData = JSON.parse(fs.readFileSync('src/data/questions/11th/computer.json', 'utf8'));

for (const newChapter of chapters) {
  const existingChapter = existingData.chapters.find(c => c.number === newChapter.number);
  if (existingChapter && newChapter.mcqs.length > 0) {
    const startCount = existingChapter.mcqs.length;
    for (let i = 0; i < newChapter.mcqs.length; i++) {
      newChapter.mcqs[i].id = `11_cs_ch${newChapter.number}_mcq_${startCount + i + 1}`;
    }
    existingChapter.mcqs.push(...newChapter.mcqs);
    console.log(`Chapter ${newChapter.number}: Added ${newChapter.mcqs.length} MCQs (total: ${existingChapter.mcqs.length})`);
  }
}

fs.writeFileSync('src/data/questions/11th/computer.json', JSON.stringify(existingData, null, 2));

console.log('Done!');
