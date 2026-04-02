import { expect, test } from '@playwright/test'
import { e2eEnv } from './env'

test.describe('ダッシュボード', () => {
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

  test('ダッシュボードページが表示される', async ({ page }) => {
    await expect(page.getByTestId('dashboard-container')).toBeVisible()
    await expect(page.getByText('ダッシュボード')).toBeVisible()
  })

  test('統計カードが表示される', async ({ page }) => {
    await expect(page.getByTestId('dashboard-stats-grid')).toBeVisible()
    await expect(page.getByText('設備数')).toBeVisible()
    await expect(page.getByText('本日の点検完了数')).toBeVisible()
    await expect(page.getByText('不具合報告数')).toBeVisible()
    await expect(page.getByText('直近7日の異常値')).toBeVisible()
  })

  test('設備数が数値で表示される', async ({ page }) => {
    const countText = await page.getByTestId('dashboard-equipment-count').textContent()
    expect(Number(countText)).toBeGreaterThanOrEqual(0)
  })
})
