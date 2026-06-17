import { useState } from 'react'
import { useBreadcrumb } from '../../components/layout/breadcrumb'
import { WizardShell, SectionTitle } from './WizardShell'
import { TextField, CheckRow } from '../../components/ui/parts'
import { Button, Dropdown, useOutside } from '../../components/ui/primitives'
import { Icon } from '../../lib/icons'
import { ADVERTISER } from '../../data/mock'
import { useRef } from 'react'

const targetingCategories = [
  'Content', 'Brand suitability', 'Apps & URLs', 'Keywords', 'Categories & genres',
  'Environment', 'Position', 'Viewability', 'Language', 'Video', 'User-rewarded content', 'Audience',
]

type Panel = 'Brand suitability' | 'Apps & URLs' | 'Environment' | null

export default function NewTargetingTemplate() {
  useBreadcrumb([{ label: ADVERTISER.label, name: ADVERTISER.name, to: '/advertiser/targeting-templates' }])
  const [added, setAdded] = useState<string[]>(['Environment'])
  const [panel, setPanel] = useState<Panel>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  useOutside(menuRef, () => setMenuOpen(false))

  const openPanel = (cat: string) => {
    if (cat === 'Brand suitability' || cat === 'Apps & URLs' || cat === 'Environment') setPanel(cat)
    if (!added.includes(cat)) setAdded((a) => [...a, cat])
    setMenuOpen(false)
  }

  return (
    <div className="relative">
      <WizardShell title="New targeting template">
        <TextField label="Name" placeholder="" width="w-full" />
        <div className="mt-4">
          <TextField label="Description" placeholder="Optional" width="w-full" />
        </div>

        <SectionTitle>Inventory source</SectionTitle>
        <div className="space-y-1 border-t border-gborder-light pt-2">
          <SettingRow label="Quality">
            <Dropdown
              label={<span className="text-13">Authorized and Non-Participating Publishers</span>}
              items={['Authorized Direct Sellers and Resellers', 'Authorized and Non-Participating Publishers', 'All inventory']}
            />
          </SettingRow>
          <SettingRow label="Public Inventory" value="47 Exchanges and 0 Subexchanges are selected · Targeting new exchanges" edit />
          <SettingRow label="Deals and Packages" value="0 deals and packages selected" edit>
            <CheckRow label="Target DV360 curated CTV auction inventory" />
          </SettingRow>
          <SettingRow label="Deal groups and preferred deal groups" value="No inventory groups selected" edit />
        </div>

        <SectionTitle>Targeting</SectionTitle>
        <p className="text-12 text-gtext-secondary">Select your targeting criteria to control where your ads will be displayed.</p>

        <div className="mt-3 rounded border border-gblue-100 bg-gblue-50 p-3 text-12 text-gtext-secondary">
          <Icon name="auto_awesome" size={16} className="mr-1 text-gblue-700" />
          Advertisers who use optimized targeting on Display &amp; Video 360 can see, on average, a 25% improvement in their campaign objectives.
        </div>

        <div className="mt-2 space-y-1 border-t border-gborder-light pt-2">
          <SettingRow label="Optimized targeting">
            <CheckRow label="Use optimized targeting" />
          </SettingRow>
          {added.map((cat) => (
            <SettingRow
              key={cat}
              label={cat}
              value={summaryFor(cat)}
              edit
              onEdit={() => openPanel(cat)}
            />
          ))}
        </div>

        <div ref={menuRef} className="relative mt-4">
          <Button variant="text" size="sm" onClick={() => setMenuOpen((o) => !o)}>
            <Icon name="add" size={18} /> Add targeting
          </Button>
          {menuOpen && (
            <div className="absolute z-30 mt-1 w-56 rounded bg-white py-1 shadow-gmenu">
              {targetingCategories.map((c) => (
                <button
                  key={c}
                  onClick={() => openPanel(c)}
                  className="flex w-full items-center justify-between px-4 py-2 text-left text-13 text-gtext-primary hover:bg-gbg-page"
                >
                  {c}
                  {added.includes(c) && <span className="text-11 text-gtext-secondary">Added</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </WizardShell>

      {panel && <TargetingPanel kind={panel} onClose={() => setPanel(null)} />}
    </div>
  )
}

function summaryFor(cat: string): string {
  if (cat === 'Environment') return 'Web, App'
  if (cat === 'Brand suitability') return '0 items excluded'
  if (cat === 'Apps & URLs') return 'None selected'
  return 'Not configured'
}

function SettingRow({
  label,
  value,
  edit,
  onEdit,
  children,
}: {
  label: string
  value?: string
  edit?: boolean
  onEdit?: () => void
  children?: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between border-b border-gborder-light py-3">
      <div className="grid grid-cols-[180px_1fr] gap-6">
        <div className="flex items-center gap-2 text-13 font-medium text-gtext-primary">
          <Icon name="check" size={16} className="text-gstatus-green" />
          {label}
        </div>
        <div>
          {value && <div className="text-13 text-gtext-secondary">{value}</div>}
          {children}
        </div>
      </div>
      {edit && (
        <button onClick={onEdit} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gbg-page">
          <Icon name="edit" size={18} className="text-gtext-secondary" />
        </button>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Slide-in targeting panels                                                  */
/* -------------------------------------------------------------------------- */

function TargetingPanel({ kind, onClose }: { kind: Exclude<Panel, null>; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40 flex">
      <div className="flex-1 bg-black/20" onClick={onClose} />
      <div className="flex w-[520px] flex-col bg-white shadow-gpanel">
        <div className="flex h-12 shrink-0 items-center gap-3 border-b border-gborder px-4">
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-gbg-page">
            <Icon name="arrow_back" size={20} className="text-gtext-secondary" />
          </button>
          <h2 className="text-15 text-gtext-primary">{kind}</h2>
        </div>
        <div className="flex-1 overflow-auto px-5 py-4">
          {kind === 'Brand suitability' && <BrandSuitability />}
          {kind === 'Apps & URLs' && <AppsUrls />}
          {kind === 'Environment' && <Environment />}
        </div>
        <div className="flex items-center gap-4 border-t border-gborder px-5 py-3">
          <Button variant="filled" size="sm" onClick={onClose}>Apply</Button>
          <button onClick={onClose} className="text-13 font-medium text-gblue-700 hover:underline">Cancel</button>
        </div>
      </div>
    </div>
  )
}

function BrandSuitability() {
  return (
    <div>
      <Accordion title="Digital content label exclusions" right="0 items excluded" open>
        <p className="mb-2 text-12 text-gtext-secondary">Select digital content labels to exclude from targeting. You can’t exclude all content.</p>
        <CheckRow label="Content suitable for all audiences (G)" />
        <CheckRow label="Content suitable for younger teens (G, PG)" />
        <CheckRow label="Content suitable for teens (G, PG, T)" />
        <CheckRow label="Adult content (DL, MA)" />
        <CheckRow label="Content not yet rated" />
      </Accordion>
      <Accordion title="Sensitive category exclusions" right="0 items excluded" />
      <Accordion title="Other verification services" right="0 items selected" />
    </div>
  )
}

function AppsUrls() {
  const rows = [
    { t: 'Channels', d: 'Select custom groups of apps and URLs or exclude from display and video line items.' },
    { t: 'Collections', d: 'Curated groups of related apps provided by platform.' },
    { t: 'URLs', d: 'Individual websites and webpages.' },
    { t: 'Apps', d: 'Individual apps for connected TV, Android, and iOS.' },
  ]
  return (
    <div>
      <div className="mb-3 text-12 text-gtext-secondary">Choose a category</div>
      {rows.map((r) => (
        <button key={r.t} className="flex w-full items-center justify-between border-b border-gborder-light py-3 text-left hover:bg-gbg-page">
          <div className="pr-4">
            <div className="text-13 font-medium text-gtext-primary">{r.t}</div>
            <div className="text-12 text-gtext-secondary">{r.d}</div>
          </div>
          <Icon name="chevron_right" size={20} className="text-gtext-secondary" />
        </button>
      ))}
      <div className="mt-4 flex items-center justify-between text-13 text-gblue-700">
        <button>+ Add multiple apps and URLs at once</button>
        <button>Download composite list</button>
      </div>
    </div>
  )
}

function Environment() {
  return (
    <div>
      <p className="mb-3 text-12 text-gtext-secondary">Choose where your ads can appear.</p>
      <CheckRow label="Web" hint="Inventory displayed in browsers" checked />
      <CheckRow label="App" hint="Inventory displayed in apps" checked />
    </div>
  )
}

function Accordion({ title, right, open, children }: { title: string; right: string; open?: boolean; children?: React.ReactNode }) {
  const [isOpen, setOpen] = useState(!!open)
  return (
    <div className="border-b border-gborder-light">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between py-3 text-left">
        <span className="text-13 font-medium text-gtext-primary">{title}</span>
        <span className="flex items-center gap-2 text-12 text-gtext-secondary">
          {right}
          <Icon name={isOpen ? 'expand_less' : 'expand_more'} size={18} />
        </span>
      </button>
      {isOpen && children && <div className="pb-3">{children}</div>}
    </div>
  )
}
