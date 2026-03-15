importScripts("utils/constants.js", "utils/japanese.js");

const C = globalThis.YomiRubyConstants;
const Japanese = globalThis.YomiRubyJapanese;

const YAHOO_FURIGANA_ENDPOINT = "https://jlp.yahooapis.jp/FuriganaService/V2/furigana";
const furiganaCache = new Map();

const MOCK_WORD_READINGS = [
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
  ["料理", "りょうり"]
];

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

const SORTED_MOCK_WORDS = [...MOCK_WORD_READINGS].sort((a, b) => b[0].length - a[0].length);

class YomiRubyError extends Error {
  constructor(code, message, status) {
    super(message);
    this.name = "YomiRubyError";
    this.code = code;
    this.status = status;
  }
}

chrome.runtime.onInstalled.addListener(() => {
  initializeDefaults().catch((error) => {
    console.warn("YomiRuby initializeDefaults failed:", error);
  });
});

chrome.runtime.onStartup.addListener(() => {
  initializeDefaults().catch((error) => {
    console.warn("YomiRuby initializeDefaults failed:", error);
  });
});

chrome.tabs.onRemoved.addListener((tabId) => {
  chrome.storage.session.remove(tabStateKey(tabId)).catch(() => {});
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete") {
    return;
  }
  if (!isSupportedUrl(tab?.url || "")) {
    return;
  }
  runAutoAnnotation(tabId).catch((error) => {
    console.warn("YomiRuby auto annotation failed:", error);
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender)
    .then(sendResponse)
    .catch((error) => {
      sendResponse({
        ok: false,
        error: C.ERROR_CODES.INVALID_RESPONSE,
        details: error?.message || String(error)
      });
    });
  return true;
});

async function handleMessage(message, sender) {
  const type = message?.type;
  const payload = message?.payload || {};

  switch (type) {
    case C.MESSAGE_TYPES.GET_TAB_STATE: {
      const tabId = Number(payload.tabId);
      if (!Number.isInteger(tabId)) {
        return { ok: false, error: C.ERROR_CODES.INVALID_RESPONSE, details: "tabId is required." };
      }
      const enabled = await getTabState(tabId);
      return { ok: true, enabled };
    }

    case C.MESSAGE_TYPES.SET_TAB_STATE: {
      const tabId = Number(payload.tabId);
      const enabled = Boolean(payload.enabled);
      if (!Number.isInteger(tabId)) {
        return { ok: false, error: C.ERROR_CODES.INVALID_RESPONSE, details: "tabId is required." };
      }
      await setTabState(tabId, enabled);
      return { ok: true, enabled };
    }

    case C.MESSAGE_TYPES.RUN_ANNOTATION: {
      const tabId = Number(payload.tabId);
      if (!Number.isInteger(tabId)) {
        return { ok: false, error: C.ERROR_CODES.INVALID_RESPONSE, details: "tabId is required." };
      }
      return runAnnotationOnTab(tabId, { trigger: payload.trigger || "manual" });
    }

    case C.MESSAGE_TYPES.OPEN_OPTIONS: {
      await chrome.runtime.openOptionsPage();
      return { ok: true };
    }

    case C.MESSAGE_TYPES.ANNOTATE_TEXT_BATCH: {
      const texts = Array.isArray(payload.texts) ? payload.texts : [];
      return annotateTextBatch(texts, sender);
    }

    default:
      return { ok: false, error: C.ERROR_CODES.INVALID_RESPONSE, details: "Unknown message type." };
  }
}

async function initializeDefaults() {
  const values = await chrome.storage.sync.get([C.STORAGE_KEYS.DEMO_MODE_ENABLED]);
  if (typeof values[C.STORAGE_KEYS.DEMO_MODE_ENABLED] !== "boolean") {
    await chrome.storage.sync.set({
      [C.STORAGE_KEYS.DEMO_MODE_ENABLED]: C.DEFAULTS.DEMO_MODE_ENABLED
    });
  }
}

