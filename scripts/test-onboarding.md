# 🧪 Onboarding Flow Test Plan

## Test the Fixed Onboarding Process

### Issue Fixed
- **Problem**: New users were skipping onboarding (account types, location, etc.)
- **Root Cause**: Clerk SignUp redirected to "/" without `intent=signup` parameter
- **Solution**: Modified SignUp URLs and added comprehensive new user detection

### What Changed

#### 1. AuthWizard.tsx (Line 370-371)
```tsx
// BEFORE:
<SignUp afterSignUpUrl="/" redirectUrl="/" />

// AFTER:
<SignUp afterSignUpUrl="/?intent=signup&new=true" redirectUrl="/?intent=signup&new=true" />
```

#### 2. App.tsx - Enhanced New User Detection
- Added `intent=onboarding` parameter support
- Added incomplete profile detection (missing account types, zip code)
- Added Clerk metadata check (`onboarding_completed`)
- Added automatic redirect to onboarding for incomplete profiles

### Test Cases

#### Test 1: New User Signup Flow
1. **Clear browser data** (cookies, localStorage)
2. **Navigate to app** → Should see AuthWizard
3. **Click "Sign Up"** → Should see Clerk SignUp form
4. **Complete Clerk signup** → Should redirect to onboarding (not home)
5. **Select account types** → Should see role selection
6. **Enter zip code** → Should see map preview
7. **Complete onboarding** → Should redirect to home/app
8. **Verify** → Profile should have account types and location

#### Test 2: Existing User with Incomplete Profile
1. **Sign in as existing user**
2. **Manually clear account types in database** (simulate incomplete profile)
3. **Refresh app** → Should redirect to onboarding
4. **Complete profile** → Should save and redirect to home

#### Test 3: User with Completed Onboarding
1. **Sign in as user with completed profile**
2. **Navigate to app** → Should go directly to home (no onboarding)
3. **Verify** → Account types and location should be preserved

### How to Test

#### Quick Test (Development)
```bash
# 1. Start dev server
npm run dev

# 2. Open browser in incognito mode
# 3. Navigate to http://localhost:5173
# 4. Try to access the app
# Expected: Should see AuthWizard (login/signup)

# 5. Click "Sign Up" and complete Clerk signup
# Expected: Should redirect to onboarding with URL parameters

# 6. Complete onboarding form
# Expected: Should create profile and redirect to home
```

#### URL Parameter Test
```bash
# Test onboarding trigger manually
http://localhost:5173/?intent=onboarding&new=true
# Expected: Should show onboarding form if authenticated
```

### Success Criteria

✅ **New users**: Complete full onboarding (roles + location)
✅ **Incomplete profiles**: Get redirected to onboarding
✅ **Complete profiles**: Skip onboarding, go to app
✅ **URL parameters**: Proper intent detection and cleanup
✅ **Profile data**: Account types and zip code saved correctly

### Debug Checklist

- [ ] SignUp redirects with `?intent=signup&new=true`
- [ ] AuthWizard shows onboarding steps for new users
- [ ] Profile saves account types to Neon
- [ ] Profile saves zip code to Neon
- [ ] MongoDB profile created with display name
- [ ] Clerk metadata updated with `onboarding_completed: true`
- [ ] After completion, URL parameters are cleared
- [ ] User redirected to home/app after onboarding
- [ ] Returning users skip onboarding

### Expected Flow

```
New User Access
    ↓
Clerk SignUp (with redirect parameters)
    ↓
AuthWizard (detects intent=signup)
    ↓
Onboarding Steps (roles + location)
    ↓
Profile Creation (Neon + MongoDB)
    ↓
Clerk Metadata Update (onboarding_completed)
    ↓
Redirect to Home/App
    ↓
Full Profile Available
```

### Files Modified

1. **src/components/AuthWizard.tsx**
   - Updated SignUp redirect URLs
   - Added intent parameter handling

2. **src/App.tsx**
   - Enhanced new user detection logic
   - Added incomplete profile detection
   - Added automatic onboarding redirect
   - Added exempt pages from onboarding check

3. **Onboarding Flow** - Now works for both:
   - New signups (from Clerk)
   - Existing users with incomplete profiles

---

**Status**: Ready for testing! The onboarding flow should now work correctly.