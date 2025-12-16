# Supabase Authentication Troubleshooting

## 401 Unauthorized Error

If you're seeing `401 (Unauthorized)` errors when trying to sign in or sign up, check the following:

### 1. Verify Environment Variables

Make sure these are set in your environment (`.env.local` for local development or Vercel environment variables):

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**To find these values:**
1. Go to your Supabase project dashboard
2. Click **Settings** → **API**
3. Copy the **Project URL** and **anon/public key**

### 2. Check Supabase Project Settings

In your Supabase dashboard:

1. **Go to Authentication → Settings**
2. **Enable Email Auth:**
   - Make sure "Enable email signup" is **ON**
   - Make sure "Confirm email" is set according to your needs:
     - **OFF** for development (users can sign in immediately)
     - **ON** for production (users must confirm email first)

3. **Check Site URL:**
   - Go to **Authentication → URL Configuration**
   - Set **Site URL** to your app URL (e.g., `https://app.seshnx.com` or `http://localhost:5173` for local)
   - Add **Redirect URLs** if needed:
     - `http://localhost:5173/**` (for local development)
     - `https://app.seshnx.com/**` (for production)

### 3. Verify Anon Key Format

The anon key should:
- Start with `eyJ` (it's a JWT token)
- Be the **anon/public** key, NOT the service_role key
- Be copied completely (it's very long)

### 4. Test Connection

Open your browser console and check:
- Look for the Supabase initialization log: `✓ Supabase client initialized`
- If you see `❌ Supabase credentials not found`, your env vars aren't loading

### 5. Common Issues

**Issue: "Invalid API key"**
- Solution: Double-check you're using the **anon/public** key, not service_role

**Issue: "Email not confirmed"**
- Solution: In Supabase dashboard → Authentication → Settings, turn OFF "Confirm email" for testing

**Issue: "User already registered"**
- Solution: The user exists. Try signing in instead of signing up, or delete the user in Supabase dashboard

**Issue: Still getting 401 after checking everything**
- Solution: 
  1. Verify the Supabase project is active (not paused)
  2. Check if you have the correct project (URL matches)
  3. Try creating a new Supabase project and updating credentials

### 6. Quick Test

Run this in your browser console after the app loads:

```javascript
// Check if Supabase is initialized
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase Key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
console.log('Supabase client:', window.supabase || 'Not available');
```

### 7. Local Development Setup

Create a `.env.local` file in your project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**Important:** 
- Restart your dev server after adding/changing `.env.local`
- Never commit `.env.local` to git (it should be in `.gitignore`)

### 8. Vercel Deployment

1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Add both variables for **Production**, **Preview**, and **Development**
3. **Redeploy** your project after adding variables

## Still Having Issues?

1. Check the browser console for detailed error messages
2. Check the Supabase dashboard → **Logs** → **Auth Logs** for server-side errors
3. Verify your Supabase project is on a paid plan (free tier has limits but should work for testing)

