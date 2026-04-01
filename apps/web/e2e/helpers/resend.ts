import { z } from 'zod'
import { e2eEnv } from '../env'
import { retry } from './retry'

const ResendEmailSchema = z.object({
  id: z.string(),
  subject: z.string(),
  to: z.array(z.string()),
  created_at: z.string(),
})

const ResendEmailListSchema = z.object({
  data: z.array(ResendEmailSchema),
})

const ResendEmailDetailSchema = ResendEmailSchema.extend({
  html: z.string(),
})

type ResendEmail = z.infer<typeof ResendEmailSchema>

export async function findResentEmail(to: string, afterIso: string): Promise<ResendEmail | undefined> {
  return retry(async () => {
    const response = await fetch('https://api.resend.com/emails', {
      headers: { Authorization: `Bearer ${e2eEnv.RESEND_API_KEY}` },
    })
    if (!response.ok) return undefined

    const parsed = ResendEmailListSchema.safeParse(await response.json())
    if (!parsed.success) return undefined

    return parsed.data.data.find((email) => email.to.includes(to) && new Date(email.created_at) >= new Date(afterIso))
  })
}

export async function fetchEmailHtml(emailId: string): Promise<string> {
  const response = await fetch(`https://api.resend.com/emails/${emailId}`, {
    headers: { Authorization: `Bearer ${e2eEnv.RESEND_API_KEY}` },
  })
  if (!response.ok) throw new Error(`Failed to fetch email: ${response.status}`)

  const parsed = ResendEmailDetailSchema.parse(await response.json())
  return parsed.html
}

export function extractOobCodeFromHtml(html: string): string | undefined {
  const match = html.match(/oobCode=([^&"]+)/)
  return match?.[1]
}
