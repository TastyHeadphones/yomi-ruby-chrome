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
  let editModeEnabled = false;
  let editToolbar = null;
  let editStatusTimer = null;
  let activeEditor = null;
  let activeEditorTarget = null;
  let pageOverrides = new Map();

  const PROGRESS_ID = "yomiruby-progress-overlay";
  const PROGRESS_BAR_ID = "yomiruby-progress-fill";
  const PROGRESS_TEXT_ID = "yomiruby-progress-text";
  const PROGRESS_META_ID = "yomiruby-progress-meta";
  const EDIT_TOOLBAR_ID = "yomiruby-edit-toolbar";
  const EDIT_TOOLBAR_META_ID = "yomiruby-edit-toolbar-meta";
  const EDIT_TOOLBAR_STATUS_ID = "yomiruby-edit-toolbar-status";
  const INLINE_EDITOR_ID = "yomiruby-inline-editor";
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
      html[data-yomiruby-edit-mode='1'] ruby.yomiruby-ruby[data-yomiruby-annotated='1'] {
        border-radius: 6px;
        box-shadow: inset 0 -2px 0 rgba(234, 179, 8, 0.28);
      }
      html[data-yomiruby-edit-mode='1']
        ruby.yomiruby-ruby[data-yomiruby-annotated='1'] rt.yomiruby-rt {
        cursor: pointer;
        color: #854d0e;
        background: rgba(254, 240, 138, 0.9);
        border: 1px solid rgba(202, 138, 4, 0.52);
        border-radius: 999px;
        padding: 0.12em 0.46em;
        margin-inline: 0.08em;
        box-shadow: 0 2px 6px rgba(202, 138, 4, 0.14);
        transition:
          background-color 120ms ease,
          box-shadow 120ms ease,
          transform 120ms ease;
      }
      html[data-yomiruby-edit-mode='1']
        ruby.yomiruby-ruby[data-yomiruby-annotated='1'] rt.yomiruby-rt:hover {
        background: rgba(253, 224, 71, 0.96);
        box-shadow: 0 4px 10px rgba(202, 138, 4, 0.18);
        transform: translateY(-1px);
      }
      html[data-yomiruby-edit-mode='1']
        ruby.yomiruby-ruby[data-yomiruby-user-edited='1'][data-yomiruby-annotated='1'] {
        background: rgba(187, 247, 208, 0.24);
        box-shadow:
          inset 0 -2px 0 rgba(22, 101, 52, 0.42),
          0 0 0 1px rgba(22, 101, 52, 0.18);
      }
      html[data-yomiruby-edit-mode='1']
        ruby.yomiruby-ruby[data-yomiruby-user-edited='1'][data-yomiruby-annotated='1'] rt.yomiruby-rt {
        color: #166534;
        background: rgba(187, 247, 208, 0.98);
        border-color: rgba(22, 101, 52, 0.46);
        box-shadow: 0 4px 12px rgba(22, 101, 52, 0.16);
      }
      html[data-yomiruby-edit-mode='1']
        ruby.yomiruby-ruby[data-yomiruby-editing='1'][data-yomiruby-annotated='1'] rt.yomiruby-rt {
        background: rgba(134, 239, 172, 1);
        border-color: rgba(21, 128, 61, 0.58);
        box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.22);
        transform: translateY(-1px);
      }
      #${EDIT_TOOLBAR_ID} {
        position: fixed;
        top: 16px;
        right: 16px;
        width: min(340px, calc(100vw - 32px));
        border: 1px solid rgba(15, 23, 42, 0.14);
        border-radius: 14px;
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(241, 245, 249, 0.98));
        box-shadow: 0 20px 44px rgba(15, 23, 42, 0.18);
        color: #0f172a;
        font: 13px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        padding: 12px;
        z-index: 2147483647;
      }
      #${EDIT_TOOLBAR_ID} .yomi-edit-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        margin-bottom: 6px;
      }
      #${EDIT_TOOLBAR_ID} .yomi-edit-title {
        font-size: 14px;
        font-weight: 700;
      }
      #${EDIT_TOOLBAR_ID} .yomi-edit-hint {
        color: #475569;
        margin-bottom: 8px;
      }
      #${EDIT_TOOLBAR_META_ID} {
        font-weight: 600;
        color: #0f766e;
        margin-bottom: 6px;
      }
      #${EDIT_TOOLBAR_STATUS_ID} {
        min-height: 20px;
        color: #334155;
      }
      #${EDIT_TOOLBAR_STATUS_ID}[data-error='1'] {
        color: #b91c1c;
      }
      #${EDIT_TOOLBAR_ID} .yomi-edit-close {
        border: 1px solid rgba(148, 163, 184, 0.4);
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.88);
        color: #0f172a;
        min-width: 32px;
        height: 32px;
        padding: 0 10px;
        cursor: pointer;
        font: inherit;
      }
      #${INLINE_EDITOR_ID} {
        position: fixed;
        min-width: 240px;
        max-width: min(320px, calc(100vw - 24px));
        border: 1px solid rgba(15, 23, 42, 0.16);
        border-radius: 14px;
        background: rgba(255, 255, 255, 0.98);
        box-shadow: 0 20px 48px rgba(15, 23, 42, 0.22);
        color: #0f172a;
        font: 13px/1.4 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        padding: 12px;
        z-index: 2147483647;
      }
      #${INLINE_EDITOR_ID} .yomi-edit-surface {
        font-size: 14px;
        font-weight: 700;
        margin-bottom: 2px;
      }
      #${INLINE_EDITOR_ID} .yomi-edit-original {
        color: #475569;
        margin-bottom: 10px;
      }
      #${INLINE_EDITOR_ID} input {
        width: 100%;
        height: 38px;
        border: 1px solid #cbd5e1;
        border-radius: 10px;
        padding: 0 10px;
        font: inherit;
        margin-bottom: 10px;
      }
      #${INLINE_EDITOR_ID} .yomi-edit-actions {
        display: flex;
        gap: 8px;
      }
      #${INLINE_EDITOR_ID} button {
        flex: 1;
        border: 1px solid #0f766e;
        border-radius: 10px;
        background: #0f766e;
        color: #ffffff;
        cursor: pointer;
        font: inherit;
        padding: 8px 10px;
      }
      #${INLINE_EDITOR_ID} button[data-variant='secondary'] {
        background: #ffffff;
        color: #0f766e;
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

  function clearEditStatusTimer() {
    if (editStatusTimer) {
      clearTimeout(editStatusTimer);
      editStatusTimer = null;
    }
  }

  function hashText(value) {
    let hash = 2166136261;
    for (const char of String(value || "")) {
      hash ^= char.codePointAt(0) || 0;
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16).padStart(8, "0");
  }

  function buildOverrideKey(sourceTextHash, surface, occurrenceIndex) {
    return `${sourceTextHash}:${surface}:${occurrenceIndex}`;
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, (char) => {
      switch (char) {
        case "&":
          return "&amp;";
        case "<":
          return "&lt;";
        case ">":
          return "&gt;";
        case '"':
          return "&quot;";
        case "'":
          return "&#39;";
        default:
          return char;
      }
    });
  }

  function countEditableRubies() {
    return document.querySelectorAll(ANNOTATED_RUBY_SELECTOR).length;
  }

  function countEditedRubies() {
    return document.querySelectorAll(
      `${ANNOTATED_RUBY_SELECTOR}[data-yomiruby-user-edited='1']`
    ).length;
  }

  function getEditModeState() {
    return {
      editMode: editModeEnabled,
      editableCount: countEditableRubies(),
      editedCount: countEditedRubies()
    };
  }

  function ensureEditToolbar() {
    if (editToolbar?.isConnected) {
      return editToolbar;
    }

    editToolbar = document.createElement("div");
    editToolbar.id = EDIT_TOOLBAR_ID;
    editToolbar.innerHTML = `
      <div class="yomi-edit-header">
        <div class="yomi-edit-title"></div>
        <button type="button" class="yomi-edit-close"></button>
      </div>
      <div class="yomi-edit-hint"></div>
      <div id="${EDIT_TOOLBAR_META_ID}"></div>
      <div id="${EDIT_TOOLBAR_STATUS_ID}"></div>
    `;

    editToolbar.querySelector(".yomi-edit-close")?.addEventListener("click", () => {
      setEditMode(false).catch(() => {});
    });

    const root = document.body || document.documentElement;
    if (root) {
      root.appendChild(editToolbar);
    }
    return editToolbar;
  }

  function renderEditToolbar() {
    if (!editModeEnabled) {
      return;
    }

    const toolbar = ensureEditToolbar();
    const state = getEditModeState();
    const title = toolbar.querySelector(".yomi-edit-title");
    const hint = toolbar.querySelector(".yomi-edit-hint");
    const closeButton = toolbar.querySelector(".yomi-edit-close");
    const meta = toolbar.querySelector(`#${EDIT_TOOLBAR_META_ID}`);

    if (title) {
      title.textContent = t("content_edit_mode_title");
    }
    if (hint) {
      hint.textContent =
        state.editableCount > 0
          ? t("content_edit_mode_hint")
          : t("content_edit_mode_empty_hint");
    }
    if (closeButton) {
      closeButton.textContent = t("content_exit_edit_mode");
    }
    if (meta) {
      meta.textContent =
        state.editableCount > 0
          ? t("content_edit_mode_counts", {
              total: state.editableCount,
              edited: state.editedCount
            })
          : t("content_edit_mode_empty");
    }
  }

  function setEditStatus(message, isError = false, timeoutMs = 2600) {
    if (!editModeEnabled) {
      return;
    }

    const toolbar = ensureEditToolbar();
    const status = toolbar.querySelector(`#${EDIT_TOOLBAR_STATUS_ID}`);
    if (!status) {
      return;
    }

    clearEditStatusTimer();
    status.textContent = message || "";
    if (isError) {
      status.setAttribute("data-error", "1");
    } else {
      status.removeAttribute("data-error");
    }

    if (message && timeoutMs > 0) {
      editStatusTimer = setTimeout(() => {
        if (status.textContent === message) {
          status.textContent = "";
          status.removeAttribute("data-error");
        }
      }, timeoutMs);
    }
  }

  async function refreshPageOverrides() {
    try {
      const response = await chrome.runtime.sendMessage({
        type: C.MESSAGE_TYPES.GET_PAGE_OVERRIDES
      });
      if (!response?.ok) {
        pageOverrides = new Map();
        return false;
      }
      pageOverrides = new Map(Object.entries(response.overrides || {}));
      return true;
    } catch (_error) {
      pageOverrides = new Map();
      return false;
    }
  }

  function prepareTokensForRender(sourceText, tokens) {
    const sourceTextHash = hashText(sourceText);
    const occurrenceBySurface = new Map();

    return (Array.isArray(tokens) ? tokens : []).map((token) => {
      const surface = typeof token?.surface === "string" ? token.surface : "";
      const originalFurigana =
        typeof token?.furigana === "string" ? token.furigana.trim() : "";
      const occurrenceIndex = occurrenceBySurface.get(surface) || 0;
      occurrenceBySurface.set(surface, occurrenceIndex + 1);

      const overrideKey = buildOverrideKey(sourceTextHash, surface, occurrenceIndex);
      const savedOverride = pageOverrides.get(overrideKey);
      const customFurigana = savedOverride?.customFurigana
        ? String(savedOverride.customFurigana).trim()
        : originalFurigana;

      return {
        ...token,
        furigana: customFurigana,
        originalFurigana,
        sourceTextHash,
        occurrenceIndex,
        overrideKey,
        userEdited: Boolean(savedOverride && customFurigana && customFurigana !== originalFurigana)
      };
    });
  }

  function closeRubyEditor() {
    if (activeEditorTarget?.isConnected) {
      activeEditorTarget.removeAttribute("data-yomiruby-editing");
    }
    activeEditorTarget = null;

    if (activeEditor?.isConnected) {
      activeEditor.remove();
    }
    activeEditor = null;
  }

  function updateRubyReadingElement(ruby, reading, userEdited) {
    const rt = ruby.querySelector("rt.yomiruby-rt");
    if (rt) {
      rt.textContent = reading;
    }
    ruby.setAttribute("data-yomiruby-current-reading", reading);
    if (userEdited) {
      ruby.setAttribute("data-yomiruby-user-edited", "1");
    } else {
      ruby.removeAttribute("data-yomiruby-user-edited");
    }
  }

  function positionInlineEditor(ruby, editor) {
    const rubyRect = ruby.getBoundingClientRect();
    const editorRect = editor.getBoundingClientRect();
    const margin = 12;

    let top = rubyRect.bottom + 10;
    if (top + editorRect.height > window.innerHeight - margin) {
      top = rubyRect.top - editorRect.height - 10;
    }

    let left = rubyRect.left + rubyRect.width / 2 - editorRect.width / 2;
    left = Math.max(margin, Math.min(left, window.innerWidth - editorRect.width - margin));
    top = Math.max(margin, Math.min(top, window.innerHeight - editorRect.height - margin));

    editor.style.top = `${top}px`;
    editor.style.left = `${left}px`;
  }

  function openRubyEditor(ruby) {
    if (!editModeEnabled || !ruby?.isConnected) {
      return;
    }

    closeRubyEditor();
    activeEditorTarget = ruby;
    ruby.setAttribute("data-yomiruby-editing", "1");

    const surface = ruby.getAttribute("data-yomiruby-surface") || "";
    const originalReading =
      ruby.getAttribute("data-yomiruby-original-reading") ||
      ruby.getAttribute("data-yomiruby-current-reading") ||
      ruby.querySelector("rt.yomiruby-rt")?.textContent ||
      "";
    const currentReading =
      ruby.getAttribute("data-yomiruby-current-reading") || originalReading;

    const editor = document.createElement("div");
    editor.id = INLINE_EDITOR_ID;
    editor.innerHTML = `
      <div class="yomi-edit-surface">${escapeHtml(surface)}</div>
      <div class="yomi-edit-original">${escapeHtml(
        t("content_original_reading_label", { reading: originalReading || "—" })
      )}</div>
      <input type="text" value="${escapeHtml(currentReading)}" spellcheck="false">
      <div class="yomi-edit-actions">
        <button type="button" data-action="save">${escapeHtml(t("content_save_reading"))}</button>
        <button type="button" data-action="reset" data-variant="secondary">${escapeHtml(
          t("content_reset_reading")
        )}</button>
        <button type="button" data-action="cancel" data-variant="secondary">${escapeHtml(
          t("content_cancel_edit")
        )}</button>
      </div>
    `;

    const root = document.body || document.documentElement;
    if (root) {
      root.appendChild(editor);
    }
    activeEditor = editor;
    positionInlineEditor(ruby, editor);

    const input = editor.querySelector("input");
    const saveButton = editor.querySelector("[data-action='save']");
    const resetButton = editor.querySelector("[data-action='reset']");
    const cancelButton = editor.querySelector("[data-action='cancel']");

    saveButton?.addEventListener("click", () => {
      persistRubyReading(ruby, input?.value || "").catch(() => {});
    });
    resetButton?.addEventListener("click", () => {
      resetRubyReading(ruby).catch(() => {});
    });
    cancelButton?.addEventListener("click", () => {
      closeRubyEditor();
    });
    input?.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        persistRubyReading(ruby, input.value || "").catch(() => {});
      } else if (event.key === "Escape") {
        event.preventDefault();
        closeRubyEditor();
      }
    });

    input?.focus();
    input?.select();
  }

  async function persistRubyReading(ruby, nextReading) {
    if (annotationInProgress) {
      setEditStatus(t("content_edit_mode_busy"), true, 3200);
      return false;
    }

    const trimmed = String(nextReading || "").trim();
    if (!trimmed) {
      setEditStatus(t("content_edit_requires_reading"), true, 3200);
      return false;
    }

    const overrideKey = String(ruby.getAttribute("data-yomiruby-override-key") || "").trim();
    const surface = String(ruby.getAttribute("data-yomiruby-surface") || "").trim();
    const sourceTextHash = String(ruby.getAttribute("data-yomiruby-source-hash") || "").trim();
    const occurrenceIndex = Number(ruby.getAttribute("data-yomiruby-occurrence") || "0");
    const originalReading =
      String(
        ruby.getAttribute("data-yomiruby-original-reading") ||
          ruby.getAttribute("data-yomiruby-current-reading") ||
          ""
      ).trim();

    if (!overrideKey || !surface || !sourceTextHash) {
      setEditStatus(t("content_edit_save_failed"), true, 3200);
      return false;
    }

    if (trimmed === originalReading) {
      return resetRubyReading(ruby);
    }

    const response = await chrome.runtime.sendMessage({
      type: C.MESSAGE_TYPES.SAVE_PAGE_OVERRIDE,
      payload: {
        overrideKey,
        override: {
          surface,
          sourceTextHash,
          occurrenceIndex: Number.isFinite(occurrenceIndex) ? occurrenceIndex : 0,
          originalFurigana: originalReading,
          customFurigana: trimmed
        }
      }
    });

    if (!response?.ok) {
      setEditStatus(response?.details || t("content_edit_save_failed"), true, 3200);
      return false;
    }

    pageOverrides.set(overrideKey, response.override || {});
    updateRubyReadingElement(ruby, trimmed, true);
    renderEditToolbar();
    setEditStatus(t("content_reading_saved"));
    closeRubyEditor();
    return true;
  }

  async function resetRubyReading(ruby) {
    if (annotationInProgress) {
      setEditStatus(t("content_edit_mode_busy"), true, 3200);
      return false;
    }

    const overrideKey = String(ruby.getAttribute("data-yomiruby-override-key") || "").trim();
    const originalReading =
      String(
        ruby.getAttribute("data-yomiruby-original-reading") ||
          ruby.getAttribute("data-yomiruby-current-reading") ||
          ""
      ).trim();

    if (overrideKey) {
      const response = await chrome.runtime.sendMessage({
        type: C.MESSAGE_TYPES.DELETE_PAGE_OVERRIDE,
        payload: { overrideKey }
      });
      if (!response?.ok) {
        setEditStatus(response?.details || t("content_edit_save_failed"), true, 3200);
        return false;
      }
      pageOverrides.delete(overrideKey);
    }

    updateRubyReadingElement(ruby, originalReading, false);
    renderEditToolbar();
    setEditStatus(t("content_reading_reset"));
    closeRubyEditor();
    return true;
  }

  async function setEditMode(enabled) {
    if (annotationInProgress) {
      return {
        ok: false,
        error: C.ERROR_CODES.BUSY,
        details: t("content_edit_mode_busy")
      };
    }

    if (typeof I18N?.init === "function") {
      await I18N.init();
    }
    ensureAnnotationStyle();

    if (enabled) {
      await refreshPageOverrides();
      editModeEnabled = true;
      document.documentElement?.setAttribute("data-yomiruby-edit-mode", "1");
      renderEditToolbar();
      setEditStatus(
        countEditableRubies() > 0 ? t("content_edit_mode_enabled") : t("content_edit_mode_empty_hint"),
        false,
        3200
      );
    } else {
      editModeEnabled = false;
      document.documentElement?.removeAttribute("data-yomiruby-edit-mode");
      clearEditStatusTimer();
      closeRubyEditor();
      if (editToolbar?.isConnected) {
        editToolbar.remove();
      }
      editToolbar = null;
    }

    return {
      ok: true,
      ...getEditModeState(),
      details: enabled ? t("content_edit_mode_enabled") : t("content_edit_mode_disabled")
    };
  }

  async function annotateParagraph(paragraph, batchResultMap = new Map()) {
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

      // Look up nodes in batchResultMap. Collect any that are missing.
      const missingTexts = [];
      for (const node of nodes) {
        if (node.nodeValue && !batchResultMap.has(node.nodeValue)) {
          missingTexts.push(node.nodeValue);
        }
      }

      if (missingTexts.length > 0) {
        const uniqueMissing = [...new Set(missingTexts)];
        const batchResponse = await chrome.runtime.sendMessage({
          type: C.MESSAGE_TYPES.ANNOTATE_TEXT_BATCH,
          payload: { texts: uniqueMissing }
        });

        if (batchResponse?.ok && Array.isArray(batchResponse.results)) {
          for (let j = 0; j < uniqueMissing.length; j++) {
            if (batchResponse.results[j]) {
              batchResultMap.set(uniqueMissing[j], batchResponse.results[j]);
            }
          }
        } else {
          return {
            ok: false,
            error: batchResponse?.error || "batch_request_failed",
            details: batchResponse?.details || "Background annotation batch failed."
          };
        }
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
        const result = batchResultMap.get(node.nodeValue);
        processedNodes.add(node);

        if (!node.isConnected) {
          skipped += 1;
          continue;
        }
        if (!result || result.error) {
          skipped += 1;
          continue;
        }

        const preparedTokens = prepareTokensForRender(node.nodeValue, result.tokens || []);
        const built = Ruby.buildAnnotatedFragment(document, node.nodeValue, preparedTokens);
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
    closeRubyEditor();
    ensureAnnotationStyle();
    await refreshPageOverrides();
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

      // Local batch result cache for this page annotation run.
      const batchResultMap = new Map();

      // Collect all text nodes across all paragraphs first to query in bulk
      const preFetchTextSet = new Set();
      const tempProcessed = new WeakSet();

      for (const paragraph of paragraphs) {
        const nodes = Dom.collectAnnotatableTextNodes(paragraph, {
          maxNodes: C.LIMITS.MAX_TEXT_NODES_PER_PARAGRAPH,
          maxLength: C.LIMITS.MAX_TEXT_LENGTH_PER_NODE,
          processedNodes: tempProcessed
        });
        for (const node of nodes) {
          if (node.nodeValue) {
            preFetchTextSet.add(node.nodeValue);
          }
        }
      }

      // Also collect from the root to catch any additional text nodes
      const rootNodes = Dom.collectAnnotatableTextNodes(root, {
        maxNodes: 2000,
        maxLength: C.LIMITS.MAX_TEXT_LENGTH_PER_NODE,
        processedNodes: tempProcessed
      });
      for (const node of rootNodes) {
        if (node.nodeValue) {
          preFetchTextSet.add(node.nodeValue);
        }
      }

      const allTexts = Array.from(preFetchTextSet);
      if (allTexts.length > 0) {
        renderProgress(
          0,
          totalSteps,
          t("content_paragraph_progress", { current: 0, total: paragraphs.length }),
          "Analyzing page text..."
        );

        const chunkSize = 1000;
        for (let i = 0; i < allTexts.length; i += chunkSize) {
          if (cancelRequested) {
            finishProgress(false, t("content_annotation_canceled"), "");
            return {
              ok: false,
              error: C.ERROR_CODES.CANCELED,
              details: t("content_annotation_canceled"),
              canceled: true
            };
          }

          const chunk = allTexts.slice(i, i + chunkSize);
          const response = await chrome.runtime.sendMessage({
            type: C.MESSAGE_TYPES.ANNOTATE_TEXT_BATCH,
            payload: { texts: chunk }
          });

          if (response?.ok && Array.isArray(response.results)) {
            for (let j = 0; j < chunk.length; j++) {
              if (response.results[j]) {
                batchResultMap.set(chunk[j], response.results[j]);
              }
            }
          } else {
            finishProgress(
              false,
              t("content_annotation_stopped"),
              response?.details || response?.error || "Pre-fetch batch request failed"
            );
            return {
              ok: false,
              error: response?.error || "prefetch_failed",
              details: response?.details || "Failed to pre-fetch page annotations."
            };
          }
        }
      }

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
        const result = await annotateParagraph(paragraph, batchResultMap);
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
      const finalResult = await annotateParagraph(root, batchResultMap);
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
      renderEditToolbar();

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
      renderEditToolbar();
    }
  }

  function handleDocumentClick(event) {
    if (!editModeEnabled) {
      return;
    }

    const target = event.target instanceof Element ? event.target : null;
    if (!target) {
      closeRubyEditor();
      return;
    }
    if (editToolbar?.contains(target) || activeEditor?.contains(target)) {
      return;
    }

    const kana = target.closest("rt.yomiruby-rt");
    if (kana) {
      const ruby = kana.closest(ANNOTATED_RUBY_SELECTOR);
      if (!ruby) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      openRubyEditor(ruby);
      return;
    }

    if (target.closest(ANNOTATED_RUBY_SELECTOR)) {
      return;
    }

    closeRubyEditor();
  }

  function handleDocumentKeydown(event) {
    if (!editModeEnabled || event.key !== "Escape") {
      return;
    }
    event.preventDefault();
    if (activeEditor) {
      closeRubyEditor();
      return;
    }
    setEditMode(false).catch(() => {});
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

    if (type === C.MESSAGE_TYPES.GET_EDIT_MODE_STATE) {
      sendResponse({ ok: true, ...getEditModeState() });
      return;
    }

    if (type === C.MESSAGE_TYPES.TOGGLE_EDIT_MODE) {
      setEditMode(!editModeEnabled).then(sendResponse);
      return true;
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

  document.addEventListener("click", handleDocumentClick, true);
  document.addEventListener("keydown", handleDocumentKeydown, true);
  window.addEventListener("scroll", () => {
    if (activeEditor) {
      closeRubyEditor();
    }
  }, true);
  window.addEventListener("resize", () => {
    if (activeEditor) {
      closeRubyEditor();
    }
  });
})();
