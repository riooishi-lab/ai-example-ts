import { $Enums } from '@monorepo/database'
import { prisma } from '@monorepo/database/client'
import type { z } from 'zod'
import { createSessionCookie, setSessionCookie } from '../../../../../libs/auth/session'
import { adminAuth } from '../../../../../libs/firebase/nodeApp'
import { exchangeCustomTokenForIdToken } from './exchangeToken'
import type { GoogleUserInfoSchema } from './route'

type HandleSignUpParams = {
  googleUser: z.infer<typeof GoogleUserInfoSchema>
  invitationToken: string | undefined
}

export async function handleSignUp({ googleUser, invitationToken }: HandleSignUpParams): Promise<string | null> {
  if (!invitationToken) return 'no_invitation'

  const invitation = await prisma.visibleInvitation.findFirst({
    where: { token: invitationToken },
  })

  if (!invitation || invitation.status !== $Enums.InvitationStatus.PENDING || invitation.expiresAt < new Date()) {
    return 'invalid_invitation'
  }

  if (invitation.email !== googleUser.email) return 'email_mismatch'

  const userRecord = await adminAuth.createUser({
    email: googleUser.email,
    displayName: googleUser.name,
    emailVerified: true,
    photoURL: googleUser.picture,
  })

  await prisma.$transaction(async (tx) => {
    await tx.user.create({
      data: {
        authProviderId: userRecord.uid,
        email: invitation.email,
        firstName: invitation.firstName,
        lastName: invitation.lastName,
        displayName: invitation.displayName || googleUser.name,
        avatarUrl: googleUser.picture,
        role: invitation.role,
      },
    })

    await tx.invitation.update({
      where: { id: invitation.id },
      data: { status: $Enums.InvitationStatus.ACCEPTED, acceptedAt: new Date() },
    })
  })

  const idToken = await exchangeCustomTokenForIdToken(userRecord.uid)
  if (!idToken) return 'token_failed'

  const sessionCookie = await createSessionCookie(idToken)
  await setSessionCookie(sessionCookie)
  return null
}