function tabStateKey(tabId) {
  return `${C.SESSION_KEYS.TAB_ENABLED_PREFIX}${tabId}`;
}

async function getTabState(tabId) {
  const key = tabStateKey(tabId);
  const data = await chrome.storage.session.get([key]);
  return Boolean(data[key]);
}

async function setTabState(tabId, enabled) {
  const key = tabStateKey(tabId);
  await chrome.storage.session.set({ [key]: enabled });
}

function isSupportedUrl(url) {
  return /^(https?|file):/i.test(url);
}

async function runAutoAnnotation(tabId) {
  const enabled = await getTabState(tabId);
  if (!enabled) {
    return;
  }
  await runAnnotationOnTab(tabId, { trigger: "auto" });
}

async function runAnnotationOnTab(tabId, payload) {
  const tab = await chrome.tabs.get(tabId);
  if (!tab || !isSupportedUrl(tab.url || "")) {
    return {
      ok: false,
      error: C.ERROR_CODES.UNSUPPORTED_TAB,
      details: "This tab URL cannot be annotated."
    };
  }

  const injected = await ensureContentScript(tabId);
  if (!injected) {
    return {
      ok: false,
      error: C.ERROR_CODES.CONTENT_SCRIPT_UNAVAILABLE,
      details: "Could not load content script on this page."
    };
  }

  try {
    const response = await chrome.tabs.sendMessage(tabId, {
      type: C.MESSAGE_TYPES.ANNOTATE_PAGE,
      payload
    });
    if (!response?.ok) {
      return {
        ok: false,
        error: response?.error || C.ERROR_CODES.INVALID_RESPONSE,
        details: response?.details || "Annotation failed in content script."
      };
    }
    return response;
  } catch (error) {
    return {
      ok: false,
      error: C.ERROR_CODES.CONTENT_SCRIPT_UNAVAILABLE,
      details: error?.message || String(error)
    };
  }
}

async function ensureContentScript(tabId) {
  try {
    const ping = await chrome.tabs.sendMessage(tabId, { type: C.MESSAGE_TYPES.PING });
    if (ping?.ok) {
      return true;
    }
  } catch (_) {
    // No-op: injection fallback will run.
  }

  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: [
        "utils/constants.js",
        "utils/japanese.js",
        "utils/dom.js",
        "utils/ruby.js",
        "content.js"
      ]
    });
    return true;
  } catch (error) {
    console.warn("YomiRuby script injection failed:", error);
    return false;
  }
}

async function getSettings() {
  const values = await chrome.storage.sync.get([
    C.STORAGE_KEYS.API_KEY,
    C.STORAGE_KEYS.DEMO_MODE_ENABLED
  ]);
  return {
    apiKey: String(values[C.STORAGE_KEYS.API_KEY] || "").trim(),
    demoModeEnabled:
      typeof values[C.STORAGE_KEYS.DEMO_MODE_ENABLED] === "boolean"
        ? values[C.STORAGE_KEYS.DEMO_MODE_ENABLED]
        : C.DEFAULTS.DEMO_MODE_ENABLED
  };
}

async function annotateTextBatch(texts) {
  const normalizedTexts = texts.map((text) => (typeof text === "string" ? text : ""));
  if (normalizedTexts.length === 0) {
    return { ok: true, results: [] };
  }

  const settings = await getSettings();
  if (!settings.apiKey && !settings.demoModeEnabled) {
    return {
      ok: false,
      error: C.ERROR_CODES.MISSING_API_KEY,
      details: "No API key configured. Open Settings or enable demo mode."
    };
  }

  const uniqueTexts = [...new Set(normalizedTexts)];
  const resultByText = new Map();

  for (const text of uniqueTexts) {
    const result = await annotateSingleText(text, settings);
    resultByText.set(text, result);
  }

  return {
    ok: true,
    results: normalizedTexts.map((text) => resultByText.get(text) || { text, tokens: [{ surface: text }] })
  };
}

