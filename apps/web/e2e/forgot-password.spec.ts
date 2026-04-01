import { expect, test } from '@playwright/test'
import { e2eEnv } from './env'
import { resetFirebasePassword, signInViaFirebase } from './helpers/firebase'
import { extractOobCodeFromHtml, fetchEmailHtml, findResentEmail } from './helpers/resend'

test.describe('パスワード再設定送信', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/forgot-password')
  })

  test('パスワード再設定送信ページが表示される', async ({ page }) => {
    await expect(page.getByTestId('forgot-password-title')).toBeVisible()
    await expect(page.getByTestId('forgot-password-description')).toBeVisible()
    await expect(page.getByTestId('forgot-password-email-label')).toBeVisible()
    await expect(page.getByTestId('forgot-password-email-input')).toBeVisible()
    await expect(page.getByTestId('forgot-password-submit-button')).toBeVisible()
  })

  test('ログイン画面に戻るリンクが表示される', async ({ page }) => {
    const backLink = page.getByTestId('forgot-password-back-to-signin')
    await expect(backLink).toBeVisible()
    await expect(backLink).toHaveAttribute('href', '/auth/signin')
  })

  test('無効なメールアドレスでエラーが表示される', async ({ page }) => {
    await page.locator('form').evaluate((form) => form.setAttribute('novalidate', ''))

    const emailInput = page.getByTestId('forgot-password-email-input')
    await emailInput.fill('invalid-email')
    await page.getByTestId('forgot-password-submit-button').click()

    await expect(page.getByTestId('forgot-password-error')).toBeVisible({
      timeout: 10000,
    })
  })

  test('存在しないユーザーのメールアドレスでエラーが表示される', async ({ page }) => {
    const emailInput = page.getByTestId('forgot-password-email-input')
    await emailInput.fill('nonexistent-user@example.com')
    await page.getByTestId('forgot-password-submit-button').click()

    await expect(page.getByTestId('forgot-password-error')).toBeVisible({
      timeout: 10000,
    })
  })

  test('有効なメールアドレスで送信するとメール送信完了ページにリダイレクトされる', async ({ page }) => {
    test.skip(
      !e2eEnv.TEST_USER_EMAIL || !e2eEnv.TEST_USER_PASSWORD,
      'TEST_USER_EMAIL and TEST_USER_PASSWORD are required',
    )

    const submittedAt = new Date().toISOString()

    const emailInput = page.getByTestId('forgot-password-email-input')
    await emailInput.fill(e2eEnv.TEST_USER_EMAIL)
    await page.getByTestId('forgot-password-submit-button').click()

    await page.waitForURL('/auth/forgot-password/email-sent', { timeout: 20000 })
    await expect(page.getByTestId('email-sent-title')).toBeVisible()
    await expect(page.getByTestId('email-sent-description')).toBeVisible()

    if (e2eEnv.RESEND_API_KEY) {
      const sentEmail = await findResentEmail(e2eEnv.TEST_USER_EMAIL, submittedAt)
      expect(sentEmail).toBeDefined()
      expect(sentEmail?.subject).toBe('【マイアプリ】パスワードリセットのご案内')
      expect(sentEmail?.to).toContain(e2eEnv.TEST_USER_EMAIL)
    }
  })
})

test.describe('パスワード再設定', () => {
  test('oobCodeなしでアクセスするとパスワード再設定送信ページにリダイレクトされる', async ({ page }) => {
    await page.goto('/auth/forgot-password/reset')

    await page.waitForURL('/auth/forgot-password', { timeout: 10000 })
    await expect(page.getByTestId('forgot-password-title')).toBeVisible()
  })

  test('oobCodeありでパスワード再設定ページが表示される', async ({ page }) => {
    await page.goto('/auth/forgot-password/reset?oobCode=test-code')

    await expect(page.getByTestId('password-reset-title')).toBeVisible()
    await expect(page.getByTestId('password-reset-password-label')).toBeVisible()
    await expect(page.getByTestId('password-reset-password-input')).toBeVisible()
    await expect(page.getByTestId('password-reset-submit-button')).toBeVisible()
  })

  test('無効なoobCodeでパスワード再設定するとエラーが表示される', async ({ page }) => {
    await page.goto('/auth/forgot-password/reset?oobCode=invalid-code')

    const passwordInput = page.getByTestId('password-reset-password-input')
    await passwordInput.fill('newpassword123')
    await page.getByTestId('password-reset-submit-button').click()

    await expect(page.getByTestId('password-reset-error')).toBeVisible({
      timeout: 10000,
    })
  })

  test('パスワードリセットのフルフローが完了する', async ({ page }) => {
    test.skip(
      !e2eEnv.TEST_USER_EMAIL || !e2eEnv.TEST_USER_PASSWORD || !e2eEnv.RESEND_API_KEY,
      'TEST_USER_EMAIL, TEST_USER_PASSWORD, and RESEND_API_KEY are required',
    )
    test.slow()

    const originalPassword = e2eEnv.TEST_USER_PASSWORD
    const newPassword = 'E2eNewPass!987'

    try {
      const submittedAt = new Date().toISOString()

      await page.goto('/auth/forgot-password')
      await page.getByTestId('forgot-password-email-input').fill(e2eEnv.TEST_USER_EMAIL)
      await page.getByTestId('forgot-password-submit-button').click()
      await page.waitForURL('/auth/forgot-password/email-sent', { timeout: 20000 })

      const sentEmail = await findResentEmail(e2eEnv.TEST_USER_EMAIL, submittedAt)
      expect(sentEmail).toBeDefined()

      const html = await fetchEmailHtml(sentEmail?.id ?? '')
      const oobCode = extractOobCodeFromHtml(html)
      expect(oobCode).toBeTruthy()

      await page.goto(`/auth/forgot-password/reset?oobCode=${oobCode}`)
      await expect(page.getByTestId('password-reset-title')).toBeVisible()

      await page.getByTestId('password-reset-password-input').fill(newPassword)
      await page.getByTestId('password-reset-submit-button').click()

      await page.waitForURL('/auth/signin', { timeout: 15000 })

      const signedIn = await signInViaFirebase(e2eEnv.TEST_USER_EMAIL, newPassword)
      expect(signedIn).toBe(true)
    } finally {
      await resetFirebasePassword(e2eEnv.TEST_USER_EMAIL, originalPassword)
    }
  })
})
