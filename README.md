# Keystone Prep Starter

A deployable starter for a Lansdale, PA ecommerce/FBA prep business.

It includes:

- `/` landing website for lead generation
- `/portal` client-facing portal with demo mode and Supabase login mode
- `/admin` lightweight admin console for adding SKUs, inbound shipments, outbound shipments, damage reports, and activity notes
- `supabase/schema.sql` safer database schema with row-level security
- Stripe Payment Link support through the `invoices.stripe_payment_link` column

## Important launch rule

Use the site and demo portal to get conversations. Do **not** accept outside inventory until warehouse permission and insurance are handled. The landing page is intentionally worded as "pilot accounts opening" and does not claim you are fully launched, insured, or ready to receive goods today.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Then open:

- `http://localhost:5173/` for the website
- `http://localhost:5173/portal` for portal demo/login
- `http://localhost:5173/admin` for admin console

If `.env.local` is empty, `/portal` still works in demo mode. Live login requires Supabase env vars.

## Supabase setup

1. Create a Supabase project.
2. Go to **SQL Editor**.
3. Paste and run `supabase/schema.sql`.
4. Go to **Authentication > Users** and create your admin user.
5. Copy the user's UUID.
6. Run this SQL separately:

```sql
insert into clients (user_id, name, account_code, email, is_admin)
values ('YOUR-AUTH-USER-UUID', 'Warehouse Admin', 'ADMIN-001', 'you@example.com', true);
```

7. Copy your Supabase Project URL and anon key into `.env.local`:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SITE_NAME=Keystone Prep
VITE_CONTACT_EMAIL=hello@keystoneprep.co
```

## Creating a real client

1. Supabase **Authentication > Users** → create user with the client's email and temporary password.
2. Copy the user's UUID.
3. SQL Editor:

```sql
insert into clients (user_id, name, account_code, email, is_admin)
values ('CLIENT-AUTH-USER-UUID', 'Client Brand Name', 'ABC-0001', 'client@example.com', false);
```

4. Go to `/admin` and add their SKUs, inbound shipments, outbound shipments, damage reports, and activity notes.
5. Send the client `/portal` and their login.

## Deployment

1. Push the folder to GitHub.
2. Vercel → New Project → import repo.
3. Add environment variables in Vercel project settings:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_SITE_NAME`
   - `VITE_CONTACT_EMAIL`
4. Deploy.
5. Add a custom domain in Vercel.
6. In Supabase **Authentication > URL Configuration**, add your deployed URL.

## Stripe payments

The portal does not need Stripe code yet.

For each invoice:

1. Stripe Dashboard → Payment Links → create a link for the invoice amount.
2. Paste the link into `invoices.stripe_payment_link`.
3. The portal Pay button opens that link.
4. After payment, manually change `invoices.status` to `paid` and set `paid_at`.

## What to customize first

- Company name in `.env.local`
- Contact email in `.env.local`
- Pricing table in `src/pages/Landing.jsx`
- Domain and logo later

## What not to build yet

- Native mobile app
- Amazon SP-API integration
- Client self-signup
- Automatic Stripe webhooks
- Complex warehouse scanning

Get one pilot conversation first. The point of this version is to look real, show the portal, and manually run the first client cleanly.
