# CLAUDE.md — Sanford Story Church

스토리교회(샌포드 한인교회) 웹사이트 · 주보 · 앱을 한 저장소에서 관리한다.
상위 `~/develop/CLAUDE.md`(작업 원칙)를 함께 따른다.

---

## 1. 저장소 구조

```
sanford/                     ← git 루트, 원격 Jun-yeong-Park/Sanfordstorychurch (main)
├── web/                     ← 웹사이트. Netlify 가 이 폴더만 배포한다
│   ├── index.html           한국어 홈
│   ├── en/index.html        영문 홈
│   ├── *.html               한국어 하위 11개
│   ├── en/*.html            영문 하위 11개 (한국어와 1:1)
│   ├── styles/site.css      전체 스타일 한 장
│   ├── js/                  site.js · praise.js · homeband.js
│   ├── bulletin/            ← 온라인 주보 + 배포용 데이터·PDF
│   └── assets/
├── bulletin/                ← 주보 "원본". 매주 여기만 고친다
│   ├── data.js              단일 원본 (주보·홈페이지·앱이 모두 이것을 읽는다)
│   ├── index.html           인쇄용 A4 접지 (PDF 를 만드는 쪽)
│   ├── make.sh              주보 빌드 한 방
│   ├── update-archive.py    게시판 목록 + 캐시 버전 스탬프
│   └── extract-verses.mjs   본문 구절 추출
├── app/                     Expo iOS 앱 (별도 — app/CLAUDE.md 참조)
├── app-web/                 PWA (보관)
├── sns/                     인스타 설교 카드뉴스 · 쇼츠 · 캡션 (13절, sns/README.md)
└── SunlgihtChurch/ error/ public/   ← gitignore. 다른 프로젝트·참고자료
```

**배포**: Netlify, `netlify.toml` 의 `publish = "web"`. main 에 푸시하면 자동 배포(1~2분).

---

## 2. 매주 하는 일 — 주보 업데이트

```bash
cd ~/develop/sanford/bulletin
# data.js 에서 issue(날짜·호수) · sermon · order 의 songs · news 를 고친 뒤
./make.sh
cd .. && git add -A && git commit -m "주보 YYYY-MM-DD" && git push
```

`make.sh` 한 번이 **전부** 처리한다:
인쇄 주보 PDF · 말씀노트 2종 · `web/bulletin/` 으로 data.js 복사 ·
verses.js 추출 · 게시판 목록(archive.js) · **캐시 버전 스탬프**.

### 반드시 알아야 할 세 가지

**`bulletin/data.js` 가 유일한 원본이다.**
`web/bulletin/data.js` 는 make.sh 가 만드는 **복사본**. 원본만 고치고 make.sh 를
안 돌리면 사이트에 반영되지 않는다. (이 함정에 한 번 빠졌다.)

**주보 HTML 이 두 개이고 서로 다른 파일이다. make.sh 는 이 둘을 복사하지 않는다.**

| 파일 | 용도 |
|---|---|
| `bulletin/index.html` | 인쇄용 A4 접지. Chrome 헤드리스가 이걸 PDF 로 만든다 |
| `web/bulletin/index.html` | 온라인 주보(모바일). **QR 이 도착하는 곳** |

**PDF 의 깃 취급이 다르다.**
`bulletin/*.pdf` 는 gitignore(다시 만들 수 있으므로), `web/bulletin/*.pdf` 는 추적한다(사이트가 쓰므로).

---

## 3. 주소 구조 — QR 과 게시판

| 주소 | 내용 | 비고 |
|---|---|---|
| `/bulletin` | **이번 주 주보 하나** | 인쇄된 QR 이 가리키는 곳. **건드리지 말 것** |
| `/bulletins` | 지난 주보 목록(게시판) | 메뉴 "주보" |
| `/bulletin/bulletin.pdf` | 최신 PDF 고정 주소 | 파일명이 매주 바뀌어도 안 깨진다 |

