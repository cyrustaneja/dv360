import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBreadcrumb } from '../../components/layout/breadcrumb'
import { WizardShell, SectionTitle } from './WizardShell'
import { TextField, FormRow, RadioRow, SelectField } from '../../components/ui/parts'
import { Icon } from '../../lib/icons'
import { ADVERTISER } from '../../data/mock'
import { useStore } from '../../store'

const creativeTypes = [
  { icon: 'image', title: 'Standard display', desc: 'Upload an image (JPG, PNG, GIF) or HTML5 zip.' },
  { icon: 'smart_display', title: 'Responsive display', desc: 'Provide assets and let Google create multiple sizes.' },
  { icon: 'play_circle', title: 'Video', desc: 'Upload an MP4 or WEBM video file.' },
  { icon: 'html', title: 'HTML5', desc: 'Upload a zipped HTML5 bundle.' },
]

const sizeOptions = [
  '300 × 250', '728 × 90', '320 × 50', '160 × 600',
  '300 × 600', '970 × 250', '336 × 280', '468 × 60',
]

export default function NewCreative() {
  useBreadcrumb([{ label: ADVERTISER.label, name: ADVERTISER.name, to: '/advertiser/creatives' }])
  const navigate = useNavigate()
  const { addCreative } = useStore()
  const fileRef = useRef<HTMLInputElement>(null)

  const [creativeType, setCreativeType] = useState(0)
  const [name, setName] = useState('')
  const [dimensions, setDimensions] = useState('300 × 250')
  const [clickUrl, setClickUrl] = useState('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [accentColor, setAccentColor] = useState('#1a73e8')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      if (!name) setName(file.name.replace(/\.[^.]+$/, ''))
    }
  }

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Creative name is required.')
      return
    }
    setBusy(true)
    const id = await addCreative({
      name: name.trim(),
      dimensions,
      creative_type: creativeTypes[creativeType].title,
      click_url: clickUrl,
      accent: accentColor,
    })
    setBusy(false)
    if (!id) {
      setError('Could not save. Check your connection and try again.')
      return
    }
    navigate('/advertiser/creatives')
  }

  return (
    <WizardShell title="New creative" onPrimary={handleCreate} busy={busy}>
      <SectionTitle>Creative type</SectionTitle>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {creativeTypes.map((t, i) => (
          <button
            key={t.title}
            onClick={() => setCreativeType(i)}
            className={`flex items-start gap-3 rounded-lg border p-4 text-left ${
              creativeType === i ? 'border-gblue-600 bg-gblue-50' : 'border-gborder hover:bg-gbg-hover'
            }`}
          >
            <Icon name={t.icon} size={24} className={creativeType === i ? 'text-gblue-700' : 'text-gtext-secondary'} />
            <span>
              <span className="block text-13 font-medium text-gtext-primary">{t.title}</span>
              <span className="text-12 text-gtext-secondary">{t.desc}</span>
            </span>
          </button>
        ))}
      </div>

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

        <FormRow label="Creative asset" hint="Upload your image, HTML5 zip, or video file.">
          <div
            onClick={() => fileRef.current?.click()}
            className="flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed border-gborder p-8 hover:border-gblue-600 hover:bg-gblue-50"
          >
            <Icon name="upload_file" size={40} className="text-gtext-secondary" />
            {uploadedFile ? (
              <div className="text-center">
                <div className="text-13 font-medium text-gblue-700">{uploadedFile.name}</div>
                <div className="text-12 text-gtext-secondary">{(uploadedFile.size / 1024).toFixed(1)} KB</div>
              </div>
            ) : (
              <>
                <div className="text-13 text-gtext-primary">Click to upload or drag and drop</div>
                <div className="text-12 text-gtext-secondary">JPG, PNG, GIF, HTML5 ZIP, MP4 (max 150 KB)</div>
              </>
            )}
            <input ref={fileRef} type="file" className="hidden" onChange={handleFileChange} />
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
            <span className="text-13 text-gtext-secondary">{accentColor}</span>
          </div>
        </FormRow>

        <FormRow label="Advertiser" hint="Which advertiser does this creative belong to?">
          <div className="flex items-center gap-2 rounded border border-gborder px-3 py-2">
            <Icon name="business" size={16} className="text-gtext-secondary" />
            <span className="text-13 text-gtext-primary">{ADVERTISER.name}</span>
          </div>
        </FormRow>
      </div>

      <SectionTitle>Preview</SectionTitle>
      <div className="mt-3 flex items-center gap-4 rounded-lg border border-gborder p-4">
        <div
          className="flex shrink-0 items-center justify-center rounded"
          style={{
            width: 120,
            height: 80,
            background: accentColor,
          }}
        >
          {uploadedFile ? (
            <Icon name="image" size={32} className="text-white opacity-60" />
          ) : (
            <Icon name="image" size={32} className="text-white opacity-40" />
          )}
        </div>
        <div>
          <div className="text-13 font-medium text-gtext-primary">{name || 'Creative name'}</div>
          <div className="text-12 text-gtext-secondary">{dimensions} · {creativeTypes[creativeType].title}</div>
          {clickUrl && <div className="mt-1 truncate text-12 text-gblue-700">{clickUrl}</div>}
        </div>
      </div>
    </WizardShell>
  )
}
