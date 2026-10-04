# CLAUDE.md — Sanford Story Church 주보 (Bulletin)

인쇄 주보(A4 접지 4면) + 온라인 주보(QR) + 설교노트 낱장을 **`data.js` 한 파일**에서 생성하는 프로젝트.
작업 전 `README.md`(사용자용 매뉴얼)도 함께 보세요. 이 파일은 **작업자(Claude)용 인수인계 문서**입니다.

---

## 1. 구조 · 스택

빌드 도구 없음. 바닐라 HTML/CSS/JS + 헤드리스 Chrome 인쇄. npm 의존성 없음.

```
~/develop/sanford/            ← 웹사이트 저장소 (Sanfordstorychurch.git, Netlify 배포)
├── web/                      ← 사이트 본체
│   ├── CLAUDE.md             ← 웹사이트 작업 규칙 (브랜드 규칙 포함, 반드시 숙지)
│   └── bulletin/             ← 온라인 주보. make.sh 가 자동 생성/복사 (직접 수정 주의)
└── bulletin/                 ← ★ 이 프로젝트 (jobo.git — 별도 저장소)
    ├── data.js               ← ★ 매주 수정하는 유일한 파일
    ├── index.html            ← 인쇄 4면 레이아웃 + 접지 조판 (CSS/템플릿 전부 여기)
    ├── note-sheet.html       ← 설교노트 낱장 A5 (?v=1 세로 4단 / ?v=4 흐름+절취)
    ├── note-guide.html       ← 말씀노트 작성 안내 A4 2-up (내용 고정, 주차 무관)
    ├── make.sh               ← ★ 빌드 (PDF 4종 + 온라인 주보 동기화)
    ├── extract-verses.mjs    ← 성경 본문 발췌 → web/bulletin/verses.js (node 필요)
    ├── update-archive.py     ← 주보 게시판 목록 web/bulletin/archive.js 갱신
    └── assets/               ← 로고 SVG/PNG, qr.png
```

**저장소가 둘이고 bulletin/ 이 양쪽에 들어 있습니다.**
`~/develop/sanford/bulletin` 은 `jobo.git` 의 루트이면서, 동시에 상위 `Sanfordstorychurch.git` 에도 파일로 추적됩니다.
→ **주보를 고치면 두 저장소 모두 커밋·푸시해야 합니다.**

| 저장소 | 경로 | 역할 |
|---|---|---|
| `Jun-yeong-Park/jobo` | `~/develop/sanford/bulletin` | 주보 소스 (PDF 포함 추적) |
| `Jun-yeong-Park/Sanfordstorychurch` | `~/develop/sanford` | 웹사이트 + 온라인 주보 (Netlify 자동 배포) |

---

## 2. 명령어

```bash
cd ~/develop/sanford/bulletin && ./make.sh
```
이 한 줄이 전부입니다. 내부 동작:
1. `data.js` 의 `issue.dateISO` 로 날짜 추출 → `주보-YYYY-MM-DD.pdf`
2. 설교노트 낱장 2종(`말씀노트-안1/안4-날짜.pdf`) 생성
3. `말씀노트-안내.pdf` 는 **없을 때만** 생성 (내용 고정) → 안내지를 고쳤으면 파일을 지우고 다시 돌리거나 Chrome 명령을 직접 실행
4. `web/bulletin/` 으로 `data.js`·PDF 복사, `verses.js`·`archive.js` 생성, 사이트 6개 페이지의 캐시 버전 스탬프 갱신
5. 고정 주소용 `web/bulletin/bulletin.pdf` 도 같이 복사 (메뉴 링크가 매주 깨지지 않게)

**미리보기 / 시각 확인** (PDF 뽑기 전 레이아웃 점검):
```bash
cd ~/develop/sanford/bulletin && python3 -m http.server 8766   # → http://localhost:8766
```
온라인 주보 미리보기는 `cd ~/develop/sanford/web && python3 -m http.server 8769` → `/bulletin/`.

**배포 (두 저장소 다)**:
```bash
cd ~/develop/sanford/bulletin && git add -A && git commit -m "주보 YYYY-MM-DD: ..." && git push origin main
cd ~/develop/sanford && git add -A && git commit -m "주보 YYYY-MM-DD: ..." && git push
```

의존성: Google Chrome(`/Applications/Google Chrome.app`), `python3`, `node`(extract-verses.mjs 전용).
`extract-verses.mjs` 는 `../app/assets/bible/krv.json`(성경 앱 데이터)을 읽습니다. 그 파일이 없으면 이 단계만 실패하니 `make.sh` 에서 건너뛰거나 경로를 확인하세요.

---

## 3. 코딩 규칙 · 사용자 선호

**최상위 원칙은 `~/develop/CLAUDE.md` 와 `web/CLAUDE.md`(브랜드 규칙)를 따릅니다.** 이 프로젝트 고유 규칙:

