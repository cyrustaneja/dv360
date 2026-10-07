import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon, DV360Logo } from '../../lib/icons'
import { useBreadcrumbValue } from './breadcrumb'
import { useAuth } from '../../auth/AuthContext'
import { useOutside } from '../ui/primitives'
import { useStore } from '../../store'

interface Props {
  onToggleNav: () => void
  showHome?: boolean
}

/** Fire the global signal that re-runs the guided tour. */
export function startTour() {
  window.dispatchEvent(new Event('dv360:start-tour'))
}

/** Top application bar — persistent across every screen. */
export function AppHeader({ onToggleNav, showHome = false }: Props) {
  const crumbs = useBreadcrumbValue()
  const navigate = useNavigate()

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-gborder bg-white pl-2 pr-4">
      <div className="flex min-w-0 items-center">
        <button onClick={onToggleNav} className="flex h-10 w-10 items-center justify-center rounded-full text-gtext-secondary hover:bg-gbg-page" aria-label="Main menu">
          <Icon name="menu" size={22} />
        </button>
        <Link to="/" className="ml-1 flex items-center gap-2 pr-3">
          <DV360Logo size={26} />
          <span className="hidden whitespace-nowrap text-[15px] leading-tight text-gtext-secondary md:block">Display &amp; Video&nbsp;360</span>
        </Link>
        {showHome && (
          <Link to="/advertiser/campaigns" className="flex h-9 w-9 items-center justify-center rounded-full text-gtext-secondary hover:bg-gbg-page" aria-label="Home">
            <Icon name="home" size={20} />
          </Link>
        )}
        <nav className="flex min-w-0 items-center">
          {crumbs.map((c, i) => (
            <div key={i} className="flex min-w-0 items-center">
              {(i > 0 || showHome) && <Icon name="chevron_right" size={20} className="mx-0.5 shrink-0 text-gtext-disabled" />}
              <div className="min-w-0 px-1">
                <div className="text-11 leading-none text-gtext-secondary">{c.label}</div>
                {c.to ? (
                  <Link to={c.to} className="block truncate text-14 leading-tight text-gtext-primary hover:underline">{c.name}</Link>
                ) : (
                  <div className="truncate text-14 leading-tight text-gtext-primary">{c.name}</div>
                )}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div className="flex shrink-0 items-center gap-0.5 text-gtext-secondary">
        <SearchMenu />
        <NotificationsMenu />
        <IconBtn name="compare_arrows" label="Switch advertiser" onClick={() => navigate('/')} />
        <SavedMenu />
        <AppsMenu navigate={navigate} />
        <HelpMenu />
        <IconBtn name="school" label="Take the product tour" onClick={startTour} />
        <UserMenu />
      </div>
    </header>
  )
}

/* ── generic icon button + popover ─────────────────────────────────────────── */
function IconBtn({ name, label, onClick }: { name: string; label: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gbg-page" aria-label={label} title={label}>
      <Icon name={name} size={20} />
    </button>
  )
}

function Popover({ icon, label, width = 'w-72', children }: { icon: string; label: string; width?: string; children: (close: () => void) => React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useOutside(ref, () => setOpen(false))
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((o) => !o)} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gbg-page" aria-label={label} title={label}>
        <Icon name={icon} size={20} />
      </button>
      {open && <div className={`absolute right-0 z-40 mt-2 ${width} rounded-lg bg-white py-2 shadow-gmenu`}>{children(() => setOpen(false))}</div>}
    </div>
  )
}

/* ── Search: finds entities in the current advertiser ──────────────────────── */
function SearchMenu() {
  const { state } = useStore()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const results: { label: string; name: string; to: string }[] = [
    ...state.campaigns.map((c) => ({ label: 'Campaign', name: c.name, to: `/advertiser/campaigns/${c.id}` })),
    ...state.ios.map((i) => ({ label: 'Insertion order', name: i.name, to: `/advertiser/insertion-orders/${i.id}` })),
    ...state.lineItems.map((l) => ({ label: 'Line item', name: l.name, to: `/advertiser/line-items/${l.id}` })),
    ...state.creatives.map((c) => ({ label: 'Creative', name: c.name, to: '/advertiser/creatives' })),
    ...state.raw.audiences.map((a: any) => ({ label: 'Audience', name: a.name, to: '/advertiser/audiences' })),
    ...state.raw.templates.map((t: any) => ({ label: 'Template', name: t.name, to: '/advertiser/targeting-templates' })),
  ].filter((r) => q && r.name.toLowerCase().includes(q.toLowerCase())).slice(0, 8)

  return (
    <Popover icon="search" label="Search" width="w-96">
      {(close) => (
        <div>
          <div className="px-3 pb-2">
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search campaigns, line items, creatives…"
              className="h-9 w-full rounded border border-gborder px-3 text-14 focus:border-gblue-600 focus:outline-none" />
          </div>
          <div className="max-h-72 overflow-auto">
            {q && results.length === 0 && <div className="px-4 py-3 text-12 text-gtext-secondary">No matches in this advertiser.</div>}
            {!q && <div className="px-4 py-3 text-12 text-gtext-secondary">Type to search within this advertiser.</div>}
            {results.map((r, i) => (
              <button key={i} onClick={() => { navigate(r.to); close() }} className="flex w-full items-center justify-between px-4 py-2 text-left hover:bg-gbg-page">
                <span className="truncate text-14 text-gtext-primary">{r.name}</span>
                <span className="ml-2 shrink-0 text-11 text-gtext-secondary">{r.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </Popover>
  )
}

function NotificationsMenu() {
  const items = [
    { t: 'Feature updates rolling out in Q2 2026', s: 'Reporting metric changes across DV360.' },
    { t: 'Welcome to the training simulation', s: 'Build campaigns freely — nothing spends real money.' },
  ]
  return (
    <Popover icon="notifications" label="Notifications">
      {() => (
        <div>
          <div className="border-b border-gborder-light px-4 pb-2 text-14 font-medium text-gtext-primary">Notifications</div>
          {items.map((n, i) => (
            <div key={i} className="px-4 py-2">
              <div className="text-14 text-gtext-primary">{n.t}</div>
              <div className="text-12 text-gtext-secondary">{n.s}</div>
            </div>
          ))}
        </div>
      )}
    </Popover>
  )
}

function SavedMenu() {
  return (
    <Popover icon="bookmark_border" label="Saved">
      {() => (
        <div className="px-4 py-3 text-12 text-gtext-secondary">
          <div className="mb-1 text-14 font-medium text-gtext-primary">Saved items</div>
          You haven’t saved anything yet.
        </div>
      )}
    </Popover>
  )
}

function AppsMenu({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  const apps = [
    { name: 'Campaigns', icon: 'campaign', to: '/advertiser/campaigns' },
    { name: 'Creatives', icon: 'image', to: '/advertiser/creatives' },
    { name: 'Audiences', icon: 'group', to: '/advertiser/audiences' },
    { name: 'Templates', icon: 'ads_click', to: '/advertiser/targeting-templates' },
  ]
  return (
    <Popover icon="apps" label="Google apps">
      {(close) => (
        <div className="grid grid-cols-3 gap-1 p-2">
          {apps.map((a) => (
            <button key={a.name} onClick={() => { navigate(a.to); close() }} className="flex flex-col items-center gap-1 rounded p-2 hover:bg-gbg-page">
              <Icon name={a.icon} size={22} className="text-gblue-700" />
              <span className="text-11 text-gtext-primary">{a.name}</span>
            </button>
          ))}
        </div>
      )}
    </Popover>
  )
}

function HelpMenu() {
  return (
    <Popover icon="help_outline" label="Help">
      {(close) => (
        <div className="text-14">
          <div className="border-b border-gborder-light px-4 pb-2 font-medium text-gtext-primary">Help</div>
          <button onClick={() => { startTour(); close() }} className="flex w-full items-center gap-2 px-4 py-2 text-left text-gtext-primary hover:bg-gbg-page">
            <Icon name="school" size={18} className="text-gtext-secondary" /> Take the product tour
          </button>
          <div className="px-4 py-2 text-12 text-gtext-secondary">
            This is a training simulation of Display &amp; Video 360. Build advertisers, campaigns, insertion orders, line items, creatives and audiences to practice.
          </div>
        </div>
      )}
    </Popover>
  )
}

function UserMenu() {
  const { me, role, signOut } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useOutside(ref, () => setOpen(false))
  const label = me?.email ?? ''
  const initial = (me?.name || me?.email || '?').charAt(0).toUpperCase()

  return (
    <div ref={ref} className="relative ml-1">
      <button onClick={() => setOpen((o) => !o)} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#7e57c2] text-[13px] font-medium text-white" title={label}>
        {initial}
      </button>
      {open && (
        <div className="absolute right-0 z-40 mt-2 w-64 rounded-lg bg-white py-2 shadow-gmenu">
          <div className="border-b border-gborder-light px-4 pb-2">
            <div className="truncate text-14 font-medium text-gtext-primary">{me?.name || label}</div>
            <div className="mt-0.5 text-11 capitalize text-gtext-secondary">{role ?? 'student'}</div>
          </div>
          <button onClick={() => { setOpen(false); startTour() }} className="flex w-full items-center gap-2 px-4 py-2 text-left text-14 text-gtext-primary hover:bg-gbg-page">
            <Icon name="school" size={18} className="text-gtext-secondary" /> Take the tour
          </button>
          <button onClick={() => { setOpen(false); navigate('/') }} className="flex w-full items-center gap-2 px-4 py-2 text-left text-14 text-gtext-primary hover:bg-gbg-page">
            <Icon name="swap_horiz" size={18} className="text-gtext-secondary" /> Switch advertiser
          </button>
          <button onClick={async () => { setOpen(false); await signOut() }} className="flex w-full items-center gap-2 px-4 py-2 text-left text-14 text-gtext-primary hover:bg-gbg-page">
            <Icon name="logout" size={18} className="text-gtext-secondary" /> Sign out
          </button>
        </div>
      )}
    </div>
  )
}
