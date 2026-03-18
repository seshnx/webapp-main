import { useUser } from "@clerk/react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect, useState } from "react";

export const useUserSync = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const syncUser = useMutation(api.users.syncUserFromClerk);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');

  useEffect(() => {
    const performSync = async () => {
      // Only sync if Clerk is loaded, user is signed in, and we haven't synced this session yet
      if (isLoaded && isSignedIn && user && syncStatus === 'idle') {
        try {
          setSyncStatus('syncing');
          
          await syncUser({
            clerkId: user.id,
            email: user.primaryEmailAddress?.emailAddress || "",
            username: user.username || undefined,
            emailVerified: user.primaryEmailAddress?.verification.status === "verified",
            firstName: user.firstName || undefined,
            lastName: user.lastName || undefined,
            imageUrl: user.imageUrl,
          });

          setSyncStatus('synced');
        } catch (error) {
          console.error("Failed to sync user with Convex:", error);
          setSyncStatus('error');
        }
      }
    };

    performSync();
  }, [isLoaded, isSignedIn, user, syncUser, syncStatus]);

  return {
    isLoaded: isLoaded && (syncStatus === 'synced' || syncStatus === 'error'),
    isSignedIn,
    syncStatus
  };
};
