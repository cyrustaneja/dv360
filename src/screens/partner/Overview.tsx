import { Link } from 'react-router-dom'
import { Icon } from '../../lib/icons'
import { useBreadcrumb } from '../../components/layout/breadcrumb'
import { Tabs } from '../../components/ui/primitives'
import { PARTNER, recentlyOpened, tutorials } from '../../data/mock'
import { useState } from 'react'

export default function Overview() {
  useBreadcrumb([{ label: PARTNER.label, name: PARTNER.name }])
  const [tab, setTab] = useState('Insertion order')

  return (
    <div className="flex min-h-full">
      {/* Main column */}
      <div className="min-w-0 flex-1 px-6 py-4">
        <div className="mb-4 flex items-center gap-2">
          <button className="flex items-center gap-1 rounded border border-gborder px-3 py-1.5 text-13 text-gtext-primary hover:bg-gbg-hover">
            System generated workspace
            <Icon name="arrow_drop_down" size={20} className="text-gtext-secondary" />
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gbg-page">
            <Icon name="edit" size={18} className="text-gtext-secondary" />
          </button>
        </div>

        <div className="rounded-lg border border-gborder bg-white">
          <div className="grid grid-cols-3 divide-x divide-gborder-light border-b border-gborder-light">
            <RiskTile label="Underpacing" />
            <RiskTile label="Underperforming" />
            <RiskTile label="With rejected creatives" />
          </div>
          <div className="grid grid-cols-2 gap-6 px-4 py-3 text-12 text-gtext-secondary">
            <div>Total budget at risk</div>
            <div>Total flight spend</div>
          </div>

          <Tabs tabs={['Insertion order']} active={tab} onChange={setTab} />
          <div className="flex items-center gap-6 border-b border-gborder px-4 py-2 text-12 text-gtext-secondary">
            <span className="ml-auto">Pacing</span>
            <span>Budget at risk</span>
            <span>Flight budget</span>
            <span>Days left</span>
          </div>
          <div className="px-4 py-3 text-right text-12 text-gtext-secondary">Showing 0-0 of 0</div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4">
          <Panel title="Rejected creatives" empty="There are no rejected creatives (not including YouTube & partners)" />
          <Panel title="Underperforming insertion orders" empty="There are no underperforming insertion orders" />
        </div>
      </div>

      {/* Right rail */}
      <aside className="w-[300px] shrink-0 border-l border-gborder px-5 py-5">
        <RailSection title="Start a tutorial">
          <div className="space-y-3">
            {tutorials.map((t) => (
              <button key={t.title} className="flex w-full items-center gap-3 text-left">
                <Icon name="play_circle" size={20} className="text-gblue-700" />
                <span className="flex-1 text-13 text-gblue-700">{t.title}</span>
                <span className="text-12 text-gtext-secondary">{t.minutes} min</span>
              </button>
            ))}
          </div>
        </RailSection>

        <RailSection title="Pinned items">
          <div className="text-13 text-gtext-secondary">There are no pinned items.</div>
        </RailSection>

        <RailSection title="Recently opened">
          <table className="w-full text-12">
            <thead>
              <tr className="text-gtext-secondary">
                <th className="pb-1 text-left font-normal">Line items</th>
                <th className="pb-1 text-right font-normal">Last viewed</th>
              </tr>
            </thead>
            <tbody>
              {recentlyOpened.map((r, i) => (
                <tr key={i}>
                  <td className="py-1.5">
                    <div className="text-11 text-gtext-secondary">{r.advertiser} ›</div>
                    <Link to="/advertiser/campaigns" className="text-13 text-gblue-700 hover:underline">
                      {r.name}
                    </Link>
                  </td>
                  <td className="py-1.5 text-right align-bottom text-12 text-gtext-secondary">{r.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </RailSection>
      </aside>
    </div>
  )
}

function RiskTile({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center px-4 py-4 text-center">
      <div className="font-gsans text-[22px] text-gtext-primary">-</div>
      <div className="mt-1 text-12 text-gtext-secondary">{label}</div>
      <div className="text-12 text-gtext-secondary">insertion orders</div>
    </div>
  )
}

function Panel({ title, empty }: { title: string; empty: string }) {
  return (
    <div className="rounded-lg border border-gborder bg-white">
      <div className="border-b border-gborder-light px-4 py-3 text-14 font-medium text-gtext-primary">{title}</div>
      <div className="flex items-center gap-2 px-4 py-6 text-13 text-gtext-secondary">
        <Icon name="check_circle" size={18} className="text-gstatus-green" />
        {empty}
      </div>
    </div>
  )
}

function RailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-7">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-gsans text-15 text-gtext-primary">{title}</h2>
        <Icon name="open_in_full" size={16} className="text-gtext-secondary" />
      </div>
      {children}
    </section>
  )
}
