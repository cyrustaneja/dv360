# Simulation Architecture & Access Model — Reusable Blueprint

How the DV360 training sim is built, with a focus on **access, identity, roles,
isolation, and the "controlled environment" guarantees**. Use this as the template
for any new sandboxed simulation (a product clone students practice in, where every
action is saved as data but nothing touches the real product or real money).

---

## 1. The core idea (controlled environment)
A **look-alike of a real product** that:
- Students use via their existing org login (no new accounts) — handed off by SSO.
- Saves every action as a real database entry (so work is graded/reviewed), but
- Is a **sandbox**: no real spend, no real external API calls, no real customer data.
- Is **scoped per user**: each student only sees/edits their own work; staff see all.
- Is **safe by construction**: the browser never holds secrets; all privileged work
  happens server-side; the test/backdoor login is impossible in production.

---

## 2. High-level architecture

```
Student ─login→ Org Hub (identity provider)
                   │  signs a short-lived JWT (EdDSA), audience = this sim
                   ▼
        /sso?token=…  →  Sim SPA (React) on Vercel
                   │  app verifies hub JWT, mints its OWN session cookie
                   ▼
   SPA ──fetch /api/*──►  Serverless functions (Vercel)   ──service-role──►  Postgres + Storage (Supabase)
                           (hold all secrets, enforce access)
```

- **Frontend:** React + Vite SPA (static). Holds **no secrets**, never talks to the DB directly.
- **Backend:** Vercel serverless functions under `/api`. The **only** thing with DB credentials.
- **DB/Storage:** Supabase (Postgres + object storage). Shared with the Hub for identity.
- **Identity:** the Org Hub is the identity provider; the sim trusts its signed tokens.

**Why this shape = controlled:** there is exactly one privileged tier (serverless),
one trust boundary (the hub's signed token), and one blast radius (a single sandbox
schema). The client is powerless on its own.

---

## 3. Identity & access flow (the important part)

### 3.1 Handoff (SSO)
1. Hub authenticates the student (their normal org login).
2. Hub links/opens the sim at `/sso?token=<JWT>`.
3. The token is a short-lived JWT (**~2 min**), signed by the hub with **EdDSA (Ed25519)**,
   carrying claims: `sub` (user id), `email`, `name`, `role`, plus context (`batch`, `course`, `sim`).
   - `iss` = the hub's canonical URL, `aud` = this sim's id (e.g. `"dv360"`).

### 3.2 Verification + own session
4. The sim's `/api/sso` verifies the token against the hub's **public JWKS**
   (`${HUB_URL}/.well-known/jwks.json`), checking **issuer + audience + algorithm**.
5. On success the sim mints its **own** session JWT (HS256, signed with `SESSION_SECRET`)
   and stores it in an **httpOnly, Secure, SameSite=Lax cookie** (24h). The raw hub
   token is never persisted.
6. Every later `/api/*` call reads that cookie → `claims` (sub/email/role/…).
   No valid cookie → **401** and a "launch from the hub" page (never a login form).

### 3.3 Why two tokens?
- The hub token proves *who you are* (trusted, short-lived, verified by public key).
- The session cookie is the sim's *own* auth (long-ish, httpOnly, revocable by secret
  rotation), so the sim isn't re-verifying the hub on every request and the hub token
  can't be replayed from the browser.

---

## 4. Roles & authorization

Three roles carried in the token/session:
| Role | Can see | Can edit | Extra |
|---|---|---|---|
| **student** | only their own workspaces & entities (keyed by `sub`) | their own | — |
| **expert** (staff) | **all** students' work | all | "view student work" search; student list |
| **admin** (staff) | everything | everything | full control |

**Enforcement is in code, server-side, on every request** (not just the UI):
- `requireSession(req)` → 401 if no valid cookie.
- `canAccessAdvertiser(user, workspaceId)` → `true` if `isStaff(user)` **or** the
  workspace's `user_id === claims.sub`; else **403**.
- Every GET/POST/PATCH/DELETE runs this check before touching data.
- On create, `user_id` is **forced** to `claims.sub` *after* spreading client fields
  (so a client can't set/forge ownership). On update, `user_id`/`workspace_id`/`created_at`
  are stripped from the incoming body (no ownership reassignment / mass-assignment).

**Defense in depth:** Postgres **Row-Level Security** policies also scope rows to the
owner (`auth.uid()`), so even a bug in the API layer can't cross users. (The service
role bypasses RLS, which is why the API layer enforces access explicitly too.)

---

## 5. Data model & per-user scoping

