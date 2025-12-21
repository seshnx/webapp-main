# Missing Modules Analysis

## Comparison: Backup (seshnx-edu) vs Current (webapp-main)

### ✅ Components Present in Both
- `AuthWizard.jsx`
- `BookingModal.jsx`
- `BookingSystem.jsx`
- `LegalDocs.jsx`
- `MainLayout.jsx`
- `Navbar.jsx`
- `ProfileManager.jsx`
- `Sidebar.jsx`
- `TalentSearch.jsx`
- Most `shared/` components

### ❌ Missing Components in Current App

#### 1. **BusinessCenter.jsx** (Incomplete)
**Backup Version Has:**
- Full tab system (Overview, Studio Ops, Distribution, Artist Roster)
- Integration with `StudioManager`
- Integration with `LabelManager`
- Integration with `DistributionManager`
- Role-based feature access
- Quick actions panel

**Current Version Has:**
- Basic stats overview
- Placeholder content
- No tab system
- No integrations

#### 2. **StudioManager.jsx** - MISSING
- Main studio management component
- Likely integrates with `studio/` subdirectory components

#### 3. **LabelManager.jsx** - MISSING
- Label/agent roster management
- Artist management features

#### 4. **studio/** Directory - MISSING
Contains:
- `FloorplanEditor.jsx`
- `RoomManagementModal.jsx`
- `StudioAvailability.jsx`
- `StudioBookings.jsx`
- `StudioDetailsCard.jsx`
- `StudioDetailsModal.jsx`
- `StudioEquipment.jsx`
- `StudioGallery.jsx`
- `StudioOverview.jsx`
- `StudioPolicies.jsx`
- `StudioRooms.jsx`
- `StudioSettings.jsx`

#### 5. **distribution/** Directory - MISSING
Contains:
- `AnalyticsDashboard.jsx`
- `ReleaseBuilder.jsx`
- `RoyaltyManager.jsx`

#### 6. **marketplace/** Directory - MISSING
Contains:
- `DistributionManager.jsx` (used by BusinessCenter)
- `GearExchange.jsx`
- `PhotoVerification.jsx`
- `SafeExchangeTransaction.jsx`
- `SeshFxStore.jsx`
- `ShippingVerification.jsx`

#### 7. **chat/** Directory - PARTIALLY MISSING
Backup has:
- `ChatDetailsPane.jsx`
- `ChatInput.jsx`
- `ChatSidebar.jsx`
- `ChatWindow.jsx`
- `ConversationItem.jsx`
- `PresenceIndicator.jsx`
- `media/` subdirectory
- `message/` subdirectory

#### 8. **social/** Directory - PARTIALLY MISSING
Backup has:
- `CommentSection.jsx`
- `CreatePostWidget.jsx`
- `Discover.jsx`
- `FollowButton.jsx`
- `FollowersListModal.jsx`
- `NotificationsPanel.jsx`
- `PostCard.jsx`
- `discover/` subdirectory

#### 9. **tech/** Directory - MISSING
Contains:
- `InspectionDiagrams.jsx`
- `InspectionEditor.jsx`
- `RepairTracker.jsx`
- `ServiceJobBoard.jsx`
- `TechBookingModal.jsx`
- `TechBroadcastBuilder.jsx`
- `TechDirectory.jsx`
- `TechGearDatabase.jsx`
- `TechProfileEditor.jsx`

#### 10. **Contexts** - PARTIALLY MISSING
Backup has:
- `EduAuthContext.jsx` (EDU-specific, can skip)
- `SchoolContext.jsx` (EDU-specific, can skip)
- `PlatformAdminContext.jsx` (should check if needed)

#### 11. **Utils** - PARTIALLY MISSING
Backup has:
- `eduPermissions.js` (EDU-specific, can skip)
- `eduRoleAssignment.js` (EDU-specific, can skip)
- `eduTime.js` (EDU-specific, can skip)
- Other utils may be missing - need to compare

## Priority: What to Reintegrate

### 🔴 High Priority (Core Business Features)
1. **StudioManager.jsx** - Essential for studio operations
2. **studio/** directory - All studio management components
3. **Complete BusinessCenter.jsx** - Full version with tabs and integrations
4. **LabelManager.jsx** - For labels and agents

### 🟡 Medium Priority (Business Features)
5. **distribution/** directory - Music distribution features
6. **marketplace/DistributionManager.jsx** - Used by BusinessCenter

### 🟢 Low Priority (Enhancements)
7. **tech/** directory - Tech services enhancements
8. **social/** enhancements - If missing features
9. **chat/** enhancements - If missing features

## Recommended Action Plan

### Step 1: Copy Core Business Components
```bash
# From backup to current app
- BusinessCenter.jsx (full version)
- StudioManager.jsx
- LabelManager.jsx
- studio/ directory (all files)
```

### Step 2: Copy Distribution Components
```bash
- distribution/ directory (all files)
- marketplace/DistributionManager.jsx
```

### Step 3: Update BusinessCenter Integration
- Update BusinessCenter to use StudioManager
- Update BusinessCenter to use LabelManager
- Update BusinessCenter to use DistributionManager

### Step 4: Verify Dependencies
- Check if all imports resolve
- Check if all shared components exist
- Check if all hooks exist
- Check if all utils exist

## Files to Copy (Priority Order)

### Immediate (Core Business):
1. `src/components/BusinessCenter.jsx` (replace with full version)
2. `src/components/StudioManager.jsx`
3. `src/components/LabelManager.jsx`
4. `src/components/studio/` (entire directory)

### Soon (Distribution):
5. `src/components/distribution/` (entire directory)
6. `src/components/marketplace/DistributionManager.jsx`

### Later (Enhancements):
7. `src/components/tech/` (if needed)
8. Check `src/components/social/` and `src/components/chat/` for missing files

## Notes

- **EDU components** should NOT be copied (intentionally removed)
- **Contexts** - Check if `PlatformAdminContext.jsx` is needed
- **Utils** - Compare utils directories to see what's missing
- **Hooks** - Compare hooks directories to see what's missing

---

**Last Updated**: December 2024  
**Source**: `seshnx-edu` backup directory  
**Target**: `webapp-main` current app