> **주의**: Netlify 가 `.html` 을 떼고 서비스한다. `web/bulletin.html` 을 만들면
> `/bulletin` 을 가로채 QR 이 엉뚱한 곳으로 간다. 실제로 한 번 발생해서
> 게시판을 `bulletins.html` 로 옮겨 해결했다. **`web/bulletin.html` 을 다시 만들지 말 것.**

---

## 4. 캐시 버전 — 손대지 말 것

`data.js` · `archive.js` 의 `?v=` 는 **`update-archive.py` 가 자동으로 찍는다.**
형식은 `날짜.내용해시` (예: `?v=2026-10-04.63e3e17a`).

날짜만 쓰면 같은 주 안에서 내용을 고쳤을 때 주소가 그대로라 캐시가 안 풀린다.
**이번 대화에서 같은 함정에 네 번 빠졌다.** 내용 해시를 붙여 끝냈다.

- 수동으로 `?v=` 를 올리지 말 것. make.sh 가 한다.
- `site.css` · `js/*.js` 는 아직 수동 버전(`?v=26` 등)이다. 이 파일들을 고치면 올려야 한다.
- **파일을 바꾸기 *전에* 버전을 올리면** 그 버전에 옛 내용이 캐시된다. 순서: 파일 먼저, 버전 나중.

---

## 5. 사이트 구조

메뉴 4개 + `처음 오시는 분` 버튼. 한국어 12쪽 / 영문 12쪽.

| 메뉴 | 페이지 |
|---|---|
| 교회 소개 | `about`(우리가 믿는 것 + `#crcna`) · `people` |
| 예배와 말씀 | `worship` · `bulletins` · `sermons` |
| 신앙생활 | `track`(네 개의 이야기 + 네 가지) · `baptism` · `serve` |
| 나눔과 참여 | `events`(달력) · `giving` · 문의(mailto) |
| (버튼) | `visit` |

- 데스크탑 ≥1000px 드롭다운, 그 아래는 전체화면 서랍
- 영문 메뉴는 **반드시 `/en/...`** 을 가리켜야 한다 (한 번 한국어로 새서 고쳤다)
- 로고는 `/` (영문 `/en/`). 예전에 `#top` 이라 하위 페이지에서 안 먹혔다

### data.js 를 읽어 그리는 곳
홈 예배 안내 띠 · 홈 찬양 섹션 · `people` · `events` · `bulletins` · 온라인 주보.
→ **주보만 고치면 사이트가 따라온다.**

---

## 6. 디자인 규칙 (실제 코드 기준)

```
--navy #14100A   --cream #FBF6EA   --orange #FF9A1F   --ink #2A1D0F
본문·한글 제목 Pretendard · 영문 디스플레이 Barlow Condensed
```

> `web/CLAUDE.md` 는 **옛 브랜드 문서**다. Bebas Neue / Montserrat / navy `#0F1E34`
> 라고 적혀 있는데 지금 사이트는 그걸 쓰지 않는다. 충돌하면 **site.css 가 기준**이다.

**주황을 크림 위에 글자로 쓰지 말 것 — 1.97:1 이라 안 읽힌다.**
색을 바꾸지 말고 **바탕이나 강조 방식**을 바꾼다. 이 저장소가 쓰는 해법 세 가지:

1. 주황 칩에 진한 글자 (7.72:1) — 트랙 번호
2. 글자는 진하게, 주황은 **밑줄** — "작은 선물", "네 가지"
3. 글자는 진하게, 주황은 **위 짧은 선** — Serving / Giving / Inviting / Learning

고정 상단 바는 크림 섹션 위에서 크림 글자가 사라진다. 하위 페이지는
`body.page .brand-bar` 로 항상 어두운 바탕을 준다.

---

## 7. 글쓰기 규칙 (사용자가 반복해서 교정한 것)

- **없는 것부터 말하지 않는다.** "~가 아닙니다", "정해진 기간은 없습니다" 류를
  계속 빼라고 했다. 있는 것을 먼저 말한다.
