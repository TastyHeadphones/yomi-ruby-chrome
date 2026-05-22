(() => {
  const C = globalThis.YomiRubyConstants;
  const I18N = globalThis.YomiRubyI18n;

  const title = document.getElementById("optionsTitle");
  const description = document.getElementById("optionsDescription");
  const heroCardLabel = document.getElementById("heroCardLabel");
  const heroCardTitle = document.getElementById("heroCardTitle");
  const interfaceSectionTitle = document.getElementById("interfaceSectionTitle");
  const interfaceSectionDescription = document.getElementById("interfaceSectionDescription");
  const annotationSectionTitle = document.getElementById("annotationSectionTitle");
  const annotationSectionDescription = document.getElementById("annotationSectionDescription");
  const developerPortalLink = document.getElementById("developerPortalLink");
  const uiLanguageLabel = document.getElementById("uiLanguageLabel");
  const uiLanguageSelect = document.getElementById("uiLanguageSelect");
  const uiLanguageHelp = document.getElementById("uiLanguageHelp");
  const languageFeedback = document.getElementById("languageFeedback");
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
  const feedbackSectionTitle = document.getElementById("feedbackSectionTitle");
  const feedbackSectionDescription = document.getElementById("feedbackSectionDescription");
  const authorLabel = document.getElementById("authorLabel");
  const feedbackLinkText = document.getElementById("feedbackLinkText");

  function t(key, vars = {}) {
    return typeof I18N?.t === "function" ? I18N.t(key, vars) : key;
  }

  function setFeedback(target, message, isError = false) {
    if (!target) {
      return;
    }
    target.textContent = message;
    target.style.color = isError ? "#b91c1c" : "#0f766e";
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
    annotationModeSelect.disabled = isBusy;
    clientIdInput.disabled = isBusy;
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
    heroCardLabel.textContent = t("options_hero_label");
    heroCardTitle.textContent = t("options_hero_title");
    interfaceSectionTitle.textContent = t("options_interface_section_title");
    interfaceSectionDescription.textContent = t("options_interface_section_description");
    annotationSectionTitle.textContent = t("options_annotation_section_title");
    annotationSectionDescription.textContent = t("options_annotation_section_description");
    developerPortalLink.textContent = "Yahoo! JAPAN Developer Network";
    uiLanguageLabel.textContent = t("options_ui_language_label");
    uiLanguageHelp.textContent = t("options_ui_language_help");
    renderLanguageOptions(uiLanguageSelect.value || I18N.localePreference || C.DEFAULTS.UI_LOCALE);
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
    saveButton.textContent = t("options_save_annotation_settings");
    howToTitle.textContent = t("options_how_to_get_client_id");
    step1.textContent = t("options_step_1");
    step2.textContent = t("options_step_2");
    step3.textContent = t("options_step_3");
    furiganaReferencePrefix.textContent = `${t("options_furigana_reference")}:`;
    furiganaReferenceLink.textContent = "FuriganaService V2";
    feedbackSectionTitle.textContent = t("options_feedback_title");
    feedbackSectionDescription.textContent = t("options_feedback_description");
    authorLabel.textContent = t("options_author_label");
    feedbackLinkText.textContent = t("options_feedback_link_text");
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
    renderLanguageOptions(localePreference);
    uiLanguageSelect.value = localePreference;
  }

  async function applyLanguagePreference() {
    const localePreference = I18N?.normalizeLocalePreference
      ? I18N.normalizeLocalePreference(uiLanguageSelect.value)
      : C.DEFAULTS.UI_LOCALE;

    if (typeof I18N?.setLocalePreference === "function") {
      I18N.setLocalePreference(localePreference);
    }
    renderLanguageOptions(localePreference);
    uiLanguageSelect.value = localePreference;
    applyLocalizedText();

    try {
      await chrome.storage.sync.set({
        [C.STORAGE_KEYS.UI_LOCALE]: localePreference
      });
      setFeedback(languageFeedback, t("options_language_updated"));
    } catch (error) {
      setFeedback(
        languageFeedback,
        error?.message || t("options_language_update_failed"),
        true
      );
    }
  }

  async function saveAnnotationSettings() {
    const clientId = clientIdInput.value.trim();
    const annotationEngine =
      annotationModeSelect.value === C.ANNOTATION_ENGINES.YAHOO_API
        ? C.ANNOTATION_ENGINES.YAHOO_API
        : C.ANNOTATION_ENGINES.LOCAL_DICT;

    if (annotationEngine === C.ANNOTATION_ENGINES.YAHOO_API) {
      const validation = validateClientId(clientId);
      if (!validation.valid) {
        setFeedback(feedback, validation.message || t("options_client_id_test_failed"), true);
        return;
      }
      if (!clientId) {
        setFeedback(feedback, t("options_provide_client_id_for_yahoo_mode"), true);
        return;
      }
    }

    await chrome.storage.sync.set({
      [C.STORAGE_KEYS.YAHOO_CLIENT_ID]: clientId,
      [C.STORAGE_KEYS.ANNOTATION_ENGINE]: annotationEngine,
      [C.STORAGE_KEYS.OFFLINE_MODE_ENABLED]: annotationEngine === C.ANNOTATION_ENGINES.LOCAL_DICT
    });

    setFeedback(feedback, t("options_annotation_settings_saved"));
  }

  async function testClientId() {
    const clientId = clientIdInput.value.trim();
    if (!clientId) {
      setFeedback(feedback, t("options_enter_client_id_before_testing"), true);
      return;
    }

    const validation = validateClientId(clientId);
    if (!validation.valid) {
      setFeedback(feedback, validation.message || t("options_client_id_test_failed"), true);
      return;
    }

    setBusy(true);
    setFeedback(feedback, t("options_testing_client_id"));

    try {
      const response = await chrome.runtime.sendMessage({
        type: C.MESSAGE_TYPES.TEST_CLIENT_ID,
        payload: { clientId }
      });
      if (!response?.ok) {
        setFeedback(feedback, response?.details || t("options_client_id_test_failed"), true);
        return;
      }
      setFeedback(feedback, response?.details || t("options_client_id_test_succeeded"));
    } finally {
      setBusy(false);
    }
  }

  uiLanguageSelect.addEventListener("change", () => {
    applyLanguagePreference().catch((error) => {
      setFeedback(languageFeedback, error?.message || t("options_language_update_failed"), true);
    });
  });

  testButton.addEventListener("click", () => {
    testClientId().catch((error) => {
      setBusy(false);
      setFeedback(feedback, error?.message || t("options_client_id_test_failed"), true);
    });
  });

  saveButton.addEventListener("click", () => {
    setBusy(true);
    saveAnnotationSettings()
      .catch((error) => {
        setFeedback(feedback, error?.message || t("options_client_id_test_failed"), true);
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
    setFeedback(feedback, error?.message || t("options_client_id_test_failed"), true);
  });
})();
