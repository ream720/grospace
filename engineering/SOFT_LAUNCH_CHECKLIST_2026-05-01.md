# Soft Launch Checklist (May 1, 2026)

Last updated: April 24, 2026

## Goal

Ship a stable public soft launch on Friday, May 1, 2026 with Free tier access only, while deferring Premium/billing enablement to hard launch.

## Scope Lock

- Launch mode: Free tier public access.
- Premium: deferred to hard launch roadmap (`MONETIZATION_BACKLOG.md`).
- Core workflows in scope: auth, onboarding, dashboard, spaces, plants, events (notes/tasks), profile/settings.

## Exit Criteria (Must Be True Before Go/No-Go)

- Required gate commands pass on the launch-candidate commit:
  - `npm run typecheck`
  - `npm run lint`
  - `npm run test`
  - `npm run build`
  - `npm run test:rules`
  - `npm run test:e2e`
- CI/release-runner artifacts linked in [`PREINVITE_SHAKEDOWN.md`](./PREINVITE_SHAKEDOWN.md).
- Legacy `/notes` + `/tasks` behavior decision is explicit (final 404 vs restored redirects).
- Manual smoke pass completed for desktop + mobile core workflows.
- Rollback steps and owner contacts are ready.

## Day-by-Day Runway (April 21 -> May 1, 2026)

- [x] Tue Apr 21: baseline reset
  - refresh planning docs/backlog to current branch state
  - rerun local gate suite and log evidence
- [x] Wed Apr 22: route behavior decision (confirmed on Apr 24 QA pass)
  - final UX for `/notes` and `/tasks`: keep hard-cut 404 behavior
- [ ] Thu Apr 23: hardening implementation
  - land `/events` filter predicate dedupe
  - land recurring-occurrence in-flight guard
- [x] Fri Apr 24: manual QA round 1 (user-run)
  - onboarding continuity flow validated via `Resume Setup`
  - Events note/task CRUD + photo + recurring flow validated
  - recurring duplicate attempt did not reproduce duplicates
- [ ] Sat Apr 25: hardening test pass + manual QA round 2
  - add/adjust unit and E2E assertions for hardening changes
  - run targeted regression set
- [ ] Sun Apr 26: fix + polish buffer
  - close high/medium launch blockers from QA round 1
- [ ] Mon Apr 27: launch candidate prep
  - freeze release candidate commit
  - run full local gate suite
- [ ] Tue Apr 28: CI evidence capture
  - run full gate suite in CI/release runner
  - attach links + commit SHA to shakedown doc
- [ ] Wed Apr 29: launch ops prep
  - finalize support/known-issues notes
  - verify rollback and on-call ownership
- [ ] Thu Apr 30: go/no-go
  - confirm all exit criteria
  - approve launch window
- [ ] Fri May 1: soft launch execution
  - launch Free tier publicly
  - monitor auth errors, crash rate, and first-session conversion health

## Manual Smoke Scripts (User-Run)

Use a normal user account and one brand-new account.

### 1) Legacy Route Behavior Decision Check

- Open `/notes` in browser.
- Open `/tasks` in browser.
- Confirm behavior matches launch decision:
  - hard-cut path: both show 404 page
  - redirect path: both route to `/events` with clear handoff messaging

### 2) New Signup + Onboarding Continuity

- Register a new account.
- Confirm guided setup appears.
- Complete first setup action from guide (space/plant/task).
- Confirm guide progress updates and can be reopened.

### 3) Events Core Flows

- Go to `/events?type=notes`:
  - create note
  - edit note
  - delete note
  - create note with photo
- Go to `/events?type=tasks`:
  - create task
  - edit task
  - complete task (with and without linked note)
  - delete task
  - apply/clear status + priority filters

### 4) Plant Detail Workspace (Desktop + Mobile)

- Open a plant detail page on desktop:
  - confirm both Tasks and Notes panes visible together
- Repeat on mobile viewport:
  - confirm section switcher toggles between Tasks and Notes panes

### 5) Space Detail Workspace (Desktop + Mobile)

- Open a space detail page on desktop:
  - confirm both Tasks and Notes panes visible together
- Repeat on mobile viewport:
  - confirm section switcher toggles between Tasks and Notes panes

### 6) Recurring Task Interaction Guard (After Guard Lands)

- Create a recurring task in Events.
- Rapidly click an upcoming occurrence completion affordance multiple times.
- Confirm only one completion path is created (no duplicate occurrence creation/completion).

### 7) Profile/Settings + Session

- Update display name in settings and verify persistence.
- Toggle theme and reload page; verify persistence.
- Sign out and sign back in.

## Apr 24 Manual QA Findings (User-Run)

- `1) Legacy routes`: PASS. Decision confirmed to keep `/notes` and `/tasks` as 404.
- `2) New signup + setup`: PASS. Setup flow works through `Resume Setup` and clears after all 3 steps.
- `3) Events CRUD + recurring`: PASS. Note photo upload, recurring task create/edit/delete, and filter operation all worked.
- `4) Plant detail split workspace`: PARTIAL PASS. Desktop/mobile behavior works; minor mobile UI polish still needed.
- `5) Space detail split workspace`: PARTIAL PASS. Desktop/mobile behavior works; minor mobile UI polish still needed.
- `6) Profile/settings/session`: PASS. Display name update, theme persistence, and sign in/out flow were confirmed good.
- `7) Recurring duplicate guard`: PASS (no duplicates reproduced under rapid interaction attempts).

## Follow-Up Items From Apr 24 QA

- Improve filter UX clarity in Events for near-term polish.
- Apply small mobile UI polish pass to Plant and Space detail split-workspace views.

## References

- [`BACKLOG.md`](./BACKLOG.md)
- [`MVP_LAUNCH_BACKLOG.md`](./MVP_LAUNCH_BACKLOG.md)
- [`TEST_GATES_BACKLOG.md`](./TEST_GATES_BACKLOG.md)
- [`PREINVITE_SHAKEDOWN.md`](./PREINVITE_SHAKEDOWN.md)
