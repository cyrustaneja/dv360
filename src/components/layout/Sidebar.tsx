import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Icon } from '../../lib/icons'

export interface NavNode {
  icon: string
  label: string
  to?: string
  end?: boolean
  upcoming?: boolean
  children?: { label: string; to: string; end?: boolean; upcoming?: boolean }[]
}

/** Small "Upcoming" pill shown next to not-yet-functional nav items. */
function UpcomingTag({ light }: { light?: boolean }) {
  return (
    <span className={`ml-2 shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${light ? 'bg-white/20 text-white' : 'bg-gbg-page text-gtext-secondary'}`}>
      Upcoming
    </span>
  )
}

interface Props {
  nav: NavNode[]
  collapsed: boolean
}

/** Left navigation rail. Mirrors the DV360 partner / advertiser menus. */
export function Sidebar({ nav, collapsed }: Props) {
  const location = useLocation()
  // Track which expandable groups are open; default-open any group that
  // contains the active route so the current page is always revealed.
  const initiallyOpen = (n: NavNode) =>
    !!n.children?.some((c) => location.pathname.startsWith(c.to)) ||
    (n.to ? location.pathname.startsWith(n.to) && !!n.children : false)
  const [open, setOpen] = useState<Record<string, boolean>>(() => {
    const o: Record<string, boolean> = {}
    nav.forEach((n) => (o[n.label] = initiallyOpen(n)))
    return o
  })

  return (
    <nav
      className={`${
        collapsed ? 'w-[72px]' : 'w-[232px]'
      } shrink-0 overflow-y-auto overflow-x-hidden border-r border-gborder bg-white pt-2 transition-[width] duration-150`}
    >
      <div className="pb-4">
        {nav.map((n) => {
          const hasChildren = !!n.children?.length
          const isOpen = open[n.label]
          return (
            <div key={n.label}>
              {n.to && !hasChildren ? (
                <NavLink to={n.to} end={n.end} className="block">
                  {({ isActive }) => <Row icon={n.icon} label={n.label} active={isActive} collapsed={collapsed} upcoming={n.upcoming} />}
                </NavLink>
              ) : n.to && hasChildren ? (
                // Group whose parent is itself a destination (e.g. Reports)
                <NavLink to={n.to} end={n.end} className="block">
                  {({ isActive }) => (
                    <Row
                      icon={n.icon}
                      label={n.label}
                      active={isActive}
                      collapsed={collapsed}
                      upcoming={n.upcoming}
                      caret={hasChildren ? (isOpen ? 'expand_less' : 'expand_more') : undefined}
                      onCaret={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setOpen((s) => ({ ...s, [n.label]: !s[n.label] }))
                      }}
                    />
                  )}
                </NavLink>
              ) : (
                <button className="block w-full text-left" onClick={() => setOpen((s) => ({ ...s, [n.label]: !s[n.label] }))}>
                  <Row
                    icon={n.icon}
                    label={n.label}
                    active={false}
                    collapsed={collapsed}
                    upcoming={n.upcoming}
                    caret={isOpen ? 'expand_less' : 'expand_more'}
                  />
                </button>
              )}

              {hasChildren && isOpen && !collapsed && (
                <div className="mb-1">
                  {n.children!.map((c) => (
                    <NavLink key={c.to} to={c.to} end={c.end} className="block">
                      {({ isActive }) => (
                        <div
                          className={`flex h-9 items-center rounded-r-full pl-[52px] pr-3 text-13 ${
                            isActive
                              ? 'bg-gblue-600 font-medium text-white'
                              : 'text-gtext-primary hover:bg-gbg-page'
                          }`}
                        >
                          <span className="flex-1 truncate">{c.label}</span>
                          {c.upcoming && <UpcomingTag light={isActive} />}
                        </div>
                      )}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </nav>
  )
}

function Row({
  icon,
  label,
  active,
  collapsed,
  caret,
  onCaret,
  upcoming,
}: {
  icon: string
  label: string
  active: boolean
  collapsed: boolean
  caret?: string
  onCaret?: (e: React.MouseEvent) => void
  upcoming?: boolean
}) {
  return (
    <div
      className={`mr-2 flex h-9 items-center rounded-r-full pr-2 ${
        collapsed ? 'pl-[26px]' : 'pl-6'
      } ${active ? 'bg-gblue-600 font-medium text-white' : 'text-gtext-primary hover:bg-gbg-page'}`}
      title={collapsed ? label : undefined}
    >
      <Icon name={icon} size={20} className={active ? 'text-white' : 'text-gtext-secondary'} filled={active} />
      {!collapsed && <span className="ml-5 flex-1 truncate text-13">{label}</span>}
      {!collapsed && upcoming && <UpcomingTag light={active} />}
      {!collapsed && caret && (
        <span onClick={onCaret} className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-black/5">
          <Icon name={caret} size={18} className={active ? 'text-white' : 'text-gtext-secondary'} />
        </span>
      )}
    </div>
  )
}
