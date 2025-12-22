# Vercel Marketplace Integrations Setup Guide

This guide covers setting up native Vercel integrations to eliminate workarounds and improve reliability.

## 🚀 Immediate Integrations (Recommended)

### 1. Stripe Payment Integration ⭐ NEW

**Why:** Native Stripe integration for secure payment processing without custom backend setup.

**Setup Steps:**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project → **Settings** → **Integrations**
3. Search for **"Stripe"** in the marketplace
4. Click **"Add Integration"**
5. Follow the setup wizard:
   - Connect your Stripe account (or create one at [stripe.com](https://stripe.com))
   - Vercel will automatically set environment variables:
     - `STRIPE_SECRET_KEY` (server-side, for API routes)
     - `VITE_STRIPE_PUBLISHABLE_KEY` (client-side, for Stripe.js)
   - Optionally set `STRIPE_WEBHOOK_SECRET` for webhook verification

**Benefits:**
- ✅ Automatic environment variable management
- ✅ Secure key handling (secret key never exposed to client)
- ✅ Native dashboard integration
- ✅ Automatic webhook handling
- ✅ No need for Supabase Edge Functions

**After Setup:**
- API routes are already created in `/api/stripe/`
- See `VERCEL_STRIPE_SETUP.md` for detailed setup instructions
- Redeploy your application to pick up the new variables

---

### 2. Supabase Native Integration

**Why:** Eliminates manual environment variable management and improves session handling.

**Setup Steps:**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project → **Settings** → **Integrations**
3. Search for **"Supabase"** in the marketplace
4. Click **"Add Integration"**
5. Follow the setup wizard:
   - Connect your Supabase project (or create a new one)
   - Vercel will automatically set environment variables:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
   - Optionally set `VITE_SUPABASE_SERVICE_ROLE_KEY` for server-side operations

**Benefits:**
- ✅ Automatic environment variable management
- ✅ Better session persistence handling
- ✅ Native dashboard integration
- ✅ Automatic updates when Supabase project changes

**After Setup:**
- No code changes needed - the app will automatically use the new environment variables
- Redeploy your application to pick up the new variables

---

### 2. Sentry Error Monitoring

**Why:** Replaces manual error handling with professional error tracking and performance monitoring.

**Setup Steps:**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project → **Settings** → **Integrations**
3. Search for **"Sentry"** in the marketplace
4. Click **"Add Integration"**
5. Follow the setup wizard:
   - Connect your Sentry account (or create one at [sentry.io](https://sentry.io))
   - Select your Sentry project
   - Vercel will automatically set:
     - `VITE_SENTRY_DSN`
     - `SENTRY_ORG`
     - `SENTRY_PROJECT`
     - `SENTRY_AUTH_TOKEN`

**Benefits:**
- ✅ Automatic error capture and reporting
- ✅ Performance monitoring
- ✅ Session replay for debugging
- ✅ Real-time error alerts
- ✅ Source map upload for better stack traces

**After Setup:**
- Sentry is already configured in `src/main.jsx`
- Errors will automatically be sent to Sentry
- View errors in your Sentry dashboard

**Manual Setup (Alternative):**

If you prefer to set up Sentry manually:

1. Create a project at [sentry.io](https://sentry.io)
2. Get your DSN from the project settings
3. Add to Vercel environment variables:
   ```
   VITE_SENTRY_DSN=https://your-dsn@sentry.io/project-id
   ```
4. Redeploy

---

## 📊 Additional Recommended Integrations

### 3. Datadog Observability (Optional)

**Why:** Comprehensive monitoring for logs, metrics, and traces.

**Setup:**
1. Vercel Dashboard → Integrations → Search "Datadog"
2. Connect your Datadog account
3. Automatic log forwarding and metrics collection

**Benefits:**
- Log aggregation
- Performance metrics
- Real-time dashboards
- Vercel function monitoring

---

### 4. GitHub Issues Integration (Optional)

**Why:** Convert Vercel comments directly to GitHub issues.

**Setup:**
1. Vercel Dashboard → Integrations → Search "GitHub Issues"
2. Connect your GitHub repository
3. Enable issue creation from Vercel comments

**Benefits:**
- Streamlined bug reporting
- Better project management
- Automatic issue tracking

---

## 🔧 Environment Variables Reference

After setting up integrations, your Vercel environment variables should include:

### Supabase (Auto-set by integration)
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Sentry (Auto-set by integration)
```
VITE_SENTRY_DSN=https://your-dsn@sentry.io/project-id
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
SENTRY_AUTH_TOKEN=your-token
```

### Manual Variables (if not using integrations)
If you're not using the native integrations, you'll need to set these manually in:
**Vercel Dashboard → Project → Settings → Environment Variables**

---

## ✅ Verification

After setting up integrations:

1. **Supabase:**
   - Check that authentication works
   - Verify session persistence
   - Check Vercel logs for Supabase connection

2. **Sentry:**
   - Trigger a test error (or wait for a real one)
   - Check your Sentry dashboard for the error
   - Verify performance monitoring is active

3. **Redeploy:**
   - After adding integrations, redeploy your application
   - New environment variables are only available after redeployment

---

## 🐛 Troubleshooting

### Supabase Integration Issues

**Problem:** Environment variables not set after integration
- **Solution:** Redeploy your application after adding the integration

**Problem:** Session not persisting
- **Solution:** This is now handled automatically by Supabase. If issues persist, check browser console for storage errors.

### Sentry Integration Issues

**Problem:** Errors not appearing in Sentry
- **Solution:** 
  1. Verify `VITE_SENTRY_DSN` is set in environment variables
  2. Check browser console for Sentry initialization messages
  3. Ensure you've redeployed after adding the integration

**Problem:** Too many errors being captured
- **Solution:** Adjust `tracesSampleRate` in `src/main.jsx` (currently 10% in production)

---

## 📚 Additional Resources

- [Vercel Marketplace](https://vercel.com/marketplace)
- [Supabase Documentation](https://supabase.com/docs)
- [Sentry Documentation](https://docs.sentry.io/)
- [Vercel Integrations Guide](https://vercel.com/docs/integrations)

---

## 🎯 Next Steps

1. ✅ Set up Supabase native integration
2. ✅ Set up Sentry error monitoring
3. ⏭️ Consider Datadog for advanced monitoring (optional)
4. ⏭️ Set up GitHub Issues integration (optional)

After completing these integrations, your application will have:
- ✅ Automatic error tracking and monitoring
- ✅ Better session management
- ✅ Reduced manual configuration
- ✅ Professional observability

