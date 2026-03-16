# YomiRuby Privacy Policy

Effective date: March 16, 2026

YomiRuby is a Chrome extension that annotates Japanese text with furigana on web pages.

## 1. Data We Process

YomiRuby processes only the data needed to provide furigana annotation:

- API key (Yahoo! JAPAN App ID) that you enter in extension settings.
- Extension settings (for example, global enable/disable and demo mode).
- Temporary run status data (progress/cancel state) while annotation runs.
- Text fragments from the current web page that are selected for furigana conversion.

## 2. Where Data Is Stored

- API key and extension settings are stored in `chrome.storage.sync` (your browser profile; may sync via your Chrome account if browser sync is enabled).
- Temporary annotation status is stored in `chrome.storage.session` and is not persisted long-term.
- YomiRuby does not operate its own backend server and does not store your browsing data on developer-controlled servers.

## 3. Third-Party API Use

When annotation runs with a real API key, relevant text fragments are sent directly from your browser to Yahoo! JAPAN Language Processing API:

- Endpoint used: `https://jlp.yahooapis.jp/FuriganaService/V2/furigana`
- Data sent: text needed for furigana conversion, request metadata required by Yahoo API, and your App ID.

Your use of the Yahoo API is also subject to Yahoo! JAPAN’s own terms and privacy policies.

## 4. What We Do Not Collect

YomiRuby does not:

- Collect account registration data (no YomiRuby account system).
- Run analytics, ad tracking, or behavioral profiling.
- Sell personal information.
- Transmit data to any server controlled by the YomiRuby developer.

## 5. Permissions and Why They Are Needed

- `storage`: save your API key and extension settings.
- `tabs`: identify and control the active tab for annotation actions.
- `scripting`: inject/run content scripts required to annotate pages.
- Host permissions:
  - `<all_urls>`: allow annotation on websites you open.
  - `https://jlp.yahooapis.jp/*`: call Yahoo furigana API.

## 6. Data Retention and Deletion

- You can delete the saved API key and settings from the extension options at any time.
- Temporary session data is cleared automatically by browser/session lifecycle.
- Uninstalling the extension removes extension-stored data from your browser profile.

## 7. Security Notes

- No API key is hardcoded in source code.
- API communication uses HTTPS.
- You are responsible for keeping your own Yahoo App ID secure.

## 8. Changes to This Policy

This policy may be updated when extension behavior changes. Updates will be published in this repository with a revised effective date.

## 9. Contact

For privacy questions, open an issue in this repository:

`https://github.com/TastyHeadphones/yomi-ruby-chrome/issues`
