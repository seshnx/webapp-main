# Complete Data Distribution Strategy

## 📊 **Architecture Overview**

SeshNx uses a **tri-database architecture** optimized for data characteristics:

```
┌─────────────────────────────────────────────────────────────┐
│                  SESHNX DATA LAYER                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  NEON (PostgreSQL)      MONGODB           CONVEX            │
│  ┌─────────────────┐   ┌──────────────┐   ┌─────────────┐  │
│  │ Immutable Data  │   │ Flexible Data │   │ Real-Time    │  │
│  ├─────────────────┤   ├──────────────┤   ├─────────────┤  │
│  │ Legal Identity  │   │ Profile Names │   │ Presence     │  │
│  │ Addresses       │   │ Active Roles  │   │ Typing       │  │
│  │ Financial Recs  │   │ Preferences   │   │ Messages     │  │
│  │ Audit Trail     │   │ Social Links  │   │ Sessions     │  │
│  │ Compliance      │   │ Portfolio     │   │ Activity     │  │
│  └─────────────────┘   └──────────────┘   └─────────────┘  │
│         ▲                     ▲                  ▲          │
│         │                     │                  │          │
│         └─────────────────────┴──────────────────┘          │
│                     UNIFIED LAYER                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 **Data Distribution Rules**

### **When to use Neon (PostgreSQL)**

✅ **Use Neon for:**
- Legal identity (first_name, last_name - immutable)
- Addresses (billing, shipping, studio location)
- Financial data (payments, invoices, receipts)
- Audit trail (status changes, timestamps)
- Compliance data (KYC, tax info, terms accepted)
- Core bookings (transactions, dates, pricing)
- Data that requires ACID guarantees
- Data that needs strong consistency
- Data with regulatory requirements

❌ **Don't use Neon for:**
- Frequently changing display names
- User preferences (theme, notifications)
- Social links (flexible arrays)
- Portfolio items (unstructured)
- Custom fields (studio-specific)
- Data that changes frequently

### **When to use MongoDB**

✅ **Use MongoDB for:**
- Display identity (artist name, username, @handle)
- Active profiles (role switching, sub-profiles)
- User preferences (notifications, theme, language)
- Social & creative (bio, genres, skills, portfolio)
- Dynamic data (equipment inventory, availability)
- Custom fields (studio-specific requirements)
- Data that changes frequently
- Data with flexible schema
- Data that varies by user type

❌ **Don't use MongoDB for:**
- Financial transactions (use Neon)
- Legal identity (use Neon)
- Audit trail (use Neon)
- Data requiring ACID guarantees (use Neon)

### **When to use Convex**

✅ **Use Convex for:**
- Online/offline status (presence)
- Typing indicators
- Live chat messages
- Real-time notifications
- Active sessions (collaboration)
- Activity feed (live updates)
- Dashboard stats (real-time counts)
- Push notification tokens
- Data that needs instant sync
- Data with temporary state

❌ **Don't use Convex for:**
- Permanent records (use Neon)
- User profiles (use MongoDB)
- Financial data (use Neon)
- Large datasets (Convex is for small, real-time data)

## 📋 **Complete Data Mapping**

### **User Profile Data**

| Field | Database | Reason |
|-------|----------|--------|
| `first_name` | Neon | Legal name, immutable |
| `last_name` | Neon | Legal name, immutable |
| `email` | Neon | Verified, legal identity |
| `phone` | Neon | Verified, legal identity |
| `display_name` | MongoDB | Artist name, flexible |
| `username` | MongoDB | @handle, flexible |
| `profile_handle` | MongoDB | URL slug, flexible |
| `bio` | MongoDB | Rich text, flexible |
| `tagline` | MongoDB | Short description, flexible |
| `billing_address` | Neon | Legal address, financial |
| `shipping_address` | Neon | Legal address, financial |
| `active_profile` | MongoDB | Changes frequently |
| `sub_profiles` | MongoDB | Flexible array, varies by user |
| `notification_settings` | MongoDB | Flexible, user-defined |
| `social_links` | MongoDB | Flexible array |
| `genres` | MongoDB | Tags, flexible |
| `skills` | MongoDB | Tags, flexible |
| `portfolio` | MongoDB | Unstructured, flexible |

### **Booking Data**

| Field | Database | Reason |
|-------|----------|--------|
| `id` | Neon | Core transaction, UUID |
| `sender_id` | Neon | Core transaction |
| `target_id` | Neon | Core transaction |
| `service_type` | Neon | Core transaction |
| `status` | Neon | Audit trail |
| `start_time` | Neon | Core transaction |
| `end_time` | Neon | Core transaction |
| `agreed_price` | Neon | Financial data |
| `payment_status` | Neon | Financial data |
| `equipment_preferences` | MongoDB | Flexible, studio-specific |
| `engineer_notes` | MongoDB | Flexible, optional |
| `custom_fields` | MongoDB | Studio-specific |

### **Real-Time Data**

| Data | Database | Reason |
|------|----------|--------|
| `online_status` | Convex | Real-time presence |
| `typing_indicator` | Convex | Real-time, temporary |
| `live_messages` | Convex | Real-time chat |
| `unread_counts` | Convex | Real-time stats |
| `active_sessions` | Convex | Collaboration, temporary |
| `push_tokens` | Convex | Real-time notifications |

## 🔧 **Implementation Examples**

### **Creating a User Profile**

```typescript
// 1. Create core profile in Neon (immutable)
const neonUser = await createNeonUser({
  first_name: 'John',
  last_name: 'Smith',
  email: 'john@example.com',
  phone: '+1234567890',
  billing_address: {
    street_line1: '123 Main St',
    city: 'New York',
    state: 'NY',
    postal_code: '10001',
    country: 'USA',
  },
  kyc_verified: false,
});

