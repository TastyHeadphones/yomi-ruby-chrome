const fs = require('fs');
const path = require('path');

// Mock globalThis
globalThis.YomiRubyJapanese = null;
globalThis.YomiRubyRuby = null;

// Load japanese.js
const japaneseJs = fs.readFileSync(path.join(__dirname, '../utils/japanese.js'), 'utf8');
eval(japaneseJs);
const Japanese = globalThis.YomiRubyJapanese;

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
  ["日本語", "にほんご"],
  ["東京都", "とうきょうと"],
  ["日本人", "にほんじん"],
  ["東京", "とうきょう"],
  ["大阪", "おおさか"],
  ["京都", "きょうと"],
  ["日本", "にほん"],
  ["今日", "きょう"],
  ["明日", "あした"],
  ["昨日", "きのう"],
  ["私", "わたし"],
  ["学生", "がくせい"],
  ["先生", "せんせい"],
  ["大学", "だいがく"],
  ["学校", "がっこう"],
  ["漢字", "かんじ"],
  ["勉強", "べんきょう"],
  ["時間", "じかん"],
  ["言葉", "ことば"],
  ["読書", "どくしょ"],
  ["図書館", "としょかん"],
  ["新幹線", "しんかんせん"],
  ["電車", "でんしゃ"],
  ["会社", "かいしゃ"],
  ["仕事", "しごと"],
  ["天気", "てんき"],
  ["新聞", "しんぶん"],
  ["音楽", "おんがく"],
  ["映画", "えいが"],
  ["料理", "りょうり"],
  ["伊朗", "いらん"],
  ["伊蘭", "いらん"],
  ["大集会", "だいじゅうかい"],
  ["一高生", "いっこうせい"],
  ["花菖蒲", "はなしょうぶ"],
  ["弄る", "いじる"]
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

  function getSingleCharOverride(char, txt, idx) {
    // 1. Enclosed in parentheses (day of week: (月), (火), (水), (木), (金), (土), (日))
    if (idx > 0 && idx + 1 < txt.length) {
      const prev = txt[idx - 1];
      const next = txt[idx + 1];
      if ((prev === "(" && next === ")") || (prev === "（" && next === "）")) {
        if (char === "月") return "げつ";
        if (char === "火") return "か";
        if (char === "水") return "すい";
        if (char === "木") return "もく";
        if (char === "金") return "きん";
        if (char === "土") return "ど";
        if (char === "日") return "にち";
      }
    }

    // 2. Preceded by number (date / counter suffixes)
    if (idx > 0) {
      const prevChar = txt[idx - 1];
      if (/[0-9０-９一二三四五六七八九十百千万]/.test(prevChar)) {
        if (char === "月") return "がつ";
        if (char === "日") return "にち";
        if (char === "人") return "にん";
        if (char === "名") return "めい";
        if (char === "歳") return "さい";
        if (char === "分" && /[0-9０-９]/.test(prevChar)) return "ふん";
      }
    }

    // 3. Special noun suffixes (e.g. '場' preceded by Kanji but not matched as a dictionary word)
    if (char === "場" && idx > 0) {
      const prevChar = txt[idx - 1];
      if (Japanese.isKanji(prevChar)) {
        return "じょう";
      }
    }

    // 4. Standalone '高' preceded or followed by Kanji or Katakana -> 'こう' (covers prefixes like '高機能' and suffixes like '国際高')
    if (char === "高") {
      let isHigh = false;
      if (idx > 0) {
        const prev = txt[idx - 1];
        if (Japanese.isKanji(prev) || /[ァ-ヶ]/.test(prev)) {
          isHigh = true;
        }
      }
      if (idx + 1 < txt.length) {
        const next = txt[idx + 1];
        if (Japanese.isKanji(next) || /[ァ-ヶ]/.test(next)) {
          isHigh = true;
        }
      }
      if (isHigh) {
        return "こう";
      }
    }

    // 5. Standalone '生' preceded by school-related characters (高, 校, 学, 大, 院) -> 'せい'
    if (char === "生" && idx > 0) {
      const prev = txt[idx - 1];
      if (/[高校学大院]/.test(prev)) {
        return "せい";
      }
    }

    return null;
  }

  while (index < text.length) {
    const longestWord = getLongestEntry(index);
    if (longestWord) {
      let reading = longestWord.reading;
      if (longestWord.surface === "1日" || longestWord.surface === "一日") {
        let isDate = false;
        if (index > 0) {
          const prevChar = text[index - 1];
          if (prevChar === "月") {
            isDate = true;
          }
        }
        reading = isDate ? "ついたち" : "いちにち";
      } else if (longestWord.surface === "高から") {
        let isSchool = false;
        if (index > 0) {
          const prevChar = text[index - 1];
          if (Japanese.isKanji(prevChar) || /[ァ-ヶ]/.test(prevChar)) {
            isSchool = true;
          }
        }
        reading = isSchool ? "こうから" : "たかから";
      } else if (longestWord.surface.length === 1) {
        const override = getSingleCharOverride(longestWord.surface, text, index);
        if (override !== null) {
          reading = override;
        }
      }
      tokens.push({ surface: longestWord.surface, furigana: reading });
      index += longestWord.surface.length;
      continue;
    }

    const currentChar = text[index];
    if (Japanese.isKanji(currentChar)) {
      let reading = characterReadings[currentChar] || "";
      const override = getSingleCharOverride(currentChar, text, index);
      if (override !== null) {
        reading = override;
      }
      tokens.push({
        surface: currentChar,
        furigana: reading
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
  
  // First, insert fallback word readings so they take precedence over the dictionary entries
  for (const [surface, reading] of FALLBACK_WORD_READINGS) {
    insertDictionaryEntry(root, surface, reading);
  }

  const seenSurfaces = new Set(FALLBACK_WORD_READINGS.map(x => x[0]));

  for (const entry of entries) {
    if (!seenSurfaces.has(entry.surface)) {
      insertDictionaryEntry(root, entry.surface, entry.reading);
      seenSurfaces.add(entry.surface);
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
const dictIndex = buildDictionaryIndex(normalizedEntries);
console.log(`Indexed dictionary in ${Date.now() - startParse}ms. Size: ${normalizedEntries.length} entries.`);

// Function to process an HTML file and print its top annotated words
function testHtmlFile(filename) {
  const filePath = path.join(__dirname, '../temp_sudachi_download', filename);
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }
  const rawHtml = fs.readFileSync(filePath, 'utf8');

  // Strip scripts and styles
  const cleanHtml = rawHtml
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // Extract all text inside body (or just everything, since we look at text outside tags)
  // We can use a simple tag stripper
  const textNodes = cleanHtml.split(/<[^>]+>/);
  
  const allAnnotatedTokens = [];
  for (const rawTextNode of textNodes) {
    const textNodeVal = rawTextNode
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#160;/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .trim();

    if (!textNodeVal || !Japanese.containsKanji(textNodeVal)) {
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

  // Count frequencies
  const kanjiWordMap = new Map();
  for (const token of allAnnotatedTokens) {
    const key = `${token.surface} -> ${token.furigana}`;
    kanjiWordMap.set(key, (kanjiWordMap.get(key) || 0) + 1);
  }

  const sortedWords = [...kanjiWordMap.entries()].sort((a, b) => b[1] - a[1]);
  console.log(`\n==========================================`);
  console.log(`TOP ANNOTATED KANJI WORDS IN ${filename}:`);
  console.log(`==========================================`);
  console.log(sortedWords.slice(0, 100));

  // Single characters
  console.log(`\nTOP SINGLE KANJI CHARACTERS IN ${filename}:`);
  const singleCharKanji = sortedWords.filter(entry => entry[0].split(" -> ")[0].length === 1);
  console.log(singleCharKanji.slice(0, 30));
}

testHtmlFile('yahoo.html');
testHtmlFile('wikipedia.html');
testHtmlFile('yahoo_news.html');
