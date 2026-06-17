import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
  const { state, addCampaign } = useStore()
  useBreadcrumb([{ label: 'Advertiser', name: state.currentAdvertiser?.name ?? '', to: '/advertiser/campaigns' }])

  const [goal, setGoal] = useState(0)
  const [name, setName] = useState('')
  const [kpi, setKpi] = useState(0)
  const [amount, setAmount] = useState('')
  const [from, setFrom] = useState('Jun 1, 2026')
  const [to, setTo] = useState('Jun 30, 2026')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Campaign name is required.')
      return
    }
    setBusy(true)
    const id = await addCampaign({
      name: name.trim(),
      goal: goals[goal].title,
      kpi_goal: kpiOptions[kpi],
      budget: amount ? `₹${amount}` : 'Unknown',
      planned_spend: amount,
      start_date: from,
      end_date: to,
    })
    setBusy(false)
    if (!id) {
      setError('Could not save. Check your connection and try again.')
      return
    }
    navigate(`/advertiser/campaigns/${id}`)
  }

  return (
    <WizardShell title="New campaign" onPrimary={handleCreate} busy={busy}>
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
          <TextField
            placeholder="Enter a campaign name"
            value={name}
            onChange={setName}
            width="w-full"
          />
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
          <RadioRow label="No cap (Recommended)" checked={true} />
          <RadioRow label="Set a frequency cap" />
        </FormRow>
      </div>
    </WizardShell>
  )
}
