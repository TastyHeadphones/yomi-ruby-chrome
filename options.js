(() => {
  const C = globalThis.YomiRubyConstants;
  const I18N = globalThis.YomiRubyI18n;

  const title = document.getElementById("optionsTitle");
  const description = document.getElementById("optionsDescription");
  const developerPortalLink = document.getElementById("developerPortalLink");
  const clientIdLabel = document.getElementById("clientIdLabel");
  const clientIdInput = document.getElementById("apiKeyInput");
  const offlineModeCheckbox = document.getElementById("demoModeCheckbox");
  const offlineModeLabel = document.getElementById("offlineModeLabel");
  const offlineModeHelp = document.getElementById("offlineModeHelp");
  const testButton = document.getElementById("testButton");
  const saveButton = document.getElementById("saveButton");
  const howToTitle = document.getElementById("howToTitle");
  const step1 = document.getElementById("step1");
  const step2 = document.getElementById("step2");
  const step3 = document.getElementById("step3");
  const furiganaReferencePrefix = document.getElementById("furiganaReferencePrefix");
  const furiganaReferenceLink = document.getElementById("furiganaReferenceLink");
  const feedback = document.getElementById("feedback");

  function t(key, vars = {}) {
    return typeof I18N?.t === "function" ? I18N.t(key, vars) : key;
  }

  function setFeedback(message, isError = false) {
    feedback.textContent = message;
    feedback.style.color = isError ? "#b91c1c" : "#166534";
  }

  function validateClientId(value) {
    if (!value) {
      return { valid: true };
    }
    if (/\s/.test(value)) {
      return { valid: false, message: t("options_client_id_should_not_contain_spaces") };
    }
    if (value.length < 8) {
      return { valid: false, message: t("options_client_id_looks_too_short") };
    }
    return { valid: true };
  }

  function setBusy(isBusy) {
    testButton.disabled = isBusy;
    saveButton.disabled = isBusy;
  }

  function applyLocalizedText() {
    document.documentElement.lang = I18N?.locale || "en";
    document.title = t("options_title");
    title.textContent = t("options_title");
    description.textContent = t("options_description");
    developerPortalLink.textContent = "Yahoo! JAPAN Developer Network";
    clientIdLabel.textContent = t("options_client_id_label");
    clientIdInput.placeholder = t("options_client_id_placeholder");
    offlineModeLabel.textContent = t("options_offline_mode_label");
    offlineModeHelp.textContent = t("options_offline_mode_help");
    testButton.textContent = t("options_test_client_id");
    saveButton.textContent = t("options_save_settings");
    howToTitle.textContent = t("options_how_to_get_client_id");
    step1.textContent = t("options_step_1");
    step2.textContent = t("options_step_2");
    step3.textContent = t("options_step_3");
    furiganaReferencePrefix.textContent = `${t("options_furigana_reference")}:`;
    furiganaReferenceLink.textContent = "FuriganaService V2";
  }

  async function loadSettings() {
    const values = await chrome.storage.sync.get([
      C.STORAGE_KEYS.YAHOO_CLIENT_ID,
      C.STORAGE_KEYS.OFFLINE_MODE_ENABLED,
      C.STORAGE_KEYS.LEGACY_API_KEY,
      C.STORAGE_KEYS.LEGACY_DEMO_MODE_ENABLED
    ]);
    const clientId = String(
      values[C.STORAGE_KEYS.YAHOO_CLIENT_ID] ||
        values[C.STORAGE_KEYS.LEGACY_API_KEY] ||
        ""
    );
    const offlineModeEnabled =
      typeof values[C.STORAGE_KEYS.OFFLINE_MODE_ENABLED] === "boolean"
        ? values[C.STORAGE_KEYS.OFFLINE_MODE_ENABLED]
        : typeof values[C.STORAGE_KEYS.LEGACY_DEMO_MODE_ENABLED] === "boolean"
          ? values[C.STORAGE_KEYS.LEGACY_DEMO_MODE_ENABLED]
          : C.DEFAULTS.OFFLINE_MODE_ENABLED;

    clientIdInput.value = clientId;
    offlineModeCheckbox.checked = offlineModeEnabled;
  }

  async function saveSettings() {
    const clientId = clientIdInput.value.trim();
    const offlineModeEnabled = offlineModeCheckbox.checked;

    const validation = validateClientId(clientId);
    if (!validation.valid) {
      setFeedback(validation.message || t("options_client_id_test_failed"), true);
      return;
    }

    if (!clientId && !offlineModeEnabled) {
      setFeedback(t("options_provide_client_id_or_enable_offline"), true);
      return;
    }

    await chrome.storage.sync.set({
      [C.STORAGE_KEYS.YAHOO_CLIENT_ID]: clientId,
      [C.STORAGE_KEYS.OFFLINE_MODE_ENABLED]: offlineModeEnabled
    });

    setFeedback(t("options_settings_saved"));
  }

  async function testClientId() {
    const clientId = clientIdInput.value.trim();
    if (!clientId) {
      setFeedback(t("options_enter_client_id_before_testing"), true);
      return;
    }

    const validation = validateClientId(clientId);
    if (!validation.valid) {
      setFeedback(validation.message || t("options_client_id_test_failed"), true);
      return;
    }

    setBusy(true);
    setFeedback(t("options_testing_client_id"));

    try {
      const response = await chrome.runtime.sendMessage({
        type: C.MESSAGE_TYPES.TEST_CLIENT_ID,
        payload: { clientId }
      });
      if (!response?.ok) {
        setFeedback(response?.details || t("options_client_id_test_failed"), true);
        return;
      }
      setFeedback(response?.details || t("options_client_id_test_succeeded"));
    } finally {
      setBusy(false);
    }
  }

  testButton.addEventListener("click", () => {
    testClientId().catch((error) => {
      setBusy(false);
      setFeedback(error?.message || t("options_client_id_test_failed"), true);
    });
  });

  saveButton.addEventListener("click", () => {
    setBusy(true);
    saveSettings()
      .catch((error) => {
        setFeedback(error?.message || t("options_client_id_test_failed"), true);
      })
      .finally(() => {
        setBusy(false);
      });
  });

  applyLocalizedText();
  loadSettings().catch((error) => {
    setFeedback(error?.message || t("options_client_id_test_failed"), true);
  });
})();
