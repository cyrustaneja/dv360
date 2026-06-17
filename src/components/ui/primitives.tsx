import React, { useEffect, useRef, useState } from 'react'
import { Icon } from '../../lib/icons'
import type { DeliveryStatus } from '../../data/mock'

/* -------------------------------------------------------------------------- */
/* Buttons                                                                    */
/* -------------------------------------------------------------------------- */

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'filled' | 'outlined' | 'text'
  size?: 'sm' | 'md'
}

export function Button({ variant = 'filled', size = 'md', className = '', children, disabled, ...rest }: BtnProps) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded font-medium transition-colors whitespace-nowrap g-focus'
  const sizing = size === 'sm' ? 'h-8 px-3 text-13' : 'h-9 px-4 text-14'
  const variants: Record<string, string> = {
    filled: disabled
      ? 'bg-gbg-page text-gtext-disabled cursor-default'
      : 'bg-gblue-600 text-white hover:bg-gblue-700 shadow-sm',
    outlined: disabled
      ? 'border border-gborder text-gtext-disabled cursor-default'
      : 'border border-gborder text-gblue-700 hover:bg-gblue-50',
    text: disabled ? 'text-gtext-disabled cursor-default' : 'text-gblue-700 hover:bg-gblue-50',
  }
  return (
    <button className={`${base} ${sizing} ${variants[variant]} ${className}`} disabled={disabled} {...rest}>
      {children}
    </button>
  )
}

/** Circular icon-only button used throughout DV360 toolbars. */
export function IconButton({
  name,
  label,
  filled,
  className = '',
  ...rest
}: { name: string; label: string; filled?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      title={label}
      aria-label={label}
      className={`flex h-9 w-9 items-center justify-center rounded-full text-gtext-secondary hover:bg-gbg-page ${className}`}
      {...rest}
    >
      <Icon name={name} size={20} filled={filled} />
    </button>
  )
}

/* -------------------------------------------------------------------------- */
/* Badges & status                                                            */
/* -------------------------------------------------------------------------- */

export function LimitedAccessBadge() {
  return (
    <span className="ml-3 inline-flex items-center rounded bg-gbg-page px-2 py-0.5 text-11 font-medium text-gtext-secondary">
      Limited Access
    </span>
  )
}

const statusColor: Record<DeliveryStatus, string> = {
  active: '#34a853',
  paused: '#9aa0a6',
  draft: '#9aa0a6',
  ended: '#d93025',
}

export function StatusDot({ status }: { status: DeliveryStatus }) {
  return <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: statusColor[status] }} />
}

/* -------------------------------------------------------------------------- */
/* Page header (title + Limited Access)                                       */
/* -------------------------------------------------------------------------- */

