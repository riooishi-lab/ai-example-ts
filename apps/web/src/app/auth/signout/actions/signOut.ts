'use server'

import { redirect } from 'next/navigation'
import { clearSessionCookie, getSession, revokeUserSessions } from '../../../../libs/auth/session'

export async function signOut() {
  const session = await getSession()

  if (session) {
    await revokeUserSessions(session.uid)
  }

  await clearSessionCookie()

  redirect('/auth/signin')
}
