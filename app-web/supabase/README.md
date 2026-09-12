# 나눔 벽 켜기 (Supabase)

앱은 기본으로 "나눔"을 **이 기기에만** 저장합니다. 교회 전체가 서로 보게 하려면:

1. supabase.com 에서 프로젝트 생성 (리전: US East).
2. **SQL Editor** → `schema.sql` 내용 붙여넣고 실행.
3. **Project Settings → API** 에서 `Project URL` 과 `anon public` 키 복사.
4. `app/config.js` 의 `supabaseUrl`, `supabaseAnonKey` 에 붙여넣기.

끝. 새로고침하면 나눔 탭 상단의 "이 기기에만 저장" 안내가 사라집니다.

- `service_role` 키는 절대 앱에 넣지 마세요 (RLS 무시됨).
- 로그인 없이 이름만 적고 올리는 구조입니다. 링크를 아는 사람은 누구나 쓸 수 있으니 앱 주소는 성도들에게만 공유하세요.
- 글 삭제는 Supabase 대시보드 **Table Editor → posts** 에서 합니다.
