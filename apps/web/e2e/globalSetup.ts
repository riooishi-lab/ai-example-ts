import { e2eEnv } from './env'
import { upsertTestUser } from './helpers/db'
import { ensureFirebaseUser } from './helpers/firebase'

async function globalSetup() {
  const { TEST_USER_EMAIL, TEST_USER_PASSWORD } = e2eEnv
  if (!TEST_USER_EMAIL || !TEST_USER_PASSWORD) return

  const firebaseUid = await ensureFirebaseUser(TEST_USER_EMAIL, TEST_USER_PASSWORD)
  await upsertTestUser(TEST_USER_EMAIL, firebaseUid)
}

export default globalSetup
