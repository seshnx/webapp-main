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

    // Helper function to load user data
    const loadUserData = async (userId) => {
        if (!userId) {
            setUserData(null);
            return;
        }

        try {
            // Get current auth user for metadata fallback
            const { data: { user: authUser } } = await supabase.auth.getUser();
            
            // Fetch Profile from 'profiles' table
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();
            
            if (profile && !profileError) {
                // Normalize data structure for the app
                // Even if account_types is empty, set a default so user can use the app
                const accountTypes = profile.account_types && profile.account_types.length > 0 
                    ? profile.account_types 
                    : ['Fan'];
                
                // Get user email from auth if not in profile
                let userEmail = profile.email;
                if (!userEmail && user?.email) {
                    userEmail = user.email;
                }
                
                // Get name from profile or auth metadata
                const firstName = profile.first_name || user?.user_metadata?.first_name || user?.user_metadata?.given_name || '';
                const lastName = profile.last_name || user?.user_metadata?.last_name || user?.user_metadata?.family_name || '';
                
                // If profile exists but has no name, try to update it from auth metadata
                if (profile && (!firstName || !lastName) && (authUser?.user_metadata || user?.user_metadata)) {
                    const metadata = authUser?.user_metadata || user?.user_metadata;
                    const updates = {};
                    let needsUpdate = false;
                    
                    if (!firstName && (metadata.first_name || metadata.given_name)) {
                        updates.first_name = metadata.first_name || metadata.given_name;
                        needsUpdate = true;
                    }
                    if (!lastName && (metadata.last_name || metadata.family_name)) {
                        updates.last_name = metadata.last_name || metadata.family_name;
                        needsUpdate = true;
                    }
                    if (!userEmail && (authUser?.email || user?.email)) {
                        updates.email = authUser?.email || user?.email;
                        needsUpdate = true;
                    }
                    
                // Calculate effective display name and search terms
                const effectiveFirstName = updates.first_name || firstName;
                const effectiveLastName = updates.last_name || lastName;
                const effectiveEmail = updates.email || userEmail;
                
                if (effectiveFirstName || effectiveLastName) {
                    const effectiveName = effectiveFirstName && effectiveLastName 
                        ? `${effectiveFirstName} ${effectiveLastName}`
                        : effectiveFirstName || effectiveLastName || effectiveEmail?.split('@')[0] || 'User';
                    updates.effective_display_name = effectiveName;
                    
                    // Also update search_terms
                    updates.search_terms = [
                        effectiveFirstName?.toLowerCase(),
                        effectiveLastName?.toLowerCase(),
                        effectiveName.toLowerCase()
                    ].filter(Boolean);
                    
                    needsUpdate = true;
                }
                    
                    if (needsUpdate) {
                        updates.updated_at = new Date().toISOString();
                        // Silently update profile with auth metadata
                        const { error: updateError } = await supabase
                            .from('profiles')
                            .update(updates)
                            .eq('id', userId);
                        
                        if (updateError) {
                            console.warn('Failed to sync auth metadata to profile:', updateError);
                        } else {
                            // Reload profile after update
                            const { data: updatedProfile } = await supabase
                                .from('profiles')
                                .select('*')
                                .eq('id', userId)
                                .single();
                            
                            if (updatedProfile) {
                                // Use updated profile data
                                const updatedFirstName = updatedProfile.first_name || '';
                                const updatedLastName = updatedProfile.last_name || '';
                                const updatedEmail = updatedProfile.email || authUser?.email || user?.email || '';
                                
                                setUserData({
                                    ...updatedProfile,
                                    firstName: updatedFirstName,
                                    lastName: updatedLastName,
                                    email: updatedEmail,
                                    accountTypes: accountTypes,
                                    activeProfileRole: updatedProfile.active_role || accountTypes[0],
                                    photoURL: updatedProfile.avatar_url || authUser?.user_metadata?.avatar_url || authUser?.user_metadata?.picture || null,
                                    displayName: updatedProfile.display_name || null,
                                    effectiveDisplayName: updatedProfile.effective_display_name || 
                                        (updatedFirstName && updatedLastName ? `${updatedFirstName} ${updatedLastName}` : updatedFirstName || updatedLastName || updatedEmail?.split('@')[0] || 'User')
                                });
                                return; // Exit early since we've set userData
                            }
                        }
                    }
                }
                
                setUserData({
                    ...profile,
                    firstName: firstName,
                    lastName: lastName,
                    email: userEmail || profile.email || user?.email || null,
                    accountTypes: accountTypes,
                    activeProfileRole: profile.active_role || accountTypes[0],
                    photoURL: profile.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null,
                    displayName: profile.display_name || null,
                    effectiveDisplayName: profile.effective_display_name || 
                        (firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || userEmail?.split('@')[0] || 'User')
                });
                
                console.log('Profile loaded:', { 
                    userId, 
                    firstName,
                    lastName,
                    hasAccountTypes: profile.account_types?.length > 0,
                    accountTypes: accountTypes 
                });
            } else {
                // Profile doesn't exist - create it from auth data
                console.log('Profile not found, creating from auth data');
                
                const firstName = user?.user_metadata?.first_name || user?.user_metadata?.given_name || '';
                const lastName = user?.user_metadata?.last_name || user?.user_metadata?.family_name || '';
                const email = user?.email || '';
                
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
                        avatar_url: user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null,
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
                
                // Set userData even if creation failed (will retry on next load)
                setUserData({
                    id: userId,
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    accountTypes: ['Fan'],
                    activeProfileRole: 'Fan',
                    photoURL: user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null,
                    settings: {},
                    effectiveDisplayName: firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || email?.split('@')[0] || 'User'
                });
                
                if (profileError && profileError.code !== 'PGRST116') {
                    console.error("Error fetching profile:", profileError);
                }
            }

            // Wallet fetching removed for minimal setup
        } catch (err) {
            console.error("Error fetching user data:", err);
        }
    };

    // 1. Get initial session and load data immediately
    // Increased timeout to 10 seconds to allow for slower storage access
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
            
            // Strict check: user must exist AND have a valid ID AND session must be valid
            if (currentUser && currentUser.id && session && session.access_token) {
                console.log('Session found, user ID:', currentUser.id);
                setUser(currentUser);
                // Load user data without additional timeout - if it fails, user just won't have profile yet
                await loadUserData(currentUser.id);
            } else {
                // No valid session - explicitly clear everything
                console.log('No active session found - clearing user state');
                setUser(null);
                setUserData(null);
            }
            
            setLoading(false);
        } catch (err) {
            console.error("Session check failed:", err);
            // Check if it's a storage-related error
            if (err.message?.includes('storage') || err.message?.includes('localStorage') || err.name === 'QuotaExceededError') {
                console.warn("Storage access blocked - continuing without session persistence");
            }
            setUser(null);
            setUserData(null);
            setLoading(false);
        }
    };
    
    // Load initial session immediately
    loadInitialSession();

    // 2. Listen for auth changes (for subsequent logins/logouts, including OAuth callbacks)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        const currentUser = session?.user ?? null;
        
        if (currentUser && currentUser.id) {
            setUser(currentUser);
            // Load user data - this is critical for OAuth callbacks
            await loadUserData(currentUser.id);
            
            // If this is a SIGNED_IN event (like OAuth callback) and profile has no account_types,
            // set a default so components don't crash
            if (event === 'SIGNED_IN') {
                // Check if profile needs setup
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('account_types, first_name, last_name, avatar_url, active_role')
                    .eq('id', currentUser.id)
                    .single();
                
                // If profile exists but has no account_types, set default
                if (profile && (!profile.account_types || profile.account_types.length === 0)) {
                    console.log('New OAuth user detected - setting default account_types');
                    // Update profile with default Fan role
                    await supabase
                        .from('profiles')
                        .update({ 
                            account_types: ['Fan'],
                            active_role: 'Fan',
                            preferred_role: 'Fan'
                        })
                        .eq('id', currentUser.id);
                    
                    // Reload user data
                    await loadUserData(currentUser.id);
                } else if (!profile) {
                    // Profile doesn't exist yet - set temporary userData so components don't crash
                    setUserData({
                        id: currentUser.id,
                        firstName: currentUser.user_metadata?.first_name || currentUser.user_metadata?.given_name || '',
                        lastName: currentUser.user_metadata?.last_name || currentUser.user_metadata?.family_name || '',
                        accountTypes: ['Fan'],
                        activeProfileRole: 'Fan',
                        photoURL: currentUser.user_metadata?.avatar_url || currentUser.user_metadata?.picture || null
                    });
                }
            }
        } else {
            // Explicitly clear user state on logout or session end
            console.log('Auth state changed: No user - clearing state');
            setUser(null);
            setUserData(null);
        }
        setLoading(false);
    });

    // 3. Safety timeout - ensure loading always resolves (increased to 10s to allow for session check)
    const timeoutId = setTimeout(() => {
        if (loading) {
            console.warn("Loading timeout - forcing loading to false");
            // Don't clear user if we're still loading - session might still be valid
            setLoading(false);
        }
    }, 10000); // 10 second timeout

    return () => {
        subscription.unsubscribe();
        clearTimeout(timeoutId);
    };
  }, []);

  const handleLogout = async () => {
      try {
          if (supabase) {
              const { error } = await supabase.auth.signOut();
              if (error) {
                  console.error("Logout error:", error);
              }
          }
      } catch (err) {
          console.error("Logout failed:", err);
      } finally {
          // Always clear state and navigate, even if signOut fails
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
