# YomiRuby (Tiếng Việt, 🇻🇳)

![YomiRuby Promo](icons/promo_marquee_1400x560.png)

<div align="center">

[🇬🇧 English](README.en.md) · [🇨🇳 简体中文](README.zh-CN.md) · [🇮🇩 Bahasa Indonesia](README.id.md) · [🇰🇷 한국어](README.ko.md) · [🇹🇭 ไทย](README.th.md)<br>
[🇻🇳 Tiếng Việt](README.vi.md) · [🇲🇲 မြန်မာ](README.my.md) · [🇮🇳 हिन्दी](README.hi.md) · [🇳🇵 नेपाली](README.ne.md) · [🇵🇭 Filipino](README.fil.md)<br>
[🇲🇾 Bahasa Melayu](README.ms.md) · [🇱🇰 සිංහල](README.si.md) · [🇫🇷 Français](README.fr.md) · [🇧🇷 Português (Brasil)](README.pt-BR.md) · [🇯🇵 日本語](README.ja.md)

</div>

## Tổng quan

YomiRuby là tiện ích Chrome Manifest V3 sẵn sàng cho production, dùng để thêm furigana cho kanji tiếng Nhật bằng thẻ HTML ruby (`ruby`, `rt`, `rp`).

## Điểm nổi bật

- Xử lý theo câu/đoạn để ổn định trên trang dài.
- Hiển thị tiến trình, hỗ trợ hủy và khôi phục.
- Điều tiết quota API (giãn cách request, retry, backoff).
- Kiểm tra API key trực tiếp trong Settings.
- Có demo mode khi chưa cấu hình API key.
- Cập nhật DOM theo hướng an toàn để giảm rủi ro vỡ layout.

## Bắt đầu nhanh

1. Clone repository này.
2. Mở `chrome://extensions`.
3. Bật **Developer mode**.
4. Chọn **Load unpacked** và trỏ tới thư mục dự án.
5. Vào **Settings**, nhập API key, bấm **Test API Key** rồi **Save Settings**.
6. Mở trang tiếng Nhật và bấm **Run Annotation Now**.

## Thiết lập API Key

- Cổng developer: <https://developer.yahoo.co.jp/>
- Tài liệu API: <https://developer.yahoo.co.jp/webapi/jlp/furigana/v2/furigana.html>
- Endpoint: `https://jlp.yahooapis.jp/FuriganaService/V2/furigana`

## Kiến trúc

| Thành phần | Trách nhiệm |
|---|---|
| `background.js` | Gọi API, điều tiết tốc độ, retry, quản lý trạng thái |
| `content.js` | Duyệt DOM, chèn ruby, hiển thị tiến trình, hủy/khôi phục |
| `popup.*` | Điều khiển chạy, hủy, khôi phục, mở Settings |
| `options.*` | Nhập, kiểm tra, test và lưu API key |
| `utils/*` | Hằng số và tiện ích xử lý văn bản/DOM |

## Quyền truy cập

| Quyền | Mục đích |
|---|---|
| `storage` | Lưu API key, cấu hình và trạng thái tạm thời |
| `tabs` | Xác định tab hiện tại và gửi lệnh |
| `scripting` | Bơm content script khi cần |
| `<all_urls>` | Chú thích trên website phổ biến |
| `https://jlp.yahooapis.jp/*` | Gọi Yahoo API |

## Quyền riêng tư và bảo mật

- Chính sách đầy đủ: [PRIVACY_POLICY.md](PRIVACY_POLICY.md)
- API key do người dùng tự cung cấp, không hardcode.
- Chỉ gửi văn bản cần thiết khi người dùng chạy annotate.
- Không có backend riêng của YomiRuby để lưu dữ liệu người dùng.

## Giới hạn hiện tại

- Căn chỉnh furigana là best effort, phụ thuộc vào tokenization của API.
- Trang rất động, shadow DOM, canvas text có thể không hỗ trợ đầy đủ.
- Trang cực lớn có thể chạy chậm hơn do ưu tiên an toàn.

## Lộ trình

- Cải thiện căn chỉnh theo cụm từ và hỗ trợ từ điển người dùng.
- Allowlist/denylist theo từng website.
- Annotate tăng dần cho nội dung dynamic.

## Đóng góp

Issue/PR:

- <https://github.com/TastyHeadphones/yomi-ruby-chrome/issues>

## License

Unlicense. Xem [LICENSE](LICENSE).
