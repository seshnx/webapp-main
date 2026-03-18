import { useUser, useAuth } from "@clerk/clerk-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect, useRef } from "react";

export const useUserSync = () => {
  const { user } = useUser();
  const { isLoaded, isSignedIn, userId } = useAuth();
  const syncUser = useMutation(api.users.syncUserFromClerk);
  
  // Fetch everything needed for the UI in one query
  const fullUserData = useQuery(api.users.getFullUserData, 
    userId ? { clerkId: userId } : "skip"
  );

  const syncStarted = useRef(false);

  useEffect(() => {
    // Run sync silently in the background once per session
    if (isLoaded && isSignedIn && userId && user && !syncStarted.current) {
      syncStarted.current = true;
      
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
  }, [isLoaded, isSignedIn, userId, user, syncUser]);

  return { 
    userData: fullUserData,
    // Provide a strict loading state specifically for the dashboard skeleton
    loading: isSignedIn && fullUserData === undefined 
  };
};
