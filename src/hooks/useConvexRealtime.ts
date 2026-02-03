/**
 * Real-time hooks using Convex
 *
 * These hooks provide real-time updates for chat messages, presence, and read receipts
 * using Convex instead of polling or Supabase subscriptions
 *
 * NOTE: Bookings, notifications, and profile update hooks are commented out until
 * those Convex modules are implemented. For now, use polling hooks in useMarketplace.ts
 * or Neon queries in neonQueries.ts
 *
 * NOTE: The Convex React bindings (convex/_generated/react) haven't been generated yet.
 * To generate them, run: npx convex dev
 *
 * For now, all hooks in this file are placeholders commented out.
 */

// =====================================================
// BOOKINGS (TODO: Implement Convex module)
// =====================================================
//
// Use useMarketplace hooks or Neon queries instead for now

// =====================================================
// NOTIFICATIONS (TODO: Implement Convex module)
// =====================================================
//
// Use useNotifications hook from hooks/useNotifications.ts instead

// =====================================================
// PROFILE UPDATES (TODO: Implement Convex module)
// =====================================================
//
// Use polling-based hooks for now

// Export empty object to prevent import errors
export const useConvexRealtime = {};
