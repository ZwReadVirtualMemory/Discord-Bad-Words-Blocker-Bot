const { scanMessage } = require('./src/utils/filter.js');
const fs = require('fs');

const words = fs.readFileSync('discord_bad_words.txt', 'utf8').split(',');
const target = 'niiiiiiiii../32,f2.//gggg/er/rrrrr';


function normalizeText(text) {
  let normalized = text.toLowerCase();
  normalized = normalized.replace(/[\u200B-\u200D\uFEFF\u200E\u200F\u2002-\u2006\u2008\u2009\u200A\u202F\u205F\u3000]/g, '');
  return normalized;
}

function removeRepeatedChars(text) {
  return text.replace(/(.)\1+/g, '$1');
}

const normalized = normalizeText(target);
const noRepeat = removeRepeatedChars(normalized);
const ultraClean = normalized.replace(/[^a-z]/g, '');
const ultraCleanNoRepeat = noRepeat.replace(/[^a-z]/g, '');

console.log('Normalized:', normalized);
console.log('NoRepeat:', noRepeat);
console.log('UltraClean:', ultraClean);
console.log('UltraCleanNoRepeat:', ultraCleanNoRepeat);

const res = scanMessage(target, words);
console.log('Result:', res);