- **없는 걸 있다고 쓰지 않는다.** 교회학교 없음, 큰 밴드 아님 — 그대로 적는다.
- **작은 글씨를 싫어한다.** 메뉴·띠 글자를 여러 번 키웠다.
- **번역투 금지.** 영문 사이트는 직역이 아니라 영어로 다시 썼다.
- 다른 교회(The Source Church, 주은혜) 는 **구조만** 참고하고 문구는 옮기지 않는다.

---

## 8. 이 저장소에서 반복해서 터진 버그

**인라인 스크립트가 `defer` 데이터보다 먼저 실행된다.**
`<script src="...data.js" defer>` 뒤의 인라인 `<script>` 는 **먼저** 돈다.
오류도 안 나고 목록만 비어 있다. `people` · `events` · `bulletins` 가 통째로
비어 있었다. → **`addEventListener('DOMContentLoaded', ...)` 로 감쌀 것.**

**주석 경계로 HTML 을 자르다 옆 섹션까지 날린다.**
`s.index('<!-- A -->')` ~ `s.index('<!-- B -->')` 로 자르면 사이에 다른 섹션이
끼어 있을 때 같이 사라진다. 실제로 세 섹션을 날렸다.
→ 자르기 **전에** `assert` 로 "그 덩어리가 맞는지" 검사할 것.

**캐시 버전** — 4절 참조.

---

## 9. 검증 방법 (눈으로 보지 말 것)

브라우저 패널이 자주 거짓말을 한다. 실제로 겪은 것들:

- 패널이 숨겨지면 `requestAnimationFrame` · `IntersectionObserver` · CSS 애니메이션이 **멈춘다**
- 뷰포트가 **0px** 로 읽혀 가로 넘침이 거짓으로 뜬다 → `resize_window` 로 크기를 명시
- 스크린샷이 빈 화면으로 온다 → 측정값을 믿을 것
- 콘솔 오류는 **누적**된다. 앞 페이지의 404 가 남아 있다

그래서 이렇게 확인한다:

```js
// 글자 대비 — 반투명 층을 전부 합성해야 정확하다
// 작은 글자 4.5:1, 큰 글자(24px+ 또는 18.66px+ bold) 3:1
// 배경이 이미지면 이 방법으로 못 잰다 (거짓 실패가 난다)
```

- 링크는 **서버에서** 확인: 참조된 주소를 전부 curl 해서 상태 코드를 본다
- 겹침은 **경계 상자**로: `getBoundingClientRect()` 교차 검사
- 애니메이션은 **스크럽**으로: 시간대별 `strokeDashoffset` 값을 읽는다
- 배포 후엔 라이브에서 다시 확인 (Netlify 1~2분)

---

## 10. 지금 상태 (2026-10-03)

**사이트**: 창립(9/27) 이후 운영 모드. 카운트다운·"Planting 2026"·흐르는 띠 등
지난 날짜 문구는 전부 제거. 히어로 날짜는 **다음 주일을 계산**해서 안 낡는다.
주보가 지난 것이면 "이번 말씀"·"이번 주 찬양"이 **스스로 숨는다**.

**주보**: 2026-10-04 (VOL.1 NO.2) — 하나님의 첫 이야기 / 창세기 1:1 / 정경원 목사.
찬양 5곡 + 유튜브 링크 + 전체 재생(임시 재생목록, `watch_videos?video_ids=`).
게시판 2호.

### 다음에 할 일

1. **목사님 확인** — `baptism`(세례와 신앙고백), `about`(우리가 믿는 것). 한/영 양쪽.
   교단 문서 기준으로 썼지만 신학은 확정받아야 한다.
2. **유튜브 정식 재생목록** — 지금은 임시 재생목록이라 채널에 안 남는다.
   채널에 만들고 `list=PL...` ID 를 받으면 바꾼다.
3. **지난 설교** — 영상이 쌓이면 `sermons` 페이지를 채널 링크에서 목록으로.

### 알아둘 것

