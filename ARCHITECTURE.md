# Application Architecture

## Database & Services Overview

### Firebase Services
- **Firestore**: Main application database
  - User profiles
  - Posts, feeds
  - Marketplace items
  - Bookings
  - All non-chat data
  
- **Firebase Auth**: Authentication
  - User login/signup
  - Session management
  - User IDs (UIDs) used across all services
  
- **Firebase Storage**: File storage
  - Profile images
  - Media uploads
  - User-generated content

### Convex Services
- **Reactive Database**: Chat system only
  - Messages
  - Conversations
  - Presence (online/offline)
  - Read receipts
  - Chat members (for group chats)

## Why This Hybrid Approach?

✅ **Keep what works**: Firebase Firestore, Auth, and Storage are working well
✅ **Replace what's broken**: RTDB had initialization issues, Convex is built for real-time
✅ **No billing required**: Convex free tier covers chat needs (1M function calls/month)
✅ **Better performance**: Reactive database designed for real-time apps
✅ **Easier debugging**: TypeScript functions vs RTDB JSON structure
✅ **Real-time built-in**: No need to enable replication (unlike Supabase)

## Data Flow

### User Authentication
1. User logs in via Firebase Auth
2. Firebase returns user UID
3. UID is used for:
   - Firestore queries (user profiles, posts, etc.)
   - Convex queries (chat messages, conversations)
   - Storage access (file uploads)

### Chat Flow
1. User opens chat → Convex query for conversations (automatically reactive)
2. User selects conversation → Convex query for messages (automatically reactive)
3. User sends message → Convex mutation to insert message
4. Real-time update → All participants automatically see update (Convex reactivity)

### Main App Flow
1. User views dashboard → Firestore queries
2. User creates post → Firestore write
3. User uploads image → Firebase Storage
4. All authenticated via Firebase Auth

## Environment Variables

### Firebase (Vercel)
```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_FIREBASE_MEASUREMENT_ID
```

### Supabase (Vercel)
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

## Security Model

- **Firebase Auth**: Handles all authentication
- **Firestore**: Uses Firebase security rules
- **Firebase Storage**: Uses Firebase security rules
- **Convex**: Auth handled in application code (Firebase UID validation in mutations)

## Migration Status

- ✅ Firebase Firestore: Active
- ✅ Firebase Auth: Active
- ✅ Firebase Storage: Active
- ⏳ Convex Chat: Setup in progress
- ❌ Firebase RTDB: Being replaced by Convex

