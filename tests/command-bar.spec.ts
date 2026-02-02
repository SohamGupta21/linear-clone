import { test, expect } from '@playwright/test'

test.describe('Command Bar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('heading')).toBeVisible()
  })

  test('opens with CMD+J', async ({ page }) => {
    await page.keyboard.press('Meta+j')
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByTestId('command-input')).toBeFocused()
  })

  test('closes with Escape', async ({ page }) => {
    await page.keyboard.press('Meta+j')
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  test('shows command hints when empty', async ({ page }) => {
    await page.keyboard.press('Meta+j')
    await expect(page.getByText('create task [title]')).toBeVisible()
  })

  test('creates task via natural language', async ({ page }) => {
    const uniqueTitle = `test task ${Date.now()}`

    await page.keyboard.press('Meta+j')
    await page.getByTestId('command-input').fill(`create task ${uniqueTitle}`)
    await page.keyboard.press('Enter')

    await expect(page.getByTestId('command-result')).toBeVisible({ timeout: 20000 })
    await expect(page.getByTestId('command-result')).toContainText('Created TASK-')

    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 })
    await expect(page.getByText(uniqueTitle)).toBeVisible()
  })

  test('updates task status', async ({ page }) => {
    const uniqueTitle = `status test ${Date.now()}`

    // Create task
    await page.keyboard.press('Meta+j')
    await page.getByTestId('command-input').fill(`create task ${uniqueTitle}`)
    await page.keyboard.press('Enter')

    const result = page.getByTestId('command-result')
    await expect(result).toContainText('Created TASK-', { timeout: 20000 })

    const resultText = await result.textContent()
    const taskIdMatch = resultText?.match(/TASK-\d+/)
    const taskId = taskIdMatch ? taskIdMatch[0] : 'TASK-1'

    await page.keyboard.press('Escape')
    await page.waitForTimeout(1000)

    // Update status
    await page.keyboard.press('Meta+j')
    await page.getByTestId('command-input').fill(`mark ${taskId} done`)
    await page.keyboard.press('Enter')

    await expect(page.getByTestId('command-result')).toContainText('done', { timeout: 20000 })
  })

  test('sets task priority', async ({ page }) => {
    const uniqueTitle = `priority test ${Date.now()}`

    // Create task
    await page.keyboard.press('Meta+j')
    await page.getByTestId('command-input').fill(`create task ${uniqueTitle}`)
    await page.keyboard.press('Enter')

    const result = page.getByTestId('command-result')
    await expect(result).toContainText('Created TASK-', { timeout: 20000 })

    const resultText = await result.textContent()
    const taskIdMatch = resultText?.match(/TASK-\d+/)
    const taskId = taskIdMatch ? taskIdMatch[0] : 'TASK-1'

    await page.keyboard.press('Escape')
    await page.waitForTimeout(1000)

    // Update priority
    await page.keyboard.press('Meta+j')
    await page.getByTestId('command-input').fill(`set ${taskId} priority high`)
    await page.keyboard.press('Enter')

    await expect(page.getByTestId('command-result')).toContainText('high', { timeout: 20000 })
  })

  test('assigns task to team member', async ({ page }) => {
    const uniqueTitle = `assign test ${Date.now()}`

    // Create task
    await page.keyboard.press('Meta+j')
    await page.getByTestId('command-input').fill(`create task ${uniqueTitle}`)
    await page.keyboard.press('Enter')

    const result = page.getByTestId('command-result')
    await expect(result).toContainText('Created TASK-', { timeout: 20000 })

    const resultText = await result.textContent()
    const taskIdMatch = resultText?.match(/TASK-\d+/)
    const taskId = taskIdMatch ? taskIdMatch[0] : 'TASK-1'

    await page.keyboard.press('Escape')
    await page.waitForTimeout(1000)

    // Assign
    await page.keyboard.press('Meta+j')
    await page.getByTestId('command-input').fill(`assign ${taskId} to Sarah`)
    await page.keyboard.press('Enter')

    await expect(page.getByTestId('command-result')).toContainText('Sarah', { timeout: 20000 })
  })
})

test.describe('Task List', () => {
  test('shows heading', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('heading')).toHaveText('Tasks')
  })

  test('displays created tasks', async ({ page }) => {
    const uniqueTitle = `display test ${Date.now()}`

    await page.goto('/')
    await page.keyboard.press('Meta+j')
    await page.getByTestId('command-input').fill(`create task ${uniqueTitle}`)
    await page.keyboard.press('Enter')
    await expect(page.getByTestId('command-result')).toContainText('Created TASK-', { timeout: 20000 })
    await page.keyboard.press('Escape')

    await page.waitForTimeout(2000)
    await expect(page.getByText(uniqueTitle)).toBeVisible()
  })
})
