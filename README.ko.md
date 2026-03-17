# YomiRuby (한국어, 🇰🇷)

![YomiRuby Promo](icons/promo_marquee_1400x560.png)

<div align="center">

[🇬🇧 English](README.en.md) · [🇨🇳 简体中文](README.zh-CN.md) · [🇮🇩 Bahasa Indonesia](README.id.md) · [🇰🇷 한국어](README.ko.md) · [🇹🇭 ไทย](README.th.md)<br>
[🇻🇳 Tiếng Việt](README.vi.md) · [🇲🇲 မြန်မာ](README.my.md) · [🇮🇳 हिन्दी](README.hi.md) · [🇳🇵 नेपाली](README.ne.md) · [🇵🇭 Filipino](README.fil.md)<br>
[🇲🇾 Bahasa Melayu](README.ms.md) · [🇱🇰 සිංහල](README.si.md) · [🇫🇷 Français](README.fr.md) · [🇧🇷 Português (Brasil)](README.pt-BR.md) · [🇯🇵 日本語](README.ja.md)

</div>

## 개요

YomiRuby는 일본어 웹페이지의 한자에 후리가나를 추가하는 Manifest V3 기반 크롬 확장입니다. HTML ruby 태그(`ruby`, `rt`, `rp`)를 사용해 의미 있는 마크업으로 주석을 표시합니다.

## 핵심 포인트

- 문장/문단 단위 주석 처리.
- 진행률 표시, 취소, 복원 기능.
- Yahoo API 쿼터 대응(속도 제한, 재시도, 백오프).
- Settings에서 API 키 검증/테스트 지원.
- API 키 미설정 시 데모 모드 지원.
- 레이아웃 깨짐을 줄이기 위한 보수적 DOM 업데이트.

## 빠른 시작

1. 저장소를 clone 합니다.
2. `chrome://extensions`를 엽니다.
3. **개발자 모드**를 활성화합니다.
4. **압축해제된 확장 프로그램 로드**로 프로젝트 폴더를 선택합니다.
5. **Settings**에서 API 키 입력 후 **Test API Key**, **Save Settings**를 실행합니다.
6. 일본어 페이지에서 **Run Annotation Now**를 클릭합니다.

## API 키 설정

- 개발자 포털: <https://developer.yahoo.co.jp/>
- API 문서: <https://developer.yahoo.co.jp/webapi/jlp/furigana/v2/furigana.html>
- 요청 엔드포인트: `https://jlp.yahooapis.jp/FuriganaService/V2/furigana`

## 아키텍처

| 구성 요소 | 역할 |
|---|---|
| `background.js` | API 통신, 속도 제어, 재시도, 상태 관리 |
| `content.js` | DOM 순회, ruby 삽입, 진행률 표시, 취소/복원 |
| `popup.*` | 실행/취소/복원/설정 진입 |
| `options.*` | API 키 입력, 검증, 테스트, 저장 |
| `utils/*` | 상수 및 텍스트/DOM 유틸리티 |

## 권한

| 권한 | 필요 이유 |
|---|---|
| `storage` | API 키/설정/세션 상태 저장 |
| `tabs` | 활성 탭 식별 및 명령 전송 |
| `scripting` | 필요 시 콘텐츠 스크립트 주입 |
| `<all_urls>` | 일반 사이트 주석 처리 |
| `https://jlp.yahooapis.jp/*` | Yahoo API 호출 |

## 개인정보 및 보안

- 전체 정책: [PRIVACY_POLICY.md](PRIVACY_POLICY.md)
- API 키는 사용자가 직접 제공하며 하드코딩하지 않습니다.
- 주석 실행 시에만 필요한 텍스트를 Yahoo API로 전송합니다.
- YomiRuby 전용 수집 서버는 없습니다.

## 알려진 제한

- 후리가나 정렬은 API 토큰화 결과에 의존하는 베스트 에포트입니다.
- 동적 페이지, shadow DOM, canvas 텍스트는 일부 미지원일 수 있습니다.
- 매우 큰 페이지는 안정성 우선 처리로 시간이 더 걸릴 수 있습니다.

## 로드맵

- 구문 단위 정렬 개선 및 사용자 사전 지원.
- 사이트별 allowlist/denylist.
- 동적 콘텐츠 증분 주석 처리.

## 기여

Issue/PR:

- <https://github.com/TastyHeadphones/yomi-ruby-chrome/issues>

## 라이선스

Unlicense. [LICENSE](LICENSE) 참고.
