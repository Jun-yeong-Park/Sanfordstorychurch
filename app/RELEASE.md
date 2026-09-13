# 출시 절차 — Story App (iOS)

주은혜 앱(GraceApp)과 같은 흐름입니다. **순서대로** 하세요. `⌨` 표시는 터미널에서 직접 실행.

## 0. 준비된 것 (이미 되어 있음)
- `app.json`: `com.sanfordstorychurch.app`, v1.0.0, EAS projectId `0200ab46-…`, 권한 문구, 암호화 면제, 스플래시
- `eas.json`: production / preview(시뮬레이터) 프로필, submit 에 Apple ID `apfnd161@naver.com`
- Apple 1.2(UGC) 요건: 약관 동의 모달(첫 글 전) · 욕설 필터(앱+서버) · 글 신고(즉시 숨김) · 작성자 차단 · 내 글 삭제 · 차단 목록 · 계정 삭제(5.1.1) · 개인정보처리방침/이용약관 페이지
- 개인정보처리방침: https://sanfordstorychurch.com/privacy · 이용약관: https://sanfordstorychurch.com/terms (web/app/ — main push 시 Netlify 배포)
- 스토어 문구: `store/STORE_LISTING.md` · 스크린샷: `store/screenshots/` (6.9")

## 1. Supabase (10분)
1. https://supabase.com → New project (이름 `sanford-story`, 리전 **US East**, DB 비밀번호 저장)
2. **SQL Editor** → `supabase/schema.sql` 전체 붙여넣고 Run
3. **Authentication → Providers → Email** 켜기. **Email Templates → Magic Link** 본문에 `{{ .Token }}` 넣기:
   ```html
   <h2>스토리교회 로그인 코드</h2><p style="font-size:28px;letter-spacing:6px"><strong>{{ .Token }}</strong></p><p>10분 안에 입력해 주세요.</p>
   ```
4. **Authentication → Users → Add user** (Auto Confirm 켜기) 로 심사용 계정 2개:
   - `reviewer@sanfordstorychurch.com` / `StoryReview2026!`
   - `member@sanfordstorychurch.com` / `StoryMember2026!`
5. **SQL Editor** → `supabase/seed_review_demo.sql` Run (두 계정이 서로 글을 남겨 둠 → 리뷰어가 ⋯ 신고/차단 버튼을 볼 수 있음)
6. **Project Settings → API** 에서 `Project URL`, `anon public` 키 복사 →
   - `eas.json` 의 `PUT_SUPABASE_URL_HERE` / `PUT_SUPABASE_ANON_KEY_HERE` 두 군데(preview, production) 교체
   - 로컬 테스트용 `.env` 에도 같은 값 (`.env.example` 참고). **service_role 키는 어디에도 넣지 말 것.**
7. (권장) 내장 메일은 시간당 2~3통 한계 → **Project Settings → Auth → SMTP** 에 Resend 연결 (junyeongpark96@gmail.com 계정 있음)

## 2. App Store Connect (5분)
1. https://developer.apple.com → Identifiers → 번들 ID `com.sanfordstorychurch.app` 등록 (App ID, Push Notifications 켜기)
2. https://appstoreconnect.apple.com → My Apps → **+** → 이름 `스토리교회 Story Church`, 언어 한국어, 번들 ID 위 것, SKU `sanford-story-app`
3. 만들어진 앱의 URL 에서 숫자 ID (`/apps/1234567890/`) → `eas.json` 의 `PUT_ASC_APP_ID_HERE` 교체

## 3. 빌드 · 제출 ⌨
```bash
cd ~/develop/sanford/app
./sync.sh                                    # 주보 최신화
npx eas-cli build --platform ios --profile production   # 15~25분, 클라우드
npx eas-cli submit --platform ios --latest    # Apple ID 로그인 프롬프트 → 터미널에서 직접
```
(시뮬레이터로 먼저 확인하려면 `npx eas-cli build -p ios --profile preview` → 받은 .tar.gz 풀고 `xcrun simctl install booted <app>`)

## 4. App Store Connect 입력
`store/STORE_LISTING.md` 의 문구를 그대로 붙여넣고, `store/screenshots/*.png` (6.9") 업로드.
- **App Review Information → Sign-in required: YES** — 계정 `member@sanfordstorychurch.com` / `StoryMember2026!` 입력, 메모(STORE_LISTING.md "심사 메모") 붙여넣기
- 개인정보 URL, 지원 URL 입력 · 연령 4+ · 카테고리 Lifestyle
- App Privacy: STORE_LISTING.md 표대로
- Export compliance: 암호화 없음(app.json 에 이미 설정됨)

## 5. 제출 후
- 신고 검토: Supabase → Table Editor → `reports`(pending) · `posts`(hidden=true). 24시간 안에 삭제하거나 `hidden=false` 로 복구. 정지: `profiles.is_banned=true`.
- 매주 주보: `bulletin/data.js` 고치고 `SUPABASE_URL=… SUPABASE_SERVICE_KEY=… npm run push-bulletin` → 앱 업데이트 없이 반영.
- JS 만 바뀐 수정은 나중에 `expo-updates` 붙이면 심사 없이 배포 가능 (아직 미설정).

## 리젝 방지 체크 (주은혜 앱에서 실제로 걸렸던 것)
- [ ] 리뷰어 계정으로 로그인했을 때 **남이 쓴 글**이 있어서 ⋯(신고/차단)이 보이는가 → seed_review_demo.sql
- [ ] 글의 `user_id` 가 null 이 아닌가 (차단 버튼 조건) → schema 의 insert 정책이 `auth.uid() = user_id` 강제
- [ ] 차단 목록 화면이 열리는가 → 교회 탭 → 내 계정 → 차단한 사용자
- [ ] 계정 삭제가 실제로 지우는가 → `delete_my_account()` RPC
