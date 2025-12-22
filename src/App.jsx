import React, { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from './config/supabase'; 
import { Loader2 } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { useSettings, initializeSettingsFromStorage } from './hooks/useSettings';

// Lazy load components to avoid initialization order issues
const AuthWizard = lazy(() => import('./components/AuthWizard'));
const AppRoutes = lazy(() => import('./routes/AppRoutes'));
const MainLayout = lazy(() => import('./components/MainLayout'));

export default function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Track if initial session has been handled to prevent duplicate loading clears
  const initialSessionHandledRef = useRef(false);
  
  // These hooks must be called unconditionally at the top level
  // They're safe because App is always rendered inside BrowserRouter
  const navigate = useNavigate();
  const location = useLocation();

  // Dark Mode - now synced with user settings
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('theme') === 'dark' ||
            (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // Initialize settings from storage on mount
  useEffect(() => {
    const storedSettings = initializeSettingsFromStorage();
    if (storedSettings) {
      // Apply stored settings immediately
      const root = document.documentElement;
      
      // Apply theme
      if (storedSettings.theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          root.classList.add('dark');
          setDarkMode(true);
        } else {
          root.classList.remove('dark');
          setDarkMode(false);
        }
      } else if (storedSettings.theme === 'dark') {
        root.classList.add('dark');
        setDarkMode(true);
      } else {
        root.classList.remove('dark');
        setDarkMode(false);
      }
    }
  }, []);

  // Apply settings from userData when it loads
  useEffect(() => {
    if (userData?.settings) {
      const settings = userData.settings;
      const root = document.documentElement;
      
      // Apply theme
      if (settings.theme) {
        if (settings.theme === 'system') {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          if (prefersDark) {
            root.classList.add('dark');
            setDarkMode(true);
          } else {
            root.classList.remove('dark');
            setDarkMode(false);
          }
        } else if (settings.theme === 'dark') {
          root.classList.add('dark');
          setDarkMode(true);
        } else {
          root.classList.remove('dark');
          setDarkMode(false);
        }
      }
      
      // Apply font size
      if (settings.accessibility?.fontSize) {
        const fontSizes = {
          small: '14px',
          medium: '16px',
          large: '18px',
          xlarge: '20px',
        };
        root.style.fontSize = fontSizes[settings.accessibility.fontSize] || fontSizes.medium;
      }
      
      // Apply reduced motion
      if (settings.accessibility?.reducedMotion) {
        root.classList.add('reduce-motion');
        root.style.setProperty('--motion-duration', '0s');
      } else {
        root.classList.remove('reduce-motion');
        root.style.removeProperty('--motion-duration');
      }
      
      // Apply high contrast
      if (settings.accessibility?.highContrast) {
        root.classList.add('high-contrast');
      } else {
        root.classList.remove('high-contrast');
      }
      
      // Apply language
      if (settings.language) {
        document.documentElement.lang = settings.language;
      }
    }
  }, [userData?.settings]);

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
    const loadUserData = async (userId, sessionUser = null) => {
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

        let authUser = sessionUser || user; // Use provided sessionUser or current user state
        
        try {
            // 2. Safe Auth Retrieval (only if we don't have user data)
            // Use session user if provided, otherwise fetch (but prefer current user state)
            if (!authUser) {
                const { data: authData } = await supabase.auth.getUser();
                authUser = authData?.user || null;
            }
            
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
                
                // Create minimal userData immediately from session user (prevents blocking)
                const metadata = currentUser.user_metadata || {};
                const minimalUserData = {
                    id: currentUser.id,
                    firstName: metadata.first_name || metadata.given_name || 'User',
                    lastName: metadata.last_name || metadata.family_name || '',
                    email: currentUser.email || '',
                    accountTypes: ['Fan'],
                    activeProfileRole: 'Fan',
                    photoURL: metadata.avatar_url || metadata.picture || null,
                    settings: {},
                    effectiveDisplayName: metadata.first_name || metadata.given_name || 'User'
                };
                setUserData(minimalUserData);
                
                // Clear loading immediately to show UI
                if (!initialSessionHandledRef.current) {
                    setLoading(false);
                    initialSessionHandledRef.current = true;
                }
                
                // Load full user data in background (will update userData when complete)
                loadUserData(currentUser.id, currentUser).catch(err => {
                    console.error("User data load failed:", err);
                });
            } else {
                setUser(null);
                setUserData(null);
                // No user - clear loading immediately
                if (!initialSessionHandledRef.current) {
                    setLoading(false);
                    initialSessionHandledRef.current = true;
                }
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
        // loadInitialSession already handled this, so just sync state if needed
        if (event === 'INITIAL_SESSION') {
            if (currentUser && currentUser.id) {
                setUser(currentUser);
                // Load userData in background if we don't have it yet
                if (!userData) {
                    loadUserData(currentUser.id).catch(err => {
                        console.error("Background user data load failed:", err);
                    });
                }
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

  const handleLogout = useCallback(async () => {
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
  }, [navigate]);

  // Show loading spinner while we're checking session or loading userData
  // This prevents flashing between AuthWizard and MainLayout
  if (loading) {
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
    return (
      <Suspense fallback={<div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1d21]"><Loader2 className="animate-spin text-brand-blue" size={48} /></div>}>
        <AuthWizard darkMode={darkMode} toggleTheme={toggleTheme} onSuccess={() => navigate('/')} isNewUser={false} />
      </Suspense>
    );
  }
  
  // CRITICAL: If user exists but no userData, show loading (not AuthWizard)
  // This prevents flashing - we wait for userData before showing UI
  if (isAuthenticated && !hasUserData && !isOnLoginPage && !isTestLoginPage) {
    // UserData is still loading - show loading spinner instead of AuthWizard
    // This prevents the flash between AuthWizard and MainLayout
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1d21]">
        <Loader2 className="animate-spin text-brand-blue" size={48} />
      </div>
    );
  }
  
  // Handle test login page (always show login, route to debug report)
  if (isTestLoginPage) {
    if (isAuthenticated && hasUserData) {
      // Already logged in - redirect to debug report
      navigate('/debug-report', { replace: true });
      return null;
    }
    // Show login form - route to debug report on success
    return (
      <Suspense fallback={<div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1d21]"><Loader2 className="animate-spin text-brand-blue" size={48} /></div>}>
        <AuthWizard darkMode={darkMode} toggleTheme={toggleTheme} onSuccess={() => navigate('/debug-report')} isNewUser={false} />
      </Suspense>
    );
  }
  
  // Handle login page
  if (isOnLoginPage) {
    if (isAuthenticated && hasUserData) {
      // Already logged in - redirect to dashboard
      navigate('/', { replace: true });
      return null;
    }
    // Show login form - normal flow
    return (
      <Suspense fallback={<div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1d21]"><Loader2 className="animate-spin text-brand-blue" size={48} /></div>}>
        <AuthWizard darkMode={darkMode} toggleTheme={toggleTheme} onSuccess={() => navigate('/')} isNewUser={false} />
      </Suspense>
    );
  }
  
  // Handle OAuth onboarding
  if (isAuthenticated && !hasUserData && isFromSignup) {
    return (
      <Suspense fallback={<div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1d21]"><Loader2 className="animate-spin text-brand-blue" size={48} /></div>}>
        <AuthWizard user={user} isNewUser={true} darkMode={darkMode} toggleTheme={toggleTheme} onSuccess={() => navigate('/debug-report')} />
      </Suspense>
    );
  }
  
  // Require authentication for all other routes
  if (!isAuthenticated || !hasUserData) {
    // This should be caught above, but double-check
    return (
      <Suspense fallback={<div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1d21]"><Loader2 className="animate-spin text-brand-blue" size={48} /></div>}>
        <AuthWizard darkMode={darkMode} toggleTheme={toggleTheme} onSuccess={() => navigate('/')} isNewUser={false} />
      </Suspense>
    );
  }

  // Render app with full layout (Sidebar + Navbar + Content)
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1a1d21]">
      <Toaster position="bottom-right" toastOptions={{ style: { background: '#333', color: '#fff' } }} />
      
      {/* Check if we're on a special route that needs different layout */}
      {location.pathname === '/settings' || location.pathname === '/debug-report' ? (
        // Settings and Debug Report use simple layout
        <main className="p-6">
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin text-brand-blue" size={32} /></div>}>
            <AppRoutes
              user={user}
              userData={userData}
              loading={loading}
              darkMode={darkMode}
              toggleTheme={toggleTheme}
              handleLogout={handleLogout}
            />
          </Suspense>
        </main>
      ) : (
        // All other routes use MainLayout with Sidebar + Navbar
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin text-brand-blue" size={32} /></div>}>
          <MainLayout
            user={user}
            userData={userData}
            loading={loading}
            darkMode={darkMode}
            toggleTheme={toggleTheme}
            handleLogout={handleLogout}
          />
        </Suspense>
      )}
    </div>
  );
}
