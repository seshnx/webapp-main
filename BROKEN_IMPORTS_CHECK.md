# Broken Imports and Missing Modules Check

## Summary
This document lists all potential broken imports and missing modules found in the codebase.

## Issues Found

### 1. ✅ Logo Import Mismatch (FIXED)
**File**: `src/components/AuthWizard.jsx`
- **Line 13**: Was importing `LogoDark` from `'../assets/SeshNx-PNG cCropped white text.png'`
- **Issue**: Variable name suggested "Dark" but imported "white text" version
- **Fix**: Renamed to `LogoWhite` to match the actual asset
- **Status**: ✅ Fixed

### 2. ✅ BidModal Firebase Import (FIXED)
**File**: `src/components/BidModal.jsx`
- **Issue**: Still using Firebase Firestore imports instead of Supabase
- **Fix**: Migrated to Supabase `bookings` table
- **Status**: ✅ Fixed

### 2. ✅ Convex API Import
**Files**: `src/components/Dashboard.jsx` and others
- **Status**: ✅ **WORKING** - Uses Vite alias that maps to `api-browser.js`
- **Path**: `import { api } from "../../convex/_generated/api"`
- **Resolution**: Vite config maps this to `./convex/_generated/api-browser.js`

### 3. ✅ All Shared Components Verified
- ✅ `PageTransition.jsx` - Exists and exports correctly
- ✅ `StarRating.jsx` - Exists and exports correctly  
- ✅ `LocationPicker.jsx` - Exists and exports correctly
- ✅ `StudioMap.jsx` - Exists and exports correctly
- ✅ `Inputs.jsx` - Exists with `MultiSelect` and `NestedSelect` exports
- ✅ `EquipmentAutocomplete.jsx` - Exists and exports correctly
- ✅ `UserAvatar.jsx` - Exists and exports correctly

### 4. ✅ All Hooks Verified
- ✅ `useFollowSystem.js` - Exports `useFollowSystem` and `useUserSocialStats`
- ✅ `useNotifications.js` - Exists
- ✅ `useImageUpload.js` - Exists
- ✅ `useDiscover.js` - Exists
- ✅ `useAppData.js` - Exists
- ✅ `useEquipmentDatabase.js` - Exists
- ✅ `useDynamicConfig.js` - Exists

### 5. ✅ All Utils Verified
- ✅ `recommendations.js` - Exists with `calculateUserSimilarity` export
- ✅ `geocode.js` - Exists with `fetchZipLocation` export
- ✅ `paymentUtils.js` - Exists with `handlePayout` export
- ✅ `moderation.js` - Exists
- ✅ `eduTime.js` - Exists with `formatHours` and `calculateDurationMinutes` exports
- ✅ `dataExport.js` - Exists with `exportToCSV` export

### 6. ✅ All Constants Verified
- ✅ `BOOKING_THRESHOLD` - Exists
- ✅ `STRIPE_PUBLIC_KEY` - Exists
- ✅ `SUBSCRIPTION_PLAN_KEYS` - Exists
- ✅ `PROFILE_SCHEMAS` - Exists
- ✅ `GENRE_DATA` - Exists
- ✅ `INSTRUMENT_DATA` - Exists
- ✅ `ACCOUNT_TYPES` - Exists
- ✅ `getDisplayRole` - Exists

### 7. ✅ All Contexts Verified
- ✅ `SchoolContext.jsx` - Exists with `SchoolProvider` export
- ✅ `EduAuthContext.jsx` - Exists with `EduAuthProvider` and `useEduAuth` exports
- ✅ `PlatformAdminContext.jsx` - Exists

### 8. ✅ All Routes Verified
- ✅ `AppRoutes.jsx` - Exists
- ✅ `RouteWrapper.jsx` - Exists

### 9. ✅ Firebase Adapters (Shims)
- ✅ All Firebase adapter files exist in `src/adapters/firebase/`
- ✅ Vite config properly maps Firebase imports to adapters
- ✅ These are intentional shims for legacy code

### 10. ✅ Convex Setup
- ✅ `convex/_generated/api-browser.js` - Exists (browser-safe version)
- ✅ `convex/_generated/api.js` - Exists (server version)
- ✅ Vite alias correctly maps imports
- ✅ `src/config/convex.js` - Exists with proper exports

## Recommendations

1. **Fix Logo Import Naming** (Optional):
   - In `src/components/AuthWizard.jsx`, either:
     - Rename `LogoDark` to `LogoWhite` if using white text version, OR
     - Change import to use dark version if `LogoDark` name is correct

2. **No Critical Issues Found**:
   - All imports appear to be working correctly
   - All referenced files exist
   - All exports are present
   - Vite aliases are properly configured

## Files to Review

- `src/components/AuthWizard.jsx` - Logo import naming (line 13)

## Testing Recommendations

1. Run `npm run build` to verify all imports resolve correctly
2. Check browser console for any runtime import errors
3. Verify all components render without "Module not found" errors