- **잉크 절약이 명시적 요구사항.** 흰 바탕 유지. 큰 면적의 네이비/크림 채움 금지(표지 포함). 색은 오렌지 포인트와 선·테두리로만. 되돌리지 말 것.
- **내용은 전부 `data.js`.** `index.html` 에 본문 텍스트를 하드코딩하지 말 것 (예외: 말씀노트 질문 문구 — 인쇄판·앱 양쪽에 고정).
- `data.js` 값에 `<b>`, `<br>` 같은 간단한 HTML 사용 가능.
- 영어 필드(`…En`)는 앱·온라인 주보 전용. 인쇄판은 무시하지만 **같이 채워둘 것** (비면 한글이 그대로 노출).
- 레이아웃 수정은 CSS 토큰/변수로. 특히 `--tear`(절취 카드 높이, 현재 32mm)는 P3·P4 양쪽이 공유하므로 한 곳만 고치면 어긋납니다.
- 사용자는 한국어로 짧게 지시하고, **매번 결과 PDF를 파일로 받길 원합니다.** 수정 → `./make.sh` → PDF 전달까지가 한 사이클.
- 명령은 복붙 가능한 형태로 제시.

---

## 4. 면 구성 · 조판 (중요)

인쇄 배치: **앞면 `[P4 | P1]`, 뒷면 `[P2 | P3]`**, A4 가로, 여백 없음, **짧은 쪽으로 넘김(flip on short edge)**, 배경 그래픽 켬.
짧은 쪽 넘김이므로 **P3 의 물리적 뒷면은 P4** 입니다 — 절취선 정렬이 여기서 나옵니다.

| 면 | 내용 |
|---|---|
| P1 표지 | 로고(네이비 버전), 슬로건, 날짜/시간, 오늘 설교 |
| P2 **STORY FLOW · 예배의 흐름** | His / Your / Deep / Our Story 4부 + 하단 '오늘의 말씀' 박스 |
| P3 **SERMON NOTE · 말씀 노트** | His(1.5fr) / My(1fr) / Deep(1fr) 박스 + 하단 **기도 카드(절취)** |
| P4 **STORY NEWS · 교회 소식** | 소식 · 일정(Calendar) · 기도제목 · 섬기는 분들 · 온라인 주보 QR · 헌금 보고 + 하단 교회 정보 = **기도 카드 뒷면** |

**절취선 정렬 규칙 (깨지기 쉬움):**
- P3 기도 카드와 P4 하단 블록은 **둘 다 페이지 아래 끝에서 `--tear`(32mm)** 지점에서 시작해야 합니다.
- 이를 위해 `.notes { padding-bottom: 0 }` 와 `.news { padding-bottom: 0 }` 가 둘 다 필요합니다. (과거에 P4 만 11mm 여백이 남아 앞뒤가 11mm 어긋났던 이력 있음)
- 수정 후 검증: 브라우저에서
  ```js
  const f=(s)=>{const p=document.querySelector(s),t=p.querySelector('.tear,.foot');
    return (p.getBoundingClientRect().bottom-t.getBoundingClientRect().top).toFixed(1)};
  [f('.notes'), f('.news')]   // 두 값이 같아야 함 (현재 120.9px = 32mm)
  ```

**P3 말씀 노트 = "안 4"** (4개 시안 중 사용자 선택): 왼쪽 점선 레일 흐름 + 하단 절취 기도 카드.
기도 카드는 "My Story Card(결단)"가 아니라 **기도 제목 카드**입니다 (사용자 지시로 변경). 적어서 팰릿 월에 꽂거나 스태프에게 전달.

---

## 5. 현재 상태 (2026-10-04 호 기준)

- `issue`: VOL.1 NO.2 · 2026년 10월 4일 · 주일 오후 6:00 · `dateISO: "2026-10-04"`
- `sermon`: **하나님의 첫 이야기** · 창세기 1:1 · 정경원 목사 / 오늘의 말씀 창 1:1
- `order` 4부:
  - 01 HIS STORY — 예배로의 부름(웰컴) · 찬양(함께 지어져 가네 / 내 마음 다해 / 내가 어둠 속에서 헤멜 때에도) · 말씀
  - 02 YOUR STORY — 말씀 적용·나눔 (노트 작성 후 옆자리 분과 10분)
  - 03 DEEP STORY — 결단 찬양·봉헌(삶의 예배) → **축도(민 6:24–26)** → **파송 찬양(The Blessing)**
  - 04 OUR STORY — 광고 · 식탁 교제
- `offering`: 9월 27일 주차 · 감사헌금 **$350** (합계 $350)
- `news` 2건: "친구와 함께 오세요" / "섬길 자리가 있습니다"
- `prayers` 4건 (믿지 않는 샌포드 이웃을 위한 기도 포함)
- `events` 3건: 10/4 · 10/11 · 10/18 주일예배
- 주소: **4942 FL-46 #1026, Sanford, FL 32771**
- 푸시 완료: `jobo` → `d201822`, `Sanfordstorychurch` → `afeaabe`

### 최근 세션에서 내린 결정 (코드만 봐서는 안 보이는 것)

