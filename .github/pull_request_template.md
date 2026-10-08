## What and why

<!-- What does this change, and why? Link the issue: Closes #123 -->

## How to test

<!-- Steps a reviewer can follow. Mention if it needs a running backend or works against the mocks. -->

## Screenshots

<!-- Required for visible UI changes. Say if they show demo/mock data. -->

## Checklist

- [ ] One logical change; unrelated refactors left out
- [ ] `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` pass
- [ ] `npm run test:e2e` passes (or not affected)
- [ ] New behavior has tests
- [ ] Amounts go through `src/lib/decimal.ts` and render via `MoneyAmount` (no float math, no bare numbers)
- [ ] Safety-critical state (emergency stop, limits) is never defaulted when it can't be read
- [ ] No `.env`, keys, or secrets committed
- [ ] Docs/README updated if behavior or setup changed
