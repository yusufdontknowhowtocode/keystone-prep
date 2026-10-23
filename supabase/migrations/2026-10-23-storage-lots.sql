-- Storage billing tracker (admin-only). One row per inbound lot / storage block.
-- Billable from arrived_on + free_days; charged per pallet position per month (or fraction thereof).
-- Safe to re-run.
create table if not exists storage_lots (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade not null,
  label text not null,
  arrived_on date not null,
  pallet_positions numeric not null default 1,
  rate numeric not null default 35,
  free_days int not null default 30,
  ended_on date,
  note text,
  created_at timestamptz default now()
);
alter table storage_lots enable row level security;
drop policy if exists "admin storage all" on storage_lots;
create policy "admin storage all" on storage_lots for all using (public.is_admin()) with check (public.is_admin());
