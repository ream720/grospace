# Test Summary

Last updated: April 24, 2026

## Current Gate Snapshot

- PASS: `npm run typecheck`
- PASS: `npm run lint`
- PASS: `npm run test` (**278 passing tests**)
- PASS: `npm run build`
- PASS: `npm run test:rules`
- PASS: `npm run test:e2e` (`91 passed`, `1 skipped`, `0 failed`; full emulator-backed run on 2026-04-24)
- PASS: gate artifacts created (`FIREBASE_AUTH_AUDIT.md`, `PREINVITE_SHAKEDOWN.md`)
- PARTIAL: CI/release-runner command artifacts still need to be attached for final launch sign-off.

## Unit/Integration Coverage

- Vitest suite total: **278 tests** across services, stores, components, route behavior, and utility layers.
- Key risk areas covered by automated tests:
  - Date conversion and formatting safety.
  - Firestore payload cleaning and undefined-field guards.
  - Plant/task/note service behavior and validation paths.
  - Store-level CRUD + error/loading behavior.
  - `/events` route behavior for task/notes flows, filters, and deep-link state.

## E2E Coverage Summary

See [`E2E_TESTING.md`](./E2E_TESTING.md) for current per-spec detail.

Current suite footprint:

- **92 Playwright tests** across 12 spec files.
- Notes/tasks E2E coverage now validates the consolidated `/events` flow.
- Dashboard quick-action, overdue-task, note-photo, profile/settings, auth-edge, resilience/responsive, and new-signup onboarding visibility paths are covered in spec inventory.
- Legacy `/notes` and `/tasks` behavior is now validated as hard-cut 404 in navigation E2E assertions.
- Plants/Spaces detail split-pane UX is covered in desktop + mobile E2E checks.

## Remaining Release-Gate Work

- Capture CI/release-runner artifacts for the full required command set on the launch-candidate commit.
- Keep tracking in [`TEST_GATES_BACKLOG.md`](./TEST_GATES_BACKLOG.md).
