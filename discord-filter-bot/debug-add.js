const fs = require('fs');
const path = require('path');

function levenshteinDistance(s1, s2) {
  const matrix = [];
  for (let i = 0; i <= s2.length; i++) matrix[i] = [i];
  for (let j = 0; j <= s1.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= s2.length; i++) {
    for (let j = 1; j <= s1.length; j++) {
      if (s2.charAt(i - 1) === s1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[s2.length][s1.length];
}

const badWordsPath = path.join(__dirname, 'discord_bad_words.txt');
const wordsData = fs.readFileSync(badWordsPath, 'utf-8');
const blockedWords = wordsData
  .split(',')
  .map(w => w.trim().replace(/^_+/, ''))
  .filter(w => w.length > 0);

console.log('Checking why "add" is being blocked:');
const testWord = 'add';
for (const word of blockedWords.slice(0, 100)) {
  const distance = levenshteinDistance(word, testWord);
  const threshold = Math.ceil(word.length * 0.25);
  if (distance <= threshold && distance > 0) {
    console.log(`  ${word} (len=${word.length}): distance=${distance}, threshold=${threshold}`);
  }
}
