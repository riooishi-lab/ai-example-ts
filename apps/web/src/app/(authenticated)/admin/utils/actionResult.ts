export type ActionResult = {
  status: 'success' | 'error'
  error?: { message: string[] }
}

export type ActionState = ActionResult | null

export const errorResult = (message: string) => ({ status: 'error' as const, error: { message: [message] } })
export const successResult = () => ({ status: 'success' as const })

export function parsePositiveInt(value: FormDataEntryValue | null): number | null {
  if (typeof value !== 'string' || !/^\d+$/.test(value)) return null
  const num = Number(value)
  if (num <= 0) return null
  return num
}
