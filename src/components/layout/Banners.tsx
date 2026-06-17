import { useState } from 'react'
import { Icon } from '../../lib/icons'

/**
 * The two announcement strips that sit directly under the app header in the
 * reference: a blue product-update notice and an amber deletion warning.
 */
export function Banners({ showWarning = false }: { showWarning?: boolean }) {
  const [info, setInfo] = useState(true)
  const [warn, setWarn] = useState(true)

  return (
    <>
      {info && (
        <div className="flex h-7 shrink-0 items-center justify-between bg-gblue-50 px-4 text-12 text-gtext-primary">
          <span className="truncate">
            A number of important feature updates, deprecations, and changes to reporting metrics across Display &amp;
            Video 360 will be rolling out in Q2 2026.
          </span>
          <div className="flex shrink-0 items-center gap-4 pl-4">
            <button className="font-medium text-gblue-700 hover:underline">Learn more</button>
            <button className="font-medium text-gblue-700 hover:underline" onClick={() => setInfo(false)}>
              Dismiss
            </button>
          </div>
        </div>
      )}

      {showWarning && warn && (
        <div className="flex shrink-0 items-center justify-between bg-gstatus-amberBg px-4 py-1.5 text-12 text-gtext-primary">
          <span className="flex items-center gap-2 truncate">
            <Icon name="warning" size={18} className="text-gstatus-amber" filled />
            One or more advertisers belonging to your partner are scheduled for deletion.
          </span>
          <button className="shrink-0 pl-4 font-medium text-gblue-700 hover:underline" onClick={() => setWarn(false)}>
            Learn more
          </button>
        </div>
      )}
    </>
  )
}
