# YomiRuby 크롬 확장 (한국어, 🇰🇷)

![YomiRuby Promo](icons/promo_marquee_1400x560.png)

## 프로젝트 개요

YomiRuby는 Manifest V3 기반 크롬 확장으로, 웹페이지의 일본어 한자에 HTML `<ruby>`, `<rt>`, `<rp>` 태그를 사용해 후리가나를 표시합니다.

## 주요 기능

- 화면에 보이는 일본어 텍스트 노드(한자 포함) 탐지.
- Yahoo! JAPAN Furigana API 호출(베스트 에포트).
- 문장/문단 단위 처리, 진행률 표시, 취소, 복원 지원.
- `input`, `textarea`, `script`, `style`, `code`, `pre`, 편집 가능한 요소 제외.
- 중복 주석 방지.
- 설정 페이지에서 사용자 API 키 저장(`chrome.storage.sync`).
- API 키가 없을 때 데모 모드 지원.

## 설치 방법

1. 이 저장소를 clone 또는 다운로드합니다.
2. `chrome://extensions`를 엽니다.
3. **개발자 모드**를 켭니다.
4. **압축해제된 확장 프로그램을 로드**에서 프로젝트 폴더를 선택합니다.

## Yahoo API 키 설정

1. 확장 팝업에서 **Settings**를 엽니다.
2. Yahoo! JAPAN App ID(API 키)를 입력합니다.
3. **Test API Key**를 클릭합니다.
4. **Save Settings**를 클릭합니다.

개발자 포털:
- <https://developer.yahoo.co.jp/>
- API 문서: <https://developer.yahoo.co.jp/webapi/jlp/furigana/v2/furigana.html>

## 사용 방법

1. 일본어 웹페이지를 엽니다.
2. YomiRuby 팝업을 엽니다.
3. **Enable on all pages**를 켭니다.
4. **Run Annotation Now**를 누릅니다.
5. 실행 중에는 **Cancel**, 주석 제거는 **Restore**를 사용합니다.

## 권한 설명

- `storage`: API 키, 설정, 세션 상태 저장.
- `tabs`: 현재 탭 정보 확인 및 명령 전송.
- `scripting`: 필요 시 콘텐츠 스크립트 주입.
- Host permissions:
  - `<all_urls>`: 페이지 주석 처리.
  - `https://jlp.yahooapis.jp/*`: Yahoo API 호출.

## 알려진 제한

- 후리가나 정렬은 API 토크나이징 품질에 의존하는 베스트 에포트입니다.
- 동적 페이지, shadow DOM, canvas 텍스트는 일부 미지원일 수 있습니다.
- 긴 텍스트는 분할 처리되어 경계에서 정확도가 떨어질 수 있습니다.

## 개인정보

- 전체 정책: [PRIVACY_POLICY.md](PRIVACY_POLICY.md)
- API 키는 사용자가 직접 제공합니다.
- 주석 실행 시에만 필요한 텍스트가 Yahoo API로 전송됩니다.
