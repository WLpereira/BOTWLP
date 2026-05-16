create extension if not exists "pgcrypto";

create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  price_cents integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  password text,
  role text not null check (role in ('ADMIN_MASTER', 'CLIENTE')),
  active boolean not null default true,
  temporary_password text,
  must_change_password boolean not null default true,
  plan_id uuid references public.plans(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.whatsapp_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  phone_number text,
  status text not null default 'DISCONNECTED',
  created_at timestamptz not null default now()
);

create table if not exists public.bot_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  direction text not null check (direction in ('IN', 'OUT')),
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.bot_questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  prompt text not null,
  response text not null,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.finance_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  amount_cents integer not null,
  status text not null default 'PENDING',
  due_date date,
  created_at timestamptz not null default now()
);

-- Backward-compatible migrations for existing databases
alter table if exists public.whatsapp_sessions
  add column if not exists phone_number text;

alter table if exists public.whatsapp_sessions
  add column if not exists status text not null default 'DISCONNECTED';

do $$
begin
  if to_regclass('public.whatsapp_sessions') is not null and not exists (
    select 1
    from pg_constraint c
    where c.conname = 'whatsapp_sessions_status_check'
      and c.conrelid = 'public.whatsapp_sessions'::regclass
  ) then
    alter table public.whatsapp_sessions
      add constraint whatsapp_sessions_status_check
      check (status in ('DISCONNECTED', 'CONNECTING', 'CONNECTED')) not valid;
  end if;
end
$$;

alter table if exists public.bot_questions
  add column if not exists active boolean not null default true;

alter table if exists public.bot_questions
  add column if not exists sort_order integer not null default 0;

create index if not exists idx_users_role on public.users(role);
create index if not exists idx_users_active on public.users(active);
create index if not exists idx_whatsapp_sessions_user_id on public.whatsapp_sessions(user_id);
drop index if exists uq_whatsapp_sessions_instance_name;
create unique index if not exists uq_whatsapp_sessions_phone_number on public.whatsapp_sessions(phone_number) where phone_number is not null;
create unique index if not exists uq_whatsapp_sessions_user_id on public.whatsapp_sessions(user_id);
create index if not exists idx_bot_messages_user_id on public.bot_messages(user_id);
create index if not exists idx_bot_questions_user_id on public.bot_questions(user_id);
create index if not exists idx_finance_entries_user_id on public.finance_entries(user_id);

create or replace function public.is_admin_master()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.role = 'ADMIN_MASTER' and u.active = true
  );
$$;

revoke all on function public.is_admin_master() from public;
grant execute on function public.is_admin_master() to authenticated;

alter table public.users enable row level security;
alter table public.plans enable row level security;
alter table public.whatsapp_sessions enable row level security;
alter table public.bot_messages enable row level security;
alter table public.bot_questions enable row level security;
alter table public.finance_entries enable row level security;

drop policy if exists "admin_all_users" on public.users;
create policy "admin_all_users"
on public.users
for all
to authenticated
using (public.is_admin_master())
with check (public.is_admin_master());

drop policy if exists "client_select_own_user" on public.users;
create policy "client_select_own_user"
on public.users
for select
to authenticated
using (id = auth.uid());

drop policy if exists "admin_all_plans" on public.plans;
create policy "admin_all_plans"
on public.plans
for all
to authenticated
using (public.is_admin_master())
with check (public.is_admin_master());

drop policy if exists "client_select_plan_by_own_user" on public.plans;
create policy "client_select_plan_by_own_user"
on public.plans
for select
to authenticated
using (
  exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.plan_id = plans.id
  )
);

drop policy if exists "admin_all_sessions" on public.whatsapp_sessions;
create policy "admin_all_sessions"
on public.whatsapp_sessions
for all
to authenticated
using (public.is_admin_master())
with check (public.is_admin_master());

drop policy if exists "client_own_sessions" on public.whatsapp_sessions;
create policy "client_own_sessions"
on public.whatsapp_sessions
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "admin_all_messages" on public.bot_messages;
create policy "admin_all_messages"
on public.bot_messages
for all
to authenticated
using (public.is_admin_master())
with check (public.is_admin_master());

drop policy if exists "client_own_messages" on public.bot_messages;
create policy "client_own_messages"
on public.bot_messages
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "admin_all_questions" on public.bot_questions;
create policy "admin_all_questions"
on public.bot_questions
for all
to authenticated
using (public.is_admin_master())
with check (public.is_admin_master());

drop policy if exists "client_own_questions" on public.bot_questions;
create policy "client_own_questions"
on public.bot_questions
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "admin_all_finance" on public.finance_entries;
create policy "admin_all_finance"
on public.finance_entries
for all
to authenticated
using (public.is_admin_master())
with check (public.is_admin_master());

drop policy if exists "client_own_finance" on public.finance_entries;
create policy "client_own_finance"
on public.finance_entries
for select
to authenticated
using (user_id = auth.uid());
