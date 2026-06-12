# Prep Portal — Backend & Launch Guide

Goal: take `prep-portal.jsx` from demo file → live site at your own domain, with real logins, real data, photo uploads, and payments. Total cost to launch: ~$12/year (the domain). Everything else starts free.

**The stack (and why):**
- **Vercel** — hosts the site, free tier, deploys from GitHub automatically
- **Supabase** — database + logins + photo storage in one, free tier covers you to ~50 clients easily
- **Stripe Payment Links** — payments with zero backend code (upgrade to full API later)

Realistic timeline for a vibe coder: a weekend.

---

## Phase 1 — Project setup (30 min)

1. Install Node.js if you don't have it, then create the app:
   ```bash
   npm create vite@latest prep-portal -- --template react
   cd prep-portal
   npm install @supabase/supabase-js lucide-react
   npm install -D tailwindcss @tailwindcss/vite
   ```
2. Drop `prep-portal.jsx` into `src/`, import it from `App.jsx`, confirm `npm run dev` shows the demo locally.
3. Push the folder to a new GitHub repo (private is fine).

## Phase 2 — Database (1 hour)

1. Create a free project at supabase.com. Save the **Project URL** and **anon key** (Settings → API).
2. Open **SQL Editor**, paste the entire `supabase-schema.sql` file, hit Run. That creates every table, locks data so each client only sees their own rows, and makes the photo bucket.
3. In **Authentication → Users**, create your own account, copy its user ID, and run the admin insert at the bottom of the schema file with your ID. You're now the admin.
4. Add a test client the same way: create a user, then insert a `clients` row pointing at it (leave `is_admin` false).

## Phase 3 — Wire the portal to real data (the main coding session)

This is the vibe-coding part — point Claude Code or Cursor at the repo with this prompt and iterate:

> "Convert this React app from hardcoded INITIAL_ data to Supabase. Add: (1) an email+password login screen using supabase.auth.signInWithPassword, (2) on login, load the client row for the logged-in user, then fetch their skus, inbound_shipments, outbound_shipments, damage_reports, invoices + invoice_lines, and activity_log, (3) make the Approve button update outbound_shipments.status to 'approved' and insert an activity_log row, (4) make damage resolution and prefs toggles write to the database the same way, (5) keep all existing styling exactly as is."

Create `src/lib/supabase.js`:
```js
import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```
Put the URL and key in a `.env` file (and never commit it):
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

The security policies in the schema mean even if you mess up frontend code, a client physically cannot query another client's rows. That's your safety net.

## Phase 4 — Your admin side

Clients view data; *you* need to enter it. Two options:

- **Day 1 (do this):** just use Supabase's built-in Table Editor on your phone/laptop. Receive a box → add a row to `inbound_shipments`, bump `skus.on_hand`, add an `activity_log` line. Takes 60 seconds per event. Completely fine for your first 1–3 clients.
- **Later:** add an `/admin` route to the portal — a form that does check-ins in one tap and uploads photos. Build it once data entry starts annoying you, not before.

Photos: upload from the Supabase dashboard (Storage → checkin-photos → folder named with the client's ID), or from the admin page later. Your phone camera is the only hardware needed.

## Phase 5 — Payments (15 min, zero code)

1. Create a Stripe account (you'll want an LLC + EIN here — see launch checklist).
2. When you bill a client: Stripe Dashboard → Payment Links → create a link for the invoice amount → paste the URL into that invoice's `stripe_payment_link` column. The portal's "Pay" button just opens it.
3. When Stripe emails you that it's paid, flip the invoice to `paid`. 
4. Later upgrade: Stripe webhooks can flip it automatically, and Stripe Invoicing can auto-charge a card on file monthly. Not needed for launch.

## Phase 6 — Deploy (20 min)

1. vercel.com → New Project → import your GitHub repo.
2. Add the two environment variables (same names as `.env`) in Vercel's settings.
3. Deploy. You get `prep-portal-xyz.vercel.app` instantly.
4. Buy a domain (~$12 at Cloudflare or Namecheap — something like `keystoneprep.co`), add it in Vercel → Domains. Now clients log in at `portal.keystoneprep.co`.
5. In Supabase → Authentication → URL Configuration, add your domain so login redirects work.

Every `git push` after this auto-deploys. That's the whole pipeline.

## Onboarding a real client (your 5-minute routine)

1. Authentication → create user with their email + temp password
2. Insert their `clients` row (name, account code like `BRT-0001`, email)
3. Insert their SKU rows
4. Email them the portal link + login → they see their own branded-feeling dashboard on day one

---

## Launch checklist (the non-code stuff that actually matters)

- [ ] **LLC** — PA online filing, $125. Do this before holding anyone's inventory.
- [ ] **EIN** — free, irs.gov, 10 minutes. Needed for Stripe + business bank account.
- [ ] **Business bank account** — keep client payments separate from your $6k.
- [ ] **Warehouse legal liability insurance** — covers *other people's goods in your care*. General liability alone does NOT cover this. Ask an insurance broker specifically for "warehouse legal liability" — expect roughly $500–1,500/yr at your scale.
- [ ] **PA sales tax + resale certs** — wholesale clients give you a REV-1220 resale certificate; keep them on file.
- [ ] **Simple service agreement** — one-pager covering: per-unit rates, storage fees, liability cap per unit, payment terms (due on receipt), and that you're not responsible for Amazon's decisions. Worth having a template reviewed once.
- [ ] **Landlord/leather-business sign-off** on running the operation in the shared space.

## What NOT to build yet

- Native mobile app (the site works on phones; add PWA manifest later)
- Automated Amazon SP-API integration (powerful, but wait for client #3+)
- Client self-serve signup (you onboard manually — it's a feature, not a flaw)
- Webhooks/email automation (Supabase table editor + your phone is enough)

Ship the boring version. The portal already looks better than 90% of prep centers' "email us a spreadsheet" workflow.
