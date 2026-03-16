# YomiRuby Chrome Extension (Bahasa Indonesia, 🇮🇩)

![YomiRuby Promo](icons/promo_marquee_1400x560.png)

## Ringkasan Proyek

YomiRuby adalah ekstensi Chrome Manifest V3 yang menambahkan furigana pada kanji Jepang di halaman web menggunakan tag HTML `<ruby>`, `<rt>`, dan `<rp>`.

## Fitur

- Mendeteksi node teks Jepang yang terlihat dan mengandung kanji.
- Meminta furigana dari Yahoo! JAPAN Furigana API (best effort).
- Proses per kalimat/paragraf dengan progress, cancel, dan restore.
- Melewati `input`, `textarea`, `script`, `style`, `code`, `pre`, dan elemen editable.
- Mencegah anotasi ganda.
- Menyimpan API key milik pengguna di halaman Settings (`chrome.storage.sync`).
- Mendukung mode demo saat API key belum diisi.

## Instalasi

1. Clone atau unduh repositori ini.
2. Buka `chrome://extensions`.
3. Aktifkan **Developer mode**.
4. Klik **Load unpacked** lalu pilih folder proyek ini.

## Konfigurasi Yahoo API Key

1. Buka **Settings** dari popup ekstensi.
2. Isi Yahoo! JAPAN App ID (API key).
3. Klik **Test API Key**.
4. Klik **Save Settings**.

Portal developer:
- <https://developer.yahoo.co.jp/>
- Referensi API: <https://developer.yahoo.co.jp/webapi/jlp/furigana/v2/furigana.html>

## Cara Pakai

1. Buka halaman web berbahasa Jepang.
2. Buka popup YomiRuby.
3. Aktifkan **Enable on all pages**.
4. Klik **Run Annotation Now**.
5. Gunakan **Cancel** saat berjalan, atau **Restore** untuk menghapus ruby.

## Izin

- `storage`: menyimpan API key, pengaturan, dan status sesi.
- `tabs`: membaca tab aktif dan mengirim perintah.
- `scripting`: menyuntikkan content script saat diperlukan.
- Host permissions:
  - `<all_urls>` untuk anotasi halaman.
  - `https://jlp.yahooapis.jp/*` untuk panggilan API Yahoo.

## Batasan

- Penyelarasan furigana bersifat best effort dan bergantung tokenisasi API.
- Halaman sangat dinamis, shadow DOM, dan teks canvas mungkin tidak sepenuhnya tercakup.
- Teks panjang diproses per chunk, sehingga akurasi bisa turun di batas chunk.

## Privasi

- Kebijakan lengkap: [PRIVACY_POLICY.md](PRIVACY_POLICY.md)
- Anda memakai API key milik sendiri.
- Teks hanya dikirim ke Yahoo API saat anotasi dijalankan.
