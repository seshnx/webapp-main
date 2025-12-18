import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from './config/supabase'; 
import { Loader2 } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

// Core components
import AuthWizard from './components/AuthWizard';
import AppRoutes from './routes/AppRoutes';
import MainLayout from './components/MainLayout';

export default function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Track if initial session has been handled to prevent duplicate loading clears
  const initialSessionHandledRef = useRef(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Dark Mode
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('theme') === 'dark' ||
            (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(!darkMode);

  // --- SUPABASE AUTH & DATA LISTENER ---
  useEffect(() => {
    // Reset the ref on each mount
    initialSessionHandledRef.current = false;
    
    if (!supabase) {
        setLoading(false);
        return;
    }

    // Track loading state to prevent duplicate calls
    const loadingUsers = new Set();

    /**
     * ROBUST USER DATA LOADER
     * This function is designed to never throw an uncaught error.
     * It will always set userData to *something*, preventing the "null account" crash.
     */
    const loadUserData = async (userId) => {
        // 1. Sanity Check
        if (!userId) {
            // Don't set to null - if we have a user, we should always have userData
            // Only set to null if we truly have no user
            return;
        }

        // 2. Prevent duplicate calls for the same user
        if (loadingUsers.has(userId)) {
            console.log('User data already loading for:', userId);
            return;
        }
        loadingUsers.add(userId);

        let authUser = null; // Declare outside try for use in catch block
        
        try {
            // 2. Safe Auth Retrieval
            // We fetch the latest auth object to get metadata (names/avatar) even if the profile table is empty
            const { data: authData } = await supabase.auth.getUser();
            authUser = authData?.user || null;
            
            // 3. Fetch Profile (Safely)
            // .maybeSingle() returns null instead of throwing an error if 0 rows are found
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .maybeSingle();
            
            if (profileError) {
                console.warn("Minor warning fetching profile:", profileError.message);
            }

            // 4. Construct Fallback/Default Data
            // We use the most reliable source available for each field
            const currentEmail = profile?.email || authUser?.email || user?.email || '';
            const metadata = authUser?.user_metadata || {};
            
            const currentFirstName = 
                profile?.first_name || 
                metadata.first_name || 
                metadata.given_name || 
                'User';
                
            const currentLastName = 
                profile?.last_name || 
                metadata.last_name || 
                metadata.family_name || 
                '';

            // Base object that guarantees the app can render
            let finalUserData = {
                id: userId,
                firstName: currentFirstName,
                lastName: currentLastName,
                email: currentEmail,
                accountTypes: ['Fan'], // Safe default
                activeProfileRole: 'Fan',
                photoURL: profile?.avatar_url || metadata.avatar_url || metadata.picture || null,
                settings: profile?.settings || {},
                effectiveDisplayName: profile?.effective_display_name || currentFirstName
            };

            // 5. Merge Real Profile Data (if it exists)
            if (profile) {
                const accountTypes = profile.account_types && profile.account_types.length > 0 
                    ? profile.account_types 
                    : ['Fan'];
                
                finalUserData = {
                    ...finalUserData,
                    ...profile, // Overwrite defaults with DB data
                    accountTypes,
                    activeProfileRole: profile.active_role || accountTypes[0],
                };
            } else {
                // Profile doesn't exist - create it from auth data
                console.log('Profile not found, creating from auth data');
                
                const firstName = authUser?.user_metadata?.first_name || authUser?.user_metadata?.given_name || '';
                const lastName = authUser?.user_metadata?.last_name || authUser?.user_metadata?.family_name || '';
                const email = authUser?.email || '';
                
                // Calculate effective display name
                const effectiveName = firstName && lastName 
                    ? `${firstName} ${lastName}`
                    : firstName || lastName || email?.split('@')[0] || 'User';
                
                // Try to create profile using upsert (handles race conditions)
                // Only create if profile truly doesn't exist (AuthWizard should have created it)
                const { error: createError } = await supabase
                    .from('profiles')
                    .upsert({
                        id: userId,
                        email: email,
                        first_name: firstName,
                        last_name: lastName,
                        avatar_url: authUser?.user_metadata?.avatar_url || authUser?.user_metadata?.picture || null,
                        account_types: ['Fan'],
                        active_role: 'Fan',
                        preferred_role: 'Fan', // Fallback role when user has multiple roles
                        effective_display_name: effectiveName,
                        search_terms: [
                            firstName?.toLowerCase(),
                            lastName?.toLowerCase(),
                            effectiveName.toLowerCase()
                        ].filter(Boolean),
                        settings: {},
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'id' });
                
                if (createError) {
                    console.error("Error creating/updating profile:", createError);
                } else {
                    console.log('Profile created/updated successfully');
                }
                
                // Update finalUserData with the created profile data
                finalUserData = {
                    ...finalUserData,
                    firstName: firstName || 'User',
                    lastName: lastName || '',
                    email: email,
                    effectiveDisplayName: effectiveName
                };
            }

            // 6. Set State (The most important part)
            setUserData(finalUserData);

            // Wallet fetching removed for minimal setup
        } catch (err) {
            console.error("CRITICAL: Error loading user data:", err);
            // FAILSAFE: Always set userData to prevent null state
            // This ensures the app never renders with null userData when user exists
            setUserData({
                id: userId,
                firstName: authUser?.user_metadata?.first_name || authUser?.user_metadata?.given_name || 'User',
                lastName: authUser?.user_metadata?.last_name || authUser?.user_metadata?.family_name || '',
                email: authUser?.email || '',
                accountTypes: ['Fan'],
                activeProfileRole: 'Fan',
                effectiveDisplayName: authUser?.user_metadata?.first_name || authUser?.user_metadata?.given_name || 'User',
                photoURL: authUser?.user_metadata?.avatar_url || authUser?.user_metadata?.picture || null,
                settings: {}
            });
        } finally {
            // Remove from loading set when done
            loadingUsers.delete(userId);
        }
    };

    // 1. Get initial session
    const loadInitialSession = async () => {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (error) {
                console.error("Error getting session:", error);
                // If error is related to storage, it's likely Tracking Prevention
                if (error.message?.includes('storage') || error.message?.includes('localStorage')) {
                    console.warn("Storage access blocked - session cannot be persisted");
                }
                setUser(null);
                setUserData(null);
                // Only clear loading if we haven't already
                if (!initialSessionHandledRef.current) {
                    setLoading(false);
                    initialSessionHandledRef.current = true;
                }
                return;
            }
            
            // Validate session exists and has a valid user
            const currentUser = session?.user ?? null;
            
            if (currentUser && currentUser.id) {
                console.log('Session restored:', currentUser.id);
                setUser(currentUser);
                // Load user data - wait for it to complete
                await loadUserData(currentUser.id).catch(err => {
                    console.error("User data load failed:", err);
                });
            } else {
                setUser(null);
                setUserData(null);
            }
            
            // Clear loading after initial session is handled
            if (!initialSessionHandledRef.current) {
                setLoading(false);
                initialSessionHandledRef.current = true;
            }
        } catch (err) {
            console.error("Session check failed:", err);
            setUser(null);
            setUserData(null);
            if (!initialSessionHandledRef.current) {
                setLoading(false);
                initialSessionHandledRef.current = true;
            }
        }
    };
    
    // Start loading session
    loadInitialSession();

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth event:', event);
        const currentUser = session?.user ?? null;
        
        // Handle INITIAL_SESSION event - this fires on page load
        // We've already handled it in loadInitialSession, so just sync state
        if (event === 'INITIAL_SESSION') {
            if (currentUser && currentUser.id) {
                setUser(currentUser);
                // Only load userData if we don't have it yet
                if (!userData) {
                    loadUserData(currentUser.id).catch(err => {
                        console.error("Background user data load failed:", err);
                    });
                }
            }
            // Clear loading if not already cleared
            if (!initialSessionHandledRef.current) {
                setLoading(false);
                initialSessionHandledRef.current = true;
            }
            return;
        }
        
        if (currentUser) {
            setUser(currentUser);
            // Refresh data on sign-in or token refresh
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                loadUserData(currentUser.id).catch(err => {
                    console.error("Background user data load failed:", err);
                });
            }
        } else if (event === 'SIGNED_OUT') {
            setUser(null);
            setUserData(null);
            // Navigate to login on sign out
            navigate('/login', { replace: true });
        }
        
        // Clear loading for other events (but INITIAL_SESSION is handled above)
        if (event !== 'INITIAL_SESSION') {
            setLoading(false);
        }
    });

    // 3. Safety timeout - reduced to 1.5 seconds (just in case)
    const timeoutId = setTimeout(() => {
        if (loading) {
            console.warn("Force clearing loading state after timeout");
            setLoading(false);
            initialSessionHandledRef.current = true;
        }
    }, 1500);

    return () => {
        subscription.unsubscribe();
        clearTimeout(timeoutId);
    };
  }, []); // Empty dependency array = runs once on mount

  const handleLogout = async () => {
      try {
          // Clear state immediately for responsive UI
          setUser(null);
          setUserData(null);
          
          // Sign out from Supabase
          if (supabase) {
              const { error } = await supabase.auth.signOut();
              if (error) {
                  console.error("Logout error:", error);
              }
          }
          
          // Navigate to login - auth state change will also trigger, but this ensures immediate redirect
          navigate('/login', { replace: true });
      } catch (err) {
          console.error("Logout error:", err);
          // Even if signOut fails, clear state and redirect
          setUser(null);
          setUserData(null);
          navigate('/login', { replace: true });
      }
  };

  // Show loading spinner only during initial session check
  // Don't show loading if we have a user but are just waiting for userData
  // This prevents flashing when userData loads in background
  if (loading && !user) {
    // Only show loading if we don't have a user yet
    // Once we have a user, show UI even if userData is still loading
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1d21]">
        <Loader2 className="animate-spin text-brand-blue" size={48} />
      </div>
    );
  }
  
  // Check if coming from OAuth signup flow
  const isFromSignup = new URLSearchParams(window.location.search).get('intent') === 'signup';
  
  // === AUTHENTICATION GUARD ===
  const isAuthenticated = user && user.id;
  const hasUserData = userData && userData.id;
  const isOnLoginPage = location.pathname === '/login';
  const isTestLoginPage = location.pathname === '/test-login';
  
  // CRITICAL: If no user is loaded, always show AuthWizard
  // This ensures the app never renders with null user
  if (!isAuthenticated && !isOnLoginPage && !isTestLoginPage) {
    return <AuthWizard darkMode={darkMode} toggleTheme={toggleTheme} onSuccess={() => navigate('/')} isNewUser={false} />;
  }
  
  // CRITICAL: If user exists but no userData, show minimal UI while loading
  // This ensures the app never renders with null userData when user exists
  if (isAuthenticated && !hasUserData && !isOnLoginPage && !isTestLoginPage) {
    // UserData is loading in background - show AuthWizard as fallback
    // The userData will populate once the async load completes
    return <AuthWizard darkMode={darkMode} toggleTheme={toggleTheme} onSuccess={() => navigate('/')} isNewUser={false} />;
  }
  
  // Handle test login page (always show login, route to debug report)
  if (isTestLoginPage) {
    if (isAuthenticated && hasUserData) {
      // Already logged in - redirect to debug report
      navigate('/debug-report', { replace: true });
      return null;
    }
    // Show login form - route to debug report on success
    return <AuthWizard darkMode={darkMode} toggleTheme={toggleTheme} onSuccess={() => navigate('/debug-report')} isNewUser={false} />;
  }
  
  // Handle login page
  if (isOnLoginPage) {
    if (isAuthenticated && hasUserData) {
      // Already logged in - redirect to dashboard
      navigate('/', { replace: true });
      return null;
    }
    // Show login form - normal flow
    return <AuthWizard darkMode={darkMode} toggleTheme={toggleTheme} onSuccess={() => navigate('/')} isNewUser={false} />;
  }
  
  // Handle OAuth onboarding
  if (isAuthenticated && !hasUserData && isFromSignup) {
    return <AuthWizard user={user} isNewUser={true} darkMode={darkMode} toggleTheme={toggleTheme} onSuccess={() => navigate('/debug-report')} />;
  }
  
  // Require authentication for all other routes
  if (!isAuthenticated || !hasUserData) {
    // This should be caught above, but double-check
    return <AuthWizard darkMode={darkMode} toggleTheme={toggleTheme} onSuccess={() => navigate('/')} isNewUser={false} />;
  }

  // Render app with full layout (Sidebar + Navbar + Content)
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1a1d21]">
      <Toaster position="bottom-right" toastOptions={{ style: { background: '#333', color: '#fff' } }} />
      
      {/* Check if we're on a special route that needs different layout */}
      {location.pathname === '/settings' || location.pathname === '/debug-report' ? (
        // Settings and Debug Report use simple layout
        <main className="p-6">
          <AppRoutes
            user={user}
            userData={userData}
            loading={loading}
            darkMode={darkMode}
            toggleTheme={toggleTheme}
            handleLogout={handleLogout}
          />
        </main>
      ) : (
        // All other routes use MainLayout with Sidebar + Navbar
        <MainLayout
          user={user}
          userData={userData}
          loading={loading}
          darkMode={darkMode}
          toggleTheme={toggleTheme}
          handleLogout={handleLogout}
        />
      )}
    </div>
  );
}
