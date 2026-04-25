# MVP Launch Product Backlog

Last updated: April 24, 2026 (manual QA + polish follow-up sync)

## Soft Launch Scope (May 1, 2026)

- Free tier opens to public.
- Premium/billing remains deferred to hard launch (track in [`MONETIZATION_BACKLOG.md`](./MONETIZATION_BACKLOG.md)).

## Active MVP Product Work (Pre-Soft-Launch)

- [x] Decide legacy `/notes` and `/tasks` route behavior for launch UX (hard-cut 404 confirmed in Apr 24 manual QA).
- [x] Deduplicate `/events` task filtering logic to remove drift between list results and status counts (landed Apr 24 follow-up hardening pass).
- [x] Add in-flight guard around recurring occurrence selection/completion to prevent duplicate interaction paths (landed Apr 24 follow-up hardening pass).
- [x] Expand `/events` route test coverage for remaining weak paths (Notes CRUD dialogs, view-toggle URL sync, mobile details sheet behavior, photo modal open/close, and cleanup unmount assertions). (Landed Apr 24 wrap-up pass.)
- [x] Run manual UX smoke pass for split Plants/Spaces workspaces (desktop dual-pane + mobile toggles) and capture outcomes in launch notes.
- [x] Mobile UI polish pass for Plants/Spaces detail views landed (Apr 24 follow-up).
- [x] Events filter UX clarity pass landed (explicit context/status labeling + clearer filter guidance).

## Soft Launch Runway Checklist (April 21 -> May 1, 2026)

- [x] Tue Apr 21: refresh docs/backlog and rerun full local gate set.
- [x] Wed Apr 22: finalize decision on legacy `/notes` + `/tasks` UX and implement chosen behavior.
- [x] Thu Apr 23: land `/events` hardening fixes (filter dedupe + recurring in-flight guard). (Implemented Apr 24 follow-up hardening pass.)
- [x] Fri Apr 24: run manual product smoke pass round 1 (auth, onboarding, dashboard, events, plants, spaces).
- [x] Sat Apr 25: add/adjust targeted `/events` unit coverage for the hardening changes. (Completed Apr 24 wrap-up pass; no additional E2E delta required from this pass.)
- [ ] Sat Apr 25: run manual product smoke pass round 2 (retest after hardening changes).
- [ ] Sun Apr 26: bugfix/polish buffer from smoke findings.
- [ ] Mon Apr 27: prepare launch-candidate commit and rerun full local gate suite.
- [ ] Tue Apr 28: capture CI/release-runner evidence and artifact links.
- [ ] Wed Apr 29: finalize soft-launch support copy, known-issues sheet, and rollback checklist.
- [ ] Thu Apr 30: run go/no-go review with final gate evidence + open-issue sweep.
- [ ] Fri May 1: execute soft launch and monitor launch-day signals.

## MVP Follow-Up / Cleanup

- [ ] Optional UX refinements to guided walkthrough copy/ordering after invite feedback.
- [ ] Improve onboarding flow continuity so the guided modal can stay in-context through multi-step setup actions.

## Recently Completed

- [x] Manual QA validation on 2026-04-24:
  - onboarding continuity via `Resume Setup` flow worked through all 3 setup steps
  - Events notes/tasks CRUD + note photo upload + recurring task flow worked
  - profile/settings/session smoke checks confirmed good
  - recurring duplicate attempt did not reproduce duplicates
- [x] Follow-up polish landed after Apr 24 QA:
  - events filter clarity improvements shipped in `/events`
  - small mobile UI tweaks shipped on plant/space detail split-workspace views
- [x] Reworked Plants and Spaces detail pages into split Tasks/Notes layouts (desktop dual-pane + mobile section switcher).
- [x] Removed legacy `/notes` and `/tasks` route modules as part of `/events` hard-cut (route behavior now 404 unless reintroduced intentionally).
- [x] Expanded E2E coverage for plant/space split-pane behaviors and legacy route 404 assertions.
- [x] Locked MVP dashboard stat tiles to `Active Plants`, `Open Issues`, `Tasks Due`, `Total Harvests`.
- [x] Dashboard recent activity zero-state redesign.
- [x] Dashboard new-user `Set Up Garden` CTA for empty accounts.
- [x] Dashboard quick-action modal flicker fix after create submit.
- [x] Actionable first-run guided walkthrough with per-user resumable progress.
- [x] Made Add New Plant `Variety/Cultivar` optional.

## Deferred Post-MVP Product Work

- [ ] Add Events visual timeline feature and decide whether Plant/Space pages should also expose timeline views.
- [ ] Redesign spaces/plants dashboard visualization as a true visual component (not an additional data card).
- [ ] Explore product direction: a notes-first model where a note can optionally be promoted/toggled into a task.

## Deferred Product Roadmap (Post-MVP)

- [ ] Public profile routes + privacy controls + profile customization.
- [ ] Follow system (`follow/unfollow`, follower counts, followed-user activity feed, notifications).
- [ ] Social interactions (likes/comments, achievement sharing, leaderboards, community Q&A).

## References

- Backlog index: [`BACKLOG.md`](./BACKLOG.md)
- Completed MVP history: [`archive/COMPLETED_BACKLOG_2026_Q1.md`](./archive/COMPLETED_BACKLOG_2026_Q1.md)
