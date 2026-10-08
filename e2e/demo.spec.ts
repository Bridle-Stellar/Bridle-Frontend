import { expect, test } from '@playwright/test'

// Runs against the demo build (see playwright.config.ts's "demo" project).
// Demo data must never be mistakable for a real connection.

test('demo build is clearly bannered on every screen and never calls a backend', async ({ page }) => {
  const backendCalls: string[] = []
  page.on('request', (req) => {
    const url = new URL(req.url())
    if (url.port !== '5174') backendCalls.push(req.url())
  })

  const banner = page.getByRole('status').filter({ hasText: 'Demo data' })

  await page.goto('/')
  await expect(banner).toBeVisible()
  await expect(page).toHaveTitle(/^\[Demo\]/)
  await expect(page.getByRole('button', { name: 'Connect Freighter' })).toHaveCount(0)
  await page.getByRole('button', { name: 'Open demo dashboard' }).click()

  await expect(page.getByRole('heading', { name: "Today's spending" })).toBeVisible()
  await expect(banner).toBeVisible()
  await expect(page.getByText(/^Demo wallet /)).toBeVisible()

  for (const link of ['Transactions', 'Policy', 'Settings']) {
    await page.getByRole('link', { name: link }).click()
    await expect(banner).toBeVisible()
  }

  // Emergency stop round-trip against the in-memory mock.
  await page.getByRole('link', { name: 'Policy' }).click()
  await page.getByRole('button', { name: 'Stop all spending' }).click()
  await page.getByRole('button', { name: 'Sign & stop spending' }).click()
  await expect(page.getByRole('button', { name: 'Resume spending' })).toBeVisible()
  await page.getByRole('link', { name: 'Overview' }).click()
  await expect(page.getByText('Emergency stop is ON')).toBeVisible()

  expect(backendCalls).toEqual([])
})
