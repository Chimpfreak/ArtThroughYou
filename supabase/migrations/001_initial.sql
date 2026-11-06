create extension if not exists pgcrypto;
create table if not exists public.journeys (
  id uuid primary key default gen_random_uuid(),
  visitor_name text not null check (char_length(visitor_name) <= 40),
  current_era integer not null default 1 check (current_era between 1 and 5),
  status text not null default 'active' check (status in ('active','completed')),
  narrative_state jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create table if not exists public.chapters (
  id uuid primary key default gen_random_uuid(),
  journey_id uuid not null references public.journeys(id) on delete cascade,
  era_number integer not null check (era_number between 1 and 5),
  era_name text not null,
  story text not null,
  choices jsonb not null default '[]'::jsonb,
  selected_choice text,
  historical_context jsonb not null default '[]'::jsonb,
  status text not null default 'ready',
  created_at timestamptz not null default now(),
  unique(journey_id, era_number)
);
create table if not exists public.artworks (
  id uuid primary key default gen_random_uuid(),
  journey_id uuid not null references public.journeys(id) on delete cascade,
  chapter_id uuid not null references public.chapters(id) on delete cascade,
  era_number integer not null check (era_number between 1 and 5),
  image_url text,
  prompt text not null,
  status text not null default 'pending' check (status in ('pending','generating','ready','failed')),
  created_at timestamptz not null default now(),
  unique(journey_id, era_number)
);
create index if not exists chapters_journey_idx on public.chapters(journey_id, era_number);
create index if not exists artworks_journey_idx on public.artworks(journey_id, era_number);
-- Starter schema only. Add ownership and RLS before enabling remote persistence.
