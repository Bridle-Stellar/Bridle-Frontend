# Contributing to Bridle Frontend

Thanks for helping out. Bridle Frontend is the owner-facing dashboard for
Bridle: it reads spend data from Bridle Backend and lets an owner change
their agent's spending policy, signing every change with Freighter.
Because it handles money and wallet signatures, a few rules below are
stricter than in a typical React app.

By taking part you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md).
To report a security problem, follow [SECURITY.md](SECURITY.md) instead of
opening a public issue.

## Setup

Requires Node.js 22.12 or newer.

```bash
npm install
cp .env.example .env   # placeholders only; never commit .env
npm run dev
```

You need a running [Bridle Backend](https://github.com/Bridle-Stellar/Bridle-Backend)
for real data. For UI work and tests, the Playwright suite mocks the
backend and the wallet, so you don't need either.

## Checks

Run all of these before opening a PR. CI runs the same commands.

```bash
npm run lint       # oxlint
npm run typecheck  # tsc -b
npm test           # Vitest + Testing Library
npm run build      # production build
npm run test:e2e   # Playwright (first time: npx playwright install chromium)
```

## Claiming an issue

1. Comment on the issue saying you'd like to take it, with a one-line
   description of your approach. Wait for a maintainer to assign you
   before starting. Unassigned PRs for already-claimed issues may be closed.
2. If you go quiet for 7 days without a draft PR or an update, the issue
   may be reassigned.
3. Issues labeled `good first issue` are scoped to need little Bridle or
   Stellar background. `complexity:` labels give a rough size.

## Branches and pull requests

- Branch from `main`, named `<type>/<short-description>`, for example
  `feat/allowlist-labels`, `fix/kill-switch-banner`, `docs/first-agent-guide`.
  Types: `feat`, `fix`, `docs`, `test`, `chore`, `refactor`.
- One logical change per PR. Keep unrelated refactors out.
- Write commit messages in the imperative mood ("Add CSV export", not
  "Added CSV export").
- Link the issue (`Closes #123`) and fill in the PR template, including
  screenshots for any visible UI change.
- CI must be green before review. New behavior needs a test.

## Folder boundaries

```
src/
  api/          Typed request/response models and fetch clients. Mirrors Bridle Backend's schemas; no React here.
  lib/          Pure helpers: decimal/unit math, Freighter wrapper, tx submission, address validation, copy. No React.
  context/      React context (wallet connection state).
  hooks/        React Query hooks and policy-write mutations. The only place pages get data from.
  components/   Presentational components grouped by screen (common/ is shared). No data fetching.
  pages/        Screen-level components that wire hooks to components.
  demo/         Demo-mode flag and in-memory mock backend. Used only behind DEMO_MODE.
e2e/            Playwright tests with a mocked backend and wallet.
```

Dependencies point downward: `pages -> hooks/components -> api/lib`.
`api/` and `lib/` must not import React or anything from `components/` or
`pages/`.

## Money-handling rule

Every amount from Bridle Backend is an integer in the token's smallest
unit (stroops for XLM), never a display decimal.

- Convert between smallest units and display values only through
  `src/lib/decimal.ts` (backed by `decimal.js`).
- Render amounts only through `src/components/common/MoneyAmount.tsx`, so
  a token symbol is always shown.
- No float math on amounts: no `amount / 1e7`, no `parseFloat`, no
  `Number(...)` arithmetic, no bare numbers printed as money.

PRs that break this rule will be asked to change before review continues.

## Safety-critical state

Never default the emergency stop (kill switch) or any policy value when
it can't be read. If the backend can't confirm a value, the UI must say so
rather than guess. See the "Known gaps" section of the README.
