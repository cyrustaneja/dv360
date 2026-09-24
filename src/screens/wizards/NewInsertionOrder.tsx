import { useState } from 'react'
import { useNavigate, useSearchParams, useParams } from 'react-router-dom'
import { useBreadcrumb } from '../../components/layout/breadcrumb'
import { WizardShell, SectionTitle } from './WizardShell'
import { TextField, FormRow, RadioRow } from '../../components/ui/parts'
import { useStore } from '../../store'

const objectives = [
  'Insertion order without objective',
  'Raise awareness',
  'Drive consideration',
  'Drive action / performance',
]
const kpiTypes = [
  'Cost per thousand impressions (CPM)',
  'Cost per click (CPC)',
  'Cost per action (CPA)',
  'Click-through rate (CTR)',
  'Cost per completed view (CPCV)',
  'Viewable %',
  'CPIAVC',
  'Other / None',
]

export default function NewInsertionOrder() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const { state, addIO, updateIO, deleteEntity } = useStore()
  useBreadcrumb([{ label: 'Advertiser', name: state.currentAdvertiser?.name ?? '', to: '/advertiser/campaigns' }])

  const existing = id ? state.raw.ios.find((i) => i.id === id) : null
  const isEdit = Boolean(existing)
  const s = existing?.settings ?? {}
  const campaignId = existing?.campaign_id ?? searchParams.get('campaignId') ?? ''

  const [name, setName] = useState(existing?.name ?? '')
  const [objective, setObjective] = useState(s.objective ?? objectives[0])
  const [budget, setBudget] = useState(() => (existing?.budget ?? '').replace(/[^0-9.]/g, ''))
  const [budgetDesc, setBudgetDesc] = useState(s.budget_description ?? '')
  const [startDate, setStartDate] = useState(existing?.start_date ?? 'Jun 1, 2026')
  const [endDate, setEndDate] = useState(existing?.end_date ?? 'Jun 30, 2026')
  const [pacingPeriod, setPacingPeriod] = useState(existing?.pacing ?? 'Flight')
  const [pacingRate, setPacingRate] = useState(s.pacing_rate ?? 'Even')
  const [kpiType, setKpiType] = useState(existing?.kpi_type ?? kpiTypes[0])
  const [kpiValue, setKpiValue] = useState(existing?.kpi_value ?? '')
  const [freqMode, setFreqMode] = useState<'no_cap' | 'limited'>(existing?.freq_cap === 'limited' ? 'limited' : 'no_cap')
  const [freqCount, setFreqCount] = useState(s.freq_count ?? '3')
  const [freqPeriod, setFreqPeriod] = useState(s.freq_period ?? 'day')
  const [status, setStatus] = useState(existing?.status ?? 'active')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) { setError('Insertion order name is required.'); return }
    if (!campaignId) { setError('Open a campaign first, then add an insertion order inside it.'); return }
    setBusy(true)
    const payload = {
      campaign_id: campaignId,
      name: name.trim(),
      budget: budget ? `₹${budget}` : '₹0.00',
      pacing: pacingPeriod,
      freq_cap: freqMode,
      kpi_type: kpiType,
      kpi_value: kpiValue,
      start_date: startDate,
      end_date: endDate,
      status,
      settings: {
        objective,
        budget_description: budgetDesc,
        pacing_rate: pacingRate,
        freq_count: freqCount,
        freq_period: freqPeriod,
      },
    }
    if (isEdit && id) {
      const ok = await updateIO(id, payload)
      setBusy(false)
      if (!ok) { setError('Could not save. Try again.'); return }
      navigate(`/advertiser/insertion-orders/${id}`)
    } else {
      const newId = await addIO(payload)
      setBusy(false)
      if (!newId) { setError('Could not save. Try again.'); return }
      navigate(`/advertiser/campaigns/${campaignId}`)
    }
  }

  const handleDelete = async () => {
    if (!id || !confirm('Delete this insertion order? This also deletes its line items.')) return
    setBusy(true)
    const ok = await deleteEntity('io', id)
    setBusy(false)
    if (ok) navigate(`/advertiser/campaigns/${campaignId}`)
    else setError('Could not delete. Try again.')
  }

  return (
    <WizardShell title={isEdit ? 'Edit insertion order' : 'New insertion order'} primary={isEdit ? 'Save' : 'Create'} onPrimary={handleSave} busy={busy} onDelete={isEdit ? handleDelete : undefined}>
      <div className="rounded bg-gblue-50 px-3 py-2 text-12 text-gtext-secondary">
        Inventory source and Targeting settings are managed at the line item level. Use targeting templates for easy reuse.
      </div>

      <SectionTitle>Insertion order details</SectionTitle>
      <div className="border-t border-gborder-light pt-3">
        <FormRow label="Insertion order name">
          <TextField placeholder="Enter a name" value={name} onChange={setName} width="w-full" />
          {error && <p className="mt-1 text-12 text-gstatus-red">{error}</p>}
        </FormRow>

        <FormRow label="Objective" hint="Choose a KPI and bid strategy for this objective.">
          <select value={objective} onChange={(e) => setObjective(e.target.value)} className="h-9 w-80 rounded border border-gborder px-2 text-14">
            {objectives.map((o) => <option key={o}>{o}</option>)}
          </select>
        </FormRow>
      </div>

      <SectionTitle>Budget</SectionTitle>
      <div className="border-t border-gborder-light pt-3">
        <FormRow label="Budget" hint="Budget type: INR">
          <div className="flex flex-wrap items-end gap-3">
            <TextField label="Amount (₹)" placeholder="0.00" value={budget} onChange={setBudget} width="w-40" />
            <TextField label="Description" value={budgetDesc} onChange={setBudgetDesc} width="w-48" />
            <TextField label="Start date" value={startDate} onChange={setStartDate} width="w-36" />
            <TextField label="End date" value={endDate} onChange={setEndDate} width="w-36" />
          </div>
        </FormRow>

        <FormRow label="Pacing" hint="How do you want to spend the flight budget?">
          <div className="flex items-end gap-3">
            <div>
              <label className="mb-1 block text-12 text-gtext-secondary">Period</label>
              <select value={pacingPeriod} onChange={(e) => setPacingPeriod(e.target.value)} className="h-9 w-44 rounded border border-gborder px-2 text-14">
                <option>Flight</option>
                <option>Daily</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-12 text-gtext-secondary">Rate</label>
              <select value={pacingRate} onChange={(e) => setPacingRate(e.target.value)} className="h-9 w-36 rounded border border-gborder px-2 text-14">
                <option>Even</option>
                <option>Ahead</option>
                <option>ASAP</option>
              </select>
            </div>
          </div>
        </FormRow>
      </div>

      <SectionTitle>KPI &amp; optimization</SectionTitle>
      <div className="border-t border-gborder-light pt-3">
        <FormRow label="KPI" hint="What KPI do you want to use for your insertion order?">
          <div className="flex items-end gap-3">
            <div>
              <label className="mb-1 block text-12 text-gtext-secondary">KPI type</label>
              <select value={kpiType} onChange={(e) => setKpiType(e.target.value)} className="h-9 w-44 rounded border border-gborder px-2 text-14">
                {kpiTypes.map((k) => <option key={k}>{k}</option>)}
              </select>
            </div>
            <TextField label="Target value" placeholder="0.00" value={kpiValue} onChange={setKpiValue} width="w-36" />
          </div>
        </FormRow>

        <FormRow label="Frequency cap" hint="Limit how often a user sees ads in this insertion order.">
          <RadioRow label="No cap" checked={freqMode === 'no_cap'} onChange={() => setFreqMode('no_cap')} />
          <RadioRow label="Limit frequency" checked={freqMode === 'limited'} onChange={() => setFreqMode('limited')} />
          {freqMode === 'limited' && (
            <div className="mt-2 flex items-end gap-3 pl-6">
              <TextField label="Exposures" value={freqCount} onChange={setFreqCount} width="w-28" />
              <div>
                <label className="mb-1 block text-12 text-gtext-secondary">Per</label>
                <select value={freqPeriod} onChange={(e) => setFreqPeriod(e.target.value)} className="h-9 rounded border border-gborder px-2 text-14">
                  <option value="hour">Hour</option>
                  <option value="day">Day</option>
                  <option value="week">Week</option>
                  <option value="month">Month</option>
                </select>
              </div>
            </div>
          )}
        </FormRow>

        {isEdit && (
          <FormRow label="Status">
            <RadioRow label="Active" checked={status === 'active'} onChange={() => setStatus('active')} />
            <RadioRow label="Paused" checked={status === 'paused'} onChange={() => setStatus('paused')} />
            <RadioRow label="Draft" checked={status === 'draft'} onChange={() => setStatus('draft')} />
          </FormRow>
        )}
      </div>
    </WizardShell>
  )
}
