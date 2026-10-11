-- Leads table for the admin Overview pipeline.
-- Run once in the Supabase SQL editor. Admin-only: clients can never see leads.

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  contact text,
  source text,
  stage text default 'new' check (stage in ('new','quoted','agreement_sent','signed','lost')),
  est_monthly numeric,
  next_action text,
  next_date date,
  notes text,
  created_at timestamptz default now()
);

alter table leads enable row level security;

drop policy if exists "admin leads all" on leads;
create policy "admin leads all" on leads for all using (public.is_admin()) with check (public.is_admin());
