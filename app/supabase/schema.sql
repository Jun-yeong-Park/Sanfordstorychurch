-- ============================================================
-- Story App · Supabase 스키마 v2 (Apple 심사 요건 포함) — SQL Editor 에서 한 번 실행
--   profiles  : 로그인 사용자 (이메일 코드). 표시 이름, 약관 동의 버전, 정지 여부
--   posts     : 나눔 벽 — 읽기는 누구나(숨김 글 제외), 쓰기는 약관 동의한 로그인 사용자. 욕설 서버 필터.
--   reports   : 신고 — 접수 즉시 글 숨김(hidden), 관리자가 대시보드에서 검토
--   blocks    : 차단 — 차단한 사용자의 글은 RLS 로 아예 안 내려감
--   notes     : 말씀 노트 백업 (텍스트만) — 본인 행만
--   bulletins : 주보 JSON — 앱이 읽음 (쓰기는 scripts/push-bulletin.mjs, service 키)
--   RPC       : amen · accept_eula · delete_my_account
-- ============================================================

-- ---------- profiles ----------
create table if not exists profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  display_name  text,
  eula_version  int  not null default 0,     -- 1 = 현재 약관 동의함
  is_banned     boolean not null default false,
  created_at    timestamptz not null default now()
);
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin insert into profiles (id) values (new.id) on conflict do nothing; return new; end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();
revoke execute on function handle_new_user() from public, anon, authenticated;

alter table profiles enable row level security;
drop policy if exists profiles_own_read on profiles;
drop policy if exists profiles_own_update on profiles;
create policy profiles_own_read   on profiles for select using (auth.uid() = id);
create policy profiles_own_update on profiles for update using (auth.uid() = id) with check (auth.uid() = id);
revoke insert, update, delete on profiles from authenticated;
grant  update (display_name) on profiles to authenticated;

-- 글쓰기 가능한 사용자: 로그인 + 약관 동의 + 정지 아님
create or replace function can_post() returns boolean
language sql stable security definer set search_path = public as $$
  select auth.uid() is not null and exists (
    select 1 from profiles where id = auth.uid() and eula_version >= 1 and not is_banned);
$$;
create or replace function accept_eula() returns void
language sql security definer set search_path = public as $$
  update profiles set eula_version = 1 where id = auth.uid();
$$;
grant execute on function accept_eula() to authenticated;

-- ---------- 욕설 필터 (앱의 lib/moderation.ts 와 같은 목록) ----------
create or replace function contains_blocked_words(t text) returns boolean
language sql immutable as $$
  select lower(coalesce(t,'')) ~ (
    'fuck|shit|bitch|asshole|cunt|pussy|nigger|nigga|faggot|retard|whore|slut|porn|' ||
    '시발|씨발|씨팔|시팔|ㅅㅂ|ㅆㅂ|병신|ㅄ|ㅂㅅ|존나|좆|조까|개새끼|새끼야|미친년|미친놈|쳐죽|엿먹|닥쳐|뒤져라|디져라|창녀|창놈|섹스|tlqkf|느금마|니애미|씹새|씹년|씹할'
  );
$$;

-- ---------- posts ----------
create table if not exists posts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete set null,
  kind        text not null check (kind in ('share', 'prayer')),
  author      text not null check (char_length(author) between 1 and 20),
  body        text not null check (char_length(body) between 1 and 1000),
  issue       text,                          -- 주보 날짜 YYYY-MM-DD
  amen_count  int  not null default 0,
  hidden      boolean not null default false, -- 신고 접수 시 true (관리자가 검토 후 false 로 되돌리거나 삭제)
  created_at  timestamptz not null default now()
);
create index if not exists posts_created_idx on posts (created_at desc);

create or replace function posts_filter() returns trigger
language plpgsql as $$
begin
  if contains_blocked_words(new.body) or contains_blocked_words(new.author) then
    raise exception '부적절한 표현이 포함되어 있어 올릴 수 없습니다' using errcode = 'P0001';
  end if;
  return new;
end; $$;
drop trigger if exists posts_filter_trg on posts;
create trigger posts_filter_trg before insert on posts for each row execute function posts_filter();

alter table posts enable row level security;
drop policy if exists posts_read on posts;
drop policy if exists posts_insert on posts;
drop policy if exists posts_delete on posts;
-- 읽기: 숨김 글 제외 + 내가 차단한 사람 글 제외 (내 글은 숨겨져도 보임)
create policy posts_read on posts for select to anon, authenticated using (
  (not hidden or user_id = auth.uid())
  and (user_id is null or auth.uid() is null
       or user_id not in (select blocked_id from blocks where blocker_id = auth.uid()))
);
create policy posts_insert on posts for insert to authenticated with check (auth.uid() = user_id and can_post());
create policy posts_delete on posts for delete to authenticated using (auth.uid() = user_id);
revoke insert, update, delete on posts from anon, authenticated;
grant  insert (user_id, kind, author, body, issue) on posts to authenticated;
grant  delete on posts to authenticated;

create or replace function amen(post_id uuid) returns void
language sql security definer set search_path = public as $$
  update posts set amen_count = amen_count + 1 where id = post_id;
$$;
grant execute on function amen(uuid) to anon, authenticated;

-- ---------- reports (신고) ----------
create table if not exists reports (
  id               uuid primary key default gen_random_uuid(),
  reporter_id      uuid not null references auth.users(id) on delete cascade,
  post_id          uuid references posts(id) on delete cascade,
  reported_user_id uuid references auth.users(id) on delete set null,
  reason           text not null,             -- spam | hate | harassment | sexual | violence | other
  note             text,
  status           text not null default 'pending',   -- pending | reviewed | removed
  created_at       timestamptz not null default now()
);
alter table reports enable row level security;
drop policy if exists reports_own on reports;
create policy reports_own on reports for all to authenticated using (auth.uid() = reporter_id) with check (auth.uid() = reporter_id);

-- 신고가 들어오면 글을 즉시 숨긴다 (24시간 내 검토는 대시보드 Table Editor → reports 에서)
create or replace function hide_reported_post() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update posts set hidden = true where id = new.post_id;
  return new;
end; $$;
drop trigger if exists hide_reported_post_trg on reports;
create trigger hide_reported_post_trg after insert on reports for each row execute function hide_reported_post();

-- ---------- blocks (차단) ----------
create table if not exists blocks (
  blocker_id uuid not null references auth.users(id) on delete cascade,
  blocked_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id)
);
alter table blocks enable row level security;
drop policy if exists blocks_own on blocks;
create policy blocks_own on blocks for all to authenticated using (auth.uid() = blocker_id) with check (auth.uid() = blocker_id);

-- ---------- notes (백업) ----------
create table if not exists notes (
  user_id    uuid not null references auth.users(id) on delete cascade,
  issue      text not null,
  data       jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, issue)
);
alter table notes enable row level security;
drop policy if exists notes_own on notes;
create policy notes_own on notes for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------- bulletins ----------
create table if not exists bulletins (
  issue        text primary key,
  data         jsonb not null,
  published_at timestamptz not null default now()
);
alter table bulletins enable row level security;
drop policy if exists bulletins_read on bulletins;
create policy bulletins_read on bulletins for select to anon, authenticated using (true);

-- ---------- 계정 삭제 (Apple 5.1.1) ----------
create or replace function delete_my_account() returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  delete from auth.users where id = auth.uid();   -- profiles/notes/reports/blocks cascade, posts.user_id → null
end; $$;
grant execute on function delete_my_account() to authenticated;
