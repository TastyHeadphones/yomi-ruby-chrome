(() => {
  const KANJI_REGEX = /[一-龯々〆ヵヶ]/u;
  const JAPANESE_REGEX = /[ぁ-ゖァ-ヺー一-龯々〆ヵヶ]/u;
  const KANA_REGEX = /[ぁ-ゖァ-ヺー]/u;

  function containsKanji(text) {
    return typeof text === "string" && KANJI_REGEX.test(text);
  }

  function containsJapanese(text) {
    return typeof text === "string" && JAPANESE_REGEX.test(text);
  }

  function hasKana(text) {
    return typeof text === "string" && KANA_REGEX.test(text);
  }

  function isKanji(character) {
    return typeof character === "string" && character.length > 0 && KANJI_REGEX.test(character);
  }

  function katakanaToHiragana(text) {
    if (typeof text !== "string") {
      return "";
    }
    return text.replace(/[ァ-ヶ]/g, (char) =>
      String.fromCharCode(char.charCodeAt(0) - 0x60)
    );
  }

  function normalizeWhitespace(text) {
    if (typeof text !== "string") {
      return "";
    }
    return text.replace(/\s+/g, " ").trim();
  }

  globalThis.YomiRubyJapanese = Object.freeze({
    containsKanji,
    containsJapanese,
    hasKana,
    isKanji,
    katakanaToHiragana,
    normalizeWhitespace
  });
})();
