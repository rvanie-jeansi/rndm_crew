-- Схема для облачной синхронизации RANDOM.
-- Запусти этот скрипт в Supabase: SQL Editor -> New query -> Run.

-- Профиль пользователя (одна строка на пользователя)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  emoji text not null,
  interests text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- Статистика (одна строка на пользователя)
create table if not exists public.stats (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  total_adventures integer not null default 0,
  completed_adventures integer not null default 0,
  total_distance_meters integer not null default 0,
  total_places_visited integer not null default 0,
  total_tasks_done integer not null default 0,
  xp integer not null default 0,
  achievements text[] not null default '{}',
  updated_at timestamptz not null default now()
);

-- Приключения
create table if not exists public.adventures (
  id text primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  emoji text not null,
  time_budget text not null,
  money_budget text not null,
  scenario_id text,
  status text not null,
  created_at text not null,
  completed_at text,
  total_distance_meters integer not null default 0,
  walked_distance_meters integer not null default 0,
  tasks jsonb not null default '[]'::jsonb
);

-- Посещённые места
create table if not exists public.visited_places (
  id text primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  lat double precision not null,
  lng double precision not null,
  name text,
  visited_at text not null,
  adventure_id text
);

-- RLS: каждый пользователь видит и меняет только свои данные
alter table public.profiles enable row level security;
alter table public.stats enable row level security;
alter table public.adventures enable row level security;
alter table public.visited_places enable row level security;

create policy "own profile"
  on public.profiles for all
  using (auth.uid() = id) with check (auth.uid() = id);

create policy "own stats"
  on public.stats for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own adventures"
  on public.adventures for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own places"
  on public.visited_places for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- При создании профиля сразу заводим строку статистики
create or replace function public.handle_new_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.stats (user_id)
  values (new.id);
  return new;
end;
$$;

create trigger on_profile_created
  after insert on public.profiles
  for each row execute function public.handle_new_profile();

-- Анонимная авторизация должна быть включена:
-- Authentication -> Sign In / Up -> Anonymous sign-ins -> ON