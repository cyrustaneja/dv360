import { useBlocker } from 'react-router-dom'

/**
 * Blocks in-app navigation while a form has unsaved edits and shows DV360's exact
 * "Unsaved Changes" dialog. Drop <UnsavedChangesGuard when={dirty} /> into any
 * editor. Uses the data-router useBlocker (createHashRouter).
 */
export function UnsavedChangesGuard({ when }: { when: boolean }) {
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) => when && currentLocation.pathname !== nextLocation.pathname,
  )

  if (blocker.state !== 'blocked') return null

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40" onClick={() => blocker.reset?.()}>
      <div className="w-[420px] rounded-g bg-white p-6 shadow-gmenu" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-gsans text-18 text-gtext-primary">Unsaved Changes</h2>
        <p className="mt-2 text-14 text-gtext-secondary">
          You have made changes that have not been saved and will be lost.
        </p>
        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            onClick={() => blocker.proceed?.()}
            className="rounded px-3 py-2 text-14 font-medium text-glink hover:bg-gblue-50"
          >
            Discard changes
          </button>
          <button
            onClick={() => blocker.reset?.()}
            className="rounded bg-gblue-600 px-4 py-2 text-14 font-medium text-white hover:bg-gblue-700"
          >
            Continue editing
          </button>
        </div>
      </div>
    </div>
  )
}
