# AuthWizard Complete - Routes and Supabase Integration

## Overview
The AuthWizard component has been fully updated to ensure complete Supabase integration with all required database entries created during signup and onboarding.

## Authentication Routes

### 1. Login Mode
- **Route**: `/login` (handled at App level)
- **Features**:
  - Email/password authentication
  - Google OAuth authentication
  - Password reset link
  - Redirects authenticated users to dashboard

### 2. Signup Mode (3 Steps)
- **Step 1**: Email & Password
  - Email validation
  - Password requirements (uppercase, lowercase, number, 6+ chars)
  - Continue button validates before proceeding
  
- **Step 2**: Name & Location
  - First name and last name
  - Zip code with map preview
  - Geolocation option
  - Back/Next navigation
  
- **Step 3**: Role Selection
  - Multiple role selection (Talent, Studio, Producer, etc.)
  - Talent sub-role selection (if Talent selected)
  - Complete Setup button

### 3. Onboarding Mode (OAuth Users)
- **Trigger**: New OAuth user (Google) without complete profile
- **Steps**: Same as signup (Name, Location, Roles)
- **Auto-detection**: Checks if profile has `account_types` before showing onboarding

### 4. Forgot Password Mode
- Email input
- Password reset link sent
- Back to login option

## Supabase Database Entries Created

### 1. Auth User (`auth.users`)
- Created via `supabase.auth.signUp()` for email/password
- Created via `supabase.auth.signInWithOAuth()` for Google OAuth
- User ID stored in `profiles.id`

### 2. Profile (`profiles` table)
**Fields Created:**
- `id` - User ID from auth
- `email` - User email
- `first_name` - First name
- `last_name` - Last name
- `zip_code` - Zip code (optional)
- `account_types` - Array of selected roles (e.g., ['Talent', 'Fan'])
- `active_role` - First selected role
- `preferred_role` - First selected role
- `talent_sub_role` - Sub-role if Talent selected (optional)
- `effective_display_name` - Calculated display name (firstName + lastName or fallback)
- `search_terms` - Array of lowercase searchable terms
- `settings` - Empty object `{}`
- `updated_at` - Current timestamp

**Calculation Logic:**
```javascript
effective_display_name = firstName && lastName 
  ? `${firstName} ${lastName}`
  : firstName || lastName || email.split('@')[0] || 'User'

search_terms = [
  firstName?.toLowerCase(),
  lastName?.toLowerCase(),
  effectiveDisplayName.toLowerCase(),
  activeRole?.toLowerCase(),
  talentSubRole?.toLowerCase()
].filter(Boolean)
```

### 3. Public Profile (`public_profiles` table)
- **Auto-synced** via database trigger `sync_public_profile()`
- Trigger fires on `profiles` INSERT/UPDATE
- Contains searchable public data for talent discovery
- Manually verified and re-triggered if missing

### 4. Wallet (`wallets` table)
- Created via `upsert` with `balance: 0`
- Uses `onConflict: 'user_id'` to prevent duplicates
- Non-blocking (errors logged but don't fail signup)

### 5. Sub-Profiles (`sub_profiles` table)
- Created for roles that require additional data:
  - `Talent`
  - `Studio`
  - `Producer`
  - `Technician`
- Structure:
  ```javascript
  {
    user_id: userId,
    role: roleName,
    data: {},
    updated_at: timestamp
  }
  ```
- Uses `upsert` with `onConflict: 'user_id,role'`

## Error Handling

### Profile Creation
1. **Try UPDATE first** - If profile exists (from trigger)
2. **Try INSERT** - If profile doesn't exist (PGRST116 error)
3. **Retry UPDATE** - If insert fails (trigger may have created it)
4. **Verify public_profiles** - Check if synced, re-trigger if needed

### Timeout Protection
- Profile update wrapped in `Promise.race()` with 5-second timeout
- Prevents hanging on slow database operations
- Continues even if profile operation fails (triggers handle it)

## OAuth Flow

### Google OAuth
1. User clicks "Continue with Google"
2. Redirects to Google OAuth
3. After callback, redirects to `/?intent=signup`
4. `App.jsx` detects new user and shows onboarding
5. User completes name, location, roles
6. Profile created with all required fields
7. Redirects to dashboard

## Signup Flow Completion

### Email/Password Signup
1. User completes all 3 steps
2. Account created via `supabase.auth.signUp()`
3. Profile created/updated with all data
4. Wallet and sub-profiles created
5. Check if session is active (auto-login)
6. If session active → redirect to dashboard
7. If no session → show login with email confirmation message

### OAuth Signup
1. User completes onboarding steps
2. Profile updated (user already exists from OAuth)
3. All database entries created
4. Session already active → redirect to dashboard

## Validation

### Step 1 (Email/Password)
- Email required
- Password must meet all requirements:
  - Uppercase letter
  - Lowercase letter
  - Number
  - 6+ characters

### Step 2 (Name/Location)
- First name required
- Zip code required (5 digits)
- Map preview shows location

### Step 3 (Roles)
- At least one role must be selected
- Talent sub-role optional if Talent selected

## Database Triggers

### `sync_public_profile()`
- Automatically creates/updates `public_profiles` on `profiles` changes
- Syncs: display_name, first_name, last_name, avatar_url, banner_url, zip_code, active_role, talent_sub_role, search_terms

### Profile Creation Trigger
- Automatically creates `profiles` entry when auth user is created
- Ensures profile exists even if client-side creation fails

## Testing Checklist

- [ ] Email/password signup creates all entries
- [ ] Google OAuth signup creates all entries
- [ ] Profile has `effective_display_name` and `search_terms`
- [ ] `public_profiles` is synced automatically
- [ ] Wallet is created with balance 0
- [ ] Sub-profiles created for Talent/Studio/Producer/Technician
- [ ] Onboarding flow works for OAuth users
- [ ] Login redirects authenticated users
- [ ] Password reset sends email
- [ ] All validation messages display correctly

## Next Steps

1. Test complete signup flow
2. Verify all database entries are created
3. Test OAuth onboarding flow
4. Verify public_profiles sync
5. Test role-based sub-profile creation

