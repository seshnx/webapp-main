# Studio Business Workflow - Code Flaws Analysis

## Critical Issues

### 1. **Database Field Mismatch & Missing Fallback** ⚠️ CRITICAL
**File**: `src/components/studio/StudioBookings.jsx` (Lines 68, 89)

**Problem**: 
- Uses `studio_owner_id` filter, but this field is nullable in the schema
- Many bookings may have `target_id` instead of `studio_owner_id`
- Studio won't see bookings where `studio_owner_id` is NULL

**Code**:
```javascript
.eq('studio_owner_id', userId)  // Line 89
filter: `studio_owner_id=eq.${userId}`  // Line 68
```

**Fix**:
```javascript
.or(`studio_owner_id.eq.${userId},target_id.eq.${userId}`)
```

---

### 2. **Missing Payment Processing on Confirmation** ⚠️ CRITICAL
**File**: `src/components/studio/StudioBookings.jsx` (Line 160-187)

**Problem**: 
- When studio confirms a booking, no payment is processed
- Payment intent may exist but is never captured/confirmed
- Studio can confirm without payment, leading to unpaid bookings

**Current Code**:
```javascript
const handleUpdateStatus = async (bookingId, newStatus) => {
    // ... only updates status, no payment handling
    const updateData = {
        status: newStatus,
        updated_at: now,
        [`${newStatus}_at`]: now
    };
    // Missing: Payment capture/confirmation logic
}
```

**Fix Required**:
- Check if `payment_intent_id` exists
- Capture payment when status changes to 'confirmed'
- Handle payment failures gracefully

---

### 3. **Dynamic Column Names Without Validation** ⚠️ HIGH
**File**: `src/components/studio/StudioBookings.jsx` (Line 170)

**Problem**: 
- Uses dynamic property `[${newStatus}_at]` which may not exist in database
- Will fail silently or cause SQL errors if columns don't exist
- No validation that status is valid

**Code**:
```javascript
[`${newStatus}_at`]: now  // Could be 'invalid_at', 'random_at', etc.
```

**Fix**:
```javascript
const statusTimestampFields = {
    confirmed: 'confirmed_at',
    cancelled: 'cancelled_at',
    completed: 'completed_at',
    pending: 'pending_at'
};

const updateData = {
    status: newStatus,
    updated_at: now,
    ...(statusTimestampFields[newStatus] && { [statusTimestampFields[newStatus]]: now })
};
```

---

### 4. **No Status Transition Validation** ⚠️ HIGH
**File**: `src/components/studio/StudioBookings.jsx` (Line 160-187)

**Problem**: 
- Allows invalid transitions (e.g., `completed` → `pending`, `cancelled` → `confirmed`)
- No business logic validation
- Can create inconsistent booking states

**Fix Required**:
```javascript
const validTransitions = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['completed', 'cancelled'],
    completed: [], // Terminal state
    cancelled: [] // Terminal state
};

if (!validTransitions[currentStatus]?.includes(newStatus)) {
    throw new Error(`Invalid status transition: ${currentStatus} → ${newStatus}`);
}
```

---

### 5. **Missing Refund Logic on Cancellation** ⚠️ HIGH
**File**: `src/components/studio/StudioBookings.jsx` (Line 160-187)

**Problem**: 
- When cancelling a confirmed booking, no refund is processed
- Payment may have been captured but no refund issued
- Financial inconsistency

**Fix Required**:
- Check if payment was captured
- Process refund via Stripe API
- Update transaction records
- Notify user of refund

---

### 6. **Date Handling Issues** ⚠️ MEDIUM
**File**: `src/components/studio/StudioBookings.jsx` (Multiple locations)

**Problem**: 
- Assumes `booking.date` is always a valid date
- Can be string "Flexible" which breaks `new Date(b.date)`
- `toDateString()` called on potentially invalid dates

**Locations**:
- Line 100: `date: b.date ? new Date(b.date) : new Date()`
- Line 257: `booking.date.toDateString()`
- Line 267: `b.date.toDateString()`
- Line 426: `new Date(b.date)`