- 예배 순서 제목을 "ORDER OF WORSHIP · 예배 순서" → **"STORY FLOW · 예배의 흐름"** 으로 변경.
- 대표기도·성경봉독 항목 **삭제**, 03 Deep Story 의 "기도 · 정경원 목사" 행도 **삭제**.
- 축도와 파송 찬양 **순서 교체** (축도 먼저).
- 예배 순서의 담당자 표기는 **"허강현 전도사"**. 단, P4 "섬기는 분들" 표의 *찬양 인도* 는 직함 열이 따로 있어 "허강현" 그대로 둠 (사용자 확인 대기).
- P4 하단 법인명 **"Sunday Project Ministry Inc." 삭제**, CRCNA 만 유지.
- "다음 주(Next Week)" 블록과 "소그룹(Small Groups)" 블록 **삭제** → **Calendar(일정 3건)** + **Online(QR)** 으로 교체. `data.js` 의 `nextWeek`·`groups` 키도 제거했으므로 온라인 주보에서도 참조하면 안 됨.
- 말씀노트 안내지(`note-guide.html`)는 **3 스토리 + 기도 카드** 구성으로 갱신 완료 (예전 4 스토리 버전 아님).
- QR 은 `sanfordstorychurch.com/bulletin` 고정 — 매주 링크 동일, 내용만 교체. `주보-QR.png`(포스터용) / `주보-QR-only.png`·`assets/qr.png`(인쇄 삽입용).

### 다음 할 일

1. **찬양 곡 교체 여부 확인** — 사용자가 "찬양 업데이트하고"라 했으나 새 곡 목록을 아직 안 줌. 현재는 기존 3곡 유지 상태.
2. P4 "찬양 인도 허강현"에 '전도사' 붙일지 확인.
3. 매주 반복: `data.js` 의 `issue`(날짜·VOL/NO) · `sermon` · 찬양 `songs` · `news` · `offering`(지난 주차) · `events`(지난 날짜 제거) 갱신 → `./make.sh` → 두 저장소 푸시.

---

## 6. 알려진 이슈 · 주의할 점

- 🔴 **앱이 깨질 수 있음 (미해결).** 성도용 앱(`../app`)은 `sync.sh` 로 `data.js` 를 `app/data/bulletin.ts` 에 복사해 씁니다. 그 사본은 아직 9/27 버전이라 멀쩡하지만, **`app/components/BulletinView.tsx:148,165` 와 `app/app/(tabs)/church.tsx:74` 가 `D.groups` · `D.nextWeek` 를 참조**합니다. 이번에 두 키를 `data.js` 에서 지웠으므로 **다음에 `sync.sh` 를 돌리면 앱이 런타임 에러**를 냅니다. 앱 작업 시 그 세 곳을 Calendar(`D.events`) 기반으로 바꾸거나 옵셔널 처리해야 합니다.
- **jobo 저장소가 다른 세션에서도 푸시됩니다.** 푸시 거절되면 `git fetch` 후 **rebase** 하세요. `data.js` 충돌은 보통 "지난 주 내용 vs 이번 주 내용"이므로 **이번 주(내 커밋) 쪽을 채택**(`git checkout --theirs data.js` — rebase 중에는 theirs 가 내 커밋). 2026-10-03 에 이 방식으로 해결한 이력 있음.
- **상위 저장소의 `.gitignore` 가 `bulletin/*.pdf` 를 무시**합니다. 반면 `jobo` 는 PDF 를 추적합니다. PDF 가 웹에 올라가야 할 때는 `web/bulletin/` 쪽 사본(= `make.sh` 가 복사)이 올라갑니다.
- **절취선 앞뒤 정렬은 프린터 양면 정렬에 좌우**됩니다. 데이터상 맞아도 실제로 어긋나면 프린터 문제 — 한 장 뽑아 빛에 비춰 확인하고, 필요하면 `--tear` 로 보정.
- **P2/P4 가 넘칠 수 있음.** 소식이 늘거나 예배 순서가 길어지면 하단이 밀립니다. `./make.sh` 전에 브라우저로 확인하세요. 두 면 모두 내용을 `flex` 로 균등 분배(`.order .parts`, `.news .body`)하고 있어 어느 정도는 자동 흡수됩니다.
- `make.sh` 는 포트 8766 을 재사용합니다. 다른 프로세스가 점유 중이면 엉뚱한 페이지가 PDF 로 나올 수 있으니 확인하세요.
- `말씀노트-안내.pdf` 는 존재하면 다시 만들지 않습니다 (위 명령어 3번 참고).
- 날짜 계산 주의: 일정(`events`)에 지난 날짜가 남기 쉽습니다. 매주 확인.

---

## 7. 참고

- 사용자용 매뉴얼: `README.md` (인쇄 설정, 앱 전용 필드 설명 포함)
- 웹사이트/브랜드 규칙: `../web/CLAUDE.md`, `../web/docs/brand-guide.md`
- 성도용 앱: `~/develop/sanford/app` — `sync.sh` 가 `data.js` → `app/data/bulletin.ts` 로 복사합니다. **필드를 지우면 앱이 깨집니다** (위 6절 첫 항목 참고).
