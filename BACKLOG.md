# Grospace Project Backlog

## 🐞 Potential Bugs
- [x] **Missing Firestore Indexes**: Updated `firestore.indexes.json` with all necessary composite indexes for tasks, notes, plants, and spaces. (Pending User Deployment)
- [x] **Toast Implementation**: `TasksPage.tsx` uses a simple `console.log` for toasts instead of a real toast library.
- [x] **Tabs Implementation**: `TaskList.tsx` uses standard Radix UI Tabs for consistency.
- [x] **Login Timeout**: Implemented session-based auth persistence. Users are now logged out when browser closes (unless "Remember Me" is checked).
- [x] **Navigation/Auth State**: Verified that auth redirects work correctly across all routes. All 7 protected routes load properly when authenticated.
- [x] **Date Handling**: Comprehensive audit completed. Date handling is robust across the app - uses `date-fns` library for all date operations with custom `dateUtils.ts` for edge cases. No issues found.

## 🛠️ Major TODOs
- [x] **Profile Updates**: `authStore.ts` profile update logic implemented.
- [x] **Dashboard Refactoring**: `dashboard.tsx` modularized.
- [x] **Note Categories**: All 6 note categories (observation, feeding, pruning, issue, milestone, general) fully implemented and integrated.
- [x] **Task Categories/Priority**: All task filters and grouping logic verified in `TaskList.tsx`.
- [x] **Image Uploads**: `PhotoUpload.tsx` is fully integrated! uploads to Firebase Storage, generates download URLs, saves to Firestore, and handles cleanup on deletion.
- [x] **Search Functionality**: `NoteList` and `TaskList` both have working search - filters local state client-side after data loads from backend. This is appropriate for beta launch. Can be enhanced with backend filtering in future if needed for performance.

## 🚀 Features to Finish
- [x] **Settings Page**: Implemented at `/settings`.
- [x] **Create New Space from Plant Form**: Implemented with unique timestamp-based naming.
- [ ] **User Profile Page**: No dedicated profile page found. What should it do? Is it just publicly visibe Dashboard or Stats? Should it public (or should there be an option to make it private)? Will other users be able to see it? Will there be a user search/discovery feature?
- [ ] **Garden Statistics**: Expand dashboard stats (e.g., success rate, harvest yields). Build a temporary mock simulating a user's garden who has been growing for a year so that we can see how the stats look.
- [ ] **Activity Feed**: A more robust activity feed than just "Recent Changes".

## 🧪 Testing
- [ ] **Integration Tests**: Audit the app for features that need Integration Testing.
- [ ] **Integration Tests**: Add Playwright tests for "Create New Space" functionality in PlantForm (Radix UI Select component testing is challenging in unit tests).
- [ ] **Integration Tests**: Add Playwright tests for all appropriate features.
