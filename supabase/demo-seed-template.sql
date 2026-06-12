-- Optional demo seed. Run AFTER creating a client user and inserting their clients row.
-- Replace DEMO-CLIENT-UUID with the id from public.clients for the demo client.

-- Example client insert after creating demo user in Authentication:
-- insert into clients (user_id, name, account_code, email, is_admin)
-- values ('AUTH-USER-UUID', 'Skyline Retail Co.', 'SKY-0042', 'ops@skylineretail.demo', false);

-- Then copy the generated clients.id into the placeholder below.

insert into skus (client_id, sku, fnsku, name, prep_spec, on_hand, prepped, shipped_lifetime, damaged, photo_count) values
('DEMO-CLIENT-UUID','SKY-MUG-BLK','X002K7QF1B','Ceramic Mug 12oz — Black','Polybag + FNSKU',412,380,1240,4,3),
('DEMO-CLIENT-UUID','SKY-MUG-WHT','X002K7QF2C','Ceramic Mug 12oz — White','Polybag + FNSKU',296,296,980,1,2),
('DEMO-CLIENT-UUID','SKY-LED-STRP','X003M1RT8A','LED Strip Light 16ft','FNSKU only',540,210,2210,0,4);

insert into inbound_shipments (client_id, ref_code, carrier, tracking, source, expected_units, eta, status) values
('DEMO-CLIENT-UUID','IN-2231','FedEx Ground','748921330021','Costco order #88231',240,'2026-06-13','in_transit'),
('DEMO-CLIENT-UUID','IN-2230','UPS','1Z90X44A0392811','Wholesale — BrightHome LLC',600,'2026-06-12','receiving');

insert into outbound_shipments (client_id, ref_code, destination, units, boxes, weight_lb, est_cost, sku_list, status) values
('DEMO-CLIENT-UUID','OUT-1187','Amazon FBA — ONT8',380,16,212,361.00,array['SKY-MUG-BLK'],'awaiting_approval'),
('DEMO-CLIENT-UUID','OUT-1186','Amazon FBA — SMF3',210,9,118,199.50,array['SKY-LED-STRP'],'awaiting_approval');

insert into damage_reports (client_id, ref_code, sku, units, note, photo_urls, status) values
('DEMO-CLIENT-UUID','DMG-0419','SKY-MUG-BLK',4,'Crushed corner on inbound carton — 4 mugs chipped. Photos attached.',array[]::text[],'open');

insert into invoices (client_id, ref_code, period, status) values
('DEMO-CLIENT-UUID','INV-2026-06','Jun 1 – Jun 11','open');

insert into invoice_lines (invoice_id, description, qty, rate)
select i.id, x.description, x.qty, x.rate
from invoices i
cross join (values
  ('Receiving + inspection', 720::numeric, .35::numeric),
  ('FNSKU labeling', 686::numeric, .30::numeric),
  ('Polybag', 410::numeric, .25::numeric),
  ('Storage — 6 pallets', 6::numeric, 25.00::numeric)
) as x(description, qty, rate)
where i.client_id = 'DEMO-CLIENT-UUID' and i.ref_code = 'INV-2026-06';

insert into activity_log (client_id, kind, message) values
('DEMO-CLIENT-UUID','in','IN-2230 receiving started — 600 units from BrightHome LLC'),
('DEMO-CLIENT-UUID','out','Shipment OUT-1187 staged — 380 units awaiting approval'),
('DEMO-CLIENT-UUID','issue','Damage report DMG-0419 opened — 4 units, SKY-MUG-BLK');
