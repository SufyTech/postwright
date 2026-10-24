-- Run this once in Supabase: SQL Editor -> New query -> paste -> Run

create extension if not exists pgcrypto;

create table if not exists blog_sets (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  slug text not null unique,
  logo_url text,
  color text not null,
  created_at timestamptz not null default now()
);

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  set_id uuid not null references blog_sets(id) on delete cascade,
  position int not null,
  topic text not null,
  slug text not null,
  title text not null,
  body text not null default '',
  words int not null default 0,
  status text not null default 'waiting' check (status in ('waiting','writing','done','failed')),
  created_at timestamptz not null default now(),
  unique (set_id, slug)
);
create index if not exists posts_set_idx on posts(set_id, position);

-- The app talks to the database only from its server, using the service role key.
-- Turning RLS on with no policies keeps the tables closed to everyone else.
alter table blog_sets enable row level security;
alter table posts enable row level security;

-- Public bucket for company logos
insert into storage.buckets (id, name, public) values ('logos', 'logos', true)
on conflict (id) do nothing;
