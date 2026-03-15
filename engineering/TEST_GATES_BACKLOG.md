# Test Gates Backlog

Last updated: March 15, 2026

## Events Refactor Test Alignment

- [ ] Unit test refactor for Events (`/events` model for notes/tasks route behavior and nav assertions).
- [ ] E2E test refactor for Events (`e2e/notes.spec.ts`, `e2e/tasks.spec.ts`, `e2e/navigation.spec.ts`, deep links/redirects).

## Release Gates (Pre-Invite / Pre-Launch)

- [ ] E2E auth stability: move login-heavy runs to Firebase Emulator or stable staging credentials (`auth/quota-exceeded` mitigation).
- [ ] Flaky test fix: stabilize intermittent plant-edit assertion in `e2e/plants.spec.ts`.
- [ ] Shakedown runbook: log `npm run typecheck`, `npm run build`, `npm run test`, and targeted `npm run test:e2e` before invite waves.

## High-Priority MVP Coverage Gaps

- [ ] Overdue tasks UI validation (manual path currently skipped because of date-picker flakiness).
- [ ] Note photo upload E2E coverage.
- [ ] Profile + Settings E2E coverage.
- [ ] Dashboard quick actions E2E coverage.
- [ ] Auth edge-case E2E coverage (duplicate email, password mismatch, short password, reset flow, session persistence, remember-me).
- [ ] Error/resilience checks (offline behavior, friendly Firebase errors, empty states).
- [ ] Responsive smoke coverage (mobile nav, dashboard card stacking, form usability).

## Additional Test Backlog

- [ ] Integration test audit for untested feature paths.
- [ ] Integration/Playwright coverage for "Create New Space" from Plant form.
- [ ] Broader Playwright expansion for critical user flows.
- [ ] Activity feed edge-case checks (long content, high volume scroll, deleted references, empty states, date labels).
- [ ] Garden stats edge-case checks (no harvests, no plants, missing harvest dates).

## Code Quality Gate Follow-Up

- [ ] Post-MVP lint hardening: re-enable `react/no-unescaped-entities` and clean JSX text escapes.

## References

- Backlog index: [`BACKLOG.md`](./BACKLOG.md)
- Legacy test docs: [`MVP_TEST_GATE.md`](./MVP_TEST_GATE.md), [`E2E_TESTING.md`](./E2E_TESTING.md), [`TEST_SUMMARY.md`](./TEST_SUMMARY.md)
