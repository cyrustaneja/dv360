import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useStore } from '../store'
import { Icon } from '../lib/icons'

/**
 * Student onboarding tour. A floating coach panel that first explains DV360, then
 * walks the student through building one complete campaign — advertiser → campaign
 * → insertion order → line item → creative → audience. Each step auto-completes as
 * the student actually creates the thing (detected from store state). Students only.
 */
export function GuidedTour() {
  const { me, role } = useAuth()
  const { state } = useStore()
  const navigate = useNavigate()
  const sub = me?.sub ?? ''
  const doneKey = `dv360-tour-done-${sub}`
  const welcomeKey = `dv360-tour-welcome-${sub}`

  const [welcomeSeen, setWelcomeSeen] = useState(() => localStorage.getItem(welcomeKey) === '1')
  const [done, setDone] = useState(() => localStorage.getItem(doneKey) === '1')
  const [open, setOpen] = useState(true)
  const [forced, setForced] = useState(false)

  // Re-run the tour when the header/help "Take the tour" button fires the event.
  useEffect(() => {
    const handler = () => {
      localStorage.removeItem(doneKey); localStorage.removeItem(welcomeKey)
      setDone(false); setWelcomeSeen(false); setForced(true); setOpen(true)
    }
    window.addEventListener('dv360:start-tour', handler)
    return () => window.removeEventListener('dv360:start-tour', handler)
  }, [doneKey, welcomeKey])

  // Auto-show for students; anyone can trigger it manually.
  if ((role !== 'student' && !forced) || (done && !forced)) return null

  const adv = state.currentAdvertiser
  const firstCampaign = state.campaigns[0]
  const firstIO = state.ios[0]

  // Ordered steps; each knows if it's complete and where its action lives.
  const steps = [
    { key: 'advertiser', title: 'Create an advertiser', body: 'Your advertiser is your workspace / brand. On the home screen click “New advertiser”, name it, and open it.', done: state.advertisers.length > 0, cta: null as null | { label: string; go: () => void } },
    { key: 'campaign', title: 'Create a campaign', body: 'A campaign holds your overall goal, KPI and planned budget. Give it a goal and a name.', done: state.campaigns.length > 0, cta: adv ? { label: 'New campaign', go: () => navigate('/advertiser/campaigns/new') } : null },
    { key: 'io', title: 'Add an insertion order', body: 'An insertion order (IO) sits inside a campaign and sets a budget, pacing and flight dates.', done: state.ios.length > 0, cta: firstCampaign ? { label: 'New insertion order', go: () => navigate(`/advertiser/insertion-orders/new?campaignId=${firstCampaign.id}`) } : (adv ? { label: 'Open your campaign', go: () => navigate('/advertiser/campaigns') } : null) },
    { key: 'lineitem', title: 'Add a line item', body: 'The line item is where the real work happens — you choose the type, set bidding, frequency, targeting and attach creatives.', done: state.lineItems.length > 0, cta: firstIO ? { label: 'New line item', go: () => navigate(`/advertiser/line-items/new?ioId=${firstIO.id}`) } : null },
    { key: 'creative', title: 'Create a creative', body: 'Creatives are your actual ads. Upload a real image — you’ll attach it to your line item.', done: state.creatives.length > 0, cta: adv ? { label: 'New creative', go: () => navigate('/advertiser/creatives/new') } : null },
    { key: 'audience', title: 'Build an audience', body: 'Audiences define who sees your ads. Create one, then you can target it from a line item.', done: state.raw.audiences.length > 0, cta: adv ? { label: 'New audience', go: () => navigate('/advertiser/audiences/new') } : null },
  ]

  const completedCount = steps.filter((s) => s.done).length
  const current = steps.find((s) => !s.done)
  const allDone = !current

  const skip = () => { localStorage.setItem(doneKey, '1'); setDone(true); setForced(false) }
  const finish = () => { localStorage.setItem(doneKey, '1'); setDone(true); setForced(false) }
  const startTour = () => { localStorage.setItem(welcomeKey, '1'); setWelcomeSeen(true) }

  // Collapsed pill
  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-gblue-600 px-4 py-2.5 text-13 font-medium text-white shadow-lg hover:bg-gblue-700">
        <Icon name="school" size={18} /> Resume tour ({completedCount}/{steps.length})
      </button>
    )
  }

  return (
    <div className="fixed bottom-5 right-5 z-40 w-[340px] rounded-xl border border-gborder bg-white shadow-2xl">
      <div className="flex items-center gap-2 border-b border-gborder-light px-4 py-2.5">
        <Icon name="school" size={18} className="text-gblue-700" />
        <span className="text-13 font-medium text-gtext-primary">Getting started with DV360</span>
        <button onClick={() => setOpen(false)} className="ml-auto flex h-7 w-7 items-center justify-center rounded-full hover:bg-gbg-page" title="Minimize">
          <Icon name="remove" size={18} className="text-gtext-secondary" />
        </button>
      </div>

      {!welcomeSeen ? (
        <div className="p-4">
          <div className="text-14 font-medium text-gtext-primary">Welcome, {me?.name || 'there'} 👋</div>
          <p className="mt-2 text-12 leading-relaxed text-gtext-secondary">
            Display &amp; Video 360 is Google’s platform to plan and buy display, video and audio ads across the web,
            apps, YouTube and connected TV. Work is organised like this:
          </p>
          <ul className="mt-2 space-y-1 text-12 text-gtext-primary">
            <li>🏢 <b>Advertiser</b> — your workspace</li>
            <li>📣 <b>Campaign</b> — your goal &amp; budget</li>
            <li>🧾 <b>Insertion order</b> — budget &amp; flight</li>
            <li>🎯 <b>Line item</b> — targeting, bidding &amp; ads</li>
            <li>🖼️ <b>Creatives</b> · 👥 <b>Audiences</b> · 🧩 <b>Targeting templates</b></li>
          </ul>
          <p className="mt-2 text-12 text-gtext-secondary">This tour walks you through building one complete campaign. Ready?</p>
          <div className="mt-3 flex items-center gap-3">
            <button onClick={startTour} className="rounded bg-gblue-600 px-4 py-1.5 text-13 font-medium text-white hover:bg-gblue-700">Start tour</button>
            <button onClick={skip} className="text-12 text-gtext-secondary hover:underline">Skip</button>
          </div>
        </div>
      ) : allDone ? (
        <div className="p-4">
          <div className="text-14 font-medium text-gtext-primary">🎉 You built a complete campaign!</div>
          <p className="mt-2 text-12 leading-relaxed text-gtext-secondary">
            You’ve created an advertiser, campaign, insertion order, line item, creative and audience — the full flow.
            Now explore freely: edit anything, add targeting, try reports and templates.
          </p>
          <button onClick={finish} className="mt-3 rounded bg-gblue-600 px-4 py-1.5 text-13 font-medium text-white hover:bg-gblue-700">Finish</button>
        </div>
      ) : (
        <div className="p-4">
          {/* progress dots */}
          <div className="mb-3 flex items-center gap-1.5">
            {steps.map((s) => (
              <span key={s.key} className={`h-1.5 flex-1 rounded-full ${s.done ? 'bg-gstatus-green' : s.key === current!.key ? 'bg-gblue-600' : 'bg-gborder'}`} />
            ))}
          </div>
          <div className="text-11 font-medium uppercase tracking-wide text-gtext-secondary">Step {completedCount + 1} of {steps.length}</div>
          <div className="mt-0.5 text-14 font-medium text-gtext-primary">{current!.title}</div>
          <p className="mt-1.5 text-12 leading-relaxed text-gtext-secondary">{current!.body}</p>
          <div className="mt-3 flex items-center gap-3">
            {current!.cta
              ? <button onClick={current!.cta.go} className="rounded bg-gblue-600 px-4 py-1.5 text-13 font-medium text-white hover:bg-gblue-700">{current!.cta.label}</button>
              : <span className="text-12 text-gtext-secondary">Open an advertiser to continue.</span>}
            <button onClick={skip} className="ml-auto text-12 text-gtext-secondary hover:underline">Skip tour</button>
          </div>
        </div>
      )}
    </div>
  )
}
