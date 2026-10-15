-- $1M goal tracker: one row per month of AFTER-TAX net profit attributable to Yusuf
-- (Keystone + Lovetto + KT cut). Entered by hand from the bookkeeping sheet. Safe to re-run.
create table if not exists goal_months (
  month text primary key check (month ~ '^\d{4}-\d{2}$'),
  profit numeric not null default 0,
  note text,
  updated_at timestamptz default now()
);
alter table goal_months enable row level security;
drop policy if exists "admin goal all" on goal_months;
create policy "admin goal all" on goal_months for all using (public.is_admin()) with check (public.is_admin());

-- Starting point: Jul–Oct 2026 combined, from the bookkeeping sheet (Oct 15, 2026).
insert into goal_months (month, profit, note)
values ('2026-10', -6041.25, 'Jul–Oct 2026 combined (bookkeeping sheet, pre-tax loss)')
on conflict (month) do nothing;
