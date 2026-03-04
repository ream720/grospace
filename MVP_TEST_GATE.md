# MVP Audit Report

Project: Grospace
Date: March 1, 2026
Audit Type: Static code audit (initial pass; runtime validation added in follow-up)
Inputs reviewed: `E2E_TESTING.md`, `TEST_SUMMARY.md`, services, stores, routes, UI components, Firestore/Storage rules.

## Executive Summary

- Total findings: 12
- Launch-blocking/high priority: 5
- Main risk themes:
1. Date/timestamp handling inconsistencies
2. Notes/photo data integrity issues
3. Query/read scalability for note counts
4. Dashboard metric correctness

## Scope Reviewed

- Testing docs: [E2E_TESTING.md](C:/Users/Zak/Documents/projects/grospace/grospace/E2E_TESTING.md), [TEST_SUMMARY.md](C:/Users/Zak/Documents/projects/grospace/grospace/TEST_SUMMARY.md)
- Services: base, plant, space, task, note, activity
- Stores: auth, space, plant, task, note
- Routes/components for dashboard, spaces, plants, tasks, notes, auth/profile/settings
- Rules: Firestore + Storage security rules

## Findings

### A-01: Date normalization gaps in `BaseService`
Severity: P0 (High)
Status: Open
Evidence: [baseService.ts:81](C:/Users/Zak/Documents/projects/grospace/grospace/app/lib/services/baseService.ts:81), [baseService.ts:164](C:/Users/Zak/Documents/projects/grospace/grospace/app/lib/services/baseService.ts:164), [baseService.ts:217](C:/Users/Zak/Documents/projects/grospace/grospace/app/lib/services/baseService.ts:217), [plantService.ts:187](C:/Users/Zak/Documents/projects/grospace/grospace/app/lib/services/plantService.ts:187)
Risk: Mixed `Date`/Firestore `Timestamp` values can break sorting/comparisons and produce incorrect behavior across plants/notes/tasks.
Recommended fix: Expand shared conversion logic to include all date fields used by domain models (`plantedDate`, `expectedHarvestDate`, `actualHarvestDate`, `timestamp`, etc.) and enforce consistency at service boundaries.

### A-02: Harvest date validation compares against potentially non-`Date` value
Severity: P1 (High)
Status: Open
Evidence: [HarvestDialog.tsx:114](C:/Users/Zak/Documents/projects/grospace/grospace/app/components/plants/HarvestDialog.tsx:114)
Risk: Calendar may disable/allow wrong dates if `plant.plantedDate` is not normalized to `Date`.
Recommended fix: Normalize before comparison and centralize date coercion in helper/util.

### A-03: Notes filter memo dependency bug (stale filtered results)
Severity: P1 (High)
Status: Open
Evidence: [NoteList.tsx:123](C:/Users/Zak/Documents/projects/grospace/grospace/app/components/notes/NoteList.tsx:123), [NoteList.tsx:137](C:/Users/Zak/Documents/projects/grospace/grospace/app/components/notes/NoteList.tsx:137)
Risk: Query/filter changes may not refresh list as expected, causing confusing UX.
Recommended fix: Align `useMemo` dependency array with actual values used (`effectiveSpaceId`, `effectivePlantId`).

### A-04: Note photo deletion may fail with download URL path handling
Severity: P1 (High)
Status: Open
Evidence: [noteService.ts:124](C:/Users/Zak/Documents/projects/grospace/grospace/app/lib/services/noteService.ts:124), [noteService.ts:275](C:/Users/Zak/Documents/projects/grospace/grospace/app/lib/services/noteService.ts:275), [storage.rules:21](C:/Users/Zak/Documents/projects/grospace/grospace/storage.rules:21)
Risk: Orphaned storage files and cost growth if delete path does not resolve correctly.
Recommended fix: Store canonical storage paths alongside download URLs or reliably parse URL-to-path before deletion; add failure telemetry.

