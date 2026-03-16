# YomiRuby Chrome Extension (ภาษาไทย, 🇹🇭)

![YomiRuby Promo](icons/promo_marquee_1400x560.png)

## ภาพรวมโครงการ

YomiRuby คือส่วนขยาย Chrome แบบ Manifest V3 ที่ใส่ฟุริงานะเหนือคันจิภาษาญี่ปุ่นบนเว็บเพจ โดยใช้แท็ก HTML `<ruby>`, `<rt>`, `<rp>`.

## ความสามารถหลัก

- ตรวจจับข้อความภาษาญี่ปุ่นที่มองเห็นได้และมีคันจิ
- เรียก Yahoo! JAPAN Furigana API (best effort)
- ประมวลผลเป็นประโยค/ย่อหน้า พร้อมแสดงความคืบหน้า ยกเลิก และคืนค่า
- ข้าม `input`, `textarea`, `script`, `style`, `code`, `pre` และองค์ประกอบที่แก้ไขได้
- ป้องกันการใส่ฟุริงานะซ้ำ
- บันทึก API key ของผู้ใช้ในหน้า Settings (`chrome.storage.sync`)
- มีโหมดเดโมเมื่อยังไม่มี API key

## การติดตั้ง

1. clone หรือดาวน์โหลดรีโพนี้
2. เปิด `chrome://extensions`
3. เปิด **Developer mode**
4. กด **Load unpacked** แล้วเลือกโฟลเดอร์โปรเจกต์

## ตั้งค่า Yahoo API Key

1. เปิด **Settings** จาก popup ของส่วนขยาย
2. ใส่ Yahoo! JAPAN App ID (API key)
3. กด **Test API Key**
4. กด **Save Settings**

พอร์ทัลนักพัฒนา:
- <https://developer.yahoo.co.jp/>
- เอกสาร API: <https://developer.yahoo.co.jp/webapi/jlp/furigana/v2/furigana.html>

## วิธีใช้งาน

1. เปิดเว็บภาษาญี่ปุ่น
2. เปิด popup ของ YomiRuby
3. เปิด **Enable on all pages**
4. กด **Run Annotation Now**
5. ใช้ **Cancel** ระหว่างทำงาน หรือ **Restore** เพื่อลบ ruby

## สิทธิ์ที่ใช้

- `storage`: เก็บ API key, การตั้งค่า และสถานะ session
- `tabs`: อ่านแท็บปัจจุบันและส่งคำสั่ง
- `scripting`: ฉีด content script เมื่อจำเป็น
- Host permissions:
  - `<all_urls>` สำหรับใส่คำอ่านบนเว็บ
  - `https://jlp.yahooapis.jp/*` สำหรับเรียก Yahoo API

## ข้อจำกัดที่ทราบ

- การจับคู่คันจิกับคำอ่านเป็นแบบ best effort ตามคุณภาพ tokenization ของ API
- เว็บแบบ dynamic มาก, shadow DOM, และข้อความบน canvas อาจรองรับไม่ครบ
- ข้อความยาวจะถูกแบ่งเป็นช่วง ทำให้ความแม่นยำบริเวณรอยต่ออาจลดลง

## ความเป็นส่วนตัว

- นโยบายฉบับเต็ม: [PRIVACY_POLICY.md](PRIVACY_POLICY.md)
- ผู้ใช้เป็นผู้จัดหา API key เอง
- ข้อความจะถูกส่งไป Yahoo API เฉพาะตอนสั่ง annotate เท่านั้น