// 2. Create flexible profile in MongoDB
const mongoProfile = await createMongoProfile({
  user_id: neonUser.id,
  display_name: 'Johnny Beats',
  username: '@johnnybeats',
  profile_handle: 'johnnybeats',
  bio: 'Music producer specializing in hip-hop and R&B',
  active_profile: 'producer',
  sub_profiles: [
    { id: '1', type: 'producer', name: 'Producer', is_active: true },
    { id: '2', type: 'engineer', name: 'Engineer', is_active: false },
  ],
  notification_settings: {
    email: { bookings: true, messages: true, promotions: false },
    push: { bookings: true, messages: true },
  },
  social_links: [
    { platform: 'instagram', url: 'https://instagram.com/johnnybeats' },
    { platform: 'soundcloud', url: 'https://soundcloud.com/johnnybeats' },
  ],
  genres: ['Hip-Hop', 'R&B', 'Trap'],
  skills: ['Mixing', 'Mastering', 'Beat Production'],
});

// 3. Set online status in Convex (real-time)
await setEnhancedPresence({
  userId: neonUser.id,
  status: 'online',
  deviceInfo: {
    type: 'desktop',
    browser: 'Chrome',
  },
});
```

### **Creating a Booking**

```typescript
// 1. Create core booking in Neon (financial)
const neonBooking = await createNeonBooking({
  sender_id: userId,
  target_id: studioId,
  service_type: 'Session Recording',
  start_time: new Date('2024-03-15T10:00:00Z'),
  end_time: new Date('2024-03-15T18:00:00Z'),
  agreed_price: 500,
  payment_status: 'pending',
});

// 2. Store flexible metadata in MongoDB
const mongoMetadata = await createBookingMetadata({
  booking_id: neonBooking.id,
  studio_id: studioId,
  equipment_preferences: ['Neumann U87', 'API Preamp'],
  engineer_notes: 'Looking for warm vintage sound',
  custom_fields: {
    vibe: 'vintage',
    tempo: '120 BPM',
    key: 'C minor',
  },
});

// 3. Create real-time notification in Convex
await createNotification({
  user_id: studioId,
  type: 'booking',
  title: 'New Booking Request',
  message: 'Johnny Beats wants to book a session',
  action_url: `/bookings/${neonBooking.id}`,
});

// 4. Update unread counts in Convex
await refreshUnreadCounts({ userId: studioId });
```

### **Updating User Presence**

```typescript
// When user comes online
await setEnhancedPresence({
  userId: user.id,
  status: 'online',
  deviceInfo: {
    type: 'desktop',
    browser: navigator.userAgent,
  },
  activeProfile: user.mongo_profile.active_profile,
});

// When user joins a session
await joinActiveSession({
  sessionId: 'session-123',
  userId: user.id,
  displayName: user.mongo_profile.display_name,
  role: 'guest',
});

