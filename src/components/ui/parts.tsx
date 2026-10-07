import React from 'react'
import { Icon } from '../../lib/icons'
import { Button, IconButton, Dropdown } from './primitives'

/* -------------------------------------------------------------------------- */
/* Table toolbar (primary action + date range + view controls)               */
/* -------------------------------------------------------------------------- */

export function TableToolbar({
  primary,
  onPrimary,
  primaryDisabled,
  dateLabel = 'Jun 1, 2026',
  extra,
}: {
  primary?: string
  onPrimary?: () => void
  primaryDisabled?: boolean
  dateLabel?: string
  extra?: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-3 px-6 pt-3">
      {primary && (
        <Button variant="filled" size="sm" disabled={primaryDisabled} onClick={onPrimary}>
          {primary}
        </Button>
      )}
      {extra}
      <Dropdown label={<span className="flex items-center gap-1 text-14"><Icon name="calendar_today" size={16} className="text-gtext-secondary" />{dateLabel}</span>} items={['Today', 'Yesterday', 'Last 7 days', 'Last 30 days', 'This month', 'Custom']} />
      <div className="ml-auto flex items-center gap-1">
        <IconButton name="filter_list" label="Filter" />
        <IconButton name="view_column" label="Columns" />
        <IconButton name="more_vert" label="More options" />
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Metric card (overview / campaign / IO summary tiles)                       */
/* -------------------------------------------------------------------------- */

export function MetricCard({
  title,
  value,
  sub,
  children,
  className = '',
}: {
  title: string
  value?: string
  sub?: string
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div className={`rounded-lg border border-gborder bg-white p-4 ${className}`}>
      <div className="flex items-center gap-1 text-12 text-gtext-secondary">
        {title}
        <Icon name="info" size={14} className="text-gtext-disabled" />
      </div>
      {value && <div className="mt-1 font-gsans text-[22px] text-gtext-primary">{value}</div>}
      {sub && <div className="text-12 text-gtext-secondary">{sub}</div>}
      {children}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Form scaffolding for wizards & settings                                    */
/* -------------------------------------------------------------------------- */

/** Left-label / right-control row used across DV360 settings forms. */
export function FormRow({
  label,
  children,
  hint,
}: {
  label: string
  children: React.ReactNode
  hint?: string
}) {
  return (
    <div className="grid grid-cols-[180px_1fr] gap-6 border-b border-gborder-light py-5">
      <div>
        <div className="text-14 font-medium text-gtext-primary">{label}</div>
        {hint && <div className="mt-1 text-12 text-gtext-secondary">{hint}</div>}
      </div>
      <div className="max-w-2xl">{children}</div>
    </div>
  )
}

export function TextField({
  label,
  value,
  defaultValue,
  placeholder,
  width = 'w-full',
  onChange,
  type = 'text',
  readOnly,
}: {
  label?: string
  value?: string
  defaultValue?: string
  placeholder?: string
  width?: string
  onChange?: (v: string) => void
  type?: string
  readOnly?: boolean
}) {
  return (
    <label className={`relative block ${width}`}>
      <input
        type={type}
        value={value}
        defaultValue={value === undefined ? defaultValue : undefined}
        placeholder={placeholder}
        readOnly={readOnly}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        className={`peer h-12 w-full rounded border border-gborder bg-white px-3 pt-3 text-14 text-gtext-primary focus:border-gblue-600 focus:outline-none ${readOnly ? 'cursor-default bg-gbg-page' : ''}`}
      />
      {label && (
        <span className="pointer-events-none absolute left-3 top-1.5 text-11 text-gtext-secondary">{label}</span>
      )}
    </label>
  )
}

export function RadioRow({
  label,
  checked,
  hint,
  onChange,
}: {
  label: string
  checked?: boolean
  hint?: string
  onChange?: () => void
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 py-2" onClick={onChange}>
      <span
        className={`mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 ${
          checked ? 'border-gblue-600' : 'border-gtext-secondary'
        }`}
      >
        {checked && <span className="h-2.5 w-2.5 rounded-full bg-gblue-600" />}
      </span>
      <span>
        <span className="text-14 text-gtext-primary">{label}</span>
        {hint && <span className="block text-12 text-gtext-secondary">{hint}</span>}
      </span>
    </label>
  )
}

export function CheckRow({
  label,
  checked,
  hint,
  onChange,
}: {
  label: string
  checked?: boolean
  hint?: string
  onChange?: (v: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 py-1.5" onClick={() => onChange?.(!checked)}>
      <span
        className={`mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-sm border ${
          checked ? 'border-gblue-600 bg-gblue-600 text-white' : 'border-gtext-secondary bg-white'
        }`}
      >
        {checked && <Icon name="check" size={14} className="text-white" />}
      </span>
      <span>
        <span className="text-14 text-gtext-primary">{label}</span>
        {hint && <span className="block text-12 text-gtext-secondary">{hint}</span>}
      </span>
    </label>
  )
}

/** Multi-select chip selector used in line item type chooser */
export function SelectField({
  label,
  value,
  options,
  onChange,
  width = 'w-full',
}: {
  label?: string
  value: string
  options: string[]
  onChange: (v: string) => void
  width?: string
}) {
  return (
    <label className={`relative block ${width}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full appearance-none rounded border border-gborder bg-white px-3 pt-3 text-14 text-gtext-primary focus:border-gblue-600 focus:outline-none"
      >
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      {label && (
        <span className="pointer-events-none absolute left-3 top-1.5 text-11 text-gtext-secondary">{label}</span>
      )}
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gtext-secondary">▾</span>
    </label>
  )
}

/* -------------------------------------------------------------------------- */
/* Sticky form action bar (Save / Reset + note)                              */
/* -------------------------------------------------------------------------- */

export function FormActionBar({
  note = 'Optional: Enter a note about this change',
  onSave,
  saved,
}: {
  note?: string
  onSave?: () => void
  saved?: boolean
}) {
  return (
    <div className="sticky bottom-0 flex items-center gap-4 border-t border-gborder bg-white px-6 py-3">
      <Button variant="filled" size="sm" onClick={onSave}>
        {saved ? 'Saved ✓' : 'Save'}
      </Button>
      <button className="text-14 font-medium text-gblue-700 hover:underline">Reset</button>
      <input
        placeholder={note}
        className="h-9 max-w-md flex-1 rounded border border-gborder px-3 text-14 placeholder:text-gtext-secondary focus:border-gblue-600 focus:outline-none"
      />
    </div>
  )
}
