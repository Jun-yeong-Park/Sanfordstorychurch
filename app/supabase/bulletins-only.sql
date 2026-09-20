-- ============================================================
-- Story App · 주보만 서버로 (로그인 없음 버전) — SQL Editor 에서 한 번 실행
--   bulletins : 주보 JSON. 앱은 anon 키로 읽기만, 쓰기는 scripts/push-bulletin.mjs (service_role 키, 내 컴퓨터에서만)
--   나눔 벽·로그인·신고 테이블은 나중에 필요할 때 schema.sql 을 추가로 실행하면 됩니다.
-- ============================================================
create table if not exists bulletins (
  issue        text primary key,             -- YYYY-MM-DD
  data         jsonb not null,               -- bulletin/data.js 의 BULLETIN 객체 그대로
  published_at timestamptz not null default now()
);
alter table bulletins enable row level security;
drop policy if exists bulletins_read on bulletins;
create policy bulletins_read on bulletins for select to anon, authenticated using (true);
