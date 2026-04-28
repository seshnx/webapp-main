import { useUser, useAuth } from "@clerk/react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/api";
import { useEffect, useRef } from "react";

export const useUserSync = () => {
  const { user } = useUser();
  const { isLoaded, isSignedIn, userId } = useAuth();
  const syncUser = useMutation(api.users.syncUserFromClerk);
  
  // Fetch everything needed for the UI in one query
  // Using a stable object type instead of alternating between literal "skip" and Object
  // to prevent React Top-Level suspense/re-render looping issues in App.tsx
  const fullUserData = useQuery(
    api.users.getFullUserData, 
    { clerkId: userId || "skip" }
  );

  const syncStarted = useRef(false);

  useEffect(() => {
    // Run sync silently in the background once per session
    if (isLoaded && isSignedIn && userId && user && !syncStarted.current) {
      syncStarted.current = true;

      // Generate username from email if not provided by Clerk
      const email = user.primaryEmailAddress?.emailAddress || "";
      const generatedUsername = user.username || email.split('@')[0] || undefined;

      syncUser({
        clerkId: userId,
        email: email,
        username: generatedUsername,
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
