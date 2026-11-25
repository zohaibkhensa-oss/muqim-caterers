# Supabase setup — Muqim Caterers

The app works offline on mock data. Connecting Supabase turns on: staff login,
a live database, and real-time sync for every admin action.

## 1. Create a project

supabase.com → New project → copy the **Project URL** and **anon public key**
(Settings → API).

## 2. Create the schema

Supabase dashboard → SQL Editor → paste `schema.sql` → Run.
Then paste `seed.sql` → Run (loads packages, vendors, staff, two demo bookings).

## 3. Create the staff login

Authentication → Users → Add user → email + password for the founder.
That's the `/admin/login` credential.

## 4. Point the app at it

```bash
cp .env.example .env.local
# fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run dev
```

## What changes when connected

| Area | Behaviour |
|---|---|
| `/admin/*` | Requires sign-in (RLS enforces it server-side too) |
| `/admin/login` | Real email+password auth |
| Bookings | Hydrate from DB on load; every action write-through upserts |
| `/book` submit | Inserts a real row (anon-allowed, inquiry status only) |
| `/booking/:ref` | Public lookup via `booking_status_by_ref` RPC |
| Packages / vendors / staff / clients | Loaded from DB |

## Notes

- Nested event data (menu items, receipts, expenses, logistics, procurement)
  lives in `jsonb` columns on `bookings` — deliberate for the MVP; normalize
  into child tables when the data grows.
- Vendors/staff/packages/clients write back to Redux only for now — extend
  `syncMiddleware` in `src/lib/sync.js` the same way bookings does when those
  admin forms get real CRUD.
