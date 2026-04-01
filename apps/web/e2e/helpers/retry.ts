type RetryOptions = {
  maxAttempts?: number
  intervalMs?: number
}

export async function retry<T>(
  fn: () => Promise<T | undefined>,
  { maxAttempts = 5, intervalMs = 2000 }: RetryOptions = {},
): Promise<T | undefined> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, intervalMs))
    const result = await fn()
    if (result !== undefined) return result
  }
  return undefined
}
