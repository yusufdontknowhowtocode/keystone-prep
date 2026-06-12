-- ============================================================
-- KEYSTONE PREP — Supabase schema
-- Paste this file into Supabase > SQL Editor > Run.
-- Safer version: clients can only approve shipments, resolve damage,
-- and update preferences through narrowly scoped RPC functions.
-- ============================================================

create extension if not exists pgcrypto;

-- ---------- TABLES ----------

create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete set null,
  name text not null,
  account_code text unique not null,
  email text not null,
  is_admin boolean default false,
  prefs jsonb default '{"polybag":true,"photos":true,"expiry":true,"autoApprove":false,"emailDigest":true}',
  created_at timestamptz default now()
);

create table if not exists skus (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade not null,
  sku text not null,
  fnsku text,
  name text not null,
  prep_spec text default 'FNSKU only',
  on_hand int default 0,
  prepped int default 0,
  shipped_lifetime int default 0,
  damaged int default 0,
  photo_count int default 0,
  created_at timestamptz default now(),
  unique (client_id, sku)
);

create table if not exists inbound_shipments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade not null,
  ref_code text not null,
  carrier text,
  tracking text,
  source text,
  expected_units int,
  received_units int,
  eta date,
  status text default 'in_transit' check (status in ('in_transit','receiving','received')),
  received_at timestamptz,
  created_at timestamptz default now(),
  unique (client_id, ref_code)
);

create table if not exists outbound_shipments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade not null,
  ref_code text not null,
  destination text,
  units int,
  boxes int,
  weight_lb numeric,
  est_cost numeric,
  sku_list text[],
  status text default 'staging' check (status in ('staging','awaiting_approval','approved','shipped')),
  approved_at timestamptz,
  shipped_at timestamptz,
  tracking text,
  created_at timestamptz default now(),
  unique (client_id, ref_code)
);

create table if not exists damage_reports (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade not null,
  ref_code text not null,
  sku text,
  units int,
  note text,
  photo_urls text[] default '{}',
  status text default 'open' check (status in ('open','resolved')),
  resolution text,
  created_at timestamptz default now(),
  resolved_at timestamptz,
  unique (client_id, ref_code)
);

create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade not null,
  ref_code text not null,
  period text,
  status text default 'open' check (status in ('open','paid')),
  stripe_payment_link text,
  paid_at timestamptz,
  created_at timestamptz default now(),
  unique (client_id, ref_code)
);

create table if not exists invoice_lines (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid references invoices(id) on delete cascade not null,
  description text not null,
  qty numeric not null,
  rate numeric not null
);

create table if not exists activity_log (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade not null,
  kind text check (kind in ('in','out','issue','pay','note')) default 'note',
  message text not null,
  created_at timestamptz default now()
);

-- ---------- INDEXES ----------

create index if not exists idx_clients_user_id on clients(user_id);
create index if not exists idx_skus_client_id on skus(client_id);
create index if not exists idx_inbound_client_id on inbound_shipments(client_id);
create index if not exists idx_outbound_client_id on outbound_shipments(client_id);
create index if not exists idx_damage_client_id on damage_reports(client_id);
create index if not exists idx_invoices_client_id on invoices(client_id);
create index if not exists idx_activity_client_id_created on activity_log(client_id, created_at desc);

-- ---------- RLS HELPERS ----------

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select c.is_admin from public.clients c where c.user_id = auth.uid() limit 1), false)
$$;

create or replace function public.my_client_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select c.id from public.clients c where c.user_id = auth.uid() limit 1
$$;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.my_client_id() to authenticated;

-- ---------- ENABLE RLS ----------

alter table clients enable row level security;
alter table skus enable row level security;
alter table inbound_shipments enable row level security;
alter table outbound_shipments enable row level security;
alter table damage_reports enable row level security;
alter table invoices enable row level security;
alter table invoice_lines enable row level security;
alter table activity_log enable row level security;

-- Clear policies if re-running this file.
drop policy if exists "clients select own or admin" on clients;
drop policy if exists "admin inserts clients" on clients;
drop policy if exists "admin updates clients" on clients;
drop policy if exists "own skus select" on skus;
drop policy if exists "admin skus all" on skus;
drop policy if exists "own inbound select" on inbound_shipments;
drop policy if exists "admin inbound all" on inbound_shipments;
drop policy if exists "own outbound select" on outbound_shipments;
drop policy if exists "admin outbound all" on outbound_shipments;
drop policy if exists "own damage select" on damage_reports;
drop policy if exists "admin damage all" on damage_reports;
drop policy if exists "own invoices select" on invoices;
drop policy if exists "admin invoices all" on invoices;
drop policy if exists "own invoice lines select" on invoice_lines;
drop policy if exists "admin invoice lines all" on invoice_lines;
drop policy if exists "own activity select" on activity_log;
drop policy if exists "admin activity all" on activity_log;

