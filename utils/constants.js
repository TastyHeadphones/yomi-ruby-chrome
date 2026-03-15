(() => {
  const constants = {
    EXTENSION_NAME: "YomiRuby",
    STORAGE_KEYS: {
      API_KEY: "yomirubyYahooApiKey",
      DEMO_MODE_ENABLED: "yomirubyDemoModeEnabled"
    },
    SESSION_KEYS: {
      TAB_ENABLED_PREFIX: "yomirubyTabEnabled:"
    },
    MESSAGE_TYPES: {
      PING: "YOMIRUBY_PING",
      GET_TAB_STATE: "YOMIRUBY_GET_TAB_STATE",
      SET_TAB_STATE: "YOMIRUBY_SET_TAB_STATE",
      RUN_ANNOTATION: "YOMIRUBY_RUN_ANNOTATION",
      OPEN_OPTIONS: "YOMIRUBY_OPEN_OPTIONS",
      ANNOTATE_PAGE: "YOMIRUBY_ANNOTATE_PAGE",
      ANNOTATE_TEXT_BATCH: "YOMIRUBY_ANNOTATE_TEXT_BATCH",
      TEST_API_KEY: "YOMIRUBY_TEST_API_KEY"
    },
    ERROR_CODES: {
      MISSING_API_KEY: "missing_api_key",
      INVALID_API_KEY: "invalid_api_key",
      QUOTA_EXCEEDED: "quota_exceeded",
      NETWORK_FAILURE: "network_failure",
      INVALID_RESPONSE: "invalid_response",
      UNSUPPORTED_TAB: "unsupported_tab",
      CONTENT_SCRIPT_UNAVAILABLE: "content_script_unavailable"
    },
    LIMITS: {
      MAX_TEXT_NODES_PER_RUN: 250,
      MAX_TEXT_LENGTH_PER_NODE: 280,
      API_TIMEOUT_MS: 12000,
      FURIGANA_CACHE_SIZE: 500
    },
    DEFAULTS: {
      DEMO_MODE_ENABLED: true
    }
  };

  globalThis.YomiRubyConstants = Object.freeze(constants);
})();
