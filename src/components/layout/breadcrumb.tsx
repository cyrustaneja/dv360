import React, { createContext, useContext, useEffect, useState } from 'react'

export interface Crumb {
  label: string
  name: string
  to?: string
}

interface Ctx {
  crumbs: Crumb[]
  setCrumbs: (c: Crumb[]) => void
}

const BreadcrumbContext = createContext<Ctx>({ crumbs: [], setCrumbs: () => {} })

export function BreadcrumbProvider({ children }: { children: React.ReactNode }) {
  const [crumbs, setCrumbs] = useState<Crumb[]>([])
  return <BreadcrumbContext.Provider value={{ crumbs, setCrumbs }}>{children}</BreadcrumbContext.Provider>
}

export function useBreadcrumbValue() {
  return useContext(BreadcrumbContext).crumbs
}

/** Screens call this in render to declare their breadcrumb trail. */
export function useBreadcrumb(crumbs: Crumb[]) {
  const { setCrumbs } = useContext(BreadcrumbContext)
  // Serialize to keep the effect dependency stable across renders.
  const key = JSON.stringify(crumbs)
  useEffect(() => {
    setCrumbs(crumbs)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
}
