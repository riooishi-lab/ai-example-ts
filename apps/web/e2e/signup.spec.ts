import { randomUUID } from 'node:crypto'
import { expect, test } from '@playwright/test'
import { e2eEnv } from './env'
import {
  cleanupTestInvitation,
  cleanupTestUser,
  createTestInvitation,
  getTestUserId,
  markInvitationAccepted,
} from './helpers/db'
import { deleteFirebaseUser } from './helpers/firebase'

async function requireAdminUserId(): Promise<number> {
  const id = await getTestUserId(e2eEnv.TEST_USER_EMAIL)
  if (!id) throw new Error('Test admin user not found in database')
  return id
}

test.describe('サインアップ', () => {
  test('トークンなしでアクセスすると404が返される', async ({ page }) => {
    const response = await page.goto('/auth/signup')
    expect(response?.status()).toBe(404)
  })

  test('無効なトークンでアクセスするとエラーが表示される', async ({ page }) => {
    await page.goto('/auth/signup?token=invalid-token')
    await expect(page.getByTestId('signup-error-title')).toBeVisible()
  })

  test.describe('招待トークンのシナリオ', () => {
    test.skip(
      () => !e2eEnv.TEST_USER_EMAIL || !e2eEnv.TEST_USER_PASSWORD,
      'TEST_USER_EMAIL and TEST_USER_PASSWORD are required',
    )

    test('招待からサインアップのフルフローが完了する', async ({ page }) => {
      test.slow()

      const inviteeEmail = `e2e-signup-${randomUUID()}@example.com`
      const inviteePassword = 'E2eSignUp!123'
      const token = randomUUID()
      const adminUserId = await requireAdminUserId()

      await createTestInvitation({
        email: inviteeEmail,
        token,
        invitedById: adminUserId,
      })

      try {
        await page.goto(`/auth/signup?token=${token}`)

        await expect(page.getByTestId('signup-title')).toBeVisible()
        await expect(page.getByTestId('signup-email-input')).toHaveValue(inviteeEmail)
        await expect(page.getByTestId('signup-email-input')).toBeDisabled()

        await page.getByTestId('signup-password-input').fill(inviteePassword)
        await page.getByTestId('signup-confirm-password-input').fill(inviteePassword)
        await page.getByTestId('signup-submit-button').click()

        await page.waitForURL('/', { timeout: 20000 })

        await page.goto(`/auth/signup?token=${token}`)
        await expect(page.getByTestId('signup-error-title')).toHaveText('招待は既に使用済みです')
      } finally {
        await deleteFirebaseUser(inviteeEmail)
        await cleanupTestUser(inviteeEmail)
        await cleanupTestInvitation(token)
      }
    })

    test('使用済みトークンでアクセスするとエラーが表示される', async ({ page }) => {
      const token = randomUUID()
      const adminUserId = await requireAdminUserId()

      await createTestInvitation({
        email: `e2e-used-${randomUUID()}@example.com`,
        token,
        invitedById: adminUserId,
      })
      await markInvitationAccepted(token)

      try {
        await page.goto(`/auth/signup?token=${token}`)
        await expect(page.getByTestId('signup-error-title')).toHaveText('招待は既に使用済みです')
      } finally {
        await cleanupTestInvitation(token)
      }
    })

    test('期限切れトークンでアクセスするとエラーが表示される', async ({ page }) => {
      const token = randomUUID()
      const adminUserId = await requireAdminUserId()

      await createTestInvitation({
        email: `e2e-expired-${randomUUID()}@example.com`,
        token,
        invitedById: adminUserId,
        expired: true,
      })

      try {
        await page.goto(`/auth/signup?token=${token}`)
        await expect(page.getByTestId('signup-error-title')).toHaveText('招待の有効期限切れ')
      } finally {
        await cleanupTestInvitation(token)
      }
    })
  })
})
