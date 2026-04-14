(() => {
  const constants = {
    EXTENSION_NAME: "YomiRuby",
    STORAGE_KEYS: {
      YAHOO_CLIENT_ID: "yomirubyYahooClientId",
      API_KEY: "yomirubyYahooClientId",
      OFFLINE_MODE_ENABLED: "yomirubyOfflineModeEnabled",
      DEMO_MODE_ENABLED: "yomirubyOfflineModeEnabled",
      LEGACY_API_KEY: "yomirubyYahooApiKey",
      LEGACY_DEMO_MODE_ENABLED: "yomirubyDemoModeEnabled",
      ENABLED_GLOBALLY: "yomirubyEnabledGlobally"
    },
    SESSION_KEYS: {
      TAB_ENABLED_PREFIX: "yomirubyTabEnabled:",
      ANNOTATION_STATUS_PREFIX: "yomirubyAnnotationStatus:"
    },
    MESSAGE_TYPES: {
      PING: "YOMIRUBY_PING",
      GET_TAB_STATE: "YOMIRUBY_GET_TAB_STATE",
      SET_TAB_STATE: "YOMIRUBY_SET_TAB_STATE",
      GET_GLOBAL_STATE: "YOMIRUBY_GET_GLOBAL_STATE",
      SET_GLOBAL_STATE: "YOMIRUBY_SET_GLOBAL_STATE",
      RUN_ANNOTATION: "YOMIRUBY_RUN_ANNOTATION",
      CANCEL_ANNOTATION: "YOMIRUBY_CANCEL_ANNOTATION",
      SET_KANA_VISIBILITY: "YOMIRUBY_SET_KANA_VISIBILITY",
      GET_KANA_VISIBILITY: "YOMIRUBY_GET_KANA_VISIBILITY",
      RESTORE_PAGE: "YOMIRUBY_RESTORE_PAGE",
      GET_ANNOTATION_STATUS: "YOMIRUBY_GET_ANNOTATION_STATUS",
      ANNOTATION_PROGRESS: "YOMIRUBY_ANNOTATION_PROGRESS",
      OPEN_OPTIONS: "YOMIRUBY_OPEN_OPTIONS",
      ANNOTATE_PAGE: "YOMIRUBY_ANNOTATE_PAGE",
      ANNOTATE_TEXT_BATCH: "YOMIRUBY_ANNOTATE_TEXT_BATCH",
      TEST_CLIENT_ID: "YOMIRUBY_TEST_CLIENT_ID",
      TEST_API_KEY: "YOMIRUBY_TEST_API_KEY"
    },
    ERROR_CODES: {
      MISSING_CLIENT_ID: "missing_client_id",
      MISSING_API_KEY: "missing_client_id",
      INVALID_CLIENT_ID: "invalid_client_id",
      INVALID_API_KEY: "invalid_client_id",
      QUOTA_EXCEEDED: "quota_exceeded",
      NETWORK_FAILURE: "network_failure",
      INVALID_RESPONSE: "invalid_response",
      UNSUPPORTED_TAB: "unsupported_tab",
      CONTENT_SCRIPT_UNAVAILABLE: "content_script_unavailable",
      BUSY: "busy",
      CANCELED: "canceled"
    },
    LIMITS: {
      MAX_TEXT_NODES_PER_RUN: 250,
      MAX_TEXT_NODES_PER_PARAGRAPH: 120,
      MAX_TEXT_LENGTH_PER_NODE: 280,
      PARAGRAPH_DELAY_MS: 40,
      API_TIMEOUT_MS: 12000,
      API_MIN_INTERVAL_MS: 260,
      API_RETRY_MAX_ATTEMPTS: 3,
      API_QUOTA_BACKOFF_BASE_MS: 2500,
      FURIGANA_CACHE_SIZE: 500
    },
    DEFAULTS: {
      OFFLINE_MODE_ENABLED: true,
      ENABLED_GLOBALLY: false
    },
    ASSETS: {
      LOCAL_DICTIONARY: "data/local-annotate-dict.json"
    }
  };

  globalThis.YomiRubyConstants = Object.freeze(constants);
})();
