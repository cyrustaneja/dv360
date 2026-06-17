import { useNavigate } from 'react-router-dom'
import { useBreadcrumb } from '../../components/layout/breadcrumb'
import { PageHeader, FilterBar, Dropdown, IconButton, Button } from '../../components/ui/primitives'
import { Icon } from '../../lib/icons'
import { ADVERTISER, type Creative } from '../../data/mock'
import { useStore } from '../../store'

export default function Creatives() {
  useBreadcrumb([{ label: ADVERTISER.label, name: ADVERTISER.name }])
  const navigate = useNavigate()
  const { state } = useStore()
  return (
    <div className="pb-8">
      <PageHeader title="Creatives" />
      <div className="flex items-center gap-3 px-6 pt-3">
        <Button variant="filled" size="sm" onClick={() => navigate('/advertiser/creatives/new')}>
          <Icon name="add" size={18} /> New creative
        </Button>
        <div className="ml-auto flex items-center gap-2">
          <Dropdown label={<span className="text-13">Sort: Created</span>} items={['Created', 'Name', 'Last modified']} />
          <IconButton name="grid_view" label="Grid view" />
          <IconButton name="view_list" label="List view" />
        </div>
      </div>
      <FilterBar count={0} chip="" />

      <div className="grid grid-cols-2 gap-4 px-6 py-5 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
        {state.creatives.map((c) => (
          <CreativeCard key={c.id} c={c} />
        ))}
      </div>
    </div>
  )
}

function CreativeCard({ c }: { c: Creative }) {
  const [w, h] = c.dimensions.split('×').map((s) => parseInt(s.trim(), 10))
  const ratio = w && h ? w / h : 1.2
  return (
    <div className="group cursor-pointer">
      <div className="flex h-[150px] items-center justify-center overflow-hidden rounded border border-gborder bg-gbg-hover">
        <div
          className="flex flex-col items-center justify-center px-2 text-center text-white"
          style={{
            background: c.accent,
            width: ratio >= 1 ? '90%' : `${ratio * 90}%`,
            aspectRatio: `${w} / ${h}`,
            maxHeight: '90%',
          }}
        >
          <span className="text-[10px] font-bold uppercase tracking-wide opacity-80">Kraftshala</span>
          <span className="mt-0.5 text-[11px] font-medium leading-tight">{c.dimensions}</span>
        </div>
      </div>
      <div className="mt-1.5 truncate text-12 text-gblue-700 group-hover:underline">{c.name}</div>
      <div className="text-11 text-gtext-secondary">{c.dimensions} · {c.type}</div>
    </div>
  )
}