-- Clients can read their own account row. Admin can read/write accounts.
create policy "clients select own or admin" on clients for select using (user_id = auth.uid() or public.is_admin());
create policy "admin inserts clients" on clients for insert with check (public.is_admin());
create policy "admin updates clients" on clients for update using (public.is_admin()) with check (public.is_admin());

-- Client data: clients read own; admins manage all.
create policy "own skus select" on skus for select using (client_id = public.my_client_id() or public.is_admin());
create policy "admin skus all" on skus for all using (public.is_admin()) with check (public.is_admin());

create policy "own inbound select" on inbound_shipments for select using (client_id = public.my_client_id() or public.is_admin());
create policy "admin inbound all" on inbound_shipments for all using (public.is_admin()) with check (public.is_admin());

create policy "own outbound select" on outbound_shipments for select using (client_id = public.my_client_id() or public.is_admin());
create policy "admin outbound all" on outbound_shipments for all using (public.is_admin()) with check (public.is_admin());

create policy "own damage select" on damage_reports for select using (client_id = public.my_client_id() or public.is_admin());
create policy "admin damage all" on damage_reports for all using (public.is_admin()) with check (public.is_admin());

create policy "own invoices select" on invoices for select using (client_id = public.my_client_id() or public.is_admin());
create policy "admin invoices all" on invoices for all using (public.is_admin()) with check (public.is_admin());

create policy "own invoice lines select" on invoice_lines for select using (
  exists (
    select 1 from invoices i
    where i.id = invoice_id and (i.client_id = public.my_client_id() or public.is_admin())
  )
);
create policy "admin invoice lines all" on invoice_lines for all using (public.is_admin()) with check (public.is_admin());

create policy "own activity select" on activity_log for select using (client_id = public.my_client_id() or public.is_admin());
create policy "admin activity all" on activity_log for all using (public.is_admin()) with check (public.is_admin());

-- ---------- CLIENT-SAFE RPC FUNCTIONS ----------

create or replace function public.approve_outbound_shipment(shipment_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target outbound_shipments;
begin
  select * into target from outbound_shipments where id = shipment_id;
  if target.id is null then
    raise exception 'Shipment not found';
  end if;
  if target.client_id <> public.my_client_id() and not public.is_admin() then
    raise exception 'Not allowed';
  end if;
  if target.status <> 'awaiting_approval' then
    raise exception 'Only awaiting approval shipments can be approved';
  end if;

  update outbound_shipments
  set status = 'approved', approved_at = now()
  where id = shipment_id;

  insert into activity_log (client_id, kind, message)
  values (target.client_id, 'out', 'Shipment ' || target.ref_code || ' approved by client');
end;
$$;

create or replace function public.resolve_damage_report(report_id uuid, resolution_text text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target damage_reports;
begin
  if resolution_text not in ('Disposed', 'Return to client', 'Returned', 'Hold for review') then
    raise exception 'Invalid resolution';
  end if;

  select * into target from damage_reports where id = report_id;
  if target.id is null then
    raise exception 'Damage report not found';
  end if;
  if target.client_id <> public.my_client_id() and not public.is_admin() then
    raise exception 'Not allowed';
  end if;

  update damage_reports
  set status = 'resolved', resolution = resolution_text, resolved_at = now()
  where id = report_id;

  insert into activity_log (client_id, kind, message)
  values (target.client_id, 'issue', 'Damage report ' || target.ref_code || ' resolved: ' || resolution_text);
end;
$$;

create or replace function public.update_client_prefs(next_prefs jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.my_client_id() is null then
    raise exception 'No client profile found';
  end if;

  update clients
  set prefs = next_prefs
  where id = public.my_client_id();
end;
$$;

grant execute on function public.approve_outbound_shipment(uuid) to authenticated;
grant execute on function public.resolve_damage_report(uuid, text) to authenticated;
grant execute on function public.update_client_prefs(jsonb) to authenticated;

-- ---------- STORAGE ----------

insert into storage.buckets (id, name, public)
values ('checkin-photos','checkin-photos', false)
on conflict (id) do nothing;

drop policy if exists "clients read own photos" on storage.objects;
drop policy if exists "admin uploads photos" on storage.objects;
drop policy if exists "admin manages photos" on storage.objects;

create policy "clients read own photos" on storage.objects for select using (
  bucket_id = 'checkin-photos'
  and ((storage.foldername(name))[1] = public.my_client_id()::text or public.is_admin())
);
create policy "admin uploads photos" on storage.objects for insert with check (bucket_id = 'checkin-photos' and public.is_admin());
create policy "admin manages photos" on storage.objects for update using (bucket_id = 'checkin-photos' and public.is_admin()) with check (bucket_id = 'checkin-photos' and public.is_admin());

-- ---------- FIRST ADMIN STEP ----------
-- 1. Create your own user in Supabase Authentication > Users.
-- 2. Copy the user's UUID.
-- 3. Run this separately, replacing the ID and email:
--
-- insert into clients (user_id, name, account_code, email, is_admin)
-- values ('YOUR-AUTH-USER-UUID', 'Warehouse Admin', 'ADMIN-001', 'you@example.com', true);
