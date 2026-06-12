-- ============================================================
-- PREP PORTAL — Supabase schema
-- Paste this whole file into Supabase > SQL Editor > Run.
-- Creates all tables, security rules, and the photo bucket.
-- ============================================================

-- ---------- TABLES ----------

-- One row per client brand. user_id links to their Supabase login.
create table clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  name text not null,
  account_code text unique not null,          -- e.g. 'SKY-0042'
  email text not null,
  is_admin boolean default false,             -- set true on YOUR account only
  prefs jsonb default '{"polybag":true,"photos":true,"expiry":true,"autoApprove":false,"emailDigest":true}',
  created_at timestamptz default now()
);

create table skus (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) not null,
  sku text not null,
  fnsku text,
  name text not null,
  prep_spec text default 'FNSKU only',
  on_hand int default 0,
  prepped int default 0,
  shipped_lifetime int default 0,
  damaged int default 0,
  created_at timestamptz default now(),
  unique (client_id, sku)
);

create table inbound_shipments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) not null,
  ref_code text not null,                     -- e.g. 'IN-2231'
  carrier text,
  tracking text,
  source text,                                -- 'Costco order #88231'
  expected_units int,
  received_units int,
  eta date,
  status text default 'in_transit'            -- in_transit | receiving | received
    check (status in ('in_transit','receiving','received')),
  received_at timestamptz,
  created_at timestamptz default now()
);

create table outbound_shipments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) not null,
  ref_code text not null,                     -- e.g. 'OUT-1187'
  destination text,                           -- 'Amazon FBA — ONT8'
  units int,
  boxes int,
  weight_lb numeric,
  est_cost numeric,
  sku_list text[],
  status text default 'staging'               -- staging | awaiting_approval | approved | shipped
    check (status in ('staging','awaiting_approval','approved','shipped')),
  approved_at timestamptz,
  shipped_at timestamptz,
  tracking text,
  created_at timestamptz default now()
);

create table damage_reports (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) not null,
  ref_code text not null,                     -- 'DMG-0419'
  sku text,
  units int,
  note text,
  photo_urls text[],
  status text default 'open'
    check (status in ('open','resolved')),
  resolution text,                            -- 'Disposed' | 'Returned'
  created_at timestamptz default now(),
  resolved_at timestamptz
);

create table invoices (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) not null,
  ref_code text not null,                     -- 'INV-2026-06'
  period text,
  status text default 'open'
    check (status in ('open','paid')),
  stripe_payment_link text,                   -- paste a Stripe link here, zero code needed
  paid_at timestamptz,
  created_at timestamptz default now()
);

create table invoice_lines (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid references invoices(id) on delete cascade,
  description text not null,
  qty numeric not null,
  rate numeric not null
);

create table activity_log (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) not null,
  kind text check (kind in ('in','out','issue','pay','note')),
  message text not null,
  created_at timestamptz default now()
);

-- ---------- ROW LEVEL SECURITY ----------
-- Clients can only ever see their own rows. You (admin) see everything.

alter table clients enable row level security;
alter table skus enable row level security;
alter table inbound_shipments enable row level security;
alter table outbound_shipments enable row level security;
alter table damage_reports enable row level security;
alter table invoices enable row level security;
alter table invoice_lines enable row level security;
alter table activity_log enable row level security;

-- helper: is the logged-in user an admin?
create or replace function is_admin() returns boolean as $$
  select coalesce((select is_admin from clients where user_id = auth.uid() limit 1), false)
$$ language sql security definer;

-- helper: which client does this login belong to?
create or replace function my_client_id() returns uuid as $$
  select id from clients where user_id = auth.uid() limit 1
$$ language sql security definer;

create policy "clients see self" on clients for select
  using (user_id = auth.uid() or is_admin());
create policy "clients update own prefs" on clients for update
  using (user_id = auth.uid() or is_admin());
create policy "admin manages clients" on clients for insert
  with check (is_admin());

-- same pattern for every data table
create policy "own skus" on skus for select using (client_id = my_client_id() or is_admin());
create policy "admin writes skus" on skus for all using (is_admin());

create policy "own inbound" on inbound_shipments for select using (client_id = my_client_id() or is_admin());
create policy "admin writes inbound" on inbound_shipments for all using (is_admin());

create policy "own outbound" on outbound_shipments for select using (client_id = my_client_id() or is_admin());
-- clients may approve their own staged shipments (status change only — enforce in app)
create policy "client approves outbound" on outbound_shipments for update
  using (client_id = my_client_id() or is_admin());

create policy "own damage" on damage_reports for select using (client_id = my_client_id() or is_admin());
create policy "client resolves damage" on damage_reports for update
  using (client_id = my_client_id() or is_admin());
create policy "admin writes damage" on damage_reports for insert with check (is_admin());

create policy "own invoices" on invoices for select using (client_id = my_client_id() or is_admin());
create policy "admin writes invoices" on invoices for all using (is_admin());

create policy "own invoice lines" on invoice_lines for select
  using (exists (select 1 from invoices i where i.id = invoice_id
         and (i.client_id = my_client_id() or is_admin())));
create policy "admin writes lines" on invoice_lines for all using (is_admin());

create policy "own activity" on activity_log for select using (client_id = my_client_id() or is_admin());
create policy "anyone logs own activity" on activity_log for insert
  with check (client_id = my_client_id() or is_admin());

-- ---------- PHOTO STORAGE ----------
-- Bucket for check-in / damage photos. Files go in folders named by client id.

insert into storage.buckets (id, name, public) values ('checkin-photos','checkin-photos', false);

create policy "clients read own photos" on storage.objects for select
  using (bucket_id = 'checkin-photos'
         and ((storage.foldername(name))[1] = my_client_id()::text or is_admin()));
create policy "admin uploads photos" on storage.objects for insert
  with check (bucket_id = 'checkin-photos' and is_admin());

-- ---------- DONE ----------
-- Next: create your own login in Authentication > Users, then run:
--   insert into clients (user_id, name, account_code, email, is_admin)
--   values ('<your-auth-user-id>', 'Warehouse Admin', 'ADMIN-001', 'you@email.com', true);
