import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useBreadcrumb } from '../../components/layout/breadcrumb'
import { WizardShell, SectionTitle } from './WizardShell'
import { TextField, FormRow, RadioRow } from '../../components/ui/parts'
import { Icon } from '../../lib/icons'
import { useStore } from '../../store'

// Official DV360 campaign goals (Help Center answer 7205081).
const goals = [
  { icon: 'visibility', title: 'Raise awareness of my brand or product' },
  { icon: 'ads_click', title: 'Drive online action or visits' },
  { icon: 'storefront', title: 'Drive offline or in-store action' },
  { icon: 'block', title: 'No specific goal / Show ads' },
]
const kpiOptions = [
  'Maximize quality impressions',
  'Reach unique users',
  'Maximize clicks',
  'Maximize conversions',
  'Maximize viewable impressions',
]
const creativeTypes = ['Display', 'Video', 'Audio', 'YouTube & partners']
// Default targeting dimensions inherited by new IOs + line items.
const defaultTargeting = ['Demographics', 'Geography', 'Language', 'Brand safety', 'Inventory source', 'Environment', 'Viewability', 'Position']

export default function NewCampaign() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { state, addCampaign, updateCampaign, deleteEntity } = useStore()
  useBreadcrumb([{ label: 'Advertiser', name: state.currentAdvertiser?.name ?? '', to: '/advertiser/campaigns' }])

  const existing = id ? state.raw.campaigns.find((c) => c.id === id) : null
  const isEdit = Boolean(existing)
  const s = existing?.settings ?? {}

  const [goal, setGoal] = useState(() => Math.max(0, goals.findIndex((g) => g.title === existing?.goal)))
  const [name, setName] = useState(existing?.name ?? '')
  const [kpi, setKpi] = useState(() => Math.max(0, kpiOptions.findIndex((k) => k === existing?.kpi_goal)))
  const [kpiAmount, setKpiAmount] = useState(s.kpi_amount ?? '')
  const [creativeType, setCreativeType] = useState(s.creative_type ?? creativeTypes[0])
  const [amount, setAmount] = useState(existing?.planned_spend ?? '')
  const [from, setFrom] = useState(existing?.start_date ?? 'Jun 1, 2026')
  const [to, setTo] = useState(existing?.end_date ?? 'Jun 30, 2026')
  const [freqMode, setFreqMode] = useState<'no_cap' | 'limited'>(s.freq_mode === 'limited' ? 'limited' : 'no_cap')
  const [freqCount, setFreqCount] = useState(s.freq_count ?? '3')
  const [freqPeriod, setFreqPeriod] = useState(s.freq_period ?? 'day')
  const [publicInv, setPublicInv] = useState<boolean>(s.public_inventory ?? true)
  const [quality, setQuality] = useState<string>(s.quality ?? 'Authorized and Non-Participating Publishers')
  const [status, setStatus] = useState(existing?.status ?? 'active')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) { setError('Campaign name is required.'); return }
    setBusy(true)
    const payload = {
      name: name.trim(),
      goal: goals[goal].title,
      kpi_goal: kpiOptions[kpi],
      budget: amount ? `₹${amount}` : 'Unknown',
      planned_spend: amount,
      start_date: from,
      end_date: to,
      status,
      settings: {
        ...s,
        kpi_amount: kpiAmount,
        creative_type: creativeType,
        freq_mode: freqMode, freq_count: freqCount, freq_period: freqPeriod,
        public_inventory: publicInv, quality,
      },
    }
    if (isEdit && id) {
      const ok = await updateCampaign(id, payload)
      setBusy(false)
      if (!ok) { setError('Could not save changes. Try again.'); return }
      navigate(`/advertiser/campaigns/${id}`)
    } else {
      const newId = await addCampaign(payload)
      setBusy(false)
      if (!newId) { setError('Could not save. Check your connection and try again.'); return }
      navigate(`/advertiser/campaigns/${newId}`)
    }
  }

  const handleDelete = async () => {
    if (!id || !confirm('Delete this campaign? This also deletes its insertion orders and line items.')) return
    setBusy(true)
    const ok = await deleteEntity('campaign', id)
    setBusy(false)
    if (ok) navigate('/advertiser/campaigns')
    else setError('Could not delete. Try again.')
  }

  return (
    <WizardShell title={isEdit ? 'Edit campaign' : 'New campaign'} primary={isEdit ? 'Save' : 'Create'} onPrimary={handleSave} busy={busy} onDelete={isEdit ? handleDelete : undefined}>
      {/* Name */}
      <SectionTitle>Campaign name</SectionTitle>
      <div className="max-w-2xl border-t border-gborder-light pt-4">
        <TextField placeholder="" value={name} onChange={(v) => setName(v.slice(0, 240))} width="w-full" label="Name" />
        <div className="mt-1 text-12 text-gtext-secondary">Text is {name.length} characters out of 240</div>
        {error && <p className="mt-1 text-12 text-gstatus-red">{error}</p>}
      </div>

      {/* Goal + KPI */}
      <SectionTitle>Goal</SectionTitle>
      <p className="text-13 text-gtext-secondary">Your goal and KPI power optimization recommendations and performance tracking.</p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {goals.map((g, i) => (
          <button key={g.title} onClick={() => setGoal(i)}
            className={`flex items-start gap-3 rounded-g border p-4 text-left ${goal === i ? 'border-gblue-600 bg-gblue-50' : 'border-gborder hover:bg-gbg-hover'}`}>
            <Icon name={g.icon} size={22} className={goal === i ? 'text-gblue-700' : 'text-gtext-secondary'} />
            <span className="text-14 text-gtext-primary">{g.title}</span>
          </button>
        ))}
      </div>
      <div className="mt-4 border-t border-gborder-light pt-4">
        <FormRow label="KPI" hint="How will you measure success?">
          {kpiOptions.map((opt, i) => <RadioRow key={opt} label={opt} checked={kpi === i} onChange={() => setKpi(i)} />)}
          <div className="mt-2 pl-6">
            <TextField label="Target KPI amount (optional)" placeholder="e.g. ₹100 CPM" value={kpiAmount} onChange={setKpiAmount} width="w-56" />
          </div>
        </FormRow>

        {/* Creative type */}
        <FormRow label="Creative type" hint="Choose the creative type you expect to use.">
          <select value={creativeType} onChange={(e) => setCreativeType(e.target.value)} className="h-9 w-64 rounded border border-gborder px-2 text-14">
            {creativeTypes.map((t) => <option key={t}>{t}</option>)}
          </select>
        </FormRow>

        {/* Planned spend + dates */}
        <FormRow label="Planned spend" hint="Optional. Doesn't limit serving — used to track budget.">
          <div className="flex flex-wrap items-end gap-3">
            <TextField label="Amount (₹)" placeholder="0.00" value={amount} onChange={setAmount} width="w-48" />
            <TextField label="Start date" value={from} onChange={setFrom} width="w-44" />
            <TextField label="End date" value={to} onChange={setTo} width="w-44" />
          </div>
        </FormRow>

        {/* Frequency cap */}
        <FormRow label="Frequency cap" hint="Caps how often a user sees ads across all IOs and line items.">
          <RadioRow label="No cap" checked={freqMode === 'no_cap'} onChange={() => setFreqMode('no_cap')} />
          <RadioRow label="Limit frequency to" checked={freqMode === 'limited'} onChange={() => setFreqMode('limited')} />
          {freqMode === 'limited' && (
            <div className="mt-2 flex items-end gap-3 pl-6">
              <TextField label="Exposures" value={freqCount} onChange={setFreqCount} width="w-28" />
              <div>
                <label className="mb-1 block text-12 text-gtext-secondary">Per</label>
                <select value={freqPeriod} onChange={(e) => setFreqPeriod(e.target.value)} className="h-9 rounded border border-gborder px-2 text-14">
                  <option value="hour">Hour</option><option value="day">Day</option><option value="week">Week</option><option value="month">Month</option>
                </select>
              </div>
            </div>
          )}
        </FormRow>
      </div>

      {/* Inventory source */}
      <SectionTitle>Inventory source</SectionTitle>
      <div className="max-w-2xl space-y-4 border-t border-gborder-light pt-4">
        <div>
          <div className="text-14 font-medium text-gtext-primary">Quality</div>
          <div className="mb-2 text-13 text-gtext-secondary">Select inventory source quality based on Authorized Sellers.</div>
          <select value={quality} onChange={(e) => setQuality(e.target.value)} className="h-12 w-[420px] rounded border border-gborder px-3 text-14">
            <option>Authorized and Non-Participating Publishers</option>
            <option>Authorized Direct Sellers and Resellers</option>
            <option>Authorized Direct Sellers</option>
          </select>
        </div>
        <label className="flex items-center gap-3 rounded-g border border-gborder px-4 py-3">
          <input type="checkbox" checked={publicInv} onChange={(e) => setPublicInv(e.target.checked)} className="accent-gblue-600" />
          <span><span className="text-14 text-gtext-primary">Public Inventory</span>
            <span className="block text-13 text-gtext-secondary">Public inventory, deals and auction packages, and grouped deals.</span></span>
        </label>
      </div>

      {/* Default targeting */}
      <SectionTitle>Default targeting</SectionTitle>
      <p className="text-13 text-gtext-secondary">New insertion orders and line items in this campaign inherit these settings.</p>
      <div className="mt-3 max-w-2xl divide-y divide-gborder-light rounded-g border border-gborder">
        {defaultTargeting.map((d) => (
          <div key={d} className="flex items-center justify-between px-4 py-2.5">
            <span className="text-14 text-gtext-primary">{d}</span>
            <button className="text-13 font-medium text-glink hover:underline">Add</button>
          </div>
        ))}
      </div>

      {isEdit && (
        <>
          <SectionTitle>Status</SectionTitle>
          <div className="border-t border-gborder-light pt-3">
            <RadioRow label="Active" checked={status === 'active'} onChange={() => setStatus('active')} />
            <RadioRow label="Paused" checked={status === 'paused'} onChange={() => setStatus('paused')} />
          </div>
        </>
      )}
    </WizardShell>
  )
}
