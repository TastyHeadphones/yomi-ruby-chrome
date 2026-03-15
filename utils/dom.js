(() => {
  const Japanese = globalThis.YomiRubyJapanese;

  const EXCLUDED_TAGS = new Set([
    "script",
    "style",
    "noscript",
    "textarea",
    "input",
    "select",
    "option",
    "button",
    "code",
    "pre",
    "kbd",
    "samp",
    "var",
    "svg",
    "math",
    "canvas",
    "template"
  ]);

  function isInsideExcludedElement(node) {
    let current = node.parentElement;
    while (current) {
      const tagName = current.tagName ? current.tagName.toLowerCase() : "";
      if (EXCLUDED_TAGS.has(tagName)) {
        return true;
      }
      if (current.isContentEditable || current.getAttribute("contenteditable") === "true") {
        return true;
      }
      if (current.hasAttribute("hidden") || current.getAttribute("aria-hidden") === "true") {
        return true;
      }
      current = current.parentElement;
    }
    return false;
  }

  function isInsideRuby(node) {
    const parent = node.parentElement;
    if (!parent) {
      return false;
    }
    return Boolean(parent.closest("ruby,rt,rp,[data-yomiruby-annotated='1']"));
  }

  function isElementVisible(element) {
    if (!element || !element.isConnected) {
      return false;
    }
    let current = element;
    while (current) {
      const style = window.getComputedStyle(current);
      if (style.display === "none" || style.visibility === "hidden" || style.visibility === "collapse") {
        return false;
      }
      current = current.parentElement;
    }
    return element.getClientRects().length > 0;
  }

  function shouldSkipTextNode(node, options) {
    if (!node || node.nodeType !== Node.TEXT_NODE) {
      return true;
    }
    if (!node.nodeValue || !node.nodeValue.trim()) {
      return true;
    }
    if (options.processedNodes && options.processedNodes.has(node)) {
      return true;
    }
    if (!Japanese.containsKanji(node.nodeValue)) {
      return true;
    }
    if (!node.parentElement) {
      return true;
    }
    if (isInsideExcludedElement(node) || isInsideRuby(node)) {
      return true;
    }
    return !isElementVisible(node.parentElement);
  }

  function collectAnnotatableTextNodes(root, options = {}) {
    const safeOptions = {
      maxNodes: options.maxNodes ?? 250,
      maxLength: options.maxLength ?? 280,
      processedNodes: options.processedNodes
    };

    const nodes = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (shouldSkipTextNode(node, safeOptions)) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    while (nodes.length < safeOptions.maxNodes) {
      const current = walker.nextNode();
      if (!current) {
        break;
      }
      nodes.push(current);
    }

    return nodes;
  }

  globalThis.YomiRubyDom = Object.freeze({
    collectAnnotatableTextNodes,
    isElementVisible,
    isInsideExcludedElement,
    isInsideRuby
  });
})();
