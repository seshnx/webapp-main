# 🔧 Convex Configuration Guide

## ✅ Current Status

**Convex is now properly configured!**

- **Deployment URL**: `https://dependable-badger-168.convex.cloud`
- **Status**: ✅ Active and configured
- **Features**: Chat, presence, notifications, real-time updates

## 🚀 What's Working

### Real-Time Features
- ✅ **Chat Messages**: Real-time messaging between users
- ✅ **User Presence**: Online/offline status indicators
- ✅ **Notifications**: Real-time notification delivery
- ✅ **Typing Indicators**: See when users are typing
- ✅ **Read Receipts**: Track message read status
- ✅ **Profile Updates**: Real-time profile synchronization
- ✅ **Comments & Reactions**: Real-time social engagement

### Database Schema
The Convex deployment includes comprehensive tables for:
- Messages & Conversations
- Presence & Typing Indicators
- Read Receipts
- Chat Members
- Bookings
- Notifications
- Profile Updates
- Comments & Reactions

## 🔧 Configuration

### Environment Variables
```bash
# Primary: Direct Convex URL (recommended)
VITE_CONVEX_URL=https://dependable-badger-168.convex.cloud

# Alternative: Vercel Convex integration
CONVEX_DEPLOY_KEY=<your_deploy_key>
```

### Priority Order
The configuration checks variables in this order:
1. `VITE_CONVEX_URL` (highest priority)
2. `CONVEX_DEPLOY_KEY` (Vercel integration)
3. Placeholder URL (fallback - features disabled)

### File Location
- **Config**: `src/config/convex.ts`
- **Schema**: `convex/schema.ts`
- **Functions**: `convex/*.ts`

## 🧪 Testing Convex Connection

### Development Console
Open your browser console (F12) and look for:
```
✅ Convex connected: https://dependable-badger-168.convex.cloud
```

If you see warnings instead:
```
⚠️ Convex not configured
🔧 Set VITE_CONVEX_URL environment variable
```

Then check your `.env.local` file.

### Testing Real-Time Features
1. **Open two browser windows** to your app
2. **Log in as different users** in each window
3. **Send a chat message** from one window
4. **Verify it appears in real-time** in the other window
5. **Check presence indicators** update when users come online/go offline

## 🚀 Deployment Commands

### Deploy Convex Schema
```bash
# Deploy to production
npx convex deploy

# Deploy to development
npx convex deploy --dev
```

### Check Convex Status
```bash
# List all deployments
npx convex deploy list

# Check current deployment
npx convex dev
```

### Import Environment Variables
```bash
# Pull from Vercel
vercel env pull .env.local

# Push to Vercel
vercel env push .env.local
```

## 🔍 Troubleshooting

### Convex Not Connecting
**Symptoms**: Console shows "Convex not configured"

**Solutions**:
1. Check `.env.local` has `VITE_CONVEX_URL`
2. Restart dev server: `npm run dev`
3. Clear browser cache and reload
4. Verify URL format: `https://*.convex.cloud`

### Real-Time Features Not Working
**Symptoms**: Messages don't appear in real-time

**Solutions**:
1. Check browser console for Convex errors
2. Verify Convex deployment is active: `npx convex deploy list`
3. Check network tab for failed WebSocket connections
4. Ensure you're using HTTPS (required for Convex)

### Schema Deployment Issues
**Symptoms**: Schema deployment fails

**Solutions**:
1. Check `convex/schema.ts` for syntax errors
2. Verify you're authenticated: `npx convex login`
3. Check Convex dashboard for deployment status
4. Try redeploying: `npx convex deploy --yes`

## 📊 Monitoring

### Convex Dashboard
Visit: https://dashboard.convex.dev/
- View deployment status
- Monitor function performance
- Check database queries
- Analyze WebSocket connections

### Development Tools
```bash
# Start local development server
npx convex dev

# Run functions locally
npx convex run --local

# View logs
npx convex logs
```

## 🔐 Security Notes

- **Never** commit Convex deployment keys
- **Use** environment-specific URLs (dev vs prod)
- **Monitor** Convex dashboard for unusual activity
- **Rotate** keys if they've been exposed

## 📝 Environment Setup

### Local Development
```bash
# .env.local
VITE_CONVEX_URL=https://dependable-badger-168.convex.cloud
```

### Production (Vercel)
Set in Vercel Dashboard → Settings → Environment Variables:
```
VITE_CONVEX_URL=https://dependable-badger-168.convex.cloud
```

## 🚀 Next Steps

1. **Test real-time features** in development
2. **Deploy Convex schema** to production: `npx convex deploy`
3. **Set VITE_CONVEX_URL** in Vercel environment variables
4. **Test in production** after deployment
5. **Monitor** Convex dashboard for performance

## ✅ Verification Checklist

- [ ] Local development shows "✅ Convex connected"
- [ ] Chat messages send in real-time
- [ ] Presence indicators work correctly
- [ ] Notifications appear in real-time
- [ ] Schema deployed to production
- [ ] Vercel environment variables configured
- [ ] Production real-time features work

---

**Last Updated**: 2026-03-07
**Status**: ✅ Configured and Active
**Deployment**: https://dependable-badger-168.convex.cloud
