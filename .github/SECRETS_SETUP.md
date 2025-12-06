# GitHub Secrets Setup Guide

This guide explains how to set up environment variables as GitHub Secrets for secure CI/CD builds.

## Required Secrets

The following secrets need to be configured in your GitHub repository:

### Firebase Configuration
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`

### Optional
- `VITE_GIPHY_API_KEY` (for GIF support in chat)

## How to Add Secrets to GitHub

1. **Navigate to your repository on GitHub**
   - Go to: `https://github.com/YOUR_USERNAME/YOUR_REPO`

2. **Open Settings**
   - Click on the **Settings** tab (top navigation bar)

3. **Go to Secrets and Variables**
   - In the left sidebar, expand **Secrets and variables**
   - Click on **Actions**

4. **Add New Secret**
   - Click the **New repository secret** button
   - Enter the secret name (e.g., `VITE_FIREBASE_API_KEY`)
   - Enter the secret value (copy from your `.env` file or Firebase Console)
   - Click **Add secret**

5. **Repeat for all secrets**
   - Add each environment variable listed above as a separate secret

## Getting Firebase Configuration Values

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the gear icon ⚙️ next to "Project Overview"
4. Select **Project settings**
5. Scroll down to **Your apps** section
6. Click on your web app or create one if needed
7. Copy the values from the Firebase SDK snippet (Config object)

Example format:
```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456",
  measurementId: "G-XXXXXXXXXX"
};
```

## Getting Giphy API Key

1. Go to [Giphy Developers](https://developers.giphy.com/)
2. Create an account or sign in
3. Click **Create an App**
4. Select **API** as the product
5. Fill in your app details
6. Copy the **API Key** from your dashboard

## Local Development

For local development, create a `.env` file in the root directory (it's already in `.gitignore`):

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your actual values in `.env`

3. Start the development server:
   ```bash
   npm run dev
   ```

## Security Notes

- ⚠️ **Never commit `.env` files** - They are already in `.gitignore`
- ✅ **Commit `package-lock.json`** - Required for consistent builds and npm caching in CI/CD
- ✅ **Use GitHub Secrets** for CI/CD builds
- ✅ **Use `.env.example`** as a template (without real values)
- ✅ **Rotate secrets** if they are ever exposed

## Verifying Secrets Are Set

After adding secrets, you can verify they're working by:

1. Triggering a workflow run (push to main or create a PR)
2. Check the workflow run logs
3. The build should succeed without missing environment variable errors

## Troubleshooting

**Build fails with "undefined" errors:**
- Check that all secrets are added with the exact names listed above
- Verify secret values are correct (no extra spaces or quotes)

**Local development not working:**
- Ensure `.env` file exists in the root directory
- Check that all required variables are set
- Restart the dev server after creating/modifying `.env`

