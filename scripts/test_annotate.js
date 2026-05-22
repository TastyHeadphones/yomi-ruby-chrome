const fs = require('fs');
const path = require('path');

// Mock globalThis
globalThis.YomiRubyJapanese = null;
globalThis.YomiRubyRuby = null;

// Load japanese.js
const japaneseJs = fs.readFileSync(path.join(__dirname, '../utils/japanese.js'), 'utf8');
eval(japaneseJs);
const Japanese = globalThis.YomiRubyJapanese;

// Load ruby.js
const rubyJs = fs.readFileSync(path.join(__dirname, '../utils/ruby.js'), 'utf8');
eval(rubyJs);
const Ruby = globalThis.YomiRubyRuby;

const MOCK_CHAR_READINGS = {
  日: "にち",
  本: "ほん",
  人: "ひと",
  学: "がく",
  校: "こう",
  生: "せい",
  私: "わたし",
  先: "せん",
  語: "ご",
  食: "しょく",
  見: "み",
  行: "い",
  来: "き",
  時: "じ",
  間: "かん",
  東: "とう",
  京: "きょう"
};

const FALLBACK_WORD_READINGS = [
  ["イラン", "いらん"],
  ["テヘラン", "てへらん"],
  ["ペルシア", "ぺるしあ"],
  ["ペルシャ", "ぺるしゃ"],
  ["伊朗", "いらん"],
  ["伊蘭", "いらん"]
];

function isApiCompatibleChar(char) {
  if (Japanese.containsJapanese(char)) {
    return true;
  }
  if (/[\u30A0-\u30FF\uFF66-\uFF9F]/u.test(char)) {
    return true;
  }
  if (/[\u0020-\u007E]/u.test(char)) {
    return true;
  }
  if (/[\u3000-\u303F\uFF01-\uFF60]/u.test(char)) {
    return true;
  }
  return false;
}

function splitSentenceIntoApiCompatibleSegments(text) {
  const segments = [];
  let buffer = "";
  let currentRequestable = null;

  for (const char of text) {
    const requestable = isApiCompatibleChar(char);
    if (currentRequestable === null) {
      currentRequestable = requestable;
      buffer = char;
      continue;
    }
    if (requestable === currentRequestable) {
      buffer += char;
      continue;
    }
    segments.push({ text: buffer, requestable: currentRequestable });
    buffer = char;
    currentRequestable = requestable;
  }

  if (buffer) {
    segments.push({ text: buffer, requestable: Boolean(currentRequestable) });
  }

  return segments;
}

function splitTextIntoSentenceUnits(text) {
  if (!text) {
    return [];
  }
  const units = [];
  const sentenceRegex = /[^。．！？!?\n]+[。．！？!?\n]*/gu;
  let lastIndex = 0;
  let match = sentenceRegex.exec(text);

  while (match) {
    if (match.index > lastIndex) {
      units.push(text.slice(lastIndex, match.index));
    }
    units.push(match[0]);
    lastIndex = sentenceRegex.lastIndex;
    match = sentenceRegex.exec(text);
  }

  if (lastIndex < text.length) {
    units.push(text.slice(lastIndex));
  }

  return units.filter((unit) => unit.length > 0);
}

function buildDictionaryTokens(text, dictionaryIndex, characterReadings) {
  const tokens = [];
  let index = 0;

  let nextLookupIndex = -1;
  let nextLookupResult = null;

  function getLongestEntry(idx) {
    if (idx === nextLookupIndex) {
      return nextLookupResult;
    }
    const res = findLongestDictionaryEntry(text, idx, dictionaryIndex);
    nextLookupIndex = idx;
    nextLookupResult = res;
    return res;
  }

  while (index < text.length) {
    const longestWord = getLongestEntry(index);
    if (longestWord) {
      tokens.push({ surface: longestWord.surface, furigana: longestWord.reading });
      index += longestWord.surface.length;
      continue;
    }

    const currentChar = text[index];
    if (Japanese.isKanji(currentChar)) {
      tokens.push({
        surface: currentChar,
        furigana: characterReadings[currentChar] || ""
      });
      index += 1;
      continue;
    }

    const start = index;
    index += 1;
    while (index < text.length) {
      const hasWordMatch = getLongestEntry(index);
      const isKanji = Japanese.isKanji(text[index]);
      if (hasWordMatch || isKanji) {
        break;
      }
      index += 1;
    }
    tokens.push({ surface: text.slice(start, index), furigana: "" });
  }

  return mergePlainTokens(tokens);
}

function mergePlainTokens(tokens) {
  const merged = [];
  for (const token of tokens) {
    if (!token.surface) {
      continue;
    }
    const previous = merged[merged.length - 1];
    if (previous && !previous.furigana && !token.furigana) {
      previous.surface += token.surface;
    } else {
      merged.push({ surface: token.surface, furigana: token.furigana || "" });
    }
  }
  return merged;
}

function createDictionaryNode() {
  return {
    children: Object.create(null),
    matches: []
  };
}

function insertDictionaryEntry(root, surface, reading) {
  if (!surface || !reading) {
    return;
  }
  let node = root;
  for (const char of surface) {
    if (!node.children[char]) {
      node.children[char] = createDictionaryNode();
    }
    node = node.children[char];
  }
  if (!node.matches.some((match) => match.reading === reading)) {
    node.matches.push({ surface, reading });
  }
}

