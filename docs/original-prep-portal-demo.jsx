import React, { useState, useMemo } from "react";
import {
  Package, Boxes, Truck, AlertTriangle, CreditCard, Settings,
  LayoutDashboard, Camera, Check, Search, ChevronRight, Bell,
  ArrowDownToLine, ArrowUpFromLine, X
} from "lucide-react";

/* ============================================================
   PREP PORTAL — client-facing dashboard for an FBA prep center
   Single-file demo. All state is in-memory (no backend yet).
   ============================================================ */

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
:root{
  --paper:#FAFAF8; --card:#FFFFFF; --ink:#16181D; --sub:#5C5F66;
  --line:#DDDBD4; --accent:#FF4F00; --ok:#0E8A3E; --warn:#B45309; --bad:#C81E1E;
}
.pp-root{ background:var(--paper); color:var(--ink); font-family:'Inter',sans-serif; min-height:100vh; }
.pp-display{ font-family:'Barlow Condensed',sans-serif; }
.pp-mono{ font-family:'IBM Plex Mono',monospace; }
.pp-card{ background:var(--card); border:1px solid var(--line); border-radius:10px; }
.pp-line{ border-color:var(--line); }
.pp-sub{ color:var(--sub); }
.pp-accent{ color:var(--accent); }
.pp-btn{ background:var(--ink); color:#fff; border-radius:8px; font-weight:600; transition:opacity .15s; }
.pp-btn:hover{ opacity:.85; }
.pp-btn-accent{ background:var(--accent); }
.pp-btn-ghost{ background:transparent; color:var(--ink); border:1px solid var(--line); border-radius:8px; font-weight:600; }
.pp-btn-ghost:hover{ background:#F1F0EC; }
.pp-stamp{ font-family:'Barlow Condensed',sans-serif; font-weight:700; letter-spacing:.08em;
  border:2px solid currentColor; border-radius:4px; padding:1px 8px; font-size:13px;
  display:inline-block; transform:rotate(-1.5deg); text-transform:uppercase; }
.pp-navbtn{ border-radius:8px; font-weight:600; }
.pp-navbtn.active{ background:var(--ink); color:#fff; }
.pp-navbtn:not(.active):hover{ background:#EFEDE8; }
.pp-row:hover{ background:#FBFAF7; }
@media (prefers-reduced-motion: reduce){ *{ transition:none !important; animation:none !important; } }
`;

/* ---------- mock data ---------- */

const CLIENT = { name: "Skyline Retail Co.", accountId: "SKY-0042", plan: "Per-unit · $0.95 base" };

const INITIAL_SKUS = [
  { sku: "SKY-MUG-BLK", fnsku: "X002K7QF1B", name: "Ceramic Mug 12oz — Black", onHand: 412, prepped: 380, shipped: 1240, damaged: 4, prep: "Polybag + FNSKU", photos: 3 },
  { sku: "SKY-MUG-WHT", fnsku: "X002K7QF2C", name: "Ceramic Mug 12oz — White", onHand: 296, prepped: 296, shipped: 980, damaged: 1, prep: "Polybag + FNSKU", photos: 2 },
  { sku: "SKY-LED-STRP", fnsku: "X003M1RT8A", name: "LED Strip Light 16ft", onHand: 540, prepped: 210, shipped: 2210, damaged: 0, prep: "FNSKU only", photos: 4 },
  { sku: "SKY-YOGA-MAT", fnsku: "X004P9WK3D", name: "Yoga Mat 6mm — Teal", onHand: 88, prepped: 88, shipped: 640, damaged: 2, prep: "Bubble wrap + FNSKU", photos: 2 },
  { sku: "SKY-BTL-INS", fnsku: "X005Q2ZN7E", name: "Insulated Bottle 32oz", onHand: 175, prepped: 0, shipped: 410, damaged: 0, prep: "Polybag + FNSKU", photos: 1 },
  { sku: "SKY-KNF-SET", fnsku: "X006R4VB5F", name: "Kitchen Knife Set (5pc)", onHand: 62, prepped: 62, shipped: 230, damaged: 3, prep: "Boxed + suffocation label", photos: 5 },
];

const INITIAL_INBOUND = [
  { id: "IN-2231", carrier: "FedEx Ground", tracking: "748921330021", from: "CostCo order #88231", units: 240, eta: "Jun 13", status: "in_transit" },
  { id: "IN-2230", carrier: "UPS", tracking: "1Z90X44A0392811", from: "Wholesale — BrightHome LLC", units: 600, eta: "Jun 12", status: "receiving" },
  { id: "IN-2228", carrier: "USPS Freight", tracking: "9400110200881", from: "Target order #55102", units: 120, eta: "Jun 10", status: "received", receivedOn: "Jun 10, 2:14 PM" },
];

const INITIAL_OUTBOUND = [
  { id: "OUT-1187", dest: "Amazon FBA — ONT8", units: 380, skus: ["SKY-MUG-BLK"], boxes: 16, weight: "212 lb", est: 361.0, status: "awaiting_approval" },
  { id: "OUT-1186", dest: "Amazon FBA — SMF3", units: 210, skus: ["SKY-LED-STRP"], boxes: 9, weight: "118 lb", est: 199.5, status: "awaiting_approval" },
  { id: "OUT-1185", dest: "Amazon FBA — LAX9", units: 296, skus: ["SKY-MUG-WHT"], boxes: 12, weight: "164 lb", est: 281.2, status: "shipped", shippedOn: "Jun 9" },
  { id: "OUT-1184", dest: "Amazon FBA — ONT8", units: 150, skus: ["SKY-YOGA-MAT"], boxes: 6, weight: "98 lb", est: 142.5, status: "shipped", shippedOn: "Jun 5" },
];

const INITIAL_ISSUES = [
  { id: "DMG-0419", sku: "SKY-MUG-BLK", units: 4, found: "Jun 11", note: "Crushed corner on inbound carton — 4 mugs chipped. Photos attached.", photos: 2, status: "open" },
  { id: "DMG-0418", sku: "SKY-KNF-SET", units: 3, found: "Jun 8", note: "Retail packaging torn on 3 units. Product intact — relabel as used or return?", photos: 3, status: "open" },
  { id: "DMG-0415", sku: "SKY-YOGA-MAT", units: 2, found: "Jun 2", note: "Deep scuffs. Disposed per your instruction.", photos: 1, status: "resolved", resolution: "Disposed" },
];

const INITIAL_INVOICES = [
  { id: "INV-2026-06", period: "Jun 1 – Jun 11", status: "open", lines: [
    { desc: "Receiving + inspection", qty: 720, rate: 0.35, },
    { desc: "FNSKU labeling", qty: 686, rate: 0.30 },
    { desc: "Polybag", qty: 410, rate: 0.25 },
    { desc: "Bubble wrap", qty: 88, rate: 0.45 },
    { desc: "Storage — 6 pallets", qty: 6, rate: 25.0 },
  ]},
  { id: "INV-2026-05", period: "May 2026", status: "paid", paidOn: "Jun 1", lines: [
    { desc: "Receiving + inspection", qty: 1480, rate: 0.35 },
    { desc: "FNSKU labeling", qty: 1480, rate: 0.30 },
    { desc: "Polybag", qty: 920, rate: 0.25 },
    { desc: "Storage — 5 pallets", qty: 5, rate: 25.0 },
  ]},
];

const INITIAL_ACTIVITY = [
  { t: "Today 9:42 AM", text: "IN-2230 receiving started — 600 units from BrightHome LLC", kind: "in" },
  { t: "Today 8:15 AM", text: "Shipment OUT-1187 staged — 380 units awaiting your approval", kind: "out" },
  { t: "Yesterday", text: "Damage report DMG-0419 opened — 4 units, SKY-MUG-BLK", kind: "issue" },
  { t: "Jun 10", text: "IN-2228 received and inspected — 120/120 units OK", kind: "in" },
  { t: "Jun 9", text: "OUT-1185 shipped to LAX9 — tracking sent to your email", kind: "out" },
];

/* ---------- small pieces ---------- */

// Fake barcode: deterministic bars from a string. The signature visual.
function Barcode({ value, height = 34 }) {
  const bars = useMemo(() => {
    let h = 0;
    for (let i = 0; i < value.length; i++) h = (h * 31 + value.charCodeAt(i)) >>> 0;
    const out = [];
    for (let i = 0; i < 32; i++) { h = (h * 1103515245 + 12345) >>> 0; out.push((h % 4) + 1); }
    return out;
  }, [value]);
  return (
    <div className="flex items-end" aria-hidden="true">
      {bars.map((w, i) => (
        <div key={i} style={{ width: w, height, background: "var(--ink)", marginRight: 2 }} />
      ))}
    </div>
  );
}

function Stamp({ tone, children }) {
  const colors = { ok: "var(--ok)", warn: "var(--warn)", bad: "var(--bad)", ink: "var(--ink)", accent: "var(--accent)" };
  return <span className="pp-stamp" style={{ color: colors[tone] || colors.ink }}>{children}</span>;
}

function Photos({ n }) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: Math.min(n, 4) }).map((_, i) => (
        <div key={i} className="w-9 h-9 rounded border pp-line flex items-center justify-center" style={{ background: "#F1F0EC" }}>
          <Camera size={14} className="pp-sub" />
        </div>
      ))}
      {n > 4 && <div className="w-9 h-9 rounded border pp-line flex items-center justify-center text-xs pp-sub">+{n - 4}</div>}
    </div>
  );
}

function Stat({ label, value, sub, accent }) {
  return (
    <div className="pp-card p-4">
      <div className="text-xs font-semibold uppercase tracking-wider pp-sub">{label}</div>
      <div className="pp-display text-4xl font-bold mt-1" style={accent ? { color: "var(--accent)" } : {}}>{value}</div>
      {sub && <div className="text-xs pp-sub mt-1">{sub}</div>}
    </div>
  );
}

function SectionTitle({ children, right }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="pp-display text-2xl font-bold uppercase tracking-wide">{children}</h2>
      {right}
    </div>
  );
}

/* ---------- pages ---------- */

function Dashboard({ skus, outbound, invoices, activity, go }) {
  const onHand = skus.reduce((s, x) => s + x.onHand, 0);
  const pendingApproval = outbound.filter(o => o.status === "awaiting_approval").length;
  const openInv = invoices.find(i => i.status === "open");
  const balance = openInv ? openInv.lines.reduce((s, l) => s + l.qty * l.rate, 0) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Units in storage" value={onHand.toLocaleString()} sub="Across 6 SKUs" />
        <Stat label="Received this month" value="720" sub="100% inspected" />
        <Stat label="Awaiting your approval" value={pendingApproval} sub="Outbound shipments" accent={pendingApproval > 0} />
        <Stat label="Current balance" value={`$${balance.toFixed(2)}`} sub={openInv ? openInv.period : "—"} />
      </div>

      {pendingApproval > 0 && (
        <button onClick={() => go("outbound")} className="w-full pp-card p-4 flex items-center justify-between text-left" style={{ borderColor: "var(--accent)", borderWidth: 2 }}>
          <div className="flex items-center gap-3">
            <ArrowUpFromLine className="pp-accent" size={20} />
            <div>
              <div className="font-semibold">{pendingApproval} shipment{pendingApproval > 1 ? "s" : ""} staged and ready</div>
              <div className="text-sm pp-sub">Review box counts and approve to ship today</div>
            </div>
          </div>
          <ChevronRight size={18} className="pp-sub" />
        </button>
      )}

      <div>
        <SectionTitle>Activity</SectionTitle>
        <div className="pp-card divide-y" style={{ borderColor: "var(--line)" }}>
          {activity.map((a, i) => (
            <div key={i} className="p-4 flex gap-3 items-start pp-row" style={{ borderColor: "var(--line)" }}>
              <div className="mt-0.5">
                {a.kind === "in" && <ArrowDownToLine size={16} style={{ color: "var(--ok)" }} />}
                {a.kind === "out" && <ArrowUpFromLine size={16} className="pp-accent" />}
                {a.kind === "issue" && <AlertTriangle size={16} style={{ color: "var(--warn)" }} />}
                {a.kind === "pay" && <CreditCard size={16} style={{ color: "var(--ok)" }} />}
              </div>
              <div className="flex-1">
                <div className="text-sm">{a.text}</div>
                <div className="text-xs pp-sub mt-0.5">{a.t}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Inventory({ skus }) {
  const [q, setQ] = useState("");
  const rows = skus.filter(s => (s.sku + s.name + s.fnsku).toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <SectionTitle right={
        <div className="flex items-center gap-2 pp-card px-3 py-1.5">
          <Search size={14} className="pp-sub" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search SKU or name"
            className="bg-transparent outline-none text-sm w-40" />
        </div>
      }>Inventory</SectionTitle>

      <div className="space-y-3">
        {rows.map(s => (
          <div key={s.sku} className="pp-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="font-semibold">{s.name}</div>
                <div className="pp-mono text-xs pp-sub mt-1">{s.sku} · FNSKU {s.fnsku}</div>
                <div className="text-xs pp-sub mt-1">Prep: {s.prep}</div>
              </div>
              <Photos n={s.photos} />
            </div>
            <div className="grid grid-cols-4 gap-2 mt-4 text-center">
              <div><div className="pp-display text-2xl font-bold">{s.onHand}</div><div className="text-xs pp-sub uppercase tracking-wide">On hand</div></div>
              <div><div className="pp-display text-2xl font-bold" style={{ color: "var(--ok)" }}>{s.prepped}</div><div className="text-xs pp-sub uppercase tracking-wide">Prepped</div></div>
              <div><div className="pp-display text-2xl font-bold pp-sub">{s.shipped.toLocaleString()}</div><div className="text-xs pp-sub uppercase tracking-wide">Shipped (life)</div></div>
              <div><div className="pp-display text-2xl font-bold" style={{ color: s.damaged ? "var(--bad)" : "var(--sub)" }}>{s.damaged}</div><div className="text-xs pp-sub uppercase tracking-wide">Damaged</div></div>
            </div>
          </div>
        ))}
        {rows.length === 0 && <div className="pp-card p-8 text-center pp-sub text-sm">No SKUs match "{q}". Clear the search to see all inventory.</div>}
      </div>
    </div>
  );
}

function Inbound({ inbound }) {
  const label = { in_transit: ["In transit", "warn"], receiving: ["Receiving now", "accent"], received: ["Received", "ok"] };
  return (
    <div>
      <SectionTitle>Inbound to warehouse</SectionTitle>
      <div className="space-y-3">
        {inbound.map(s => (
          <div key={s.id} className="pp-card p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-3">
                <span className="pp-mono font-semibold">{s.id}</span>
                <Stamp tone={label[s.status][1]}>{label[s.status][0]}</Stamp>
              </div>
              <div className="text-sm mt-1">{s.from}</div>
              <div className="pp-mono text-xs pp-sub mt-1">{s.carrier} · {s.tracking}</div>
              {s.receivedOn && <div className="text-xs mt-1" style={{ color: "var(--ok)" }}>✓ Checked in {s.receivedOn} — all units inspected</div>}
            </div>
            <div className="text-right">
              <div className="pp-display text-3xl font-bold">{s.units}</div>
              <div className="text-xs pp-sub uppercase tracking-wide">units · ETA {s.eta}</div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs pp-sub mt-4">Forward your supplier tracking numbers and they appear here automatically. Every carton is photographed at check-in.</p>
    </div>
  );
}

function Outbound({ outbound, approve }) {
  return (
    <div>
      <SectionTitle>Outbound to Amazon</SectionTitle>
      <div className="space-y-3">
        {outbound.map(s => (
          <div key={s.id} className="pp-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-3">
                  <span className="pp-mono font-semibold">{s.id}</span>
                  {s.status === "awaiting_approval" && <Stamp tone="accent">Awaiting approval</Stamp>}
                  {s.status === "approved" && <Stamp tone="warn">Approved — ships today</Stamp>}
                  {s.status === "shipped" && <Stamp tone="ok">Shipped {s.shippedOn}</Stamp>}
                </div>
                <div className="text-sm mt-1">{s.dest}</div>
                <div className="pp-mono text-xs pp-sub mt-1">{s.units} units · {s.boxes} boxes · {s.weight} · {s.skus.join(", ")}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="pp-display text-2xl font-bold">${s.est.toFixed(2)}</div>
                  <div className="text-xs pp-sub uppercase tracking-wide">est. prep + freight</div>
                </div>
                {s.status === "awaiting_approval" && (
                  <button onClick={() => approve(s.id)} className="pp-btn pp-btn-accent px-4 py-2 text-sm flex items-center gap-1.5">
                    <Check size={15} /> Approve shipment
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs pp-sub mt-4">Nothing leaves the building without your approval. Approved shipments go out same-day before the 4 PM carrier pickup.</p>
    </div>
  );
}

function Issues({ issues, resolve }) {
  return (
    <div>
      <SectionTitle>Damage reports</SectionTitle>
      <div className="space-y-3">
        {issues.map(d => (
          <div key={d.id} className="pp-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <span className="pp-mono font-semibold">{d.id}</span>
                  {d.status === "open"
                    ? <Stamp tone="bad">Needs decision</Stamp>
                    : <Stamp tone="ok">{d.resolution}</Stamp>}
                </div>
                <div className="pp-mono text-xs pp-sub mt-1">{d.sku} · {d.units} units · found {d.found}</div>
                <p className="text-sm mt-2">{d.note}</p>
                <div className="mt-3"><Photos n={d.photos} /></div>
              </div>
              {d.status === "open" && (
                <div className="flex flex-col gap-2">
                  <button onClick={() => resolve(d.id, "Disposed")} className="pp-btn-ghost px-3 py-1.5 text-sm">Dispose units</button>
                  <button onClick={() => resolve(d.id, "Returning to you")} className="pp-btn-ghost px-3 py-1.5 text-sm">Return to me</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs pp-sub mt-4">Damaged units are quarantined and photographed the moment we find them. You decide what happens — we never bill prep fees on damaged stock.</p>
    </div>
  );
}

function Billing({ invoices, pay }) {
  return (
    <div>
      <SectionTitle>Billing</SectionTitle>
      <div className="space-y-4">
        {invoices.map(inv => {
          const total = inv.lines.reduce((s, l) => s + l.qty * l.rate, 0);
          return (
            <div key={inv.id} className="pp-card p-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <span className="pp-mono font-semibold">{inv.id}</span>
                  {inv.status === "open" ? <Stamp tone="accent">Open</Stamp> : <Stamp tone="ok">Paid {inv.paidOn}</Stamp>}
                </div>
                <div className="text-sm pp-sub">{inv.period}</div>
              </div>
              <table className="w-full mt-3 text-sm">
                <tbody>
                  {inv.lines.map((l, i) => (
                    <tr key={i} className="border-t" style={{ borderColor: "var(--line)" }}>
                      <td className="py-2">{l.desc}</td>
                      <td className="py-2 pp-mono text-right pp-sub">{l.qty.toLocaleString()} × ${l.rate.toFixed(2)}</td>
                      <td className="py-2 pp-mono text-right w-24">${(l.qty * l.rate).toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2" style={{ borderColor: "var(--ink)" }}>
                    <td className="py-2 font-semibold">Total</td>
                    <td></td>
                    <td className="py-2 pp-mono text-right font-bold">${total.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
              {inv.status === "open" && (
                <button onClick={() => pay(inv.id)} className="pp-btn px-4 py-2 text-sm mt-3 flex items-center gap-1.5">
                  <CreditCard size={15} /> Pay ${total.toFixed(2)} with card on file
                </button>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-xs pp-sub mt-4">Every unit we touch shows up as a line item — no flat fees, no surprises. Card payments run through Stripe.</p>
    </div>
  );
}

function Prefs({ prefs, setPrefs }) {
  const Toggle = ({ k, label, desc }) => (
    <div className="flex items-center justify-between p-4 border-t first:border-t-0" style={{ borderColor: "var(--line)" }}>
      <div>
        <div className="font-medium text-sm">{label}</div>
        <div className="text-xs pp-sub mt-0.5">{desc}</div>
      </div>
      <button
        onClick={() => setPrefs(p => ({ ...p, [k]: !p[k] }))}
        aria-pressed={prefs[k]}
        className="w-11 h-6 rounded-full relative transition-colors"
        style={{ background: prefs[k] ? "var(--ok)" : "#CFCDC6" }}>
        <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all"
          style={{ left: prefs[k] ? 22 : 2 }} />
      </button>
    </div>
  );
  return (
    <div>
      <SectionTitle>Prep preferences</SectionTitle>
      <div className="pp-card">
        <Toggle k="polybag" label="Polybag by default" desc="Bag every unit unless the SKU says otherwise" />
        <Toggle k="photos" label="Photo every check-in" desc="Carton photos on receipt, unit photos on damage" />
        <Toggle k="expiry" label="Check expiration dates" desc="Flag anything under 105 days to Amazon's cutoff" />
        <Toggle k="autoApprove" label="Auto-approve shipments under 100 units" desc="Skip the approval step for small shipments" />
        <Toggle k="emailDigest" label="Daily email digest" desc="One summary email at 6 PM instead of per-event alerts" />
      </div>
      <div className="pp-card p-4 mt-4">
        <div className="text-xs font-semibold uppercase tracking-wider pp-sub">Account</div>
        <div className="pp-mono text-sm mt-2">{CLIENT.name} · {CLIENT.accountId}</div>
        <div className="text-sm pp-sub mt-1">{CLIENT.plan}</div>
      </div>
    </div>
  );
}

/* ---------- shell ---------- */

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "inventory", label: "Inventory", icon: Boxes },
  { id: "inbound", label: "Inbound", icon: ArrowDownToLine },
  { id: "outbound", label: "Outbound", icon: ArrowUpFromLine },
  { id: "issues", label: "Issues", icon: AlertTriangle },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function PrepPortal() {
  const [page, setPage] = useState("dashboard");
  const [skus] = useState(INITIAL_SKUS);
  const [inbound] = useState(INITIAL_INBOUND);
  const [outbound, setOutbound] = useState(INITIAL_OUTBOUND);
  const [issues, setIssues] = useState(INITIAL_ISSUES);
  const [invoices, setInvoices] = useState(INITIAL_INVOICES);
  const [activity, setActivity] = useState(INITIAL_ACTIVITY);
  const [prefs, setPrefs] = useState({ polybag: true, photos: true, expiry: true, autoApprove: false, emailDigest: true });
  const [toast, setToast] = useState(null);

  const log = (text, kind) => setActivity(a => [{ t: "Just now", text, kind }, ...a]);
  const ping = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2600); };

  const approve = (id) => {
    setOutbound(o => o.map(s => s.id === id ? { ...s, status: "approved" } : s));
    log(`Shipment ${id} approved — shipping on today's 4 PM pickup`, "out");
    ping(`${id} approved. It ships today.`);
  };
  const resolve = (id, resolution) => {
    setIssues(d => d.map(x => x.id === id ? { ...x, status: "resolved", resolution } : x));
    log(`Damage report ${id} resolved — ${resolution.toLowerCase()}`, "issue");
    ping(`${id}: ${resolution}.`);
  };
  const pay = (id) => {
    setInvoices(v => v.map(x => x.id === id ? { ...x, status: "paid", paidOn: "Today" } : x));
    log(`Invoice ${id} paid via card on file`, "pay");
    ping(`Invoice ${id} paid. Receipt emailed.`);
  };

  const openIssues = issues.filter(i => i.status === "open").length;
  const pending = outbound.filter(o => o.status === "awaiting_approval").length;
  const badge = { outbound: pending, issues: openIssues };

  return (
    <div className="pp-root">
      <style>{FONTS}</style>

      {/* Header — thermal shipping label */}
      <header className="border-b-2" style={{ borderColor: "var(--ink)", background: "var(--card)" }}>
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-end justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest pp-sub">Prep Portal · Client account</div>
            <h1 className="pp-display text-3xl sm:text-4xl font-bold uppercase leading-none mt-1">{CLIENT.name}</h1>
          </div>
          <div className="text-right hidden sm:block">
            <Barcode value={CLIENT.accountId} />
            <div className="pp-mono text-xs mt-1 tracking-widest">{CLIENT.accountId}</div>
          </div>
          <button className="sm:hidden relative" aria-label="Notifications">
            <Bell size={20} />
            {(pending + openIssues) > 0 && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full" style={{ background: "var(--accent)" }} />}
          </button>
        </div>
      </header>

      {/* Nav */}
      <nav className="border-b pp-line sticky top-0 z-10" style={{ background: "var(--paper)" }}>
        <div className="max-w-5xl mx-auto px-2 flex gap-1 overflow-x-auto py-2">
          {NAV.map(n => (
            <button key={n.id} onClick={() => setPage(n.id)}
              className={`pp-navbtn px-3 py-1.5 text-sm flex items-center gap-1.5 whitespace-nowrap ${page === n.id ? "active" : ""}`}>
              <n.icon size={15} />
              {n.label}
              {badge[n.id] > 0 && (
                <span className="pp-mono text-xs px-1.5 rounded-full text-white" style={{ background: "var(--accent)" }}>{badge[n.id]}</span>
              )}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-6 pb-16">
        {page === "dashboard" && <Dashboard skus={skus} outbound={outbound} invoices={invoices} activity={activity} go={setPage} />}
        {page === "inventory" && <Inventory skus={skus} />}
        {page === "inbound" && <Inbound inbound={inbound} />}
        {page === "outbound" && <Outbound outbound={outbound} approve={approve} />}
        {page === "issues" && <Issues issues={issues} resolve={resolve} />}
        {page === "billing" && <Billing invoices={invoices} pay={pay} />}
        {page === "settings" && <Prefs prefs={prefs} setPrefs={setPrefs} />}
      </main>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-white shadow-lg"
          style={{ background: "var(--ink)" }}>
          <Check size={15} style={{ color: "var(--ok)" }} /> {toast}
          <button onClick={() => setToast(null)} aria-label="Dismiss"><X size={14} className="opacity-60" /></button>
        </div>
      )}
    </div>
  );
}
