'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { logPageView } from './actions/logPageView'

export const PageViewLogger = ({ userId, tenantId }: { userId: string; tenantId: string }) => {
  const logging = useRef(false)
  const pathname = usePathname()
  useEffect(() => {
    if (logging.current) {
      return
    }
    logging.current = true
    logPageView(pathname, userId, tenantId).then(() => {
      logging.current = false
    })
    return () => {
      logging.current = false
    }
  }, [pathname, userId, tenantId])

  return null
}
