const { scanMessage } = require('./src/utils/filter.js');
const fs = require('fs');
const path = require('path');

const badWordsPath = path.join(__dirname, 'discord_bad_words.txt');
const wordsData = fs.readFileSync(badWordsPath, 'utf-8');
const blockedWords = wordsData
  .split(',')
  .map(w => w.trim().replace(/^_+/, ''))
  .filter(w => w.length > 0);

console.log('EXTREME DIFFICULTY FILTER TEST - Finding All Edge Cases & False Positives');
console.log('Total blocked words:', blockedWords.length);
console.log('='.repeat(80));

const testCases = [

  { msg: 'good morning everyone', should: 'PASS', cat: 'Normal chat' },
  { msg: 'how was your day', should: 'PASS', cat: 'Normal chat' },
  { msg: 'im having a great time', should: 'PASS', cat: 'Normal chat' },
  { msg: 'lets go to the class room', should: 'PASS', cat: 'Normal chat' },
  { msg: 'i need to focus on my assignment', should: 'PASS', cat: 'Normal chat' },
  { msg: 'what the hell are you doing', should: 'BLOCK', cat: 'Normal chat with swear' },
  { msg: 'see you later man', should: 'PASS', cat: 'Normal goodbye' },
  { msg: 'awesome bro thats cool', should: 'PASS', cat: 'Positive feedback' },
  { msg: 'no way dude seriously', should: 'PASS', cat: 'Disbelief expression' },
  { msg: 'my bad i forgot', should: 'PASS', cat: 'Apology' },
  { msg: 'my ass is sore from sitting', should: 'BLOCK', cat: 'Legitimate sentence with ass' },
  
 
  { msg: 'fr fr no cap', should: 'PASS', cat: 'Gen-Z slang' },
  { msg: 'lowkey thats fire', should: 'PASS', cat: 'Gen-Z slang' },
  { msg: 'highkey sus ngl', should: 'PASS', cat: 'Gen-Z slang' },
  { msg: 'fax fam thats facts', should: 'PASS', cat: 'AAVE slang' },
  { msg: 'yo whats good my guy', should: 'PASS', cat: 'Casual greeting' },
  { msg: 'thanks fam appreciate it', should: 'PASS', cat: 'Thanks' },
  { msg: 'nah bro im good', should: 'PASS', cat: 'Dismissal' },
  { msg: 'deadass that was wild', should: 'PASS', cat: 'Emphasis' },
  

  { msg: 'hashing the password', should: 'PASS', cat: 'Programming' },
  { msg: 'exploit the vulnerability responsibly', should: 'PASS', cat: 'Security research' },
  { msg: 'chess cheating is bad', should: 'PASS', cat: 'Discussion' },
  { msg: 'add the spoof method to the class', should: 'PASS', cat: 'Programming' },
  { msg: 'the assassination of archduke franz ferdinand', should: 'PASS', cat: 'History' },
  { msg: 'classic game with great graphics', should: 'PASS', cat: 'Game review' },
  { msg: 'the dashboard shows great stats', should: 'PASS', cat: 'Dashboard' },
  { msg: 'address the issue immediately', should: 'PASS', cat: 'Business' },
  { msg: 'assessment results are in', should: 'PASS', cat: 'Education' },
  { msg: 'assets are loaded', should: 'PASS', cat: 'Programming' },
  

  { msg: 'fuck you asshole', should: 'BLOCK', cat: 'Profanity' },
  { msg: 'go cheating at the tournament', should: 'BLOCK', cat: 'Cheating accusation' },
  { msg: 'using an aimbot right now', should: 'BLOCK', cat: 'Hacking' },
  { msg: 'wallhack enabled lets go', should: 'BLOCK', cat: 'Hacking' },
  { msg: 'speedhack makes you faster', should: 'BLOCK', cat: 'Hacking' },
  { msg: 'this is exploiting the bug', should: 'BLOCK', cat: 'Cheating' },
  { msg: 'spoof your location now', should: 'BLOCK', cat: 'Spoofing' },
  

  { msg: 'FUUUUUCK OFF', should: 'BLOCK', cat: 'Obfuscation - repetition' },
  { msg: 'f_u_c_k_i_n_g hell', should: 'BLOCK', cat: 'Obfuscation - punctuation' },
  { msg: 'n1gg4 please', should: 'BLOCK', cat: 'Obfuscation - leet (fixed)' },
  { msg: 'NIGGHA', should: 'BLOCK', cat: 'Obfuscation - vowel removal' },
  { msg: 'f.u.c.k you', should: 'BLOCK', cat: 'Obfuscation - dots' },
  { msg: 'f-u-c-k off', should: 'BLOCK', cat: 'Obfuscation - dashes' },
  { msg: 'f   u   c   k   y   o   u', should: 'BLOCK', cat: 'Obfuscation - spaces' },
  { msg: 'f\u200Bu\u200Bc\u200Bk', should: 'BLOCK', cat: 'Obfuscation - zero-width space' },
  { msg: 'f\nu\nc\nk', should: 'BLOCK', cat: 'Obfuscation - vertical' },
  

  { msg: 'fúck this', should: 'BLOCK', cat: 'Homoglyph - accent' },
  { msg: 'fцсk off', should: 'BLOCK', cat: 'Homoglyph - cyrillic' },
  { msg: 'fμck you', should: 'BLOCK', cat: 'Homoglyph - greek' },
  { msg: 'nіgga', should: 'BLOCK', cat: 'Homoglyph - i' },
  { msg: 'аsshole', should: 'BLOCK', cat: 'Homoglyph - a' },
  { msg: 'shіt', should: 'BLOCK', cat: 'Homoglyph - i' },
  

  { msg: 'the class discussion was good', should: 'PASS', cat: 'Word with ass inside' },
  { msg: 'classical music is great', should: 'PASS', cat: 'Classical' },
  { msg: 'massively multiplayer online game', should: 'PASS', cat: 'Massive' },
  { msg: 'passport verification required', should: 'PASS', cat: 'Passport' },
  { msg: 'harassing people is wrong', should: 'BLOCK', cat: 'Harassing' },
  { msg: 'assassinate the boss in the game', should: 'PASS', cat: 'Game strategy' },
  { msg: 'glass shatters easily', should: 'PASS', cat: 'Glass' },
  { msg: 'grass is green in spring', should: 'PASS', cat: 'Grass' },
  { msg: 'compass points north', should: 'PASS', cat: 'Compass' },
  { msg: 'assessment is key', should: 'PASS', cat: 'Assessment' },
  

  { msg: 'f.u.ck', should: 'BLOCK', cat: 'Partial dot' },
  { msg: 'f.u..c..k', should: 'BLOCK', cat: 'Multi dot' },
  { msg: 'f_u_c_k', should: 'BLOCK', cat: 'Underscore' },
  { msg: 'f|u|c|k', should: 'BLOCK', cat: 'Pipe' },
  { msg: 'f/u/c/k', should: 'BLOCK', cat: 'Slash' },
  { msg: 'f\\\\u\\\\c\\\\k', should: 'BLOCK', cat: 'Backslash' },
  { msg: 'f[u]c{k}', should: 'BLOCK', cat: 'Brackets' },
  

  { msg: 'wtf is this', should: 'PASS', cat: 'Abbreviation' },
  { msg: 'wth seriously', should: 'PASS', cat: 'Abbreviation' },
  { msg: 'omg that was crazy', should: 'PASS', cat: 'Abbreviation' },
  { msg: 'brb i have to go', should: 'PASS', cat: 'Slang' },
  { msg: 'with all due respect', should: 'PASS', cat: 'Common phrase' },
  { msg: 'within the rules', should: 'PASS', cat: 'Common phrase' },
  

  { msg: 'beat them 10-0 in the final', should: 'PASS', cat: 'Gaming' },
  { msg: 'that team is trash tier', should: 'BLOCK', cat: 'Gaming insult' },
  { msg: 'we won the championship match', should: 'PASS', cat: 'Gaming' },
  { msg: 'the graphics are amazing', should: 'PASS', cat: 'Game review' },
  

  { msg: 'my back hurts from practicing all day', should: 'PASS', cat: 'Real world' },
  { msg: 'she passed the test easily', should: 'PASS', cat: 'Real world' },
  { msg: 'we have class at 9am tomorrow', should: 'PASS', cat: 'Real world' },
  { msg: 'the pass code is 1234', should: 'PASS', cat: 'Real world' },
  { msg: 'disaster struck the town', should: 'PASS', cat: 'Real world' },
  { msg: 'the mast fell during the storm', should: 'PASS', cat: 'Real world' },
  { msg: 'cast your vote now', should: 'PASS', cat: 'Real world' },
  { msg: 'last night was amazing', should: 'PASS', cat: 'Real world' },
  { msg: 'fast food is unhealthy', should: 'PASS', cat: 'Real world' },
  { msg: 'the massive explosion was loud', should: 'PASS', cat: 'Real world' },
  { msg: 'classy lady walking by', should: 'PASS', cat: 'Real world' },
  { msg: 'classic car show today', should: 'PASS', cat: 'Real world' },
  { msg: 'grassroots movement started', should: 'PASS', cat: 'Real world' },
  { msg: 'glassware is fragile', should: 'PASS', cat: 'Real world' },
];