async function annotateSingleText(text, settings) {
  if (!text || !text.trim()) {
    return { text, tokens: [{ surface: text }] };
  }
  if (!Japanese.containsKanji(text)) {
    return { text, tokens: [{ surface: text }] };
  }

  const chunks = splitTextForApi(text, C.LIMITS.MAX_TEXT_LENGTH_PER_NODE);
  const mergedTokens = [];

  for (const chunk of chunks) {
    if (!chunk) {
      continue;
    }
    if (!Japanese.containsKanji(chunk)) {
      mergedTokens.push({ surface: chunk, furigana: "" });
      continue;
    }
    try {
      const tokens = await getFuriganaTokensForChunk(chunk, settings);
      if (!tokens.length) {
        mergedTokens.push({ surface: chunk, furigana: "" });
      } else {
        mergedTokens.push(...tokens);
      }
    } catch (error) {
      return {
        text,
        tokens: [{ surface: text, furigana: "" }],
        error: normalizeErrorCode(error),
        details: error?.message || String(error)
      };
    }
  }

  return {
    text,
    tokens: mergedTokens.length > 0 ? mergedTokens : [{ surface: text, furigana: "" }]
  };
}

async function getFuriganaTokensForChunk(text, settings) {
  const cacheMode = settings.apiKey ? "api" : "demo";
  const cacheKey = `${cacheMode}:${text}`;
  if (furiganaCache.has(cacheKey)) {
    return furiganaCache.get(cacheKey);
  }

  let tokens = [];
  if (settings.apiKey) {
    try {
      tokens = await requestYahooFurigana(settings.apiKey, text);
    } catch (error) {
      if (!settings.demoModeEnabled) {
        throw error;
      }
      tokens = createMockTokens(text);
    }
  } else {
    tokens = createMockTokens(text);
  }

  const normalizedTokens = normalizeTokensForText(tokens, text);
  setCache(cacheKey, normalizedTokens);
  return normalizedTokens;
}

function setCache(key, value) {
  furiganaCache.set(key, value);
  if (furiganaCache.size <= C.LIMITS.FURIGANA_CACHE_SIZE) {
    return;
  }
  const oldest = furiganaCache.keys().next().value;
  furiganaCache.delete(oldest);
}

function normalizeTokensForText(tokens, originalText) {
  const safeTokens = Array.isArray(tokens)
    ? tokens
        .map((token) => ({
          surface: typeof token?.surface === "string" ? token.surface : "",
          furigana: typeof token?.furigana === "string" ? token.furigana : ""
        }))
        .filter((token) => token.surface.length > 0)
    : [];

  if (safeTokens.length === 0) {
    return [{ surface: originalText, furigana: "" }];
  }
  return safeTokens;
}

function splitTextForApi(text, maxLength) {
  if (text.length <= maxLength) {
    return [text];
  }

  const parts = text.split(/([。．！？!?、,\n])/u);
  const units = [];
  for (let index = 0; index < parts.length; index += 2) {
    units.push((parts[index] || "") + (parts[index + 1] || ""));
  }

  const chunks = [];
  let buffer = "";

  for (const unit of units) {
    if (!unit) {
      continue;
    }
    if ((buffer + unit).length <= maxLength) {
      buffer += unit;
      continue;
    }
    if (buffer) {
      chunks.push(buffer);
      buffer = "";
    }
    if (unit.length <= maxLength) {
      buffer = unit;
      continue;
    }
    let cursor = 0;
    while (cursor < unit.length) {
      chunks.push(unit.slice(cursor, cursor + maxLength));
      cursor += maxLength;
    }
  }

  if (buffer) {
    chunks.push(buffer);
  }

  return chunks.length > 0 ? chunks : [text];
}

