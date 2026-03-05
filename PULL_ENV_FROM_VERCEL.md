# Pull Environment Variables from Vercel

This guide shows you how to pull environment variables from Vercel for local development.

## 🎯 Why Pull Env Vars from Vercel?

- **Single source of truth**: Vercel stores all production environment variables
- **Team collaboration**: Everyone works with the same env vars
- **Automatic updates**: Pull latest changes without manual copy-paste
- **Security**: No need to share sensitive values via email/chat

## 🚀 Quick Start

### Option 1: Using Vercel CLI (Recommended)

```bash
# Pull all environment variables from Vercel
npm run pull-env:vercel
```

This uses Vercel CLI's built-in `vercel env pull` command to fetch all environment variables.

### Option 2: Using Custom Script

```bash
# Pull specific environment variables
npm run pull-env
```

This pulls a curated list of environment variables defined in `scripts/pull-env-vercel.js`.

## 📋 Prerequisites

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Link your project** (first time only):
   ```bash
   vercel link
   ```

## 🔧 Available Scripts

### `npm run pull-env:vercel`
Pulls ALL environment variables from Vercel using the official Vercel CLI command.

**Pros:**
- Official Vercel method
- Gets all variables (including project-specific)
- Automatic formatting

**Cons:**
- May include variables you don't need locally
- Overwrites entire .env file

### `npm run pull-env`
Pulls a curated list of environment variables defined in the script.

**Variables pulled:**
- MongoDB connections
- Neon database
- Clerk authentication
- Convex
- Vercel Blob storage
- Stripe
- Sentry

**Pros:**
- Selective pulling (only what you need)
- Merges with existing .env (preserves local overrides)
- Creates backups

**Cons:**
- Need to update script to add new variables

## 📝 Usage Examples

### Initial Setup

```bash
# 1. Login to Vercel
vercel login

# 2. Link your project (first time only)
vercel link

# 3. Pull environment variables
npm run pull-env:vercel

# 4. Start development server
npm run dev
```

### Updating Environment Variables

When you or a teammate adds/changes environment variables in Vercel:

```bash
# Pull the latest changes
npm run pull-env:vercel

# Restart your dev server
npm run dev
```

## 🔒 Security Best Practices

### 1. **Never commit .env to git**
```bash
# Add to .gitignore
echo ".env" >> .gitignore
echo ".env.backup-*" >> .gitignore
```

### 2. **Use Vercel environments**
- **Production**: Production values
- **Preview**: Preview deployments
- **Development**: Local development values

### 3. **Sensitive variables**
The following are considered sensitive and will be masked:
- `SECRET_KEY`
- `CONNECTION_STRING`
- `DATABASE_URL`
- `TOKEN`
- `PASSWORD`

## 📂 Environment Variables Reference

### Database
```bash
VITE_MONGODB_CONNECTION_STRING    # MongoDB connection
VITE_MONGODB_DB_NAME              # MongoDB database name
VITE_NEON_CONNECTION_STRING       # Neon PostgreSQL connection
DATABASE_URL                      # Alternative Neon connection
```

### Authentication
```bash
VITE_CLERK_PUBLISHABLE_KEY        # Clerk frontend key
CLERK_SECRET_KEY                  # Clerk backend key
VITE_CLERK_SIGN_IN_URL            # Sign-in URL
VITE_CLERK_SIGN_UP_URL            # Sign-up URL
VITE_CLERK_SIGN_OUT_URL           # Sign-out URL
VITE_CLERK_AFTER_SIGN_IN_URL      # Post sign-in redirect
VITE_CLERK_AFTER_SIGN_UP_URL      # Post sign-up redirect
```

### Convex
```bash
VITE_CONVEX_URL                   # Convex deployment URL
CONVEX_DEPLOY_KEY                 # Convex deployment key
```

### Storage
```bash
BLOB_READ_WRITE_TOKEN             # Vercel Blob storage token
```

### Payments
```bash
VITE_STRIPE_TEST_KEY              # Stripe test publishable key
```

### Error Tracking
```bash
VITE_SENTRY_DSN                   # Sentry DSN
SENTRY_AUTH_TOKEN                 # Sentry auth token
```

## 🛠️ Troubleshooting

### "Vercel CLI not found"
```bash
npm install -g vercel
vercel login
```

### "Not logged in to Vercel"
```bash
vercel login
```

### "Project not linked"
```bash
vercel link
```

### "Environment variable not found"
1. Check if the variable exists in Vercel dashboard
2. Ensure you're pulling from the correct environment
3. Try `vercel env pull .env --environment=production`

### Permission Issues
```bash
# On Windows, run as administrator if needed
# On Unix/Mac, check file permissions
chmod +x .env
```

## 🔄 Workflow Integration

### Team Workflow

1. **Add env var in Vercel dashboard**
   - Go to project Settings → Environment Variables
   - Add new variable
   - Select environments (Production, Preview, Development)

2. **Team members pull changes**
   ```bash
   git pull
   npm run pull-env:vercel
   npm run dev
   ```

### CI/CD Integration

No need to pull env vars in CI/CD - Vercel automatically injects them during deployment.

### Multiple Environments

```bash
# Pull production variables
vercel env pull .env --environment=production

# Pull preview variables
vercel env pull .env --environment=preview

# Pull development variables
vercel env pull .env --environment=development
```

## 📚 Additional Resources

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [Environment Variables Best Practices](https://vercel.com/docs/concepts/projects/environment-variables#best-practices)

## 💡 Tips

1. **Pull before starting work**
   ```bash
   npm run pull-env:vercel && npm run dev
   ```

2. **Pull after deploying**
   ```bash
   vercel --prod
   npm run pull-env:vercel
   ```

3. **Check what's in Vercel**
   ```bash
   vercel env ls
   ```

4. **Add a new variable locally**
   ```bash
   # Add to .env locally first
   echo "NEW_VAR=value" >> .env

   # Then add in Vercel dashboard
   # Team members can pull it later
   ```

---

**Happy coding! 🚀**
