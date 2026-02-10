-- Add read time and description to articles table
-- Run this in Supabase Dashboard > SQL Editor > New Query > paste > Run

alter table public.articles add column read_time_minutes integer;
alter table public.articles add column description text;
