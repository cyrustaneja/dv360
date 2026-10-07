import { useState, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useBreadcrumb } from '../../components/layout/breadcrumb'
import { WizardShell, SectionTitle } from './WizardShell'
import { TextField, FormRow } from '../../components/ui/parts'
import { Icon } from '../../lib/icons'
import { useStore } from '../../store'
import { TargetingBuilder, emptyTargeting, type Targeting } from '../../components/TargetingBuilder'
import { TypePicker } from '../../components/TypePicker'
import { UnsavedChangesGuard } from '../../components/UnsavedChangesGuard'

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
  const es = existing?.settings ?? {}
  const [description, setDescription] = useState<string>(es.description ?? '')
  const [quality, setQuality] = useState<string>(es.quality ?? 'Authorized and Non-Participating Publishers')
  const [publicInv, setPublicInv] = useState<boolean>(es.public_inventory ?? true)
  const [openMeasurement, setOpenMeasurement] = useState<boolean>(es.open_measurement ?? false)
  const [optimized, setOptimized] = useState<boolean>(es.optimized_targeting ?? false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) { setError('Template name is required.'); return }
    setBusy(true)
    const payload = {
      name: name.trim(),
      li_type: liType ?? 'Display',
      targeting: targeting as unknown as Record<string, unknown>,
      settings: {
        ...es,
        description,
        quality,
        public_inventory: publicInv,
        open_measurement: openMeasurement,
        optimized_targeting: optimized,
      },
    }
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
      <UnsavedChangesGuard when={!busy && (name !== (existing?.name ?? '') || description !== (es.description ?? ''))} />
      {/* Template details ---------------------------------------------------- */}
      <SectionTitle>Template details</SectionTitle>
      <div className="border-t border-gborder-light pt-4">
        <div className="mb-4 flex items-center gap-2 text-14 text-gtext-primary">
          <span className="text-gtext-secondary">Type</span>
          <span className="font-medium">{liType}</span>
          {!isEdit && <button onClick={() => setLiType(null)} className="text-14 text-glink hover:underline">Change</button>}
        </div>
        <div className="max-w-2xl space-y-4">
          <div>
            <TextField placeholder="" value={name} onChange={(v) => setName(v.slice(0, 240))} width="w-full" label="Name" />
            <div className="mt-1 text-12 text-gtext-secondary">Text is {name.length} characters out of 240</div>
            {error && <p className="mt-1 text-12 text-gstatus-red">{error}</p>}
          </div>
          <div>
            <label className="relative block w-full">
              <span className="pointer-events-none absolute left-3 top-1.5 text-11 text-gtext-secondary">Description (Optional)</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 600))}
                rows={2}
                className="w-full rounded border border-gborder bg-white px-3 pb-2 pt-6 text-14 text-gtext-primary focus:border-gblue-600 focus:outline-none"
              />
            </label>
            <div className="mt-1 text-12 text-gtext-secondary">Text is {description.length} characters out of 600</div>
          </div>
        </div>
      </div>

      {/* Inventory source ---------------------------------------------------- */}
      <SectionTitle>Inventory source</SectionTitle>
      <div className="max-w-2xl space-y-4 border-t border-gborder-light pt-4">
        <div>
          <div className="text-14 font-medium text-gtext-primary">Quality</div>
          <div className="mb-2 text-14 text-gtext-secondary">
            Select who you want to buy web and app inventory from. <a className="text-glink hover:underline" href="#">Learn more</a>
          </div>
          <label className="relative block w-[420px]">
            <select value={quality} onChange={(e) => setQuality(e.target.value)} className="h-12 w-full appearance-none rounded border border-gborder bg-white px-3 text-14 text-gtext-primary focus:border-gblue-600 focus:outline-none">
              <option>Authorized and Non-Participating Publishers</option>
              <option>Authorized Direct Sellers and Resellers</option>
              <option>Authorized Direct Sellers</option>
            </select>
          </label>
        </div>

        <InventoryRow
          icon="check_circle"
          iconClass="text-gstatus-green"
          title="Public Inventory"
          desc={publicInv ? '47 Exchanges and 0 Subexchanges are selected' : 'No exchanges selected'}
          action={<label className="flex items-center gap-1 text-14 text-gtext-secondary"><input type="checkbox" checked={publicInv} onChange={(e) => setPublicInv(e.target.checked)} className="accent-gblue-600" /> Targeting new exchanges</label>}
        />
        <InventoryRow icon="sell" title="Deals and Packages" desc="0 deals and packages selected" />
        <InventoryRow icon="folder" title="Deal groups and preferred deal groups" desc="No inventory groups selected" />
      </div>

      {/* Targeting ----------------------------------------------------------- */}
      <SectionTitle>Targeting</SectionTitle>
      <div className="border-t border-gborder-light pt-4">
        {/* Viewability */}
        <div className="mb-4 max-w-2xl">
          <div className="flex items-center gap-1 text-14 font-medium text-gtext-primary">
            Viewability <Icon name="lock" size={14} className="text-gtext-disabled" />
          </div>
          <label className="mt-1 flex items-start gap-3 py-1">
            <input type="checkbox" checked={openMeasurement} onChange={(e) => setOpenMeasurement(e.target.checked)} className="mt-1 accent-gblue-600" />
            <span>
              <span className="text-14 text-gtext-primary">Open Measurement</span>
              <span className="block text-14 text-gtext-secondary">Target only Open Measurement enabled mobile display inventory.</span>
            </span>
          </label>
        </div>

        {/* Optimized targeting */}
        <div className="mb-4 max-w-2xl">
          <label className="flex items-start gap-3 py-1">
            <input type="checkbox" checked={optimized} onChange={(e) => setOptimized(e.target.checked)} className="mt-1 accent-gblue-600" />
            <span>
              <span className="flex items-center gap-1 text-14 text-gtext-primary">
                <Icon name="school" size={16} className="text-gtext-secondary" /> Use optimized targeting
              </span>
              <span className="block text-14 text-gtext-secondary">Find new audiences likely to convert beyond your manual selections.</span>
            </span>
          </label>
        </div>

        <TargetingBuilder value={targeting} onChange={setTargeting} />
      </div>
    </WizardShell>
  )
}

/** DV360 inventory-source summary row: leading icon, title, selection summary. */
function InventoryRow({ icon, iconClass = 'text-gtext-secondary', title, desc, action }: {
  icon: string; iconClass?: string; title: string; desc: string; action?: ReactNode
}) {
  return (
    <div className="flex items-center gap-3 rounded-g border border-gborder px-4 py-3">
      <Icon name={icon} size={20} className={iconClass} />
      <div className="flex-1">
        <div className="text-14 text-gtext-primary">{title}</div>
        <div className="text-14 text-gtext-secondary">{desc}</div>
      </div>
      {action}
    </div>
  )
}
