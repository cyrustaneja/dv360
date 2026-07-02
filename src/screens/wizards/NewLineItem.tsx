import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useBreadcrumb } from '../../components/layout/breadcrumb'
import { Icon } from '../../lib/icons'
import { useStore } from '../../store'
import { TypePicker, isYouTubeType } from '../../components/TypePicker'

/**
 * Line item creation = the DV360 type picker. Selecting a type creates a draft
 * line item and drops you into the inline editor (detail page) for everything else.
 */
export default function NewLineItem() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const ioId = searchParams.get('ioId') ?? ''
  const { state, addLineItem } = useStore()
  useBreadcrumb([{ label: 'Advertiser', name: state.currentAdvertiser?.name ?? '', to: '/advertiser/campaigns' }])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const pick = async (type: string) => {
    if (!ioId) { setError('Open an insertion order first, then add a line item inside it.'); return }
    if (busy) return
    setBusy(true)
    const newId = await addLineItem({
      io_id: ioId,
      name: `New ${type} line item`,
      li_type: type,
      bid_strategy: isYouTubeType(type) ? 'Target CPM' : 'Fixed bid',
      status: 'draft',
      targeting: {},
    })
    setBusy(false)
    if (!newId) { setError('Could not create. Try again.'); return }
    navigate(`/advertiser/line-items/${newId}`)
  }

  return (
    <div className="flex min-h-full flex-col">
      <div className="flex h-12 shrink-0 items-center gap-3 border-b border-gborder px-4">
        <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-gbg-page">
          <Icon name="close" size={20} className="text-gtext-secondary" />
        </button>
        <h1 className="text-15 text-gtext-primary">New line item</h1>
      </div>
      <div className="flex-1 overflow-auto px-6 py-8">
        {error && <p className="mx-auto mb-3 max-w-4xl text-13 text-gstatus-red">{error}</p>}
        <TypePicker
          heading="Select a line item type"
          footer="Some line item types (Digital out-of-home, Mobile app install, YouTube & partners audio) aren’t available in this training simulation."
          onSelect={pick}
        />
      </div>
    </div>
  )
}