**Fix**:
```javascript
const parseBookingDate = (dateValue) => {
    if (!dateValue || dateValue === 'Flexible') return null;
    const parsed = new Date(dateValue);
    return isNaN(parsed.getTime()) ? null : parsed;
};
```

---

### 7. **Missing Client Notifications** ⚠️ MEDIUM
**File**: `src/components/studio/StudioBookings.jsx` (Line 160-187)

**Problem**: 
- No notifications sent to client when status changes
- Client won't know booking was confirmed/cancelled
- Poor user experience

**Fix Required**:
- Send email/push notification on status change
- Update client's booking view in real-time
- Use Supabase real-time subscriptions

---

### 8. **No Conflict Checking** ⚠️ MEDIUM
**File**: `src/components/studio/StudioBookings.jsx` (Line 160-187)

**Problem**: 
- Doesn't check for double bookings
- Can confirm overlapping time slots
- No validation against blocked dates

**Fix Required**:
```javascript
// Before confirming, check:
// 1. No other confirmed bookings at same time
// 2. Not in blocked_dates
// 3. Within studio operating hours
```

---

### 9. **Missing Error Handling** ⚠️ MEDIUM
**File**: `src/components/studio/StudioBookings.jsx` (Multiple locations)

**Problems**:
- Line 105: Only logs error, doesn't show user feedback
- Line 155: Same issue
- No retry logic for failed operations
- No rollback on partial failures

**Fix**: Add proper error handling with user feedback and retry mechanisms

---

### 10. **Inconsistent Field Names** ⚠️ LOW
**File**: `src/components/studio/StudioBookings.jsx` (Lines 97-99)

**Problem**: 
- Maps `client_id` and `client_name` but schema uses `sender_id`/`sender_name`
- Inconsistent field access throughout component

**Code**:
```javascript
clientId: b.client_id,      // May not exist
clientName: b.client_name,  // May not exist
```

**Fix**: Use correct schema fields or add fallbacks:
```javascript
clientId: b.sender_id,
clientName: b.sender_name,
```

---

### 11. **Missing State Initialization** ⚠️ LOW
**File**: `src/components/studio/StudioBookings.jsx` (Line 41)

**Problem**: 
- `bookings` state is used but not initialized in visible code
- May cause undefined errors

**Fix**: Ensure state is properly initialized:
```javascript
const [bookings, setBookings] = useState([]);
```

---

### 12. **No Loading States for Async Operations** ⚠️ LOW
**File**: `src/components/studio/StudioBookings.jsx`

**Problem**: 
- `handleUpdateStatus` doesn't prevent double-clicks
- No loading indicator during status updates
- User can spam confirm/cancel buttons

**Fix**: Already has `updating` state but should disable buttons more comprehensively

---

## Additional Issues in Related Files

### 13. **StudioManager.jsx - Wrong Query Field**
**File**: `src/components/StudioManager.jsx` (Line 52)

**Problem**: Uses `target_id` but should also check `studio_owner_id`:
```javascript
.eq('target_id', userId)  // May miss bookings
```

---

### 14. **Missing Payment Webhook Integration**
**File**: `api/stripe/webhook.js`

**Problem**: 
- Webhook handlers are TODOs
- Payment confirmations not processed
- No booking status updates from payment events

---

## Recommended Fix Priority

1. **IMMEDIATE**: Fix database field mismatch (#1)
2. **IMMEDIATE**: Add payment processing on confirmation (#2)
3. **HIGH**: Add status transition validation (#4)
4. **HIGH**: Add refund logic (#5)
5. **MEDIUM**: Fix date handling (#6)
6. **MEDIUM**: Add conflict checking (#8)
7. **MEDIUM**: Add notifications (#7)
8. **LOW**: Fix other minor issues

---

## Testing Recommendations

1. Test booking confirmation with/without payment
2. Test status transitions (valid and invalid)
3. Test date handling with "Flexible" dates
4. Test double booking scenarios
5. Test cancellation with refunds
6. Test with NULL `studio_owner_id` bookings

