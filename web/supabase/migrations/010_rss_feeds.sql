-- RSS Feeds table: one row per user subscription, articles cached as JSONB
create table public.rss_feeds (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  feed_url text not null,
  title text not null,
  site_url text,
  color text not null,
  items_cache jsonb not null default '[]'::jsonb,
  last_fetched_at timestamptz,
  created_at timestamptz not null default now(),
  unique(user_id, feed_url)
);

create index idx_rss_feeds_user on public.rss_feeds(user_id);
alter table public.rss_feeds enable row level security;

-- RLS: users can only touch their own feeds
create policy "select own" on public.rss_feeds for select using (auth.uid() = user_id);
create policy "insert own" on public.rss_feeds for insert with check (auth.uid() = user_id);
create policy "update own" on public.rss_feeds for update using (auth.uid() = user_id);
create policy "delete own" on public.rss_feeds for delete using (auth.uid() = user_id);
