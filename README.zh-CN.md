# YomiRuby Chrome 扩展（简体中文，🇨🇳）

![YomiRuby Promo](icons/promo_marquee_1400x560.png)

## 项目概述

YomiRuby 是一个基于 Manifest V3 的 Chrome 扩展，可在网页中为日文汉字添加振假名（furigana），使用 HTML `<ruby>/<rt>/<rp>` 标签渲染。

## 主要功能

- 检测网页中可见且包含汉字的日文文本节点。
- 调用 Yahoo! JAPAN Furigana API（最佳努力策略）。
- 按句子/段落处理，支持进度显示、取消和恢复原文。
- 跳过 `input`、`textarea`、`script`、`style`、`code`、`pre` 和可编辑区域。
- 防止重复注音。
- 设置页保存用户自己的 API Key（`chrome.storage.sync`）。
- 无 API Key 时支持 Demo 模式。

## 安装步骤

1. 克隆或下载本仓库。
2. 打开 `chrome://extensions`。
3. 启用**开发者模式**。
4. 点击**加载已解压的扩展程序**并选择项目目录。

## Yahoo API Key 设置

1. 在扩展弹窗中打开 **Settings**。
2. 填入 Yahoo! JAPAN App ID（API Key）。
3. 点击 **Test API Key** 测试。
4. 点击 **Save Settings** 保存。

开发者入口：
- <https://developer.yahoo.co.jp/>
- Furigana API 文档：<https://developer.yahoo.co.jp/webapi/jlp/furigana/v2/furigana.html>

## 使用方法

1. 打开日文网页。
2. 打开 YomiRuby 弹窗。
3. 切换 **Enable on all pages**。
4. 点击 **Run Annotation Now**。
5. 处理中可用 **Cancel**；要去掉注音可用 **Restore**。

## 权限说明

- `storage`：保存 API Key、设置和会话状态。
- `tabs`：获取当前标签页并发送命令。
- `scripting`：必要时注入内容脚本。
- Host 权限：
  - `<all_urls>`：对网页执行注音。
  - `https://jlp.yahooapis.jp/*`：调用 Yahoo API。

## 已知限制

- 注音对齐是最佳努力，依赖 API 分词结果。
- 对复杂动态页面、shadow DOM、canvas 文本覆盖可能不完整。
- 长文本会分块处理，边界位置可能稍降精度。

## 隐私

- 完整隐私政策： [PRIVACY_POLICY.md](PRIVACY_POLICY.md)
- API Key 由用户自行提供，不会硬编码。
- 仅在执行注音时向 Yahoo API 发送必要文本。

## 目录结构

```text
yomi-ruby-chrome/
├── manifest.json
├── background.js
├── content.js
├── popup.html
├── popup.js
├── popup.css
├── options.html
├── options.js
├── options.css
├── utils/
├── icons/
├── PRIVACY_POLICY.md
├── README.md
└── README.*.md
```
