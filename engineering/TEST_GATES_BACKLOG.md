# Test Gates Backlog

Last updated: April 21, 2026 (soft-launch gate refresh + local full-run revalidation)

## Events Refactor Test Alignment

- [ ] Keep Events route unit/e2e assertions current as `/events` UX evolves.
- [x] Align navigation coverage to hard-cut behavior: legacy `/notes` and `/tasks` now assert 404 outcomes.

## Release Gates (Pre-Invite / Pre-Launch)

- [x] Firebase Auth audit: inventory app + test auth flows, verify provider/rules/session assumptions, and document quota risk points with mitigations.
- [x] Firestore phase-2 model finalization in cloud project (`grospace-d7a36`): finalize dry-run, finalize write, and verify run completed with `mismatches=0`.
- [x] E2E auth stability: full local emulator-backed validation completed with zero failures (`91 passed`, `1 skipped`) after selector + onboarding stabilization.
- [x] Shakedown runbook: logged `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build`, `npm run test:rules`, and full `npm run test:e2e` evidence in [`PREINVITE_SHAKEDOWN.md`](./PREINVITE_SHAKEDOWN.md).
  - Local status (2026-04-21): full gate set passed in emulator mode on branch `codex/mvp-events-notes-tasks-hardcut-split` (HEAD `218a92d`).
  - Pending gate evidence: CI/release-runner command artifacts + final soft-launch sign-off.
- [ ] Capture CI/release-runner gate evidence for the launch-candidate commit (`npm run typecheck`, `npm run lint`, `npm run test`, `npm run build`, `npm run test:rules`, `npm run test:e2e`) with artifact links + commit SHA.

## High-Priority MVP Coverage Gaps

- [x] Note photo upload E2E coverage.
- [x] Profile + Settings E2E coverage.
- [x] Auth edge-case E2E coverage (duplicate email, password mismatch, short password, reset flow, session persistence, remember-me).
- [x] Error/resilience checks (offline behavior, friendly Firebase errors, empty states).
- [x] Responsive smoke coverage (mobile nav, dashboard card stacking, form usability).

## Recently Completed

- [x] Unit test refactor for Events (`/events` model for notes/tasks route behavior and nav assertions).
- [x] E2E test refactor for Events (`e2e/notes.spec.ts`, `e2e/tasks.spec.ts`, `e2e/navigation.spec.ts`, deep links/redirects).
- [x] Auth test utility setup: standardized Playwright global auth bootstrap + Firebase Emulator seeding path (`e2e/global-setup.ts`, `scripts/seed-firebase-emulator.mjs`).
- [x] Emulator startup hardening: deterministic Firebase CLI launcher (`scripts/start-firebase-emulators.mjs`) + clearer missing-CLI errors.
- [x] Emulator startup hardening follow-up: force disable Firebase CLI update notifier checks for non-interactive runners.
- [x] Emulator readiness hardening: robust readiness checks (Auth 405 handling + Playwright health-check via Emulator Hub endpoint).
- [x] Emulator seed hardening under Firestore rules: authenticated token-backed writes for seeded user/space documents.
- [x] Emulator workflow documentation: created [`E2E_EMULATOR_RUNBOOK.md`](./E2E_EMULATOR_RUNBOOK.md).
- [x] Auth risk artifact created: [`FIREBASE_AUTH_AUDIT.md`](./FIREBASE_AUTH_AUDIT.md).
- [x] Gate evidence artifact created: [`PREINVITE_SHAKEDOWN.md`](./PREINVITE_SHAKEDOWN.md).
- [x] Flaky plant-edit assertion stabilization in `e2e/plants.spec.ts`.
- [x] Overdue tasks UI validation (automated in `e2e/tasks.spec.ts`).
- [x] Dashboard quick actions E2E coverage (`e2e/dashboard-actions.spec.ts`).
- [x] Note photo upload automation (`e2e/notes.spec.ts`).
- [x] Profile/settings automation (`e2e/profile-settings.spec.ts`).
- [x] Auth edge-case automation (`e2e/auth-edge.spec.ts`).
- [x] Resilience/responsive smoke automation (`e2e/responsive-resilience.spec.ts`).
- [x] New-signup onboarding regression coverage (`e2e/auth-edge.spec.ts` guided setup visibility + reopen path).
- [x] Dashboard task-query stabilization: removed index-heavy default ordering and sorted task lists client-side for startup resilience.
- [x] Phase-3 Firestore finalize execution logged (`finalize:dry`, `finalize`, `verify`) with `mismatches=0`.
- [x] Phase-3 E2E selector-contract stabilization across Dashboard/Events/Nav/Profile/Settings/Plants/Spaces plus onboarding-aware helpers.
- [x] Full emulator-backed Playwright gate green (`npm run test:e2e`: `91 passed`, `1 skipped`, `0 failed`).
- [x] Legacy route hard-cut assertions in navigation E2E (`/notes`, `/tasks` => 404).
- [x] Plants/Spaces split-pane detail coverage added in E2E (`e2e/plants.spec.ts`, `e2e/spaces.spec.ts`).

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
- Gate docs: [`MVP_TEST_GATE.md`](./MVP_TEST_GATE.md), [`E2E_TESTING.md`](./E2E_TESTING.md), [`E2E_EMULATOR_RUNBOOK.md`](./E2E_EMULATOR_RUNBOOK.md), [`FIREBASE_AUTH_AUDIT.md`](./FIREBASE_AUTH_AUDIT.md), [`PREINVITE_SHAKEDOWN.md`](./PREINVITE_SHAKEDOWN.md), [`TEST_SUMMARY.md`](./TEST_SUMMARY.md)
