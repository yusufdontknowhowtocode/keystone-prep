-- Pipeline columns on the existing `leads` table (website quote form writes here).
-- Safe to run more than once.

alter table leads add column if not exists stage text default 'new';
alter table leads add column if not exists next_action text;
alter table leads add column if not exists next_date date;

alter table leads drop constraint if exists leads_stage_check;
alter table leads add constraint leads_stage_check check (stage in ('new','quoted','agreement_sent','signed','lost'));

update leads set stage = 'new' where stage is null;

-- RLS: admin can read/update everything; the public quote form can still insert.
alter table leads enable row level security;

drop policy if exists "admin leads all" on leads;
create policy "admin leads all" on leads for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public quote form insert" on leads;
create policy "public quote form insert" on leads for insert to anon, authenticated with check (true);
