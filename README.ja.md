# YomiRuby Chrome 拡張（日本語，🇯🇵）

![YomiRuby Promo](icons/promo_marquee_1400x560.png)

## 概要

YomiRuby は Manifest V3 ベースの Chrome 拡張です。Web ページ上の漢字に HTML `<ruby>/<rt>/<rp>` を使ってふりがなを付与します。

## 主な機能

- 画面上の可視テキストから漢字を含む日本語ノードを検出。
- Yahoo! JAPAN Furigana API を利用（ベストエフォート）。
- 文/段落単位で処理し、進捗表示・キャンセル・復元に対応。
- `input`、`textarea`、`script`、`style`、`code`、`pre`、編集可能要素は除外。
- 二重注釈を防止。
- 設定画面で API キーを保存（`chrome.storage.sync`）。
- API キー未設定時はデモモード利用可。

## インストール

1. このリポジトリを clone またはダウンロード。
2. `chrome://extensions` を開く。
3. **デベロッパーモード**を ON。
4. **パッケージ化されていない拡張機能を読み込む**で本ディレクトリを選択。

## Yahoo API キー設定

1. ポップアップから **Settings** を開く。
2. Yahoo! JAPAN App ID（API キー）を入力。
3. **Test API Key** で疎通確認。
4. **Save Settings** で保存。

開発者ポータル:
- <https://developer.yahoo.co.jp/>
- Furigana API リファレンス: <https://developer.yahoo.co.jp/webapi/jlp/furigana/v2/furigana.html>

## 使い方

1. 日本語ページを開く。
2. YomiRuby ポップアップを開く。
3. **Enable on all pages** を切り替える。
4. **Run Annotation Now** を押す。
5. 処理中は **Cancel**、注釈解除は **Restore** を利用。

## 権限

- `storage`: API キー、設定、セッション状態の保存。
- `tabs`: アクティブタブ取得とコマンド送信。
- `scripting`: 必要時にコンテンツスクリプトを注入。
- Host permissions:
  - `<all_urls>`: Web ページ注釈のため。
  - `https://jlp.yahooapis.jp/*`: Yahoo API 呼び出しのため。

## 既知の制限

- ふりがな整合は API 依存のベストエフォート。
- 動的ページ、shadow DOM、canvas テキストは一部未対応の場合あり。
- 長文は分割処理のため境界で精度が落ちることがあります。

## プライバシー

- 詳細: [PRIVACY_POLICY.md](PRIVACY_POLICY.md)
- API キーはユーザー提供で、コードにハードコードしません。
- 注釈実行時のみ必要テキストを Yahoo API に送信します。

## フォルダ構成

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
