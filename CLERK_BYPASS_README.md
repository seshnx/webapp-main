# Clerk Org Bypass - Developer Guide

## ⚠️ IMPORTANT SECURITY WARNING

**This bypass system is for DEVELOPMENT ONLY. Never enable in production!**

## What is the Clerk Org Bypass?

The Clerk Org Bypass is a development utility that allows you to test the application's organization creation and management features without needing a full Clerk authentication setup. It creates mock organizations and users, and bypasses Clerk's authentication checks.

## When to Use It

Use the bypass system when:
- You're developing new organization features
- You need to test UI flows without Clerk setup
- You're working offline or without Clerk credentials
- You want to speed up development testing

**DO NOT use when:**
- Testing security features
- Deploying to production
- Demonstrating to stakeholders
- Any production-like environment

## How to Enable

### Step 1: Set Environment Variables

Add to your `.env.development` file:

```bash
NODE_ENV=development
VITE_CLERK_BYPASS=true
```

### Step 2: Restart Development Server

```bash
npm run dev
```

You should see console warnings indicating bypass is active.

## How to Use

### Basic Usage

```typescript
import {
  BYPASS_ENABLED,
  bypassClerkOrg,
  bypassClerkUser,
  getBypassStatus
} from '../utils/clerkOrgBypass';

// Check if bypass is enabled
if (BYPASS_ENABLED) {
  console.log('Bypass is active in development!');

  // Create a mock organization
  const mockOrg = bypassClerkOrg('STUDIO', 'My Test Studio');
  console.log('Mock Org:', mockOrg);

  // Create a mock user
  const mockUser = bypassClerkUser('user_123', ['Studio', 'Artist']);
  console.log('Mock User:', mockUser);

  // Check bypass status
  const status = getBypassStatus();
  console.log('Bypass Status:', status);
}
```

### Making Bypassed API Calls

```typescript
import { bypassApiCall } from '../utils/clerkOrgBypass';

// Make API call with bypass headers
const response = await bypassApiCall('/api/dev/bypass-org', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    orgType: 'STUDIO',
    orgName: 'Test Studio',
    slug: 'test-studio',
    userId: 'user_123',
  }),
});

const data = await response.json();
console.log('Created:', data);
```

### Using with Setup Wizards

The setup wizards (StudioSetupWizard, TechSetupWizard, LabelSetupWizard, EduSetupWizard) automatically detect and use the bypass when enabled. No code changes needed!

## Available Functions

### `BYPASS_ENABLED`
Boolean indicating if bypass is active.

### `bypassClerkOrg(orgType, orgName)`
Creates a mock organization.

- `orgType`: 'STUDIO', 'TECH', 'LABEL', or 'EDU'
- `orgName`: Name for the organization
- Returns: Mock organization object

### `bypassClerkUser(userId, accountTypes)`
Creates a mock user.

- `userId`: User ID
- `accountTypes`: Array of account types
- Returns: Mock user object

### `bypassOrgCreation(orgType, orgName)`
Simulates org creation API call.

- `orgType`: Organization type
- `orgName`: Organization name
- Returns: Success response with mock data

### `getBypassStatus()`
Returns current bypass configuration.

- Returns: Object with enabled, environment, and status info

### `canUseBypass(userId?)`
Checks if user can use bypass.

- `userId`: Optional user ID
- Returns: Boolean

### `getBypassSessionToken()`
Generates a mock session token.

- Returns: Mock session token string

### `bypassApiCall(url, options)`
Makes API call with bypass headers.

- `url`: API endpoint
- `options`: Fetch options
- Returns: Fetch response

### `logBypassWarning()`
Logs bypass warnings to console (called automatically on load).

## Bypassed API Endpoints

### `/api/dev/bypass-org`
Creates mock organizations via API.

**Request:**
```json
{
  "orgType": "STUDIO",
  "orgName": "Test Studio",
  "slug": "test-studio",
  "userId": "user_123"
}
```

**Response:**
```json
{
  "success": true,
  "organizationId": "bypass_studio_1234567890",
  "name": "Test Studio {[STUDIO]}",
  "slug": "test-studio",
  "type": "studio",
  "tagged": true,
  "bypassed": true,
  "createdAt": 1234567890,
  "privateMetadata": {
    "type": "studio",
    "tagged": true,
    "bypassed": true
  }
}
```

### `/api/check-slug`
Checks slug availability (works with or without bypass).

**Request:**
```
GET /api/check-slug?slug=my-studio&type=studio
```

**Response:**
```json
{
  "available": true,
  "slug": "my-studio",
  "type": "studio",
  "existing": null,
  "bypassed": true
}
```

## Testing with Bypass

### Example Test Flow

1. **Enable bypass in `.env.development`**
2. **Start dev server** - Check console for bypass warnings
3. **Navigate to Business Center**
4. **Click "Open A Studio"**
5. **Complete Setup Wizard** - Uses bypass automatically
6. **Verify mock org created** in console/network tab
7. **Test EDU, Tech, Label wizards** - All work with bypass

### Disabling Bypass

To test with real Clerk:

```bash
# In .env.development
VITE_CLERK_BYPASS=false
```

Or remove the variable entirely.

## Troubleshooting

### Bypass not working?
- Check `NODE_ENV=development` is set
- Check `VITE_CLERK_BYPASS=true` is set
- Restart dev server after changing env vars
- Check console for bypass warnings

### API calls failing?
- Verify bypass headers are being sent
- Check network tab in browser dev tools
- Look for `X-Clerk-Bypass: true` header
- Check bypass token in `X-Bypass-Token` header

### Slug checking not working?
- Verify `/api/check-slug` endpoint exists
- Check Convex functions are deployed
- Check network tab for API responses
- Try with bypass enabled if Convex isn't available

## Security Best Practices

### Before Deploying to Production

1. **Remove bypass environment variables:**
   ```bash
   # Remove these from production env
   VITE_CLERK_BYPASS
   ```

2. **Remove bypass endpoint:**
   ```bash
   # Delete or secure this file
   api/dev/bypass-org.js
   ```

3. **Test without bypass:**
   - Disable bypass in development
   - Test all authentication flows
   - Verify Clerk org creation works
   - Test all permissions and roles

4. **Code review:**
   - Search for `BYPASS_ENABLED` usage
   - Ensure no bypass code runs in production
   - Check for any hardcoded bypass logic

### Code Review Checklist

- [ ] No `BYPASS_ENABLED` checks in production builds
- [ ] No hardcoded bypass tokens
- [ ] No bypass endpoints accessible in production
- [ ] All authentication flows tested without bypass
- [ ] Error handling for missing Clerk session

## Console Warnings

When bypass is enabled, you'll see these warnings:

```
⚠️ CLERK ORG BYPASS ACTIVE ⚠️
Development mode is bypassing Clerk organization checks.
NEVER enable this in production!
```

This is normal and expected in development.

## Support

If you encounter issues:

1. Check console for bypass warnings
2. Verify environment variables are set
3. Check network tab for API responses
4. Ensure dev server is restarted after env changes
5. Try disabling and re-enabling bypass

## Summary

The Clerk Org Bypass is a powerful development tool that speeds up development and testing. Remember:

- ✅ **DO** use in development for faster testing
- ✅ **DO** use when working offline
- ✅ **DO** use for UI flow testing
- ❌ **DON'T** use in production
- ❌ **DON'T** use for security testing
- ❌ **DON'T** deploy with bypass enabled

Happy development! 🚀
