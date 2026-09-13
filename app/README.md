# Sanford Story Church — Story App (iOS 먼저)

성도용 앱. **주보 보기(+지난 주보 아카이브) · 성경 본문(개역개정/NIV) · 설교 다시 듣기 · 설교 노트(타이핑 + 손글씨 + 종이 주보 사진, 결단 수요일 알림) · 나눔 벽(은혜 나눔 · 기도 부탁 · 아멘) · 일정(캘린더 추가) · 교회 안내 · 한/영 · 로그인(이메일 코드, 노트 백업).**
Expo Router + Supabase — `~/develop/sinang`(faith-tracker) 와 같은 스택.

```
app/
├── app/                # 화면 (expo-router)
│   ├── (tabs)/         # 주보 index · 노트 notes · 성경 bible · 나눔 wall · 교회 church
│   ├── note/[issue]    # 말씀 노트 — 인쇄 주보 P3 와 같은 His / My / Deep Story 3단 + 기도 카드 (자동 저장, 사진·손글씨, 공유)
│   ├── draw/[issue]    # 손글씨 캔버스 → PNG 첨부
│   ├── bible/[ref]     # 성경 본문 (개역개정 / NIV, 장 전체 보기)
│   ├── archive · bulletin/[issue]   # 지난 주보 목록 · 보기
│   └── signin          # 이메일 6자리 코드 로그인
├── components/         # ui.tsx (브랜드 섹션·버튼·KV), BulletinView(주보 한 호), SermonMedia(유튜브·오디오), Events(일정), TopBar, icons
├── lib/                # bulletin(주보+아카이브) · bible(본문) · store(노트/첨부 + 서버 백업) · wall(나눔) · auth(로그인) · notify(결단 알림) · calendar · i18n(한/영) · theme
├── assets/bible/       # krv.json(개역개정) · niv.json — ~/develop/SundayProject 에서 복사 (약 9MB, 처음 열 때만 로드)
├── data/bulletin.ts    # ★ 자동 생성 — ../bulletin/data.js 복사본 (직접 수정 X)
├── data/site-meta.json # 웹사이트 마지막 확인 정보 (sync.sh 가 씀)
├── supabase/           # schema.sql + README (연결 방법)
├── scripts/push-bulletin.mjs   # 주보 → Supabase 업로드 (앱 업데이트 없이 매주 배포)
└── sync.sh             # 작업 전: 웹사이트 저장소/라이브 사이트 변경 확인 + 주보 데이터 복사
```

## 하루 작업 흐름

```bash
cd ~/develop/sanford/app
./sync.sh          # 1) 웹사이트(web)·라이브 사이트에 바뀐 게 있는지 + 주보 데이터 최신화
npx expo start     # 2) iPhone 의 Expo Go 앱으로 QR 스캔 → 실기기에서 바로 확인
```
- 브라우저 미리보기만 볼 땐 `./dev.sh` (http://localhost:8098) — 카메라·손글씨 저장은 iOS 에서 확인하세요.
- iOS 시뮬레이터는 Xcode 설치 후 `npx expo run:ios`.
- 웹사이트 브랜드 규칙은 `../web/docs/brand-guide.md` — 색·폰트 토큰은 `lib/theme.ts` 에 그대로 옮겨 놓음.

## 데이터 원칙
- **주보 원본은 `../bulletin/data.js` 하나.** 인쇄판(bulletin/index.html)과 앱이 같은 파일을 씁니다. 매주 그것만 고치고 `./sync.sh`.
- Supabase 를 연결하면 `npm run push-bulletin` 으로 그 주보를 서버에 올려, 성도들 앱이 앱스토어 업데이트 없이 최신 주보를 받습니다 (`supabase/README.md`).
- 노트·사진·손글씨는 **기기에만** 저장 (AsyncStorage + 앱 문서 폴더). 서버로 올리는 건 사용자가 [나눔]·[공유]를 누를 때만.

## 기능별 메모
- **성경 탭**: 선데이프로젝트 앱과 같은 방식 — 개역개정/NIV, 책→장 선택, 절 탭 형광 + 공유, 길게 눌러 북마크, 글자 크기, 검색, 마지막 위치 기억 (`app/(tabs)/bible.tsx`). 번역본을 더 넣으려면 `~/develop/SundayProject/assets/*_flat.json` 을 `assets/bible/` 에 복사하고 `lib/bible.ts VERSIONS` 에 추가.
- **성경 본문**: `sermon.scripture`, 예배 순서의 구절, 다음 주 본문을 탭하면 열림. 파서(`lib/bible.ts parseRef`)는 `고린도후서 3:1–6` `고후 3:3` `시편 100편` `2 Corinthians 3:1-6` `Psalm 100` 을 읽습니다.
- **설교 다시 듣기**: data.js `sermon.video`(YouTube 링크 → 앱으로 열기) / `sermon.audio`(mp3 → 앱 안에서 재생). 주보 설교 섹션과 노트 편집 화면 상단에 같이 나옵니다.
- **인쇄 주보와 맞추기**: 앱 주보 탭은 인쇄판 4면(표지 → Story Flow 4부 → 오늘의 말씀 → 설교 → 소식 → 모임/기도 → 다음 주/섬김/헌금 보고 → 연락처)을 그대로 세로로 따라갑니다. 노트 3단 질문 문구는 `lib/store.ts NOTE_STEPS` 와 `bulletin/index.html pageNotes()` 에 같이 있으니 바꿀 땐 둘 다 고치세요.
- **결단 팔로업 알림**: 노트의 Deep Story(결단) 를 저장하면 그 주 **수요일 20:00** 로컬 알림 예약 (`lib/notify.ts`). 알림을 누르면 그 노트로 이동. 결단을 지우면 알림도 취소. 웹에서는 동작 안 함.
- **지난 주보**: 앱이 본 주보(번들 + 서버)는 모두 기기에 쌓임 → 주보 탭 상단 "지난 주보".
- **일정**: data.js `events[]` → 교회 탭. "캘린더에 추가"는 기본 캘린더에 2시간 전 알림과 함께 생성 (expo-calendar, 웹 미지원).
- **한/영**: 교회 탭 → 언어. 주보는 `…En` 필드, UI 문구는 `lib/i18n.tsx` 사전. 영어 필드가 비면 한글이 보입니다.
- **로그인**: 선택 사항. Supabase 연결 시 나눔 글쓰기와 노트 텍스트 백업(`notes` 테이블)에 필요. 사진·손글씨는 백업하지 않습니다.

## 나눔 벽 (Supabase)
`.env` 에 URL/anon 키가 없으면 "이 기기에만 저장" 모드로 동작합니다. 연결 방법은 `supabase/README.md`.

## 배포
- 테스트: Expo Go (지금). 성도 배포: `eas build --platform ios` → TestFlight. (EAS 계정 필요, 아직 설정 안 함)
- 웹앱(PWA) 버전은 `../app-web/` 에 따로 있음 — 같은 기능을 브라우저/홈 화면 추가로 쓰는 버전.
