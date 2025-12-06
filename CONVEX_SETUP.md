# Convex Setup Guide

## Quick Start

### 1. Create Convex Project
1. Go to https://convex.dev
2. Sign up / Login (free)
3. Click **"New Project"**
4. Fill in:
   - **Name**: `seshnx-chat` (or your choice)
   - **Region**: Choose closest to your users
5. Wait ~30 seconds for provisioning

### 2. Install Convex
```bash
npm install convex
```

### 3. Initialize Convex
```bash
npx convex dev
```

This will:
- Create `convex/` folder
- Generate `convex/_generated/` files
- Ask you to login (opens browser)
- Deploy your functions
- Give you a deployment URL

### 4. Get Your Deployment URL
After running `npx convex dev`, you'll see:
```
Deployment URL: https://xxxxx.convex.cloud
```

Copy this URL.

### 5. Add Environment Variable to Vercel
1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Add:
   ```
   CONVEX_DEPLOY_KEY=https://your-project.convex.cloud
   ```
   **Note**: Vercel uses `CONVEX_DEPLOY_KEY` (not `VITE_CONVEX_URL`)
3. Redeploy your project

### 6. Configure Convex
Create `convex.json` in project root:
```json
{
  "functions": "convex/"
}
```

## Schema Setup

The schema is already created in `convex/schema.ts`. After running `npx convex dev`, it will be automatically deployed.

## Functions

All functions are in:
- `convex/messages.ts` - Message operations
- `convex/conversations.ts` - Conversation operations  
- `convex/presence.ts` - Presence operations

## Real-time Usage

In your React components, use Convex hooks:

```typescript
import { useQuery } from "convex/react";
import { api } from "./convex/_generated/api";

// Real-time query (automatically reactive)
const messages = useQuery(api.messages.getMessages, { chatId: "chat123" });
```

## Benefits Over Supabase

- ✅ Real-time is built-in (not in alpha)
- ✅ No SQL needed (TypeScript functions)
- ✅ Automatic reactivity
- ✅ Type-safe queries
- ✅ Better developer experience
- ✅ Free tier: 1M function calls/month

## Next Steps

1. ✅ Run `npx convex dev` to initialize
2. ✅ Add `VITE_CONVEX_URL` to Vercel
3. ⏭️ Update chat components to use Convex (I can help)
4. ⏭️ Test chat functionality

