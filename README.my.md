# YomiRuby (မြန်မာ, 🇲🇲)

![YomiRuby Promo](icons/promo_marquee_1400x560.png)

<div align="center">

[🇬🇧 English](README.en.md) · [🇨🇳 简体中文](README.zh-CN.md) · [🇮🇩 Bahasa Indonesia](README.id.md) · [🇰🇷 한국어](README.ko.md) · [🇹🇭 ไทย](README.th.md)<br>
[🇻🇳 Tiếng Việt](README.vi.md) · [🇲🇲 မြန်မာ](README.my.md) · [🇮🇳 हिन्दी](README.hi.md) · [🇳🇵 नेपाली](README.ne.md) · [🇵🇭 Filipino](README.fil.md)<br>
[🇲🇾 Bahasa Melayu](README.ms.md) · [🇱🇰 සිංහල](README.si.md) · [🇫🇷 Français](README.fr.md) · [🇧🇷 Português (Brasil)](README.pt-BR.md) · [🇯🇵 日本語](README.ja.md)

</div>

## အကျဉ်းချုပ်

YomiRuby သည် production-ready Manifest V3 Chrome extension တစ်ခုဖြစ်ပြီး Japanese kanji စာသားများအတွက် furigana ကို HTML ruby tags (`<ruby>`, `<rt>`, `<rp>`) ဖြင့်ထည့်ပေးပါသည်။

## အဓိကလုပ်ဆောင်ချက်များ

- စာကြောင်း/စာပိုဒ် အလိုက် annotation လုပ်ဆောင်နိုင်ခြင်း။
- progress UI, cancel, restore ပါဝင်ခြင်း။
- Yahoo API quota အတွက် throttle, retry, backoff logic ပါဝင်ခြင်း။
- Settings စာမျက်နှာမှ API key test လုပ်နိုင်ခြင်း။
- API key မရှိလျှင် demo mode ဖြင့်စမ်းသပ်နိုင်ခြင်း။
- layout ပျက်စီးမှုလျော့ချရန် conservative DOM updates သုံးထားခြင်း။

## Quick Start

1. ဒီ repository ကို clone လုပ်ပါ။
2. `chrome://extensions` ဖွင့်ပါ။
3. **Developer mode** ကို ON လုပ်ပါ။
4. **Load unpacked** ကိုနှိပ်ပြီး project folder ရွေးပါ။
5. **Settings** တွင် API key ထည့်ပြီး **Test API Key** နှင့် **Save Settings** လုပ်ပါ။
6. Japanese webpage တစ်ခုတွင် **Run Annotation Now** ကိုနှိပ်ပါ။

## API Key Setup

- Developer portal: <https://developer.yahoo.co.jp/>
- API docs: <https://developer.yahoo.co.jp/webapi/jlp/furigana/v2/furigana.html>
- Endpoint: `https://jlp.yahooapis.jp/FuriganaService/V2/furigana`

## Architecture

| Component | Responsibility |
|---|---|
| `background.js` | API call, pacing/retry, job status |
| `content.js` | DOM traversal, ruby injection, progress/cancel/restore |
| `popup.*` | user controls |
| `options.*` | API key input, validation, test, save |
| `utils/*` | text/DOM helper utilities |

## Permissions

| Permission | အသုံးပြုရသောအကြောင်းရင်း |
|---|---|
| `storage` | API key, settings, temporary status သိမ်းဆည်းရန် |
| `tabs` | active tab ကိုထိန်းချုပ်ရန် |
| `scripting` | content script inject လုပ်ရန် |
| `<all_urls>` | website များတွင် annotation လုပ်ရန် |
| `https://jlp.yahooapis.jp/*` | Yahoo API ကိုခေါ်ရန် |

## Privacy & Security

- policy အပြည့်အစုံ: [PRIVACY_POLICY.md](PRIVACY_POLICY.md)
- API key ကို user ကိုယ်တိုင်ထည့်သွင်းရပြီး hardcode မလုပ်ထားပါ။
- annotation run ဖြစ်သည့်အချိန်တွင်သာ text ကို Yahoo API သို့ပို့ပါသည်။
- YomiRuby backend server တွင် user data မသိမ်းပါ။

## Limitations

- furigana alignment သည် best effort ဖြစ်ပြီး API tokenization အပေါ်မူတည်ပါသည်။
- dynamic pages, shadow DOM, canvas text များတွင် coverage မပြည့်စုံနိုင်ပါ။
- page ကြီးမားလျှင် လုပ်ဆောင်ချိန်ပိုနိုင်ပါသည်။

## License

Unlicense. [LICENSE](LICENSE) ကိုကြည့်ပါ။
