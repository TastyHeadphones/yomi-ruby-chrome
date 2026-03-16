(() => {
  const Japanese = globalThis.YomiRubyJapanese;

  function normalizeTokenList(tokens) {
    if (!Array.isArray(tokens)) {
      return [];
    }
    return tokens
      .map((token) => ({
        surface: typeof token?.surface === "string" ? token.surface : "",
        furigana: typeof token?.furigana === "string" ? token.furigana.trim() : ""
      }))
      .filter((token) => token.surface.length > 0);
  }

  function shouldCreateRuby(surface, furigana) {
    if (!surface || !furigana) {
      return false;
    }
    if (!Japanese.containsKanji(surface)) {
      return false;
    }
    return surface.replace(/\s+/g, "") !== furigana.replace(/\s+/g, "");
  }

  function createRubyElement(doc, surface, furigana) {
    const ruby = doc.createElement("ruby");
    ruby.className = "yomiruby-ruby";
    ruby.setAttribute("data-yomiruby-annotated", "1");
    ruby.setAttribute("data-yomiruby-surface", surface);

    const rt = doc.createElement("rt");
    rt.className = "yomiruby-rt";
    rt.textContent = furigana;

    const rpOpen = doc.createElement("rp");
    rpOpen.textContent = "(";
    const rpClose = doc.createElement("rp");
    rpClose.textContent = ")";

    ruby.appendChild(doc.createTextNode(surface));
    ruby.appendChild(rpOpen);
    ruby.appendChild(rt);
    ruby.appendChild(rpClose);
    return ruby;
  }

  function fallbackBuildByDictionary(doc, text, tokens) {
    const readingMap = new Map();
    for (const token of tokens) {
      if (shouldCreateRuby(token.surface, token.furigana)) {
        readingMap.set(token.surface, token.furigana);
      }
    }

    const fragment = doc.createDocumentFragment();
    if (readingMap.size === 0) {
      fragment.appendChild(doc.createTextNode(text));
      return { fragment, changed: false, annotatedCount: 0 };
    }

    const dictionarySurfaces = [...readingMap.keys()].sort((a, b) => b.length - a.length);
    let changed = false;
    let annotatedCount = 0;
    let index = 0;

    while (index < text.length) {
      let matchedSurface = "";
      let matchedReading = "";
      for (const surface of dictionarySurfaces) {
        if (text.startsWith(surface, index)) {
          matchedSurface = surface;
          matchedReading = readingMap.get(surface) || "";
          break;
        }
      }

      if (matchedSurface) {
        fragment.appendChild(createRubyElement(doc, matchedSurface, matchedReading));
        index += matchedSurface.length;
        changed = true;
        annotatedCount += 1;
        continue;
      }

      const start = index;
      index += 1;
      while (index < text.length) {
        const hasMatch = dictionarySurfaces.some((surface) => text.startsWith(surface, index));
        if (hasMatch) {
          break;
        }
        index += 1;
      }
      fragment.appendChild(doc.createTextNode(text.slice(start, index)));
    }

    return { fragment, changed, annotatedCount };
  }

  function buildAnnotatedFragment(doc, originalText, tokens) {
    const normalizedTokens = normalizeTokenList(tokens);
    const fragment = doc.createDocumentFragment();
    if (normalizedTokens.length === 0) {
      fragment.appendChild(doc.createTextNode(originalText));
      return { fragment, changed: false, annotatedCount: 0 };
    }

    let cursor = 0;
    let changed = false;
    let annotatedCount = 0;

    for (const token of normalizedTokens) {
      const index = originalText.indexOf(token.surface, cursor);
      if (index < 0) {
        return fallbackBuildByDictionary(doc, originalText, normalizedTokens);
      }

      if (index > cursor) {
        fragment.appendChild(doc.createTextNode(originalText.slice(cursor, index)));
      }

      if (shouldCreateRuby(token.surface, token.furigana)) {
        fragment.appendChild(createRubyElement(doc, token.surface, token.furigana));
        changed = true;
        annotatedCount += 1;
      } else {
        fragment.appendChild(doc.createTextNode(token.surface));
      }

      cursor = index + token.surface.length;
    }

    if (cursor < originalText.length) {
      fragment.appendChild(doc.createTextNode(originalText.slice(cursor)));
    }

    return { fragment, changed, annotatedCount };
  }

  globalThis.YomiRubyRuby = Object.freeze({
    buildAnnotatedFragment,
    createRubyElement,
    shouldCreateRuby
  });
})();
