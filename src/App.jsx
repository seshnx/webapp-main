import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from './config/supabase'; 
import { Loader2 } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

// Core components
import AuthWizard from './components/AuthWizard';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  
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
    if (!supabase) {
        setLoading(false);
        return;
    }

    /**
     * ROBUST USER DATA LOADER
     * This function is designed to never throw an uncaught error.
     * It will always set userData to *something*, preventing the "null account" crash.
     */
    const loadUserData = async (userId) => {
        // 1. Sanity Check
        if (!userId) {
            setUserData(null);
            return;
        }

        try {
            // 2. Safe Auth Retrieval
            // We fetch the latest auth object to get metadata (names/avatar) even if the profile table is empty
            const { data: authData } = await supabase.auth.getUser();
            const authUser = authData?.user || null;
            
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
                
                // Try to create profile
                const { error: createError } = await supabase
                    .from('profiles')
                    .insert({
                        id: userId,
                        email: email,
                        first_name: firstName,
                        last_name: lastName,
                        avatar_url: authUser?.user_metadata?.avatar_url || authUser?.user_metadata?.picture || null,
                        account_types: ['Fan'],
                        active_role: 'Fan',
                        preferred_role: 'Fan',
                        effective_display_name: effectiveName,
                        search_terms: [
                            firstName?.toLowerCase(),
                            lastName?.toLowerCase(),
                            effectiveName.toLowerCase()
                        ].filter(Boolean),
                        settings: {},
                        updated_at: new Date().toISOString()
                    });
                
                if (createError && createError.code !== '23505') { // Ignore duplicate key errors
                    console.error("Error creating profile:", createError);
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
            // FAILSAFE: Ensure we still have a user object so the app doesn't white-screen
            if (!userData) {
                setUserData({
                    id: userId,
                    firstName: 'User',
                    lastName: '',
                    accountTypes: ['Fan'],
                    activeProfileRole: 'Fan',
                    effectiveDisplayName: 'User'
                });
            }
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
                setLoading(false);
                return;
            }
            
            // Validate session exists and has a valid user
            const currentUser = session?.user ?? null;
            
            if (currentUser && currentUser.id) {
                console.log('Session restored:', currentUser.id);
                setUser(currentUser);
                await loadUserData(currentUser.id);
            } else {
                setUser(null);
                setUserData(null);
            }
        } catch (err) {
            console.error("Session check failed:", err);
            setUser(null);
            setUserData(null);
        } finally {
            setLoading(false);
        }
    };
    
    loadInitialSession();

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth event:', event);
        const currentUser = session?.user ?? null;
        
        if (currentUser) {
            setUser(currentUser);
            // Refresh data on sign-in or token refresh
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                await loadUserData(currentUser.id);
            }
        } else if (event === 'SIGNED_OUT') {
            setUser(null);
            setUserData(null);
        }
        
        setLoading(false);
    });

    // 3. Safety timeout to prevent infinite loading screens
    const timeoutId = setTimeout(() => {
        if (loading) {
            console.warn("Force clearing loading state after timeout");
            setLoading(false);
        }
    }, 8000);

    return () => {
        subscription.unsubscribe();
        clearTimeout(timeoutId);
    };
  }, []); // Empty dependency array = runs once on mount

  const handleLogout = async () => {
      try {
          if (supabase) {
              await supabase.auth.signOut();
          }
      } catch (err) {
          console.error("Logout error:", err);
      } finally {
          setUser(null);
          setUserData(null);
          navigate('/login');
      }
  };

  // Show loading spinner while checking auth state
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
  const isOnLoginPage = location.pathname === '/login';
  
  // Handle login page
  if (isOnLoginPage) {
    if (isAuthenticated) {
      // Already logged in - redirect to dashboard
      navigate('/', { replace: true });
      return null;
    }
    // Show login form
    return <AuthWizard darkMode={darkMode} toggleTheme={toggleTheme} onSuccess={() => {}} isNewUser={false} />;
  }
  
  // Handle OAuth onboarding
  if (isAuthenticated && !userData && isFromSignup) {
    return <AuthWizard user={user} isNewUser={true} darkMode={darkMode} toggleTheme={toggleTheme} onSuccess={() => window.location.href = '/'} />;
  }
  
  // Require authentication for all other routes
  if (!isAuthenticated) {
    navigate('/login', { replace: true });
    return null;
  }

  // Render app with just dashboard
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1a1d21]">
      <Toaster position="bottom-right" toastOptions={{ style: { background: '#333', color: '#fff' } }} />
      
      {/* Simple header with logout */}
      <div className="bg-white dark:bg-[#1f2128] border-b dark:border-gray-700 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold dark:text-white">SeshNx</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>

      {/* Main content */}
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
    </div>
  );
}
