-- ============================================================
-- Story App · 나눔 벽 (posts)
--   Supabase SQL Editor 에서 한 번 실행. 로그인 없이 anon 키로 읽기/쓰기.
--   아멘 카운트는 클라이언트가 직접 못 고치고 amen() 함수로만 올린다.
-- ============================================================
create table posts (
  id          uuid primary key default gen_random_uuid(),
  kind        text not null check (kind in ('share', 'prayer')),
  author      text not null check (char_length(author) between 1 and 20),
  body        text not null check (char_length(body) between 1 and 1000),
  issue       text,                          -- 주보 날짜 YYYY-MM-DD (없을 수 있음)
  amen_count  int  not null default 0,
  created_at  timestamptz not null default now()
);
create index posts_created_idx on posts (created_at desc);

alter table posts enable row level security;
create policy posts_read   on posts for select to anon using (true);
create policy posts_insert on posts for insert to anon with check (true);

revoke insert, update, delete on posts from anon;
grant  insert (kind, author, body, issue) on posts to anon;

create or replace function amen(post_id uuid)
returns void language sql security definer set search_path = public as $$
  update posts set amen_count = amen_count + 1 where id = post_id;
$$;
grant execute on function amen(uuid) to anon;
