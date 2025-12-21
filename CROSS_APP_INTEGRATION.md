# Cross-App Integration Contract

> **📋 SHARED REFERENCE DOCUMENT**
> 
> This document serves as a **contract** between the Main App (`webapp-main`) and Business Center Module (`webapp-bcm`) to ensure consistent integration, shared data structures, and coordinated development.
> 
> **Both agents should reference this document when making changes that affect cross-app functionality.**

## App Structure

### Main App (`webapp-main`)
- **Domain**: `app.seshnx.com`
- **Repository**: `webapp-main`
- **Purpose**: User-facing application for all creators
- **Handles**: All user bookings, social features, marketplace, messaging

### Business Center Module (`webapp-bcm`)
- **Domain**: `bcm.seshnx.com`
- **Repository**: `webapp-bcm` (separate repository)
- **Purpose**: Business operations and studio management control center
- **Handles**: Studio operations, revenue management, analytics

## Shared Infrastructure

### Authentication
- **Provider**: Supabase Auth
- **Shared Sessions**: Single sign-on (SSO) across subdomains
- **Session Storage**: Cookies with `.seshnx.com` domain
- **Token Sharing**: JWT tokens accessible across subdomains

### Database
- **Provider**: Supabase PostgreSQL
- **Shared Tables**: Both apps read/write to same database
- **Key Tables**:
  - `profiles` - User profiles and account types
  - `bookings` - All booking records
  - `messages` - Direct messages
  - `transactions` - Payment records

### Environment Variables (Shared)
```env
# Supabase (MUST be identical in both apps)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe (MUST be identical in both apps)
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key

# Domain Configuration
VITE_MAIN_APP_URL=https://app.seshnx.com
VITE_BCM_URL=https://bcm.seshnx.com
```

## Data Contracts

### Booking Data Structure

**Table**: `bookings`

```typescript
interface Booking {
  id: string;                    // UUID
  sender_id: string;              // UUID - references profiles.id
  target_id: string;              // UUID - references profiles.id
  service_type: string;           // e.g., "Session", "Studio Time", "Mixing"
  date: string;                    // ISO timestamp
  duration: number;               // Hours (integer)
  status: BookingStatus;          // 'pending' | 'confirmed' | 'completed' | 'cancelled'
  offer_amount: number;           // Decimal (dollars)
  message?: string;               // Optional message
  project_genre?: string;        // Optional
  project_type?: string;          // Optional
  reference_links?: string;       // Optional
  created_at: string;            // ISO timestamp
  updated_at: string;            // ISO timestamp
}
```

**⚠️ IMPORTANT**: Both apps MUST use this exact structure. Any changes require coordination.

### Profile Data Structure

**Table**: `profiles`

```typescript
interface Profile {
  id: string;                      // UUID (matches auth.users.id)
  account_types: string[];         // ['Studio', 'Talent', 'Producer', etc.]
  studio_name?: string;            // For Studio accounts
  hourly_rate?: number;            // For Studio accounts
  day_rate?: number;              // For Studio accounts
  availability_status?: string;   // For Studio accounts
  // ... other fields
}
```

## Integration Points

### 1. Booking Flow

**Main App Responsibility**:
- Users create bookings via `BookingModal.jsx`
- Users view their bookings via `BookingSystem.jsx`
- All booking CRUD operations happen in main app

**BCM Responsibility**:
- Studio owners view bookings where `target_id = studio_owner_id`
- Studio owners can confirm/cancel bookings
- Studio owners see booking analytics

**Shared Logic**:
- Both apps query same `bookings` table
- Both apps use Supabase real-time subscriptions
- Status changes in one app reflect in the other immediately

### 2. Navigation

**Main App**:
- Sidebar shows "Business Center" link for business users
- Link navigates to `bcm.seshnx.com` (external)
- Or opens BCM in iframe/modal (if same-domain)

**BCM**:
- Header shows "Back to Main App" link
- Link navigates to `app.seshnx.com` (external)

### 3. User Context

**Shared User Data**:
- Both apps read from same `profiles` table
- User authentication state shared via cookies
- Account types determine feature access

**Main App Checks**:
```javascript
const hasBusinessFeatures = userData?.accountTypes?.some(t => 
  ['Studio', 'Label', 'Agent', 'Producer', 'Engineer'].includes(t)
);
```

