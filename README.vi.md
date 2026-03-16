# YomiRuby Chrome Extension (Tiếng Việt, 🇻🇳)

![YomiRuby Promo](icons/promo_marquee_1400x560.png)

## Tổng quan

YomiRuby là tiện ích Chrome Manifest V3 dùng để thêm furigana cho kanji tiếng Nhật trên trang web bằng thẻ HTML `<ruby>`, `<rt>`, `<rp>`.

## Tính năng

- Phát hiện node văn bản tiếng Nhật có kanji và đang hiển thị.
- Gọi Yahoo! JAPAN Furigana API (best effort).
- Xử lý theo câu/đoạn, có hiển thị tiến trình, hủy và khôi phục.
- Bỏ qua `input`, `textarea`, `script`, `style`, `code`, `pre` và vùng có thể chỉnh sửa.
- Chống chú thích lặp.
- Lưu API key người dùng trong Settings (`chrome.storage.sync`).
- Có demo mode khi chưa có API key.

## Cài đặt

1. Clone hoặc tải repo này.
2. Mở `chrome://extensions`.
3. Bật **Developer mode**.
4. Chọn **Load unpacked** và chọn thư mục dự án.

## Thiết lập Yahoo API Key

1. Mở **Settings** từ popup tiện ích.
2. Nhập Yahoo! JAPAN App ID (API key).
3. Nhấn **Test API Key**.
4. Nhấn **Save Settings**.

Cổng nhà phát triển:
- <https://developer.yahoo.co.jp/>
- Tài liệu API: <https://developer.yahoo.co.jp/webapi/jlp/furigana/v2/furigana.html>

## Cách dùng

1. Mở trang web tiếng Nhật.
2. Mở popup YomiRuby.
3. Bật **Enable on all pages**.
4. Nhấn **Run Annotation Now**.
5. Dùng **Cancel** khi đang chạy hoặc **Restore** để bỏ ruby.

## Quyền truy cập

- `storage`: lưu API key, cấu hình và trạng thái phiên.
- `tabs`: lấy tab hiện tại và gửi lệnh.
- `scripting`: chèn content script khi cần.
- Host permissions:
  - `<all_urls>` để chú thích trên trang web.
  - `https://jlp.yahooapis.jp/*` để gọi Yahoo API.

## Giới hạn đã biết

- Việc canh hàng giữa kanji và cách đọc là best effort, phụ thuộc tokenization của API.
- Trang động phức tạp, shadow DOM, canvas text có thể không được hỗ trợ đầy đủ.
- Nội dung dài được chia nhỏ, có thể giảm độ chính xác ở ranh giới chunk.

## Quyền riêng tư

- Chính sách đầy đủ: [PRIVACY_POLICY.md](PRIVACY_POLICY.md)
- API key do người dùng tự cung cấp.
- Chỉ gửi văn bản cần thiết tới Yahoo API khi chạy annotate.
