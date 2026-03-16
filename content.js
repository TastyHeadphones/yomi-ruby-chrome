(() => {
  if (globalThis.__YOMIRUBY_CONTENT_SCRIPT_LOADED__) {
    return;
  }
  globalThis.__YOMIRUBY_CONTENT_SCRIPT_LOADED__ = true;

  const C = globalThis.YomiRubyConstants;
  const Dom = globalThis.YomiRubyDom;
  const Ruby = globalThis.YomiRubyRuby;
  const Japanese = globalThis.YomiRubyJapanese;

  const processedNodes = new WeakSet();
  let annotationInProgress = false;
  let cancelRequested = false;
  let progressCleanupTimer = null;

  const PROGRESS_ID = "yomiruby-progress-overlay";
  const PROGRESS_BAR_ID = "yomiruby-progress-fill";
  const PROGRESS_TEXT_ID = "yomiruby-progress-text";
  const PROGRESS_META_ID = "yomiruby-progress-meta";
  const PARAGRAPH_SELECTOR =
    "p,li,dd,dt,blockquote,figcaption,caption,td,th,h1,h2,h3,h4,h5,h6";

  function ensureAnnotationStyle() {
    if (document.getElementById("yomiruby-style")) {
      return;
    }
    const style = document.createElement("style");
    style.id = "yomiruby-style";
    style.textContent = `
      ruby.yomiruby-ruby {
        ruby-position: over;
        ruby-align: center;
      }
      ruby.yomiruby-ruby rt.yomiruby-rt {
        font-size: 0.55em;
        line-height: 1;
      }
      #${PROGRESS_ID} {
        position: fixed;
        right: 16px;
        bottom: 16px;
        width: min(320px, calc(100vw - 32px));
        border: 1px solid rgba(15, 23, 42, 0.18);
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.96);
        box-shadow: 0 10px 24px rgba(15, 23, 42, 0.2);
        color: #0f172a;
        font: 12px/1.4 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        padding: 10px;
        z-index: 2147483647;
        pointer-events: none;
      }
      #${PROGRESS_ID} .yomi-title {
        font-weight: 700;
        margin-bottom: 6px;
      }
      #${PROGRESS_ID} .yomi-track {
        width: 100%;
        height: 8px;
        background: #e5e7eb;
        border-radius: 99px;
        overflow: hidden;
        margin-bottom: 6px;
      }
      #${PROGRESS_BAR_ID} {
        width: 0%;
        height: 100%;
        background: #1d4ed8;
        transition: width 120ms linear;
      }
      #${PROGRESS_TEXT_ID} {
        font-weight: 600;
        margin-bottom: 2px;
      }
      #${PROGRESS_META_ID} {
        color: #334155;
      }
      #${PROGRESS_ID}.error #${PROGRESS_BAR_ID} {
        background: #b91c1c;
      }
      #${PROGRESS_ID}.done #${PROGRESS_BAR_ID} {
        background: #166534;
      }
    `;
    const root = document.head || document.documentElement;
    if (root) {
      root.appendChild(style);
    }
  }

  function clearProgressCleanupTimer() {
    if (progressCleanupTimer) {
      clearTimeout(progressCleanupTimer);
      progressCleanupTimer = null;
    }
  }

  function emitRuntimeProgress(state, progressPercent, message, meta, canceling = false) {
    chrome.runtime
      .sendMessage({
        type: C.MESSAGE_TYPES.ANNOTATION_PROGRESS,
        payload: {
          state,
          progressPercent,
          message,
          meta,
          cancelRequested: canceling
        }
      })
      .catch(() => {});
  }

  function ensureProgressOverlay() {
    let overlay = document.getElementById(PROGRESS_ID);
    if (overlay) {
      return overlay;
    }

    overlay = document.createElement("div");
    overlay.id = PROGRESS_ID;
    overlay.setAttribute("role", "status");
    overlay.setAttribute("aria-live", "polite");
    overlay.innerHTML = `
      <div class="yomi-title">YomiRuby</div>
      <div class="yomi-track"><div id="${PROGRESS_BAR_ID}"></div></div>
      <div id="${PROGRESS_TEXT_ID}">Preparing...</div>
      <div id="${PROGRESS_META_ID}"></div>
    `;

    const root = document.body || document.documentElement;
    if (root) {
      root.appendChild(overlay);
    }
    return overlay;
  }

  function renderProgress(current, total, metaText, statusText) {
    const overlay = ensureProgressOverlay();
    if (!overlay) {
      return;
    }
    overlay.classList.remove("error", "done");

    const progressBar = document.getElementById(PROGRESS_BAR_ID);
    const progressText = document.getElementById(PROGRESS_TEXT_ID);
    const progressMeta = document.getElementById(PROGRESS_META_ID);

    const safeTotal = Math.max(1, total);
    const percent = Math.max(0, Math.min(100, Math.round((current / safeTotal) * 100)));
    if (progressBar) {
      progressBar.style.width = `${percent}%`;
    }
    if (progressText) {
      progressText.textContent = statusText;
    }
    if (progressMeta) {
      progressMeta.textContent = metaText;
    }
    emitRuntimeProgress("running", percent, statusText, metaText, cancelRequested);
  }

  function finishProgress(ok, message, metaText) {
    const overlay = ensureProgressOverlay();
    if (!overlay) {
      return;
    }
    overlay.classList.toggle("done", ok);
    overlay.classList.toggle("error", !ok);

    const progressText = document.getElementById(PROGRESS_TEXT_ID);
    const progressMeta = document.getElementById(PROGRESS_META_ID);
    if (progressText) {
      progressText.textContent = message;
    }
    if (progressMeta) {
      progressMeta.textContent = metaText || "";
    }

    const state = ok ? "done" : cancelRequested ? "canceled" : "error";
    const progressPercent = ok ? 100 : 0;
    emitRuntimeProgress(state, progressPercent, message, metaText || "", cancelRequested);

    clearProgressCleanupTimer();
    progressCleanupTimer = setTimeout(() => {
      overlay.remove();
    }, ok ? 2800 : 6500);
  }

  function isParagraphCandidate(element) {
    if (!element || !element.isConnected) {
      return false;
    }
    if (!Dom.isElementVisible(element)) {
      return false;
    }
    if (element.closest("ruby,rt,rp,[data-yomiruby-annotated='1']")) {
      return false;
    }
    const text = element.textContent || "";
    return Japanese.containsKanji(text);
  }

  function collectParagraphRoots(root) {
    const candidates = Array.from(root.querySelectorAll(PARAGRAPH_SELECTOR));
    const paragraphs = candidates.filter(isParagraphCandidate);
    if (paragraphs.length > 0) {
      return paragraphs;
    }
    if (isParagraphCandidate(root)) {
      return [root];
    }
    return [];
  }

  function isCanceledResult(result) {
    return (
      result?.error === C.ERROR_CODES.CANCELED ||
      result?.error === "canceled" ||
      result?.canceled === true
    );
  }

  function extractRubySurface(ruby) {
    const fromAttribute = ruby.getAttribute("data-yomiruby-surface");
    if (fromAttribute) {
      return fromAttribute;
    }

    let surface = "";
    for (const child of ruby.childNodes) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const tagName = child.tagName ? child.tagName.toLowerCase() : "";
        if (tagName === "rt" || tagName === "rp") {
          continue;
        }
      }
      if (child.nodeType === Node.TEXT_NODE) {
        surface += child.nodeValue || "";
      }
    }
    return surface || ruby.textContent || "";
  }

  function restoreAnnotations() {
    const rubies = Array.from(
      document.querySelectorAll("ruby.yomiruby-ruby[data-yomiruby-annotated='1']")
    );
    if (rubies.length === 0) {
      return { restored: 0 };
    }

    const parentSet = new Set();
    for (const ruby of rubies) {
      if (!ruby.isConnected) {
        continue;
      }
      const parent = ruby.parentNode;
      const surface = extractRubySurface(ruby);
      ruby.replaceWith(document.createTextNode(surface));
      if (parent && parent.nodeType === Node.ELEMENT_NODE) {
        parentSet.add(parent);
      }
    }

    for (const parent of parentSet) {
      if (typeof parent.normalize === "function") {
        parent.normalize();
      }
    }

    const overlay = document.getElementById(PROGRESS_ID);
    if (overlay) {
      overlay.remove();
    }
    clearProgressCleanupTimer();
    cancelRequested = false;

    return { restored: rubies.length };
  }

  async function annotateParagraph(paragraph) {
    let scanned = 0;
    let replacedNodes = 0;
    let annotatedTokens = 0;
    let skipped = 0;

    while (true) {
      if (cancelRequested) {
        return {
          ok: false,
          error: C.ERROR_CODES.CANCELED,
          details: "Canceled by user.",
          canceled: true
        };
      }

      const nodes = Dom.collectAnnotatableTextNodes(paragraph, {
        maxNodes: C.LIMITS.MAX_TEXT_NODES_PER_PARAGRAPH,
        maxLength: C.LIMITS.MAX_TEXT_LENGTH_PER_NODE,
        processedNodes
      });

      if (nodes.length === 0) {
        break;
      }

      scanned += nodes.length;
      const textBatch = nodes.map((node) => node.nodeValue);
      const batchResponse = await chrome.runtime.sendMessage({
        type: C.MESSAGE_TYPES.ANNOTATE_TEXT_BATCH,
        payload: { texts: textBatch }
      });

      if (!batchResponse?.ok) {
        return {
          ok: false,
          error: batchResponse?.error || "batch_request_failed",
          details: batchResponse?.details || "Background annotation batch failed."
        };
      }

      for (let index = 0; index < nodes.length; index += 1) {
        if (cancelRequested) {
          return {
            ok: false,
            error: C.ERROR_CODES.CANCELED,
            details: "Canceled by user.",
            canceled: true
          };
        }
        const node = nodes[index];
        const result = batchResponse.results?.[index];
        processedNodes.add(node);

        if (!node.isConnected) {
          skipped += 1;
          continue;
        }
        if (!result || result.error) {
          skipped += 1;
          continue;
        }

        const built = Ruby.buildAnnotatedFragment(document, node.nodeValue, result.tokens || []);
        if (!built.changed) {
          skipped += 1;
          continue;
        }

        node.replaceWith(built.fragment);
        replacedNodes += 1;
        annotatedTokens += built.annotatedCount;
      }
    }

    return {
      ok: true,
      stats: {
        scanned,
        replacedNodes,
        annotatedTokens,
        skipped
      }
    };
  }

  async function annotatePage() {
    if (annotationInProgress) {
      return { ok: false, error: "busy", details: "An annotation job is already running." };
    }

    annotationInProgress = true;
    cancelRequested = false;
    clearProgressCleanupTimer();
    ensureAnnotationStyle();

    try {
      const root = document.body || document.documentElement;
      if (!root) {
        return { ok: false, error: "no_root_node", details: "No document root available." };
      }

      const paragraphs = collectParagraphRoots(root);
      if (paragraphs.length === 0) {
        finishProgress(true, "No kanji text found.", "");
        return {
          ok: true,
          stats: {
            scanned: 0,
            replacedNodes: 0,
            annotatedTokens: 0,
            skipped: 0
          }
        };
      }

      let totalScanned = 0;
      let totalReplacedNodes = 0;
      let totalAnnotatedTokens = 0;
      let totalSkipped = 0;
      const totalSteps = paragraphs.length + 1;

      renderProgress(
        0,
        totalSteps,
        `0 / ${paragraphs.length} paragraphs`,
        "Starting annotation..."
      );

      for (let paragraphIndex = 0; paragraphIndex < paragraphs.length; paragraphIndex += 1) {
        if (cancelRequested) {
          finishProgress(false, "Annotation canceled.", "");
          return {
            ok: false,
            error: C.ERROR_CODES.CANCELED,
            details: "Canceled by user.",
            canceled: true
          };
        }
        const paragraph = paragraphs[paragraphIndex];
        const result = await annotateParagraph(paragraph);
        if (!result.ok) {
          if (isCanceledResult(result)) {
            finishProgress(false, "Annotation canceled.", "");
            return {
              ok: false,
              error: C.ERROR_CODES.CANCELED,
              details: "Canceled by user.",
              canceled: true
            };
          }
          finishProgress(
            false,
            "Annotation stopped.",
            result.details || result.error || "Unknown error"
          );
          return {
            ok: false,
            error: result.error || "annotation_failed",
            details: result.details || "Paragraph annotation failed."
          };
        }

        totalScanned += result.stats.scanned;
        totalReplacedNodes += result.stats.replacedNodes;
        totalAnnotatedTokens += result.stats.annotatedTokens;
        totalSkipped += result.stats.skipped;

        const done = paragraphIndex + 1;
        renderProgress(
          done,
          totalSteps,
          `${done} / ${paragraphs.length} paragraphs | ruby ${totalAnnotatedTokens}`,
          `Updating page...`
        );

        if (C.LIMITS.PARAGRAPH_DELAY_MS > 0) {
          await new Promise((resolve) => setTimeout(resolve, C.LIMITS.PARAGRAPH_DELAY_MS));
        }
      }

      renderProgress(
        paragraphs.length,
        totalSteps,
        `${paragraphs.length} / ${paragraphs.length} paragraphs | ruby ${totalAnnotatedTokens}`,
        "Final pass..."
      );
      if (cancelRequested) {
        finishProgress(false, "Annotation canceled.", "");
        return {
          ok: false,
          error: C.ERROR_CODES.CANCELED,
          details: "Canceled by user.",
          canceled: true
        };
      }
      const finalResult = await annotateParagraph(root);
      if (!finalResult.ok) {
        if (isCanceledResult(finalResult)) {
          finishProgress(false, "Annotation canceled.", "");
          return {
            ok: false,
            error: C.ERROR_CODES.CANCELED,
            details: "Canceled by user.",
            canceled: true
          };
        }
        finishProgress(
          false,
          "Annotation stopped.",
          finalResult.details || finalResult.error || "Unknown error"
        );
        return {
          ok: false,
          error: finalResult.error || "annotation_failed",
          details: finalResult.details || "Final pass failed."
        };
      }

      totalScanned += finalResult.stats.scanned;
      totalReplacedNodes += finalResult.stats.replacedNodes;
      totalAnnotatedTokens += finalResult.stats.annotatedTokens;
      totalSkipped += finalResult.stats.skipped;
      renderProgress(
        totalSteps,
        totalSteps,
        `${paragraphs.length} / ${paragraphs.length} paragraphs | ruby ${totalAnnotatedTokens}`,
        "Final pass done."
      );

      finishProgress(
        true,
        "Annotation completed.",
        `scanned ${totalScanned}, updated ${totalReplacedNodes}, ruby ${totalAnnotatedTokens}`
      );

      return {
        ok: true,
        stats: {
          scanned: totalScanned,
          replacedNodes: totalReplacedNodes,
          annotatedTokens: totalAnnotatedTokens,
          skipped: totalSkipped
        }
      };
    } catch (error) {
      finishProgress(false, "Annotation failed.", error?.message || String(error));
      return {
        ok: false,
        error: "annotation_failed",
        details: error?.message || String(error)
      };
    } finally {
      annotationInProgress = false;
    }
  }

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    const type = message?.type;
    if (type === C.MESSAGE_TYPES.PING) {
      sendResponse({ ok: true });
      return;
    }

    if (type === C.MESSAGE_TYPES.CANCEL_ANNOTATION) {
      cancelRequested = true;
      emitRuntimeProgress("canceling", 0, "Cancel requested...", "", true);
      sendResponse({ ok: true });
      return;
    }

    if (type === C.MESSAGE_TYPES.RESTORE_PAGE) {
      if (annotationInProgress) {
        sendResponse({
          ok: false,
          error: C.ERROR_CODES.BUSY,
          details: "Cannot restore while annotation is running."
        });
        return;
      }
      const restored = restoreAnnotations();
      sendResponse({
        ok: true,
        stats: restored,
        details: `Restored ${restored.restored} ruby annotations.`
      });
      return;
    }

    if (type === C.MESSAGE_TYPES.ANNOTATE_PAGE) {
      annotatePage().then(sendResponse);
      return true;
    }
  });
})();
