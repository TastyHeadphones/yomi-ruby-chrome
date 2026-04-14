(() => {
  const C = globalThis.YomiRubyConstants;
  const I18N = globalThis.YomiRubyI18n;

  const title = document.getElementById("optionsTitle");
  const description = document.getElementById("optionsDescription");
  const developerPortalLink = document.getElementById("developerPortalLink");
  const uiLanguageLabel = document.getElementById("uiLanguageLabel");
  const uiLanguageSelect = document.getElementById("uiLanguageSelect");
  const uiLanguageHelp = document.getElementById("uiLanguageHelp");
  const clientIdLabel = document.getElementById("clientIdLabel");
  const clientIdInput = document.getElementById("apiKeyInput");
  const annotationModeLabel = document.getElementById("annotationModeLabel");
  const annotationModeSelect = document.getElementById("annotationModeSelect");
  const annotationModeHelp = document.getElementById("annotationModeHelp");
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

  function renderLanguageOptions(selectedValue) {
    const supported = Array.isArray(I18N?.supportedLocales) ? I18N.supportedLocales : [];
    const currentValue = selectedValue || uiLanguageSelect.value || C.DEFAULTS.UI_LOCALE;
    uiLanguageSelect.textContent = "";

    for (const entry of supported) {
      const option = document.createElement("option");
      option.value = entry.code;
      option.textContent =
        entry.code === "auto" ? t("options_ui_language_auto") : String(entry.label || entry.code);
      uiLanguageSelect.appendChild(option);
    }

    uiLanguageSelect.value = currentValue;
  }

  function applyLocalizedText() {
    document.documentElement.lang = I18N?.locale || "en";
    document.title = t("options_title");
    title.textContent = t("options_title");
    description.textContent = t("options_description");
    developerPortalLink.textContent = "Yahoo! JAPAN Developer Network";
    uiLanguageLabel.textContent = t("options_ui_language_label");
    uiLanguageHelp.textContent = t("options_ui_language_help");
    renderLanguageOptions(uiLanguageSelect.value || C.DEFAULTS.UI_LOCALE);
    clientIdLabel.textContent = t("options_client_id_label");
    clientIdInput.placeholder = t("options_client_id_placeholder");
    annotationModeLabel.textContent = t("options_annotation_mode_label");
    annotationModeHelp.textContent = t("options_annotation_mode_help");
    const localOption = annotationModeSelect.querySelector("option[value='local_dict']");
    const yahooOption = annotationModeSelect.querySelector("option[value='yahoo_api']");
    if (yahooOption) {
      yahooOption.textContent = t("options_mode_yahoo_api");
    }
    if (localOption) {
      localOption.textContent = t("options_mode_local_dict");
    }
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
      C.STORAGE_KEYS.UI_LOCALE,
      C.STORAGE_KEYS.ANNOTATION_ENGINE,
      C.STORAGE_KEYS.OFFLINE_MODE_ENABLED,
      C.STORAGE_KEYS.LEGACY_API_KEY,
      C.STORAGE_KEYS.LEGACY_DEMO_MODE_ENABLED
    ]);
    const clientId = String(
      values[C.STORAGE_KEYS.YAHOO_CLIENT_ID] ||
        values[C.STORAGE_KEYS.LEGACY_API_KEY] ||
        ""
    );
    const storedEngine = String(values[C.STORAGE_KEYS.ANNOTATION_ENGINE] || "").trim();
    const annotationEngine =
      storedEngine === C.ANNOTATION_ENGINES.YAHOO_API ||
      storedEngine === C.ANNOTATION_ENGINES.LOCAL_DICT
        ? storedEngine
        : typeof values[C.STORAGE_KEYS.OFFLINE_MODE_ENABLED] === "boolean"
          ? values[C.STORAGE_KEYS.OFFLINE_MODE_ENABLED]
            ? C.ANNOTATION_ENGINES.LOCAL_DICT
            : C.ANNOTATION_ENGINES.YAHOO_API
          : typeof values[C.STORAGE_KEYS.LEGACY_DEMO_MODE_ENABLED] === "boolean"
            ? values[C.STORAGE_KEYS.LEGACY_DEMO_MODE_ENABLED]
              ? C.ANNOTATION_ENGINES.LOCAL_DICT
              : C.ANNOTATION_ENGINES.YAHOO_API
            : C.DEFAULTS.ANNOTATION_ENGINE;
    const localePreference = I18N?.normalizeLocalePreference
      ? I18N.normalizeLocalePreference(values[C.STORAGE_KEYS.UI_LOCALE])
      : C.DEFAULTS.UI_LOCALE;

    clientIdInput.value = clientId;
    annotationModeSelect.value = annotationEngine;
    uiLanguageSelect.value = localePreference;
    renderLanguageOptions(localePreference);
  }

  async function saveSettings() {
    const clientId = clientIdInput.value.trim();
    const localePreference = I18N?.normalizeLocalePreference
      ? I18N.normalizeLocalePreference(uiLanguageSelect.value)
      : C.DEFAULTS.UI_LOCALE;
    const annotationEngine =
      annotationModeSelect.value === C.ANNOTATION_ENGINES.YAHOO_API
        ? C.ANNOTATION_ENGINES.YAHOO_API
        : C.ANNOTATION_ENGINES.LOCAL_DICT;

    if (annotationEngine === C.ANNOTATION_ENGINES.YAHOO_API) {
      const validation = validateClientId(clientId);
      if (!validation.valid) {
        setFeedback(validation.message || t("options_client_id_test_failed"), true);
        return;
      }

      if (!clientId) {
        setFeedback(t("options_provide_client_id_for_yahoo_mode"), true);
        return;
      }
    }

    await chrome.storage.sync.set({
      [C.STORAGE_KEYS.YAHOO_CLIENT_ID]: clientId,
      [C.STORAGE_KEYS.UI_LOCALE]: localePreference,
      [C.STORAGE_KEYS.ANNOTATION_ENGINE]: annotationEngine,
      [C.STORAGE_KEYS.OFFLINE_MODE_ENABLED]: annotationEngine === C.ANNOTATION_ENGINES.LOCAL_DICT
    });

    if (typeof I18N?.setLocalePreference === "function") {
      I18N.setLocalePreference(localePreference);
      applyLocalizedText();
    }
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

  (async () => {
    if (typeof I18N?.init === "function") {
      await I18N.init();
    }
    applyLocalizedText();
    await loadSettings();
  })().catch((error) => {
    setFeedback(error?.message || t("options_client_id_test_failed"), true);
  });
})();
