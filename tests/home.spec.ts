import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test('should display heading', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('heading')).toHaveText('Hello, World!')
  })

  test('should display description', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('description')).toBeVisible()
  })

  test('should have a button', async ({ page }) => {
    await page.goto('/')
    const button = page.getByTestId('button')
    await expect(button).toHaveText('Get Started')
    await expect(button).toBeVisible()
  })
})
