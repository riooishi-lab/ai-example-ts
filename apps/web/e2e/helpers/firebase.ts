import { e2eEnv } from '../env'

function isFirebaseError(error: unknown): error is { code: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code: unknown }).code === 'string'
  )
}

async function getFirebaseAuth() {
  const admin = await import('firebase-admin')

  if (!admin.default.apps.length) {
    admin.default.initializeApp({
      credential: admin.default.credential.cert({
        projectId: e2eEnv.FIREBASE_PROJECT_ID,
        clientEmail: e2eEnv.FIREBASE_CLIENT_EMAIL,
        privateKey: e2eEnv.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    })
  }

  return admin.default.auth()
}

export async function ensureFirebaseUser(email: string, password: string): Promise<string> {
  const auth = await getFirebaseAuth()

  try {
    const existing = await auth.getUserByEmail(email)
    await auth.updateUser(existing.uid, { password })
    return existing.uid
  } catch (error: unknown) {
    if (isFirebaseError(error) && error.code === 'auth/user-not-found') {
      const created = await auth.createUser({ email, password })
      return created.uid
    }
    throw error
  }
}

export async function resetFirebasePassword(email: string, password: string) {
  const auth = await getFirebaseAuth()
  const user = await auth.getUserByEmail(email)
  await auth.updateUser(user.uid, { password })
}

export async function deleteFirebaseUser(email: string) {
  try {
    const auth = await getFirebaseAuth()
    const user = await auth.getUserByEmail(email)
    await auth.deleteUser(user.uid)
  } catch (error: unknown) {
    if (isFirebaseError(error) && error.code === 'auth/user-not-found') return
    throw error
  }
}

export async function signInViaFirebase(email: string, password: string): Promise<boolean> {
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${e2eEnv.FIREBASE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    },
  )
  return response.ok
}