### A-05: Note edit path ignores form fields users can edit
Severity: P1 (High)
Status: Open
Evidence: [NoteList.tsx:181](C:/Users/Zak/Documents/projects/grospace/grospace/app/components/notes/NoteList.tsx:181), [NoteForm.tsx:113](C:/Users/Zak/Documents/projects/grospace/grospace/app/components/notes/NoteForm.tsx:113)
Risk: Users believe plant/space/photo edits were saved when backend update only persists subset fields.
Recommended fix: Align update payload with editable form model, or lock/hide non-editable fields in edit mode.

### A-06: N+1 note count reads on card lists
Severity: P1 (High for scale/perf)
Status: Open
Evidence: [PlantCard.tsx:65](C:/Users/Zak/Documents/projects/grospace/grospace/app/components/plants/PlantCard.tsx:65), [SpaceCard.tsx:60](C:/Users/Zak/Documents/projects/grospace/grospace/app/components/spaces/SpaceCard.tsx:60), [noteService.ts:145](C:/Users/Zak/Documents/projects/grospace/grospace/app/lib/services/noteService.ts:145)
Risk: Read amplification and slow dashboard/list loading as data grows.
Recommended fix: Replace per-card note fetches with aggregated query, cached selector, or denormalized counters.

### A-07: Dashboard "Open Issues" double-counting
Severity: P2 (Medium)
Status: Open
Evidence: [dashboard.tsx:65](C:/Users/Zak/Documents/projects/grospace/grospace/app/routes/dashboard.tsx:65)
Risk: Inflated KPI can mislead user prioritization.
Recommended fix: Deduplicate by task ID before counting.

### A-08: Dashboard due-soon logic mutates `today`
Severity: P2 (Medium)
Status: Open
Evidence: [dashboard.tsx:70](C:/Users/Zak/Documents/projects/grospace/grospace/app/routes/dashboard.tsx:70)
Risk: Fragile date-boundary behavior and maintainability issues.
Recommended fix: Use immutable date variables (`startOfToday`, `endOfWindow`) computed once.

### A-09: Activity filtering relies on names instead of IDs for some types
Severity: P2 (Medium)
Status: Open
Evidence: [activityService.ts:144](C:/Users/Zak/Documents/projects/grospace/grospace/app/lib/services/activityService.ts:144)
Risk: Incorrect activity filtering with renamed/duplicate plant or space names.
Recommended fix: Persist/filter by stable IDs and treat names as display-only metadata.

### A-10: Task recurrence validation depends on non-null assertions
Severity: P2 (Medium)
Status: Open
Evidence: [TaskForm.tsx:103](C:/Users/Zak/Documents/projects/grospace/grospace/app/components/tasks/TaskForm.tsx:103)
Risk: Edge-state desync can allow invalid recurrence payloads.
Recommended fix: Harden schema validation independent of UI state assumptions.

### A-11: Possible auth loading hang in rare init/error path
Severity: P2 (Medium)
Status: Open
Evidence: [authStore.ts:133](C:/Users/Zak/Documents/projects/grospace/grospace/app/stores/authStore.ts:133)
Risk: Protected routes may stay in loading state indefinitely in edge cases.
Recommended fix: Add explicit timeout/error fallback that clears loading and surfaces error state.

### A-12: Full-page reload navigation in SPA paths
Severity: P3 (Low)
Status: Open
Evidence: [PlantCard.tsx:126](C:/Users/Zak/Documents/projects/grospace/grospace/app/components/plants/PlantCard.tsx:126), [ProtectedRoute.tsx:43](C:/Users/Zak/Documents/projects/grospace/grospace/app/components/routing/ProtectedRoute.tsx:43)
Risk: UX jitter/state reset; lower severity but visible in MVP polish.
Recommended fix: Replace with router navigation APIs.

## Existing Test Signals

- Existing docs indicate broad coverage in progress: [E2E_TESTING.md](C:/Users/Zak/Documents/projects/grospace/grospace/E2E_TESTING.md), [TEST_SUMMARY.md](C:/Users/Zak/Documents/projects/grospace/grospace/TEST_SUMMARY.md)
- At least one flaky overdue/date path is already noted; this aligns with date-handling risks above.

