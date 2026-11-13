-- Marketing tab: what each channel costs vs what it brings in. Safe to re-run.
-- leads.source  = how they reached us (email, phone, whatsapp, website form...)
-- leads.channel = what brought them (Google Ads – DTC, PrepMarketplace, Referral – Leonardo...)

alter table leads add column if not exists channel text;

create table if not exists marketing_spend (
  id uuid primary key default gen_random_uuid(),
  channel text not null,
  month date not null,              -- first day of the month
  amount numeric not null default 0,
  note text,
  created_at timestamptz default now(),
  unique (channel, month)
);
alter table marketing_spend enable row level security;
drop policy if exists "admin marketing all" on marketing_spend;
create policy "admin marketing all" on marketing_spend for all using (public.is_admin()) with check (public.is_admin());

-- Backfill only where the channel is known. Everything else stays untagged for review in Admin > Marketing.
update leads set channel = 'PrepMarketplace' where channel is null and source = 'prepmarketplace';
update leads set channel = 'Referral – Leonardo' where channel is null and source = 'referral: Leonardo';
update leads set channel = '3PL / partner outreach' where channel is null and source in ('3PL outreach', 'outreach');
update leads set channel = '3P Mercury' where channel is null and brand ilike '%3P Mercury%';
update leads set channel = 'Google search (organic)' where channel is null and source like 'ref:%google%';
update leads set channel = 'Google Ads – FBA' where channel is null and source = 'google_ads';
