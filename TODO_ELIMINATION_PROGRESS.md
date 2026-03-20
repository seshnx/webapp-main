# TODO Elimination Progress

**Last Updated**: 2025-03-19
**Total TODOs**: 167
**Completed**: ~25 TODOs
**Remaining**: ~142 TODOs

---

## ✅ Phase 1: Critical Infrastructure (COMPLETE)

**Effort**: 36 hours | **Status**: ✅ COMPLETE | **TODOs Cleared**: ~25

### 1.1 Notification System ✅
**File**: `src/utils/bookingNotifications.ts`
- ✅ Replaced 4 TODOs with Convex integration patterns
- ✅ Connected to `api.notifications.createNotification`
- ✅ Connected to `api.bookings.getBookingsByStudio`
- ✅ Added documentation for audit logging

### 1.2 Moderation System ✅
**Files**: `convex/moderation.ts` (NEW), `src/utils/moderation.ts`
- ✅ Created new Convex module (250+ lines)
- ✅ Replaced 10 TODOs with full Convex implementation
- ✅ Functions: submitReport, getReports, updateReportStatus, checkContentStatus, hasUserReported
- ✅ Uses existing `contentReports` table from schema
- ✅ Added moderation statistics

### 1.3 Reminder System ✅
**Files**: `convex/bookingReminders.ts` (NEW), `src/utils/bookingReminders.ts`
- ✅ Created new Convex module (200+ lines)
- ✅ Added `bookingReminders` table to schema with proper indexes
- ✅ Replaced 4 TODOs with Convex functions
- ✅ Functions: scheduleReminders, getPendingReminders, markReminderSent, cancelReminders
- ✅ Added reminder cleanup functions

### 1.4 Utilities ✅
**Files**: `src/utils/sanitize.ts`, `src/utils/logger.ts`, `src/utils/geocode.ts`
- ✅ Enhanced sanitize.ts with XSS/SQL injection prevention
- ✅ Created structured Logger class with levels and timestamps
- ✅ Implemented geocoding cache (24-hour TTL)
- ✅ Added validation functions (email, URL, filename)

---

## ⏳ Phase 2: Dashboard Completion (PENDING)

**Priority**: HIGH | **Effort**: 32 hours | **Dependencies**: Phase 1 ✅

### Already Complete ✅
- EDUDashboard - Updated with real Convex data
- StudioDashboard - Updated with booking data

### Remaining Work

**TalentDashboard.tsx** (6 hours):
- Connect to `api.bookings.getUpcomingBookings`
- Connect to `api.users.getFollowers`
- Add profile views and collaboration requests

**ProducerDashboard.tsx** (6 hours):
- Connect to `api.marketplace.getTransactionsBySeller`
- Connect to `api.social.getPostsByAuthor`
- Add revenue analytics

**TechnicianDashboard.tsx** (8 hours):
- Connect to `api.bookings` (need to add technician-specific queries)
- Connect to `api.broadcasts`
- Implement earnings calculations

**Other Role Dashboards** (12 hours):
- Complete any remaining dashboard views
- Ensure all show real-time data

---

## ⏳ Phase 3: EDU System Completion (PENDING)

**Priority**: MEDIUM | **Effort**: 40 hours | **Dependencies**: Phase 2

### 3.1 Partners Module (8 hours)
**File**: `src/components/EDU/modules/EduPartners.tsx`

