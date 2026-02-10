-- Kindle Sender — Database Setup
-- Run this in Supabase Dashboard → SQL Editor → New Query → paste → Run
-- Creates all tables + Row Level Security policies

-- ============================================================
-- 1. ARTICLES TABLE
-- Stores extracted articles queued for sending to Kindle
-- ============================================================

create table public.articles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  url text not null,
  title text,
  author text,
  content text,
  status text not null default 'queued' check (status in ('queued', 'sent', 'failed')),
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

-- Index for fast lookups by user + status (the most common query)
create index idx_articles_user_status on public.articles(user_id, status);

-- RLS: users can only see and manage their own articles
alter table public.articles enable row level security;

create policy "Users can view their own articles"
  on public.articles for select
  using (auth.uid() = user_id);

create policy "Users can insert their own articles"
  on public.articles for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own articles"
  on public.articles for update
  using (auth.uid() = user_id);

create policy "Users can delete their own articles"
  on public.articles for delete
  using (auth.uid() = user_id);


-- ============================================================
-- 2. SEND HISTORY TABLE
-- Logs each send-to-Kindle attempt with status
-- ============================================================

create table public.send_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  article_count integer not null,
  status text not null default 'success' check (status in ('success', 'failed')),
  error_message text,
  sent_at timestamptz not null default now()
);

create index idx_send_history_user on public.send_history(user_id, sent_at desc);

-- RLS: users can only see their own send history
alter table public.send_history enable row level security;

create policy "Users can view their own send history"
  on public.send_history for select
  using (auth.uid() = user_id);

create policy "Users can insert their own send history"
  on public.send_history for insert
  with check (auth.uid() = user_id);


-- ============================================================
-- 3. SETTINGS TABLE
-- One row per user — Kindle email, SMTP config, auto-send prefs
-- ============================================================

create table public.settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  kindle_email text,
  sender_email text,
  smtp_password text,
  auto_send_threshold integer,
  schedule_day text check (schedule_day in (
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
  )),
  schedule_time time,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS: users can only access their own settings
alter table public.settings enable row level security;

create policy "Users can view their own settings"
  on public.settings for select
  using (auth.uid() = user_id);

create policy "Users can insert their own settings"
  on public.settings for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own settings"
  on public.settings for update
  using (auth.uid() = user_id);


-- ============================================================
-- 4. AUTO-UPDATE updated_at ON SETTINGS
-- Keeps updated_at current whenever a row changes
-- ============================================================

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_settings_updated
  before update on public.settings
  for each row
  execute function public.handle_updated_at();
