import type { User } from '@monorepo/database'
import { prisma } from '@monorepo/database/client'
import { jwtDecode } from 'jwt-decode'
import { cookies } from 'next/headers'
import { adminAuth } from '../firebase/nodeApp'
import { SESSION_COOKIE_NAME, SESSION_EXPIRATION_SECONDS } from './constants'

export function checkIsLocal(): boolean {
  /* biome-ignore lint/style/noProcessEnv: NODE_ENV is a standard Node.js environment variable */
  return process.env.NODE_ENV === 'development'
}

export async function getSession() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!sessionCookie) {
    return null
  }

  try {
    const { exp } = jwtDecode(sessionCookie)
    if (exp && exp * 1000 < Date.now()) {
      return null
    }

    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true)
    return {
      uid: decodedClaims.uid,
      email: decodedClaims.email,
    }
  } catch {
    return null
  }
}

export async function createSessionCookie(idToken: string): Promise<string> {
  return await adminAuth.createSessionCookie(idToken, {
    expiresIn: SESSION_EXPIRATION_SECONDS * 1000,
  })
}

export async function setSessionCookie(sessionCookie: string) {
  const cookieStore = await cookies()
  const isLocal = checkIsLocal()

  cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
    httpOnly: true,
    path: '/',
    secure: !isLocal,
    sameSite: 'lax',
    maxAge: SESSION_EXPIRATION_SECONDS,
  })
}

export async function clearSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

export async function revokeUserSessions(uid: string) {
  await adminAuth.revokeRefreshTokens(uid)
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession()
  if (!session) {
    return null
  }

  return await prisma.user.findUnique({
    where: { authProviderId: session.uid },
  })
}

export async function checkIsAdminOrSuperAdmin(): Promise<User | null> {
  const user = await getCurrentUser()

  if (!user || !['SUPER_ADMIN', 'ADMIN'].includes(user.role)) {
    return null
  }

  return user
}