export function PageHeader({ title, limitedAccess = true, children }: { title: string; limitedAccess?: boolean; children?: React.ReactNode }) {
  return (
    <div className="flex items-center px-6 pt-4">
      <h1 className="font-gsans text-22 font-normal text-gtext-primary">{title}</h1>
      {limitedAccess && <LimitedAccessBadge />}
      {children}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Tabs (underline style)                                                     */
/* -------------------------------------------------------------------------- */

export function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: string[]
  active: string
  onChange: (t: string) => void
}) {
  return (
    <div className="flex items-center gap-7 border-b border-gborder px-6">
      {tabs.map((t) => {
        const on = t === active
        return (
          <button
            key={t}
            onClick={() => onChange(t)}
            className={`relative -mb-px h-11 text-14 ${on ? 'font-medium text-gblue-700' : 'text-gtext-secondary hover:text-gtext-primary'}`}
          >
            {t}
            {on && <span className="absolute inset-x-0 bottom-0 h-[3px] rounded-t bg-gblue-700" />}
          </button>
        )
      })}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Dropdown (button that opens a menu)                                        */
/* -------------------------------------------------------------------------- */

export function Dropdown({
  label,
  items,
  onSelect,
  className = '',
}: {
  label: React.ReactNode
  items: string[]
  onSelect?: (item: string) => void
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useOutside(ref, () => setOpen(false))
  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-8 items-center gap-1 rounded border border-gborder px-3 text-13 text-gtext-primary hover:bg-gbg-hover"
      >
        {label}
        <Icon name="arrow_drop_down" size={20} className="text-gtext-secondary" />
      </button>
      {open && (
        <div className="absolute left-0 z-30 mt-1 min-w-[180px] rounded bg-white py-1 shadow-gmenu">
          {items.map((it) => (
            <button
              key={it}
              onClick={() => {
                onSelect?.(it)
                setOpen(false)
              }}
              className="block w-full px-4 py-2 text-left text-13 text-gtext-primary hover:bg-gbg-page"
            >
              {it}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function useOutside(ref: React.RefObject<HTMLElement>, cb: () => void) {
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) cb()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  })
}

/* -------------------------------------------------------------------------- */
/* Filter bar (funnel chip + search input)                                    */
/* -------------------------------------------------------------------------- */

export function FilterBar({
  chip = 'Status: Active',
  count = 1,
  placeholder = 'Enter a search term or select filters',
}: {
  chip?: string
  count?: number
  placeholder?: string
}) {
  const [showChip, setShowChip] = useState(true)
  return (
    <div className="mx-6 mt-3 flex items-center gap-2 rounded border border-gborder bg-white px-2 py-1.5">
      <div className="relative flex h-8 w-8 items-center justify-center">
        <Icon name="filter_list" size={20} className="text-gblue-700" />
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gblue-600 px-1 text-[10px] font-medium text-white">
            {count}
          </span>
        )}
      </div>
      {showChip && chip && (
        <span className="flex items-center gap-1 rounded-full border border-gborder bg-white py-1 pl-3 pr-1 text-13 text-gtext-primary">
          {chip}
          <button onClick={() => setShowChip(false)} className="flex h-5 w-5 items-center justify-center rounded-full hover:bg-gbg-page">
            <Icon name="close" size={16} className="text-gtext-secondary" />
          </button>
        </span>
      )}
      <input
        placeholder={placeholder}
        className="h-8 flex-1 bg-transparent px-1 text-13 text-gtext-primary placeholder:text-gtext-secondary focus:outline-none"
      />
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Pagination footer                                                          */
/* -------------------------------------------------------------------------- */

export function Pagination({ total, rowsLabel = '1 – ' }: { total: number; rowsLabel?: string }) {
  return (
    <div className="flex items-center justify-end gap-6 px-6 py-3 text-12 text-gtext-secondary">
      <div className="flex items-center gap-2">
        <span>Rows per page:</span>
        <Dropdown label={<span className="text-13">20</span>} items={['10', '20', '50', '100']} />
      </div>
      <span>
        {rowsLabel}
        {total} of {total}
      </span>
      <div className="flex items-center gap-1">
        <IconButton name="first_page" label="First page" disabled />
        <IconButton name="chevron_left" label="Previous page" disabled />
        <IconButton name="chevron_right" label="Next page" disabled />
        <IconButton name="last_page" label="Last page" disabled />
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Empty state with illustration                                              */
/* -------------------------------------------------------------------------- */

export function EmptyState({
  title,
  subtitle,
  actions,
}: {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <EmptyIllustration />
      <div className="mt-6 text-15 font-medium text-gtext-primary">{title}</div>
      {subtitle && <div className="mt-1 max-w-md text-13 text-gtext-secondary">{subtitle}</div>}
      {actions && <div className="mt-5 flex items-center gap-3">{actions}</div>}
    </div>
  )
}

/** Generic two-people-at-a-board illustration in Google's flat style. */
export function EmptyIllustration() {
  return (
    <svg width="220" height="140" viewBox="0 0 220 140" fill="none">
      <rect x="70" y="20" width="80" height="60" rx="3" fill="#e8f0fe" stroke="#1a73e8" strokeWidth="1.5" />
      <rect x="78" y="30" width="40" height="5" rx="2.5" fill="#1a73e8" opacity=".5" />
      <rect x="78" y="40" width="64" height="4" rx="2" fill="#c1d3f7" />
      <rect x="78" y="48" width="64" height="4" rx="2" fill="#c1d3f7" />
      <rect x="78" y="56" width="40" height="4" rx="2" fill="#c1d3f7" />
      <circle cx="40" cy="58" r="9" fill="#fdd663" />
      <rect x="31" y="68" width="18" height="34" rx="6" fill="#1a73e8" />
      <rect x="33" y="100" width="6" height="22" rx="3" fill="#5f6368" />
      <rect x="41" y="100" width="6" height="22" rx="3" fill="#5f6368" />
      <circle cx="180" cy="58" r="9" fill="#f6aea9" />
      <rect x="171" y="68" width="18" height="34" rx="6" fill="#34a853" />
      <rect x="173" y="100" width="6" height="22" rx="3" fill="#5f6368" />
      <rect x="181" y="100" width="6" height="22" rx="3" fill="#5f6368" />
      <rect x="20" y="122" width="180" height="2" rx="1" fill="#dadce0" />
    </svg>
  )
}

/* -------------------------------------------------------------------------- */
/* Section container card                                                     */
/* -------------------------------------------------------------------------- */

export function Card({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return <div className={`rounded-lg border border-gborder bg-white ${className}`}>{children}</div>
}
