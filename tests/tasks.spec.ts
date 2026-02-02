import { test, expect } from '@playwright/test'

test.describe('Linear Clone - Task Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Wait for the page to load
    await page.waitForSelector('[data-testid="create-task-btn"]')
  })

  test('should display the main page with sidebar and header', async ({ page }) => {
    // Check sidebar elements
    await expect(page.getByText('Linear Clone')).toBeVisible()
    await expect(page.getByText('My Issues')).toBeVisible()

    // Check header elements
    await expect(page.locator('h1').getByText('Issues')).toBeVisible()
    await expect(page.getByTestId('view-list')).toBeVisible()
    await expect(page.getByTestId('view-board')).toBeVisible()
    await expect(page.getByTestId('create-task-btn')).toBeVisible()
  })

  test('should create a new task', async ({ page }) => {
    // Click create button
    await page.getByTestId('create-task-btn').click()

    // Fill in task details
    await page.getByTestId('task-title-input').fill('Test Task from Playwright')
    await page.getByTestId('task-description-input').fill('This is a test description')

    // Submit the form
    await page.getByTestId('create-task-submit').click()

    // Wait for dialog to close and verify task appears
    await expect(page.getByTestId('task-title-input')).not.toBeVisible()

    // Verify the task appears in the list
    await expect(page.getByText('Test Task from Playwright').first()).toBeVisible()
  })

  test('should switch between list and board views', async ({ page }) => {
    // Start in list view (default)
    await expect(page.getByTestId('list-view')).toBeVisible()

    // Switch to board view
    await page.getByTestId('view-board').click()
    await expect(page.getByTestId('board-view')).toBeVisible()

    // Switch back to list view
    await page.getByTestId('view-list').click()
    await expect(page.getByTestId('list-view')).toBeVisible()
  })

  test('should toggle dark/light mode', async ({ page }) => {
    // Initial state should be dark
    const html = page.locator('html')

    // Toggle to light mode
    await page.getByTestId('theme-toggle').click()
    await expect(html).toHaveClass(/light/)

    // Toggle back to dark mode
    await page.getByTestId('theme-toggle').click()
    await expect(html).toHaveClass(/dark/)
  })

  test('should change task priority', async ({ page }) => {
    // First create a task
    await page.getByTestId('create-task-btn').click()
    await page.getByTestId('task-title-input').fill('Priority Change Test')
    await page.getByTestId('create-task-submit').click()
    await expect(page.getByTestId('task-title-input')).not.toBeVisible()

    // Find the task card and change its priority
    const taskCard = page.locator('[data-testid^="task-card-"]').first()
    await expect(taskCard).toBeVisible()

    // Click on priority picker
    const priorityPicker = taskCard.getByTestId('priority-picker')
    await priorityPicker.click()

    // Select "High"
    await page.getByTestId('priority-option-high').click()

    // Verify priority icon changed (!! for high)
    await expect(taskCard.getByText('!!')).toBeVisible()
  })

  test('should assign task to team member', async ({ page }) => {
    // First create a task
    await page.getByTestId('create-task-btn').click()
    await page.getByTestId('task-title-input').fill('Assignment Test')
    await page.getByTestId('create-task-submit').click()
    await expect(page.getByTestId('task-title-input')).not.toBeVisible()

    // Find the task card and change its assignee
    const taskCard = page.locator('[data-testid^="task-card-"]').first()
    await expect(taskCard).toBeVisible()

    // Click on assignee picker
    const assigneePicker = taskCard.getByTestId('assignee-picker')
    await assigneePicker.click()

    // Select "Sarah Chen"
    await page.getByTestId('assignee-option-sarah-chen').click()

    // Verify avatar image is now visible
    await expect(assigneePicker.locator('img')).toBeVisible()
  })

  test('should persist view mode preference', async ({ page }) => {
    // Switch to board view
    await page.getByTestId('view-board').click()
    await expect(page.getByTestId('board-view')).toBeVisible()

    // Reload the page
    await page.reload()
    await page.waitForSelector('[data-testid="create-task-btn"]')

    // Should still be in board view
    await expect(page.getByTestId('board-view')).toBeVisible()
  })

  test('should display task in board columns', async ({ page }) => {
    // Switch to board view
    await page.getByTestId('view-board').click()

    // Verify board columns exist
    await expect(page.getByTestId('board-column-todo')).toBeVisible()
    await expect(page.getByTestId('board-column-in_progress')).toBeVisible()
    await expect(page.getByTestId('board-column-in_review')).toBeVisible()
    await expect(page.getByTestId('board-column-done')).toBeVisible()
  })

  test('should create task with specific status from board view', async ({ page }) => {
    // Switch to board view
    await page.getByTestId('view-board').click()
    await expect(page.getByTestId('board-view')).toBeVisible()

    // Click add task in "In Progress" column
    await page.getByTestId('add-task-in_progress').click()

    // Fill in task details
    await page.getByTestId('task-title-input').fill('Task from In Progress column')
    await page.getByTestId('create-task-submit').click()
    await expect(page.getByTestId('task-title-input')).not.toBeVisible()

    // Verify task appears in In Progress column
    const inProgressColumn = page.getByTestId('board-column-in_progress')
    await expect(inProgressColumn.getByText('Task from In Progress column')).toBeVisible()
  })
})
