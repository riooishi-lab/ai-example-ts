import { expect, test } from '@playwright/test'
import { e2eEnv } from './env'

test.describe('設備一覧', () => {
  test.skip(
    () => !e2eEnv.TEST_USER_EMAIL || !e2eEnv.TEST_USER_PASSWORD,
    'TEST_USER_EMAIL / TEST_USER_PASSWORD が設定されていないためスキップ',
  )

  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/signin')
    await page.getByTestId('signin-email-input').fill(e2eEnv.TEST_USER_EMAIL)
    await page.getByTestId('signin-password-input').fill(e2eEnv.TEST_USER_PASSWORD)
    await page.getByTestId('signin-submit-button').click()
    await page.waitForURL('/', { timeout: 10000 })
  })

  test('設備一覧ページが表示される', async ({ page }) => {
    await page.goto('/equipments')
    await expect(page.getByTestId('equipments-page')).toBeVisible()
    await expect(page.getByText('設備一覧')).toBeVisible()
  })

  test('設備一覧テーブルが表示される', async ({ page }) => {
    await page.goto('/equipments')
    await expect(page.getByTestId('equipment-list-container')).toBeVisible()
    await expect(page.getByText('設備名')).toBeVisible()
    await expect(page.getByText('ライン名')).toBeVisible()
  })
})
