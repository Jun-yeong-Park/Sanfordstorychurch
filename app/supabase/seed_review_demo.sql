-- ============================================================
-- Apple 심사용 데모 데이터 — schema.sql 실행 후, 대시보드에서 아래 두 계정을 먼저 만든 다음 실행
--   Authentication → Users → Add user → "Create new user" (Auto Confirm 켜기)
--     reviewer@sanfordstorychurch.com / StoryReview2026!
--     member@sanfordstorychurch.com   / StoryMember2026!
-- 이유: 신고·차단 버튼(⋯)은 "남이 쓴 글"에만 뜬다. 리뷰어가 어느 계정으로 들어와도
--       남의 글이 보이도록 두 계정이 서로 글을 남겨 둔다.
-- ============================================================
do $$
declare
  r uuid := (select id from auth.users where email = 'reviewer@sanfordstorychurch.com');
  m uuid := (select id from auth.users where email = 'member@sanfordstorychurch.com');
begin
  if r is null or m is null then raise exception '두 데모 계정을 먼저 만드세요'; end if;
  update profiles set display_name = 'Reviewer', eula_version = 1 where id = r;
  update profiles set display_name = '박준영',   eula_version = 1 where id = m;
  insert into posts (user_id, kind, author, body, issue)
  select m, 'share', '박준영', '오늘 말씀 중 "먹으로가 아니라 성령으로" 라는 말이 마음에 남았어요. 이번 주는 말보다 삶으로 편지가 되고 싶습니다.', '2026-09-27'
  where not exists (select 1 from posts where user_id = m and kind = 'share');
  insert into posts (user_id, kind, author, body, issue)
  select m, 'prayer', '박준영', '비행학교 시험을 앞둔 친구를 위해 함께 기도해 주세요.', '2026-09-27'
  where not exists (select 1 from posts where user_id = m and kind = 'prayer');
  insert into posts (user_id, kind, author, body, issue)
  select r, 'share', 'Reviewer', 'Grateful for the first Sunday at Story Church. Thank you for the warm welcome.', '2026-09-27'
  where not exists (select 1 from posts where user_id = r);
end $$;
