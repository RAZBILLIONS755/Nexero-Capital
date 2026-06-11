Supabase integration guide

This document explains how to add Supabase as a backend for persistent, multi-user data (auth, notifications, support tickets, transactions).

Quick steps

1. Create a Supabase project at https://app.supabase.com
2. Create the following tables (simplified):

  - users: id (uuid primary key), email, full_name, role
  - notifications: id, user_id, title, body, read, metadata, created_at
  - support_tickets: id, user_id, subject, message, status, admin_reply, created_at
  - transactions: id, user_id, amount, status, created_at

3. Configure Row Level Security (RLS) and policies as needed for your app.

4. Add environment variables to your host (Cloudflare Pages / Vercel):

  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

5. Client example (see `scripts/supabase-client.example.js`) — include the Supabase client and implement CRUD endpoints called from your frontend.

Notes

- This repo currently stores state in the browser (localStorage). Migrating requires replacing reads/writes in `src/store/dataStore.ts` with API calls to Supabase (or keeping a hybrid mode).
- Keep service role keys server-side only; use anon key on the client and expose server endpoints for privileged actions.
