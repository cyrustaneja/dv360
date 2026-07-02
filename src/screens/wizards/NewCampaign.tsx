import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useBreadcrumb } from '../../components/layout/breadcrumb'
import { WizardShell, SectionTitle } from './WizardShell'
import { TextField, FormRow, RadioRow } from '../../components/ui/parts'
import { Icon } from '../../lib/icons'
import { useStore } from '../../store'

const goals = [
  { icon: 'visibility', title: 'Raise awareness of my brand or product' },
  { icon: 'ads_click', title: 'Drive online action or visits' },
  { icon: 'storefront', title: 'Drive offline or in-store sales' },
  { icon: 'install_mobile', title: 'Drive app installs or engagements' },
]

const kpiOptions = [
  'Maximize quality impressions',
  'Reach unique users',
  'Maximize clicks',
  'Maximize conversions',
  'Maximize viewable impressions',
]

export default function NewCampaign() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { state, addCampaign, updateCampaign, deleteEntity } = useStore()
  useBreadcrumb([{ label: 'Advertiser', name: state.currentAdvertiser?.name ?? '', to: '/advertiser/campaigns' }])

  // Edit mode: prefill from the saved row.
  const existing = id ? state.raw.campaigns.find((c) => c.id === id) : null
  const isEdit = Boolean(existing)
  const s = existing?.settings ?? {}

  const [goal, setGoal] = useState(() => Math.max(0, goals.findIndex((g) => g.title === existing?.goal)))
  const [name, setName] = useState(existing?.name ?? '')
  const [kpi, setKpi] = useState(() => Math.max(0, kpiOptions.findIndex((k) => k === existing?.kpi_goal)))
  const [amount, setAmount] = useState(existing?.planned_spend ?? '')
  const [from, setFrom] = useState(existing?.start_date ?? 'Jun 1, 2026')
  const [to, setTo] = useState(existing?.end_date ?? 'Jun 30, 2026')
  const [freqMode, setFreqMode] = useState<'no_cap' | 'limited'>(s.freq_mode === 'limited' ? 'limited' : 'no_cap')
  const [freqCount, setFreqCount] = useState(s.freq_count ?? '3')
  const [freqPeriod, setFreqPeriod] = useState(s.freq_period ?? 'day')
  const [status, setStatus] = useState(existing?.status ?? 'active')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Campaign name is required.')
      return
    }
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
      settings: { freq_mode: freqMode, freq_count: freqCount, freq_period: freqPeriod },
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
      <SectionTitle>Campaign goal</SectionTitle>
      <p className="text-12 text-gtext-secondary">Choose the goal that best fits what you want this campaign to achieve.</p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {goals.map((g, i) => (
          <button
            key={g.title}
            onClick={() => setGoal(i)}
            className={`flex items-start gap-3 rounded-lg border p-4 text-left ${
              goal === i ? 'border-gblue-600 bg-gblue-50' : 'border-gborder hover:bg-gbg-hover'
            }`}
          >
            <Icon name={g.icon} size={22} className={goal === i ? 'text-gblue-700' : 'text-gtext-secondary'} />
            <span className="text-13 text-gtext-primary">{g.title}</span>
          </button>
        ))}
      </div>

      <SectionTitle>Campaign details</SectionTitle>
      <div className="border-t border-gborder-light pt-3">
        <FormRow label="Campaign name">
          <TextField placeholder="Enter a campaign name" value={name} onChange={setName} width="w-full" />
          {error && <p className="mt-1 text-12 text-gstatus-red">{error}</p>}
        </FormRow>

        <FormRow label="Campaign goal KPI" hint="How will you measure success?">
          {kpiOptions.map((opt, i) => (
            <RadioRow key={opt} label={opt} checked={kpi === i} onChange={() => setKpi(i)} />
          ))}
        </FormRow>

        <FormRow label="Planned spend" hint="Set a budget to track planning against actuals.">
          <div className="flex flex-wrap items-end gap-3">
            <TextField label="Amount (₹)" placeholder="0.00" value={amount} onChange={setAmount} width="w-48" />
            <TextField label="From" value={from} onChange={setFrom} width="w-44" />
            <TextField label="To" value={to} onChange={setTo} width="w-44" />
          </div>
        </FormRow>

        <FormRow label="Frequency cap" hint="Limit how often a user sees your ads.">
          <RadioRow label="No cap (Recommended)" checked={freqMode === 'no_cap'} onChange={() => setFreqMode('no_cap')} />
          <RadioRow label="Set a frequency cap" checked={freqMode === 'limited'} onChange={() => setFreqMode('limited')} />
          {freqMode === 'limited' && (
            <div className="mt-2 flex items-end gap-3 pl-6">
              <TextField label="Exposures" value={freqCount} onChange={setFreqCount} width="w-28" />
              <div>
                <label className="mb-1 block text-12 text-gtext-secondary">Per</label>
                <select
                  value={freqPeriod}
                  onChange={(e) => setFreqPeriod(e.target.value)}
                  className="h-9 rounded border border-gborder px-2 text-13"
                >
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
          </FormRow>
        )}
      </div>
    </WizardShell>
  )
}
