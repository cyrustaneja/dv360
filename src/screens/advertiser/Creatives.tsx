import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBreadcrumb } from '../../components/layout/breadcrumb'
import { PageHeader, FilterBar, Dropdown, IconButton, Button, Pagination } from '../../components/ui/primitives'
import { Icon } from '../../lib/icons'
import { type Creative } from '../../data/mock'
import { useStore } from '../../store'

export default function Creatives() {
  const navigate = useNavigate()
  const { state } = useStore()
  useBreadcrumb([{ label: 'Advertiser', name: state.currentAdvertiser?.name ?? '' }])
  const advName = state.currentAdvertiser?.name ?? ''
  const [view, setView] = useState<'list' | 'grid'>('list') // DV360 defaults to list
  const creatives = state.creatives

  return (
    <div className="pb-8">
      <PageHeader title="Creatives" />
      <div className="flex items-center gap-3 px-6 pt-3">
        <Button variant="filled" size="sm" onClick={() => navigate('/advertiser/creatives/new')}>
          <Icon name="add" size={18} /> New creative
        </Button>
        <div className="ml-auto flex items-center gap-2">
          <Dropdown label={<span className="text-13">Sort: Created</span>} items={['Created', 'Name', 'Last modified']} />
          <button onClick={() => setView('grid')} className={`flex h-9 w-9 items-center justify-center rounded-full hover:bg-gbg-page ${view === 'grid' ? 'text-gblue-600' : 'text-gtext-secondary'}`} title="Grid view"><Icon name="grid_view" size={20} /></button>
          <button onClick={() => setView('list')} className={`flex h-9 w-9 items-center justify-center rounded-full hover:bg-gbg-page ${view === 'list' ? 'text-gblue-600' : 'text-gtext-secondary'}`} title="List view"><Icon name="view_list" size={20} /></button>
        </div>
      </div>
      <FilterBar count={creatives.length} chip="" />

      {creatives.length === 0 ? (
        <div className="px-6 py-10 text-center text-14 text-gtext-secondary">
          No creatives yet. Click <span className="font-medium">New creative</span> to add one.
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-2 gap-4 px-6 py-5 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
          {creatives.map((c) => (
            <CreativeCard key={c.id} c={c} advName={advName} onClick={() => navigate(`/advertiser/creatives/${c.id}/edit`)} />
          ))}
        </div>
      ) : (
        <CreativeTable creatives={creatives} onRow={(id) => navigate(`/advertiser/creatives/${id}/edit`)} />
      )}
      {creatives.length > 0 && view === 'list' && <Pagination total={creatives.length} />}
    </div>
  )
}

/** DV360 list view: columns mirror the real Creatives table. */
function CreativeTable({ creatives, onRow }: { creatives: Creative[]; onRow: (id: string) => void }) {
  const cols = ['Name', 'ID', 'Status', 'Type', 'Format', 'DV360 status', 'Dimensions', 'Source', 'Line Items']
  return (
    <table className="mt-2 w-full text-14">
      <thead>
        <tr className="border-b border-gborder text-left text-12 text-gtext-secondary">
          {cols.map((c) => <th key={c} className="whitespace-nowrap px-4 py-2 font-medium">{c}</th>)}
        </tr>
      </thead>
      <tbody>
        {creatives.map((c) => (
          <tr key={c.id} className="cursor-pointer border-b border-gborder-light hover:bg-gbg-page" onClick={() => onRow(c.id)}>
            <td className="flex items-center gap-2 px-4 py-2.5">
              {c.image_url
                ? <img src={c.image_url} alt="" className="h-6 w-10 shrink-0 rounded object-cover" />
                : <span className="flex h-6 w-10 shrink-0 items-center justify-center rounded text-[8px] font-medium text-white" style={{ background: c.accent }}>{c.dimensions}</span>}
              <span className="text-glink">{c.name}</span>
            </td>
            <td className="px-4 py-2.5 text-gtext-secondary">{c.id.slice(0, 8)}</td>
            <td className="px-4 py-2.5"><span className="inline-flex items-center gap-1 text-gtext-secondary"><span className="h-2 w-2 rounded-full bg-gstatus-greenDot" /> Active</span></td>
            <td className="px-4 py-2.5 text-gtext-secondary">{c.type}</td>
            <td className="px-4 py-2.5 text-gtext-secondary">Standard</td>
            <td className="px-4 py-2.5 text-gtext-secondary">Servable</td>
            <td className="px-4 py-2.5 text-gtext-secondary">{c.dimensions}</td>
            <td className="px-4 py-2.5 text-gtext-secondary">Uploaded</td>
            <td className="px-4 py-2.5 text-gtext-secondary">—</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function CreativeCard({ c, advName, onClick }: { c: Creative; advName: string; onClick: () => void }) {
  const [w, h] = c.dimensions.split('×').map((s) => parseInt(s.trim(), 10))
  const ratio = w && h ? w / h : 1.2
  return (
    <div className="group cursor-pointer" onClick={onClick}>
      <div className="flex h-[150px] items-center justify-center overflow-hidden rounded border border-gborder bg-gbg-hover">
        {c.image_url ? (
          <img src={c.image_url} alt={c.name} className="max-h-full max-w-full object-contain" />
        ) : (
          <div
            className="flex flex-col items-center justify-center px-2 text-center text-white"
            style={{
              background: c.accent,
              width: ratio >= 1 ? '90%' : `${ratio * 90}%`,
              aspectRatio: `${w} / ${h}`,
              maxHeight: '90%',
            }}
          >
            <span className="text-[10px] font-bold uppercase tracking-wide opacity-80">{advName}</span>
            <span className="mt-0.5 text-[11px] font-medium leading-tight">{c.dimensions}</span>
          </div>
        )}
      </div>
      <div className="mt-1.5 truncate text-12 text-glink group-hover:underline">{c.name}</div>
      <div className="text-11 text-gtext-secondary">{c.dimensions} · {c.type}</div>
    </div>
  )
}
