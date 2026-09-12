# Supabase 연결

앱은 Supabase 없이도 뜹니다 (주보 = 번들 데이터, 나눔 = 이 기기에만 저장).
교회 전체가 나눔을 함께 보고, 앱 업데이트 없이 매주 주보를 내보내려면:

1. supabase.com 에서 프로젝트 생성 (리전: US East).
2. **SQL Editor** → `schema.sql` 붙여넣고 실행.
3. **Project Settings → API** 에서 `Project URL` 과 `anon public` 키 복사 → 프로젝트 루트 `.env`:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ…
   ```
4. **Authentication → Providers → Email** 켜고, **Email Templates → Magic Link** 본문에 `{{ .Token }}` 을 넣습니다 (앱은 6자리 코드 로그인 — 기본 템플릿엔 코드가 없음).
   ```html
   <h2>스토리교회 로그인 코드</h2><p style="font-size:28px;letter-spacing:6px"><strong>{{ .Token }}</strong></p><p>10분 안에 입력해 주세요.</p>
   ```
   내장 메일은 시간당 2~3통 한계 — 성도들에게 열기 전에 **Custom SMTP**(Resend 등)를 붙이세요.
5. `npx expo start` 재시작. 나눔 탭 상단의 "이 기기에만 저장" 안내가 사라지면 연결된 것.

## 매주 주보 내보내기

`../bulletin/data.js` 를 고친 뒤:
```
SUPABASE_URL=https://xxxx.supabase.co SUPABASE_SERVICE_KEY=eyJ… npm run push-bulletin
```
앱은 켤 때마다 `bulletins` 에서 최신 주보를 읽습니다 (번들보다 오래된 건 무시).
`service_role` 키는 이 스크립트(내 컴퓨터)에서만 쓰고 앱 코드·.env 에는 절대 넣지 마세요.

## 운영 메모
- 나눔 글쓰기와 노트 백업은 로그인(이메일 코드)한 사람만. 읽기는 누구나.
- 글 삭제: 대시보드 **Table Editor → posts**. 표시 이름은 앱 교회 탭 → 내 계정에서 사용자가 바꿉니다.
