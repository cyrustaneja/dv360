import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useBreadcrumb } from '../../components/layout/breadcrumb'
import { WizardShell, SectionTitle } from './WizardShell'
import { TextField, FormRow, RadioRow, SelectField } from '../../components/ui/parts'
import { Icon } from '../../lib/icons'
import { useStore } from '../../store'

const kpiTypes = ['CPM', 'CPC', 'CPA', 'CTR', 'Viewability', 'CPIAVC', 'Custom']

export default function NewInsertionOrder() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const campaignId = searchParams.get('campaignId') ?? ''
  const { state, addIO } = useStore()
  useBreadcrumb([{ label: 'Advertiser', name: state.currentAdvertiser?.name ?? '', to: '/advertiser/campaigns' }])

  const [name, setName] = useState('')
  const [type, setType] = useState<'Standard' | 'YouTube & partners'>('Standard')
  const [budget, setBudget] = useState('')
  const [startDate, setStartDate] = useState('Jun 1, 2026')
  const [endDate, setEndDate] = useState('Jun 30, 2026')
  const [pacing, setPacing] = useState<'Flight' | 'Even' | 'Ahead'>('Flight')
  const [freqCap, setFreqCap] = useState<'no_cap' | 'limited'>('no_cap')
  const [kpiType, setKpiType] = useState('CPM')
  const [kpiValue, setKpiValue] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Insertion order name is required.')
      return
    }
    if (!campaignId) {
      setError('Open a campaign first, then add an insertion order inside it.')
      return
    }
    setBusy(true)
    const id = await addIO({
      campaign_id: campaignId,
      name: name.trim(),
      io_type: type,
      budget: budget ? `₹${budget}` : '₹0.00',
      pacing,
      freq_cap: freqCap,
      kpi_type: kpiType,
      kpi_value: kpiValue,
      start_date: startDate,
      end_date: endDate,
    })
    setBusy(false)
    if (!id) {
      setError('Could not save. Check your connection and try again.')
      return
    }
    navigate(`/advertiser/campaigns/${campaignId}`)
  }

  return (
    <WizardShell title="New insertion order" onPrimary={handleCreate} busy={busy}>
      <div className="flex items-center gap-2 text-13 text-gtext-primary">
        <Icon name="check_circle" size={18} className="text-gstatus-green" />
        Budget and pacing depend on both insertion order and line item settings.
      </div>

      <SectionTitle>Insertion order details</SectionTitle>
      <div className="border-t border-gborder-light pt-3">
        <FormRow label="Name">
          <TextField placeholder="Enter an insertion order name" value={name} onChange={setName} width="w-full" />
          {error && <p className="mt-1 text-12 text-gstatus-red">{error}</p>}
        </FormRow>

        <FormRow label="Type" hint="Choose how this insertion order will be optimized.">
          <RadioRow
            label="Standard"
            checked={type === 'Standard'}
            hint="Manage line items individually."
            onChange={() => setType('Standard')}
          />
          <RadioRow
            label="YouTube & partners"
            checked={type === 'YouTube & partners'}
            hint="Optimize toward a single performance goal across line items."
            onChange={() => setType('YouTube & partners')}
          />
        </FormRow>

        <FormRow label="Budget" hint="Budget type: INR">
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Amount (₹)" placeholder="0.00" value={budget} onChange={setBudget} />
            <TextField label="Budget segments" defaultValue="1 segment" readOnly />
            <TextField label="Start date" value={startDate} onChange={setStartDate} />
            <TextField label="End date" value={endDate} onChange={setEndDate} />
          </div>
          <button className="mt-2 text-13 font-medium text-gblue-700 hover:underline">+ Add segments</button>
        </FormRow>

        <FormRow label="Pacing" hint="How do you want to spend the budget?">
          <RadioRow
            label="Flight (Recommended)"
            checked={pacing === 'Flight'}
            hint="Spend your entire budget over the entire flight."
            onChange={() => setPacing('Flight')}
          />
          <RadioRow
            label="Even"
            checked={pacing === 'Even'}
            hint="Spend evenly each day."
            onChange={() => setPacing('Even')}
          />
          <RadioRow
            label="Ahead"
            checked={pacing === 'Ahead'}
            hint="Spend ahead of schedule."
            onChange={() => setPacing('Ahead')}
          />
        </FormRow>

        <FormRow label="Frequency cap" hint="Limit how often a person sees ads.">
          <RadioRow
            label="No cap"
            checked={freqCap === 'no_cap'}
            onChange={() => setFreqCap('no_cap')}
          />
          <RadioRow
            label="Limit frequency to"
            checked={freqCap === 'limited'}
            onChange={() => setFreqCap('limited')}
          />
          {freqCap === 'limited' && (
            <div className="ml-7 mt-2 flex items-center gap-2">
              <TextField placeholder="5" width="w-20" />
              <span className="text-13 text-gtext-secondary">impressions per</span>
              <SelectField value="Week" options={['Day', 'Week', 'Month']} onChange={() => {}} width="w-28" />
            </div>
          )}
        </FormRow>

        <FormRow label="KPI" hint="What KPI do you want to use for your insertion order?">
          <div className="flex gap-3">
            <SelectField label="KPI type" value={kpiType} options={kpiTypes} onChange={setKpiType} width="w-48" />
            <TextField label={`${kpiType} goal (₹)`} placeholder="0.00" value={kpiValue} onChange={setKpiValue} width="w-40" />
          </div>
        </FormRow>
      </div>
    </WizardShell>
  )
}