**BCM Checks**:
```javascript
// Only allow access if user has business account type
if (!userData?.accountTypes?.some(t => 
  ['Studio', 'Label', 'Agent', 'Producer', 'Engineer', 'Talent'].includes(t)
)) {
  redirectToMainApp();
}
```

## API Contracts

### Supabase Queries

**Get User Bookings** (Used by both apps):
```javascript
// Main App: Get bookings where user is sender OR target
const { data: bookings } = await supabase
  .from('bookings')
  .select('*')
  .or(`sender_id.eq.${userId},target_id.eq.${userId}`)
  .order('date', { ascending: false });
```

**Get Studio Bookings** (BCM only):
```javascript
// BCM: Get bookings where studio is target
const { data: studioBookings } = await supabase
  .from('bookings')
  .select('*')
  .eq('target_id', studioOwnerId)
  .order('date', { ascending: false });
```

### Real-time Subscriptions

**Both apps should subscribe to booking changes**:
```javascript
const subscription = supabase
  .channel('bookings')
  .on('postgres_changes', {
    event: '*', // INSERT, UPDATE, DELETE
    schema: 'public',
    table: 'bookings',
    filter: `sender_id=eq.${userId} OR target_id=eq.${userId}`
  }, (payload) => {
    // Update local state
    handleBookingChange(payload);
  })
  .subscribe();
```

## Service Types Contract

**⚠️ CRITICAL**: Service types must be identical in both apps.

**Location**: `src/config/constants.js` (Main App) and equivalent in BCM

```javascript
export const SERVICE_TYPES = {
  general: ["Session", "Lesson", "Consultation", "Rehearsal", "Collaboration"],
  talent: ["Vocal Recording", "Feature Verse", "Background Vocals", ...],
  studio: ["Studio Time", "Mixing Session", "Mastering Session", ...],
  engineering: ["Mixing", "Mastering", "Recording", "Editing", ...],
  production: ["Beat Production", "Full Production", "Arrangement", ...],
  // ... other types
};
```

**Any changes to service types require updates in BOTH apps.**

## Account Types Contract

**⚠️ CRITICAL**: Account types must be identical in both apps.

```javascript
export const ACCOUNT_TYPES = [
  "Talent", "Engineer", "Producer", "Composer", "Studio", 
  "Technician", "Fan", "Label", "Agent", "GAdmin"
];
```

**Business Account Types** (for BCM access):
```javascript
export const BUSINESS_ACCOUNT_TYPES = [
  "Studio", "Label", "Agent", "Producer", "Engineer", "Talent"
];
```

## Breaking Change Protocol

### When Making Changes That Affect Both Apps:

1. **Document the Change**: Update this file with the change
2. **Update Both Apps**: Make changes in both repositories
3. **Test Integration**: Verify cross-app functionality still works
4. **Version Coordination**: If using versioning, bump versions together

### Example Breaking Changes:
- ✅ Adding new booking status
- ✅ Modifying booking data structure
- ✅ Adding new service types
- ✅ Changing account type names
- ❌ Removing fields from bookings table (requires migration)
- ❌ Changing authentication flow (requires coordination)

## Communication Protocol

### When Main App Agent Makes Changes:

**If change affects bookings, profiles, or shared data**:
1. Check this document for contract requirements
2. Update BCM documentation if needed
3. Note any breaking changes in commit message
4. Reference this document: `See CROSS_APP_INTEGRATION.md`

### When BCM Agent Makes Changes:

**If change affects shared data or integration**:
1. Check this document for contract requirements
2. Verify Main App compatibility
3. Update Main App if needed
4. Reference this document: `See CROSS_APP_INTEGRATION.md`

## Testing Checklist

### Cross-App Integration Tests:

- [ ] User can create booking in Main App
- [ ] Booking appears in BCM for studio owner
- [ ] Studio owner can confirm booking in BCM
- [ ] Status change reflects in Main App immediately
- [ ] User authentication works across subdomains
- [ ] Navigation between apps works correctly
- [ ] Service types are consistent
- [ ] Account types are consistent

## Version History

| Date | Change | Affected Apps |
|------|--------|---------------|
| 2024-12 | Initial contract | Main App, BCM |

---

**Last Updated**: December 2024  
**Maintained By**: Both development teams  
**Review Frequency**: Before any breaking changes

