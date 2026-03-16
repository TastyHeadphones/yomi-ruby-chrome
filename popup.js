(() => {
  const C = globalThis.YomiRubyConstants;
  const toggle = document.getElementById("tabToggle");
  const toggleLabel = document.getElementById("toggleLabel");
  const annotateButton = document.getElementById("annotateBtn");
  const cancelButton = document.getElementById("cancelBtn");
  const restoreButton = document.getElementById("restoreBtn");
  const settingsButton = document.getElementById("settingsBtn");
  const statusText = document.getElementById("statusText");

  let currentTabId = null;
  let pageSupported = false;
  let annotationRunning = false;
  let statusPollTimer = null;

  function setStatus(message, isError = false) {
    statusText.textContent = message;
    statusText.style.color = isError ? "#b91c1c" : "#374151";
  }

  function setControlsEnabled(enabled) {
    toggle.disabled = !enabled;
    annotateButton.disabled = !enabled || annotationRunning;
    restoreButton.disabled = !enabled || annotationRunning;
    cancelButton.disabled = !enabled || !annotationRunning;
    settingsButton.disabled = false;
  }

  function updateToggleLabel(enabled) {
    toggleLabel.textContent = enabled ? "Enabled on all pages" : "Enable on all pages";
  }

  function updateRunningUi(status) {
    annotationRunning = Boolean(status?.running);
    cancelButton.style.display = annotationRunning ? "block" : "none";

    if (annotationRunning) {
      const percent = Number.isFinite(status?.progressPercent) ? status.progressPercent : 0;
      annotateButton.textContent = `Annotating... ${percent}%`;
      const message = status?.message || "Running annotation...";
      const meta = status?.meta ? ` | ${status.meta}` : "";
      setStatus(`${message}${meta}`);
    } else {
      annotateButton.textContent = "Run Annotation Now";
      const state = String(status?.state || "");
      if (state === "done") {
        setStatus(status?.meta || "Annotation completed.");
      } else if (state === "canceled") {
        setStatus("Annotation canceled.");
      } else if (state === "error") {
        setStatus(status?.meta || "Annotation failed.", true);
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

  async function refreshContext() {
    const tab = await getActiveTab();
    if (!tab || typeof tab.id !== "number") {
      pageSupported = false;
      setControlsEnabled(false);
      setStatus("No active tab available.", true);
      return;
    }

    currentTabId = tab.id;
    pageSupported = /^(https?|file):/i.test(tab.url || "");
    if (!pageSupported) {
      setControlsEnabled(false);
      setStatus("This page cannot be annotated.", true);
      return;
    }

    setControlsEnabled(true);
    await refreshGlobalState();
    await fetchAnnotationStatus();
    startStatusPolling();
  }

  async function runAnnotation(trigger) {
    if (typeof currentTabId !== "number" || !pageSupported) {
      setStatus("No target page.", true);
      return;
    }
    if (annotationRunning) {
      return;
    }

    setStatus("Starting annotation...");
    annotateButton.disabled = true;
    annotateButton.textContent = "Starting...";

    const response = await chrome.runtime.sendMessage({
      type: C.MESSAGE_TYPES.RUN_ANNOTATION,
      payload: { tabId: currentTabId, trigger }
    });

    await fetchAnnotationStatus();

    if (!response?.ok) {
      const details = response?.details || response?.error || "Annotation failed.";
      setStatus(details, true);
      return;
    }

    const stats = response?.stats;
    if (stats) {
      setStatus(`Done: scanned ${stats.scanned}, updated ${stats.replacedNodes}, ruby ${stats.annotatedTokens}.`);
    } else {
      setStatus("Annotation completed.");
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
      setStatus(response?.details || "Cancel request failed.", true);
      return;
    }
    setStatus(response?.details || "Cancel requested.");
    await fetchAnnotationStatus();
  }

  async function restorePage() {
    if (typeof currentTabId !== "number" || !pageSupported) {
      setStatus("No target page.", true);
      return;
    }
    if (annotationRunning) {
      setStatus("Cannot restore while annotation is running.", true);
      return;
    }

    const response = await chrome.runtime.sendMessage({
      type: C.MESSAGE_TYPES.RESTORE_PAGE,
      payload: { tabId: currentTabId }
    });

    if (!response?.ok) {
      setStatus(response?.details || "Restore failed.", true);
      return;
    }
    setStatus(response?.details || "Restored.");
  }

  toggle.addEventListener("change", async () => {
    const enabled = toggle.checked;
    updateToggleLabel(enabled);
    await chrome.runtime.sendMessage({
      type: C.MESSAGE_TYPES.SET_GLOBAL_STATE,
      payload: { enabled }
    });

    if (enabled) {
      setStatus("Enabled on all pages.");
      await runAnnotation("toggle_global");
    } else {
      setStatus("Disabled on all pages.");
    }
  });

  annotateButton.addEventListener("click", async () => {
    await runAnnotation("manual");
  });

  cancelButton.addEventListener("click", async () => {
    await cancelAnnotation();
  });

  restoreButton.addEventListener("click", async () => {
    await restorePage();
  });

  settingsButton.addEventListener("click", async () => {
    await chrome.runtime.openOptionsPage();
  });

  window.addEventListener("unload", () => {
    stopStatusPolling();
  });

  refreshContext().catch((error) => {
    setStatus(error?.message || "Popup initialization failed.", true);
  });
})();
