export const includes = <T>(array: readonly T[], value: unknown): value is T => (array as unknown[]).includes(value)

export const chunkArray = <T>(array: T[], size: number): T[][] => {
  if (size <= 0) throw new Error('sizeは1以上を渡してください')
  const result: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size))
  }
  return result
}

export const returnFirstElement = <T>(array: T[], defaultValue: T): T => {
  if (array.length === 0) return defaultValue
  return array[0]
}
