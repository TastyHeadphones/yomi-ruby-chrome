# YomiRuby（日本語，🇯🇵）

![YomiRuby Promo](icons/promo_marquee_1400x560.png)

<div align="center">

[🇬🇧 English](README.en.md) · [🇨🇳 简体中文](README.zh-CN.md) · [🇮🇩 Bahasa Indonesia](README.id.md) · [🇰🇷 한국어](README.ko.md) · [🇹🇭 ไทย](README.th.md)<br>
[🇻🇳 Tiếng Việt](README.vi.md) · [🇲🇲 မြန်မာ](README.my.md) · [🇮🇳 हिन्दी](README.hi.md) · [🇳🇵 नेपाली](README.ne.md) · [🇵🇭 Filipino](README.fil.md)<br>
[🇲🇾 Bahasa Melayu](README.ms.md) · [🇱🇰 සිංහල](README.si.md) · [🇫🇷 Français](README.fr.md) · [🇧🇷 Português (Brasil)](README.pt-BR.md) · [🇯🇵 日本語](README.ja.md)

</div>

## Chrome Web Store

- <https://chromewebstore.google.com/detail/yomiruby/hbhhomegemogffhoeaoijibjeapciibk>

## 概要

YomiRuby は、Web ページ上の日本語漢字にふりがなを付与する Manifest V3 対応 Chrome 拡張です。HTML のセマンティックな ruby タグ（`<ruby>`, `<rt>`, `<rp>`）を使用します。

## ハイライト

- 文/段落単位の注釈処理フロー。
- 進捗オーバーレイ、キャンセル、ふりがな表示切り替えをサポート。
- Yahoo API のクォータを考慮した速度制御とリトライ/バックオフ。
- 設定画面で Client ID のテストと保存が可能。
- オフラインモードではローカル辞書で注釈できます。
- レイアウト破壊を抑える保守的な DOM 更新。
- 英語、日本語、簡体字中国語、韓国語、タイ語、ベトナム語、インドネシア語の UI ローカライズに対応。

## クイックスタート

1. リポジトリを clone します。
2. `chrome://extensions` を開きます。
3. **デベロッパーモード**を有効化します。
4. **パッケージ化されていない拡張機能を読み込む**で本フォルダを選択します。
5. 拡張の **設定** で Client ID を入力するか、オフラインモードを有効にします。
6. Yahoo API を使う場合は **Client ID をテスト** を押してから **設定を保存** を実行します。
7. 日本語ページで **Run Annotation Now** を押します。

## Client ID 設定

- 開発者ポータル: <https://developer.yahoo.co.jp/>
- API リファレンス: <https://developer.yahoo.co.jp/webapi/jlp/furigana/v2/furigana.html>
- リクエスト先: `https://jlp.yahooapis.jp/FuriganaService/V2/furigana`

オフラインモードでは、YomiRuby は同梱のローカル辞書を使用し、ページ本文を Yahoo へ送信しません。

## アーキテクチャ

| コンポーネント | 役割 |
|---|---|
| `background.js` | API 通信、ローカル辞書読み込み、速度制御、リトライ、タブ状態管理 |
| `content.js` | DOM 走査、ruby 注入、進捗表示、キャンセル/ふりがな表示切り替え |
| `popup.*` | 有効化、実行、キャンセル、ふりがな表示切り替え、設定画面起動 |
| `options.*` | Client ID 入力、検証、テスト、オフラインモード、保存 |
| `utils/*` | 定数、文字種判定、DOM/ruby ユーティリティ |

## 権限

| 権限 | 用途 |
|---|---|
| `storage` | Client ID、設定、一時ステータスの保存 |
| `tabs` | アクティブタブの取得とコマンド送信 |
| `scripting` | 必要時のコンテンツスクリプト注入 |
| `<all_urls>` | 一般サイトでの注釈実行 |
| `https://jlp.yahooapis.jp/*` | Yahoo Furigana API 呼び出し |

## プライバシーとセキュリティ

- 詳細: [PRIVACY_POLICY.md](PRIVACY_POLICY.md)
- Client ID はユーザーが提供し、ソースにハードコードしません。
- 注釈実行時のみ、かつオフラインモードが無効な場合に必要テキストを Yahoo API に送信します。
- YomiRuby 独自の収集サーバーは使用しません。

## 既知の制限

- ふりがな対応は API の分かち書き結果に依存するベストエフォートです。
- 動的サイト、shadow DOM、canvas テキストは一部未対応の可能性があります。
- 大規模ページでは安全性優先のため処理時間が長くなります。

## ロードマップ

- 語句単位アラインメントの改善とユーザー辞書対応。
- サイト別の許可/除外設定。
- 動的コンテンツへの差分注釈。

## コントリビュート

Issue / PR を歓迎します:

- <https://github.com/TastyHeadphones/yomi-ruby-chrome/issues>

## ライセンス

Unlicense。詳細は [LICENSE](LICENSE) を参照してください。
