-- ==============================================================================
-- OmniTrack Life OS - Complete Supabase Schema Blueprint
-- Version: 1.0.0-MVP
-- Targets: PostgreSQL 15+ / Supabase Managed Cloud
-- Security: 100% Kernel-Level Row Level Security (RLS)
-- ==============================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. CUSTOM DOMAIN ENUMS
do $$ begin
    create type task_priority as enum ('urgent', 'high', 'medium', 'low');
exception
    when duplicate_object then null;
end $$;

do $$ begin
    create type task_status as enum ('pending', 'in_progress', 'completed');
exception
    when duplicate_object then null;
end $$;

do $$ begin
    create type expense_category as enum ('food', 'transport', 'tech', 'bills', 'leisure', 'other');
exception
    when duplicate_object then null;
end $$;

do $$ begin
    create type payment_method as enum ('upi', 'cash', 'card');
exception
    when duplicate_object then null;
end $$;

do $$ begin
    create type academic_type as enum ('assignment', 'lecture', 'quiz', 'exam', 'project');
exception
    when duplicate_object then null;
end $$;

do $$ begin
    create type academic_status as enum ('todo', 'submitted', 'graded');
exception
    when duplicate_object then null;
end $$;

-- 3. CORE APPLICATION TABLES

-- Tasks & Execution
create table if not exists public.tasks (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
    title text not null,
    description text,
    priority task_priority not null default 'medium',
    status task_status not null default 'pending',
    due_date timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Habits Catalog
create table if not exists public.habits (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
    title text not null,
    category text default 'routine',
    target_frequency text default 'daily',
    archived boolean not null default false,
    created_at timestamptz not null default now()
);

-- Habit Logs (1-tap daily toggles)
create table if not exists public.habit_logs (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
    habit_id uuid not null references public.habits(id) on delete cascade,
    log_date date not null default current_date,
    completed boolean not null default true,
    created_at timestamptz not null default now(),
    constraint uq_habit_user_date unique (habit_id, log_date)
);

-- Academics & Sprints
create table if not exists public.academics (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
    course_name text not null,
    title text not null,
    type academic_type not null default 'assignment',
    status academic_status not null default 'todo',
    deadline timestamptz not null,
    syllabus_url text,
    created_at timestamptz not null default now()
);

-- Expenses & Cash Flow
create table if not exists public.expenses (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
    amount numeric(10,2) not null check (amount > 0),
    category expense_category not null default 'food',
    payment_method payment_method not null default 'upi',
    note text,
    expense_date date not null default current_date,
    created_at timestamptz not null default now()
);

-- Dev Projects & Repos
create table if not exists public.projects (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
    title text not null,
    repo_url text,
    commit_count integer not null default 0,
    tech_stack text[] not null default '{}',
    active_milestone text,
    status text not null default 'active',
    created_at timestamptz not null default now()
);

-- Quick Scratchpad & Pinned Notes
create table if not exists public.notes (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
    title text not null default 'Quick Note',
    content text not null default '',
    is_pinned boolean not null default false,
    updated_at timestamptz not null default now(),
    created_at timestamptz not null default now()
);

-- 4. COMPOUND B-TREE INDICES FOR HIGH VELOCITY QUERIES
create index if not exists idx_tasks_user_status_due
    on public.tasks (user_id, status, due_date);

create index if not exists idx_habit_logs_lookup
    on public.habit_logs (user_id, habit_id, log_date);

create index if not exists idx_academics_deadline
    on public.academics (user_id, deadline)
    where status != 'submitted';

create index if not exists idx_expenses_user_date
    on public.expenses (user_id, expense_date desc);

create index if not exists idx_notes_user_pinned
    on public.notes (user_id, is_pinned desc, updated_at desc);

-- 5. ROW LEVEL SECURITY (RLS) POLICIES
alter table public.tasks enable row level security;
alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;
alter table public.academics enable row level security;
alter table public.expenses enable row level security;
alter table public.projects enable row level security;
alter table public.notes enable row level security;

-- Drop existing policies if re-running
drop policy if exists "Users manage their own tasks" on public.tasks;
drop policy if exists "Users manage their own habits" on public.habits;
drop policy if exists "Users manage their own habit logs" on public.habit_logs;
drop policy if exists "Users manage their own academics" on public.academics;
drop policy if exists "Users manage their own expenses" on public.expenses;
drop policy if exists "Users manage their own projects" on public.projects;
drop policy if exists "Users manage their own notes" on public.notes;

-- Standard tenant isolation policies
create policy "Users manage their own tasks"
    on public.tasks for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users manage their own habits"
    on public.habits for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users manage their own habit logs"
    on public.habit_logs for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users manage their own academics"
    on public.academics for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users manage their own expenses"
    on public.expenses for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users manage their own projects"
    on public.projects for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users manage their own notes"
    on public.notes for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- 6. ANALYTICAL ROLLUP VIEWS
create or replace view public.v_daily_expense_rollup as
select
    user_id,
    expense_date,
    count(*) as transaction_count,
    sum(amount) as daily_total,
    sum(case when category = 'food' then amount else 0 end) as food_total,
    sum(case when category = 'transport' then amount else 0 end) as transport_total,
    sum(case when category = 'tech' then amount else 0 end) as tech_total,
    sum(case when category = 'bills' then amount else 0 end) as bills_total,
    sum(case when category = 'leisure' then amount else 0 end) as leisure_total
from public.expenses
group by user_id, expense_date;

-- 7. REALTIME REPLICATION PUBLICATION
-- Enable realtime updates on tasks, habits, and expenses
alter publication supabase_realtime add table public.tasks;
alter publication supabase_realtime add table public.habit_logs;
alter publication supabase_realtime add table public.expenses;
