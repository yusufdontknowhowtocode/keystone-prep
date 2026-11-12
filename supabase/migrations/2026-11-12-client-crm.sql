-- Admin-only account tracking for signed clients (segment, status, volume, follow-ups).
-- Kept in its own table because clients can read their own `clients` row,
-- and these notes are internal. Safe to run more than once.

create table if not exists client_crm (
  client_id uuid primary key references clients(id) on delete cascade,
  segment text not null default 'amazon',
  status text not null default 'signed_idle',
  est_volume integer,
  volume_unit text not null default 'units',
  next_action text,
  next_date date,
  last_touch date,
  touch_channel text,
  notes text,
  updated_at timestamptz not null default now()
);

alter table client_crm drop constraint if exists client_crm_segment_check;
alter table client_crm add constraint client_crm_segment_check check (segment in ('dtc', 'amazon', 'other'));

alter table client_crm drop constraint if exists client_crm_status_check;
alter table client_crm add constraint client_crm_status_check check (status in (
  'active', 'waiting_shipment', 'holding', 'onboarding', 'reached_out', 'signed_idle', 'paused', 'collections'
));

alter table client_crm drop constraint if exists client_crm_unit_check;
alter table client_crm add constraint client_crm_unit_check check (volume_unit in ('units', 'orders'));

alter table client_crm drop constraint if exists client_crm_channel_check;
alter table client_crm add constraint client_crm_channel_check check (touch_channel is null or touch_channel in ('email', 'whatsapp', 'text', 'call', 'linkedin', 'in_person'));

alter table client_crm enable row level security;
drop policy if exists "admin client_crm all" on client_crm;
create policy "admin client_crm all" on client_crm for all using (public.is_admin()) with check (public.is_admin());
