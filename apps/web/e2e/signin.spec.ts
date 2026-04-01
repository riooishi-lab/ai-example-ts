import { expect, test } from '@playwright/test'
import { e2eEnv } from './env'

test.describe('サインイン', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/signin')
  })

  test('サインインページが表示される', async ({ page }) => {
    await expect(page.getByTestId('signin-title')).toBeVisible()
    await expect(page.getByTestId('signin-email-label')).toBeVisible()
    await expect(page.getByTestId('signin-password-label')).toBeVisible()
  })

  test('未入力で送信するとバリデーションエラーが表示される', async ({ page }) => {
    const emailInput = page.getByTestId('signin-email-input')
    const passwordInput = page.getByTestId('signin-password-input')

    await emailInput.focus()
    await emailInput.blur()
    await passwordInput.focus()
    await passwordInput.blur()

    await expect(page.getByTestId('signin-email-error')).toBeVisible()
    await expect(page.getByTestId('signin-password-error')).toBeVisible()
  })

  test('無効なメールアドレスでバリデーションエラーが表示される', async ({ page }) => {
    const emailInput = page.getByTestId('signin-email-input')

    await emailInput.fill('invalid-email')
    await emailInput.blur()

    await expect(page.getByTestId('signin-email-error')).toBeVisible()
  })

  test('短いパスワードでバリデーションエラーが表示される', async ({ page }) => {
    const passwordInput = page.getByTestId('signin-password-input')

    await passwordInput.fill('short')
    await passwordInput.blur()

    await expect(page.getByTestId('signin-password-error')).toBeVisible()
  })

  test('パスワードを忘れたリンクが表示される', async ({ page }) => {
    const forgotLink = page.getByTestId('signin-forgot-password-link')
    await expect(forgotLink).toBeVisible()
    await expect(forgotLink).toHaveAttribute('href', '/auth/forgot-password')
  })

  test('Googleサインインボタンが表示される', async ({ page }) => {
    await expect(page.getByTestId('signin-separator')).toBeVisible()
    await expect(page.getByTestId('signin-google-button')).toBeVisible()
  })

  test('正しい認証情報でサインインに成功してホームにリダイレクトされる', async ({ page }) => {
    test.skip(
      !e2eEnv.TEST_USER_EMAIL || !e2eEnv.TEST_USER_PASSWORD,
      'TEST_USER_EMAIL and TEST_USER_PASSWORD are required',
    )

    const emailInput = page.getByTestId('signin-email-input')
    const passwordInput = page.getByTestId('signin-password-input')

    await emailInput.fill(e2eEnv.TEST_USER_EMAIL)
    await passwordInput.fill(e2eEnv.TEST_USER_PASSWORD)
    await page.getByTestId('signin-submit-button').click()

    await page.waitForURL('/', { timeout: 10000 })
    await expect(page).toHaveURL('/')
  })

  test('間違ったパスワードでエラーメッセージが表示される', async ({ page }) => {
    test.skip(!e2eEnv.TEST_USER_EMAIL, 'TEST_USER_EMAIL is required')

    const emailInput = page.getByTestId('signin-email-input')
    const passwordInput = page.getByTestId('signin-password-input')

    await emailInput.fill(e2eEnv.TEST_USER_EMAIL)
    await passwordInput.fill('wrongpassword123')
    await page.getByTestId('signin-submit-button').click()

    await expect(page.getByTestId('signin-server-error')).toBeVisible({
      timeout: 10000,
    })
  })
})
