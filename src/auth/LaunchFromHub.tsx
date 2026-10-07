import { useState } from 'react'
import { DV360Logo } from '../lib/icons'

/** Shown when there's no valid hub session. Never a login form. */
export default function LaunchFromHub() {
  const hub = import.meta.env.VITE_HUB_URL || '#'
  const isLocal =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('student')
  const devLogin = (r: string, em: string) => {
    const e = em.trim() || `${r}@kraftshala.dev`
    window.location.href = `/api/dev-token?role=${r}&email=${encodeURIComponent(e)}&name=${encodeURIComponent(e.split('@')[0])}`
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-gbg-page px-4">
      <div className="w-full max-w-md rounded-lg border border-gborder bg-white p-10 text-center shadow-sm">
        <div className="mb-4 flex items-center justify-center gap-2">
          <DV360Logo size={28} />
          <span className="text-15 text-gtext-secondary">Display &amp; Video 360</span>
        </div>
        <h1 className="font-gsans text-20 text-gtext-primary">Please launch from the Kraftshala Hub</h1>
        <p className="mt-2 text-14 text-gtext-secondary">
          This simulation can only be opened from the Kraftshala Simulation Hub, which signs you in
          automatically. There's no separate login here.
        </p>
        <a
          href={hub}
          className="mt-6 inline-block rounded bg-gblue-600 px-5 py-2.5 text-14 font-medium text-white hover:bg-gblue-700"
        >
          Go to the Hub
        </a>

        {isLocal && (
          <div className="mt-8 border-t border-gborder-light pt-5 text-left">
            <div className="mb-2 text-center text-11 uppercase tracking-wide text-gtext-disabled">
              Developer login (local machine only)
            </div>
            <div className="mb-3 flex justify-center gap-2">
              <button onClick={() => devLogin('student', 'test.student@kraftshala.dev')} className="rounded border border-gborder px-3 py-1.5 text-12 text-gtext-primary hover:bg-gbg-page">Student</button>
              <button onClick={() => devLogin('expert', 'test.expert@kraftshala.dev')} className="rounded border border-gborder px-3 py-1.5 text-12 text-gtext-primary hover:bg-gbg-page">Expert</button>
              <button onClick={() => devLogin('admin', 'test.admin@kraftshala.dev')} className="rounded border border-gborder px-3 py-1.5 text-12 text-gtext-primary hover:bg-gbg-page">Admin</button>
            </div>
            <div className="rounded border border-gborder-light bg-gbg-page p-2.5">
              <div className="mb-1.5 text-11 text-gtext-secondary">Or sign in as a specific person (test isolation):</div>
              <div className="flex items-center gap-2">
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. asha@batch1.dev"
                  className="h-8 flex-1 rounded border border-gborder px-2 text-12 focus:border-gblue-600 focus:outline-none" />
                <select value={role} onChange={(e) => setRole(e.target.value)} className="h-8 rounded border border-gborder px-1 text-12">
                  <option value="student">Student</option>
                  <option value="expert">Expert</option>
                  <option value="admin">Admin</option>
                </select>
                <button onClick={() => devLogin(role, email)} className="h-8 rounded bg-gblue-600 px-3 text-12 font-medium text-white hover:bg-gblue-700">Go</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
