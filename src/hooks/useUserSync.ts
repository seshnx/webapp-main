import { useUser, useAuth } from "@clerk/clerk-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect, useRef } from "react";

export const useUserSync = () => {
  const { user } = useUser();
  const { isLoaded, isSignedIn, userId } = useAuth();
  const syncUser = useMutation(api.users.syncUserFromClerk);
  
  const userData = useQuery(api.users.getUserByClerkId, 
    userId ? { clerkId: userId } : "skip"
  );

  const syncStarted = useRef(false);

  useEffect(() => {
    // Only sync if Clerk is ready, user is signed in, and we haven't started this session
    if (isLoaded && isSignedIn && userId && user && !syncStarted.current) {
      // If user data already exists, we mark sync as 'done' internally
      if (userData !== undefined) {
        syncStarted.current = true;
        
        // Background sync to keep profile updated (optional but recommended)
        syncUser({
          clerkId: userId,
          email: user.primaryEmailAddress?.emailAddress || "",
          username: user.username || undefined,
          emailVerified: user.primaryEmailAddress?.verification.status === "verified",
          firstName: user.firstName || undefined,
          lastName: user.lastName || undefined,
          imageUrl: user.imageUrl,
        }).catch(err => console.error("Background sync failed:", err));
      }
    }
  }, [isLoaded, isSignedIn, userId, user, userData, syncUser]);

  return { userData };
};
