import { useUser, useAuth } from "@clerk/react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect, useState, useRef } from "react";

export const useUserSync = () => {
  const { user } = useUser();
  const { isLoaded, isSignedIn, userId } = useAuth();
  const syncUser = useMutation(api.users.syncUserFromClerk);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const syncStarted = useRef(false);

  useEffect(() => {
    // Only attempt sync if Clerk is ready and user is signed in
    if (isLoaded && isSignedIn && userId && user && !syncStarted.current) {
      const performSync = async () => {
        try {
          syncStarted.current = true;
          setSyncStatus('syncing');
          console.log("🔄 Syncing Clerk user to Convex...", userId);
          
          await syncUser({
            clerkId: userId,
            email: user.primaryEmailAddress?.emailAddress || "",
            username: user.username || undefined,
            emailVerified: user.primaryEmailAddress?.verification.status === "verified",
            firstName: user.firstName || undefined,
            lastName: user.lastName || undefined,
            imageUrl: user.imageUrl,
          });

          console.log("✅ Convex user synced");
          setSyncStatus('synced');
        } catch (error) {
          console.error("❌ Failed to sync user with Convex:", error);
          setSyncStatus('error');
        }
      };

      performSync();
    }
  }, [isLoaded, isSignedIn, userId, user, syncUser]);

  return {
    // If not signed in, we are "loaded" (nothing to sync)
    // If signed in, we are loaded only after the sync finishes or errors
    isReady: !isSignedIn || (syncStatus === 'synced' || syncStatus === 'error'),
    syncStatus
  };
};
