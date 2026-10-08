import { useEffect, useState } from 'react'

/**
 * Thin top progress bar (DV360/Google style) that animates whenever one or more
 * API requests are in flight. Gives instant feedback on every click so the
 * ~0.5s warm / ~1.3s cold serverless round-trips don't feel like a dead UI.
 *
 * api.ts calls startLoad()/endLoad() around every fetch; render one <LoadingBar/>.
 */
let inflight = 0
let listeners: Array<(active: boolean) => void> = []
const emit = () => listeners.forEach((l) => l(inflight > 0))

export function startLoad() { inflight++; emit() }
export function endLoad() { inflight = Math.max(0, inflight - 1); emit() }

export function LoadingBar() {
  const [active, setActive] = useState(false)
  useEffect(() => {
    const l = (a: boolean) => setActive(a)
    listeners.push(l)
    return () => { listeners = listeners.filter((x) => x !== l) }
  }, [])
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[200] h-0.5 overflow-hidden" aria-hidden>
      {active && <div className="h-full w-full origin-left bg-gblue-600 animate-[dv360bar_1s_ease-in-out_infinite]" />}
    </div>
  )
}
