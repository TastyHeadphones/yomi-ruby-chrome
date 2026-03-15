# YomiRuby Chrome Extension

## English

### Project Overview
YomiRuby is a Manifest V3 Chrome Extension that annotates Japanese kanji on web pages with furigana using HTML `<ruby>`, `<rt>`, and `<rp>` tags.

### Features
- Detects visible Japanese text nodes containing kanji.
- Requests furigana from Yahoo! JAPAN Furigana API (best-effort integration).
- Wraps only kanji-related fragments with ruby tags to reduce layout impact.
- Per-tab enable/disable from popup.
- Manual annotation run button in popup.
- Options page for saving user-provided Yahoo API key.
- Demo mode fallback when no API key is present.
- Double-annotation prevention by skipping existing ruby/processed content.
- Batch text processing in one round-trip between content script and background.

### Installation Steps
1. Clone or download this folder.
2. Open Chrome and go to `chrome://extensions`.
3. Turn on **Developer mode**.
4. Click **Load unpacked** and select this project folder.

### Get and Configure Yahoo API Key
1. Create a Yahoo! JAPAN Developer account.
2. Create an application and obtain your App ID / API key for Japanese language APIs.
3. In the extension, open **Settings**.
4. Paste the key and click **Save Settings**.

Notes:
- The background worker currently targets `https://jlp.yahooapis.jp/FuriganaService/V2/furigana` with JSON-RPC style payload.
- If Yahoo API parameters change, adjust `background.js` request payload/header accordingly.

### Load in Chrome (Load Unpacked)
1. Ensure files are present (`manifest.json`, scripts, HTML/CSS).
2. `chrome://extensions` -> Developer mode ON -> **Load unpacked**.
3. Select this repository root.

### How to Use
1. Open a Japanese web page.
2. Click YomiRuby popup.
3. Toggle **Enable on this tab**.
4. Click **Run Annotation Now** to annotate immediately.
5. Open Settings from popup to configure API key or demo mode.

### Permissions Explanation
- `storage`: save API key and settings (`chrome.storage.sync`), and tab toggle state (`chrome.storage.session`).
- `tabs`: read active tab context and send tab-level commands.
- `scripting`: fallback injection of content scripts when needed.
- `host_permissions`:
  - `<all_urls>` for page annotation.
  - `https://jlp.yahooapis.jp/*` for Yahoo API requests.

### Known Limitations
- Furigana alignment is best-effort and depends on API tokenization quality.
- Complex layouts, shadow DOM, canvas text, and heavily dynamic apps may not be fully covered.
- Pages with strict behavior tied to exact text-node structure can still be sensitive.
- Very long text nodes are chunked; results may be less precise around chunk boundaries.

### Development Notes
- Manifest V3 architecture:
  - `background.js`: settings, API calls, per-tab state, messaging.
  - `content.js`: DOM traversal and ruby injection.
  - `popup.*`: user controls.
  - `options.*`: API key and demo mode settings.
- Utils folder contains reusable text/DOM/ruby helpers.

### Privacy Note
- You provide your own Yahoo API key.
- API key is stored in your browser storage (`chrome.storage.sync`) and is not hardcoded.
- Text is sent directly from your browser extension to Yahoo API only when annotation runs.

### Folder Structure
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
│   ├── constants.js
│   ├── japanese.js
│   ├── dom.js
│   └── ruby.js
├── icons/
│   ├── README.md
│   └── icon-template.svg
├── .gitignore
└── README.md
```

### Future Improvements
- Better phrase-to-reading alignment with more robust diffing.
- MutationObserver incremental annotation for dynamically added content.
- User dictionary / reading overrides.
- Domain allowlist/blocklist and keyboard shortcut.
- Optional per-site settings and API backoff analytics.

---

## 中文

### 项目概述
YomiRuby 是一个基于 Manifest V3 的 Chrome 扩展，可在网页中为日文汉字添加振假名（furigana），使用 HTML `<ruby>/<rt>/<rp>` 标记实现。

### 功能
- 检测网页中可见且包含汉字的日文文本节点。
- 调用 Yahoo! JAPAN 假名标注 API（按最佳努力方式对接）。
- 尽量只包裹需要注音的片段，降低布局破坏风险。
- 弹窗支持当前标签页启用/禁用。
- 弹窗支持手动立即执行标注。
- 设置页支持保存用户自己的 Yahoo API Key。
- 无 Key 时可使用 Demo 模式本地演示。
- 跳过已处理内容，避免重复注音。
- 内容脚本与后台脚本之间进行批量文本处理。

### 安装步骤
1. 克隆或下载本项目目录。
2. 打开 Chrome，进入 `chrome://extensions`。
3. 打开**开发者模式**。
4. 点击**加载已解压的扩展程序**，选择项目根目录。

### 获取并配置 Yahoo API Key
1. 注册 Yahoo! JAPAN Developer 账号。
2. 创建应用并获取用于日语处理相关 API 的 App ID / API Key。
3. 在扩展中打开**Settings**。
4. 粘贴 Key 并点击 **Save Settings**。

说明：
- 当前 `background.js` 默认调用 `https://jlp.yahooapis.jp/FuriganaService/V2/furigana`（JSON-RPC 风格）。
- 若 Yahoo 接口参数变更，请在 `background.js` 中调整请求头和请求体。

### 在 Chrome 中加载（Load unpacked）
1. 确认项目文件完整（`manifest.json`、脚本、页面等）。
2. 打开 `chrome://extensions`，启用开发者模式。
3. 点击“加载已解压的扩展程序”，选择本目录。

### 使用方法
1. 打开包含日文内容的网页。
2. 点击 YomiRuby 扩展弹窗。
3. 切换 **Enable on this tab**。
4. 点击 **Run Annotation Now** 立即执行注音。
5. 通过 **Open Settings** 设置 API Key 或 Demo 模式。

