-- Run-rate estimator on the Goal tab: estimated monthly revenue/cost per client or venture.
-- Toggle "active" or edit numbers to see the monthly estimate change. Safe to re-run.
create table if not exists income_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kind text not null default 'client' check (kind in ('client','venture','expense')),
  monthly_revenue numeric not null default 0,
  monthly_cost numeric not null default 0,
  active boolean not null default true,
  note text,
  created_at timestamptz default now()
);
alter table income_sources enable row level security;
drop policy if exists "admin income all" on income_sources;
create policy "admin income all" on income_sources for all using (public.is_admin()) with check (public.is_admin());

-- Starting estimates (Oct 15, 2026). Edit freely.
insert into income_sources (name, kind, monthly_revenue, monthly_cost, active, note)
select * from (values
  ('Red River Media (REDR-0001)', 'client', 2000, 150, true, '~$450–550/week invoiced; cost = supplies'),
  ('Bricklight (BRIC-0001)', 'client', 600, 60, true, 'starts late Oct; ~100+ orders/mo at $2.50–2.90 + storage — revise after month 1'),
  ('Authletic / Zaya (AUTH-0001)', 'client', 25, 0, true, 'storage only from Nov; orders when Zaya sells'),
  ('NordPeak (NORD-0001)', 'client', 100, 10, true, 'occasional FBA prep batches'),
  ('Little Owl Goods (LITT-0001)', 'client', 100, 10, true, 'first shipment pending'),
  ('Insurance (Harper/Century)', 'expense', 0, 410, true, '$4,920/yr'),
  ('Lovetto headcovers', 'venture', 0, 0, false, 'turn on once listings are live')
) as v(name, kind, monthly_revenue, monthly_cost, active, note)
where not exists (select 1 from income_sources);
