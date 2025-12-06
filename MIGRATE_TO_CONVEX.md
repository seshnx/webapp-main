# Migration from Firebase RTDB to Convex

## Why Convex?
- ✅ **Built for real-time**: Reactive database designed for real-time apps
- ✅ **No setup needed**: Real-time works out of the box
- ✅ **Free tier**: 1M function calls/month, 1GB storage
- ✅ **TypeScript-first**: Full type safety
- ✅ **Easy Vercel integration**: Works seamlessly
- ✅ **No billing required**: Free tier covers chat needs
- ✅ **Better than RTDB**: More reliable, better performance

## Architecture
**Hybrid Setup:**
- **Firebase**: Firestore (main database), Auth, Storage
- **Convex**: Chat/RTDB replacement (real-time messaging)

## Setup Steps

### 1. Create Convex Project
1. Go to https://convex.dev
2. Sign up / Login
3. Click "New Project"
4. Name: `seshnx-chat` (or your choice)
5. Wait ~30 seconds for provisioning

### 2. Install Convex
```bash
npm install convex
npx convex dev
```

### 3. Get Your Credentials
After running `npx convex dev`, you'll get:
- Deployment URL (e.g., `https://xxxxx.convex.cloud`)
- Dashboard URL

### 4. Add Environment Variables to Vercel
```
VITE_CONVEX_URL=https://your-project.convex.cloud
```

### 5. Set Up Schema
Convex uses TypeScript schemas - we'll create:
- `messages.ts` - Chat messages
- `conversations.ts` - User conversation lists
- `presence.ts` - Online/offline status

## Benefits Over Supabase

- ✅ Real-time is built-in (not in alpha)
- ✅ No SQL needed (TypeScript functions)
- ✅ Automatic reactivity
- ✅ Better developer experience
- ✅ Type-safe queries

## Migration Benefits

- No billing required (free tier)
- Real-time works immediately
- Better reliability than RTDB
- Type-safe database
- Easy to debug

