'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { Tab } from '../Tab'
import type { SearchParamTabProps } from './SearchParamTab.types'

export const SearchParamTab = ({
  selectedIndex,
  contents,
  keyName = 'tabIndex',
  prefetch,
  resetKeys,
}: SearchParamTabProps) => {
  const router = useRouter()
  const currentSearchParams = useSearchParams()

  useEffect(() => {
    if (!prefetch) return
    contents.forEach((_, index) => {
      const searchParams = new URLSearchParams()
      currentSearchParams.entries().forEach(([key, value]) => {
        searchParams.append(key, value)
      })
      searchParams.set(keyName, index.toString())
      router.prefetch(`?${searchParams}`)
    })
  }, [router, currentSearchParams, contents, keyName, prefetch])

  return (
    <Tab
      onChange={(index) => {
        const searchParams = new URLSearchParams()
        currentSearchParams.entries().forEach(([key, value]) => {
          searchParams.append(key, value)
        })
        searchParams.set(keyName, index.toString())
        if (resetKeys) {
          resetKeys.forEach((key) => {
            searchParams.delete(key)
          })
        }
        router.push(`?${searchParams}`)
      }}
      selectedIndex={selectedIndex}
      contents={contents}
    />
  )
}
