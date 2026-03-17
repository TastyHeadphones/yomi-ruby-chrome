# YomiRuby (नेपाली, 🇳🇵)

![YomiRuby Promo](icons/promo_marquee_1400x560.png)

<div align="center">

[🇬🇧 English](README.en.md) · [🇨🇳 简体中文](README.zh-CN.md) · [🇮🇩 Bahasa Indonesia](README.id.md) · [🇰🇷 한국어](README.ko.md) · [🇹🇭 ไทย](README.th.md)<br>
[🇻🇳 Tiếng Việt](README.vi.md) · [🇲🇲 မြန်မာ](README.my.md) · [🇮🇳 हिन्दी](README.hi.md) · [🇳🇵 नेपाली](README.ne.md) · [🇵🇭 Filipino](README.fil.md)<br>
[🇲🇾 Bahasa Melayu](README.ms.md) · [🇱🇰 සිංහල](README.si.md) · [🇫🇷 Français](README.fr.md) · [🇧🇷 Português (Brasil)](README.pt-BR.md) · [🇯🇵 日本語](README.ja.md)

</div>

## परिचय

YomiRuby एक production-ready Manifest V3 Chrome extension हो, जसले वेब पेजमा जापानी kanji मा furigana थप्न HTML ruby tags (`<ruby>`, `<rt>`, `<rp>`) प्रयोग गर्छ।

## मुख्य विशेषताहरू

- वाक्य र अनुच्छेद आधारित annotation।
- progress UI, cancel र restore सुविधा।
- Yahoo API quota का लागि throttle, retry, backoff।
- Settings पेजबाट API key test।
- API key नभए demo mode।
- layout बिग्रिन नदिन conservative DOM updates।

## छिटो सुरु गर्ने तरिका

1. यो repository clone गर्नुहोस्।
2. `chrome://extensions` खोल्नुहोस्।
3. **Developer mode** चालू गर्नुहोस्।
4. **Load unpacked** थिचेर यो folder चयन गर्नुहोस्।
5. **Settings** मा API key हाल्नुहोस्, **Test API Key** र **Save Settings** गर्नुहोस्।
6. जापानी पेज खोल्नुहोस् र **Run Annotation Now** थिच्नुहोस्।

## API Key सेटअप

- Developer portal: <https://developer.yahoo.co.jp/>
- API docs: <https://developer.yahoo.co.jp/webapi/jlp/furigana/v2/furigana.html>
- Endpoint: `https://jlp.yahooapis.jp/FuriganaService/V2/furigana`

## Architecture

| Component | Responsibility |
|---|---|
| `background.js` | API call, pacing/retry, job state |
| `content.js` | DOM traversal, ruby injection, progress/cancel/restore |
| `popup.*` | user controls |
| `options.*` | API key input, validation, test, save |
| `utils/*` | text/DOM helper utilities |

## Permissions

| Permission | प्रयोग |
|---|---|
| `storage` | API key, settings, temporary status store |
| `tabs` | active tab मा command पठाउन |
| `scripting` | content scripts inject गर्न |
| `<all_urls>` | साधारण वेबसाइट annotate गर्न |
| `https://jlp.yahooapis.jp/*` | Yahoo API call |

## Privacy र Security

- पूर्ण policy: [PRIVACY_POLICY.md](PRIVACY_POLICY.md)
- API key प्रयोगकर्ताले दिन्छ; hardcoded छैन।
- text annotation चल्दा मात्र Yahoo API मा पठाइन्छ।
- YomiRuby ले user data store गर्ने backend चलाउँदैन।

## Limitations

- furigana alignment best effort हो र API tokenization मा निर्भर छ।
- dynamic pages, shadow DOM, canvas text मा आंशिक समर्थन हुन सक्छ।
- धेरै ठूलो पेजमा प्रक्रिया ढिलो हुन सक्छ।

## License

Unlicense. हेर्नुहोस् [LICENSE](LICENSE)।
