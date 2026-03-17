# YomiRuby（简体中文，🇨🇳）

![YomiRuby Promo](icons/promo_marquee_1400x560.png)

<div align="center">

[🇬🇧 English](README.en.md) · [🇨🇳 简体中文](README.zh-CN.md) · [🇮🇩 Bahasa Indonesia](README.id.md) · [🇰🇷 한국어](README.ko.md) · [🇹🇭 ไทย](README.th.md)<br>
[🇻🇳 Tiếng Việt](README.vi.md) · [🇲🇲 မြန်မာ](README.my.md) · [🇮🇳 हिन्दी](README.hi.md) · [🇳🇵 नेपाली](README.ne.md) · [🇵🇭 Filipino](README.fil.md)<br>
[🇲🇾 Bahasa Melayu](README.ms.md) · [🇱🇰 සිංහල](README.si.md) · [🇫🇷 Français](README.fr.md) · [🇧🇷 Português (Brasil)](README.pt-BR.md) · [🇯🇵 日本語](README.ja.md)

</div>

## 概述

YomiRuby 是一个生产可用的 Manifest V3 Chrome 扩展，可使用 HTML 语义化 ruby 标签（`<ruby>`, `<rt>`, `<rp>`）为网页日文汉字添加振假名。

## 核心亮点

- 按句子/段落进行注音，适配长页面。
- 页面内进度提示，支持取消和恢复原文。
- Yahoo API 配额友好：限速、重试、退避。
- 设置页支持 API Key 测试与校验。
- 无 Key 可启用 Demo 模式。
- 采用保守 DOM 替换策略，尽量降低布局破坏风险。

## 快速开始

1. 克隆本仓库。
2. 打开 `chrome://extensions`。
3. 启用**开发者模式**。
4. 点击**加载已解压的扩展程序**并选择项目目录。
5. 打开扩展 **Settings**，填写 API Key，点击 **Test API Key** 与 **Save Settings**。
6. 访问日文网页，点击 **Run Annotation Now**。

## API Key 配置

- 开发者入口：<https://developer.yahoo.co.jp/>
- API 文档：<https://developer.yahoo.co.jp/webapi/jlp/furigana/v2/furigana.html>
- 实际请求端点：`https://jlp.yahooapis.jp/FuriganaService/V2/furigana`

## 架构概览

| 组件 | 职责 |
|---|---|
| `background.js` | API 调用、限速重试、任务状态管理 |
| `content.js` | DOM 扫描、ruby 注入、进度显示、取消/恢复 |
| `popup.*` | 开关、执行、取消、恢复、打开设置 |
| `options.*` | API Key 输入、测试与保存 |
| `utils/*` | 常量、日文文本处理、DOM/ruby 工具函数 |

## 权限说明

| 权限 | 用途 |
|---|---|
| `storage` | 存储 API Key、配置与会话状态 |
| `tabs` | 获取当前标签页并发送执行指令 |
| `scripting` | 必要时注入内容脚本 |
| `<all_urls>` | 在通用网站上执行注音 |
| `https://jlp.yahooapis.jp/*` | 请求 Yahoo Furigana API |

## 隐私与安全

- 完整政策： [PRIVACY_POLICY.md](PRIVACY_POLICY.md)
- API Key 由用户提供，不会硬编码在仓库中。
- 仅在主动执行注音时才发送必要文本到 Yahoo API。
- 不依赖 YomiRuby 自建后端存储用户数据。

## 已知限制

- 读音对齐属于最佳努力，精度依赖 API 分词结果。
- 对动态页面、shadow DOM、canvas 文本支持可能不完整。
- 超大页面处理会更慢（这是为了稳定性而采取的保守策略）。

## 路线图

- 更强的词组级对齐和用户词典支持。
- 站点级白名单/黑名单。
- 动态内容增量注音能力。

## 贡献

欢迎提交 Issue / PR：

- <https://github.com/TastyHeadphones/yomi-ruby-chrome/issues>

## 许可证

Unlicense，详见 [LICENSE](LICENSE)。
