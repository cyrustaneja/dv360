# DV360 Simulation — Deployment (Kraftshala Hub SSO model)

This simulation has **no login of its own**. Identity comes from the **Kraftshala
Simulation Hub**, which signs students in and forwards them here with a signed token.

Stack: **React + Vite** SPA, **Vercel** serverless functions (`/api`) for auth + data,
**shared hub Supabase** project (the sim only adds `dv360_`-prefixed tables).

## How sign-in works

1. The hub links students to `https://<this-app>/sso?token=<RS256 JWT>`.
2. `api/sso.ts` verifies that token against `${HUB_URL}/.well-known/jwks.json`
   (issuer = `HUB_URL`, audience = `dv360`), then sets an **httpOnly session cookie**
   and redirects into the app.
3. The SPA reads identity from `api/me.ts`. All DV360 data goes through `/api`
   functions that use the **service-role key** server-side, scoped to the user's
   `sub`. Visiting the app without a valid session shows a "launch from the hub"
   page — never a login form.

## 1. Database (one-time)

In the **shared hub Supabase project** → SQL Editor, run
[`supabase/dv360_schema.sql`](supabase/dv360_schema.sql). It creates only the
`dv360_*` tables (advertisers, campaigns, insertion_orders, line_items,
creatives, progress, events), all keyed to `public.profiles(id)`. It assumes the
hub has already created `profiles` and `public.is_admin()`.

## 2. Environment variables (Vercel → Project Settings → Environment Variables)

| Name | Scope | Value |
|------|-------|-------|
| `HUB_URL` | server | The hub's URL (e.g. `https://hub.kraftshala.com`) |
| `SESSION_SECRET` | server | Long random string for signing our session cookie |
| `SUPABASE_URL` | server | `https://rzmazsztojfnclvskbob.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | server | service_role secret (⚠️ never expose) |
| `VITE_HUB_URL` | build | Hub URL (only for the launch-page link) |

> `SUPABASE_SERVICE_ROLE_KEY` and `SESSION_SECRET` must never be exposed to the
> browser. Only `VITE_`-prefixed vars reach the client.

## 3. Deploy

1. Push this folder to Git and **Import** in Vercel (preset: **Vite**), or run `npx vercel`.
2. Add the env vars above (Production + Preview) and **redeploy**.
3. Tell the hub team this sim's base URL so it can mint tokens with
   **`audience: "dv360"`** and link students to `/sso?token=…`.

## 4. Local development

```bash
cp .env.example .env.local       # fill HUB_URL, SESSION_SECRET, SUPABASE_*
npm install
npx vercel dev                   # runs the SPA + /api functions together
```

> Plain `npm run dev` runs only the SPA (no `/api`), so SSO/data won't work.
> Use `vercel dev` so the serverless functions are available. To test a login,
> generate a valid hub token and open `/sso?token=<token>`.

## Notes / constraints

- `@supabase/supabase-js` is pinned to **2.45.4** (Node < 22 safety on Vercel).
- We never persist the raw hub token — claims are read once at `/sso` and we use
  our own 8-hour session cookie afterwards.
- Activity is logged to `dv360_events` (e.g. `campaign_created`).

## Phase 3 (future)

- Real delivery metrics / reporting, edit & delete flows
- Per-student progress scoring in `dv360_progress`
- Staff dashboard to view any student's work
