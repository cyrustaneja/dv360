import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import LaunchFromHub from './LaunchFromHub'

function FullPageLoader() {
  return (
    <div className="flex h-screen items-center justify-center bg-gbg-page">
      <div className="flex items-center gap-2 text-13 text-gtext-secondary">
        <span className="material-icons animate-spin text-gblue-600">progress_activity</span>
        Loading…
      </div>
    </div>
  )
}

/** Requires a hub session; otherwise show the launch page (never a login form). */
export function RequireAuth({ children }: { children: JSX.Element }) {
  const { loading, me } = useAuth()
  if (loading) return <FullPageLoader />
  if (!me) return <LaunchFromHub />
  return children
}

/** Requires admin or expert role. */
export function RequireStaff({ children }: { children: JSX.Element }) {
  const { loading, me, isStaff } = useAuth()
  if (loading) return <FullPageLoader />
  if (!me) return <LaunchFromHub />
  if (!isStaff) return <Navigate to="/" replace />
  return children
}
