import { expect, test } from '@playwright/test'

const FAKE_WALLET = {
  address: 'GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVSGZ',
  network: 'TESTNET',
  networkPassphrase: 'Test SDF Network ; September 2015',
}

const FAKE_TRANSACTIONS = [
  {
    id: 'tx-approved-1',
    agent: 'GAGENTAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    destination: 'GDEST1AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    token: 'native',
    amount: 5_000_000,
    status: 'approved',
    rejection_reason: null,
    detail: null,
    payment_tx_hash: 'abc123',
    contract_tx_hash: 'def456',
    source: 'relay',
    created_at: new Date().toISOString(),
  },
  {
    id: 'tx-rejected-1',
    agent: 'GAGENTAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    destination: 'GDEST2AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    token: 'native',
    amount: 200_000_000,
    status: 'rejected',
    rejection_reason: 'daily_cap_exceeded',
    detail: 'Exceeds remaining daily budget.',
    payment_tx_hash: null,
    contract_tx_hash: null,
    source: 'relay',
    created_at: new Date().toISOString(),
  },
]

test.beforeEach(async ({ page }) => {
  // Inject the test-only wallet seam before any app code runs — see
  // src/lib/freighter.ts's __BRIDLE_TEST_WALLET__ doc comment.
  await page.addInitScript((wallet) => {
    ;(window as unknown as { __BRIDLE_TEST_WALLET__: unknown }).__BRIDLE_TEST_WALLET__ = wallet
  }, FAKE_WALLET)

  // Stand in for Bridle Backend so this test doesn't need one running.
  // GET /policy 404s deliberately — this exercises the documented gap's
  // fallback UI (see src/components/policy/PolicyUnavailableNotice.tsx).
  await page.route('**/policy', (route) => route.fulfill({ status: 404, contentType: 'application/json', body: '{}' }))

  await page.route('**/transactions/summary', (route) =>
    route.fulfill({
      json: {
        period_start: new Date().toISOString(),
        period_end: new Date().toISOString(),
        token: 'native',
        total_spent: 250_000_000,
        cap: 1_000_000_000,
        remaining: 750_000_000,
      },
    }),
  )

  await page.route('**/transactions/stats*', (route) => route.fulfill({ json: { by_destination: [], over_time: [] } }))

  await page.route('**/transactions?*', (route) =>
    route.fulfill({
      json: { items: FAKE_TRANSACTIONS, total: FAKE_TRANSACTIONS.length, limit: 20, offset: 0 },
    }),
  )
})

test('connect wallet, view overview, then view transaction history', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Bridle' })).toBeVisible()
  await page.getByRole('button', { name: 'Connect Freighter' }).click()

  // Overview
  await expect(page.getByRole('heading', { name: "Today's spending" })).toBeVisible()
  await expect(page.getByText('25 XLM')).toBeVisible()
  await expect(page.getByText(/of 100 XLM daily cap/)).toBeVisible()
  await expect(page.getByText('Can\'t confirm current policy details')).toBeVisible()
  await expect(page.getByText('Recent activity')).toBeVisible()
  await expect(page.getByText('This would put today\'s spending over the daily limit.')).toBeVisible()

  // Transaction history
  await page.getByRole('link', { name: 'Transactions' }).click()
  await expect(page.getByRole('heading', { name: 'Transaction history' })).toBeVisible()
  await expect(page.getByText('1–2 of 2')).toBeVisible()
  const table = page.getByRole('table')
  await expect(table.getByText('Approved')).toBeVisible()
  await expect(table.getByText('Rejected')).toBeVisible()
})
