# Security Policy

Bridle Frontend asks an owner's wallet to sign transactions that change
how much an AI agent can spend. Bugs here can move or lock up real funds,
so please report them privately.

## Reporting a vulnerability

**Do not open a public issue, discussion, or PR for a security problem.**

Report it through GitHub's private vulnerability reporting:
go to the repository's **Security** tab and choose
**Report a vulnerability**
([direct link](https://github.com/Bridle-Stellar/Bridle-Frontend/security/advisories/new)).

Please include:

- what an attacker can do, and what they need (for example, a malicious
  backend, a crafted link, or a compromised dependency),
- steps or a minimal proof of concept,
- the commit or deployed URL you tested against.

We aim to acknowledge reports within 3 business days and to agree on a
fix and disclosure timeline with you. We'll credit you in the advisory
unless you'd rather stay anonymous.

## Scope

In scope:

- **Wallet signing flow**: anything that could get the owner to sign a
  transaction different from the old-to-new change shown on screen, sign
  on the wrong network, or sign for the wrong contract
  (`src/lib/freighter.ts`, `src/lib/policyTx.ts`, the policy hooks and
  confirm dialogs).
- **Transaction building and submission**: handling of unsigned XDR
  returned by Bridle Backend and submission to Soroban RPC
  (`src/api/policy.ts`, `src/lib/submitTx.ts`).
- **Amount handling**: precision or unit bugs that show or submit a
  different amount than the owner entered (`src/lib/decimal.ts`).
- **Safety-critical display**: the emergency stop or limits shown as a
  value that wasn't confirmed by the backend.
- XSS or injection through data returned by the backend (destinations,
  categories, rejection details).
- Test-only or demo-only code paths that can be activated in a production
  build.

Out of scope here (report to the right repo):

- Contract logic: [Bridle-Contract](https://github.com/Bridle-Stellar/Bridle-Contract).
- Backend API, relay, and policy checks: [Bridle-Backend](https://github.com/Bridle-Stellar/Bridle-Backend).
- Bugs in Freighter itself or in Stellar network software.

## Supported versions

Only the latest `main` is supported.
