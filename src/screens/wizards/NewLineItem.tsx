import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useBreadcrumb } from '../../components/layout/breadcrumb'
import { WizardShell, SectionTitle } from './WizardShell'
import { TextField, FormRow, RadioRow, CheckRow, SelectField } from '../../components/ui/parts'
import { Icon } from '../../lib/icons'
import { useStore } from '../../store'

const types = [
  { icon: 'image', title: 'Display', desc: 'Image and HTML5 ads across the web and apps.' },
  { icon: 'smart_display', title: 'Video', desc: 'Skippable and non-skippable video ads.' },
  { icon: 'graphic_eq', title: 'Audio', desc: 'Audio ads across streaming services and podcasts.' },
  { icon: 'tv', title: 'TV', desc: 'Connected-TV inventory.' },
]

const geos = [
  'Mumbai, Maharashtra, India',
  'Delhi, India',
  'Bangalore, Karnataka, India',
  'Chennai, Tamil Nadu, India',
  'Hyderabad, Telangana, India',
  'Pune, Maharashtra, India',
  'Kolkata, West Bengal, India',
]

const devices = ['Computer', 'Smartphone', 'Tablet', 'Connected TV']

export default function NewLineItem() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const ioId = searchParams.get('ioId') ?? ''
  const { state, addLineItem } = useStore()
  useBreadcrumb([{ label: 'Advertiser', name: state.currentAdvertiser?.name ?? '', to: '/advertiser/campaigns' }])

  const [liType, setLiType] = useState(0)
  const [name, setName] = useState('')
  const [budgetType, setBudgetType] = useState<'unlimited' | 'limited'>('unlimited')
  const [budget, setBudget] = useState('')
  const [startDate, setStartDate] = useState('Jun 1, 2026')
  const [endDate, setEndDate] = useState('Jun 30, 2026')
  const [pacing, setPacing] = useState<'fast' | 'even'>('even')
  const [bidStrategy, setBidStrategy] = useState<'fixed' | 'max_conv' | 'max_view'>('fixed')
  const [bidAmount, setBidAmount] = useState('')
  const [freqCap, setFreqCap] = useState<'no_cap' | 'limited'>('no_cap')
  const [selectedGeos, setSelectedGeos] = useState<string[]>(['Mumbai, Maharashtra, India', 'Delhi, India'])
  const [selectedDevices, setSelectedDevices] = useState<string[]>(['Computer', 'Smartphone'])
  const [assignCreatives, setAssignCreatives] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const toggleGeo = (g: string) =>
    setSelectedGeos((prev) => prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g])
  const toggleDevice = (d: string) =>
    setSelectedDevices((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d])

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Line item name is required.')
      return
    }
    if (!ioId) {
      setError('Open an insertion order first, then add a line item inside it.')
      return
    }
    setBusy(true)
    const typeLabel = types[liType].title
    const id = await addLineItem({
      io_id: ioId,
      name: name.trim(),
      li_type: typeLabel,
      budget_type: budgetType,
      budget: budgetType === 'limited' ? (budget ? `₹${budget}` : '₹0.00') : null as unknown as string,
      pacing,
      bid_strategy: bidStrategy,
      bid_amount: bidAmount,
      freq_cap: freqCap,
      targeting: { geos: selectedGeos, devices: selectedDevices, startDate, endDate },
    })
    setBusy(false)
    if (!id) {
      setError('Could not save. Check your connection and try again.')
      return
    }
    navigate(`/advertiser/insertion-orders/${ioId}`)
  }

  return (
    <WizardShell title="New line item" onPrimary={handleCreate} busy={busy}>
      <SectionTitle>Choose a line item type</SectionTitle>
      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
        {types.map((t, i) => (
          <button
            key={t.title}
            onClick={() => setLiType(i)}
            className={`flex flex-col items-start gap-2 rounded-lg border p-4 text-left ${
              liType === i ? 'border-gblue-600 bg-gblue-50' : 'border-gborder hover:bg-gbg-hover'
            }`}
          >
            <Icon name={t.icon} size={24} className={liType === i ? 'text-gblue-700' : 'text-gtext-secondary'} />
            <span className="text-13 font-medium text-gtext-primary">{t.title}</span>
            <span className="text-12 text-gtext-secondary">{t.desc}</span>
          </button>
        ))}
      </div>

      <SectionTitle>Line item details</SectionTitle>
      <div className="border-t border-gborder-light pt-3">
        <FormRow label="Name">
          <TextField placeholder="Enter a line item name" value={name} onChange={setName} width="w-full" />
          {error && <p className="mt-1 text-12 text-gstatus-red">{error}</p>}
        </FormRow>

        <FormRow label="Budget" hint="Set the budget and flight dates.">
          <RadioRow label="Unlimited" checked={budgetType === 'unlimited'} onChange={() => setBudgetType('unlimited')} />
          <RadioRow label="Limited" checked={budgetType === 'limited'} onChange={() => setBudgetType('limited')} />
          {budgetType === 'limited' && (
            <TextField label="Budget (₹)" placeholder="0.00" value={budget} onChange={setBudget} width="w-48" />
          )}
          <div className="mt-2 grid grid-cols-2 gap-3">
            <TextField label="Start date" value={startDate} onChange={setStartDate} />
            <TextField label="End date" value={endDate} onChange={setEndDate} />
          </div>
        </FormRow>

        <FormRow label="Pacing" hint="How do you want to spend the budget?">
          <RadioRow
            label="As fast as possible"
            checked={pacing === 'fast'}
            onChange={() => setPacing('fast')}
          />
          <RadioRow
            label="Even (Recommended)"
            checked={pacing === 'even'}
            hint="Spend evenly throughout the flight."
            onChange={() => setPacing('even')}
          />
        </FormRow>

        <FormRow label="Bid strategy" hint="How DV360 sets your bids.">
          <RadioRow
            label="Fixed bid"
            checked={bidStrategy === 'fixed'}
            hint="Set a fixed CPM bid."
            onChange={() => setBidStrategy('fixed')}
          />
          {bidStrategy === 'fixed' && (
            <div className="ml-7 mt-1 mb-2">
              <TextField label="Fixed bid (₹ CPM)" placeholder="0.00" value={bidAmount} onChange={setBidAmount} width="w-48" />
            </div>
          )}
          <RadioRow
            label="Maximize conversions"
            checked={bidStrategy === 'max_conv'}
            hint="Automatically optimize bids to get the most conversions."
            onChange={() => setBidStrategy('max_conv')}
          />
          <RadioRow
            label="Maximize viewable impressions"
            checked={bidStrategy === 'max_view'}
            hint="Automatically optimize bids to maximize viewable impressions."
            onChange={() => setBidStrategy('max_view')}
          />
        </FormRow>

        <FormRow label="Frequency cap" hint="Limit how often a user sees your ads.">
          <RadioRow label="No cap" checked={freqCap === 'no_cap'} onChange={() => setFreqCap('no_cap')} />
          <RadioRow label="Limit frequency to" checked={freqCap === 'limited'} onChange={() => setFreqCap('limited')} />
          {freqCap === 'limited' && (
            <div className="ml-7 mt-2 flex items-center gap-2">
              <TextField placeholder="5" width="w-20" />
              <span className="text-13 text-gtext-secondary">impressions per</span>
              <SelectField value="Week" options={['Day', 'Week', 'Month']} onChange={() => {}} width="w-28" />
            </div>
          )}
        </FormRow>
      </div>

      <SectionTitle>Targeting</SectionTitle>
      <div className="border-t border-gborder-light pt-3">
        <FormRow label="Geography" hint="Choose which locations to target.">
          <div className="flex flex-wrap gap-2">
            {geos.map((g) => (
              <button
                key={g}
                onClick={() => toggleGeo(g)}
                className={`rounded-full border px-3 py-1 text-12 ${
                  selectedGeos.includes(g)
                    ? 'border-gblue-600 bg-gblue-50 text-gblue-700'
                    : 'border-gborder text-gtext-secondary hover:bg-gbg-hover'
                }`}
              >
                {selectedGeos.includes(g) && '✓ '}
                {g}
              </button>
            ))}
          </div>
        </FormRow>

        <FormRow label="Device" hint="Target specific device types.">
          <div className="flex flex-wrap gap-2">
            {devices.map((d) => (
              <button
                key={d}
                onClick={() => toggleDevice(d)}
                className={`rounded-full border px-3 py-1 text-12 ${
                  selectedDevices.includes(d)
                    ? 'border-gblue-600 bg-gblue-50 text-gblue-700'
                    : 'border-gborder text-gtext-secondary hover:bg-gbg-hover'
                }`}
              >
                {selectedDevices.includes(d) && '✓ '}
                {d}
              </button>
            ))}
          </div>
        </FormRow>

        <FormRow label="Environment" hint="Where your ads will appear.">
          <CheckRow label="Web" checked={true} />
          <CheckRow label="App" checked={true} />
          <CheckRow label="AMP" checked={false} />
        </FormRow>

        <FormRow label="Viewability" hint="Minimum viewability threshold.">
          <SelectField
            value="60% or greater"
            options={['No minimum', '40% or greater', '60% or greater', '70% or greater', '80% or greater']}
            onChange={() => {}}
            width="w-56"
          />
        </FormRow>
      </div>

      <SectionTitle>Creative assignment</SectionTitle>
      <div className="border-t border-gborder-light pt-3">
        <FormRow label="Assign creatives">
          <CheckRow
            label="Assign existing creatives later"
            checked={!assignCreatives}
            onChange={(v) => setAssignCreatives(!v)}
          />
          {assignCreatives && (
            <div className="mt-3 rounded border border-gborder p-3">
              {state.creatives.slice(0, 4).map((c) => (
                <CheckRow key={c.id} label={`${c.name} (${c.dimensions})`} checked={false} />
              ))}
              <button className="mt-2 text-13 font-medium text-gblue-700 hover:underline">
                Browse all creatives →
              </button>
            </div>
          )}
        </FormRow>
      </div>
    </WizardShell>
  )
}
