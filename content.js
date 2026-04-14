(() => {
  if (globalThis.__YOMIRUBY_CONTENT_SCRIPT_LOADED__) {
    return;
  }
  globalThis.__YOMIRUBY_CONTENT_SCRIPT_LOADED__ = true;

  const C = globalThis.YomiRubyConstants;
  const Dom = globalThis.YomiRubyDom;
  const Ruby = globalThis.YomiRubyRuby;
  const Japanese = globalThis.YomiRubyJapanese;
  const I18N = globalThis.YomiRubyI18n;

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
  const ANNOTATED_RUBY_SELECTOR = "ruby.yomiruby-ruby[data-yomiruby-annotated='1']";

  function t(key, vars = {}) {
    return typeof I18N?.t === "function" ? I18N.t(key, vars) : key;
  }

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
      html[data-yomiruby-kana-hidden='1'] ruby.yomiruby-ruby rt.yomiruby-rt,
      html[data-yomiruby-kana-hidden='1'] ruby.yomiruby-ruby rp {
        display: none !important;
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
      <div class="yomi-title">${t("app_name")}</div>
      <div class="yomi-track"><div id="${PROGRESS_BAR_ID}"></div></div>
      <div id="${PROGRESS_TEXT_ID}">${t("content_preparing")}</div>
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

  function getKanaVisibilityState() {
    const root = document.documentElement;
    return Boolean(root && root.getAttribute("data-yomiruby-kana-hidden") === "1");
  }

  function setKanaVisibility(hidden) {
    const root = document.documentElement;
    if (!root) {
      return { hidden: Boolean(hidden), affected: 0 };
    }

    const nextHidden = Boolean(hidden);
    if (nextHidden) {
      root.setAttribute("data-yomiruby-kana-hidden", "1");
    } else {
      root.removeAttribute("data-yomiruby-kana-hidden");
    }

    return {
      hidden: nextHidden,
      affected: document.querySelectorAll(ANNOTATED_RUBY_SELECTOR).length
    };
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
          details: t("content_annotation_canceled"),
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
            details: t("content_annotation_canceled"),
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

  async function annotatePage(options = {}) {
    if (annotationInProgress) {
      return { ok: false, error: "busy", details: t("content_annotation_already_running") };
    }

    if (typeof I18N?.init === "function") {
      await I18N.init();
    }
    annotationInProgress = true;
    cancelRequested = false;
    clearProgressCleanupTimer();
    ensureAnnotationStyle();
    const annotationEngine = String(options.annotationEngine || "");
    const localDictMode = annotationEngine === C.ANNOTATION_ENGINES.LOCAL_DICT;

    try {
      const root = document.body || document.documentElement;
      if (!root) {
        return { ok: false, error: "no_root_node", details: t("content_no_root_node") };
      }

      const paragraphs = collectParagraphRoots(root);
      if (paragraphs.length === 0) {
        finishProgress(true, t("content_no_kanji_text_found"), "");
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
        t("content_paragraph_progress", { current: 0, total: paragraphs.length }),
        t("content_starting_annotation")
      );

      for (let paragraphIndex = 0; paragraphIndex < paragraphs.length; paragraphIndex += 1) {
        if (cancelRequested) {
          finishProgress(false, t("content_annotation_canceled"), "");
          return {
            ok: false,
            error: C.ERROR_CODES.CANCELED,
            details: t("content_annotation_canceled"),
            canceled: true
          };
        }
        const paragraph = paragraphs[paragraphIndex];
        const result = await annotateParagraph(paragraph);
        if (!result.ok) {
          if (isCanceledResult(result)) {
            finishProgress(false, t("content_annotation_canceled"), "");
            return {
              ok: false,
              error: C.ERROR_CODES.CANCELED,
              details: t("content_annotation_canceled"),
              canceled: true
            };
          }
          finishProgress(
            false,
            t("content_annotation_stopped"),
            result.details || result.error || "Unknown error"
          );
          return {
            ok: false,
            error: result.error || "annotation_failed",
            details: result.details || t("content_annotation_failed")
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
          t("content_paragraph_progress_with_ruby", {
            current: done,
            total: paragraphs.length,
            ruby: totalAnnotatedTokens
          }),
          t("content_updating_page")
        );

        if (!localDictMode && C.LIMITS.PARAGRAPH_DELAY_MS > 0) {
          await new Promise((resolve) => setTimeout(resolve, C.LIMITS.PARAGRAPH_DELAY_MS));
        }
      }

      renderProgress(
        paragraphs.length,
        totalSteps,
        t("content_paragraph_progress_with_ruby", {
          current: paragraphs.length,
          total: paragraphs.length,
          ruby: totalAnnotatedTokens
        }),
        t("content_final_pass")
      );
      if (cancelRequested) {
        finishProgress(false, t("content_annotation_canceled"), "");
        return {
          ok: false,
          error: C.ERROR_CODES.CANCELED,
          details: t("content_annotation_canceled"),
          canceled: true
        };
      }
      const finalResult = await annotateParagraph(root);
      if (!finalResult.ok) {
        if (isCanceledResult(finalResult)) {
          finishProgress(false, t("content_annotation_canceled"), "");
          return {
            ok: false,
            error: C.ERROR_CODES.CANCELED,
            details: t("content_annotation_canceled"),
            canceled: true
          };
        }
        finishProgress(
          false,
          t("content_annotation_stopped"),
          finalResult.details || finalResult.error || "Unknown error"
        );
        return {
          ok: false,
          error: finalResult.error || "annotation_failed",
          details: finalResult.details || t("content_annotation_failed")
        };
      }

      totalScanned += finalResult.stats.scanned;
      totalReplacedNodes += finalResult.stats.replacedNodes;
      totalAnnotatedTokens += finalResult.stats.annotatedTokens;
      totalSkipped += finalResult.stats.skipped;
      renderProgress(
        totalSteps,
        totalSteps,
        t("content_paragraph_progress_with_ruby", {
          current: paragraphs.length,
          total: paragraphs.length,
          ruby: totalAnnotatedTokens
        }),
        t("content_final_pass_done")
      );

      finishProgress(
        true,
        t("content_annotation_completed"),
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
      finishProgress(false, t("content_annotation_failed"), error?.message || String(error));
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
      emitRuntimeProgress("canceling", 0, t("content_cancel_requested"), "", true);
      sendResponse({ ok: true });
      return;
    }

    if (type === C.MESSAGE_TYPES.GET_KANA_VISIBILITY) {
      sendResponse({ ok: true, hidden: getKanaVisibilityState() });
      return;
    }

    if (type === C.MESSAGE_TYPES.RESTORE_PAGE || type === C.MESSAGE_TYPES.SET_KANA_VISIBILITY) {
      if (annotationInProgress) {
        sendResponse({
          ok: false,
          error: C.ERROR_CODES.BUSY,
          details: t("popup_cannot_toggle_kana_while_running")
        });
        return;
      }
      const hidden = type === C.MESSAGE_TYPES.RESTORE_PAGE
        ? true
        : Boolean(message?.payload?.hidden);
      const result = setKanaVisibility(hidden);
      sendResponse({
        ok: true,
        stats: result,
        details: hidden ? t("content_kana_hidden") : t("content_kana_shown")
      });
      return;
    }

    if (type === C.MESSAGE_TYPES.ANNOTATE_PAGE) {
      annotatePage(message?.payload || {}).then(sendResponse);
      return true;
    }
  });
})();
