# DV360 Pixel-Exact Rebuild — Build Plan & Tracker

Goal: make the sim a pixel-exact DV360 replica, screen by screen, using the real ACX
design tokens (see `DESIGN_SYSTEM.md`) and the extracted per-screen content
(`design/screens/*.txt`, from real DV360 "Save As Complete" snapshots).

## Reference assets
- Tokens: `design/DESIGN_SYSTEM.md`, `design/dv360-tokens-raw.txt`
- Screen content dumps (exact labels/sections/order):
  - `design/screens/io.txt` — Insertion Order details ✅ full
  - `design/screens/targeting.txt` — Targeting template ✅ full
  - `design/screens/lineitem.txt` — ⚠️ captured the type-picker, NOT the LI settings form → need re-save
  - Campaigns list — in `~/Downloads/Display & Video 360.html` (extracted; nav + table cols)
- Source saves in `~/Downloads/Display & Video 360*.html` (+ `_files`)

## Fonts (decided)
- Body = Roboto (exact). Headings = Roboto 500 (Google Sans is proprietary, unavailable).
- Base font size switched to **14px** (DV360 true base). Re-check spacing per screen.

## Phases
- [x] **Phase 0 — Foundation:** ACX palette, type scale (11/12/14/16/18/22/24), radii (2/4/6/8/16), shadows in `tailwind.config.js`; Roboto+Material Symbols loaded; base font → 14px.
- [ ] **Phase 1 — Shared shell:** left nav (order matches DV360), top bar, right Intelligence/Quick-help panel, breadcrumb, "Limited Access" chip, sticky Save/Reset/note action bar, shared Material controls (text field + char counter, radio rows, dropdowns, tabs, cards, sectioned form rows).
- [ ] **Phase 2 — Screens (one by one):**
  - [x] Campaigns list (cols: Delivery, Name, Budget, Spent, KPI Goal, KPI Actual) ✅
  - [x] Audiences (sub-tabs First-party · Custom lists · Combined · Partner) ✅
  - [x] Creatives (DV360 list view default + grid toggle; cols Name/ID/Status/Type/Format/DV360 status/Dimensions/Source/Line Items) ✅
  - [x] Inventory → Plans (cols Name/ID/Total Budget/Start/End/Channels; "Status: 2 selected") ✅ seeded
  - [x] Inventory → Marketplace (Netflix/Roku/YouTube promos + APAC CTV packages w/ impressions + Instant Deal) ✅ seeded
  - [x] Reports (tabs: Overview · Instant & offline · Cross-media reach) ✅ new screen + route + nav un-flagged
  - [x] WizardShell polished to 14px/tokens (affects all New… flows) ✅
  - [ ] My inventory · Negotiations (still Upcoming)
  - [ ] Wizards (New campaign/IO/creative/audience) — need DV360 saves for pixel-exact steps
  - [ ] Dialogs: SDF Download, Unsaved Changes ("changes will be lost / Discard / Continue editing") — text captured; needs router-block wiring
  - Extra refs saved: design/screens/{audiences,creatives,custom_list,inventory_plans,marketplace,reports,howitopens}.txt
  - [x] Insertion Order details (ref: io.txt) — full DV360 sections, saves to DB ✅
  - [x] Targeting template (ref: targeting.txt) — details+desc, Inventory source, Viewability, Optimized targeting ✅
  - [x] Line Item settings (ref: lineitem_detail.txt) — DV360 order: template selector → name → Inventory source → Targeting (Viewability/Optimized/Save as template) → Flight dates → Budget & pacing (bid strategy, freq cap) → Creatives → Conversions → Disclosures → Additional settings ✅
  - [ ] Audiences list
  - [ ] Creative list
  - [ ] Wizards: New campaign / IO / line item / creative / audience / targeting template
  - [ ] Dialogs: SDF Download, Unsaved Changes, Pause ad group, Discard changes
- [ ] **Phase 3 — Interactions/states:** Add-targeting flow, dropdown menus, filters, pagination, hover/focus.

## Per-screen loop
1. Read `design/screens/<screen>.txt` for exact labels/sections/order.
2. Build with ACX tokens.
3. Screenshot at DV360 viewport (~1280+), compare to reference, iterate to exact.

## Key extracted facts
- **IO details fields:** Objective; Budget (type INR, Description, Spent, Remaining, Start/End, Add segments, Show actualized); Pacing (Flight recommended / Even); KPI (CPM); Optimization (Automate bid&budget at IO level ▸ "Maximize viewable impressions"; Control at line-item level; YouTube R&F "Alpha"); Frequency cap (No limit / Limit to N exposures per Month); Additional settings → Partner costs (CPM Fees, Media Fees, DV360 Fee locked), Integration Code; sticky Save / Reset / "Optional: Enter a note about this change".
- **Targeting template fields:** Template details (Type, Name [/240], Description Optional [/600]); Inventory source (Quality: "Authorized and Non-Participating Publishers"; Public Inventory "47 Exchanges and 0 Subexchanges"; Deals and Packages; Deal groups); Targeting (Viewability → Open Measurement [lock]; Optimized targeting → Use optimized targeting); Add targeting; Create / Cancel.
- **Line item type picker:** 6 cards — Display, Video, Audio, Connected TV, Demand Gen, YouTube & partners video (exact descriptions in lineitem.txt).
- **Nav order:** Campaigns · Audiences · Creative · Inventory · Reports · Experiments · Targeting templates · Resources · Advertiser settings · History.

## Still to save from real DV360
1. **Line Item settings page** (the editor form) — blocker for LI.
2. Nice-to-have: Audiences list, Creative list, New campaign wizard.
