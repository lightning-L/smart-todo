-- Run this in Supabase SQL Editor after creating your project.
-- Tables for sync: tasks and daily_logs, with RLS so each user only sees their own rows.

-- Tasks (same shape as app Task + user_id)
create table if not exists public.tasks (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default '',
  type text not null default 'task' check (type in ('task', 'project', 'habit_daily', 'ongoing')),
  status text not null default 'active' check (status in ('active', 'completed', 'archived')),
  parent_id text,
  scheduled_at timestamptz,
  deadline_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null,
  updated_at timestamptz not null
);

-- Daily logs
create table if not exists public.daily_logs (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  task_id text not null,
  date text not null,
  did boolean not null default true,
  note text,
  created_at timestamptz not null,
  updated_at timestamptz not null
);

-- RLS: users can only read/write their own rows
alter table public.tasks enable row level security;
alter table public.daily_logs enable row level security;

create policy "tasks_select" on public.tasks for select using (auth.uid() = user_id);
create policy "tasks_insert" on public.tasks for insert with check (auth.uid() = user_id);
create policy "tasks_update" on public.tasks for update using (auth.uid() = user_id);
create policy "tasks_delete" on public.tasks for delete using (auth.uid() = user_id);

create policy "daily_logs_select" on public.daily_logs for select using (auth.uid() = user_id);
create policy "daily_logs_insert" on public.daily_logs for insert with check (auth.uid() = user_id);
create policy "daily_logs_update" on public.daily_logs for update using (auth.uid() = user_id);
create policy "daily_logs_delete" on public.daily_logs for delete using (auth.uid() = user_id);
