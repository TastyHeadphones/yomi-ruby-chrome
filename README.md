<div align="center">
  <img src="icons/promo_marquee_1400x560.png" alt="YomiRuby Promo Banner" width="100%" />
  <h1>YomiRuby</h1>
  <p>Production-ready Chrome Extension for adding furigana to Japanese text with HTML ruby tags.</p>

  <p>
    <a href="https://developer.chrome.com/docs/extensions/develop/migrate/what-is-mv3">Manifest V3</a>
    ·
    <a href="https://developer.yahoo.co.jp/webapi/jlp/furigana/v2/furigana.html">Yahoo Furigana API</a>
    ·
    <a href="https://chromewebstore.google.com/detail/yomiruby/hbhhomegemogffhoeaoijibjeapciibk">Chrome Web Store</a>
    ·
    <a href="PRIVACY_POLICY.md">Privacy Policy</a>
    ·
    <a href="LICENSE">Unlicense</a>
  </p>

  <p>
    <img alt="Chrome Manifest V3" src="https://img.shields.io/badge/Chrome-Manifest_V3-4285F4?logo=googlechrome&logoColor=white">
    <img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-ES2020-F7DF1E?logo=javascript&logoColor=black">
    <img alt="License Unlicense" src="https://img.shields.io/badge/License-Unlicense-2ea44f">
    <img alt="Privacy User Controlled" src="https://img.shields.io/badge/Privacy-User_Controlled-0a7f6f">
  </p>
</div>

## Multi-language README

### Language Switcher

<div align="center">

[🇬🇧 English](README.en.md) · [🇨🇳 简体中文](README.zh-CN.md) · [🇮🇩 Bahasa Indonesia](README.id.md) · [🇰🇷 한국어](README.ko.md) · [🇹🇭 ไทย](README.th.md)<br>
[🇻🇳 Tiếng Việt](README.vi.md) · [🇲🇲 မြန်မာ](README.my.md) · [🇮🇳 हिन्दी](README.hi.md) · [🇳🇵 नेपाली](README.ne.md) · [🇵🇭 Filipino](README.fil.md)<br>
[🇲🇾 Bahasa Melayu](README.ms.md) · [🇱🇰 සිංහල](README.si.md) · [🇫🇷 Français](README.fr.md) · [🇧🇷 Português (Brasil)](README.pt-BR.md) · [🇯🇵 日本語](README.ja.md)

</div>

## Chrome Web Store

Install from Chrome Web Store:

- <https://chromewebstore.google.com/detail/yomiruby/hbhhomegemogffhoeaoijibjeapciibk>

## Why YomiRuby

- Annotates visible Japanese text with `<ruby>`, `<rt>`, and `<rp>`.
- Uses user-owned Yahoo Client IDs (no hardcoded credentials).
- Supports offline annotation with a bundled local dictionary.
- Includes Client ID testing, quota-aware pacing, progress UI, cancel, and kana visibility toggling.
- Uses conservative DOM updates to reduce layout breakage on general websites.
- Ships localized UI strings for English, Japanese, Simplified Chinese, Korean, Thai, Vietnamese, and Indonesian.

## Quick Start

1. Install from Chrome Web Store (link above).
2. Open extension **Settings**, configure a Client ID for Yahoo API usage or enable offline mode for the bundled dictionary.
3. Run **Test Client ID** when using the Yahoo API, then click **Save Settings**.
4. Open a Japanese page and click **Run Annotation Now**.
5. For local development, use `chrome://extensions` -> **Developer mode** -> **Load unpacked**.

## Repository Layout

```text
yomi-ruby-chrome/
├── manifest.json
├── background.js
├── content.js
├── popup.*
├── options.*
├── utils/
├── icons/
├── PRIVACY_POLICY.md
└── README*.md
```
