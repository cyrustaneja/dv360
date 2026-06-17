import { DV360Logo } from '../lib/icons'

/** Shown when there's no valid hub session. Never a login form. */
export default function LaunchFromHub() {
  const hub = import.meta.env.VITE_HUB_URL || '#'
  return (
    <div className="flex min-h-screen items-center justify-center bg-gbg-page px-4">
      <div className="w-full max-w-md rounded-lg border border-gborder bg-white p-10 text-center shadow-sm">
        <div className="mb-4 flex items-center justify-center gap-2">
          <DV360Logo size={28} />
          <span className="text-15 text-gtext-secondary">Display &amp; Video 360</span>
        </div>
        <h1 className="font-gsans text-20 text-gtext-primary">Please launch from the Kraftshala Hub</h1>
        <p className="mt-2 text-13 text-gtext-secondary">
          This simulation can only be opened from the Kraftshala Simulation Hub, which signs you in
          automatically. There's no separate login here.
        </p>
        <a
          href={hub}
          className="mt-6 inline-block rounded bg-gblue-600 px-5 py-2.5 text-13 font-medium text-white hover:bg-gblue-700"
        >
          Go to the Hub
        </a>
      </div>
    </div>
  )
}
