# DV360 Simulation — Frontend Replica (Phase 1)

A pixel-faithful, fully navigable frontend recreation of Google **Display & Video 360**,
built as a training simulation. Phase 1 is **frontend-only**: all data is static/mock, and
there is no backend, authentication, or campaign-execution logic. Components are structured
so the mock data layer (`src/data/mock.ts`) can later be swapped for real API calls without
touching the UI.

Built with **React + TypeScript + Tailwind CSS** (Vite).

## Run it

```bash
npm install
npm run dev      # local dev server with hot reload
```

Then open the printed URL (e.g. http://localhost:5173).

## Build & deploy

```bash
npm run build    # type-checks, then outputs a static site to dist/
npm run preview  # preview the production build locally
```

The build is fully static and uses **hash-based routing** with a relative base path, so the
contents of `dist/` can be hosted anywhere — a static web host, an LMS, an intranet share, or
even opened directly from disk — with no server configuration or rewrite rules.

## What's included

App shell (persistent on every screen)
- Top app bar: DV360 logo, breadcrumb trail, search / notifications / apps / help / avatar
- Blue product-update banner + amber deletion warning
- Collapsible left navigation (partner and advertiser variants)

Partner scope
- Overview (risk tiles, tutorials rail, recently opened)
- Advertisers list

Advertiser scope
- Campaigns + Insertion orders tables
- Campaign detail (Combined / Insertion orders / Line items, metric tiles)
- Insertion order detail (Line items, Insertion order details form, History)
- Line item detail (targeting summary, Troubleshooter, History)
- Audiences, Creatives gallery, Format gallery
- Inventory: Plans, My inventory, Marketplace, Negotiations
- Reports, Experiments, Targeting templates, Advertiser settings, History

Creation wizards
- New campaign, New insertion order, New line item
- New targeting template — with slide-in targeting panels (Brand suitability, Apps & URLs, Environment)

Frontend interactions (no backend): tab switching, dropdown menus, row selection, sortable
column affordances, sidebar collapse/expand, dismissible banners, slide-in panels, hover states.

## Project structure

```
src/
  components/
    layout/    AppShell, AppHeader, Banners, Sidebar, nav config, breadcrumb context
    ui/        primitives (Button, Tabs, DataTable, FilterBar, …) + form parts
  screens/
    partner/   Overview, Advertisers
    advertiser/ Campaigns, detail views, Creatives, Inventory, settings, …
    wizards/   New campaign / IO / line item / targeting template
    Placeholders.tsx  light empty-state screens
  data/        mock.ts  (typed, API-shaped mock data)
  lib/         icons.tsx (Material Symbols + DV360 logo)
```

Design tokens (the DV360 palette, typography, shadows) live in `tailwind.config.js`.
