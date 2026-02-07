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
- [x] **User Profile Page**: Implemented at `/profile` with user info, garden statistics, and activity feed.
- [x] **Activity Feed**: Unified activity feed on Dashboard and Profile, showing notes, tasks, plants, and spaces chronologically.
- [x] **Garden Statistics**: Expanded dashboard stats with success rate, avg harvest time, 6 total stat cards. Includes dev-only mock data toggle for testing.
- [x] **Activity Feed Enhancement**: Added filter tabs (All, Notes, Tasks, Plants, Spaces) on Dashboard Activity Feed.


## 🌐 Future Social Features (Post-Beta)
Following the successful beta launch, these features will build upon the Activity Feed foundation:

### Phase 2: Public Profiles
- [ ] **Profile URL**: `/profile/[userId]` - View other users' profiles
- [ ] **Privacy Controls**: Public/private/followers-only settings
- [ ] **Profile Customization**: Bio, profile picture, featured plants

### Phase 3: Follow System
- [ ] **Follow/Unfollow**: Users can follow other gardeners
- [ ] **Followers/Following Counts**: Display social connections
- [ ] **Activity Feed**: See activities from followed users
- [ ] **Notifications**: New follower alerts

### Phase 4: Social Interactions
- [ ] **Like/Comment**: Engage with activities
- [ ] **Share Achievements**: Share harvests, milestones
- [ ] **Leaderboards**: Most active gardeners, best success rates
- [ ] **Community**: Garden tips, Q&A section

## 🧪 Testing
- [ ] **Integration Tests**: Audit the app for features that need Integration Testing.
- [ ] **Integration Tests**: Add Playwright tests for "Create New Space" functionality in PlantForm (Radix UI Select component testing is challenging in unit tests).
- [ ] **Integration Tests**: Add Playwright tests for all appropriate features.

### Edge Case Testing
- [ ] **Activity Feed Truncation**: Test with very long note content (should truncate or wrap properly)
- [ ] **Activity Feed Scroll**: Test with 100+ activities (performance and scroll behavior)
- [ ] **Deleted References**: Test activity items referencing deleted plants/spaces (should handle gracefully)
- [ ] **Empty States**: Verify all empty states display correctly (new user, no data scenarios)
- [ ] **Garden Stats Edge Cases**: Test with no harvests, no plants, plants without harvest dates
- [ ] **Responsive Design**: Test profile page and activity feed on mobile/tablet viewports
- [ ] **Date Display**: Test with activities from various time ranges (minutes ago, days ago, months ago)
