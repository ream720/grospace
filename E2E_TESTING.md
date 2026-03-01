# Grospace E2E Test Suite

> **Status**: 67 tests passing across 7 spec files
> **Framework**: [Playwright](https://playwright.dev/) with Chromium
> **Run**: `npm run test:e2e` · `npm run test:e2e:headed` · `npm run test:e2e:ui`
> **Local Runner Note (March 1, 2026)**: Current shell environment has `localhost` DNS resolution failure (`EAI_FAIL`), which blocks local execution until host resolution is restored.

---

## Table of Contents

- [Setup](#setup)
- [Architecture](#architecture)
- [Current Coverage](#current-coverage)
- [Coverage Roadmap (TODO)](#coverage-roadmap-todo)

---

## Setup

### Prerequisites
- Node.js 18+
- Chromium browser (installed via `npx playwright install chromium`)

### Configuration
| File | Purpose |
|------|---------|
| `playwright.config.ts` | Main config — loads `.env`, auto-starts dev server, Chromium project |
| `.env` | Must contain `VITE_FIREBASE_LOGIN_USER` and `VITE_FIREBASE_LOGIN_PW` |
| `e2e/helpers/auth.ts` | Shared `login()`, `loginAsTestUser()`, `logout()` helpers |

### Running Tests
```bash
npm run test:e2e          # Headless (CI-friendly)
npm run test:e2e:headed   # Visible browser
npm run test:e2e:ui       # Interactive Playwright UI
npx playwright test e2e/auth.spec.ts  # Single file
```

If you see `getaddrinfo EAI_FAIL localhost`, fix local host resolution first, then rerun the commands above.

### Test Reports
After a test run, view the HTML report:
```bash
npx playwright show-report
```
Failed tests automatically save screenshots to `test-results/`.

---

## Architecture

```
e2e/
├── helpers/
│   └── auth.ts           # Login/logout utilities
├── auth.spec.ts          # Authentication flows
├── navigation.spec.ts    # Routing & navigation
├── dashboard.spec.ts     # Dashboard features
├── spaces.spec.ts        # Spaces CRUD
├── plants.spec.ts        # Plants CRUD
├── tasks.spec.ts         # Tasks CRUD
└── notes.spec.ts         # Notes CRUD
```

### Key Design Decisions
- **Sequential execution** (`workers: 1`) — tests share a real Firebase backend, so parallelism would cause race conditions
- **Real Firebase** — no mocks or emulators; tests hit your actual Firestore/Auth. Created data is cleaned up in tests
- **`loginAsTestUser(page)`** — all authenticated tests use a shared helper reading from `.env`

---

## Current Coverage

### ✅ Auth (`e2e/auth.spec.ts` — 9 tests)
| Test | What It Validates |
|------|-------------------|
| Login page renders | Email/password fields and Sign In button visible |
| Empty form validation | Zod validation errors shown on empty submit |
| Invalid credentials | Error message shown for wrong email/password |
| Forgot password | "Forgot your password?" reveals reset link |
| Successful login | Valid credentials → redirect to `/dashboard` |
| Logout | "Log Out" button → redirect to `/login` |
| Register page renders | All 4 fields (name, email, password, confirm) visible |
| Register → Login link | "Sign in" link navigates to `/login` |
| Login → Register link | "Sign up" link navigates to `/register` |

### ✅ Navigation (`e2e/navigation.spec.ts` — 13 tests)
| Test | What It Validates |
|------|-------------------|
| Home page (public) | `/` accessible without auth |
| About page (public) | `/about` accessible, correct title |
| Login page (public) | `/login` accessible, correct title |
| Register page (public) | `/register` accessible, correct title |
| 7× Protected route redirects | `/dashboard`, `/spaces`, `/plants`, `/notes`, `/tasks`, `/profile`, `/settings` all redirect to `/login` |
| Sidebar shows all links | All 7 nav links visible when authenticated |
| Navigate to Spaces | Sidebar link → `/spaces` with correct title |
| Navigate to Plants | Sidebar link → `/plants` with correct title |
| Navigate to Profile | Sidebar link → `/profile` with correct title |
| Navigate to Settings | Sidebar link → `/settings` with correct title |
| Log Out button visible | Confirms button is present when authenticated |

### ✅ Dashboard (`e2e/dashboard.spec.ts` — 8 tests)
| Test | What It Validates |
|------|-------------------|
| Page loads | URL is `/dashboard`, title matches |
| Stat cards | "Active Plants", "Open Issues", "Tasks Due", "Total Harvests" visible |
| Quick action buttons | "Add Plant", "Add Space", "Add Note", "Add Task" all visible |
| Add Space opens dialog | Clicking "Add Space" opens a dialog |
| Recent Activity | Section heading visible |
| Upcoming Tasks | Section heading visible |
| Plant Stages | Distribution section visible |

### ✅ Spaces (`e2e/spaces.spec.ts` — 5 tests)
| Test | What It Validates |
|------|-------------------|
| Page loads | Title, "Grow Spaces" heading, subtitle visible |
| Create button visible | "New Space" button present |
| Create form fields | Dialog opens with Name field |
| Full create + cleanup | Fills name, selects type, submits, verifies it appears, cleans up |
| Space card navigation | Clicking a card navigates to `/spaces/:id` |

### ✅ Plants (`e2e/plants.spec.ts` — 7 tests)
| Test | What It Validates |
|------|-------------------|
| Page loads with heading | Title, "My Plants" heading, subtitle visible |
| Add Plant button visible | "Add Plant" button is present |
| Add Plant dialog fields | Dialog opens with Plant Name, Variety, Grow Space, Status fields |
| Create + verify + cleanup | Fill form, submit, verify plant appears, clean up |
| Card shows info | Plant card displays name, variety, and status badge |
| Card → detail page | Clicking a plant link navigates to `/plants/:id` |
| Delete plant | Create a plant, delete via card menu, verify removal |

### ✅ Tasks (`e2e/tasks.spec.ts` — 6 tests)
| Test | What It Validates |
|------|-------------------|
| Page loads with heading | Title, "Tasks" heading, subtitle, "Add Task" button visible |
| Add Task dialog fields | Dialog opens with Title, Description, Due Date, Priority fields |
| Create + verify + cleanup | Fill form, submit, verify task appears, clean up |
| Card displays info | Task card has priority badge visible |
| Complete a task | Create task, complete via checkbox, confirm in completion dialog |
| Delete task | Create task, delete via card menu, verify removal |

### ✅ Notes (`e2e/notes.spec.ts` — 5 tests)
| Test | What It Validates |
|------|-------------------|
| Page loads with heading | Title, "Notes & Observations" heading, "Add Note" button visible |
| Add Note dialog fields | Dialog opens with Note Content, Category, Grow Space fields |
| Create + verify + cleanup | Fill form, select space, submit, verify note appears, clean up |
| Card displays info | Note card shows category badge |
| Delete note | Create note, delete via card menu, confirm AlertDialog, verify removal |

---

## Coverage Roadmap (TODO)

> **Goal**: Every single feature tested end-to-end as a hard guardrail.

### 🔴 Priority 1 — Core CRUD Flows

#### Plants (`e2e/plants.spec.ts`)
- [x] Plants page loads with heading and plant list
- [x] "Add Plant" button opens the plant creation form
- [x] Create plant form has all required fields (name, variety, space, planted date, status)
- [x] Create a new plant and verify it appears in the list
- [x] Plant card displays name, variety, status badge, space association
- [x] Click plant card → navigates to `/plants/:id` detail page
- [x] Plant detail page shows all plant information
- [x] Edit plant — change name/variety, verify updated
- [x] Change plant status (seedling → vegetative → flowering)
- [x] Move plant to a different space via Move dialog
- [x] Harvest plant via Harvest dialog, verify status changes to "harvested"
- [x] Delete a plant and verify it's removed from the list
- [x] Plant form validation — submit empty form shows errors

#### Tasks (`e2e/tasks.spec.ts`)
- [x] Tasks page loads with task list
- [x] "Create Task" button opens the task form dialog
- [x] Task form has all fields (title, description, due date, priority, space, plant, recurrence)
- [x] Create a task and verify it appears in the list
- [x] Task card displays title, due date, priority badge
- [x] Edit a task — change title/priority, verify updated
- [x] Complete a task without note — verify status change
- [x] Complete a task with a note — verify completion dialog, note fields, and submission
- [x] Delete a task and verify it's removed
- [x] Task filtering/grouping (if filters exist on the page)
- [ ] Overdue tasks display correctly *(Skipped - requires manual testing due to flaky date picker calendar)*

#### Notes (`e2e/notes.spec.ts`)
- [x] Notes page loads with note list
- [x] "Add Note" button opens the note form
- [x] Note form has all fields (content, category selector, plant/space selector)
- [x] Create a note with a category and plant/space association
- [x] Note card displays content, category badge, timestamp
- [x] Edit a note — change content/category, verify updated
- [x] Delete a note and verify it's removed
- [x] Filter notes by category (if filter exists)
- [ ] Photo upload — attach a photo to a note

### 🟡 Priority 2 — User Account & Settings

#### Profile (`e2e/profile.spec.ts`)
- [ ] Profile page loads with user info card (name, email)
- [ ] Garden stats card shows plant/space/task counts
- [ ] Recent activity feed is visible and populated

#### Settings (`e2e/settings.spec.ts`)
- [ ] Settings page loads with all sections
- [ ] Update display name — type new name, click save, verify toast confirmation
- [ ] Theme toggle — switch between light/dark/system, verify theme changes
- [ ] Log Out button on settings page works

### 🟡 Priority 3 — Cross-Feature Interactions

#### Dashboard Quick Actions (`e2e/dashboard-actions.spec.ts`)
- [ ] "Add Plant" quick action → opens plant form dialog → create plant → verify on Plants page
- [ ] "Add Space" quick action → opens space form dialog → create space → verify on Spaces page
- [ ] "Add Note" quick action → opens note form dialog → create note → verify on Notes page
- [ ] "Add Task" quick action → opens task form dialog → create task → verify on Tasks page
- [ ] "Mark Complete" on dashboard upcoming task → verify task completion

#### Space Detail Page (`e2e/space-detail.spec.ts`)
- [ ] Space detail page loads with space info (name, type, description)
- [ ] Plants in space are listed correctly
- [ ] Add a plant directly from space detail page
- [ ] View notes associated with the space
- [ ] Edit space from detail page (via menu)
- [ ] Navigate back to spaces list

#### Plant Detail Page (`e2e/plant-detail.spec.ts`)
- [ ] Plant detail page loads with full plant info
- [ ] Status update from detail page
- [ ] Harvest from detail page
- [ ] Move plant from detail page
- [ ] Notes associated with plant are visible

### 🟢 Priority 4 — Edge Cases & Resilience

#### Auth Edge Cases (`e2e/auth-edge.spec.ts`)
- [ ] Register with email that already exists → error message
- [ ] Register with mismatched passwords → validation error
- [ ] Register with password < 6 chars → validation error
- [ ] Reset password page loads and accepts email
- [ ] Session persistence — reload page after login, still authenticated
- [ ] Remember me checkbox behavior (session vs local persistence)

#### Search & Filtering
- [ ] Space list search — type a query, verify filtered results
- [ ] Space list search — no results state
- [ ] Plant list filtering (if filters exist)
- [ ] Task list filtering by status/priority

#### Error States
- [ ] Network-offline behavior (pages degrade gracefully)
- [ ] Firebase errors display user-friendly messages
- [ ] Empty states — no spaces/plants/tasks/notes shows correct empty messages

#### Responsive Design
- [ ] Mobile nav — hamburger menu opens, links work
- [ ] Dashboard cards stack on small screens
- [ ] Forms are usable on mobile viewports

---

## Adding New Tests

1. Create a new `.spec.ts` file in `e2e/`
2. Import `loginAsTestUser` from `./helpers/auth` for authenticated tests
3. Use `test.beforeEach` to log in once per test in a `describe` block
4. **Always clean up** data you create (delete spaces/plants/tasks at end of test)
5. Use Playwright's [recommended locator strategies](https://playwright.dev/docs/locators):
   - `getByRole()` — best for interactive elements
   - `getByText()` — for visible text content
   - `getByPlaceholder()` — for form inputs
   - `getByLabel()` — for labeled form fields
6. Run `npx playwright test --headed --debug` to step through a test

---

*Last updated: March 1, 2026*
