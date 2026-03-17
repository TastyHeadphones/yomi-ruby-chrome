# YomiRuby (ภาษาไทย, 🇹🇭)

![YomiRuby Promo](icons/promo_marquee_1400x560.png)

<div align="center">

[🇬🇧 English](README.en.md) · [🇨🇳 简体中文](README.zh-CN.md) · [🇮🇩 Bahasa Indonesia](README.id.md) · [🇰🇷 한국어](README.ko.md) · [🇹🇭 ไทย](README.th.md)<br>
[🇻🇳 Tiếng Việt](README.vi.md) · [🇲🇲 မြန်မာ](README.my.md) · [🇮🇳 हिन्दी](README.hi.md) · [🇳🇵 नेपाली](README.ne.md) · [🇵🇭 Filipino](README.fil.md)<br>
[🇲🇾 Bahasa Melayu](README.ms.md) · [🇱🇰 සිංහල](README.si.md) · [🇫🇷 Français](README.fr.md) · [🇧🇷 Português (Brasil)](README.pt-BR.md) · [🇯🇵 日本語](README.ja.md)

</div>

## ภาพรวม

YomiRuby คือส่วนขยาย Chrome แบบ Manifest V3 ที่พร้อมใช้งานจริงสำหรับใส่ฟุริงานะให้คันจิภาษาญี่ปุ่นบนเว็บ โดยใช้แท็ก HTML ruby (`ruby`, `rt`, `rp`).

## จุดเด่น

- ประมวลผลตามประโยค/ย่อหน้า
- แสดงความคืบหน้า พร้อมปุ่มยกเลิกและคืนค่า
- ควบคุมโควตา API (หน่วงคำขอ, retry, backoff)
- ทดสอบ API key ได้จากหน้า Settings
- รองรับโหมดเดโมเมื่อไม่มี API key
- ปรับ DOM แบบระมัดระวังเพื่อลดผลกระทบต่อ layout

## เริ่มใช้งานแบบเร็ว

1. clone รีโพนี้
2. เปิด `chrome://extensions`
3. เปิด **Developer mode**
4. กด **Load unpacked** และเลือกโฟลเดอร์โปรเจกต์
5. เปิด **Settings**, ใส่ API key, กด **Test API Key** และ **Save Settings**
6. เปิดหน้าเว็บภาษาญี่ปุ่น แล้วกด **Run Annotation Now**

## การตั้งค่า API Key

- พอร์ทัลนักพัฒนา: <https://developer.yahoo.co.jp/>
- เอกสาร API: <https://developer.yahoo.co.jp/webapi/jlp/furigana/v2/furigana.html>
- Endpoint: `https://jlp.yahooapis.jp/FuriganaService/V2/furigana`

## สถาปัตยกรรม

| ส่วนประกอบ | หน้าที่ |
|---|---|
| `background.js` | เรียก API, คุมอัตราการส่ง, retry, จัดการสถานะงาน |
| `content.js` | สแกน DOM, แทรก ruby, แสดง progress, cancel/restore |
| `popup.*` | ควบคุมการทำงาน (enable/run/cancel/restore/settings) |
| `options.*` | กรอก/ตรวจสอบ/ทดสอบ/บันทึก API key |
| `utils/*` | ค่าคงที่และยูทิลิตี้ข้อความ/DOM |

## สิทธิ์ที่ใช้

| สิทธิ์ | เหตุผล |
|---|---|
| `storage` | เก็บ API key, การตั้งค่า, สถานะชั่วคราว |
| `tabs` | เข้าถึงแท็บปัจจุบันและส่งคำสั่ง |
| `scripting` | ฉีด content script เมื่อจำเป็น |
| `<all_urls>` | ใส่ฟุริงานะบนเว็บทั่วไป |
| `https://jlp.yahooapis.jp/*` | เรียก Yahoo API |

## ความเป็นส่วนตัวและความปลอดภัย

- นโยบายฉบับเต็ม: [PRIVACY_POLICY.md](PRIVACY_POLICY.md)
- API key มาจากผู้ใช้และไม่ hardcode ในซอร์สโค้ด
- ส่งข้อความไป Yahoo API เฉพาะตอนที่ผู้ใช้สั่ง annotate
- ไม่มี backend ของ YomiRuby สำหรับเก็บข้อมูลผู้ใช้

## ข้อจำกัดที่ทราบ

- ความแม่นของฟุริงานะขึ้นกับผล tokenization ของ API
- เว็บที่ dynamic มาก, shadow DOM, canvas อาจรองรับได้ไม่ครบ
- หน้ายาวมากอาจใช้เวลานานขึ้นเพื่อความเสถียร

## Roadmap

- ปรับปรุงการจับคู่ระดับวลีและรองรับพจนานุกรมผู้ใช้
- ตั้งค่า allowlist/denylist รายเว็บไซต์
- รองรับการ annotate แบบ incremental สำหรับเนื้อหา dynamic

## การมีส่วนร่วม

Issue/PR:

- <https://github.com/TastyHeadphones/yomi-ruby-chrome/issues>

## License

Unlicense ดู [LICENSE](LICENSE)
