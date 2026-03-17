# YomiRuby (Português do Brasil, 🇧🇷)

![YomiRuby Promo](icons/promo_marquee_1400x560.png)

<div align="center">

[🇬🇧 English](README.en.md) · [🇨🇳 简体中文](README.zh-CN.md) · [🇮🇩 Bahasa Indonesia](README.id.md) · [🇰🇷 한국어](README.ko.md) · [🇹🇭 ไทย](README.th.md)<br>
[🇻🇳 Tiếng Việt](README.vi.md) · [🇲🇲 မြန်မာ](README.my.md) · [🇮🇳 हिन्दी](README.hi.md) · [🇳🇵 नेपाली](README.ne.md) · [🇵🇭 Filipino](README.fil.md)<br>
[🇲🇾 Bahasa Melayu](README.ms.md) · [🇱🇰 සිංහල](README.si.md) · [🇫🇷 Français](README.fr.md) · [🇧🇷 Português (Brasil)](README.pt-BR.md) · [🇯🇵 日本語](README.ja.md)

</div>

## Visão geral

YomiRuby é uma extensão Chrome Manifest V3 pronta para produção que adiciona furigana em textos japoneses usando tags ruby semânticas (`<ruby>`, `<rt>`, `<rp>`).

## Destaques

- Anotação por sentença e parágrafo.
- UI de progresso com cancelamento e restauração.
- Controle de cota da API Yahoo (throttle, retry e backoff).
- Teste de API key na página Settings.
- Modo demo quando a chave não está configurada.
- Atualizações conservadoras de DOM para reduzir quebra de layout.

## Início rápido

1. Clone este repositório.
2. Abra `chrome://extensions`.
3. Ative o **Developer mode**.
4. Clique em **Load unpacked** e selecione esta pasta.
5. Em **Settings**, informe a API key, clique em **Test API Key** e **Save Settings**.
6. Abra uma página em japonês e clique em **Run Annotation Now**.

## Configuração da API Key

- Portal do desenvolvedor: <https://developer.yahoo.co.jp/>
- Documentação da API: <https://developer.yahoo.co.jp/webapi/jlp/furigana/v2/furigana.html>
- Endpoint: `https://jlp.yahooapis.jp/FuriganaService/V2/furigana`

## Arquitetura

| Componente | Responsabilidade |
|---|---|
| `background.js` | Chamadas de API, pacing/retry, estado de job |
| `content.js` | Traversal de DOM, injeção de ruby, progresso/cancelar/restaurar |
| `popup.*` | Controles do usuário |
| `options.*` | Entrada, validação, teste e salvamento da API key |
| `utils/*` | Utilitários de texto e DOM |

## Permissões

| Permissão | Motivo |
|---|---|
| `storage` | Salvar API key, configurações e estado temporário |
| `tabs` | Acessar aba ativa e enviar comandos |
| `scripting` | Injetar content script quando necessário |
| `<all_urls>` | Anotar sites em geral |
| `https://jlp.yahooapis.jp/*` | Chamar a API Yahoo |

## Privacidade e segurança

- Política completa: [PRIVACY_POLICY.md](PRIVACY_POLICY.md)
- A API key é fornecida pelo usuário e nunca é hardcoded.
- O texto é enviado à API Yahoo apenas durante a anotação.
- O YomiRuby não possui backend próprio para armazenar dados do usuário.

## Limitações

- O alinhamento de furigana é best effort e depende da tokenização da API.
- Páginas dinâmicas, shadow DOM e canvas podem ter suporte parcial.
- Páginas muito grandes podem processar mais lentamente.

## Licença

Unlicense. Veja [LICENSE](LICENSE).
