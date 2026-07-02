import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useBreadcrumb } from '../../components/layout/breadcrumb'
import { WizardShell, SectionTitle } from './WizardShell'
import { TextField, FormRow } from '../../components/ui/parts'
import { Icon } from '../../lib/icons'
import { useStore } from '../../store'
import { TargetingBuilder, emptyTargeting, type Targeting } from '../../components/TargetingBuilder'
import { TypePicker } from '../../components/TypePicker'

export default function NewTargetingTemplate() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { state, addTemplate, updateTemplate, deleteEntity } = useStore()
  useBreadcrumb([{ label: 'Advertiser', name: state.currentAdvertiser?.name ?? '', to: '/advertiser/targeting-templates' }])

  const existing = id ? state.raw.templates.find((t) => t.id === id) : null
  const isEdit = Boolean(existing)

  const [liType, setLiType] = useState<string | null>(existing?.li_type ?? null)
  const [name, setName] = useState(existing?.name ?? '')
  const [targeting, setTargeting] = useState<Targeting>(
    existing?.targeting && Object.keys(existing.targeting).length ? existing.targeting : emptyTargeting()
  )
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) { setError('Template name is required.'); return }
    setBusy(true)
    const payload = { name: name.trim(), li_type: liType ?? 'Display', targeting: targeting as unknown as Record<string, unknown> }
    if (isEdit && id) {
      const ok = await updateTemplate(id, payload)
      setBusy(false)
      if (!ok) { setError('Could not save. Try again.'); return }
    } else {
      const newId = await addTemplate(payload)
      setBusy(false)
      if (!newId) { setError('Could not save. Try again.'); return }
    }
    navigate('/advertiser/targeting-templates')
  }

  const handleDelete = async () => {
    if (!id || !confirm('Delete this targeting template?')) return
    setBusy(true)
    const ok = await deleteEntity('targeting_template', id)
    setBusy(false)
    if (ok) navigate('/advertiser/targeting-templates')
    else setError('Could not delete. Try again.')
  }

  // Step 1 (new only): pick a line item type.
  if (!liType) {
    return (
      <div className="flex min-h-full flex-col">
        <div className="flex h-12 shrink-0 items-center gap-3 border-b border-gborder px-4">
          <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-gbg-page">
            <Icon name="close" size={20} className="text-gtext-secondary" />
          </button>
          <h1 className="text-15 text-gtext-primary">New targeting template</h1>
        </div>
        <div className="flex-1 overflow-auto px-6 py-8">
          <TypePicker
            heading="Select a line item type for the template to be applied to"
            footer="Targeting templates aren’t available for Digital out-of-home, Mobile app install, Ads in mobile apps, YouTube & partners audio, or YouTube & partners on CTV line items."
            onSelect={setLiType}
          />
        </div>
      </div>
    )
  }

  return (
    <WizardShell title={isEdit ? 'Edit targeting template' : 'New targeting template'} primary={isEdit ? 'Save' : 'Create'} onPrimary={handleSave} busy={busy} onDelete={isEdit ? handleDelete : undefined}>
      <SectionTitle>Template details</SectionTitle>
      <div className="border-t border-gborder-light pt-3">
        <FormRow label="Type">
          <div className="flex items-center gap-2 text-13 text-gtext-primary">
            {liType}
            {!isEdit && <button onClick={() => setLiType(null)} className="text-12 text-gblue-700 hover:underline">Change</button>}
          </div>
        </FormRow>
        <FormRow label="Template name">
          <TextField placeholder="Enter a name" value={name} onChange={setName} width="w-full" />
          {error && <p className="mt-1 text-12 text-gstatus-red">{error}</p>}
        </FormRow>
      </div>

      <SectionTitle>Targeting</SectionTitle>
      <TargetingBuilder value={targeting} onChange={setTargeting} />
    </WizardShell>
  )
}
