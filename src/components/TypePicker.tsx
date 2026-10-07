/**
 * DV360 line-item / targeting-template type picker — the 6-card selection screen,
 * with illustrations and colours matching the real DV360 UI. Used when creating a
 * line item or a targeting template. Types we don't fully support show "Coming soon".
 */
export interface LiType { title: string; desc: string; youtube?: boolean; soon?: boolean }

export const LINE_ITEM_TYPES: LiType[] = [
  { title: 'Display', desc: 'Image, HTML5 (including rich media), and native ads (both display and video)' },
  { title: 'Video', desc: 'Video ads sold on a CPM basis for a variety of environments', youtube: true },
  { title: 'Audio', desc: 'Audio ads sold on a CPM basis for a variety of environments', soon: true },
  { title: 'Connected TV', desc: 'TV content on connected TVs and other digital devices', soon: true },
  { title: 'Demand Gen', desc: 'Video and image ads on YouTube, Discover, Gmail, and the Google Display Network', soon: true },
  { title: 'YouTube & partners video', desc: 'Video ads on YouTube and partners', youtube: true },
]

/** Types that use the YouTube-style line item layout (incl. Ad groups) on the detail page. */
export const isYouTubeType = (title?: string) =>
  ['Video', 'YouTube & partners video'].includes(title ?? '')

// ── Illustrations (match the DV360 art & colours) ────────────────────────────
const BLUE = '#d2e3fc', BLUE_D = '#1a73e8', LINE = '#dadce0', LINE_L = '#e8eaed', RED = '#ff0000', REDBG = '#fce8e6'

function Art({ title }: { title: string }) {
  const common = { width: 150, height: 92, viewBox: '0 0 150 92' as const }
  switch (title) {
    case 'Display':
      return (
        <svg {...common}>
          <rect x="26" y="16" width="98" height="60" rx="2" fill="#fff" stroke={LINE} />
          <line x1="36" y1="30" x2="78" y2="30" stroke={LINE} strokeWidth="3" />
          <line x1="36" y1="40" x2="78" y2="40" stroke={LINE_L} strokeWidth="3" />
          <line x1="36" y1="50" x2="70" y2="50" stroke={LINE_L} strokeWidth="3" />
          <line x1="36" y1="60" x2="74" y2="60" stroke={LINE_L} strokeWidth="3" />
          <rect x="88" y="30" width="28" height="24" rx="2" fill={BLUE} />
          <circle cx="96" cy="38" r="2.5" fill={BLUE_D} opacity=".7" />
          <path d="M90 50 l7-8 5 5 4-4 8 7z" fill={BLUE_D} opacity=".7" />
        </svg>
      )
    case 'Video':
      return (
        <svg {...common}>
          <rect x="30" y="15" width="90" height="52" rx="2" fill="#fff" stroke={LINE} />
          <rect x="55" y="26" width="40" height="30" rx="3" fill={BLUE} />
          <path d="M70 33 l13 8 -13 8z" fill={BLUE_D} />
          <line x1="40" y1="73" x2="72" y2="73" stroke={LINE} strokeWidth="3" />
        </svg>
      )
    case 'Audio':
      return (
        <svg {...common}>
          <rect x="30" y="15" width="90" height="52" rx="2" fill="#fff" stroke={LINE} />
          <g fill={BLUE_D}>
            <rect x="52" y="32" width="4" height="18" rx="2" /><rect x="60" y="27" width="4" height="28" rx="2" />
            <path d="M74 34 l7-5 v24 l-7-5 h-5 v-9 h5z" fill={BLUE} stroke={BLUE_D} strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M86 34 q5 7 0 14" fill="none" stroke={BLUE_D} strokeWidth="1.5" />
            <rect x="94" y="27" width="4" height="28" rx="2" /><rect x="102" y="32" width="4" height="18" rx="2" />
          </g>
        </svg>
      )
    case 'Connected TV':
      return (
        <svg {...common}>
          <rect x="34" y="14" width="82" height="48" rx="3" fill={BLUE} stroke={LINE} />
          <g fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
            <path d="M67 42 a10 10 0 0 1 16 0" /><path d="M71 38 a5 5 0 0 1 8 0" />
          </g>
          <circle cx="75" cy="41" r="2" fill="#fff" />
          <path d="M60 74 l15 -12 15 12" fill="none" stroke={LINE} strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      )
    case 'Demand Gen':
      return (
        <svg {...common}>
          <rect x="26" y="15" width="98" height="52" rx="2" fill="#fff" stroke={LINE} />
          <rect x="38" y="30" width="24" height="22" rx="4" fill={RED} />
          <path d="M47 36 l8 5 -8 5z" fill="#fff" />
          <rect x="66" y="30" width="20" height="15" rx="2" fill="none" stroke={BLUE_D} strokeWidth="1.5" />
          <path d="M66 31 l10 8 10 -8" fill="none" stroke={BLUE_D} strokeWidth="1.5" />
          <path d="M102 30 v14 M95 37 h14 M97 32 l10 10 M107 32 l-10 10" stroke={BLUE_D} strokeWidth="1.5" />
        </svg>
      )
    case 'YouTube & partners video':
      return (
        <svg {...common}>
          <rect x="30" y="15" width="90" height="52" rx="2" fill={REDBG} stroke={LINE} />
          <rect x="58" y="27" width="34" height="24" rx="6" fill={RED} />
          <path d="M71 33 l11 6 -11 6z" fill="#fff" />
          <line x1="40" y1="73" x2="110" y2="73" stroke={LINE} strokeWidth="3" />
        </svg>
      )
    default:
      return <svg {...common} />
  }
}

export function TypePicker({ heading, footer, onSelect }: {
  heading: string
  footer?: string
  onSelect: (title: string) => void
}) {
  return (
    <div className="mx-auto max-w-4xl rounded-lg border border-gborder bg-white p-6">
      <p className="mb-4 text-14 text-gtext-primary">{heading}</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LINE_ITEM_TYPES.map((t) => (
          <button
            key={t.title}
            onClick={() => !t.soon && onSelect(t.title)}
            disabled={t.soon}
            className={`flex flex-col overflow-hidden rounded-lg border text-left transition ${
              t.soon ? 'cursor-not-allowed border-gborder' : 'border-gborder hover:border-gblue-600 hover:shadow-sm'
            }`}
          >
            <div className="flex h-32 items-center justify-center bg-[#f8f9fa]">
              <Art title={t.title} />
            </div>
            <div className="border-t border-gborder-light p-4">
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
