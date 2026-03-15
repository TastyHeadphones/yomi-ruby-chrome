(() => {
  if (globalThis.__YOMIRUBY_CONTENT_SCRIPT_LOADED__) {
    return;
  }
  globalThis.__YOMIRUBY_CONTENT_SCRIPT_LOADED__ = true;

  const C = globalThis.YomiRubyConstants;
  const Dom = globalThis.YomiRubyDom;
  const Ruby = globalThis.YomiRubyRuby;

  const processedNodes = new WeakSet();
  let annotationInProgress = false;

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
    `;
    const root = document.head || document.documentElement;
    if (root) {
      root.appendChild(style);
    }
  }

  async function annotatePage() {
    if (annotationInProgress) {
      return { ok: false, error: "busy", details: "An annotation job is already running." };
    }

    annotationInProgress = true;
    ensureAnnotationStyle();

    try {
      const root = document.body || document.documentElement;
      if (!root) {
        return { ok: false, error: "no_root_node", details: "No document root available." };
      }

      const nodes = Dom.collectAnnotatableTextNodes(root, {
        maxNodes: C.LIMITS.MAX_TEXT_NODES_PER_RUN,
        maxLength: C.LIMITS.MAX_TEXT_LENGTH_PER_NODE,
        processedNodes
      });

      if (nodes.length === 0) {
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

      let replacedNodes = 0;
      let annotatedTokens = 0;
      let skipped = 0;

      for (let index = 0; index < nodes.length; index += 1) {
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

      return {
        ok: true,
        stats: {
          scanned: nodes.length,
          replacedNodes,
          annotatedTokens,
          skipped
        }
      };
    } catch (error) {
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

    if (type === C.MESSAGE_TYPES.ANNOTATE_PAGE) {
      annotatePage().then(sendResponse);
      return true;
    }
  });
})();
