-- Fulfilled DTC orders (one row per shipped box) + per-order photos in a private bucket.
create table if not exists public.fulfilled_orders (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  order_no text not null,
  packed_on date,
  items text,
  item_count int,
  box text,
  scale_weight text,
  weight_lb numeric,
  carrier text,
  fee numeric,
  tracking text,
  created_at timestamptz default now(),
  unique (client_id, order_no)
);
alter table public.fulfilled_orders enable row level security;
create policy "own fulfilled orders" on public.fulfilled_orders for select using (client_id = my_client_id() or is_admin());
create policy "admin fulfilled orders" on public.fulfilled_orders for all using (is_admin()) with check (is_admin());

create table if not exists public.order_photos (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  order_no text,               -- null = unassigned
  path text not null,          -- object path in the private 'order-photos' bucket
  taken_at timestamptz default now()
);
create index on public.order_photos (client_id, order_no);
alter table public.order_photos enable row level security;
create policy "own order photos" on public.order_photos for select using (client_id = my_client_id() or is_admin());
create policy "admin order photos" on public.order_photos for all using (is_admin()) with check (is_admin());

insert into storage.buckets (id, name, public) values ('order-photos','order-photos', false) on conflict (id) do nothing;
create policy "order photos read" on storage.objects for select using (bucket_id = 'order-photos' and ((storage.foldername(name))[1] = my_client_id()::text or is_admin()));
create policy "order photos admin insert" on storage.objects for insert with check (bucket_id = 'order-photos' and is_admin());
create policy "order photos admin update" on storage.objects for update using (bucket_id = 'order-photos' and is_admin());
create policy "order photos admin delete" on storage.objects for delete using (bucket_id = 'order-photos' and is_admin());

-- clients can see their own storage charges
create policy "own storage lots" on public.storage_lots for select using (client_id = my_client_id());
