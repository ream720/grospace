# Pre-Invite Shakedown Log

Last updated: April 21, 2026 (EDT)

Gate policy:

- Zero Playwright failures for the full emulator-backed suite.
- Capture local command evidence with timestamps before invite-wave sign-off.
- Capture CI/release-runner evidence before launch sign-off.

## Command Matrix

| Command | Required | Local Status | CI Status |
| --- | --- | --- | --- |
| `npm run typecheck` | Yes | Pass (2026-04-21 EDT) | Pending |
| `npm run lint` | Yes | Pass (2026-04-21 EDT) | Pending |
| `npm run test` | Yes | Pass (`268` tests, 2026-04-21 EDT) | Pending |
| `npm run build` | Yes | Pass (2026-04-21 EDT) | Pending |
| `npm run test:rules` | Yes | Pass (2026-04-21 EDT) | Pending |
| `npm run test:e2e` (full emulator run) | Yes | Pass (`91 passed`, `1 skipped`, `0 failed`; 2026-04-21 EDT) | Pending |

## Local Run Evidence

Runner context:

- Date: April 21, 2026 (EDT)
- Workspace: `garden-assistant`
- Branch: `codex/mvp-events-notes-tasks-hardcut-split`
- Commit: `218a92d`
- Emulator mode: `PW_USE_FIREBASE_EMULATOR=true` (default for `npm run test:e2e`)

### Local command log (2026-04-21 refresh)

| Command | Result | Evidence |
| --- | --- | --- |
| `npm run typecheck` | Pass | `react-router typegen && tsc` succeeded |
| `npm run lint` | Pass | `eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0` succeeded |
| `npm run test` | Pass | Vitest: `29` files, `268` tests passed |
| `npm run build` | Pass | React Router/Vite client+SSR build succeeded |
| `npm run test:rules` | Pass | Phase 2 rules assertions passed (`[rules phase2] all assertions passed`) |
| `npm run test:e2e` | Pass | Full suite result: `91 passed`, `1 skipped`, `0 failed` (`92` total tests listed; seeded-account smoke test is opt-in and skipped by default) |

### Prior migration closeout evidence (March 25, 2026, cloud project `grospace-d7a36`)

Credential context for these commands:

- `GOOGLE_APPLICATION_CREDENTIALS=<absolute-local-path-to-service-account-json>`
- Use a local shell export or CI secret; do not commit credential file paths or key material to the repository.

| Time (EDT) | Command | Result | Evidence |
| --- | --- | --- | --- |
| 22:41:35 | `npm run migrate:firestore:user-subcollections:finalize:dry` | Pass | `verified_users=9 mismatches=0` |
| 22:42:01 | `npm run migrate:firestore:user-subcollections:finalize` | Pass | `finalize stripped_userId=302 deleted_legacy_docs=0` |
| 22:42:34 | `npm run migrate:firestore:user-subcollections:verify` | Pass | `verified_users=9 mismatches=0` |

Note:

- `extras=30` entries were reported in finalize/verify as non-blocking subcollection-only records (expected post-finalize in this migration script design).

## CI Run Evidence

Status: Pending

Required before launch sign-off:

1. Attach CI/release-runner job links/artifacts for all required commands.
2. Confirm CI/release full `npm run test:e2e` pass with zero failures.
3. Record CI timestamp and commit SHA for the launch-candidate build.

## Open Issues (Must be Empty for Launch-Ready)

No open blocking shakedown issues.

## References

- [`FIREBASE_AUTH_AUDIT.md`](./FIREBASE_AUTH_AUDIT.md)
- [`E2E_EMULATOR_RUNBOOK.md`](./E2E_EMULATOR_RUNBOOK.md)
- [`TEST_GATES_BACKLOG.md`](./TEST_GATES_BACKLOG.md)
