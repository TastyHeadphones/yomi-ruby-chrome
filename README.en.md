# YomiRuby Chrome Extension (English, 🇦🇺/Global)

![YomiRuby Promo](icons/promo_marquee_1400x560.png)

## Project Overview

YomiRuby is a Manifest V3 Chrome extension that annotates Japanese kanji on web pages with furigana using HTML `<ruby>`, `<rt>`, and `<rp>` tags.

## Features

- Detects visible Japanese text nodes containing kanji.
- Requests furigana from Yahoo! JAPAN Furigana API (best effort).
- Annotates by sentence/paragraph with progress display, cancel, and restore support.
- Avoids `input`, `textarea`, `script`, `style`, `code`, `pre`, and editable elements.
- Prevents double annotation.
- Supports user-provided API key in Settings (`chrome.storage.sync`).
- Includes demo mode when API key is missing.

## Installation

1. Clone or download this repository.
2. Open `chrome://extensions`.
3. Enable **Developer mode**.
4. Click **Load unpacked** and select this project folder.

## Yahoo API Key Setup

1. Open **Settings** in the extension popup.
2. Paste your Yahoo! JAPAN App ID (API key).
3. Click **Test API Key**.
4. Click **Save Settings**.

Developer portal:
- <https://developer.yahoo.co.jp/>
- Furigana API reference: <https://developer.yahoo.co.jp/webapi/jlp/furigana/v2/furigana.html>

## How to Use

1. Open a Japanese web page.
2. Open YomiRuby popup.
3. Toggle **Enable on all pages**.
4. Click **Run Annotation Now**.
5. If needed, use **Cancel** during processing or **Restore** to remove ruby tags.

## Permissions

- `storage`: save API key/settings and session status.
- `tabs`: get active tab and send commands.
- `scripting`: inject content scripts when required.
- Host permissions:
  - `<all_urls>` for page annotation.
  - `https://jlp.yahooapis.jp/*` for Yahoo API calls.

## Known Limitations

- Furigana alignment is best effort and depends on API tokenization.
- Complex dynamic pages, shadow DOM, and canvas text may be partially unsupported.
- Very long content is chunked, which may reduce precision at chunk boundaries.

## Privacy

- Full policy: [PRIVACY_POLICY.md](PRIVACY_POLICY.md)
- You provide your own Yahoo API key.
- Text is sent to Yahoo API only when annotation runs.

## Folder Structure

```text
yomi-ruby-chrome/
├── manifest.json
├── background.js
├── content.js
├── popup.html
├── popup.js
├── popup.css
├── options.html
├── options.js
├── options.css
├── utils/
├── icons/
├── PRIVACY_POLICY.md
├── README.md
└── README.*.md
```