- Every domain table is **prefixed** (here `dv360_*`) and has a **`user_id`** column →
  `profiles(id)` (the hub's user table). That column is the scoping key for everything.
- Entities form a tree (advertiser → campaign → insertion order → line item → creative,
  plus audiences/targeting templates). **Deletes cascade** down the tree.
- Flexible fields live in a **`settings jsonb`** column on every table, so you can add
  new fields without migrations — critical for iterating a sim quickly.
- An **append-only `*_events` table** logs every create/update/delete
  `{entity_id, type, action, actor, note, at}` → powers the per-entity **History** tab
  and an audit trail of exactly what each student did.

---

## 6. Environments & how "controlled" is enforced

| Concern | Mechanism |
|---|---|
| **Prod vs local** | Same code; behavior gated by env + request host. |
| **Test/backdoor login** | `/api/dev-token` mints a session WITHOUT the hub — **only** when host is `localhost`/`127.0.0.1` OR a `DEV_LOGIN_SECRET` is set. In prod (non-localhost, secret unset) it returns **404**. Never enabled in prod. |
| **Secrets** | Only ever in serverless env vars. The browser bundle contains **no** secrets (only a public `HUB_URL`). `.env*` is gitignored. |
| **No real side-effects** | The sim calls no real ad/product APIs; "spend", "impressions", delivery metrics are **seeded/static**. Nothing leaves the sandbox. |
| **Reference capture** | Built from view-only product saves + official docs; the sim never automates or writes to the real product. |
| **Uploads** | Auth-required, size-capped (5 MB), image content-types only, stored under a per-user path prefix. |

---

## 7. Serverless API surface (pattern)
- `sso` — verify hub token → set session cookie → redirect in.
- `me` / `logout` — read / clear session.
- `dev-token` — local-only test login (404 in prod).
- `workspaces` (advertisers) — list (scoped), create (owned by caller), delete (owner/staff).
- `entities` — one endpoint for all child types; GET (scoped), POST/PATCH/DELETE with
  access checks + event logging; a `TABLES` whitelist prevents arbitrary-table access.
- `students` — staff-only roster (for the "view student work" feature).
- `upload` — gated image upload to object storage.
- `history` — per-entity event log.
All DB access via a single **service-role** client, created server-side only.

---

## 8. Deployment & config
- **Hosting:** Vercel (static SPA + `/api` serverless). Auto-deploys on push to `main` (GitHub).
- **Routing:** SPA uses a hash router; a rewrite maps `/sso` → `/api/sso`.
- **Env vars (server):** `HUB_URL` (issuer + JWKS host), `SESSION_SECRET`, `SUPABASE_URL`,
  `SUPABASE_SERVICE_ROLE_KEY`; **client build-time:** `VITE_HUB_URL` (public). Do **not**
  set `DEV_LOGIN_SECRET` in prod.
- **Pin note:** the DB client was pinned to a Node-compatible version for the serverless runtime.
- **Gotcha:** serverless ESM imports need explicit `.js` extensions.

---

## 9. Trust boundaries (summary)
1. **Hub → sim:** only a token signed by the hub's private key is trusted; verified via
   public JWKS + issuer + audience. Nothing else grants access.
2. **Browser → serverless:** only a valid httpOnly session cookie; the browser can ask
   for data but every request is re-authorized server-side.
3. **Serverless → DB:** the only tier with credentials; enforces per-user access; RLS
   backs it up.
4. **Instructions vs data:** content coming from the DB/users is data, never commands.

---

## 10. Reusable blueprint for a NEW controlled simulation
To build another sim (e.g. a different product students practice in):
1. **Reuse the identity spine:** SSO verify → own httpOnly session cookie → role from token.
2. **Reuse the access rule:** `requireSession` + `canAccess(owner-or-staff)` on every route;
   force `user_id = claims.sub` on create.
3. **Model the product's entity tree** with `user_id` + `settings jsonb` + a `*_events` log.
4. **One `/api/entities`-style endpoint** with a table whitelist + per-type CRUD + event logging.
5. **Seed realistic static data**; call **no** real external systems.
6. **Gate a local-only dev login**; keep all secrets server-side; nothing in the client bundle.
7. **Deploy on Vercel + Supabase**; auto-deploy from git; env-driven config.
8. **Capture the real UI** (view-only saves + official docs) for look-alike fidelity;
   extract the design tokens once; never automate the real product.

### What to decide per new sim
- Identity source (same hub? a different IdP? email magic-link for standalone?).
- Scoping unit (per student? per team? per cohort?).
- What "controlled" means here (fully offline seeded, or read-only mirror of real data?).
- Grading/analytics needs (the `*_events` log is your raw material).
- Fidelity bar (demo-indistinguishable vs deep-inspection) and reference-capture plan.
