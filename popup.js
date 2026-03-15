(() => {
  const C = globalThis.YomiRubyConstants;
  const toggle = document.getElementById("tabToggle");
  const toggleLabel = document.getElementById("toggleLabel");
  const annotateButton = document.getElementById("annotateBtn");
  const settingsButton = document.getElementById("settingsBtn");
  const statusText = document.getElementById("statusText");

  let currentTabId = null;

  function setStatus(message, isError = false) {
    statusText.textContent = message;
    statusText.style.color = isError ? "#b91c1c" : "#374151";
  }

  function setControlsEnabled(enabled) {
    toggle.disabled = !enabled;
    annotateButton.disabled = !enabled;
  }

  function updateToggleLabel(enabled) {
    toggleLabel.textContent = enabled ? "Enabled on this tab" : "Enable on this tab";
  }

  async function getActiveTab() {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    return tabs[0] || null;
  }

  async function refreshTabState() {
    const tab = await getActiveTab();
    if (!tab || typeof tab.id !== "number") {
      setControlsEnabled(false);
      setStatus("No active tab available.", true);
      return;
    }

    currentTabId = tab.id;
    const supported = /^(https?|file):/i.test(tab.url || "");
    if (!supported) {
      setControlsEnabled(false);
      setStatus("This page cannot be annotated.", true);
      return;
    }

    setControlsEnabled(true);

    const response = await chrome.runtime.sendMessage({
      type: C.MESSAGE_TYPES.GET_TAB_STATE,
      payload: { tabId: currentTabId }
    });
    const enabled = Boolean(response?.enabled);
    toggle.checked = enabled;
    updateToggleLabel(enabled);
  }

  async function runAnnotation(trigger) {
    if (typeof currentTabId !== "number") {
      setStatus("No target tab.", true);
      return;
    }

    setStatus("Running annotation...");
    const response = await chrome.runtime.sendMessage({
      type: C.MESSAGE_TYPES.RUN_ANNOTATION,
      payload: { tabId: currentTabId, trigger }
    });

    if (!response?.ok) {
      const details = response?.details || response?.error || "Annotation failed.";
      setStatus(details, true);
      return;
    }

    const stats = response?.stats;
    if (!stats) {
      setStatus("Annotation completed.");
      return;
    }
    setStatus(
      `Done: scanned ${stats.scanned}, updated ${stats.replacedNodes}, ruby ${stats.annotatedTokens}.`
    );
  }

  toggle.addEventListener("change", async () => {
    if (typeof currentTabId !== "number") {
      return;
    }
    const enabled = toggle.checked;
    updateToggleLabel(enabled);

    await chrome.runtime.sendMessage({
      type: C.MESSAGE_TYPES.SET_TAB_STATE,
      payload: { tabId: currentTabId, enabled }
    });

    if (enabled) {
      await runAnnotation("toggle");
    } else {
      setStatus("Annotation disabled for this tab.");
    }
  });

  annotateButton.addEventListener("click", async () => {
    await runAnnotation("manual");
  });

  settingsButton.addEventListener("click", async () => {
    await chrome.runtime.openOptionsPage();
  });

  refreshTabState().catch((error) => {
    setStatus(error?.message || "Popup initialization failed.", true);
  });
})();
