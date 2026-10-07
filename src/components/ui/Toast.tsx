import { useEffect, useState } from 'react'

/**
 * Minimal global snackbar matching DV360's "Changes saved" toast (dark surface,
 * bottom-left, auto-dismiss). Fire from anywhere with toast('…'); render one
 * <ToastHost/> near the app root.
 */
export interface ToastMsg { id: number; text: string }
let listeners: Array<(t: ToastMsg) => void> = []
let seq = 0

export function toast(text: string) {
  const msg = { id: ++seq, text }
  listeners.forEach((l) => l(msg))
}

export function ToastHost() {
  const [items, setItems] = useState<ToastMsg[]>([])
  useEffect(() => {
    const l = (t: ToastMsg) => {
      setItems((s) => [...s, t])
      window.setTimeout(() => setItems((s) => s.filter((x) => x.id !== t.id)), 3500)
    }
    listeners.push(l)
    return () => { listeners = listeners.filter((x) => x !== l) }
  }, [])
  return (
    <div className="pointer-events-none fixed bottom-5 left-6 z-[100] flex flex-col gap-2">
      {items.map((t) => (
        <div key={t.id} className="pointer-events-auto flex items-center gap-4 rounded bg-gbg-inverse px-4 py-3 text-14 text-white shadow-gmenu">
          <span>{t.text}</span>
        </div>
      ))}
    </div>
  )
}
