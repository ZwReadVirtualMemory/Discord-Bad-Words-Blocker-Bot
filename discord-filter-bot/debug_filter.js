const { scanMessage } = require('./src/utils/filter.js');
const fs = require('fs');

const words = fs.readFileSync('discord_bad_words.txt', 'utf8').split(',');
console.log('Word list has "fuck":', words.includes('fuck'));
console.log('Word list has "cheating":', words.includes('cheating'));

const tests = [
  'FUUUUUCK OFF',
  'f.u.c.k you',
  'n1gg4 please'
];

tests.forEach(t => {
  const res = scanMessage(t, words);
  console.log(`Msg: "${t}" => ${res.triggered ? 'BLOCKED: ' + res.word : 'PASS'}`);
});
