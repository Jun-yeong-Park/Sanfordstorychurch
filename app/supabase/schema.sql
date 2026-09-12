-- ============================================================
-- Story App · Supabase 스키마 (SQL Editor 에서 한 번 실행)
--   profiles  : 로그인 사용자 (이메일 코드 로그인, faith-tracker 와 같은 방식). 표시 이름만 사용자가 고침.
--   posts     : 나눔 벽 — 누구나 읽기, 글쓰기는 로그인. 아멘은 amen() 으로만.
--   notes     : 설교 노트 백업 (텍스트만) — 본인 행만.
--   bulletins : 주보 JSON — 앱이 최신 52건을 읽음 (쓰기는 scripts/push-bulletin.mjs, service 키)
-- ============================================================
create table profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at   timestamptz not null default now()
);
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin insert into profiles (id) values (new.id); return new; end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();
revoke execute on function handle_new_user() from public, anon, authenticated;

alter table profiles enable row level security;
create policy profiles_own_read   on profiles for select using (auth.uid() = id);
create policy profiles_own_update on profiles for update using (auth.uid() = id) with check (auth.uid() = id);
revoke insert, update, delete on profiles from authenticated;
grant  update (display_name) on profiles to authenticated;

create table posts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete set null,
  kind        text not null check (kind in ('share', 'prayer')),
  author      text not null check (char_length(author) between 1 and 20),
  body        text not null check (char_length(body) between 1 and 1000),
  issue       text,                          -- 주보 날짜 YYYY-MM-DD
  amen_count  int  not null default 0,
  created_at  timestamptz not null default now()
);
create index posts_created_idx on posts (created_at desc);

alter table posts enable row level security;
create policy posts_read   on posts for select to anon, authenticated using (true);
create policy posts_insert on posts for insert to authenticated with check (auth.uid() = user_id);
revoke insert, update, delete on posts from anon, authenticated;
grant  insert (user_id, kind, author, body, issue) on posts to authenticated;

create or replace function amen(post_id uuid)
returns void language sql security definer set search_path = public as $$
  update posts set amen_count = amen_count + 1 where id = post_id;
$$;
grant execute on function amen(uuid) to anon, authenticated;

create table notes (
  user_id    uuid not null references auth.users(id) on delete cascade,
  issue      text not null,
  data       jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, issue)
);
alter table notes enable row level security;
create policy notes_own on notes for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table bulletins (
  issue        text primary key,             -- YYYY-MM-DD
  data         jsonb not null,               -- bulletin/data.js 의 BULLETIN 객체 그대로
  published_at timestamptz not null default now()
);
alter table bulletins enable row level security;
create policy bulletins_read on bulletins for select to anon, authenticated using (true);
