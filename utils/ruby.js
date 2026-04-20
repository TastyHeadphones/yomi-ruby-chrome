(() => {
  const Japanese = globalThis.YomiRubyJapanese;

  function normalizeTokenList(tokens) {
    if (!Array.isArray(tokens)) {
      return [];
    }
    return tokens
      .map((token) => ({
        surface: typeof token?.surface === "string" ? token.surface : "",
        furigana: typeof token?.furigana === "string" ? token.furigana.trim() : "",
        originalFurigana:
          typeof token?.originalFurigana === "string" ? token.originalFurigana.trim() : "",
        sourceTextHash: typeof token?.sourceTextHash === "string" ? token.sourceTextHash : "",
        occurrenceIndex:
          Number.isInteger(token?.occurrenceIndex) && token.occurrenceIndex >= 0
            ? token.occurrenceIndex
            : 0,
        overrideKey: typeof token?.overrideKey === "string" ? token.overrideKey : "",
        userEdited: token?.userEdited === true
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

  function createRubyElement(doc, surface, furigana, metadata = {}) {
    const ruby = doc.createElement("ruby");
    ruby.className = "yomiruby-ruby";
    ruby.setAttribute("data-yomiruby-annotated", "1");
    ruby.setAttribute("data-yomiruby-surface", surface);
    ruby.setAttribute("data-yomiruby-current-reading", furigana);

    if (typeof metadata.originalFurigana === "string" && metadata.originalFurigana) {
      ruby.setAttribute("data-yomiruby-original-reading", metadata.originalFurigana);
    }
    if (typeof metadata.sourceTextHash === "string" && metadata.sourceTextHash) {
      ruby.setAttribute("data-yomiruby-source-hash", metadata.sourceTextHash);
    }
    if (typeof metadata.overrideKey === "string" && metadata.overrideKey) {
      ruby.setAttribute("data-yomiruby-override-key", metadata.overrideKey);
    }
    if (Number.isInteger(metadata.occurrenceIndex) && metadata.occurrenceIndex >= 0) {
      ruby.setAttribute("data-yomiruby-occurrence", String(metadata.occurrenceIndex));
    }
    if (metadata.userEdited) {
      ruby.setAttribute("data-yomiruby-user-edited", "1");
    }

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
    const tokenMap = new Map();
    for (const token of tokens) {
      if (shouldCreateRuby(token.surface, token.furigana)) {
        tokenMap.set(token.surface, token);
      }
    }

    const fragment = doc.createDocumentFragment();
    if (tokenMap.size === 0) {
      fragment.appendChild(doc.createTextNode(text));
      return { fragment, changed: false, annotatedCount: 0 };
    }

    const dictionarySurfaces = [...tokenMap.keys()].sort((a, b) => b.length - a.length);
    let changed = false;
    let annotatedCount = 0;
    let index = 0;

    while (index < text.length) {
      let matchedSurface = "";
      let matchedToken = null;
      for (const surface of dictionarySurfaces) {
        if (text.startsWith(surface, index)) {
          matchedSurface = surface;
          matchedToken = tokenMap.get(surface) || null;
          break;
        }
      }

      if (matchedSurface && matchedToken) {
        fragment.appendChild(
          createRubyElement(doc, matchedSurface, matchedToken.furigana, {
            originalFurigana: matchedToken.originalFurigana || matchedToken.furigana,
            sourceTextHash: matchedToken.sourceTextHash,
            occurrenceIndex: matchedToken.occurrenceIndex,
            overrideKey: matchedToken.overrideKey,
            userEdited: matchedToken.userEdited
          })
        );
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
        fragment.appendChild(
          createRubyElement(doc, token.surface, token.furigana, {
            originalFurigana: token.originalFurigana || token.furigana,
            sourceTextHash: token.sourceTextHash,
            occurrenceIndex: token.occurrenceIndex,
            overrideKey: token.overrideKey,
            userEdited: token.userEdited
          })
        );
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