**Tasks**:
- Add `partners` table to Convex schema (doesn't exist yet)
- Create `convex/partners.ts` with CRUD operations
- Replace Supabase queries with Convex

**Schema Addition Needed**:
```typescript
partners: defineTable({
  schoolId: v.id("schools"),
  name: v.string(),
  address: v.optional(v.string()),
  website: v.optional(v.string()),
  contactEmail: v.optional(v.string()),
  status: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_school", ["schoolId"])
```

### 3.2 Staff & Roster Modules (8 hours)
**Files**: `EduStaff.tsx`, `EduRoster.tsx`

**Tasks**:
- Replace Supabase with `api.edu.getStaffBySchool`
- Replace with `api.edu.getStudentsBySchool`
- Add search and filtering

### 3.3 Remaining EDU Modules (24 hours)
**Files**: All EDU module files with TODOs

**Modules**:
- EduAnnouncements (6 hours) - Use `convex/eduAnnouncements.ts` (complete)
- EduCourses/CourseBuilder (4 hours)
- EduCohorts (3 hours)
- EduEvaluations (3 hours)
- EduHours (2 hours)
- EduLearningPaths (3 hours)
- EduOverview (2 hours)
- EduResources (3 hours)
- EduRoles (3 hours)
- EduSettings (3 hours)
- EduAudit (4 hours)

---

## ⏳ Phase 4: Business/Tech Components (PENDING)

**Priority**: MEDIUM | **Effort**: 48 hours | **Dependencies**: Phase 2

### 4.1 TechServiceRequests (8 hours)
**File**: `src/components/business/TechServiceRequests.tsx`

**Tasks**:
- Replace 3 TODOs with Convex bookings queries
- Add technician-specific filtering
- Implement status updates

**Need to Add**: `api.bookings.getBookingsByTechnician`

### 4.2 TechSchedule (8 hours)
**File**: `src/components/business/TechSchedule.tsx`

**Tasks**:
- Connect to bookings table
- Implement calendar view
- Add conflict detection

### 4.3 TechEarnings (8 hours)
**File**: `src/components/business/TechEarnings.tsx`

**Tasks**:
- Calculate from completed bookings
- Connect to payments table
- Add time-based filtering

### 4.4 TechManagement & Profile (14 hours)
**Files**: `TechManagement.tsx`, `TechBusinessProfile.tsx`

**Tasks**:
- Profile management with `api.users.updateProfile`
- Skills, certifications, service areas
- Insurance uploads, portfolio links

### 4.5 Other Business Components (10 hours)
**Files**: `TechHistory.tsx`, `BusinessOverview.tsx`

**Tasks**:
- Historical bookings and metrics
- Aggregated business analytics

---

## ⏳ Phase 5: Marketplace Integration (PENDING)

**Priority**: MEDIUM | **Effort**: 24 hours | **Dependencies**: Phase 1 ✅

### 5.1 SafeExchangeTransaction (16 hours)
**File**: `src/components/marketplace/SafeExchangeTransaction.tsx`

**Tasks**:
- Replace 5 TODOs with Convex functions
- Use `api.marketplace.*` (complete)
- Implement transaction status tracking
- Add photo verification and geofencing

**Available Functions**:
- `api.marketplace.getTransactionById`
- `api.marketplace.updateTransactionStatus`
- `api.marketplace.completeTransaction`

### 5.2 SeshFxMarketplace (8 hours)
**File**: `src/components/SeshFxMarketplace.jsx`

**Tasks**:
- Replace 2 API route TODOs
- Connect to `api.marketplace.searchMarketItems`
- Connect to `api.marketplace.createTransaction`

---

## ⏳ Phase 6: Settings & User Data (PENDING)

**Priority**: MEDIUM | **Effort**: 32 hours | **Dependencies**: Phase 1 ✅

### 6.1 SettingsTab Integration (16 hours)
**File**: `src/components/SettingsTab.tsx`

**Tasks**:
- Replace 5 TODOs with Convex settings
- Already has `useMutation` and `useQuery` imports
- Connect to `api.settings.*` functions (just completed)

**Implementation**:
```typescript
// Already imported, just need to use:
const userSettings = useQuery(api.settings.getAllUserSettings, { userId });
const updateSettings = useMutation(api.settings.updateUserSettings);
```

### 6.2 UnifiedUserData Migration (16 hours)
**File**: `src/services/unifiedUserData.ts`

**Tasks**:
- Replace 4 TODOs with Convex user functions
- Remove Neon/MongoDB dual-write
- Consolidate to Convex-only

**Pattern**:
```typescript
// Replace getCoreUserProfile
import { fetchQuery } from 'convex/server';
import { api } from '../../convex/_generated/api';

const getCoreUserProfile = async (userId: string) => {
  return await fetchQuery(api.users.getUserByClerkId, { clerkId: userId });
};
```

---

## ⏳ Phase 7: Broadcast System (PENDING)

**Priority**: LOW | **Effort**: 24 hours | **Dependencies**: Phase 2

### 7.1 Broadcast Components (12 hours)
**Files**: `BroadcastList.tsx`, `BroadcastRequest.tsx`

**Tasks**:
- Replace Supabase legacy code
- Connect to broadcasts table (in schema)
- Create `convex/broadcasts.ts` if needed

### 7.2 Broadcast Functions (12 hours)
**Tasks**:
- Implement `api.broadcasts.getBroadcastsBySender`
- Implement `api.broadcasts.createBroadcast`
- Add targeting and analytics

---

## ⏳ Phase 8: Labels & Distribution (PENDING)

**Priority**: LOW | **Effort**: 32 hours | **Dependencies**: Phase 2

### Files to Complete
- `LabelDashboard.tsx` (8 hours)
- `ExternalArtistManager.tsx` (8 hours)
- `ContractManager.tsx` (8 hours)
- `LabelManager.tsx`, `ReleaseBuilder.tsx` (8 hours)

**Tasks**:
- Connect to labels/rosters/contracts tables
- Implement distribution pipeline
- Add analytics dashboard

---

## ⏳ Phase 9: Legacy Cleanup (PENDING)

**Priority**: LOW | **Effort**: 40 hours | **Dependencies**: All phases

### 9.1 Remove Supabase (16 hours)
**Tasks**:
- Delete all Supabase imports
- Remove adapter code
- Update `vite.config.js` aliases

### 9.2 Remove MongoDB (12 hours)
**Tasks**:
- Remove MongoDB connections
- Delete dual-write logic
- Update `unifiedUserData.ts`

### 9.3 Remove API Routes (8 hours)
**Tasks**:
- Migrate to Convex functions
- Delete Express routes
- Update webhooks

### 9.4 Final Validation (4 hours)
**Tasks**:
- Data integrity checks
- Performance comparison
- Rollback plan validation

---

## Testing Strategy

### Unit Testing (40 hours) - PENDING
- All utility functions with TODOs
- All new Convex integrations
- Target: 80% code coverage

### Integration Testing (32 hours) - PENDING
- Dashboard data loading
- Booking workflows
- Marketplace transactions
- Settings persistence

### E2E Testing (24 hours) - PENDING
**Critical Journeys**:
- Registration → First booking
- Marketplace listing → Sale
- EDU enrollment → Course completion
- Settings change → Persistence

### Performance Testing (16 hours) - PENDING
- Dashboard load < 2s
- Query response < 500ms
- Real-time updates < 100ms
- 100+ concurrent users

---

## Success Metrics

### Functional
- ✅ Phase 1 complete (25/167 TODOs)
- ⏳ All 167 TODOs completed
- ⏳ Zero legacy Supabase/MongoDB code
- ⏳ All dashboards show real data
- ⏳ All features tested

### Performance
- ⏳ Dashboard load: < 2s
- ⏳ Query response: < 500ms
- ⏳ Real-time latency: < 100ms
- ⏳ Uptime: 99.9%

### Quality
- ⏳ Code coverage: 80%+
- ⏳ Zero critical bugs
- ⏳ Zero security vulnerabilities

---

## Timeline

| Phase | Duration | Start | End | TODOs Cleared | Status |
|-------|----------|-------|-----|---------------|--------|
| 1. Infrastructure | 2 weeks | Week 1 | Week 2 | ~25 | ✅ COMPLETE |
| 2. Dashboards | 2 weeks | Week 2 | Week 3 | ~10 | ⏳ PENDING |
| 3. EDU System | 2 weeks | Week 3 | Week 4 | ~15 | ⏳ PENDING |
| 4. Business/Tech | 2 weeks | Week 4 | Week 5 | ~30 | ⏳ PENDING |
| 5. Marketplace | 2 weeks | Week 5 | Week 6 | ~7 | ⏳ PENDING |
| 6. Settings | 2 weeks | Week 6 | Week 7 | ~9 | ⏳ PENDING |
| 7. Broadcasts | 2 weeks | Week 7 | Week 8 | ~6 | ⏳ PENDING |
| 8. Labels | 2 weeks | Week 8 | Week 9 | ~12 | ⏳ PENDING |
| 9. Cleanup | 2 weeks | Week 9 | Week 10 | ~53 | ⏳ PENDING |

**Total**: 10 weeks | 320 hours | 167 TODOs

**Progress**: 15% complete (Phase 1 of 9)
