import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../lib/icons'
import { Button } from '../../components/ui/primitives'

/** Full-screen wizard chrome: close affordance, title, sticky create/cancel. */
export function WizardShell({
  title,
  children,
  primary = 'Create',
  onPrimary,
  busy,
  onDelete,
}: {
  title: string
  children: React.ReactNode
  primary?: string
  onPrimary?: () => void
  busy?: boolean
  /** When provided (edit mode), shows a Delete button. */
  onDelete?: () => void
}) {
  const navigate = useNavigate()
  const close = () => navigate(-1)
  return (
    <div className="flex min-h-full flex-col">
      <div className="flex h-12 shrink-0 items-center gap-3 border-b border-gborder px-4">
        <button onClick={close} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-gbg-page">
          <Icon name="close" size={20} className="text-gtext-secondary" />
        </button>
        <h1 className="text-16 text-gtext-primary">{title}</h1>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-4xl px-6 py-6">{children}</div>
      </div>

      <div className="sticky bottom-0 flex items-center gap-4 border-t border-gborder bg-white px-6 py-3">
        <Button variant="filled" size="sm" onClick={onPrimary ?? close} disabled={busy}>
          {busy ? 'Saving…' : primary}
        </Button>
        <button onClick={close} className="text-14 font-medium text-glink hover:underline">
          Cancel
        </button>
        {onDelete && (
          <button
            onClick={onDelete}
            disabled={busy}
            className="ml-auto flex items-center gap-1 text-13 font-medium text-gstatus-red hover:underline"
          >
            <Icon name="delete" size={18} /> Delete
          </button>
        )}
      </div>
    </div>
  )
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-1 mt-6 font-gsans text-16 font-medium text-gtext-primary">{children}</h2>
}
