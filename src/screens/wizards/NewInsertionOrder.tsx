import { useState } from 'react'
import { useNavigate, useSearchParams, useParams } from 'react-router-dom'
import { useBreadcrumb } from '../../components/layout/breadcrumb'
import { WizardShell } from './WizardShell'
import { TextField } from '../../components/ui/parts'
import { useStore } from '../../store'

/**
 * New insertion order = name it, then drop into the EXACT IO detail editor
 * (InsertionOrderDetail → "Insertion order details" tab), mirroring how DV360
 * works (create == edit on the same page). Edit links go straight to that page.
 */
export default function NewInsertionOrder() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const { state, addIO } = useStore()
  useBreadcrumb([{ label: 'Advertiser', name: state.currentAdvertiser?.name ?? '', to: '/advertiser/campaigns' }])

  const existing = id ? state.raw.ios.find((i) => i.id === id) : null
  const campaignId = existing?.campaign_id ?? searchParams.get('campaignId') ?? ''

  const [name, setName] = useState(existing?.name ?? '')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  // Editing an existing IO is done on its detail page — send the user there.
  if (existing) { navigate(`/advertiser/insertion-orders/${existing.id}`, { replace: true }); return null }

  const handleCreate = async () => {
    if (!name.trim()) { setError('Insertion order name is required.'); return }
    if (!campaignId) { setError('Open a campaign first, then add an insertion order inside it.'); return }
    setBusy(true)
    const newId = await addIO({
      campaign_id: campaignId,
      name: name.trim(),
      status: 'draft',
      budget: '₹0.00',
      pacing: 'Flight',
      kpi_type: 'Cost per thousand impressions (CPM)',
      settings: { objective: 'Insertion order without objective' },
    })
    setBusy(false)
    if (!newId) { setError('Could not create. Try again.'); return }
    // Land in the exact IO detail editor to fill in every setting.
    navigate(`/advertiser/insertion-orders/${newId}`)
  }

  return (
    <WizardShell title="New insertion order" primary="Create" onPrimary={handleCreate} busy={busy}>
      <div className="max-w-2xl">
        <div className="mb-4 flex items-start gap-2 rounded-g border border-gblue-50 bg-gblue-50 px-4 py-3 text-13 text-gtext-strong">
          Name your insertion order to create it. You'll then set budget, pacing, KPI, optimization and frequency on the next screen.
        </div>
        <TextField placeholder="" value={name} onChange={(v) => setName(v.slice(0, 240))} width="w-full" label="Insertion order name" />
        <div className="mt-1 text-12 text-gtext-secondary">Text is {name.length} characters out of 240</div>
        {error && <p className="mt-1 text-12 text-gstatus-red">{error}</p>}
      </div>
    </WizardShell>
  )
}
