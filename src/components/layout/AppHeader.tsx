import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon, DV360Logo } from '../../lib/icons'
import { useBreadcrumbValue } from './breadcrumb'
import { useAuth } from '../../auth/AuthContext'
import { useOutside } from '../ui/primitives'

interface Props {
  onToggleNav: () => void
  showHome?: boolean
}

/** Top application bar — persistent across every screen. */
export function AppHeader({ onToggleNav, showHome = false }: Props) {
  const crumbs = useBreadcrumbValue()

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-gborder bg-white pl-2 pr-4">
      <div className="flex min-w-0 items-center">
        <button
          onClick={onToggleNav}
          className="flex h-10 w-10 items-center justify-center rounded-full text-gtext-secondary hover:bg-gbg-page"
          aria-label="Main menu"
        >
          <Icon name="menu" size={22} />
        </button>

        <Link to="/" className="ml-1 flex items-center gap-2 pr-3">
          <DV360Logo size={26} />
          <span className="hidden whitespace-nowrap text-[15px] leading-tight text-gtext-secondary md:block">
            Display &amp; Video&nbsp;360
          </span>
        </Link>

        {showHome && (
          <Link
            to="/advertiser/campaigns"
            className="flex h-9 w-9 items-center justify-center rounded-full text-gtext-secondary hover:bg-gbg-page"
            aria-label="Home"
          >
            <Icon name="home" size={20} />
          </Link>
        )}

        <nav className="flex min-w-0 items-center">
          {crumbs.map((c, i) => (
            <div key={i} className="flex min-w-0 items-center">
              {(i > 0 || showHome) && (
                <Icon name="chevron_right" size={20} className="mx-0.5 shrink-0 text-gtext-disabled" />
              )}
              <div className="min-w-0 px-1">
                <div className="text-11 leading-none text-gtext-secondary">{c.label}</div>
                {c.to ? (
                  <Link to={c.to} className="block truncate text-14 leading-tight text-gtext-primary hover:underline">
                    {c.name}
                  </Link>
                ) : (
                  <div className="truncate text-14 leading-tight text-gtext-primary">{c.name}</div>
                )}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div className="flex shrink-0 items-center gap-1 text-gtext-secondary">
        <HeaderIcon name="search" label="Search" />
        <HeaderIcon name="notifications" label="Notifications" />
        <HeaderIcon name="compare_arrows" label="Switch account" />
        <HeaderIcon name="bookmark_border" label="Saved" />
        <HeaderIcon name="apps" label="Google apps" />
        <HeaderIcon name="help_outline" label="Help" />
        <UserMenu />
      </div>
    </header>
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
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-[#7e57c2] text-[13px] font-medium text-white"
        title={label}
      >
        {initial}
      </button>
      {open && (
        <div className="absolute right-0 z-40 mt-2 w-64 rounded-lg bg-white py-2 shadow-gmenu">
          <div className="border-b border-gborder-light px-4 pb-2">
            <div className="truncate text-13 font-medium text-gtext-primary">{me?.name || label}</div>
            <div className="mt-0.5 text-11 capitalize text-gtext-secondary">{role ?? 'student'}</div>
          </div>
          <button
            onClick={() => { setOpen(false); navigate('/') }}
            className="flex w-full items-center gap-2 px-4 py-2 text-left text-13 text-gtext-primary hover:bg-gbg-page"
          >
            <Icon name="swap_horiz" size={18} className="text-gtext-secondary" />
            Switch advertiser
          </button>
          <button
            onClick={async () => { setOpen(false); await signOut() }}
            className="flex w-full items-center gap-2 px-4 py-2 text-left text-13 text-gtext-primary hover:bg-gbg-page"
          >
            <Icon name="logout" size={18} className="text-gtext-secondary" />
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}

function HeaderIcon({ name, label }: { name: string; label: string }) {
  return (
    <button
      className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gbg-page"
      aria-label={label}
      title={label}
    >
      <Icon name={name} size={20} />
    </button>
  )
}
