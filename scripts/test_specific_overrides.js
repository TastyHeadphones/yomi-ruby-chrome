const fs = require('fs');
const path = require('path');

// Mock globalThis
globalThis.YomiRubyJapanese = null;
globalThis.YomiRubyRuby = null;

// Load utils
const japaneseJs = fs.readFileSync(path.join(__dirname, '../utils/japanese.js'), 'utf8');
eval(japaneseJs);
const Japanese = globalThis.YomiRubyJapanese;

// Load code from scripts/test_on_downloaded.js by reading and replacing the main execution block
let testCode = fs.readFileSync(path.join(__dirname, 'test_on_downloaded.js'), 'utf8');
// Remove the lines that execute the html tests at the end so it doesn't run the full test suite when eval'd
testCode = testCode.replace(/testHtmlFile\('yahoo\.html'\);[\s\S]*/, '');

eval(testCode);

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

// At this point, the functions like buildDictionaryTokens, buildDictionaryIndex, etc. should be defined.
// Let's load the dictionary ourselves to have dictIndex available.
const dictPayload = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/local-annotate-dict.json'), 'utf8'));
const normalizedEntries = normalizeLocalDictionaryPayload(dictPayload);
const dictIndex = buildDictionaryIndex(normalizedEntries);

const testCases = [
  { text: "大集会", expected: [{ surface: "大集会", furigana: "だいじゅうかい" }] },
  { text: "一高生", expected: [{ surface: "一高生", furigana: "いっこうせい" }] },
  { text: "花菖蒲", expected: [{ surface: "花菖蒲", furigana: "はなしょうぶ" }] },
  { text: "弄る", expected: [{ surface: "弄る", furigana: "いじる" }] },
  { text: "1日の降水量", expectedCount: 4, matchSurface: "1日", expectedFurigana: "いちにち" },
  { text: "5月1日", expectedCount: 3, matchSurface: "1日", expectedFurigana: "ついたち" },
  { text: "一日中", expectedCount: 2, matchSurface: "一日", expectedFurigana: "いちにち" },
  { text: "十一月一日", expectedCount: 4, matchSurface: "一日", expectedFurigana: "ついたち" },
  { text: "同志社国際高から", expectedCount: 4, matchSurface: "高から", expectedFurigana: "こうから" },
  { text: "国際高", expectedCount: 2, matchSurface: "高", expectedFurigana: "こう" },
  { text: "高カメラ", matchSurface: "高", expectedFurigana: "こう" }
];

let failed = 0;
console.log("RUNNING SPECIFIC OVERRIDES AND FALLBACK TESTS...");

for (const tc of testCases) {
  const segments = splitSentenceIntoApiCompatibleSegments(tc.text);
  let allTokens = [];
  for (const segment of segments) {
    if (!segment.requestable || !Japanese.containsKanji(segment.text)) {
      allTokens.push({ surface: segment.text, furigana: "" });
      continue;
    }
    const tokens = buildDictionaryTokens(segment.text, dictIndex, MOCK_CHAR_READINGS);
    allTokens = allTokens.concat(tokens);
  }

  // If expected tokens are specified
  if (tc.expected) {
    let match = true;
    if (allTokens.length !== tc.expected.length) {
      match = false;
    } else {
      for (let i = 0; i < allTokens.length; i++) {
        if (allTokens[i].surface !== tc.expected[i].surface || allTokens[i].furigana !== tc.expected[i].furigana) {
          match = false;
        }
      }
    }
    if (!match) {
      console.error(`FAIL: text="${tc.text}"`);
      console.error(`  Expected:`, tc.expected);
      console.error(`  Got:     `, allTokens);
      failed++;
    } else {
      console.log(`PASS: text="${tc.text}" ->`, allTokens);
    }
  }

  // If search for matchSurface is specified
  if (tc.matchSurface) {
    const foundToken = allTokens.find(t => t.surface === tc.matchSurface);
    if (!foundToken || foundToken.furigana !== tc.expectedFurigana) {
      console.error(`FAIL: text="${tc.text}"`);
      console.error(`  Expected surface "${tc.matchSurface}" with reading "${tc.expectedFurigana}"`);
      console.error(`  Got:     `, allTokens);
      failed++;
    } else {
      console.log(`PASS: text="${tc.text}" -> found "${tc.matchSurface}" with reading "${foundToken.furigana}"`);
    }
  }
}

if (failed > 0) {
  console.error(`\nFAILED ${failed} tests.`);
  process.exit(1);
} else {
  console.log("\nALL TESTS PASSED SUCCESSFULLY!");
}
