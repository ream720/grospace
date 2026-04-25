# Engineering Backlog Index

Last updated: April 24, 2026 (`/events` wrap-up coverage + legacy-link audit sync)

Use this file as the control-plane backlog. Detailed work lives in focused docs linked below.

## Now

- [ ] Lock May 1, 2026 soft-launch scope and complete checklist execution (`Free` tier public, Premium deferred). See [`SOFT_LAUNCH_CHECKLIST_2026-05-01.md`](./SOFT_LAUNCH_CHECKLIST_2026-05-01.md).
- [x] Close remaining `/events` hardening risks: dedupe task-filter predicates, add recurring occurrence in-flight guard, and add parity regression tests (completed 2026-04-24).
- [ ] Capture release evidence on the launch-candidate commit (local + CI artifacts) in [`PREINVITE_SHAKEDOWN.md`](./PREINVITE_SHAKEDOWN.md).

Recent milestone (completed):

- [x] `/events` hard-cut shipped on 2026-04-16 (`app/routes/notes.tsx` and `app/routes/tasks.tsx` removed).
- [x] Legacy route decision confirmed on 2026-04-24 QA pass: keep `/notes` + `/tasks` as 404 (no redirect restoration planned for soft launch).
- [x] Plants/Spaces detail pages reworked to split Tasks/Notes workspaces with mobile section switchers.
- [x] Mobile UI polish follow-up landed for Plant/Space split-workspace detail layouts (2026-04-24).
- [x] Events filter UX clarity polish landed for Tasks/Notes filters (context labeling + explicit smart-status guidance, 2026-04-24).
- [x] Local gate set re-validated on 2026-04-21: `npm run typecheck`, `npm run lint`, `npm run test` (`268`), `npm run build`, `npm run test:rules`, and `npm run test:e2e` (`91 passed`, `1 skipped`, `0 failed`).
- [x] Manual QA round (2026-04-24): onboarding continuity validated, Events CRUD validated, and recurring duplicate attempts did not reproduce duplicate completions.
- [x] Profile/settings/session manual smoke checks confirmed good (2026-04-24 follow-up).
- [x] Emulator-first E2E workflow stabilized (startup/seed/auth bootstrap path) and documented in [`E2E_EMULATOR_RUNBOOK.md`](./E2E_EMULATOR_RUNBOOK.md).
- [x] Phase-3 release-gate stabilization completed: migration finalize+verify and full emulator-backed Playwright suite green.

## Next

- [ ] Optional UX refinements to guided walkthrough copy/ordering after soft-launch feedback. See [`MVP_LAUNCH_BACKLOG.md`](./MVP_LAUNCH_BACKLOG.md).
- [ ] Improve onboarding flow continuity so guided setup can stay in-context through multi-step setup actions. See [`MVP_LAUNCH_BACKLOG.md`](./MVP_LAUNCH_BACKLOG.md).
- [ ] Post-MVP lint hardening (`react/no-unescaped-entities` re-enable + escape cleanup). See [`TEST_GATES_BACKLOG.md`](./TEST_GATES_BACKLOG.md).
- [ ] Plan incremental `/events` decomposition after gate-critical fixes (URL filter codec/state transitions, component extraction, reducer-oriented controller state). See [`MVP_LAUNCH_BACKLOG.md`](./MVP_LAUNCH_BACKLOG.md).

Events focused-pass findings (updated April 21, 2026):

- [x] Deduplicate Events task-filter predicates to remove drift risk between list filtering and status counts; add parity tests for context/scope/status/priority combinations. Primary touchpoint: `app/routes/events.tsx`.
- [x] Add an in-flight guard around recurring occurrence selection/completion flows to prevent duplicate create/completion paths under rapid interaction. Primary touchpoints: `app/routes/events.tsx`, `app/lib/services/taskService.ts`.
- [x] Expand Events route test coverage for remaining weak paths: Notes CRUD dialogs, Notes/Tasks view-toggle URL sync, mobile details sheet behavior, photo modal open/close, and cleanup effect assertions (completed 2026-04-24). Primary touchpoint: `app/test/routes/events.test.tsx`.
- [x] Audit public-facing links/help copy for removed `/notes` and `/tasks` routes and add dedicated `/events` handoff messaging where needed (completed 2026-04-24; no stale in-app route links found).

Recently completed (March 16, 2026):

- [x] Guided dashboard walkthrough upgraded to actionable setup flow with resumable progress.
- [x] Onboarding flow stabilized for new signups by scoping dashboard data to current user context.
- [x] Rolled back dashboard `Spaces & Plants Snapshot` card pending redesign of a more visual spaces/plants experience.
- [x] Canonical gate artifacts created: [`FIREBASE_AUTH_AUDIT.md`](./FIREBASE_AUTH_AUDIT.md), [`PREINVITE_SHAKEDOWN.md`](./PREINVITE_SHAKEDOWN.md).
- [x] Made `Variety/Cultivar` optional in Add New Plant flow.

## Later

- [ ] Monetization foundation and billing rollout (Premium hard-launch path). See [`MONETIZATION_BACKLOG.md`](./MONETIZATION_BACKLOG.md).
- [ ] Timeline and space/plant visualization expansion work. See [`MVP_LAUNCH_BACKLOG.md`](./MVP_LAUNCH_BACKLOG.md).
- [ ] Evaluate long-term Events model direction: notes-first workflow with optional task conversion.

## Backlog Documents

- MVP launch product work: [`MVP_LAUNCH_BACKLOG.md`](./MVP_LAUNCH_BACKLOG.md)
- Soft-launch runway checklist: [`SOFT_LAUNCH_CHECKLIST_2026-05-01.md`](./SOFT_LAUNCH_CHECKLIST_2026-05-01.md)
- Test gates and release readiness: [`TEST_GATES_BACKLOG.md`](./TEST_GATES_BACKLOG.md)
- Monetization roadmap: [`MONETIZATION_BACKLOG.md`](./MONETIZATION_BACKLOG.md)
- Completed history archive: [`archive/COMPLETED_BACKLOG_2026_Q1.md`](./archive/COMPLETED_BACKLOG_2026_Q1.md)
