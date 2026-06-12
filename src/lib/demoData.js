export const DEMO_CLIENT = {
  id: 'demo-client-id',
  name: 'Skyline Retail Co.',
  account_code: 'SKY-0042',
  email: 'ops@skylineretail.demo',
  prefs: { polybag: true, photos: true, expiry: true, autoApprove: false, emailDigest: true },
}

export const DEMO_SKUS = [
  { id: 'sku-1', sku: 'SKY-MUG-BLK', fnsku: 'X002K7QF1B', name: 'Ceramic Mug 12oz — Black', prep_spec: 'Polybag + FNSKU', on_hand: 412, prepped: 380, shipped_lifetime: 1240, damaged: 4, photo_count: 3 },
  { id: 'sku-2', sku: 'SKY-MUG-WHT', fnsku: 'X002K7QF2C', name: 'Ceramic Mug 12oz — White', prep_spec: 'Polybag + FNSKU', on_hand: 296, prepped: 296, shipped_lifetime: 980, damaged: 1, photo_count: 2 },
  { id: 'sku-3', sku: 'SKY-LED-STRP', fnsku: 'X003M1RT8A', name: 'LED Strip Light 16ft', prep_spec: 'FNSKU only', on_hand: 540, prepped: 210, shipped_lifetime: 2210, damaged: 0, photo_count: 4 },
  { id: 'sku-4', sku: 'SKY-YOGA-MAT', fnsku: 'X004P9WK3D', name: 'Yoga Mat 6mm — Teal', prep_spec: 'Bubble wrap + FNSKU', on_hand: 88, prepped: 88, shipped_lifetime: 640, damaged: 2, photo_count: 2 },
  { id: 'sku-5', sku: 'SKY-BTL-INS', fnsku: 'X005Q2ZN7E', name: 'Insulated Bottle 32oz', prep_spec: 'Polybag + FNSKU', on_hand: 175, prepped: 0, shipped_lifetime: 410, damaged: 0, photo_count: 1 },
  { id: 'sku-6', sku: 'SKY-KNF-SET', fnsku: 'X006R4VB5F', name: 'Kitchen Knife Set (5pc)', prep_spec: 'Boxed + suffocation label', on_hand: 62, prepped: 62, shipped_lifetime: 230, damaged: 3, photo_count: 5 },
]

export const DEMO_INBOUND = [
  { id: 'in-1', ref_code: 'IN-2231', carrier: 'FedEx Ground', tracking: '748921330021', source: 'Costco order #88231', expected_units: 240, received_units: null, eta: '2026-06-13', status: 'in_transit' },
  { id: 'in-2', ref_code: 'IN-2230', carrier: 'UPS', tracking: '1Z90X44A0392811', source: 'Wholesale — BrightHome LLC', expected_units: 600, received_units: null, eta: '2026-06-12', status: 'receiving' },
  { id: 'in-3', ref_code: 'IN-2228', carrier: 'USPS Freight', tracking: '9400110200881', source: 'Target order #55102', expected_units: 120, received_units: 120, eta: '2026-06-10', status: 'received', received_at: '2026-06-10T14:14:00-04:00' },
]

export const DEMO_OUTBOUND = [
  { id: 'out-1', ref_code: 'OUT-1187', destination: 'Amazon FBA — ONT8', units: 380, sku_list: ['SKY-MUG-BLK'], boxes: 16, weight_lb: 212, est_cost: 361.0, status: 'awaiting_approval' },
  { id: 'out-2', ref_code: 'OUT-1186', destination: 'Amazon FBA — SMF3', units: 210, sku_list: ['SKY-LED-STRP'], boxes: 9, weight_lb: 118, est_cost: 199.5, status: 'awaiting_approval' },
  { id: 'out-3', ref_code: 'OUT-1185', destination: 'Amazon FBA — LAX9', units: 296, sku_list: ['SKY-MUG-WHT'], boxes: 12, weight_lb: 164, est_cost: 281.2, status: 'shipped', shipped_at: '2026-06-09T10:00:00-04:00' },
  { id: 'out-4', ref_code: 'OUT-1184', destination: 'Amazon FBA — ONT8', units: 150, sku_list: ['SKY-YOGA-MAT'], boxes: 6, weight_lb: 98, est_cost: 142.5, status: 'shipped', shipped_at: '2026-06-05T10:00:00-04:00' },
]

export const DEMO_ISSUES = [
  { id: 'dmg-1', ref_code: 'DMG-0419', sku: 'SKY-MUG-BLK', units: 4, created_at: '2026-06-11T10:00:00-04:00', note: 'Crushed corner on inbound carton — 4 mugs chipped. Photos attached.', photo_urls: ['demo1','demo2'], status: 'open' },
  { id: 'dmg-2', ref_code: 'DMG-0418', sku: 'SKY-KNF-SET', units: 3, created_at: '2026-06-08T10:00:00-04:00', note: 'Retail packaging torn on 3 units. Product intact — relabel as used or return?', photo_urls: ['demo1','demo2','demo3'], status: 'open' },
  { id: 'dmg-3', ref_code: 'DMG-0415', sku: 'SKY-YOGA-MAT', units: 2, created_at: '2026-06-02T10:00:00-04:00', note: 'Deep scuffs. Disposed per your instruction.', photo_urls: ['demo1'], status: 'resolved', resolution: 'Disposed', resolved_at: '2026-06-02T12:00:00-04:00' },
]

export const DEMO_INVOICES = [
  { id: 'inv-1', ref_code: 'INV-2026-06', period: 'Jun 1 – Jun 11', status: 'open', stripe_payment_link: '', invoice_lines: [
    { id: 'line-1', description: 'Receiving + inspection', qty: 720, rate: 0.35 },
    { id: 'line-2', description: 'FNSKU labeling', qty: 686, rate: 0.30 },
    { id: 'line-3', description: 'Polybag', qty: 410, rate: 0.25 },
    { id: 'line-4', description: 'Bubble wrap', qty: 88, rate: 0.45 },
    { id: 'line-5', description: 'Storage — 6 pallets', qty: 6, rate: 25.0 },
  ]},
  { id: 'inv-2', ref_code: 'INV-2026-05', period: 'May 2026', status: 'paid', paid_at: '2026-06-01T10:00:00-04:00', invoice_lines: [
    { id: 'line-6', description: 'Receiving + inspection', qty: 1480, rate: 0.35 },
    { id: 'line-7', description: 'FNSKU labeling', qty: 1480, rate: 0.30 },
    { id: 'line-8', description: 'Polybag', qty: 920, rate: 0.25 },
    { id: 'line-9', description: 'Storage — 5 pallets', qty: 5, rate: 25.0 },
  ]},
]

export const DEMO_ACTIVITY = [
  { id: 'act-1', created_at: '2026-06-12T09:42:00-04:00', message: 'IN-2230 receiving started — 600 units from BrightHome LLC', kind: 'in' },
  { id: 'act-2', created_at: '2026-06-12T08:15:00-04:00', message: 'Shipment OUT-1187 staged — 380 units awaiting approval', kind: 'out' },
  { id: 'act-3', created_at: '2026-06-11T12:00:00-04:00', message: 'Damage report DMG-0419 opened — 4 units, SKY-MUG-BLK', kind: 'issue' },
  { id: 'act-4', created_at: '2026-06-10T14:14:00-04:00', message: 'IN-2228 received and inspected — 120/120 units OK', kind: 'in' },
  { id: 'act-5', created_at: '2026-06-09T10:00:00-04:00', message: 'OUT-1185 shipped to LAX9 — tracking sent to email', kind: 'out' },
]
