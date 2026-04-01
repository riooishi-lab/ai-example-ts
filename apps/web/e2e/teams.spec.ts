import { expect, test } from '@playwright/test'
import { e2eEnv } from './env'
import { cleanupTestTeam, createTestTeam } from './helpers/db'

async function signIn(page: import('@playwright/test').Page) {
  await page.goto('/auth/signin')
  await page.getByTestId('signin-email-input').fill(e2eEnv.TEST_USER_EMAIL)
  await page.getByTestId('signin-password-input').fill(e2eEnv.TEST_USER_PASSWORD)
  await page.getByTestId('signin-submit-button').click()
  await page.waitForURL('/', { timeout: 30000 })
}

test.describe('チーム管理', () => {
  test.skip(
    () => !e2eEnv.TEST_USER_EMAIL || !e2eEnv.TEST_USER_PASSWORD || !e2eEnv.DATABASE_URL,
    'TEST_USER_EMAIL, TEST_USER_PASSWORD, and DATABASE_URL are required',
  )

  test.beforeEach(async ({ page }) => {
    await signIn(page)
    await page.goto('/admin/settings?tabIndex=2')
    await page.waitForLoadState('networkidle')
  })

  test('チーム管理ページが表示される', async ({ page }) => {
    await expect(page.getByTestId('teams-create-button')).toBeVisible()
    await expect(page.getByTestId('teams-search-input')).toBeVisible()
  })

  test('チームを作成できる', async ({ page }) => {
    test.slow()

    const teamName = `E2Eテストチーム-${Date.now()}`

    await page.getByTestId('teams-create-button').click()
    await expect(page.getByTestId('team-name-input')).toBeVisible()

    await page.getByTestId('team-name-input').fill(teamName)
    await page.getByTestId('team-form-submit-button').click()

    await expect(page.getByText(teamName)).toBeVisible({ timeout: 10000 })
  })

  test('チーム名が空の場合保存ボタンで送信してもモーダルが閉じない', async ({ page }) => {
    await page.getByTestId('teams-create-button').click()

    const nameInput = page.getByTestId('team-name-input')
    await expect(nameInput).toBeVisible()

    await page.getByTestId('team-form-submit-button').click()
    await page.waitForTimeout(1000)

    await expect(page.getByTestId('team-name-input')).toBeVisible()
    await expect(page.getByTestId('team-form-submit-button')).toBeVisible()
  })

  test('チームを検索できる', async ({ page }) => {
    const teamName = `E2E検索テスト-${Date.now()}`
    const teamId = await createTestTeam(teamName)

    try {
      await page.goto('/admin/settings?tabIndex=2')
      await page.waitForLoadState('networkidle')

      await page.getByTestId('teams-search-input').fill(teamName)
      await expect(page.getByText(teamName)).toBeVisible({ timeout: 5000 })

      await page.getByTestId('teams-search-input').fill('存在しないチーム名XYZ999')
      await expect(page.getByText('チームはありません')).toBeVisible({ timeout: 5000 })
    } finally {
      await cleanupTestTeam(teamId)
    }
  })

  test('チーム名を編集できる', async ({ page }) => {
    test.slow()

    const originalName = `E2E編集テスト-${Date.now()}`
    const updatedName = `${originalName}-更新済み`
    const teamId = await createTestTeam(originalName)

    try {
      await page.goto('/admin/settings?tabIndex=2')
      await page.waitForLoadState('networkidle')

      await page.getByTestId('teams-search-input').fill(originalName)
      await expect(page.getByText(originalName)).toBeVisible({ timeout: 5000 })

      await page.getByTestId('team-edit-button').first().click()
      await expect(page.getByTestId('team-name-input')).toBeVisible()

      await page.getByTestId('team-name-input').clear()
      await page.getByTestId('team-name-input').fill(updatedName)
      await page.getByTestId('team-form-submit-button').click()

      await expect(page.getByText(updatedName)).toBeVisible({ timeout: 10000 })
    } finally {
      await cleanupTestTeam(teamId)
    }
  })

  test('チームを削除できる', async ({ page }) => {
    test.slow()

    const teamName = `E2E削除テスト-${Date.now()}`
    const teamId = await createTestTeam(teamName)

    try {
      await page.goto('/admin/settings?tabIndex=2')
      await page.waitForLoadState('networkidle')

      await page.getByTestId('teams-search-input').fill(teamName)
      await expect(page.getByText(teamName)).toBeVisible({ timeout: 5000 })

      await page.getByTestId('team-delete-button').first().click()
      await expect(page.getByTestId('delete-team-message')).toBeVisible()

      await page.getByTestId('delete-team-submit-button').click()

      await page.waitForTimeout(2000)
      await page.getByTestId('teams-search-input').clear()
      await page.getByTestId('teams-search-input').fill(teamName)
      await expect(page.getByText('チームはありません')).toBeVisible({ timeout: 10000 })
    } finally {
      await cleanupTestTeam(teamId)
    }
  })

  test('メンバー管理モーダルが表示される', async ({ page }) => {
    const teamName = `E2Eメンバーテスト-${Date.now()}`
    const teamId = await createTestTeam(teamName)

    try {
      await page.goto('/admin/settings?tabIndex=2')
      await page.waitForLoadState('networkidle')

      await page.getByTestId('teams-search-input').fill(teamName)
      await expect(page.getByText(teamName)).toBeVisible({ timeout: 5000 })

      await page.getByTestId('team-members-button').first().click()
      await expect(page.getByTestId('team-members-empty')).toBeVisible({ timeout: 5000 })
      await expect(page.getByTestId('team-member-add-select')).toBeVisible()
    } finally {
      await cleanupTestTeam(teamId)
    }
  })

  test('メンバーを追加・削除できる', async ({ page }) => {
    test.slow()

    const teamName = `E2Eメンバー追加削除-${Date.now()}`
    const teamId = await createTestTeam(teamName)
    try {
      await page.goto('/admin/settings?tabIndex=2')
      await page.waitForLoadState('networkidle')

      await page.getByTestId('teams-search-input').fill(teamName)
      await expect(page.getByText(teamName)).toBeVisible({ timeout: 5000 })

      await page.getByTestId('team-members-button').first().click()
      await expect(page.getByTestId('team-members-empty')).toBeVisible({ timeout: 5000 })

      const select = page.getByTestId('team-member-add-select')
      await select.selectOption({ index: 1 })
      await page.getByTestId('team-member-add-button').click()

      await expect(page.getByTestId('team-member-row')).toBeVisible({ timeout: 10000 })

      await page.getByTestId('team-member-remove-button').first().click()
      await expect(page.getByTestId('team-members-empty')).toBeVisible({ timeout: 10000 })
    } finally {
      await cleanupTestTeam(teamId)
    }
  })
})
