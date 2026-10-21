-- TypeQuest cloud progress and public leaderboard.
-- All private save rows are owner-only. Leaderboard rows expose only a player display name and aggregate stats.
create table if not exists public.typequest_player_saves (
  user_id uuid primary key references auth.users (id) on delete cascade,
  player_data jsonb not null default '{}'::jsonb
    check (jsonb_typeof(player_data) = 'object'),
  updated_at timestamptz not null default now()
);

alter table public.typequest_player_saves enable row level security;
revoke all on table public.typequest_player_saves from anon, authenticated;
grant select, insert, update, delete on table public.typequest_player_saves to authenticated;

drop policy if exists "Players can read their own save" on public.typequest_player_saves;
create policy "Players can read their own save"
  on public.typequest_player_saves for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Players can create their own save" on public.typequest_player_saves;
create policy "Players can create their own save"
  on public.typequest_player_saves for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Players can update their own save" on public.typequest_player_saves;
create policy "Players can update their own save"
  on public.typequest_player_saves for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Players can delete their own save" on public.typequest_player_saves;
create policy "Players can delete their own save"
  on public.typequest_player_saves for delete to authenticated
  using ((select auth.uid()) = user_id);


create table if not exists public.typequest_leaderboard (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default 'Player'
    check (char_length(display_name) between 1 and 40),
  best_wpm integer not null default 0
    check (best_wpm between 0 and 500),
  level integer not null default 1
    check (level >= 1),
  tests_completed integer not null default 0
    check (tests_completed >= 0),
  updated_at timestamptz not null default now()
);

alter table public.typequest_leaderboard enable row level security;
revoke all on table public.typequest_leaderboard from anon, authenticated;
grant select, insert, update, delete on table public.typequest_leaderboard to authenticated;

drop policy if exists "Signed-in players can view leaderboard" on public.typequest_leaderboard;
create policy "Signed-in players can view leaderboard"
  on public.typequest_leaderboard for select to authenticated
  using (true);

drop policy if exists "Players can create their own leaderboard entry" on public.typequest_leaderboard;
create policy "Players can create their own leaderboard entry"
  on public.typequest_leaderboard for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Players can update their own leaderboard entry" on public.typequest_leaderboard;
create policy "Players can update their own leaderboard entry"
  on public.typequest_leaderboard for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Players can delete their own leaderboard entry" on public.typequest_leaderboard;
create policy "Players can delete their own leaderboard entry"
  on public.typequest_leaderboard for delete to authenticated
  using ((select auth.uid()) = user_id);