async function requestYahooFurigana(apiKey, text) {
  const requestBody = {
    id: String(Date.now()),
    jsonrpc: "2.0",
    method: "jlp.furigana",
    params: {
      q: text,
      grade: 1
    }
  };

  const endpointWithAppId = `${YAHOO_FURIGANA_ENDPOINT}?appid=${encodeURIComponent(apiKey)}`;

  const response = await fetchWithTimeout(
    endpointWithAppId,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Yahoo-App-Id": apiKey
      },
      body: JSON.stringify(requestBody)
    },
    C.LIMITS.API_TIMEOUT_MS
  );

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new YomiRubyError(C.ERROR_CODES.INVALID_API_KEY, "Yahoo API key rejected.", response.status);
    }
    if (response.status === 429) {
      throw new YomiRubyError(C.ERROR_CODES.QUOTA_EXCEEDED, "Yahoo API quota exceeded.", response.status);
    }
    throw new YomiRubyError(
      C.ERROR_CODES.NETWORK_FAILURE,
      `Yahoo API request failed with status ${response.status}.`,
      response.status
    );
  }

  let data;
  try {
    data = await response.json();
  } catch (error) {
    throw new YomiRubyError(C.ERROR_CODES.INVALID_RESPONSE, "Yahoo API returned non-JSON response.");
  }

  if (data?.error) {
    const message = String(data.error?.message || "Yahoo API error.");
    if (/quota|limit/i.test(message)) {
      throw new YomiRubyError(C.ERROR_CODES.QUOTA_EXCEEDED, message);
    }
    if (/app|key|auth|credential/i.test(message)) {
      throw new YomiRubyError(C.ERROR_CODES.INVALID_API_KEY, message);
    }
    throw new YomiRubyError(C.ERROR_CODES.NETWORK_FAILURE, message);
  }

  const words = data?.result?.word;
  if (!Array.isArray(words)) {
    throw new YomiRubyError(C.ERROR_CODES.INVALID_RESPONSE, "Yahoo API payload missing result.word array.");
  }

  const flattenedWords = flattenYahooWords(words);
  if (flattenedWords.length === 0) {
    throw new YomiRubyError(C.ERROR_CODES.INVALID_RESPONSE, "Yahoo API returned empty token list.");
  }

  return flattenedWords.map((word) => ({
    surface: word.surface,
    furigana: Japanese.katakanaToHiragana(word.furigana || "")
  }));
}

async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timeoutHandle = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new YomiRubyError(C.ERROR_CODES.NETWORK_FAILURE, "Yahoo API request timed out.");
    }
    throw new YomiRubyError(C.ERROR_CODES.NETWORK_FAILURE, error?.message || "Network request failed.");
  } finally {
    clearTimeout(timeoutHandle);
  }
}

function flattenYahooWords(words, target = []) {
  for (const word of words) {
    if (!word || typeof word.surface !== "string") {
      continue;
    }
    if (Array.isArray(word.subword) && word.subword.length > 0) {
      flattenYahooWords(word.subword, target);
      continue;
    }
    target.push({
      surface: word.surface,
      furigana: typeof word.furigana === "string" ? word.furigana : ""
    });
  }
  return target;
}

function createMockTokens(text) {
  const tokens = [];
  let index = 0;

  while (index < text.length) {
    const longestWord = findLongestMockWord(text, index);
    if (longestWord) {
      tokens.push({ surface: longestWord.surface, furigana: longestWord.reading });
      index += longestWord.surface.length;
      continue;
    }

    const currentChar = text[index];
    if (Japanese.isKanji(currentChar)) {
      tokens.push({
        surface: currentChar,
        furigana: MOCK_CHAR_READINGS[currentChar] || ""
      });
      index += 1;
      continue;
    }

    const start = index;
    index += 1;
    while (index < text.length) {
      const hasWordMatch = findLongestMockWord(text, index);
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

function findLongestMockWord(text, startIndex) {
  for (const [surface, reading] of SORTED_MOCK_WORDS) {
    if (text.startsWith(surface, startIndex)) {
      return { surface, reading };
    }
  }
  return null;
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

function normalizeErrorCode(error) {
  if (error?.code) {
    return error.code;
  }
  return C.ERROR_CODES.NETWORK_FAILURE;
}
