// Captures the README screenshots from a real demo build (sample data, no
// wallet or backend). Usage:
//
//   npm run build:demo
//   npm run screenshots
//
// Writes docs/screenshots/*.png. Every image shows the app's "Demo data"
// banner because it is taken from the demo build.
import { spawn } from 'node:child_process'
import { mkdir } from 'node:fs/promises'
import { chromium } from '@playwright/test'

const PORT = 4179
const BASE = `http://localhost:${PORT}`
const OUT = 'docs/screenshots'

async function waitForServer(url, timeoutMs = 30_000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    try {
      if ((await fetch(url)).ok) return
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 250))
  }
  throw new Error(`Preview server did not start at ${url}`)
}

const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--mode', 'demo', '--port', String(PORT), '--strictPort'], {
  stdio: 'ignore',
})

try {
  await waitForServer(BASE)
  await mkdir(OUT, { recursive: true })

  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1200, height: 860 }, colorScheme: 'light', deviceScaleFactor: 1 })

  await page.goto(BASE)
  await page.getByRole('button', { name: 'Open demo dashboard' }).click()

  // Overview
  await page.getByRole('heading', { name: "Today's spending" }).waitFor()
  await page.getByText('Recent activity').waitFor()
  await page.screenshot({ path: `${OUT}/overview.png`, fullPage: true })

  // Transactions
  await page.getByRole('link', { name: 'Transactions' }).click()
  await page.getByRole('table').waitFor()
  await page.waitForTimeout(800) // let the chart finish its entry animation
  await page.screenshot({ path: `${OUT}/transactions.png`, fullPage: true })

  // Policy, with the old -> new confirm step open
  await page.getByRole('link', { name: 'Policy' }).click()
  const dailyCap = page.getByRole('textbox', { name: 'Daily cap' })
  await dailyCap.fill('150')
  await dailyCap.locator('xpath=..').getByRole('button', { name: 'Save' }).click()
  await page.getByRole('dialog').waitFor()
  await page.screenshot({ path: `${OUT}/policy-confirm.png` }) // viewport only: the dialog's backdrop is viewport-sized
  await page.getByRole('button', { name: 'Cancel' }).click()

  // Emergency stop on
  await page.getByRole('button', { name: 'Stop all spending' }).click()
  await page.getByRole('button', { name: 'Sign & stop spending' }).click()
  await page.getByRole('button', { name: 'Resume spending' }).waitFor()
  await page.getByRole('link', { name: 'Overview' }).click()
  await page.getByText('Emergency stop is ON').waitFor()
  await page.screenshot({ path: `${OUT}/emergency-stop.png`, fullPage: true })

  await browser.close()
  console.log(`Saved screenshots to ${OUT}/`)
} finally {
  server.kill()
}
