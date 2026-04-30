const HOMOGLYPHS = {
  'a': 'àáâãäåāăąǎǟǡǻаαаạảấầẩẫậắằẳẵặ4@',
  'b': 'ḃḅḇβбв8',
  'c': 'çćĉċčс(',
  'd': 'ďđḋḍḏḑḓд',
  'e': 'èéêëēĕėęěѐеεẹẻẽếềểễệ3',
  'f': 'ḟƒ',
  'g': 'ĝğġģğ9',
  'h': 'ĥħн#',
  'i': 'ìíîïĩīĭįıǐΐίιіịỉ!1',
  'j': 'ĵјј',
  'k': 'ķκк',
  'l': 'ĺļľŀłι',
  'm': 'ṃḿм',
  'n': 'ñńņňŉŋπипн',
  'o': 'òóôõöøōŏőŏǒǭǿοоọỏốồổỗộớờởỡợ0',
  'p': 'ṕṗрρ',
  'q': 'զ',
  'r': 'ŕŗřгяр',
  's': 'śŝşšșѕ5$',
  't': 'ţťŧțт7+',
  'u': 'ùúûüũūŭůűųưǔǖǘǚǜυцụủứừửữựμ',
  'v': 'νв',
  'w': 'ŵωшщ',
  'x': 'ẋх',
  'y': 'ýÿŷγуყỵỷỹ',
  'z': 'źżž2',
};

function normalizeText(text) {
  let normalized = text.toLowerCase();
  normalized = normalized.replace(/[\u200B-\u200D\uFEFF\u200E\u200F\u2002-\u2006\u2008\u2009\u200A\u202F\u205F\u3000]/g, '');
  
  let result = '';
  for (const char of normalized) {
    let replaced = false;
    for (const [latin, variants] of Object.entries(HOMOGLYPHS)) {
      if (variants.includes(char)) {
        result += latin;
        replaced = true;
        break;
      }
    }
    if (!replaced) result += char;
  }
  return result;
}

function removeRepeatedChars(text) {
  return text.replace(/(.)\1+/g, '$1');
}

function getSkeleton(text) {
  return text.toLowerCase().replace(/[^a-z0-9]/g, '').replace(/[aeiouy]/g, '');
}

function levenshteinDistance(s1, s2) {
  const matrix = [];
  for (let i = 0; i <= s2.length; i++) matrix[i] = [i];
  for (let j = 0; j <= s1.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= s2.length; i++) {
    for (let j = 1; j <= s1.length; j++) {
      if (s2.charAt(i - 1) === s1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
      }
    }
  }
  return matrix[s2.length][s1.length];
}

function extractLettersOnly(text) {
  return text.replace(/[^a-z]/gi, '').toLowerCase();
}

function extractWithMinimalFiltering(text) {
  return text.replace(/[\W_]/g, '').toLowerCase();
}

function checkPatternMatch(content, targetWord) {
  const contentLetters = extractLettersOnly(content);
  const targetLetters = extractLettersOnly(targetWord);
  
  if (contentLetters === targetLetters) return true;
  
  const contentCluster = content.replace(/[^a-z]/gi, '').toLowerCase();
  const targetCluster = targetWord.replace(/[^a-z]/gi, '').toLowerCase();
  
  if (contentCluster === targetCluster) return true;
  
  if (targetCluster.length >= 3 && contentCluster.includes(targetCluster)) return true;
  
  return false;
}

function slidingWindowMatch(content, targetWord, windowSize = 2) {
  const contentClean = content.replace(/[^a-z]/gi, '').toLowerCase();
  const targetClean = targetWord.replace(/[^a-z]/gi, '').toLowerCase();
  
  if (contentClean.length < targetClean.length) return false;
  
  let matchedChars = 0;
  let lastMatchPos = -1;
  
  for (let i = 0; i < targetClean.length; i++) {
    const targetChar = targetClean[i];
    let found = false;
    
    for (let j = lastMatchPos + 1; j < contentClean.length; j++) {
      if (contentClean[j] === targetChar) {
        matchedChars++;
        lastMatchPos = j;
        found = true;
        break;
      }
    }
    
    if (!found) break;
  }
  
  return matchedChars >= targetClean.length * 0.85;
}

function analyzeWithDensity(content, targetWord) {
  const contentAlpha = extractLettersOnly(content);
  const targetAlpha = extractLettersOnly(targetWord);
  
  if (contentAlpha === targetAlpha) return true;
  
  if (targetAlpha.length >= 2 && contentAlpha.includes(targetAlpha)) return true;
  
  if (slidingWindowMatch(content, targetWord)) return true;
  
  return false;
}

function scanMessage(content, blockedWords) {
  const inviteRegex = /(?:discord\.gg|discord(?:app)?\.com\/invite)\/[a-zA-Z0-9-]{2,32}/i;
  if (inviteRegex.test(content)) return { triggered: true, word: 'discord-invite' };

  const normalized = normalizeText(content);
  const ultraClean = normalized.replace(/[^a-z0-9]/g, '');
  const noRepeat = removeRepeatedChars(normalized);
  
  const letters = normalized.match(/[a-z]/g) || [];
  const wordsInNorm = normalized.split(/\s+/).filter(w => w.length > 0);
  const avgLen = letters.length / wordsInNorm.length;
  
  let processedContent = normalized;
  if (avgLen < 1.5 && letters.length > 3) {
    processedContent = ultraClean; 
  }

  for (const word of blockedWords) {
    const cleanWord = word.trim().toLowerCase();
    if (cleanWord.length < 2) continue;

    if (analyzeWithDensity(content, cleanWord)) {
      return { triggered: true, word: cleanWord };
    }
    
    const escapedWord = cleanWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const wordRegex = new RegExp(`\\b${escapedWord}\\b`, 'i');
    if (wordRegex.test(normalized) || wordRegex.test(noRepeat) || wordRegex.test(ultraClean)) {
      return { triggered: true, word: cleanWord };
    }

    const wordSkeleton = getSkeleton(cleanWord);
    if (wordSkeleton.length >= 2) {
      const msgSkeleton = getSkeleton(normalized);
      const msgSkeletonNoRepeat = getSkeleton(noRepeat);
      
      if (msgSkeleton === wordSkeleton || msgSkeletonNoRepeat === wordSkeleton) {
         return { triggered: true, word: cleanWord };
      }

      const tokens = normalized.split(/[^a-z0-9]+/).concat(noRepeat.split(/[^a-z0-9]+/));
      for (const token of tokens) {
        if (token.length < 2) continue;
        const tokenSkeleton = getSkeleton(token);
        if (tokenSkeleton === wordSkeleton) {
          return { triggered: true, word: cleanWord };
        }
      }
      
      if (processedContent === ultraClean && wordSkeleton.length >= 3) {
        if (msgSkeleton.includes(wordSkeleton)) return { triggered: true, word: cleanWord };
      }
    }

    if (cleanWord.length >= 4) {
      const tokens = normalized.split(/[^a-z0-9]+/).filter(t => t.length >= 3);
      for (const token of tokens) {
        const distance = levenshteinDistance(cleanWord, token);
        const threshold = Math.floor(cleanWord.length * 0.25);
        if (distance <= threshold && distance > 0) return { triggered: true, word: cleanWord };
      }
    }
  }

  return { triggered: false };
}

module.exports = { scanMessage };
