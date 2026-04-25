# MVP Test Gate

Last updated: April 24, 2026

This doc is the current gate summary. Historical static-audit details were archived during the engineering docs consolidation.

## Audit/Hardening Status

- Original audit items `A-01` through `A-12`: **implemented and closed**.
- Events consolidation parity: functional behavior is in `/events`; legacy `/notes` and `/tasks` are hard-cut routes (404) unless intentionally reintroduced.
- Plants/Spaces detail experience now uses split Tasks/Notes workspaces with responsive mobile toggles.
- Dashboard KPI set locked for MVP: `Active Plants`, `Open Issues`, `Tasks Due`, `Total Harvests`.
- Firebase auth audit artifact completed: [`FIREBASE_AUTH_AUDIT.md`](./FIREBASE_AUTH_AUDIT.md).

## Current Gate Signals

- PASS: `npm run typecheck` (2026-04-21)
- PASS: `npm run lint` (2026-04-21)
- PASS: `npm run test` (`268` tests on 2026-04-21)
- PASS: `npm run build` (2026-04-21)
- PASS: `npm run test:rules` (2026-04-21)
- PASS: E2E suite inventory at `92` tests (`12` files); latest full emulator-backed run `91 passed`, `1 skipped`, `0 failed` (2026-04-21).
- PARTIAL: CI/release-runner evidence for the same command set is still required for launch sign-off.

## Gate Recommendation

MVP remains a **launch candidate with explicit caveats**:

1. Keep legacy route behavior locked to 404 for `/notes` + `/tasks` (legacy-link/help-copy audit completed on 2026-04-24; no stale in-app route references found).
2. Run and store full emulator-backed shakedown logs from unrestricted local and CI/release runners (use [`PREINVITE_SHAKEDOWN.md`](./PREINVITE_SHAKEDOWN.md)).
3. Keep release decisions tied to command-level gate logs on the launch-candidate commit, not historical snapshots.

## References

- E2E details: [`E2E_TESTING.md`](./E2E_TESTING.md)
- Emulator runbook: [`E2E_EMULATOR_RUNBOOK.md`](./E2E_EMULATOR_RUNBOOK.md)
- Auth audit: [`FIREBASE_AUTH_AUDIT.md`](./FIREBASE_AUTH_AUDIT.md)
- Shakedown log: [`PREINVITE_SHAKEDOWN.md`](./PREINVITE_SHAKEDOWN.md)
- Test summary: [`TEST_SUMMARY.md`](./TEST_SUMMARY.md)
- Active gate backlog: [`TEST_GATES_BACKLOG.md`](./TEST_GATES_BACKLOG.md)
