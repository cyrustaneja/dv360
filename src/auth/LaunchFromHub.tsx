import { DV360Logo } from '../lib/icons'

/** Shown when there's no valid hub session. Never a login form. */
export default function LaunchFromHub() {
  const hub = import.meta.env.VITE_HUB_URL || '#'
  const isLocal =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
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

        {isLocal && (
          <div className="mt-8 border-t border-gborder-light pt-5">
            <div className="mb-2 text-11 uppercase tracking-wide text-gtext-disabled">
              Developer login (local machine only)
            </div>
            <div className="flex justify-center gap-2">
              <a href="/api/dev-token?role=student&email=test.student@kraftshala.dev&name=Test%20Student"
                 className="rounded border border-gborder px-3 py-1.5 text-12 text-gtext-primary hover:bg-gbg-page">Student</a>
              <a href="/api/dev-token?role=expert&email=test.expert@kraftshala.dev&name=Test%20Expert"
                 className="rounded border border-gborder px-3 py-1.5 text-12 text-gtext-primary hover:bg-gbg-page">Expert</a>
              <a href="/api/dev-token?role=admin&email=test.admin@kraftshala.dev&name=Test%20Admin"
                 className="rounded border border-gborder px-3 py-1.5 text-12 text-gtext-primary hover:bg-gbg-page">Admin</a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