let passed = 0;
let failed = 0;
const failedTests = [];

console.log('\nTest Results:');
console.log('─'.repeat(80));

testCases.forEach((test, idx) => {
  const result = scanMessage(test.msg, blockedWords);
  const isBlocked = result.triggered;
  const expected = test.should === 'BLOCK';
  const success = isBlocked === expected;
  
  if (success) {
    passed++;
  } else {
    failed++;
    failedTests.push({
      idx: idx + 1,
      msg: test.msg,
      expected: test.should,
      got: isBlocked ? `BLOCKED: ${result.word}` : 'PASS',
      cat: test.cat
    });
  }
});


if (failedTests.length > 0) {
  console.log('\nFAILED TESTS:');
  console.log('─'.repeat(80));
  failedTests.forEach(test => {
    console.log(`[${test.idx}] ${test.cat}`);
    console.log(`    Message: "${test.msg}"`);
    console.log(`    Expected: ${test.expected}, Got: ${test.got}`);
  });
}

console.log('\n' + '═'.repeat(80));
console.log(`RESULTS: ${passed} passed, ${failed} failed out of ${testCases.length} tests`);
console.log(`Pass Rate: ${((passed / testCases.length) * 100).toFixed(1)}%`);
console.log('═'.repeat(80));

if (failed > 0) {
  console.log('\nCRITICAL ISSUES:');
  failedTests.slice(0, 5).forEach(test => {
    console.log(`  - "${test.msg}": Expected ${test.expected} but got ${test.got}`);
  });
}
