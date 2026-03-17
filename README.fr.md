# YomiRuby (Français, 🇫🇷)

![YomiRuby Promo](icons/promo_marquee_1400x560.png)

<div align="center">

[🇬🇧 English](README.en.md) · [🇨🇳 简体中文](README.zh-CN.md) · [🇮🇩 Bahasa Indonesia](README.id.md) · [🇰🇷 한국어](README.ko.md) · [🇹🇭 ไทย](README.th.md)<br>
[🇻🇳 Tiếng Việt](README.vi.md) · [🇲🇲 မြန်မာ](README.my.md) · [🇮🇳 हिन्दी](README.hi.md) · [🇳🇵 नेपाली](README.ne.md) · [🇵🇭 Filipino](README.fil.md)<br>
[🇲🇾 Bahasa Melayu](README.ms.md) · [🇱🇰 සිංහල](README.si.md) · [🇫🇷 Français](README.fr.md) · [🇧🇷 Português (Brasil)](README.pt-BR.md) · [🇯🇵 日本語](README.ja.md)

</div>

## Vue d'ensemble

YomiRuby est une extension Chrome Manifest V3 prête pour la production, qui ajoute des furigana au texte japonais à l'aide des balises HTML ruby (`<ruby>`, `<rt>`, `<rp>`).

## Points forts

- Traitement par phrase et paragraphe.
- Affichage de progression avec annulation et restauration.
- Gestion du quota API (throttling, retry, backoff).
- Test de clé API depuis la page Settings.
- Mode démo si la clé API n'est pas configurée.
- Mise à jour DOM prudente pour limiter les cassures de mise en page.

## Démarrage rapide

1. Clonez ce dépôt.
2. Ouvrez `chrome://extensions`.
3. Activez le **mode développeur**.
4. Cliquez sur **Load unpacked** et sélectionnez ce dossier.
5. Ouvrez **Settings**, saisissez la clé API, cliquez sur **Test API Key** puis **Save Settings**.
6. Ouvrez une page japonaise et cliquez sur **Run Annotation Now**.

## Configuration de la clé API

- Portail développeur : <https://developer.yahoo.co.jp/>
- Documentation API : <https://developer.yahoo.co.jp/webapi/jlp/furigana/v2/furigana.html>
- Endpoint : `https://jlp.yahooapis.jp/FuriganaService/V2/furigana`

## Architecture

| Composant | Rôle |
|---|---|
| `background.js` | Appels API, régulation, retries, état des jobs |
| `content.js` | Parcours DOM, injection ruby, progression, annulation/restauration |
| `popup.*` | Contrôles utilisateur |
| `options.*` | Saisie, validation, test et sauvegarde de la clé API |
| `utils/*` | Constantes et utilitaires texte/DOM |

## Permissions

| Permission | Usage |
|---|---|
| `storage` | Stocker clé API, paramètres et état temporaire |
| `tabs` | Identifier l'onglet actif et envoyer les commandes |
| `scripting` | Injecter les content scripts si nécessaire |
| `<all_urls>` | Annoter les sites généraux |
| `https://jlp.yahooapis.jp/*` | Appeler l'API Yahoo |

## Confidentialité et sécurité

- Politique complète : [PRIVACY_POLICY.md](PRIVACY_POLICY.md)
- La clé API est fournie par l'utilisateur et jamais codée en dur.
- Le texte n'est envoyé à Yahoo API que lors de l'annotation.
- Aucun backend YomiRuby pour stocker les données utilisateur.

## Limites connues

- L'alignement furigana est en best effort selon la tokenisation API.
- Support partiel possible pour les pages dynamiques, shadow DOM et canvas.
- Les pages très volumineuses peuvent être plus lentes.

## Roadmap

- Meilleur alignement au niveau des segments.
- Allowlist/denylist par site.
- Annotation incrémentale pour contenu dynamique.

## Contribution

Issues et PR bienvenus :

- <https://github.com/TastyHeadphones/yomi-ruby-chrome/issues>

## Licence

Unlicense. Voir [LICENSE](LICENSE).
