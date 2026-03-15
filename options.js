(() => {
  const C = globalThis.YomiRubyConstants;
  const apiKeyInput = document.getElementById("apiKeyInput");
  const demoModeCheckbox = document.getElementById("demoModeCheckbox");
  const testButton = document.getElementById("testButton");
  const saveButton = document.getElementById("saveButton");
  const feedback = document.getElementById("feedback");

  function setFeedback(message, isError = false) {
    feedback.textContent = message;
    feedback.style.color = isError ? "#b91c1c" : "#166534";
  }

  function validateApiKey(value) {
    if (!value) {
      return { valid: true };
    }
    if (/\s/.test(value)) {
      return { valid: false, message: "API key should not contain spaces." };
    }
    if (value.length < 8) {
      return { valid: false, message: "API key looks too short." };
    }
    return { valid: true };
  }

  function setBusy(isBusy) {
    testButton.disabled = isBusy;
    saveButton.disabled = isBusy;
  }

  async function loadSettings() {
    const values = await chrome.storage.sync.get([
      C.STORAGE_KEYS.API_KEY,
      C.STORAGE_KEYS.DEMO_MODE_ENABLED
    ]);
    const apiKey = String(values[C.STORAGE_KEYS.API_KEY] || "");
    const demoEnabled =
      typeof values[C.STORAGE_KEYS.DEMO_MODE_ENABLED] === "boolean"
        ? values[C.STORAGE_KEYS.DEMO_MODE_ENABLED]
        : C.DEFAULTS.DEMO_MODE_ENABLED;

    apiKeyInput.value = apiKey;
    demoModeCheckbox.checked = demoEnabled;
  }

  async function saveSettings() {
    const apiKey = apiKeyInput.value.trim();
    const demoModeEnabled = demoModeCheckbox.checked;

    const validation = validateApiKey(apiKey);
    if (!validation.valid) {
      setFeedback(validation.message || "Invalid API key.", true);
      return;
    }

    if (!apiKey && !demoModeEnabled) {
      setFeedback("Provide an API key or enable demo mode.", true);
      return;
    }

    await chrome.storage.sync.set({
      [C.STORAGE_KEYS.API_KEY]: apiKey,
      [C.STORAGE_KEYS.DEMO_MODE_ENABLED]: demoModeEnabled
    });

    setFeedback("Settings saved.");
  }

  async function testApiKey() {
    const apiKey = apiKeyInput.value.trim();
    if (!apiKey) {
      setFeedback("Enter an API key before testing.", true);
      return;
    }

    const validation = validateApiKey(apiKey);
    if (!validation.valid) {
      setFeedback(validation.message || "Invalid API key.", true);
      return;
    }

    setBusy(true);
    setFeedback("Testing API key...");

    try {
      const response = await chrome.runtime.sendMessage({
        type: C.MESSAGE_TYPES.TEST_API_KEY,
        payload: { apiKey }
      });
      if (!response?.ok) {
        setFeedback(response?.details || "API test failed.", true);
        return;
      }
      setFeedback(response?.details || "API test succeeded.");
    } finally {
      setBusy(false);
    }
  }

  testButton.addEventListener("click", () => {
    testApiKey().catch((error) => {
      setBusy(false);
      setFeedback(error?.message || "API test failed.", true);
    });
  });

  saveButton.addEventListener("click", () => {
    setBusy(true);
    saveSettings()
      .catch((error) => {
        setFeedback(error?.message || "Failed to save settings.", true);
      })
      .finally(() => {
        setBusy(false);
      });
  });

  loadSettings().catch((error) => {
    setFeedback(error?.message || "Failed to load settings.", true);
  });
})();
