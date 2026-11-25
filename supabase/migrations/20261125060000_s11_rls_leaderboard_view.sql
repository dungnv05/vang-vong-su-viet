-- S-11 (vang-vong-su-viet): owner-only RLS + minimal leaderboard
-- Decision: Yun 2026-11-25 13:16 ICT, "làm 1 view cho bảng xếp hạng các thông tin cần thiết thôi"
-- DRAFT: Security Bot reviews before apply; applying to prod needs Yun's own words.
-- Idempotent: safe to run more than once.
begin;

-- ---------------------------------------------------------------------------
-- 1. Owner-only RLS on the three player tables
-- ---------------------------------------------------------------------------
alter table public.player_profiles enable row level security;
alter table public.player_heroes   enable row level security;
alter table public.player_shards   enable row level security;

-- Legacy open policies from supabase/schema.sql (FOR ALL USING (true) WITH CHECK (true))
drop policy if exists "Cho phép tất cả người chơi đọc ghi dữ liệu" on public.player_profiles;
drop policy if exists "Cho phép đọc ghi danh sách tướng"           on public.player_heroes;
drop policy if exists "Cho phép đọc ghi mảnh tướng"                on public.player_shards;

-- player_profiles: owner column = id (text, holds auth.users.id)
drop policy if exists player_profiles_select_own on public.player_profiles;
drop policy if exists player_profiles_insert_own on public.player_profiles;
drop policy if exists player_profiles_update_own on public.player_profiles;
drop policy if exists player_profiles_delete_own on public.player_profiles;
create policy player_profiles_select_own on public.player_profiles
  for select to authenticated using ((select auth.uid())::text = id);
create policy player_profiles_insert_own on public.player_profiles
  for insert to authenticated with check ((select auth.uid())::text = id);
create policy player_profiles_update_own on public.player_profiles
  for update to authenticated using ((select auth.uid())::text = id)
  with check ((select auth.uid())::text = id);
create policy player_profiles_delete_own on public.player_profiles
  for delete to authenticated using ((select auth.uid())::text = id);

-- player_heroes: owner column = player_id
drop policy if exists player_heroes_select_own on public.player_heroes;
drop policy if exists player_heroes_insert_own on public.player_heroes;
drop policy if exists player_heroes_update_own on public.player_heroes;
drop policy if exists player_heroes_delete_own on public.player_heroes;
create policy player_heroes_select_own on public.player_heroes
  for select to authenticated using ((select auth.uid())::text = player_id);
create policy player_heroes_insert_own on public.player_heroes
  for insert to authenticated with check ((select auth.uid())::text = player_id);
create policy player_heroes_update_own on public.player_heroes
  for update to authenticated using ((select auth.uid())::text = player_id)
  with check ((select auth.uid())::text = player_id);
create policy player_heroes_delete_own on public.player_heroes
  for delete to authenticated using ((select auth.uid())::text = player_id);

-- player_shards: owner column = player_id
drop policy if exists player_shards_select_own on public.player_shards;
drop policy if exists player_shards_insert_own on public.player_shards;
drop policy if exists player_shards_update_own on public.player_shards;
drop policy if exists player_shards_delete_own on public.player_shards;
create policy player_shards_select_own on public.player_shards
  for select to authenticated using ((select auth.uid())::text = player_id);
create policy player_shards_insert_own on public.player_shards
  for insert to authenticated with check ((select auth.uid())::text = player_id);
create policy player_shards_update_own on public.player_shards
  for update to authenticated using ((select auth.uid())::text = player_id)
  with check ((select auth.uid())::text = player_id);
create policy player_shards_delete_own on public.player_shards
  for delete to authenticated using ((select auth.uid())::text = player_id);

-- Table grants. anon: nothing. authenticated: DML only.
-- TRUNCATE is not subject to RLS, so it must not stay granted (schema.sql had GRANT ALL).
revoke all on table public.player_profiles, public.player_heroes, public.player_shards from anon;
revoke all on table public.player_profiles, public.player_heroes, public.player_shards from authenticated;
grant select, insert, update, delete
  on table public.player_profiles, public.player_heroes, public.player_shards to authenticated;

-- player_shards.id is serial: inserts need USAGE on the sequence; no setval (UPDATE) for clients.
revoke all on sequence public.player_shards_id_seq from anon;
revoke all on sequence public.player_shards_id_seq from authenticated;
grant usage, select on sequence public.player_shards_id_seq to authenticated;

-- ---------------------------------------------------------------------------
-- 2. Leaderboard
-- Owner-only RLS hides other players' rows from any security-invoker read, so the
-- cross-player read is done by one SECURITY DEFINER function (owner postgres,
-- empty search_path, fixed column list, no input that reaches SQL text).
-- A thin security_invoker view on top gives the client the "view" Yun asked for
-- without a SECURITY DEFINER view (flagged by the Supabase security advisor).
-- display_name never returns an email: names containing '@' (the client used to
-- store the email as player_name) or over 40 chars are replaced by a hash tag.
-- ---------------------------------------------------------------------------
create or replace function public.get_vang_vong_leaderboard(p_limit integer default 10)
returns table (
  rank               bigint,
  display_name       text,
  max_unlocked_stage integer,
  pvp_score          integer
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    row_number() over (
      order by p.max_unlocked_stage desc, p.pvp_score desc, p.last_synced_at asc nulls last
    ) as rank,
    case
      when p.player_name is null
        or btrim(p.player_name) = ''
        or strpos(p.player_name, '@') > 0
        or char_length(p.player_name) > 40
      then 'Anh Hùng #' || upper(right(md5(p.id), 4))
      else btrim(p.player_name)
    end as display_name,
    p.max_unlocked_stage,
    p.pvp_score
  from public.player_profiles p
  order by 1
  limit least(greatest(coalesce(p_limit, 10), 1), 100);
$$;

alter function public.get_vang_vong_leaderboard(integer) owner to postgres;
revoke all on function public.get_vang_vong_leaderboard(integer) from public, anon, authenticated;
grant execute on function public.get_vang_vong_leaderboard(integer) to authenticated;

create or replace view public.vang_vong_leaderboard
  with (security_invoker = true, security_barrier = true)
as
  select rank, display_name, max_unlocked_stage, pvp_score
  from public.get_vang_vong_leaderboard(100);

alter view public.vang_vong_leaderboard owner to postgres;
revoke all on table public.vang_vong_leaderboard from public, anon, authenticated;
grant select on table public.vang_vong_leaderboard to authenticated;

commit;
