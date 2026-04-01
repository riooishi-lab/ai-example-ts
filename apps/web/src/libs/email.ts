import { Resend } from 'resend'
import { serverEnv } from '../env/server'

const resend = new Resend(serverEnv.RESEND_API_KEY)

export const sendEmail = async (...args: Parameters<typeof resend.emails.send>) => {
  const result = await resend.emails.send(...args)
  if (result.error) {
    throw new Error(result.error.message)
  }
  return result
}
