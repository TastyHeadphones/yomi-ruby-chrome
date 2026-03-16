<div align="center">
  <img src="icons/promo_marquee_1400x560.png" alt="YomiRuby Promo Banner" width="100%" />
  <h1>YomiRuby</h1>
  <p>Production-ready Chrome Extension for adding furigana to Japanese text with HTML ruby tags.</p>

  <p>
    <a href="https://developer.chrome.com/docs/extensions/develop/migrate/what-is-mv3">Manifest V3</a>
    ·
    <a href="https://developer.yahoo.co.jp/webapi/jlp/furigana/v2/furigana.html">Yahoo Furigana API</a>
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

🇬🇧 [English](README.en.md) | 🇨🇳 [简体中文](README.zh-CN.md) | 🇮🇩 [Bahasa Indonesia](README.id.md) | 🇰🇷 [한국어](README.ko.md) | 🇹🇭 [ไทย](README.th.md) | 🇻🇳 [Tiếng Việt](README.vi.md) | 🇲🇲 [မြန်မာ](README.my.md) | 🇮🇳 [हिन्दी](README.hi.md) | 🇳🇵 [नेपाली](README.ne.md) | 🇵🇭 [Filipino](README.fil.md) | 🇲🇾 [Bahasa Melayu](README.ms.md) | 🇱🇰 [සිංහල](README.si.md) | 🇫🇷 [Français](README.fr.md) | 🇧🇷 [Português (Brasil)](README.pt-BR.md) | 🇯🇵 [日本語](README.ja.md)

### Top-15 Country Language Coverage

- China: [README.zh-CN.md](README.zh-CN.md)
- Indonesia: [README.id.md](README.id.md)
- Korea: [README.ko.md](README.ko.md)
- Australia + United States: [README.en.md](README.en.md)
- Thailand: [README.th.md](README.th.md)
- Viet Nam: [README.vi.md](README.vi.md)
- Taiwan: [README.zh-CN.md](README.zh-CN.md)
- Myanmar: [README.my.md](README.my.md)
- India: [README.hi.md](README.hi.md)
- Nepal (additional): [README.ne.md](README.ne.md)
- Philippines: [README.fil.md](README.fil.md)
- Malaysia: [README.ms.md](README.ms.md)
- Sri Lanka: [README.si.md](README.si.md)
- France: [README.fr.md](README.fr.md)
- Brazil: [README.pt-BR.md](README.pt-BR.md)

## Why YomiRuby

- Annotates visible Japanese text with `<ruby>`, `<rt>`, and `<rp>`.
- Uses user-owned Yahoo API keys (no hardcoded credentials).
- Includes API key testing, quota-aware pacing, progress UI, cancel, and restore.
- Uses conservative DOM updates to reduce layout breakage on general websites.

## Quick Start

1. Clone this repository.
2. Open `chrome://extensions` and enable **Developer mode**.
3. Click **Load unpacked** and select this project folder.
4. Open extension **Settings**, configure API key, and run **Test API Key**.
5. Open a Japanese page and click **Run Annotation Now**.

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
