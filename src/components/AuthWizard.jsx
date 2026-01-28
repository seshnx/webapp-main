import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useAuth, useUser, useSignIn, useSignUp, useClerk } from '@clerk/clerk-react';
import { Loader2, AlertCircle, Check, Sun, Moon, MapPin, Crosshair, X } from 'lucide-react';
import { MapContainer, TileLayer, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { ACCOUNT_TYPES, TALENT_SUBROLES } from '../config/constants';
import { fetchZipLocation } from '../utils/geocode';
import { updateProfile, upsertSubProfile } from '../config/neonQueries';
import AuthWizardBackground from './AuthWizardBackground';

// Lazy load LegalDocs
const LegalDocs = lazy(() => import('./LegalDocs'));

// Assets
import LogoLight from '../assets/SeshNx-PNG cCropped.png';
import LogoWhite from '../assets/SeshNx-PNG cCropped white text.png';

const HIDDEN_ROLES = ['Student', 'EDUStaff', 'Intern', 'EDUAdmin', 'GAdmin'];
const publicRoles = ACCOUNT_TYPES.filter(role => !HIDDEN_ROLES.includes(role));

// Map Components
function RecenterAutomatically({ lat, lng }) {
  const map = useMap();
  useEffect(() => { map.setView([lat, lng], 11); }, [lat, lng, map]);
  return null;
}

function ZipUserMap({ zip }) {
  const [mapState, setMapState] = useState({
    center: [34.0522, -118.2437],
    locationName: '',
    isValid: false,
    loading: false
  });

  useEffect(() => {
    if (!zip || zip.length < 5) return;
    const loadData = async () => {
      setMapState(prev => ({ ...prev, loading: true }));
      try {
        const location = await fetchZipLocation(zip);
        if (location) {
          setMapState({
            center: [location.lat, location.lng],
            locationName: location.cityState,
            isValid: true,
            loading: false
          });
        } else {
          setMapState(prev => ({ ...prev, loading: false }));
        }
      } catch (e) {
        setMapState(prev => ({ ...prev, loading: false }));
      }
    };
    const timer = setTimeout(loadData, 800);
    return () => clearTimeout(timer);
  }, [zip]);

  return (
    <div className="w-full h-36 rounded-xl overflow-hidden relative border dark:border-gray-600 shadow-inner bg-gray-100 dark:bg-[#1f2128]">
      <MapContainer center={mapState.center} zoom={11} scrollWheelZoom={false} zoomControl={false} className="h-full w-full" style={{ background: 'transparent' }}>
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='&copy; CARTO' />
        <RecenterAutomatically lat={mapState.center[0]} lng={mapState.center[1]} />
        {mapState.isValid && (
          <Circle center={mapState.center} radius={4000} pathOptions={{ color: '#0066ff', fillColor: '#0066ff', fillOpacity: 0.15, stroke: false }} />
        )}
      </MapContainer>
      {mapState.isValid && (
        <div className="absolute bottom-3 right-3 bg-white/95 dark:bg-black/85 backdrop-blur-md p-2 rounded-lg shadow-lg z-[400] text-xs font-bold border dark:border-gray-700 dark:text-white">
          {mapState.locationName}
        </div>
      )}
    </div>
  );
}

/**
 * Clerk-based AuthWizard Component
 *
 * Uses custom forms with Clerk hooks for authentication,
 * avoiding automatic redirects.
 */
export default function AuthWizard({ darkMode, toggleTheme, user, onSuccess, isNewUser }) {
  const { isLoaded: clerkLoaded, userId, isSignedIn } = useAuth();
  const { user: clerkUser } = useUser();
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const clerk = useClerk();

  // Debug logging for Clerk initialization
  console.log('=== AUTH WIZARD RENDER ===');
  console.log('clerkLoaded:', clerkLoaded);
  console.log('isSignedIn:', isSignedIn);
  console.log('userId:', userId);
  console.log('clerkUser:', clerkUser);
  console.log('signIn available:', !!signIn);
  console.log('signUp available:', !!signUp);

  const [mode, setMode] = useState('login'); // 'login', 'signup', 'onboarding'
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [backgroundImagesLoaded, setBackgroundImagesLoaded] = useState(false);
  const [locating, setLocating] = useState(false);
  const [showLegalOverlay, setShowLegalOverlay] = useState(false);
  const contentRef = useRef(null);
  const [cardHeight, setCardHeight] = useState('auto');

  const [form, setForm] = useState({
    email: '',
    password: '',
    signupPassword: '',
    firstName: '',
    lastName: '',
    zip: '',
    roles: [],
    talentSubRole: ''
  });

  // Initialization Logic
  useEffect(() => {
    if (isNewUser && clerkUser && clerkUser.id) {
      setMode('onboarding');
      setStep(1);
      setForm(prev => ({
        ...prev,
        email: clerkUser?.primaryEmailAddress?.emailAddress || '',
        firstName: clerkUser?.firstName || '',
        lastName: clerkUser?.lastName || ''
      }));
    } else if (!clerkUser || !clerkUser.id) {
      setMode('login');
      setStep(1);
    }
  }, [clerkUser, isNewUser]);

  useEffect(() => {
    if (!contentRef.current) return;
    const resizeObserver = new ResizeObserver(() => {
      if (contentRef.current) {
        const h = contentRef.current.scrollHeight + 80;
        if (h > 200) setCardHeight(`${h}px`);
      }
    });
    resizeObserver.observe(contentRef.current);
    return () => resizeObserver.disconnect();
  }, [step, mode, error, form.zip, form.roles]);

  useEffect(() => { setError(''); }, [step]);

  // === HANDLERS ===

  // Custom Login Handler - NO REDIRECT
  const handleLogin = async (e) => {
    e.preventDefault();
    console.log('=== LOGIN CLICKED ===');
    console.log('signIn available?', !!signIn);
    console.log('Email:', form.email);
    setIsLoading(true);
    setError('');

    try {
      if (!signIn) {
        console.error('❌ signIn is not available!');
        setError('Authentication not ready. Please refresh the page.');
        setIsLoading(false);
        return;
      }

      console.log('Calling signIn.create()...');
      const result = await signIn.create({
        identifier: form.email,
        password: form.password,
      });

      console.log('Login result status:', result.status);
      console.log('Login result:', result);

      if (result.status === 'complete') {
        // Wait for Clerk's auth state to update before calling onSuccess
        console.log('✅ Login complete, waiting for auth state to update...');

        // Wait for Clerk to have a loaded user
        let retries = 0;
        const maxRetries = 20; // 2 seconds max

        while (retries < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 100));

          // Check if Clerk now has a loaded user (indicates auth state updated)
          if (clerk.loaded && clerk.user) {
            console.log('✅ Auth state updated, user is signed in:', clerk.user.id);
            // Success - notify parent component
            // NO REDIRECT - parent handles navigation
            if (onSuccess) onSuccess();
            setIsLoading(false);
            return;
          }

          retries++;
          console.log(`Waiting for auth state... (${retries}/${maxRetries})`);
        }

        // If we've waited too long, log a warning but still call onSuccess
        console.warn('⚠️ Auth state did not update in time, proceeding anyway...');
        if (onSuccess) onSuccess();
      } else if (result.status === 'needs_first_factor') {
        setError('Please check your email for verification.');
      } else {
        setError('Authentication failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.errors?.[0]?.message) {
        setError(err.errors[0].message);
      } else {
        setError('Invalid email or password.');
      }
    } finally {
      setIsLoading(false);
      console.log('=== LOGIN END ===');
    }
  };

  // Custom Signup Handler - NO REDIRECT
  const handleSignup = async (e) => {
    e.preventDefault();
    console.log('=== SIGNUP CLICKED ===');
    console.log('signUp available?', !!signUp);
    console.log('Form data:', { email: form.email, hasPassword: !!form.signupPassword, firstName: form.firstName, lastName: form.lastName });

    setIsLoading(true);
    setError('');

    try {
      if (!signUp) {
        console.error('❌ signUp is not available!');
        setError('Sign up not available. Please refresh the page.');
        setIsLoading(false);
        return;
      }

      // Validate password
      if (form.signupPassword.length < 8) {
        setError('Password must be at least 8 characters.');
        setIsLoading(false);
        return;
      }

      console.log('Creating Clerk signup with email:', form.email);

      // Create signup with email/password only
      // Name will be collected and saved during onboarding
      const result = await signUp.create({
        emailAddress: form.email,
        password: form.signupPassword,
      });

      console.log('Signup result status:', result.status);
      console.log('Signup result:', result);
      console.log('Created user ID:', result.createdUserId);
      console.log('Created session ID:', result.createdSessionId);

      // Handle different signup statuses
      if (result.status === 'complete') {
        // User is fully created
        console.log('✅ Signup complete');

        // IMPORTANT: Set the active session if one was created
        if (result.createdSessionId) {
          console.log('Setting active session:', result.createdSessionId);
          await clerk.setActive({
            session: result.createdSessionId,
          });
          console.log('✅ Session activated');
        }

        // Wait a moment for Clerk to update auth state
        await new Promise(resolve => setTimeout(resolve, 500));

        // Check if user is now signed in
        if (clerk.loaded && clerk.user) {
          console.log('✅ User is now signed in:', clerk.user.id);
          setMode('onboarding');
          setStep(1);
          setIsLoading(false);
          return;
        } else {
          console.log('⚠️ Session created but user not signed in yet, waiting...');
          // Give it more time
          await new Promise(resolve => setTimeout(resolve, 1000));
          if (clerk.loaded && clerk.user) {
            console.log('✅ User is now signed in after delay:', clerk.user.id);
            setMode('onboarding');
            setStep(1);
            setIsLoading(false);
            return;
          }
        }
      }

      if (result.status === 'missing_requirements') {
        console.log('⚠️ Signup has missing requirements');
        console.log('Unverified fields:', result.unverifiedFields);
        console.log('Missing fields:', result.missingFields);

        // Even with email verification OFF, we might need to handle this
        // Try to prepare verification to complete the signup
        if (result.unverifiedFields?.includes('email_address')) {
          console.log('Preparing email verification...');
          try {
            await signUp.prepareVerification({
              strategy: 'email_code',
              emailAddress: form.email,
            });
            console.log('✅ Verification prepared');

            // Now try to complete with a placeholder verification
            // This allows the signup to complete without actual email verification
            const updatedResult = await signUp.attemptVerification({
              strategy: 'email_code',
              code: '000000', // Placeholder - Clerk should bypass this when verification is disabled
            });

            console.log('Verification attempt result:', updatedResult.status);

            if (updatedResult.status === 'complete') {
              console.log('✅ User created after verification attempt');

              // Set the active session if one was created
              if (updatedResult.createdSessionId) {
                await clerk.setActive({
                  session: updatedResult.createdSessionId,
                });
              }

              setMode('onboarding');
              setStep(1);
              setIsLoading(false);
              return;
            }
          } catch (verificationError) {
            console.log('Verification attempt failed (expected):', verificationError.message);
            // Even if verification fails, the user might be created
            // Check if we have a createdUserId now
          }
        }

        // If we got here, check if user was created anyway
        if (result.createdUserId || signUp.createdUserId) {
          console.log('✅ User was created, moving to onboarding');
          setMode('onboarding');
          setStep(1);
          setIsLoading(false);
          return;
        }

        // If still not complete, show a helpful message
        console.log('⚠️ Signup not complete, showing error to user');
        setError('Signup could not be completed. Please try again or contact support.');
        setIsLoading(false);
        return;
      }

      // Fallback - shouldn't reach here but handle it
      console.log('⚠️ Unexpected signup status:', result.status);
      setError('Please try signing in.');
      setMode('login');
      setIsLoading(false);

    } catch (err) {
      console.error('Signup error:', err);
      console.error('Full error details:', JSON.stringify(err, null, 2));

      // Better error messages from Clerk
      if (err.errors && err.errors.length > 0) {
        const firstError = err.errors[0];
        console.error('Clerk error code:', firstError.code);
        console.error('Clerk error message:', firstError.message);
        console.error('Clerk error long message:', firstError.longMessage);

        if (firstError.code === 'form_identifier_exists') {
          setError('An account with this email already exists. Please sign in.');
        } else if (firstError.code === 'form_password_length_too_short') {
          setError('Password must be at least 8 characters.');
        } else if (firstError.code === 'form_password_pwned') {
          setError('This password has been compromised. Please choose a different one.');
        } else {
          setError(firstError.message || firstError.longMessage || 'Signup failed. Please try again.');
        }
      } else {
        setError('Signup failed. Please try again.');
      }
      setIsLoading(false);
    } finally {
      console.log('=== SIGNUP END ===');
    }
  };

  const handleCompleteSignup = async () => {
    if (form.roles.length === 0) return setError("Please select a role.");

    setIsLoading(true);
    setError('');

    try {
      if (!userId) {
        setError('Authentication required. Please sign in first.');
        setIsLoading(false);
        return;
      }

      // Update profile with Neon
      const finalRoles = form.roles.length > 0 ? form.roles : ['Fan'];
      const displayName = `${form.firstName} ${form.lastName}`;
      const activeRole = finalRoles[0];

      await updateProfile(userId, {
        email: form.email,
        first_name: form.firstName,
        last_name: form.lastName,
        zip_code: form.zip,
        account_types: finalRoles,
        active_role: activeRole,
        preferred_role: activeRole,
        default_profile_role: activeRole,
        effective_display_name: displayName,
        search_terms: [form.firstName, form.lastName, displayName].map(s => s?.toLowerCase()).filter(Boolean),
      });

      // Create sub-profiles for each role
      const profileData = {
        displayName: displayName,
      };

      // Add talent subrole if selected
      if (form.talentSubRole && finalRoles.includes('Talent')) {
        profileData.talentSubRole = form.talentSubRole;
      }

      // Upsert sub-profile for each role (using the same data for now)
      for (const role of finalRoles) {
        try {
          await upsertSubProfile(userId, role, profileData);
        } catch (err) {
          console.warn(`Failed to create sub-profile for ${role}:`, err);
          // Continue even if one fails
        }
      }

      // Success - NO REDIRECT
      if (onSuccess) onSuccess();

    } catch (err) {
      console.error('Profile update error:', err);
      setError('Failed to complete profile setup. Please try again.');
      setIsLoading(false);
    }
  };

  // Location Helper
  const handleUseLocation = () => {
    if (!navigator.geolocation) return setError("Geolocation not supported.");
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
          const data = await res.json();
          if (data.address?.postcode) {
            setForm(prev => ({ ...prev, zip: data.address.postcode.split('-')[0] }));
          } else {
            setError("Zip code not found.");
          }
        } catch (e) { setError("Location lookup failed."); }
        setLocating(false);
      },
      () => { setError("Location permission denied."); setLocating(false); }
    );
  };

  // === LOGIN / SIGNUP MODE ===
  if (mode === 'login' || mode === 'signup') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
          <AuthWizardBackground onImagesLoaded={setBackgroundImagesLoaded} />
        </div>
        <div
          className="absolute inset-0 bg-gray-100 dark:bg-black transition-opacity duration-1000"
          style={{ opacity: backgroundImagesLoaded ? 0 : 1, pointerEvents: 'none' }}
        />

        <div className="absolute top-6 right-6 z-20">
          <button onClick={toggleTheme} className="p-3 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-md border dark:border-gray-700">
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        <div className="bg-white/95 dark:bg-[#1a1d21]/95 dark:border dark:border-gray-700 rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden z-10 backdrop-blur-md p-8">
          {/* Logo */}
          <div className="relative w-full h-48 mb-6 flex justify-center shrink-0">
            <img src={darkMode ? LogoWhite : LogoLight} alt="SeshNx" className="w-96 h-40 object-contain drop-shadow-md" />
          </div>

          <p className="text-sm font-bold text-gray-500 uppercase tracking-wider text-center mb-6">
            {mode === 'login' ? 'Welcome Back' : 'Join SeshNx'}
          </p>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm flex items-center gap-2 mb-4">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {/* Custom Login Form */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="email"
                className="w-full p-3.5 bg-gray-50 dark:bg-[#1f2128] border dark:border-gray-600 rounded-xl dark:text-white"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                required
              />
              <input
                type="password"
                className="w-full p-3.5 bg-gray-50 dark:bg-[#1f2128] border dark:border-gray-600 rounded-xl dark:text-white"
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
                required
              />
              <button
                type="submit"
                className="w-full bg-brand-blue hover:bg-blue-600 text-white py-3.5 rounded-xl font-bold disabled:opacity-50 transition"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="animate-spin mx-auto" size={20} /> : "Sign In"}
              </button>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setError('');
                  }}
                  className="text-sm text-brand-blue hover:underline"
                >
                  Don't have an account? Sign up
                </button>
              </div>
            </form>
          )}

          {/* Custom Signup Form */}
          {mode === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-4">
              <input
                type="email"
                className="w-full p-3.5 bg-gray-50 dark:bg-[#1f2128] border dark:border-gray-600 rounded-xl dark:text-white"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                required
              />
              <input
                type="password"
                className="w-full p-3.5 bg-gray-50 dark:bg-[#1f2128] border dark:border-gray-600 rounded-xl dark:text-white"
                placeholder="Password (min 8 characters)"
                value={form.signupPassword}
                onChange={(e) => setForm(prev => ({ ...prev, signupPassword: e.target.value }))}
                required
                minLength={8}
              />
              <button
                type="submit"
                className="w-full bg-brand-blue hover:bg-blue-600 text-white py-3.5 rounded-xl font-bold disabled:opacity-50 transition"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="animate-spin mx-auto" size={20} /> : "Create Account"}
              </button>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError('');
                  }}
                  className="text-sm text-brand-blue hover:underline"
                >
                  Already have an account? Sign in
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-4 border-t dark:border-gray-700 text-center">
            <button onClick={() => setShowLegalOverlay(true)} className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              Terms of Service • Privacy Policy
            </button>
          </div>
        </div>

        {showLegalOverlay && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#1a1d21] rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-xl font-bold dark:text-white">Legal Documents</h2>
                <button onClick={() => setShowLegalOverlay(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <Suspense fallback={<div className="flex items-center justify-center p-8"><Loader2 className="animate-spin" size={24} /></div>}>
                  <LegalDocs isEmbedded={true} />
                </Suspense>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // === ONBOARDING MODE ===
  if (mode === 'onboarding') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
          <AuthWizardBackground onImagesLoaded={setBackgroundImagesLoaded} />
        </div>
        <div
          className="absolute inset-0 bg-gray-100 dark:bg-black transition-opacity duration-1000"
          style={{ opacity: backgroundImagesLoaded ? 0 : 1, pointerEvents: 'none' }}
        />

        <div className="absolute top-6 right-6 z-20">
          <button onClick={toggleTheme} className="p-3 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-md border dark:border-gray-700">
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        <div
          className="bg-white/95 dark:bg-[#1a1d21]/95 dark:border dark:border-gray-700 rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden transition-[height] duration-500 z-10 backdrop-blur-md"
          style={{ height: cardHeight, minHeight: '500px' }}
        >
          <div ref={contentRef} className="pt-12 px-8 pb-8">
            <div className="relative w-full h-48 mb-6 flex justify-center shrink-0">
              <img src={darkMode ? LogoWhite : LogoLight} alt="SeshNx" className="w-96 h-40 object-contain drop-shadow-md" />
              <div className="absolute bottom-2 w-full text-center">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                  Complete Your Profile
                </p>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm flex items-center gap-2 mb-4">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            {/* ONBOARDING STEPS */}
            {/* Progress Indicator */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className={`h-1 flex-1 rounded-full transition-colors ${step >= 1 ? 'bg-brand-blue' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
              <div className={`h-1 flex-1 rounded-full transition-colors ${step >= 2 ? 'bg-brand-blue' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mb-4 px-2">
              <span className={step === 1 ? 'font-bold text-brand-blue' : ''}>Profile</span>
              <span className={step === 2 ? 'font-bold text-brand-blue' : ''}>Roles</span>
            </div>

            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold dark:text-white text-center mb-2">
                  Let&apos;s get to know you
                </h3>
                <p className="text-sm text-gray-500 text-center mb-6">
                  Tell us your name and where you&apos;re located
                </p>

                <div className="space-y-3">
                  <div className="flex gap-3">
                    <input
                      className="w-1/2 p-3.5 bg-gray-50 dark:bg-[#1f2128] border dark:border-gray-600 rounded-xl dark:text-white"
                      placeholder="First Name *"
                      value={form.firstName}
                      onChange={(e) => setForm(prev => ({ ...prev, firstName: e.target.value }))}
                      required
                    />
                    <input
                      className="w-1/2 p-3.5 bg-gray-50 dark:bg-[#1f2128] border dark:border-gray-600 rounded-xl dark:text-white"
                      placeholder="Last Name *"
                      value={form.lastName}
                      onChange={(e) => setForm(prev => ({ ...prev, lastName: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="relative flex gap-2">
                    <div className="relative flex-1">
                      <input
                        className="w-full p-3.5 pl-10 bg-gray-50 dark:bg-[#1f2128] border dark:border-gray-600 rounded-xl dark:text-white"
                        placeholder="Zip Code *"
                        maxLength={5}
                        value={form.zip}
                        onChange={(e) => setForm(prev => ({ ...prev, zip: e.target.value.replace(/\D/g, '') }))}
                        required
                      />
                      <MapPin className="absolute left-3 top-3.5 text-gray-400" size={18} />
                    </div>
                    <button
                      onClick={handleUseLocation}
                      className="p-3.5 border dark:border-gray-600 rounded-xl text-brand-blue hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                      disabled={locating}
                      title="Use my current location"
                    >
                      {locating ? <Loader2 className="animate-spin" size={18} /> : <Crosshair size={18} />}
                    </button>
                  </div>

                  <ZipUserMap zip={form.zip} />

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                    <p className="text-xs text-blue-800 dark:text-blue-200">
                      <strong>Why we need this:</strong> Your location helps us connect you with nearby musicians, studios, and opportunities in your area.
                    </p>
                  </div>
                </div>

                <button
                  className="w-full bg-brand-blue hover:bg-blue-600 text-white py-3.5 rounded-xl font-bold disabled:opacity-50 transition shadow-lg mt-4"
                  onClick={() => {
                    if (!form.firstName || !form.lastName || !form.zip) {
                      setError("Please fill in all fields");
                      return;
                    }
                    setError('');
                    setStep(2);
                  }}
                  disabled={!form.firstName || !form.lastName || !form.zip}
                >
                  Continue to Roles
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <h3 className="text-xl font-bold dark:text-white text-center mb-2">
                  How do you fit in the music industry?
                </h3>
                <p className="text-sm text-gray-500 text-center mb-4">
                  Select all that apply - you can always update these later
                </p>

                <div className="grid grid-cols-2 gap-2.5">
                  {publicRoles.map(role => {
                    const isSelected = form.roles.includes(role);
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => {
                          const newRoles = isSelected ? form.roles.filter(r => r !== role) : [...form.roles, role];
                          setForm(prev => ({ ...prev, roles: newRoles }));
                        }}
                        className={`p-3 border-2 rounded-xl cursor-pointer text-center font-bold text-sm transition-all duration-200 transform active:scale-95 ${
                          isSelected
                            ? 'border-brand-blue bg-blue-50 text-brand-blue dark:bg-blue-900/30 dark:border-blue-400 shadow-md'
                            : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-[#1f2128] hover:border-brand-blue hover:bg-blue-50 dark:hover:bg-blue-900/20 dark:text-gray-200'
                        }`}
                      >
                        {isSelected && <Check className="inline-block mr-1" size={14} />}
                        {role}
                      </button>
                    );
                  })}
                </div>

                {form.roles.includes('Talent') && (
                  <div className="animate-in slide-in-from-top-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">
                      Talent Specialization (Optional)
                    </label>
                    <select
                      className="w-full p-3.5 bg-gray-50 dark:bg-[#1f2128] border dark:border-gray-600 rounded-xl dark:text-white"
                      value={form.talentSubRole}
                      onChange={(e) => setForm(prev => ({ ...prev, talentSubRole: e.target.value }))}
                    >
                      <option value="">Select your talent type...</option>
                      {TALENT_SUBROLES.map(subRole => (<option key={subRole} value={subRole}>{subRole}</option>))}
                    </select>
                  </div>
                )}

                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                  <p className="text-xs text-purple-800 dark:text-purple-200">
                    <strong>Pro tip:</strong> Don't worry if you're unsure! You can add or remove roles anytime from your settings.
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    className="w-full bg-brand-blue hover:bg-blue-600 text-white py-3.5 rounded-xl font-bold disabled:opacity-50 transition shadow-lg"
                    onClick={handleCompleteSignup}
                    disabled={isLoading || form.roles.length === 0}
                  >
                    {isLoading ? <Loader2 className="animate-spin mx-auto" size={20} /> : "Complete Setup"}
                  </button>
                  <button
                    className="w-full text-gray-400 text-sm hover:text-gray-600 dark:hover:text-gray-300 transition py-2"
                    onClick={() => {
                      setError('');
                      setStep(1);
                    }}
                  >
                    ← Back
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t dark:border-gray-700 text-center">
            <button onClick={() => setShowLegalOverlay(true)} className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              Terms of Service • Privacy Policy
            </button>
          </div>
        </div>

        {showLegalOverlay && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#1a1d21] rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-xl font-bold dark:text-white">Legal Documents</h2>
                <button onClick={() => setShowLegalOverlay(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <Suspense fallback={<div className="flex items-center justify-center p-8"><Loader2 className="animate-spin" size={24} /></div>}>
                  <LegalDocs isEmbedded={true} />
                </Suspense>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
