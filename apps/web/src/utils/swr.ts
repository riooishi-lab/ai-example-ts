const stableStringify = (obj: Record<string, unknown>): string =>
  JSON.stringify(
    Object.keys(obj)
      .sort((a, b) => a.localeCompare(b))
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = obj[key]
        return acc
      }, {}),
  )

export const generateCacheKey = ({
  resource,
  verb,
  query,
}: {
  resource: string
  verb?: string
  query?: string | Record<string, unknown>
}) => {
  const queryStr = (() => {
    if (typeof query === 'string' || query === undefined) {
      return query
    }
    return stableStringify(query)
  })()
  return `${resource}/${verb ?? ''}/${queryStr ?? ''}`
}