- `app/` 은 별개 프로젝트다. `app/CLAUDE.md` 를 따로 읽을 것.
- `app/sync.sh` 가 웹사이트 변경을 확인한다 (사용자가 원한 흐름).
- 다른 세션이 동시에 작업할 수 있다. **푸시 전 `git fetch` 로 원격 커밋을 확인할 것.**
  이번에 원격 6커밋을 모르고 같은 일을 중복으로 한 적이 있다.

---

## 11. 교회 정보 (사실 확인된 것만)

```
주소     4942 FL-46 #1026, Sanford, FL 32771
예배     매주 주일 저녁 6시 (한국어)
교단     CRCNA (북미주 개혁교회)
이메일   hello@sanfordstorychurch.com
인스타   @storychurch_sanford
유튜브   youtube.com/@SANFORDSTORYCHURCH
헌금     Zelle sanfordstorychurch0927@gmail.com
         수표 "Sanford Story Church" · 7000 Winegard Rd, Orlando FL 32809
         계좌(Fifth Third Bank)는 요청 시 안내

섬기는 사람
  정경원 목사    담임 · 리폼드신학교(RTS) M.Div.
  허강현 전도사  찬양 인도 · 칼빈신학교 M.Div.
  박준영 형제    코디네이터 · 웰컴

신청 폼
  방문     forms.gle/UD3BDJRezNzVYegw6
  찬양팀   forms.gle/AWhvv4ShUS9dLa7A9
  미디어팀 docs.google.com/forms/u/2/d/e/1FAIpQLSfx3vyJKxm3ixhfoT4CRvCoW7EcD_wKn_njVPkHBbSzxcjFzg/viewform
```

**지어내지 말 것.** 모르는 정보는 비워 두거나 "준비 중"이라고 쓴다.
설교가 안 정해졌을 때 지난 호를 새 날짜로 내보내지 않았고, PDF 가 없는 호는
게시판에 올리지 않도록 `update-archive.py` 가 막는다.

---

## 12. 로컬 실행

```bash
# 웹사이트 (Claude Code 에서는 preview_start 로 launch.json 의 sanford-web)
python3 -m http.server 8765 --directory ~/develop/sanford/web
```

`~/develop/.claude/launch.json` 에 등록된 이름:
`sanford-web`(8765) · `bulletin`(8766) · `sanford-app-web`(8767) · `sanford-app`(8098)

주보 PDF 빌드는 Chrome 이 필요하다:
`/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` (make.sh 에 경로 고정)

---

## 13. SNS — 설교 카드뉴스 · 쇼츠 · 캡션 (2026-10-03 추가)

주보처럼 **txt 한 파일 → 명령 한 줄**. 자세한 문법은 `sns/README.md`.

```bash
python3 sns/make.py sns/2026-09-27_그리스도의편지/카드.txt
# → 같은 폴더 카드뉴스/01~08.png + 카드뉴스.zip (1080×1350, 인스타 4:5)
```

**자동화 (2026-10-03)**: `python3 sns/prep.py 영상.MP4` → 주차 폴더 · Whisper 받아쓰기 · `교정.txt` 적용 원고 ·
카드.txt 머리(주보 게시판의 제목·본문·날짜). 문구는 Claude Code 세션에서 작성 — 절차는 `.claude/skills/sns-cards`
(사용자가 API 호출 대신 세션 작성을 선택). `.claude/` 는 gitignore 라 이 Mac 에만 있다.