// When user starts typing
await setTyping({
  conversationId: 'conv-456',
  userId: user.id,
  displayName: user.mongo_profile.display_name,
  isTyping: true,
});
```

## 🚀 **Performance Considerations**

### **Neon (PostgreSQL)**
- ✅ ACID guarantees for transactions
- ✅ Strong consistency
- ✅ Complex queries with JOINs
- ✅ Indexes for fast lookups
- ⚠️ Schema migrations required
- ⚠️ Vertical scaling limits

### **MongoDB**
- ✅ Flexible schema (no migrations)
- ✅ Horizontal scaling (sharding)
- ✅ Fast document reads
- ✅ Rich query capabilities
- ⚠️ No ACID guarantees (use Neon for financial)
- ⚠️ Eventual consistency

### **Convex**
- ✅ Real-time synchronization
- ✅ Automatic conflict resolution
- ✅ Built-in authentication
- ✅ Serverless (auto-scaling)
- ⚠️ Small datasets (<10MB per doc)
- ⚠️ Temporary state only

## 🔍 **Query Patterns**

### **Get Complete User Profile**

```typescript
async function getCompleteUser(userId: string) {
  // Parallel queries for speed
  const [neonUser, mongoProfile, convexPresence] = await Promise.all([
    // Neon: Core identity
    getNeonUser(userId),

    // MongoDB: Flexible profile
    getMongoUserProfile(userId),

    // Convex: Real-time status
    getEnhancedPresence(userId),
  ]);

  // Merge into complete profile
  return {
    // From Neon
    id: neonUser.id,
    first_name: neonUser.first_name,
    last_name: neonUser.last_name,
    email: neonUser.email,

    // From MongoDB
    display_name: mongoProfile.display_name,
    username: mongoProfile.username,
    active_profile: mongoProfile.active_profile,
    bio: mongoProfile.bio,

    // From Convex
    online_status: convexPresence?.status || 'offline',
    last_seen: convexPresence?.lastSeen,
  };
}
```

### **Update User Display Name**

```typescript
async function updateDisplayName(userId: string, newName: string) {
  // Only update MongoDB (not Neon)
  await updateMongoUserProfile(userId, {
    display_name: newName,
  });

  // Notify followers in real-time (Convex)
  await addActivity({
    userId,
    actionType: 'profile_updated',
    metadata: { field: 'display_name', new_value: newName },
  });
}
```

### **Process Payment**

```typescript
async function processPayment(bookingId: string, amount: number) {
  // 1. Create payment record in Neon (financial)
  const payment = await createNeonPayment({
    booking_id: bookingId,
    amount,
    currency: 'USD',
    stripe_payment_intent_id: stripeIntent.id,
    status: 'succeeded',
  });

  // 2. Update booking status in Neon
  await updateNeonBookingStatus(bookingId, 'Confirmed');

  // 3. Store receipt URL in MongoDB (flexible)
  await updateBookingMetadata(bookingId, {
    receipt_url: payment.receipt_url,
    invoice_pdf: payment.invoice_url,
  });

  // 4. Send real-time notification (Convex)
  await createNotification({
    user_id: booking.target_id,
    type: 'payment',
    title: 'Payment Received',
    message: `Payment of $${amount} confirmed`,
  });

  // 5. Update dashboard stats (Convex)
  await updateDashboardStats(booking.target_id, {
    todayRevenue: amount,
  });
}
```

## 📚 **Best Practices**

### **1. Always Use Transactions for Financial Data**
```typescript
// ✅ GOOD - Use Neon for payments
await createNeonPayment({ amount, status });

// ❌ BAD - Don't use MongoDB for financial data
await mongoCollection.payments.insertOne({ amount, status });
```

### **2. Use MongoDB for Frequently Changing Data**
```typescript
// ✅ GOOD - MongoDB for display names
await updateMongoProfile(userId, { display_name: 'New Name' });

// ❌ BAD - Don't use Neon for display names
await updateNeonUser(userId, { display_name: 'New Name' });
```

### **3. Use Convex for Real-Time Features**
```typescript
// ✅ GOOD - Convex for typing indicators
await setTyping({ userId, isTyping: true });

// ❌ BAD - Don't use Neon/MongoDB for typing
await updateNeonUser(userId, { is_typing: true }); // Too slow!
```

### **4. Parallel Queries for Performance**
```typescript
// ✅ GOOD - Parallel queries
const [neon, mongo, convex] = await Promise.all([...]);

// ❌ BAD - Sequential queries
const neon = await getNeon();
const mongo = await getMongo();
const convex = await getConvex();
```

### **5. Cache Frequently Accessed Data**
```typescript
// Cache MongoDB profile data (it changes infrequently)
const profile = await cache.get(`profile:${userId}`);
if (!profile) {
  const fresh = await getMongoUserProfile(userId);
  await cache.set(`profile:${userId}`, fresh, 300); // 5 min
}

// Don't cache Convex data (it's already real-time)
const presence = await getEnhancedPresence(userId);
```

## 🎯 **Summary**

| Use Case | Database | Why? |
|----------|----------|------|
| Legal names | Neon | Immutable, compliance |
| Addresses | Neon | Financial, legal |
| Payments | Neon | ACID, audit trail |
| Display names | MongoDB | Flexible, changes often |
| Preferences | MongoDB | User-defined, flexible |
| Online status | Convex | Real-time, temporary |
| Typing indicators | Convex | Real-time, temporary |
| Messages | Convex | Real-time chat |
| Custom fields | MongoDB | Studio-specific, flexible |

This architecture gives you:
- ✅ **Financial safety** (Neon ACID)
- ✅ **Unlimited flexibility** (MongoDB schema-less)
- ✅ **Real-time sync** (Convex automatic)
- ✅ **Regulatory compliance** (Neon audit trail)
- ✅ **Scalability** (all three scale horizontally)

---

**Last Updated:** 2026-03-05
**Version:** 2.0 (Enhanced with Convex)
