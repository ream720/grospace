# Grospace Project Backlog

## 🐞 Potential Bugs
- [x] **Missing Firestore Indexes**: Updated `firestore.indexes.json` with all necessary composite indexes for tasks, notes, plants, and spaces. (Pending User Deployment)
- [x] **Toast Implementation**: `TasksPage.tsx` uses a simple `console.log` for toasts instead of a real toast library.
- [x] **Tabs Implementation**: `TaskList.tsx` uses standard Radix UI Tabs for consistency.
- [x] **Login Timeout**: Implemented session-based auth persistence. Users are now logged out when browser closes (unless "Remember Me" is checked).
- [ ] **Navigation/Auth State**: Need to verify if the auth redirect works correctly across all routes.
- [ ] **Date Handling**: While tests show date handling is robust, I should check if `dashboard.tsx` or other components have any direct date manipulations that could fail.

## 🛠️ Major TODOs
- [x] **Profile Updates**: `authStore.ts` profile update logic implemented.
- [x] **Dashboard Refactoring**: `dashboard.tsx` modularized.
- [x] **Note Categories**: All 6 note categories (observation, feeding, pruning, issue, milestone, general) fully implemented and integrated.
- [x] **Task Categories/Priority**: All task filters and grouping logic verified in `TaskList.tsx`.
- [ ] **Image Uploads**: `PhotoUpload.tsx` exists, but is it fully integrated with notes?
- [ ] **Search Functionality**: `NoteList` and `TaskList` have search inputs, verify if they actually filter data correctly from the backend or just local state.

## 🚀 Features to Finish
- [x] **Settings Page**: Implemented at `/settings`.
- [x] **Create New Space from Plant Form**: Implemented with unique timestamp-based naming.
- [ ] **User Profile Page**: No dedicated profile page found.
- [ ] **Garden Statistics**: Expand dashboard stats (e.g., success rate, harvest yields).
- [ ] **Activity Feed**: A more robust activity feed than just "Recent Changes".

## 🧪 Testing
- [ ] **Integration Tests**: Add Playwright/Cypress tests for "Create New Space" functionality in PlantForm (Radix UI Select component testing is challenging in unit tests).
