const { scanMessage } = require('./src/utils/filter.js');
const fs = require('fs');
const path = require('path');

const badWordsPath = path.join(__dirname, 'discord_bad_words.txt');
const wordsData = fs.readFileSync(badWordsPath, 'utf-8');
const blockedWords = wordsData
  .split(',')
  .map(w => w.trim().replace(/^_+/, ''))
  .filter(w => w.length > 0);

const tests = [
  'add',
  'add the spoof method to the class',
  'go cheating at the tournament',
  'this is exploiting the bug',
  'spoof your location now',
];

tests.forEach(test => {
  const result = scanMessage(test, blockedWords);
  console.log(`"${test}"`);
  console.log(`  => ${result.triggered ? `BLOCKED: ${result.word}` : 'PASS'}`);
});