### 权限说明
- `storage`：保存 API Key 与设置（`sync`），保存标签页状态（`session`）。
- `tabs`：读取当前标签页上下文并发送命令。
- `scripting`：必要时补充注入内容脚本。
- `host_permissions`：
  - `<all_urls>`：在网页内执行注音。
  - `https://jlp.yahooapis.jp/*`：访问 Yahoo API。

### 已知限制
- 注音对齐属于最佳努力，依赖 API 分词与读音结果。
- Shadow DOM、Canvas 文本、复杂动态页面可能覆盖不完整。
- 极少数页面若依赖精确文本节点结构，仍可能出现兼容问题。
- 超长文本会分块处理，分块边界处精度可能下降。

### 开发说明
- Manifest V3 结构：
  - `background.js`：设置、API、标签页状态、消息中转。
  - `content.js`：DOM 遍历与 ruby 注入。
  - `popup.*`：用户操作入口。
  - `options.*`：API Key 与 Demo 设置。
- `utils/` 放置文本与 DOM 处理公共逻辑。

### 隐私说明
- API Key 由用户自行提供，不会硬编码在代码中。
- Key 保存于浏览器 `chrome.storage.sync`。
- 仅在你主动执行注音时，页面文本才会发送到 Yahoo API。

### 目录结构
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
│   ├── constants.js
│   ├── japanese.js
│   ├── dom.js
│   └── ruby.js
├── icons/
│   ├── README.md
│   └── icon-template.svg
├── .gitignore
└── README.md
```

### 后续改进
- 更强的分词对齐与回填策略。
- 通过 MutationObserver 支持增量注音。
- 用户自定义词典与读音修正。
- 站点白名单/黑名单与快捷键支持。
- 细粒度站点设置与 API 退避策略。

---

## 日本語

### プロジェクト概要
YomiRuby は Manifest V3 ベースの Chrome 拡張で、Web ページ上の漢字を `<ruby>/<rt>/<rp>` タグでふりがな注釈します。

### 主な機能
- 画面上で可視な、漢字を含む日本語テキストノードを検出。
- Yahoo! JAPAN のふりがな API を利用（ベストエフォート実装）。
- 必要な日本語断片のみをラップし、レイアウト破壊を最小化。
- ポップアップで現在タブの有効/無効を切替。
- 手動実行ボタンで即時注釈。
- オプション画面で Yahoo API キーを保存。
- API キー未設定時はデモモードで開発確認可能。
- 既存 ruby/処理済み要素をスキップし二重注釈を防止。
- コンテンツスクリプト側でテキストをまとめて処理依頼。

### インストール手順
1. このフォルダを clone またはダウンロード。
2. Chrome で `chrome://extensions` を開く。
3. **デベロッパーモード**を ON。
4. **パッケージ化されていない拡張機能を読み込む**で本プロジェクトを選択。

### Yahoo API キー取得と設定
1. Yahoo! JAPAN Developer に登録。
2. アプリを作成し、日本語処理 API 用の App ID / API キーを取得。
3. 拡張の **Settings** を開く。
4. API キーを入力し **Save Settings** を押す。

補足：
- `background.js` は `https://jlp.yahooapis.jp/FuriganaService/V2/furigana` を既定利用します。
- API 仕様差分がある場合は `background.js` のヘッダ/ペイロードを調整してください。

### Chrome への読み込み（Load unpacked）
1. 必要ファイル（`manifest.json` など）が揃っていることを確認。
2. `chrome://extensions` でデベロッパーモードを有効化。
3. 「パッケージ化されていない拡張機能を読み込む」で本ディレクトリを指定。

### 使い方
1. 日本語テキストを含むページを開く。
2. YomiRuby のポップアップを開く。
3. **Enable on this tab** を ON。
4. **Run Annotation Now** を押して注釈実行。
5. 必要に応じて Settings で API キーや Demo モードを設定。

### 権限説明
- `storage`：API キー・設定（`sync`）とタブ状態（`session`）を保存。
- `tabs`：現在タブ情報取得とタブへのコマンド送信。
- `scripting`：必要時のコンテンツスクリプト再注入。
- `host_permissions`：
  - `<all_urls>`：一般サイト上で注釈するため。
  - `https://jlp.yahooapis.jp/*`：Yahoo API 呼び出しのため。

### 既知の制限
- 漢字と読みの対応は API 依存のベストエフォートです。
- Shadow DOM、Canvas、強い動的 UI では完全対応できない場合があります。
- テキストノード構造に厳密依存するページでは影響が出る可能性があります。
- 長文は分割処理するため、分割境界で精度が下がることがあります。

### 開発ノート
- Manifest V3 構成：
  - `background.js`：設定管理、API 通信、タブ状態、メッセージ制御。
  - `content.js`：DOM 走査と ruby 注入。
  - `popup.*`：操作 UI。
  - `options.*`：API キーとデモ設定 UI。
- `utils/` にテキスト/DOM ユーティリティを分離しています。

### プライバシー
- API キーはユーザー自身が提供します（ハードコードなし）。
- キーは `chrome.storage.sync` に保存されます。
- 注釈実行時のみ、必要テキストが Yahoo API に送信されます。

### フォルダ構成
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
│   ├── constants.js
│   ├── japanese.js
│   ├── dom.js
│   └── ruby.js
├── icons/
│   ├── README.md
│   └── icon-template.svg
├── .gitignore
└── README.md
```

### 今後の改善
- より精密な語単位アラインメント。
- MutationObserver による差分注釈。
- ユーザー辞書と読み補正。
- サイトごとの許可/除外設定とショートカット。
- API レート制御と詳細な失敗分析。
