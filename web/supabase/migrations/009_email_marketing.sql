-- Email Marketing — Tables for marketing email system
-- Run this in Supabase Dashboard → SQL Editor → New Query → paste → Run

-- ============================================================
-- 1. EMAIL PREFERENCES TABLE
-- Tracks marketing email opt-out per user (null = subscribed)
-- ============================================================

create table public.email_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  marketing_unsubscribed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.email_preferences enable row level security;

create policy "Users can view their own email preferences"
  on public.email_preferences for select
  using (auth.uid() = user_id);

create policy "Users can insert their own email preferences"
  on public.email_preferences for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own email preferences"
  on public.email_preferences for update
  using (auth.uid() = user_id);


-- ============================================================
-- 2. EMAIL SEND LOGS TABLE
-- Audit trail for marketing email blasts
-- No RLS — only accessed via service role key
-- ============================================================

create table public.email_send_logs (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  preview_text text,
  html_content text,
  recipient_count integer not null default 0,
  success_count integer not null default 0,
  failure_count integer not null default 0,
  status text not null default 'draft' check (status in ('draft', 'sending', 'completed', 'failed')),
  sent_by uuid references auth.users(id),
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_email_send_logs_created on public.email_send_logs(created_at desc);