function buildDictionaryIndex(entries) {
  const root = createDictionaryNode();
  const seenSurfaces = new Set();

  for (const entry of entries) {
    insertDictionaryEntry(root, entry.surface, entry.reading);
    seenSurfaces.add(entry.surface);
  }

  for (const [surface, reading] of FALLBACK_WORD_READINGS) {
    if (surface && reading && !seenSurfaces.has(surface)) {
      insertDictionaryEntry(root, surface, reading);
    }
  }

  return root;
}

function findLongestDictionaryEntry(text, startIndex, dictionaryIndex) {
  const firstChar = text[startIndex];
  let node = dictionaryIndex.children[firstChar];
  if (!node) {
    return null;
  }
  let bestMatch = node.matches.length > 0 ? node.matches[0] : null;

  for (let cursor = startIndex + 1; cursor < text.length; cursor += 1) {
    const char = text[cursor];
    node = node.children[char];
    if (!node) {
      break;
    }
    if (node.matches.length > 0) {
      bestMatch = node.matches[0];
    }
  }
  return bestMatch;
}

function normalizeLocalDictionaryPayload(payload) {
  const rawEntries = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.entries)
      ? payload.entries
      : [];

  return rawEntries
    .map((entry) => {
      if (Array.isArray(entry)) {
        const readingIndex = entry.length > 11 ? 11 : 1;
        return {
          surface: typeof entry[0] === "string" ? entry[0].trim() : "",
          reading: typeof entry[readingIndex] === "string" ? entry[readingIndex].trim() : ""
        };
      }
      return {
        surface: typeof entry?.surface === "string" ? entry.surface.trim() : "",
        reading: typeof entry?.reading === "string" ? entry.reading.trim() : ""
      };
    })
    .filter(
      (entry) =>
        entry.surface.length > 0 &&
        entry.reading.length > 0 &&
        entry.reading !== "*" &&
        Japanese.containsKanji(entry.surface)
    );
}

// Load dictionary
const startParse = Date.now();
const dictPayload = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/local-annotate-dict.json'), 'utf8'));
const normalizedEntries = normalizeLocalDictionaryPayload(dictPayload);

console.log("Checking if 伊朗 or 伊蘭 is in the entries:");
const matchesIran = normalizedEntries.filter(e => e.surface === "伊朗" || e.surface === "伊蘭");
console.log(matchesIran);

console.log("Checking entries for 下, 上, 中, 語, 者:");
console.log("下:", normalizedEntries.filter(e => e.surface === "下"));
console.log("上:", normalizedEntries.filter(e => e.surface === "上"));
console.log("中:", normalizedEntries.filter(e => e.surface === "中"));
console.log("語:", normalizedEntries.filter(e => e.surface === "語"));
console.log("者:", normalizedEntries.filter(e => e.surface === "者"));

const dictIndex = buildDictionaryIndex(normalizedEntries);
console.log(`Indexed dictionary in ${Date.now() - startParse}ms. Size: ${normalizedEntries.length} entries.`);

// Read Wikipedia HTML from content.md
const contentFilePath = '/Users/yang/.gemini/antigravity-cli/brain/d542b1c6-a32b-474b-8cb9-4864bcc0706a/.system_generated/steps/459/content.md';
const rawHtml = fs.readFileSync(contentFilePath, 'utf8');

const blockRegex = /<(p|li|dd|dt|blockquote|td|th|h[1-6])\b[^>]*>([\s\S]*?)<\/\1>/gi;
let match;
const allAnnotatedTokens = [];

while ((match = blockRegex.exec(rawHtml)) !== null) {
  const blockContent = match[2];
  const textNodes = blockContent.split(/<[^>]+>/);
  
  for (const rawTextNode of textNodes) {
    const textNodeVal = rawTextNode
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#160;/g, ' ')
      .replace(/&nbsp;/g, ' ');

    if (!textNodeVal.trim()) {
      continue;
    }
    if (!Japanese.containsKanji(textNodeVal)) {
      continue;
    }

    const sentenceUnits = splitTextIntoSentenceUnits(textNodeVal);
    for (const sentence of sentenceUnits) {
      const segments = splitSentenceIntoApiCompatibleSegments(sentence);
      for (const segment of segments) {
        const segmentText = segment.text;
        if (!segment.requestable || !Japanese.containsKanji(segmentText)) {
          continue;
        }
        const tokens = buildDictionaryTokens(segmentText, dictIndex, MOCK_CHAR_READINGS);
        for (const token of tokens) {
          if (Japanese.containsKanji(token.surface)) {
            allAnnotatedTokens.push(token);
          }
        }
      }
    }
  }
}

// Find single-character tokens that are Kanji and print their distribution
const kanjiWordMap = new Map();
for (const token of allAnnotatedTokens) {
  const key = `${token.surface} -> ${token.furigana}`;
  kanjiWordMap.set(key, (kanjiWordMap.get(key) || 0) + 1);
}

const sortedWords = [...kanjiWordMap.entries()].sort((a, b) => b[1] - a[1]);
console.log("TOP ANNOTATED KANJI WORDS/CHARS:");
console.log(sortedWords.slice(0, 100));

console.log("\nSINGLE CHARACTER KANJI TOKENS WITH READINGS:");
const singleCharKanji = sortedWords.filter(entry => entry[0].split(" -> ")[0].length === 1);
console.log(singleCharKanji.slice(0, 50));
