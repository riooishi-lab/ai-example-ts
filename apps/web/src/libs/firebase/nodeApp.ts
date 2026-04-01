import admin from 'firebase-admin'
import { getAuth } from 'firebase-admin/auth'
import { serverEnv } from '../../env/server'

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: serverEnv.FIREBASE_PROJECT_ID,
      clientEmail: serverEnv.FIREBASE_CLIENT_EMAIL,
      privateKey: serverEnv.FIREBASE_PRIVATE_KEY,
    }),
  })
}

export const adminAuth = getAuth()
export default admin
