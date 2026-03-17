# YomiRuby (Bahasa Indonesia, 🇮🇩)

![YomiRuby Promo](icons/promo_marquee_1400x560.png)

<div align="center">

[🇬🇧 English](README.en.md) · [🇨🇳 简体中文](README.zh-CN.md) · [🇮🇩 Bahasa Indonesia](README.id.md) · [🇰🇷 한국어](README.ko.md) · [🇹🇭 ไทย](README.th.md)<br>
[🇻🇳 Tiếng Việt](README.vi.md) · [🇲🇲 မြန်မာ](README.my.md) · [🇮🇳 हिन्दी](README.hi.md) · [🇳🇵 नेपाली](README.ne.md) · [🇵🇭 Filipino](README.fil.md)<br>
[🇲🇾 Bahasa Melayu](README.ms.md) · [🇱🇰 සිංහල](README.si.md) · [🇫🇷 Français](README.fr.md) · [🇧🇷 Português (Brasil)](README.pt-BR.md) · [🇯🇵 日本語](README.ja.md)

</div>

## Ringkasan

YomiRuby adalah ekstensi Chrome Manifest V3 siap produksi untuk menambahkan furigana pada teks Jepang menggunakan tag HTML ruby (`<ruby>`, `<rt>`, `<rp>`).

## Keunggulan

- Alur anotasi berbasis kalimat/paragraf.
- Progress overlay, cancel, dan restore.
- Kontrol kuota API (throttle, retry, backoff).
- Uji API key langsung dari halaman Settings.
- Demo mode jika API key belum tersedia.
- Update DOM secara konservatif untuk mengurangi risiko layout rusak.

## Mulai Cepat

1. Clone repositori ini.
2. Buka `chrome://extensions`.
3. Aktifkan **Developer mode**.
4. Klik **Load unpacked** dan pilih folder proyek.
5. Buka **Settings**, isi API key, klik **Test API Key**, lalu **Save Settings**.
6. Buka halaman Jepang dan klik **Run Annotation Now**.

## Konfigurasi API Key

- Portal developer: <https://developer.yahoo.co.jp/>
- Referensi API: <https://developer.yahoo.co.jp/webapi/jlp/furigana/v2/furigana.html>
- Endpoint: `https://jlp.yahooapis.jp/FuriganaService/V2/furigana`

## Arsitektur

| Komponen | Tanggung jawab |
|---|---|
| `background.js` | Komunikasi API, throttle/retry, status pekerjaan |
| `content.js` | Traversal DOM, injeksi ruby, progress, cancel/restore |
| `popup.*` | Kontrol pengguna (enable, run, cancel, restore, settings) |
| `options.*` | Input API key, validasi, test, simpan |
| `utils/*` | Konstanta dan utilitas teks/DOM |

## Izin

| Izin | Alasan |
|---|---|
| `storage` | Menyimpan API key, setting, dan status sesi |
| `tabs` | Mengakses tab aktif dan kirim perintah |
| `scripting` | Menjamin content script tersedia |
| `<all_urls>` | Menjalankan anotasi di situs umum |
| `https://jlp.yahooapis.jp/*` | Memanggil Yahoo API |

## Privasi dan Keamanan

- Kebijakan lengkap: [PRIVACY_POLICY.md](PRIVACY_POLICY.md)
- API key disediakan oleh pengguna, tidak hardcoded.
- Teks hanya dikirim saat proses anotasi dijalankan.
- Tidak ada backend YomiRuby untuk menyimpan data pengguna.

## Keterbatasan

- Penyelarasan furigana tetap best effort tergantung tokenisasi API.
- Situs dinamis, shadow DOM, dan canvas dapat tidak sepenuhnya tercakup.
- Halaman sangat besar tetap lebih lambat karena strategi yang aman.

## Roadmap

- Peningkatan alignment tingkat frasa dan dukungan kamus pengguna.
- Allowlist/denylist per situs.
- Anotasi inkremental untuk konten dinamis.

## Kontribusi

Issue/PR:

- <https://github.com/TastyHeadphones/yomi-ruby-chrome/issues>

## Lisensi

Unlicense. Lihat [LICENSE](LICENSE).
