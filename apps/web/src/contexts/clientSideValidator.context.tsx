'use client'

import type { FC, ReactNode } from 'react'
import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'

const clientSideValidatorContext = createContext<
  | {
      isClientSide: boolean
    }
  | undefined
>(undefined)

export const useClientSideValidatorContext = () => {
  const context = useContext(clientSideValidatorContext)
  if (context === undefined)
    throw new Error('`useClientSideValidatorContext` must be used within ClientSideValidatorProvider')
  return context
}

type Props = {
  children?: ReactNode
}

export const ClientSideValidatorProvider: FC<Props> = ({ children }) => {
  const [isClientSide, setClientSide] = useReducer(() => true, false)
  useEffect(() => {
    setClientSide()
  }, [])
  const result = useMemo(() => ({ isClientSide }), [isClientSide])

  return <clientSideValidatorContext.Provider value={result}>{children}</clientSideValidatorContext.Provider>
}