- 주차 폴더 `sns/YYYY-MM-DD_제목/` 에 `카드.txt`(입력) · `캡션.md` · `설교원고.txt` · `쇼츠/`
- 양식: `sns/_양식_카드.txt`. 블록 `[카드]` `[구절]` `[CTA]`, `/` 줄바꿈, `*주황*`, `**굵게**`
- 카드 순서 자동: 네이비 표지 → 크림/네이비 번갈아 → **마지막 내용 카드 오렌지** → CTA(네이비 + 찢어진 종이, 저장·공유·주일 6시·@storychurch_sanford)
- 오렌지 카드엔 로고 대신 글자 워드마크 (저대비 배경에 로고 금지 · 로고 색 변경 금지)
- 로고: `sns/assets/` = `web/assets/logo/logo-primary-on-{light,navy}-tp.png`, `emblem/sanford-story-mark-4k.png` 를 축소한 것
- gitignore: `sns/*/카드뉴스/`, `sns/*/*.zip`, `sns/**/*.mp4` (다시 만들 수 있거나 용량이 큼)
- 렌더링: Chrome 헤드리스 스크린샷. 한글 Pretendard 로컬 설치 필수, 영문 폰트는 Google Fonts(인터넷 필요)

### 첫 결과물: 2026-09-27 「그리스도의 편지」
- **본문은 고린도후서 3:1-3** (사용자 확정. 설교 중 1–5절을 읽지만 카드·캡션은 3:1-3)
- 원본 영상 `~/Downloads/XIKN2285.MP4` (4K, 19:52, 2.5GB). 설교자 정경원 목사
- 카드 8장 흐름(사용자 요청으로 **바울**과 **읽혀지는 편지(3:2)** 강조):
  표지 → 러브레터 → 의심받은 바울 → 너희가 나의 편지다 → 3:2 구절 → 편지의 내용은 그리스도 → 하나님의 사랑 이야기(오렌지) → CTA
- 6·7번 문구는 사용자가 붙여준 **설교 원고**(손으로 쓴 원고, 빨간 밑줄 = 핵심 문장)를 줄인 것.
  7번 아래 질문 "이번 주, 나는 어떤 이야기로 읽히고 있을까요?" 는 원고에 없는 문장(내가 덧붙임)
- 쇼츠 3개는 **원본 가로 그대로 구간만** 자름 (세로 9:16 크롭은 사용자가 원치 않음). 구간은 `쇼츠/구간.md`
- 캡션은 `캡션.md` (추천안 A: 질문형 + 📌저장 유도)

### 사용자 선호 (SNS 작업 중 확인)
- 카드는 **적게, 짧게**. 10장 안을 "너무 많다"고 해서 줄였다. 내용 카드 4~6장, 전체 6~8장
- 결과물은 **zip 으로** 받기를 원한다
- "최신 트렌드" 요청 → 블랙볼드 / 블러시 매거진 시안을 거쳐 **교회 로고 브랜딩**으로 확정
- 마지막에 행동 유도(CTA) 카드를 꼭 넣는다 (참고: dimo 카드뉴스 "CTA 없으면 끝난 콘텐츠")
- 캡션은 짧은 줄바꿈 + 이모지 + 해시태그, 첫 줄 훅

### ⚠ SNS 미해결 · 주의
- **색 기준 충돌**: `sns/make.py` 는 `web/docs/brand-guide.md` 값(navy `#0F1E34`, cream `#F4F0E6`)과
  로고 원본 색에 맞췄다. 6절에 따르면 실제 사이트(site.css)는 `#14100A`/`#FBF6EA` + Barlow Condensed.
  SNS 를 사이트에 맞출지 로고에 맞출지 **사용자에게 아직 안 물어봄**.
- **주황 글자 on 크림 (6절 규칙 위반)**: 크림 카드(2·4·6번)의 주황 제목·강조가 대비 약 1.9:1.
  큰 글자라도 3:1 미달. 사용자는 현재 디자인을 승인했지만, 고친다면 6절의 해법(진한 글자 + 주황 밑줄/칩)으로.
- 받아쓰기(Whisper) 는 성경 용어 오인식이 많다 → 교정 필수 (고린도구서→고린도후서, 무사람→뭇사람, 불안하셔서→부활하셔서, 그리스로→그리스도)

### 받아쓰기 · 쇼츠 도구 (이 Mac)
- `ffmpeg` (homebrew), `mlx_whisper` (`~/.local/bin`, 모델 `mlx-community/whisper-large-v3-turbo` 캐시됨)
- 명령은 `sns/README.md` 하단