## Launch Gate Recommendation

Current recommendation (March 1, 2026): MVP launch candidate for an initial deployment, with explicit caveats:
1. Keep E2E execution limited until Firebase Auth quota/rate-limit issues are solved or tests are moved to an emulator/staging Firebase project.
2. Add ESLint v9 flat config (`eslint.config.*`) or pin ESLint v8 before making lint a required deploy gate.

All previously launch-blocking audit items (A-01 through A-12) are implemented and tracked as `DONE` in the remediation log below.

## Verification Checklist After Fixes

1. Unit tests for all date field conversions and comparisons (services + UI validators)
2. Notes filter behavior test for URL/query param changes
3. Storage integration test: upload note photo -> delete note -> verify file removed
4. Notes edit integration test covering plant/space/photo update paths
5. Performance sanity check on list pages with seeded larger datasets
6. Dashboard metric tests for deduped open issues and due-soon window correctness

## Audit Constraints

- The original audit findings were produced via static code inspection.
- Follow-up runtime validation was executed on March 1, 2026 and is captured in the validation log below.

## Remediation Progress

Last updated: March 1, 2026

| Item | Status | Notes |
| --- | --- | --- |
| A-01 | DONE | Implemented recursive Firestore timestamp conversion in `BaseService` |
| A-02 | DONE | Harvest date comparison now safely normalizes `plant.plantedDate` |
| A-03 | DONE | Fixed NoteList memo dependencies to use effective filter IDs |
| A-04 | DONE | Added storage URL-to-object-path resolution before photo deletion |
| A-05 | DONE | Note edit now persists plant/space/timestamp and preloads edit defaults |
| A-06 | DONE | Removed list-level N+1 behavior via aggregated note subscriptions in list parents |
| A-07 | DONE | Dashboard open issues now deduplicates overlapping high-priority + overdue tasks |
| A-08 | DONE | Dashboard due-soon window now uses immutable date boundaries |
| A-09 | DONE | Activity generation/filtering now persists and filters on stable `plantId` / `spaceId` fields |
| A-10 | DONE | Recurrence validation hardened via schema refinement; removed non-null assertions in submit path |
| A-11 | DONE | Added auth initialization timeout and explicit auth-state error callback fallback |
| A-12 | DONE | Replaced protected-route `window.location` redirect with router navigation |

### Validation Log

- 2026-03-01: `npm run test` -> PASS (`20` files, `211` tests).
- 2026-03-01: Fixed all previously-reported TypeScript test errors in:
  - `app/test/components/notes/NoteCard.test.tsx`
  - `app/test/services/taskService.test.ts`
  - `app/test/stores/plantStore.test.ts`
- 2026-03-01: `npm run typecheck` -> PASS.
- 2026-03-01: `npm run build` -> PASS.
- 2026-03-01: `npm run lint` -> FAIL (ESLint v9 requires `eslint.config.*`; repo currently uses `.eslintrc.js`).
- 2026-03-01: `npm run test:e2e` -> PARTIAL:
  - Run A: `66` passed, `1` failed, `1` skipped.
  - Run B: `64` passed, `3` failed, `1` skipped.
  - Failures were dominated by Firebase Auth quota (`auth/quota-exceeded`) plus one flaky plant-edit assertion in `e2e/plants.spec.ts`.

### Pre-MVP Shakedown (Round 1)

Status: PARTIAL (launch-candidate with known test-environment caveats)

- PASS: TypeScript and build gates are clean (`npm run typecheck`, `npm run build`).
- PASS: Unit/component/integration suite is clean (`npm run test`: `211`/`211`).
- PASS: All audit findings A-01 through A-12 are implemented and tracked as `DONE`.
- PARTIAL: E2E suite is largely green but unstable on real Firebase due auth quota/rate limits and one flaky plant-edit assertion.
- OPEN: `npm run lint` is not yet a valid gate until an ESLint v9 flat config is added.
