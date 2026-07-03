import { Icon } from '../lib/icons'

/**
 * DV360 line-item / targeting-template type picker — the 6-card selection screen.
 * Used when creating a line item or a targeting template.
 */
export interface LiType { title: string; desc: string; icon: string; youtube?: boolean; soon?: boolean }

export const LINE_ITEM_TYPES: LiType[] = [
  { title: 'Display', icon: 'image', desc: 'Image, HTML5 (including rich media), and native ads (both display and video).' },
  { title: 'Video', icon: 'play_circle', desc: 'Video ads sold on a CPM basis for a variety of environments.', youtube: true },
  { title: 'Audio', icon: 'graphic_eq', desc: 'Audio ads sold on a CPM basis for a variety of environments.', soon: true },
  { title: 'Connected TV', icon: 'tv', desc: 'TV content on connected TVs and other digital devices.', soon: true },
  { title: 'Demand Gen', icon: 'dynamic_feed', desc: 'Video and image ads on YouTube, Discover, Gmail, and the Google Display Network.', soon: true },
  { title: 'YouTube & partners video', icon: 'smart_display', desc: 'Video ads on YouTube and partners.', youtube: true },
]

/** Types that use the YouTube-style line item layout on the detail page. */
export const isYouTubeType = (title?: string) =>
  ['Video', 'YouTube & partners video'].includes(title ?? '')

export function TypePicker({ heading, footer, onSelect }: {
  heading: string
  footer?: string
  onSelect: (title: string) => void
}) {
  return (
    <div className="mx-auto max-w-4xl rounded-lg border border-gborder bg-white p-6">
      <p className="mb-4 text-13 text-gtext-primary">{heading}</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LINE_ITEM_TYPES.map((t) => (
          <button
            key={t.title}
            onClick={() => !t.soon && onSelect(t.title)}
            disabled={t.soon}
            className={`flex flex-col rounded-lg border text-left transition ${
              t.soon ? 'cursor-not-allowed border-gborder opacity-60' : 'border-gborder hover:border-gblue-600 hover:shadow-sm'
            }`}
          >
            <div className="flex h-28 items-center justify-center rounded-t-lg bg-gbg-page">
              <div className="flex h-16 w-24 items-center justify-center rounded border border-gborder bg-white">
                <Icon name={t.icon} size={28} className={t.soon ? 'text-gtext-disabled' : 'text-gblue-700'} />
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 text-14 font-medium text-gtext-primary">
                {t.title}
                {t.soon && <span className="rounded-full bg-gbg-page px-2 py-0.5 text-[10px] font-medium text-gtext-secondary">Coming soon</span>}
              </div>
              <div className="mt-1 text-12 leading-snug text-gtext-secondary">{t.desc}</div>
            </div>
          </button>
        ))}
      </div>
      {footer && <p className="mt-4 text-12 text-gtext-secondary">{footer}</p>}
    </div>
  )
}
