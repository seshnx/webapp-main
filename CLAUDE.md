# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run dev          # Start Vite dev server
npm run build        # Production build
npm run build:vercel # Production build with Convex deploy (used in CI)
npm run lint         # ESLint with max-warnings 0
npm run lint:fix     # ESLint with auto-fix
npm run preview      # Preview production build locally
```

## Architecture Overview

SeshNx is a React 18 + Vite PWA for music creators, studios, and industry professionals. It uses a **hybrid backend architecture**:

- **Neon**: Primary database (PostgreSQL serverless)
- **Convex**: Real-time features (chat messages, presence, read receipts)
- **Clerk**: Authentication (PKCE flow)
- **Vercel Blob**: File storage (images, videos, documents)
- **Stripe**: Payment processing (test mode key in constants.js)
- **Vercel**: Deployment with SPA routing

Firebase and Supabase have been fully migrated away - legacy imports are mapped to empty adapters in vite.config.js.

## Directory Structure

```
src/
├── config/           # Neon/Convex/Clerk clients, constants.js (role schemas, account types)
├── components/
│   ├── shared/       # Reusable components (ErrorBoundary, AnimatedNumber, UserAvatar)
│   ├── ui/           # Basic primitives
│   ├── EDU/          # Education system (4 role-based dashboards)
│   ├── studio/       # Studio operations (bookings, floorplans, equipment)
│   ├── chat/         # Messaging system
│   ├── social/       # Social feed features
│   ├── marketplace/  # Gear exchange, SeshFx store
│   └── [feature]/    # Other domain-specific components
├── contexts/         # React contexts (SchoolContext, EduAuthContext, PlatformAdminContext)
├── hooks/            # Custom hooks (useAppData, useFollowSystem, useNotifications, etc.)
├── utils/            # Utilities (permissions.js, eduPermissions.js, moderation.js)
├── routes/           # AppRoutes.jsx, RouteWrapper.jsx
└── adapters/         # Firebase/Supabase shims (for legacy compatibility)
```

## Key Patterns

### Role-Based System
14+ account types defined in `src/config/constants.js`:
- `ACCOUNT_TYPES`: Talent, Engineer, Producer, Composer, Studio, Technician, Fan, Student, EDUStaff, EDUAdmin, Intern, Label, Agent, GAdmin
- `PROFILE_SCHEMAS`: Role-specific form fields for each account type
- `TALENT_SUBROLES`: Sub-roles like Singer, Rapper, DJ that display instead of "Talent"

EDU role hierarchy: GAdmin → EDUAdmin → EDUStaff → Student → Intern

### Component Loading
All major tabs are lazy-loaded with exponential backoff retry in `MainLayout.jsx`. This prevents circular dependency issues during initialization.

### State Management
- Props passed through MainLayout: `userData`, `user`, `subProfiles`, `tokenBalance`, `bookingCount`
- Contexts for EDU features: `SchoolContext`, `EduAuthContext`
- URL pathname is source of truth for navigation

### Real-Time Subscriptions
- Supabase: `postgres_changes` channel subscriptions
- Convex: `useQuery` hooks for messages, presence, conversations

### Authentication Flow (App.jsx)
1. Restore session from localStorage
2. Create minimal userData from auth metadata as fallback
3. Load full profile in background
4. 1.5s timeout prevents infinite loading states

## Database

SQL schemas are in `sql/` directory. Run scripts in Supabase SQL Editor in order:
1. `supabase_profiles_schema.sql` (core)
2. `app_config_module.sql`
3. Feature modules as needed

Key tables: `profiles`, `schools`, `students`, `staff`, `conversations`, `messages`

Convex schema in `convex/schema.ts` handles real-time data.

## Environment Variables

```
VITE_SUPABASE_URL        # Supabase project URL
VITE_SUPABASE_ANON_KEY   # Supabase anon key
VITE_CONVEX_URL          # Convex deployment URL
CONVEX_DEPLOY_KEY        # Convex deployment key (CI only)
VITE_SENTRY_DSN          # Optional error tracking
```

## Configuration Files

- `vite.config.js`: Chunk splitting for large vendors (Convex, Framer-motion, Maps, Audio, Stripe, Calendar), Firebase→adapter aliasing
- `tailwind.config.js`: Brand colors `#3D84ED` (primary), `#3C5DE8` (accent), dark mode class-based
- `eslint.config.js`: ESLint 9 flat config, React + React Hooks plugins, strict (max-warnings 0)

## Common Gotchas

- MainLayout navigation uses refs (`isNavigatingRef`, `fromPathnameRef`) to prevent navigation loops
- Always check for null userData - the fallback creation pattern is intentional
- Chat uses both Supabase (persistence) and Convex (real-time) - check `supabaseChat.js` and `convex/` accordingly
- Permission checks split between `utils/permissions.js` (general) and `utils/eduPermissions.js` (EDU-specific)
