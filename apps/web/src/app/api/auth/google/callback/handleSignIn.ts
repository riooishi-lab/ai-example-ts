import { prisma } from '@monorepo/database/client'
import type { z } from 'zod'
import { createSessionCookie, setSessionCookie } from '../../../../../libs/auth/session'
import { adminAuth } from '../../../../../libs/firebase/nodeApp'
import { exchangeCustomTokenForIdToken } from './exchangeToken'
import type { GoogleUserInfoSchema } from './route'

type HandleSignInParams = {
  googleUser: z.infer<typeof GoogleUserInfoSchema>
}

export async function handleSignIn({ googleUser }: HandleSignInParams): Promise<string | null> {
  const existingUser = await prisma.visibleUser.findFirst({
    where: { email: googleUser.email },
  })

  if (!existingUser) return 'user_not_found'

  const userRecord = await adminAuth.getUser(existingUser.authProviderId)
  const idToken = await exchangeCustomTokenForIdToken(userRecord.uid)
  if (!idToken) return 'token_failed'

  const sessionCookie = await createSessionCookie(idToken)
  await setSessionCookie(sessionCookie)

  await prisma.user.update({
    where: { id: existingUser.id },
    data: { lastSignedInAt: new Date() },
  })

  return null
}
