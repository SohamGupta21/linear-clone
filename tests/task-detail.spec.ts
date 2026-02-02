import { test, expect } from '@playwright/test'

test.describe('Task Detail Page', () => {
  let createdTaskId: string

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('[data-testid="create-task-btn"]')

    // Create a task for testing
    await page.getByTestId('create-task-btn').click()
    await page.getByTestId('task-title-input').fill('Test Task for Detail Page')
    await page.getByTestId('task-description-input').fill('Initial description')
    await page.getByTestId('create-task-submit').click()
    await expect(page.getByTestId('task-title-input')).not.toBeVisible()

    // Wait for task to appear
    await expect(page.getByText('Test Task for Detail Page').first()).toBeVisible()
  })

  test('should navigate to task detail page when clicking a task', async ({ page }) => {
    // Click on the task
    const taskCard = page.locator('[data-testid^="task-card-"]').first()
    await taskCard.click()

    // Should navigate to task detail page
    await expect(page.getByTestId('task-title')).toContainText('Test Task for Detail Page')
    await expect(page.getByTestId('task-id')).toBeVisible()
    await expect(page.getByTestId('back-button')).toBeVisible()
  })

  test('should edit task title', async ({ page }) => {
    // Navigate to task detail
    const taskCard = page.locator('[data-testid^="task-card-"]').first()
    await taskCard.click()
    await expect(page.getByTestId('task-title')).toBeVisible()

    // Click title to edit
    await page.getByTestId('task-title').click()
    await expect(page.getByTestId('title-input')).toBeVisible()

    // Change title
    await page.getByTestId('title-input').fill('Updated Task Title')
    await page.getByTestId('title-input').press('Enter')

    // Verify title changed
    await expect(page.getByTestId('task-title')).toContainText('Updated Task Title')
  })

  test('should edit description with markdown', async ({ page }) => {
    // Navigate to task detail
    const taskCard = page.locator('[data-testid^="task-card-"]').first()
    await taskCard.click()
    await expect(page.getByTestId('markdown-preview')).toBeVisible()

    // Click to edit description
    await page.getByTestId('markdown-preview').click()
    await expect(page.getByTestId('markdown-textarea')).toBeVisible()

    // Add markdown content with checkboxes
    const markdownContent = `## Task Description

- [ ] First checkbox item
- [ ] Second checkbox item
- [x] Completed item

**Bold text** and regular text`

    await page.getByTestId('markdown-textarea').fill(markdownContent)
    await page.getByTestId('save-description').click()

    // Verify markdown is rendered
    await expect(page.getByTestId('markdown-content')).toBeVisible()
    await expect(page.getByText('First checkbox item')).toBeVisible()
    await expect(page.getByText('Bold text')).toBeVisible()
  })

  test('should toggle checkbox in markdown', async ({ page }) => {
    // Navigate to task detail
    const taskCard = page.locator('[data-testid^="task-card-"]').first()
    await taskCard.click()

    // Add markdown with checkbox
    await page.getByTestId('markdown-preview').click()
    await page.getByTestId('markdown-textarea').fill('- [ ] Unchecked item')
    await page.getByTestId('save-description').click()

    // Wait for preview to render
    await expect(page.getByTestId('checkbox-unchecked-0')).toBeVisible()

    // Click checkbox to toggle
    await page.getByTestId('checkbox-unchecked-0').click()

    // Should now be checked
    await expect(page.getByTestId('checkbox-checked-0')).toBeVisible()
  })

  test('should add a comment', async ({ page }) => {
    // Navigate to task detail
    const taskCard = page.locator('[data-testid^="task-card-"]').first()
    await taskCard.click()
    await expect(page.getByTestId('comment-textarea')).toBeVisible()

    // Type a comment
    await page.getByTestId('comment-textarea').fill('This is a test comment')

    // Submit comment
    await page.getByTestId('submit-comment').click()

    // Verify comment appears
    await expect(page.getByText('This is a test comment')).toBeVisible()
  })

  test('should change task status from sidebar', async ({ page }) => {
    // Navigate to task detail
    const taskCard = page.locator('[data-testid^="task-card-"]').first()
    await taskCard.click()

    // Click status picker in sidebar
    await page.getByTestId('status-picker').click()

    // Select "In Progress"
    await page.getByTestId('status-option-in_progress').click()

    // Verify status changed (check the picker button shows In Progress)
    await expect(page.getByTestId('status-picker')).toContainText('In Progress')
  })

  test('should change task priority from sidebar', async ({ page }) => {
    // Navigate to task detail
    const taskCard = page.locator('[data-testid^="task-card-"]').first()
    await taskCard.click()
    await expect(page.getByTestId('task-title')).toBeVisible()

    // Click priority picker in sidebar
    const sidebar = page.locator('aside')
    await sidebar.getByTestId('priority-picker').click()

    // Select "High"
    await page.getByTestId('priority-option-high').click()

    // Verify priority changed
    await expect(sidebar.getByText('High')).toBeVisible()
  })

  test('should assign task from sidebar', async ({ page }) => {
    // Navigate to task detail
    const taskCard = page.locator('[data-testid^="task-card-"]').first()
    await taskCard.click()
    await expect(page.getByTestId('task-title')).toBeVisible()

    // Click assignee picker in sidebar
    const sidebar = page.locator('aside')
    await sidebar.getByTestId('assignee-picker').click()

    // Select Sarah Chen
    await page.getByTestId('assignee-option-sarah-chen').click()

    // Verify assignee changed
    await expect(sidebar.getByText('Sarah Chen')).toBeVisible()
  })

  test('should navigate back to main page', async ({ page }) => {
    // Navigate to task detail
    const taskCard = page.locator('[data-testid^="task-card-"]').first()
    await taskCard.click()
    await expect(page.getByTestId('back-button')).toBeVisible()

    // Click back button
    await page.getByTestId('back-button').click()

    // Should be back on main page
    await expect(page.getByTestId('create-task-btn')).toBeVisible()
  })

  test('should show activity section with comments count', async ({ page }) => {
    // Navigate to task detail
    const taskCard = page.locator('[data-testid^="task-card-"]').first()
    await taskCard.click()

    // Verify activity section exists
    await expect(page.getByText('Activity')).toBeVisible()

    // Add a comment
    await page.getByTestId('comment-textarea').fill('First comment')
    await page.getByTestId('submit-comment').click()
    await expect(page.getByText('1 comment')).toBeVisible()

    // Add another comment
    await page.getByTestId('comment-textarea').fill('Second comment')
    await page.getByTestId('submit-comment').click()
    await expect(page.getByText('2 comments')).toBeVisible()
  })
})
