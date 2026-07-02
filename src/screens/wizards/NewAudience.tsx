import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useBreadcrumb } from '../../components/layout/breadcrumb'
import { WizardShell, SectionTitle } from './WizardShell'
import { TextField, FormRow } from '../../components/ui/parts'
import { Icon } from '../../lib/icons'
import { useStore } from '../../store'

const types = [
  { title: 'Custom list', icon: 'tune', source: 'Custom list', desc: 'Reach people based on interests & keywords you define.' },
  { title: 'Affinity', icon: 'favorite', source: 'Google audiences', desc: 'Reach people based on lifestyle and interests.' },
  { title: 'In-market', icon: 'shopping_cart', source: 'Google audiences', desc: 'Reach people actively researching or shopping.' },
  { title: 'First-party data', icon: 'person', source: 'Your data', desc: 'Reach your site visitors, app users or customer match.' },
  { title: 'Combined', icon: 'merge', source: 'Combined audience', desc: 'Combine multiple lists with AND / OR / NOT logic.' },
]

export default function NewAudience() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { state, addAudience, updateAudience, deleteEntity } = useStore()
  useBreadcrumb([{ label: 'Advertiser', name: state.currentAdvertiser?.name ?? '', to: '/advertiser/audiences' }])

  const existing = id ? state.raw.audiences.find((a) => a.id === id) : null
  const isEdit = Boolean(existing)
  const s = existing?.settings ?? {}

  const [typeIdx, setTypeIdx] = useState(() => Math.max(0, types.findIndex((t) => t.title === existing?.audience_type)))
  const [name, setName] = useState(existing?.name ?? '')
  const [definition, setDefinition] = useState(s.definition ?? '')
  const [duration, setDuration] = useState(s.membership_days ?? '30')
  const [size, setSize] = useState(s.size ?? '')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) { setError('Audience name is required.'); return }
    setBusy(true)
    const payload = {
      name: name.trim(),
      audience_type: types[typeIdx].title,
      source: types[typeIdx].source,
      settings: { definition, membership_days: duration, size },
    }
    const ok = isEdit && id ? await updateAudience(id, payload) : Boolean(await addAudience(payload))
    setBusy(false)
    if (!ok) { setError('Could not save. Try again.'); return }
    navigate('/advertiser/audiences')
  }

  const handleDelete = async () => {
    if (!id || !confirm('Delete this audience?')) return
    setBusy(true)
    const ok = await deleteEntity('audience', id)
    setBusy(false)
    if (ok) navigate('/advertiser/audiences')
    else setError('Could not delete. Try again.')
  }

  return (
    <WizardShell title={isEdit ? 'Edit audience' : 'New audience'} primary={isEdit ? 'Save' : 'Create'} onPrimary={handleSave} busy={busy} onDelete={isEdit ? handleDelete : undefined}>
      <SectionTitle>Audience type</SectionTitle>
      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
        {types.map((t, i) => (
          <button
            key={t.title}
            onClick={() => setTypeIdx(i)}
            className={`flex flex-col items-start gap-2 rounded-lg border p-4 text-left ${
              typeIdx === i ? 'border-gblue-600 bg-gblue-50' : 'border-gborder hover:bg-gbg-hover'
            }`}
          >
            <Icon name={t.icon} size={22} className={typeIdx === i ? 'text-gblue-700' : 'text-gtext-secondary'} />
            <span className="text-13 font-medium text-gtext-primary">{t.title}</span>
            <span className="text-11 text-gtext-secondary">{t.desc}</span>
          </button>
        ))}
      </div>

      <SectionTitle>Audience details</SectionTitle>
      <div className="border-t border-gborder-light pt-3">
        <FormRow label="Audience name">
          <TextField placeholder="e.g. Diwali shoppers — Mumbai" value={name} onChange={setName} width="w-full" />
          {error && <p className="mt-1 text-12 text-gstatus-red">{error}</p>}
        </FormRow>
        <FormRow label="Definition" hint="Describe who is in this audience (interests, keywords, data source, or rules).">
          <textarea
            value={definition}
            onChange={(e) => setDefinition(e.target.value)}
            placeholder="e.g. People interested in ethnic wear AND visited the festive collection page in the last 30 days"
            className="h-24 w-full rounded border border-gborder p-2 text-13 focus:border-gblue-600 focus:outline-none"
          />
        </FormRow>
        <FormRow label="Membership duration (days)" hint="How long a user stays in the audience after qualifying.">
          <TextField value={duration} onChange={setDuration} width="w-32" />
        </FormRow>
        <FormRow label="Estimated size" hint="Optional — your estimate of reach for this list.">
          <TextField placeholder="e.g. 1,20,000" value={size} onChange={setSize} width="w-48" />
        </FormRow>
      </div>
    </WizardShell>
  )
}
