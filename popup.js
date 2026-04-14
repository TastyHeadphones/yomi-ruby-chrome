(() => {
  const C = globalThis.YomiRubyConstants;
  const I18N = globalThis.YomiRubyI18n;
  const toggle = document.getElementById("tabToggle");
  const toggleLabel = document.getElementById("toggleLabel");
  const annotateButton = document.getElementById("annotateBtn");
  const cancelButton = document.getElementById("cancelBtn");
  const kanaButton = document.getElementById("kanaBtn");
  const settingsButton = document.getElementById("settingsBtn");
  const statusText = document.getElementById("statusText");

  let currentTabId = null;
  let pageSupported = false;
  let annotationRunning = false;
  let kanaHidden = false;
  let statusPollTimer = null;

  function t(key, vars = {}) {
    return typeof I18N?.t === "function" ? I18N.t(key, vars) : key;
  }

  function setStatus(message, isError = false) {
    statusText.textContent = message;
    statusText.style.color = isError ? "#b91c1c" : "#374151";
  }

  function setControlsEnabled(enabled) {
    toggle.disabled = !enabled;
    annotateButton.disabled = !enabled || annotationRunning;
    kanaButton.disabled = !enabled || annotationRunning;
    cancelButton.disabled = !enabled || !annotationRunning;
    settingsButton.disabled = false;
  }

  function updateToggleLabel(enabled) {
    toggleLabel.textContent = enabled
      ? t("popup_enabled_on_all_pages")
      : t("popup_enable_on_all_pages");
  }

  function updateKanaButtonLabel() {
    kanaButton.textContent = kanaHidden ? t("popup_show_kana") : t("popup_hide_kana");
  }

  function updateRunningUi(status) {
    annotationRunning = Boolean(status?.running);
    cancelButton.style.display = annotationRunning ? "block" : "none";

    if (annotationRunning) {
      const percent = Number.isFinite(status?.progressPercent) ? status.progressPercent : 0;
      annotateButton.textContent = t("popup_annotating", { percent });
      const message = status?.message || t("popup_starting_annotation");
      const meta = status?.meta ? ` | ${status.meta}` : "";
      setStatus(`${message}${meta}`);
    } else {
      annotateButton.textContent = t("popup_run_annotation_now");
      updateKanaButtonLabel();
      const state = String(status?.state || "");
      if (state === "done") {
        setStatus(status?.meta || t("popup_annotation_completed"));
      } else if (state === "canceled") {
        setStatus(status?.meta || t("popup_annotation_canceled"));
      } else if (state === "error") {
        setStatus(status?.meta || t("popup_annotation_failed"), true);
      } else if (status?.message) {
        setStatus(status?.meta ? `${status.message} | ${status.meta}` : status.message);
      }
    }

    setControlsEnabled(pageSupported);
  }

  async function getActiveTab() {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    return tabs[0] || null;
  }

  async function fetchAnnotationStatus() {
    if (typeof currentTabId !== "number") {
      return;
    }
    const response = await chrome.runtime.sendMessage({
      type: C.MESSAGE_TYPES.GET_ANNOTATION_STATUS,
      payload: { tabId: currentTabId }
    });
    if (!response?.ok) {
      return;
    }
    updateRunningUi(response.status || {});
  }

  function startStatusPolling() {
    stopStatusPolling();
    statusPollTimer = setInterval(() => {
      fetchAnnotationStatus().catch(() => {});
    }, 500);
  }

  function stopStatusPolling() {
    if (statusPollTimer) {
      clearInterval(statusPollTimer);
      statusPollTimer = null;
    }
  }

  async function refreshGlobalState() {
    const response = await chrome.runtime.sendMessage({
      type: C.MESSAGE_TYPES.GET_GLOBAL_STATE
    });
    const enabled = Boolean(response?.enabled);
    toggle.checked = enabled;
    updateToggleLabel(enabled);
  }

  async function fetchKanaVisibility() {
    if (typeof currentTabId !== "number") {
      return;
    }
    const response = await chrome.runtime.sendMessage({
      type: C.MESSAGE_TYPES.GET_KANA_VISIBILITY,
      payload: { tabId: currentTabId }
    });
    if (!response?.ok) {
      return;
    }
    kanaHidden = Boolean(response.hidden);
    updateKanaButtonLabel();
  }

  async function refreshContext() {
    const tab = await getActiveTab();
    if (!tab || typeof tab.id !== "number") {
      pageSupported = false;
      setControlsEnabled(false);
      setStatus(t("popup_no_active_tab"), true);
      return;
    }

    currentTabId = tab.id;
    pageSupported = /^(https?|file):/i.test(tab.url || "");
    if (!pageSupported) {
      setControlsEnabled(false);
      setStatus(t("popup_page_cannot_be_annotated"), true);
      return;
    }

    setControlsEnabled(true);
    await refreshGlobalState();
    await fetchAnnotationStatus();
    await fetchKanaVisibility();
    startStatusPolling();
  }

  async function runAnnotation(trigger) {
    if (typeof currentTabId !== "number" || !pageSupported) {
      setStatus(t("popup_no_target_page"), true);
      return;
    }
    if (annotationRunning) {
      return;
    }

    setStatus(t("popup_starting_annotation"));
    annotateButton.disabled = true;
    annotateButton.textContent = t("popup_starting");

    const response = await chrome.runtime.sendMessage({
      type: C.MESSAGE_TYPES.RUN_ANNOTATION,
      payload: { tabId: currentTabId, trigger }
    });

    await fetchAnnotationStatus();

    if (!response?.ok) {
      const details = response?.details || response?.error || t("popup_annotation_failed");
      setStatus(details, true);
      return;
    }

    const stats = response?.stats;
    if (stats) {
      setStatus(
        t("popup_done_summary", {
          scanned: stats.scanned || 0,
          updated: stats.replacedNodes || 0,
          ruby: stats.annotatedTokens || 0
        })
      );
    } else {
      setStatus(t("popup_annotation_completed"));
    }
  }

  async function cancelAnnotation() {
    if (typeof currentTabId !== "number") {
      return;
    }
    const response = await chrome.runtime.sendMessage({
      type: C.MESSAGE_TYPES.CANCEL_ANNOTATION,
      payload: { tabId: currentTabId }
    });
    if (!response?.ok) {
      setStatus(response?.details || t("popup_cancel_request_failed"), true);
      return;
    }
    setStatus(response?.details || t("popup_cancel_requested"));
    await fetchAnnotationStatus();
  }

  async function toggleKanaVisibility() {
    if (typeof currentTabId !== "number" || !pageSupported) {
      setStatus(t("popup_no_target_page"), true);
      return;
    }
    if (annotationRunning) {
      setStatus(t("popup_cannot_toggle_kana_while_running"), true);
      return;
    }

    const response = await chrome.runtime.sendMessage({
      type: C.MESSAGE_TYPES.SET_KANA_VISIBILITY,
      payload: { tabId: currentTabId, hidden: !kanaHidden }
    });

    if (!response?.ok) {
      setStatus(response?.details || t("popup_kana_visibility_failed"), true);
      return;
    }
    kanaHidden = Boolean(response.hidden ?? !kanaHidden);
    updateKanaButtonLabel();
    setStatus(response?.details || (kanaHidden ? t("popup_kana_hidden") : t("popup_kana_shown")));
    await fetchAnnotationStatus();
  }

  toggle.addEventListener("change", async () => {
    const enabled = toggle.checked;
    updateToggleLabel(enabled);
    await chrome.runtime.sendMessage({
      type: C.MESSAGE_TYPES.SET_GLOBAL_STATE,
      payload: { enabled }
    });

    if (enabled) {
      setStatus(t("popup_enabled_on_all_pages"));
      await runAnnotation("toggle_global");
    } else {
      setStatus(t("popup_disabled_on_all_pages"));
    }
  });

  annotateButton.addEventListener("click", async () => {
    await runAnnotation("manual");
  });

  cancelButton.addEventListener("click", async () => {
    await cancelAnnotation();
  });

  kanaButton.addEventListener("click", async () => {
    await toggleKanaVisibility();
  });

  settingsButton.addEventListener("click", async () => {
    await chrome.runtime.openOptionsPage();
  });

  window.addEventListener("unload", () => {
    stopStatusPolling();
  });

  document.documentElement.lang = I18N?.locale || "en";
  document.title = t("app_name");
  annotateButton.textContent = t("popup_run_annotation_now");
  cancelButton.textContent = t("popup_cancel_running_job");
  updateKanaButtonLabel();
  settingsButton.textContent = t("popup_open_settings");

  refreshContext().catch((error) => {
    setStatus(error?.message || t("popup_initialization_failed"), true);
  });
})();
