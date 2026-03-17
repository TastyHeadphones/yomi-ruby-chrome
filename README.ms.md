# YomiRuby (Bahasa Melayu, 🇲🇾)

![YomiRuby Promo](icons/promo_marquee_1400x560.png)

<div align="center">

[🇬🇧 English](README.en.md) · [🇨🇳 简体中文](README.zh-CN.md) · [🇮🇩 Bahasa Indonesia](README.id.md) · [🇰🇷 한국어](README.ko.md) · [🇹🇭 ไทย](README.th.md)<br>
[🇻🇳 Tiếng Việt](README.vi.md) · [🇲🇲 မြန်မာ](README.my.md) · [🇮🇳 हिन्दी](README.hi.md) · [🇳🇵 नेपाली](README.ne.md) · [🇵🇭 Filipino](README.fil.md)<br>
[🇲🇾 Bahasa Melayu](README.ms.md) · [🇱🇰 සිංහල](README.si.md) · [🇫🇷 Français](README.fr.md) · [🇧🇷 Português (Brasil)](README.pt-BR.md) · [🇯🇵 日本語](README.ja.md)

</div>

## Ringkasan

YomiRuby ialah extension Chrome Manifest V3 yang sedia untuk production bagi menambah furigana pada teks kanji Jepun menggunakan tag HTML ruby (`<ruby>`, `<rt>`, `<rp>`).

## Ciri Utama

- Anotasi mengikut ayat dan perenggan.
- Progress UI, cancel, dan restore.
- Kawalan quota API melalui throttle, retry, dan backoff.
- Ujian API key terus dari halaman Settings.
- Demo mode apabila API key belum diset.
- Kemas kini DOM secara konservatif untuk kurangkan risiko rosak layout.

## Quick Start

1. Clone repository ini.
2. Buka `chrome://extensions`.
3. Aktifkan **Developer mode**.
4. Klik **Load unpacked** dan pilih folder projek ini.
5. Buka **Settings**, isi API key, klik **Test API Key** dan **Save Settings**.
6. Buka halaman Jepun dan klik **Run Annotation Now**.

## Tetapan API Key

- Portal developer: <https://developer.yahoo.co.jp/>
- Rujukan API: <https://developer.yahoo.co.jp/webapi/jlp/furigana/v2/furigana.html>
- Endpoint: `https://jlp.yahooapis.jp/FuriganaService/V2/furigana`

## Architecture

| Komponen | Tanggungjawab |
|---|---|
| `background.js` | API call, pacing/retry, status kerja |
| `content.js` | DOM traversal, ruby injection, progress/cancel/restore |
| `popup.*` | user controls |
| `options.*` | input API key, validasi, test, simpan |
| `utils/*` | utiliti teks dan DOM |

## Permissions

| Permission | Kegunaan |
|---|---|
| `storage` | Simpan API key, settings, status sementara |
| `tabs` | Akses tab aktif dan hantar arahan |
| `scripting` | Inject content script bila perlu |
| `<all_urls>` | Anotasi di laman web umum |
| `https://jlp.yahooapis.jp/*` | Panggilan Yahoo API |

## Privasi dan Keselamatan

- Polisi penuh: [PRIVACY_POLICY.md](PRIVACY_POLICY.md)
- API key disediakan oleh pengguna; tiada hardcoded key.
- Teks dihantar ke Yahoo API hanya semasa annotation dijalankan.
- Tiada backend YomiRuby untuk simpan data pengguna.

## Limitasi

- Alignment furigana adalah best effort dan bergantung pada tokenization API.
- Halaman dinamik, shadow DOM, dan canvas text mungkin separa disokong.
- Halaman sangat besar boleh jadi lebih perlahan.

## License

Unlicense. Lihat [LICENSE](LICENSE).
