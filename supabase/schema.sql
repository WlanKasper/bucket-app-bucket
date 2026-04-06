create extension if not exists pgcrypto;

create table if not exists public.users (
  telegram_user_id text primary key,
  username text not null unique,
  first_name text,
  last_name text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.buckets (
  id uuid primary key default gen_random_uuid(),
  owner_telegram_id text not null references public.users (telegram_user_id) on delete cascade,
  owner_username text not null,
  name text not null,
  description text not null default '',
  items jsonb not null default '[]'::jsonb,
  shared_with text[] not null default '{}'::text[],
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists buckets_owner_idx on public.buckets (owner_telegram_id);
create index if not exists buckets_updated_idx on public.buckets (updated_at desc);
create index if not exists buckets_shared_with_idx on public.buckets using gin (shared_with);
