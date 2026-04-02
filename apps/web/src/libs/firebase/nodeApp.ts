import admin from 'firebase-admin'
import type { Auth } from 'firebase-admin/auth'
import { getAuth } from 'firebase-admin/auth'
import { serverEnv } from '../../env/server'

function initializeAdminApp() {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: serverEnv.FIREBASE_PROJECT_ID,
        clientEmail: serverEnv.FIREBASE_CLIENT_EMAIL,
        privateKey: serverEnv.FIREBASE_PRIVATE_KEY,
      }),
    })
  }
}

let _adminAuth: Auth | undefined

function getAdminAuth(): Auth {
  if (!_adminAuth) {
    initializeAdminApp()
    _adminAuth = getAuth()
  }
  return _adminAuth
}

export const adminAuth = new Proxy({} as Auth, {
  get(_, prop) {
    const auth = getAdminAuth()
    const value = Reflect.get(auth, prop)
    return typeof value === 'function' ? value.bind(auth) : value
  },
})
export default admin
