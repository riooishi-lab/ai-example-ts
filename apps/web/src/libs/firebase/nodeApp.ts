import admin from 'firebase-admin'
import { getAuth } from 'firebase-admin/auth'
import { serverEnv } from '../../env/server'

function getAdminApp() {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: serverEnv.FIREBASE_PROJECT_ID,
        clientEmail: serverEnv.FIREBASE_CLIENT_EMAIL,
        privateKey: serverEnv.FIREBASE_PRIVATE_KEY,
      }),
    })
  }
  return admin
}

export const adminAuth = new Proxy({} as ReturnType<typeof getAuth>, {
  get(_, prop) {
    return Reflect.get(getAuth(getAdminApp()), prop)
  },
})
export default admin
