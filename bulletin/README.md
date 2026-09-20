# Sanford Story Church — 주보 (Bulletin)

A4 한 장을 반으로 접는 4면 주보. 디자인 툴 없이 **`data.js` 한 파일만 고치고 브라우저에서 PDF**로 뽑습니다.

```
bulletin/
├── index.html   # 레이아웃 + 조판(접지 배치). 보통 건드릴 일 없음
├── data.js      # ★ 매주 수정하는 파일 (날짜, 설교, 순서, 소식, 기도제목, 헌금 보고…)
├── note-guide.html  # 말씀 노트 작성 안내 (A4 가로 2-up, 별도 배부용 · 내용 고정)
├── note-sheet.html  # 설교노트 낱장 A5 (?v=1 세로 4단 / ?v=4 흐름+절취). 제목은 data.js 에서
├── make.sh      # ★ PDF 빌드 한 방 (./make.sh) — 파일명은 data.js 의 issue.dateISO
└── assets/      # 로고 (web/assets 에서 복사)
```

## 매주 하는 일 (3분)

1. `data.js` 열어서 내용 수정 (설교 제목/본문, 예배 순서 담당자, 소식, 헌금 보고, 다음 주 예고).
2. `index.html` 열기 — 로컬 서버 필요 (`file://`로 열면 data.js가 안 붙음):
   ```bash
   cd ~/develop/sanford/bulletin && python3 -m http.server 8766
   ```
   → http://localhost:8766
3. 상단 **[PDF / 인쇄]** 버튼 → 브라우저 인쇄 창에서
   - 용지: **A4**, 방향: **가로(Landscape)**, 여백: **없음**, 배경 그래픽: **켬**
   - 양면: **짧은 쪽으로 넘김 (Flip on short edge)**
   - "PDF로 저장" 하면 2페이지(앞/뒤) PDF가 나옵니다.

터미널에서 바로 PDF 뽑기 (2·3번 대신 — 서버 없어도 됨):
```bash
./make.sh
```
→ `주보-YYYY-MM-DD.pdf` (날짜는 `data.js` 의 `issue.dateISO`). 말씀노트 안내지 PDF는 없을 때만 같이 생성.

## 면 구성

| 면 | 내용 |
|---|---|
| P1 표지 | 로고, 슬로건, 날짜/시간, 오늘 설교 (흰 바탕 · 저잉크) |
| P2 Story Flow | His / Your / Deep / Our Story 4부 + 오늘의 말씀 |
| P3 말씀 노트 | His / My / Deep Story 박스 + 하단 **기도 카드(절취)** |
| P4 교회 소식 | 소식, 모임, 기도제목, 다음 주, 섬기는 분들, 헌금 보고. 하단 연락처 블록 = 기도 카드 뒷면 (같은 높이 `--tear`, 절취선 정렬) |

접지 배치: 앞면 `[P4 | P1]`, 뒷면 `[P2 | P3]`. 화면의 **[읽기 순서 보기]** 는 교정용이고 인쇄 시엔 자동으로 접지 배치로 돌아갑니다.

## 팁
- 값 안에 `<b>`, `<br>` 같은 간단한 HTML을 써도 됩니다.
- 소식이 5개를 넘거나 순서가 길어지면 P4/P2 하단이 밀릴 수 있으니 미리보기로 확인하세요.

## 앱(../app) 전용 필드
같은 `data.js`를 성도용 앱도 읽습니다. 인쇄판은 아래 필드를 무시합니다.
- 영어 모드: `…En` 필드 (`serviceEn`, `nameEn`, `detailEn`, `titleEn`, `bodyEn`, `descEn`, `whenEn`, `roleEn`, `excerptEn`, `excerptRefEn`, `prayersEn`, `nextWeek.*En`, `givingEn`). 비우면 한글이 그대로 보입니다.
- 찬양 콘티: 예배 순서 항목에 `songs: [{ title, artist, url }]`. 앱 주보 탭 상단 "이번 주 찬양"에 모든 항목의 곡이 모여 보이고(찬양 · 결단 찬양), 예배 순서에도 곡마다 ▶ 가 붙습니다. `url` 이 비면 유튜브 검색으로 열립니다.
- 설교 다시 듣기: `sermon.video` (YouTube 링크), `sermon.audio` (mp3 주소).
- 일정: `events[]` — `date`(YYYY-MM-DD) `time`(HH:MM) `durationMin` `title/titleEn` `place/placeEn` `desc/descEn`. 앱 교회 탭에서 "내 캘린더에 추가".
- 말씀 노트: 앱의 노트 화면은 인쇄판 P3 와 같은 His / My / Deep Story 3단 + 기도 카드 구조입니다 (질문 문구는 index.html · app 양쪽에 고정).
- 성경 본문: `sermon.scripture`, 예배 순서의 성경 구절(`detail`)은 앱에서 탭하면 본문(개역개정/NIV)이 열립니다. 형식: `고린도후서 3:1–6`, `시편 100편`, `고후 3:3`.
# jobo
