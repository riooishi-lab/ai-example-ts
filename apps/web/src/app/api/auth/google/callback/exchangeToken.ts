import { clientEnv } from '../../../../../env/client'
import { adminAuth } from '../../../../../libs/firebase/nodeApp'

export async function exchangeCustomTokenForIdToken(uid: string): Promise<string | null> {
  const customToken = await adminAuth.createCustomToken(uid)
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${clientEnv.FIREBASE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: customToken, returnSecureToken: true }),
    },
  )

  const data = (await response.json()) as { idToken?: string }
  return data.idToken ?? null
}
