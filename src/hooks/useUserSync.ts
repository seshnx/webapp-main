import { useUser, useAuth } from "@clerk/react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect, useRef } from "react";

export const useUserSync = () => {
  const { user } = useUser();
  const { isLoaded, isSignedIn, userId } = useAuth();
  const syncUser = useMutation(api.users.syncUserFromClerk);
  
  // Use "skip" if no userId to prevent the query from running early
  const userData = useQuery(api.users.getUserByClerkId, 
    userId ? { clerkId: userId } : "skip"
  );

  const syncStarted = useRef(false);

  useEffect(() => {
    // 1. Only run if everything is ready
    if (!isLoaded || !isSignedIn || !userId || !user) return;

    // 2. Only run once per session
    if (syncStarted.current) return;

    const performSync = async () => {
      try {
        syncStarted.current = true;
        console.log("🔄 Background Sync: Clerk -> Convex");
        
        await syncUser({
          clerkId: userId,
          email: user.primaryEmailAddress?.emailAddress || "",
          username: user.username || undefined,
          emailVerified: user.primaryEmailAddress?.verification.status === "verified",
          firstName: user.firstName || undefined,
          lastName: user.lastName || undefined,
          imageUrl: user.imageUrl,
        });
        console.log("✅ Background Sync: Complete");
      } catch (error) {
        console.error("❌ Background Sync: Failed", error);
      }
    };

    performSync();
  }, [isLoaded, isSignedIn, userId, user, syncUser]);

  return { userData };
};
