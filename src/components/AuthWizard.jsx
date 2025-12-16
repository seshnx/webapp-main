import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../config/supabase';
import { Loader2, AlertCircle, Check, Sun, Moon, MapPin, Crosshair, X } from 'lucide-react';
import { MapContainer, TileLayer, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { ACCOUNT_TYPES, TALENT_SUBROLES } from '../config/constants';
import { fetchZipLocation } from '../utils/geocode';
import LegalDocs from './LegalDocs';
import AuthWizardBackground from './AuthWizardBackground';

// Assets
import LogoLight from '../assets/SeshNx-PNG cCropped.png';
import LogoDark from '../assets/SeshNx-PNG cCropped white text.png';

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

export default function AuthWizard({ darkMode, toggleTheme, user, onSuccess, isNewUser }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'forgot' | 'onboarding'
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [backgroundImagesLoaded, setBackgroundImagesLoaded] = useState(false);
  const [locating, setLocating] = useState(false);
  const [showLegalOverlay, setShowLegalOverlay] = useState(false);
  const contentRef = useRef(null);
  const [cardHeight, setCardHeight] = useState('auto');

  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    zip: '',
    roles: [],
    talentSubRole: ''
  });

  const [passwordValidations, setPasswordValidations] = useState({
    hasUpper: false,
    hasLower: false,
    hasNumber: false,
    isLength: false
  });

  // Initialize mode based on user state
  useEffect(() => {
    if ((user && user.id) || isNewUser) {
      setMode('onboarding');
      setStep(1);
      const fullName = user?.user_metadata?.full_name || user?.user_metadata?.name || '';
      const names = fullName.split(' ');
      setForm(prev => ({
        ...prev,
        email: user?.email || '',
        firstName: names[0] || '',
        lastName: names.slice(1).join(' ') || ''
      }));
    } else {
      setMode('login');
      setStep(1);
    }
  }, [user, isNewUser]);

  // Password validation
  useEffect(() => {
    const p = form.password;
    setPasswordValidations({
      hasUpper: /[A-Z]/.test(p),
      hasLower: /[a-z]/.test(p),
      hasNumber: /[0-9]/.test(p),
      isLength: p.length >= 6
    });
  }, [form.password]);

  const isPasswordValid = Object.values(passwordValidations).every(Boolean);

  // Resize observer for card height
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
  }, [step, mode, error, resetSent, form.zip, form.roles]);

  useEffect(() => { setError(''); }, [step]);

  // === AUTHENTICATION HANDLERS ===

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }
    if (!supabase) {
      setError("Authentication service unavailable.");
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: form.email.trim(),
        password: form.password
      });

      if (loginError) {
        if (loginError.message?.includes('Invalid login credentials') || loginError.message?.includes('Email not confirmed')) {
          setError("Invalid email or password.");
        } else {
          setError(loginError.message || "Failed to sign in.");
        }
        setIsLoading(false);
      }
      // Success - App.jsx handles redirect
    } catch (err) {
      console.error('Login error:', err);
      setError("An unexpected error occurred.");
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!supabase) {
      setError("Authentication service unavailable.");
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: { access_type: 'offline', prompt: 'consent' },
          redirectTo: window.location.origin
        }
      });

      if (oauthError) {
        setError(oauthError.message || "Failed to sign in with Google.");
        setIsLoading(false);
      }
      // OAuth redirects - no need to handle success
    } catch (err) {
      console.error('Google login error:', err);
      setError("An unexpected error occurred.");
      setIsLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!supabase) {
      setError("Authentication service unavailable.");
      return;
    }

    if (mode === 'signup' && !isPasswordValid) {
      setError("Password requirements not met.");
      return;
    }

    if (form.roles.length === 0) {
      setError("Please select at least one role.");
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      let userId = user?.id;

      // Step 1: Create user account if needed
      if (!userId) {
        const { data: signupData, error: signupError } = await supabase.auth.signUp({
          email: form.email.trim(),
          password: form.password,
          options: {
            data: {
              first_name: form.firstName,
              last_name: form.lastName
            },
            emailRedirectTo: window.location.origin
          }
        });

        if (signupError) {
          if (signupError.message?.includes('already registered') || signupError.message?.includes('already exists')) {
            setError("An account with this email already exists. Please sign in instead.");
          } else {
            setError(signupError.message || "Failed to create account.");
          }
          setIsLoading(false);
          return;
        }

        userId = signupData?.user?.id;
        if (!userId) {
          setError("Account created but unable to retrieve user ID. Please try signing in.");
          setIsLoading(false);
          return;
        }
      }

      // Step 2: Wait for trigger to create profile, then update it
      await new Promise(resolve => setTimeout(resolve, 1500));

      const finalRoles = form.roles.length > 0 ? form.roles : ['Fan'];
      
      // Update profile with roles and additional info
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: form.firstName,
          last_name: form.lastName,
          email: form.email.trim(),
          zip_code: form.zip || null,
          account_types: finalRoles,
          active_role: finalRoles[0],
          preferred_role: finalRoles[0],
          talent_sub_role: finalRoles.includes('Talent') ? form.talentSubRole : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (profileError && profileError.code !== 'PGRST116') {
        // PGRST116 = no rows (profile doesn't exist yet)
        console.warn('Profile update warning:', profileError);
        // Try to insert instead
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: form.email.trim(),
            first_name: form.firstName,
            last_name: form.lastName,
            zip_code: form.zip || null,
            account_types: finalRoles,
            active_role: finalRoles[0],
            preferred_role: finalRoles[0],
            talent_sub_role: finalRoles.includes('Talent') ? form.talentSubRole : null,
            settings: {},
            updated_at: new Date().toISOString()
          });

        if (insertError) {
          console.warn('Profile insert also failed:', insertError);
          // Continue anyway - trigger should have created it
        }
      }

      // Step 3: Ensure wallet exists (trigger should have created it)
      await supabase
        .from('wallets')
        .upsert({ user_id: userId, balance: 0 }, { onConflict: 'user_id' })
        .catch(() => {}); // Ignore errors - trigger should handle it

      // Success - reload page
      console.log('✅ Signup completed successfully');
      setIsLoading(false);
      setTimeout(() => {
        window.location.reload();
      }, 500);

    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message || "Failed to complete setup. Please try again.");
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!form.email) {
      setError("Enter email address.");
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(form.email, {
        redirectTo: window.location.origin
      });

      if (resetError) {
        setError(resetError.message);
      } else {
        setResetSent(true);
        setError('');
      }
    } catch (err) {
      setError("Failed to send reset email.");
    }

    setIsLoading(false);
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported.");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
          const data = await res.json();
          if (data.address?.postcode) {
            setForm(prev => ({ ...prev, zip: data.address.postcode.split('-')[0] }));
          } else {
            setError("Could not determine Zip Code.");
          }
        } catch (e) {
          setError("Failed to find location.");
        }
        setLocating(false);
      },
      () => {
        setError("Permission denied.");
        setLocating(false);
      }
    );
  };

  // === UI COMPONENTS ===

  const Requirement = ({ met, text }) => (
    <div className={`flex items-center gap-1.5 text-xs ${met ? 'text-green-600' : 'text-gray-400'}`}>
      {met ? <Check size={12} /> : <div className="w-3 h-3 border rounded-full" />}
      {text}
    </div>
  );

  const getHeaderText = () => {
    if (mode === 'signup') return "Create Account";
    if (mode === 'forgot') return "Recovery";
    if (mode === 'onboarding') return "Finalize Setup";
    return null;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <AuthWizardBackground onImagesLoaded={setBackgroundImagesLoaded} />
      </div>
      <div
        className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-black transition-opacity duration-1000"
        style={{ opacity: backgroundImagesLoaded ? 0 : 1, pointerEvents: 'none' }}
      />

      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={toggleTheme}
          className="p-3 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-md border dark:border-gray-700"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <div
        className="bg-white/95 dark:bg-[#1a1d21]/95 dark:border dark:border-gray-700 rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden transition-[height] duration-500 z-10 backdrop-blur-md"
        style={{ height: cardHeight, minHeight: '500px' }}
      >
        <div ref={contentRef} className="pt-12 px-8 pb-8">
          <div className="relative w-full h-48 mb-6 flex justify-center shrink-0">
            <div className={`absolute transition-all duration-500 ${mode === 'signup' || mode === 'onboarding' ? 'top-0 scale-90' : 'top-8 scale-100'}`}>
              <img
                src={darkMode ? LogoDark : LogoLight}
                alt="SeshNx"
                className="w-96 h-40 object-contain drop-shadow-md"
              />
            </div>
            {getHeaderText() && (
              <div className="absolute bottom-2 w-full text-center">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{getHeaderText()}</p>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm flex items-center gap-2 mb-4">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {resetSent && (
            <div className="bg-green-50 text-green-600 p-3 rounded-xl text-sm flex items-center gap-2 mb-4">
              <Check size={16} />
              Check your email.
            </div>
          )}

          {/* LOGIN MODE */}
          {mode === 'login' && (
            <div className="space-y-4">
              <input
                className="w-full p-3.5 bg-gray-50 dark:bg-[#1f2128] border dark:border-gray-600 rounded-xl dark:text-white"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
              />
              <input
                className="w-full p-3.5 bg-gray-50 dark:bg-[#1f2128] border dark:border-gray-600 rounded-xl dark:text-white"
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
              <div className="flex justify-end">
                <button
                  onClick={() => setMode('forgot')}
                  className="text-xs text-gray-500 hover:text-brand-blue"
                >
                  Forgot Password?
                </button>
              </div>
              <button
                className="w-full bg-brand-blue text-white py-3.5 rounded-xl font-bold hover:bg-blue-600 disabled:opacity-50"
                onClick={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Sign In'}
              </button>
              <button
                onClick={handleGoogleLogin}
                className="w-full border dark:border-gray-600 py-3.5 rounded-xl font-bold dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Continue with Google
              </button>
              <p
                className="text-center text-sm text-gray-500 cursor-pointer hover:text-brand-blue pt-2"
                onClick={() => setMode('signup')}
              >
                New here? Create Account
              </p>
            </div>
          )}

          {/* SIGNUP / ONBOARDING MODE */}
          {(mode === 'signup' || mode === 'onboarding') && (
            <div>
              {/* Step 1: Welcome / Email & Password */}
              {step === 1 && (
                <div className="space-y-4">
                  {mode === 'signup' ? (
                    <>
                      <input
                        className="w-full p-3.5 bg-gray-50 dark:bg-[#1f2128] border dark:border-gray-600 rounded-xl dark:text-white"
                        placeholder="Email"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                      />
                      <input
                        className="w-full p-3.5 bg-gray-50 dark:bg-[#1f2128] border dark:border-gray-600 rounded-xl dark:text-white"
                        type="password"
                        placeholder="Create Password"
                        value={form.password}
                        onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
                      />
                      <div className="grid grid-cols-2 gap-2 pl-1">
                        <Requirement met={passwordValidations.hasUpper} text="Uppercase" />
                        <Requirement met={passwordValidations.isLength} text="6+ Chars" />
                        <Requirement met={passwordValidations.hasLower} text="Lowercase" />
                        <Requirement met={passwordValidations.hasNumber} text="Number" />
                      </div>
                      <button
                        className="w-full bg-brand-blue text-white py-3.5 rounded-xl font-bold disabled:opacity-50"
                        onClick={() => {
                          if (isPasswordValid && form.email) setStep(2);
                        }}
                        disabled={!isPasswordValid || !form.email}
                      >
                        Continue
                      </button>
                      <p
                        className="text-center text-sm text-gray-500 cursor-pointer pt-2"
                        onClick={() => setMode('login')}
                      >
                        Have an account? Log In
                      </p>
                    </>
                  ) : (
                    <div className="text-center space-y-4">
                      <h3 className="text-2xl font-bold dark:text-white">Welcome!</h3>
                      <button
                        className="w-full bg-brand-blue text-white py-3.5 rounded-xl font-bold"
                        onClick={() => setStep(2)}
                      >
                        Let's Go
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Name & Location */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <input
                      className="w-1/2 p-3.5 bg-gray-50 dark:bg-[#1f2128] border dark:border-gray-600 rounded-xl dark:text-white"
                      placeholder="First Name"
                      value={form.firstName}
                      onChange={(e) => setForm(prev => ({ ...prev, firstName: e.target.value }))}
                    />
                    <input
                      className="w-1/2 p-3.5 bg-gray-50 dark:bg-[#1f2128] border dark:border-gray-600 rounded-xl dark:text-white"
                      placeholder="Last Name"
                      value={form.lastName}
                      onChange={(e) => setForm(prev => ({ ...prev, lastName: e.target.value }))}
                    />
                  </div>
                  <div className="relative flex gap-2">
                    <div className="relative flex-1">
                      <input
                        className="w-full p-3.5 pl-10 bg-gray-50 dark:bg-[#1f2128] border dark:border-gray-600 rounded-xl dark:text-white"
                        placeholder="Zip Code"
                        maxLength={5}
                        value={form.zip}
                        onChange={(e) => setForm(prev => ({ ...prev, zip: e.target.value.replace(/\D/g, '') }))}
                      />
                      <MapPin className="absolute left-3 top-3.5 text-gray-400" size={18} />
                    </div>
                    <button
                      onClick={handleUseLocation}
                      className="p-3.5 border dark:border-gray-600 rounded-xl text-brand-blue"
                      disabled={locating}
                    >
                      {locating ? <Loader2 className="animate-spin" size={18} /> : <Crosshair size={18} />}
                    </button>
                  </div>
                  <ZipUserMap zip={form.zip} />
                  <div className="flex justify-between pt-2">
                    <button className="text-gray-500" onClick={() => setStep(1)}>
                      Back
                    </button>
                    <button
                      className="bg-black dark:bg-white dark:text-black text-white px-6 py-2.5 rounded-xl font-bold disabled:opacity-50"
                      onClick={() => {
                        if (form.firstName && form.zip) setStep(3);
                      }}
                      disabled={!form.firstName || !form.zip}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Role Selection */}
              {step === 3 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-2.5">
                    {publicRoles.map(role => (
                      <div
                        key={role}
                        onClick={() => {
                          const newRoles = form.roles.includes(role)
                            ? form.roles.filter(r => r !== role)
                            : [...form.roles, role];
                          setForm(prev => ({ ...prev, roles: newRoles }));
                        }}
                        className={`p-3 border-2 rounded-xl cursor-pointer text-center font-bold text-sm transition ${
                          form.roles.includes(role)
                            ? 'border-brand-blue bg-blue-50 text-brand-blue dark:bg-blue-900/20 dark:border-blue-500'
                            : 'border-gray-100 dark:border-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {role}
                      </div>
                    ))}
                  </div>
                  {form.roles.includes('Talent') && (
                    <select
                      className="w-full p-3.5 bg-gray-50 dark:bg-[#1f2128] border dark:border-gray-600 rounded-xl dark:text-white"
                      value={form.talentSubRole}
                      onChange={(e) => setForm(prev => ({ ...prev, talentSubRole: e.target.value }))}
                    >
                      <option value="">Select Talent Type (Optional)</option>
                      {TALENT_SUBROLES.map(subRole => (
                        <option key={subRole} value={subRole}>{subRole}</option>
                      ))}
                    </select>
                  )}
                  {form.roles.length === 0 && (
                    <p className="text-xs text-red-500 dark:text-red-400 text-center">
                      Please select at least one role to continue
                    </p>
                  )}
                  <button
                    className="w-full bg-green-600 text-white py-3.5 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition"
                    onClick={handleSignup}
                    disabled={isLoading || form.roles.length === 0}
                  >
                    {isLoading ? <Loader2 className="animate-spin mx-auto" size={20} /> : "Complete Setup"}
                  </button>
                  <button
                    className="w-full text-gray-400 text-xs hover:text-gray-600 dark:hover:text-gray-300"
                    onClick={() => setStep(2)}
                  >
                    Back
                  </button>
                </div>
              )}
            </div>
          )}

          {/* FORGOT PASSWORD MODE */}
          {mode === 'forgot' && (
            <div className="space-y-4">
              <input
                className="w-full p-3.5 bg-gray-50 dark:bg-[#1f2128] border dark:border-gray-600 rounded-xl dark:text-white"
                placeholder="Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
              />
              <button
                className="w-full bg-brand-blue text-white py-3.5 rounded-xl font-bold disabled:opacity-50"
                onClick={handleForgotPassword}
                disabled={isLoading || resetSent}
              >
                {resetSent ? 'Sent!' : isLoading ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Send Link'}
              </button>
              <button
                className="w-full text-gray-500 text-sm"
                onClick={() => setMode('login')}
              >
                Back
              </button>
            </div>
          )}

          {/* Legal Links */}
          <div className="mt-6 pt-4 border-t dark:border-gray-700 text-center">
            <button
              onClick={() => setShowLegalOverlay(true)}
              className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              Terms of Service • Privacy Policy
            </button>
          </div>
        </div>
      </div>

      {/* Legal Overlay */}
      {showLegalOverlay && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1a1d21] rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold dark:text-white">Legal Documents</h2>
              <button
                onClick={() => setShowLegalOverlay(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <LegalDocs isEmbedded={true} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
