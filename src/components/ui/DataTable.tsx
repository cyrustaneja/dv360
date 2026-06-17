import React, { useState } from 'react'
import { Icon } from '../../lib/icons'

export interface Column<T> {
  key: string
  header: string
  align?: 'left' | 'right'
  group?: string
  render?: (row: T) => React.ReactNode
  className?: string
}

interface Props<T extends { id: string }> {
  columns: Column<T>[]
  rows: T[]
  /** Render a leading status dot / type icon cell before the name column. */
  leading?: (row: T) => React.ReactNode
  onRowClick?: (row: T) => void
}

/**
 * DV360 data table — selectable rows, sortable column affordance, optional
 * grouped column headers (e.g. the "Delivery" span over budget metrics).
 */
export function DataTable<T extends { id: string }>({ columns, rows, leading, onRowClick }: Props<T>) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [asc, setAsc] = useState(true)

  const allChecked = rows.length > 0 && selected.size === rows.length
  const someChecked = selected.size > 0 && !allChecked

  const toggleAll = () => setSelected(allChecked ? new Set() : new Set(rows.map((r) => r.id)))
  const toggleOne = (id: string) =>
    setSelected((s) => {
      const n = new Set(s)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })

  const groups = computeGroups(columns)
  const hasGroups = groups.some((g) => g.label)

  const onSort = (key: string) => {
    if (sortKey === key) setAsc((a) => !a)
    else {
      setSortKey(key)
      setAsc(true)
    }
  }

  return (
    <div className="overflow-x-auto px-6">
      <table className="w-full min-w-[860px] border-collapse text-13">
        <thead>
          {hasGroups && (
            <tr className="text-11 text-gtext-secondary">
              <th className="w-10 border-b border-gborder" />
              <th className="border-b border-gborder" />
              {groups.map((g, i) => (
                <th
                  key={i}
                  colSpan={g.span}
                  className="border-b border-gborder pb-1 pl-3 text-left font-normal"
                >
                  {g.label}
                </th>
              ))}
            </tr>
          )}
          <tr className="text-11 uppercase tracking-wide text-gtext-secondary">
            <th className="w-10 border-b border-gborder px-3 py-2">
              <Checkbox checked={allChecked} indeterminate={someChecked} onChange={toggleAll} />
            </th>
            <th className="w-8 border-b border-gborder" />
            {columns.map((c) => (
              <th
                key={c.key}
                className={`group cursor-pointer border-b border-gborder py-2 pl-3 pr-3 font-medium ${
                  c.align === 'right' ? 'text-right' : 'text-left'
                }`}
                onClick={() => onSort(c.key)}
              >
                <span className="inline-flex items-center gap-1">
                  {c.align === 'right' && <SortCaret active={sortKey === c.key} asc={asc} />}
                  {c.header}
                  {c.align !== 'right' && <SortCaret active={sortKey === c.key} asc={asc} />}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className={`group border-b border-gborder-light hover:bg-gbg-rowhover ${onRowClick ? 'g-clickable' : ''}`}
              onClick={() => onRowClick?.(row)}
            >
              <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                <Checkbox checked={selected.has(row.id)} onChange={() => toggleOne(row.id)} />
              </td>
              <td className="py-2.5">{leading?.(row)}</td>
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={`py-2.5 pl-3 pr-3 ${c.align === 'right' ? 'text-right tabular-nums' : 'text-left'} ${
                    c.className ?? ''
                  }`}
                >
                  {c.render ? c.render(row) : (row as Record<string, unknown>)[c.key] as React.ReactNode}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function SortCaret({ active, asc }: { active: boolean; asc: boolean }) {
  return (
    <Icon
      name="arrow_upward"
      size={14}
      className={`transition ${active ? 'text-gtext-primary' : 'text-transparent group-hover:text-gtext-disabled'} ${
        active && !asc ? 'rotate-180' : ''
      }`}
    />
  )
}

export function Checkbox({
  checked,
  indeterminate,
  onChange,
}: {
  checked: boolean
  indeterminate?: boolean
  onChange?: () => void
}) {
  return (
    <button
      onClick={onChange}
      className={`flex h-[18px] w-[18px] items-center justify-center rounded-sm border ${
        checked || indeterminate ? 'border-gblue-600 bg-gblue-600 text-white' : 'border-gtext-secondary bg-white'
      }`}
      aria-checked={checked}
      role="checkbox"
    >
      {indeterminate ? (
        <span className="h-0.5 w-2.5 bg-white" />
      ) : checked ? (
        <Icon name="check" size={14} className="text-white" />
      ) : null}
    </button>
  )
}

function computeGroups<T>(columns: Column<T>[]) {
  const out: { label: string; span: number }[] = []
  for (const c of columns) {
    const label = c.group ?? ''
    const last = out[out.length - 1]
    if (last && last.label === label) last.span += 1
    else out.push({ label, span: 1 })
  }
  return out
}
