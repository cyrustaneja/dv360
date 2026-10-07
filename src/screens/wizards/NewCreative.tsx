import { useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useBreadcrumb } from '../../components/layout/breadcrumb'
import { WizardShell, SectionTitle } from './WizardShell'
import { TextField, FormRow, SelectField } from '../../components/ui/parts'
import { Icon } from '../../lib/icons'
import { useStore } from '../../store'
import { api } from '../../lib/api'
import { UnsavedChangesGuard } from '../../components/UnsavedChangesGuard'

const creativeTypes = [
  { icon: 'image', title: 'Standard display', desc: 'Upload an image (JPG, PNG, GIF, WebP).', soon: false },
  { icon: 'smart_display', title: 'Responsive display', desc: 'Provide assets and let Google create multiple sizes.', soon: true },
  { icon: 'play_circle', title: 'Video', desc: 'Upload an MP4 or WEBM video file.', soon: true },
  { icon: 'html', title: 'HTML5', desc: 'Upload a zipped HTML5 bundle.', soon: true },
]

const sizeOptions = [
  '300 × 250', '728 × 90', '320 × 50', '160 × 600',
  '300 × 600', '970 × 250', '336 × 280', '468 × 60',
]

export default function NewCreative() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { state, addCreative, updateCreative, deleteEntity } = useStore()
  useBreadcrumb([{ label: 'Advertiser', name: state.currentAdvertiser?.name ?? '', to: '/advertiser/creatives' }])
  const fileRef = useRef<HTMLInputElement>(null)

  const existing = id ? state.raw.creatives.find((c) => c.id === id) : null
  const isEdit = Boolean(existing)

  const [creativeType, setCreativeType] = useState(() => Math.max(0, creativeTypes.findIndex((t) => t.title === existing?.creative_type)))
  const [name, setName] = useState(existing?.name ?? '')
  const [dimensions, setDimensions] = useState(existing?.dimensions ?? '300 × 250')
  const [clickUrl, setClickUrl] = useState(existing?.click_url ?? '')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(existing?.settings?.image_url ?? null)
  const [uploading, setUploading] = useState(false)
  const [accentColor, setAccentColor] = useState(existing?.accent ?? '#1a73e8')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setError('Please choose an image file (JPG, PNG, GIF, WebP).'); return }
    setUploadedFile(file)
    if (!name) setName(file.name.replace(/\.[^.]+$/, ''))
    setError('')
    setUploading(true)
    try {
      const dataBase64 = await new Promise<string>((resolve, reject) => {
        const r = new FileReader()
        r.onload = () => resolve(String(r.result).split(',')[1] ?? '')
        r.onerror = reject
        r.readAsDataURL(file)
      })
      const { url } = await api.uploadImage(file.name, file.type, dataBase64)
      setImageUrl(url)
    } catch {
      setError('Image upload failed. Try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    if (creativeTypes[creativeType].soon) {
      setError(`${creativeTypes[creativeType].title} creatives are launching soon. Use Standard display for now.`)
      return
    }
    if (!name.trim()) {
      setError('Creative name is required.')
      return
    }
    if (!imageUrl) {
      setError('Please upload a creative image first.')
      return
    }
    setBusy(true)
    const payload = {
      name: name.trim(),
      dimensions,
      creative_type: creativeTypes[creativeType].title,
      click_url: clickUrl,
      accent: accentColor,
      settings: { image_url: imageUrl },
    }
    const ok = isEdit && id ? await updateCreative(id, payload) : Boolean(await addCreative(payload))
    setBusy(false)
    if (!ok) {
      setError('Could not save. Check your connection and try again.')
      return
    }
    navigate('/advertiser/creatives')
  }

  const handleDelete = async () => {
    if (!id || !confirm('Delete this creative?')) return
    setBusy(true)
    const ok = await deleteEntity('creative', id)
    setBusy(false)
    if (ok) navigate('/advertiser/creatives')
    else setError('Could not delete. Try again.')
  }

  return (
    <WizardShell title={isEdit ? 'Edit creative' : 'New creative'} primary={isEdit ? 'Save' : 'Create'} onPrimary={handleSave} busy={busy} onDelete={isEdit ? handleDelete : undefined}>
      <UnsavedChangesGuard when={!busy && (name !== (existing?.name ?? '') || clickUrl !== (existing?.click_url ?? '') || Boolean(imageUrl) !== Boolean(existing?.settings?.image_url))} />
      <SectionTitle>Creative type</SectionTitle>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {creativeTypes.map((t, i) => (
          <button
            key={t.title}
            onClick={() => setCreativeType(i)}
            className={`flex items-start gap-3 rounded-g border p-4 text-left ${
              creativeType === i ? 'border-gblue-600 bg-gblue-50' : 'border-gborder hover:bg-gbg-hover'
            }`}
          >
            <Icon name={t.icon} size={24} className={creativeType === i ? 'text-glink' : 'text-gtext-secondary'} />
            <span>
              <span className="flex items-center gap-2 text-14 font-medium text-gtext-primary">
                {t.title}
                {t.soon && <span className="rounded-full bg-gbg-page px-1.5 py-0.5 text-[10px] font-medium text-gtext-secondary">Launching soon</span>}
              </span>
              <span className="text-12 text-gtext-secondary">{t.desc}</span>
            </span>
          </button>
        ))}
      </div>

      {creativeTypes[creativeType].soon ? (
        <div className="mt-6 rounded-g border border-gborder bg-gbg-page p-6 text-center">
          <Icon name="schedule" size={32} className="text-gtext-secondary" />
          <div className="mt-2 text-15 font-medium text-gtext-primary">{creativeTypes[creativeType].title} creatives are launching soon</div>
          <div className="mt-1 text-14 text-gtext-secondary">This creative type isn’t available yet. For now, use <span className="font-medium">Standard display</span> with an uploaded image.</div>
        </div>
      ) : (
      <>
      <SectionTitle>Creative details</SectionTitle>
      <div className="border-t border-gborder-light pt-3">
        <FormRow label="Creative name">
          <TextField placeholder="Enter a creative name" value={name} onChange={setName} width="w-full" />
          {error && <p className="mt-1 text-12 text-gstatus-red">{error}</p>}
        </FormRow>

        <FormRow label="Dimensions">
          <SelectField
            value={dimensions}
            options={sizeOptions}
            onChange={setDimensions}
            width="w-48"
          />
        </FormRow>

        <FormRow label="Creative image" hint="Upload the actual image for this ad (JPG, PNG, GIF, WebP).">
          <div
            onClick={() => fileRef.current?.click()}
            className="flex cursor-pointer flex-col items-center gap-3 rounded-g border-2 border-dashed border-gborder p-6 hover:border-gblue-600 hover:bg-gblue-50"
          >
            {uploading ? (
              <div className="flex items-center gap-2 text-14 text-gtext-secondary"><span className="material-icons animate-spin text-gblue-600">progress_activity</span> Uploading…</div>
            ) : imageUrl ? (
              <>
                <img src={imageUrl} alt="creative" className="max-h-48 rounded border border-gborder object-contain" />
                <div className="text-12 text-glink">Click to replace image</div>
              </>
            ) : (
              <>
                <Icon name="upload_file" size={40} className="text-gtext-secondary" />
                <div className="text-14 text-gtext-primary">Click to upload an image</div>
                <div className="text-12 text-gtext-secondary">JPG, PNG, GIF, WebP (max 5 MB)</div>
              </>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>
        </FormRow>

        <FormRow label="Click-through URL" hint="Where users go after clicking the ad.">
          <TextField
            placeholder="https://www.example.com/landing-page"
            value={clickUrl}
            onChange={setClickUrl}
            width="w-full"
          />
        </FormRow>

        <FormRow label="Preview color" hint="Accent color for the creative preview.">
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              className="h-10 w-10 cursor-pointer rounded border border-gborder"
            />
            <span className="text-14 text-gtext-secondary">{accentColor}</span>
          </div>
        </FormRow>

        <FormRow label="Advertiser" hint="Which advertiser does this creative belong to?">
          <div className="flex items-center gap-2 rounded border border-gborder px-3 py-2">
            <Icon name="business" size={16} className="text-gtext-secondary" />
            <span className="text-14 text-gtext-primary">{state.currentAdvertiser?.name ?? ''}</span>
          </div>
        </FormRow>
      </div>

      <SectionTitle>Preview</SectionTitle>
      <div className="mt-3 flex items-center gap-4 rounded-g border border-gborder p-4">
        {imageUrl ? (
          <img src={imageUrl} alt="preview" className="h-20 w-[120px] shrink-0 rounded border border-gborder object-cover" />
        ) : (
          <div className="flex h-20 w-[120px] shrink-0 items-center justify-center rounded" style={{ background: accentColor }}>
            <Icon name="image" size={32} className="text-white opacity-40" />
          </div>
        )}
        <div>
          <div className="text-14 font-medium text-gtext-primary">{name || 'Creative name'}</div>
          <div className="text-12 text-gtext-secondary">{dimensions} · {creativeTypes[creativeType].title}</div>
          {clickUrl && <div className="mt-1 truncate text-12 text-glink">{clickUrl}</div>}
        </div>
      </div>
      </>
      )}
    </WizardShell>
  )
}
