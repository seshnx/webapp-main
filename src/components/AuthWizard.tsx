import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useAuth, useUser, useClerk, SignIn, SignUp } from '@clerk/react';
import { Loader2, AlertCircle, Sun, Moon, MapPin, Crosshair, X, Check } from 'lucide-react';
import { MapContainer, TileLayer, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { ACCOUNT_TYPES, TALENT_SUBROLES } from '../config/constants';
import { fetchZipLocation } from '../utils/geocode';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import AuthWizardBackground from './AuthWizardBackground';
import type { AccountType } from '../types';

// Lazy load LegalDocs
const LegalDocs = lazy(() => import('./LegalDocs'));

// Assets
import LogoLight from '../assets/SeshNx-PNG cCropped.png';
import LogoWhite from '../assets/SeshNx-PNG cCropped white text.png';

const HIDDEN_ROLES: AccountType[] = ['Student', 'EDUStaff', 'Intern', 'EDUAdmin', 'GAdmin'];
const publicRoles = ACCOUNT_TYPES.filter(role => !HIDDEN_ROLES.includes(role));

// Map Components
interface RecenterAutomaticallyProps {
  lat: number;
  lng: number;
}

function RecenterAutomatically({ lat, lng }: RecenterAutomaticallyProps) {
  const map = useMap();
  useEffect(() => { map.setView([lat, lng], 11); }, [lat, lng, map]);
  return null;
}

interface ZipUserMapProps {
  zip: string;
}

interface MapState {
  center: [number, number];
  locationName: string;
  isValid: boolean;
  loading: boolean;
}

function ZipUserMap({ zip }: ZipUserMapProps) {
  const [mapState, setMapState] = useState<MapState>({
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
    <div className="w-full h-28 sm:h-32 rounded-xl overflow-hidden relative border dark:border-gray-600 shadow-inner bg-gray-100 dark:bg-[#1f2128]">
      <MapContainer center={mapState.center} zoom={11} scrollWheelZoom={false} zoomControl={false} className="h-full w-full" style={{ background: 'transparent' }}>
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='&copy; CARTO' />
        <RecenterAutomatically lat={mapState.center[0]} lng={mapState.center[1]} />
        {mapState.isValid && (
          <Circle center={mapState.center} radius={4000} pathOptions={{ color: '#0066ff', fillColor: '#0066ff', fillOpacity: 0.15, stroke: false }} />
        )}
      </MapContainer>
      {mapState.isValid && (
        <div className="absolute bottom-2 right-2 bg-white/95 dark:bg-black/85 backdrop-blur-md px-2 py-1 rounded-lg shadow-lg z-[400] text-[11px] font-bold border dark:border-gray-700 dark:text-white">
          {mapState.locationName}
        </div>
      )}
    </div>
  );
}

/**
 * Props for the AuthWizard component
 */
export interface AuthWizardProps {
  /** Dark mode toggle state */
  darkMode: boolean;
  /** Dark mode toggle function */
  toggleTheme: () => void;
  /** Current user object if available */
  user?: any;
  /** Callback function called when authentication succeeds */
  onSuccess: () => void;
  /** Whether this is a new user who needs onboarding */
  isNewUser: boolean;
}

type AuthMode = 'login' | 'signup' | 'onboarding';

/**
 * Clerk-based AuthWizard Component
 *
 * Uses Clerk's stock SignIn and SignUp components for authentication,
 * with custom onboarding flow for profile setup.
 */
export default function AuthWizard({ darkMode, toggleTheme, user, onSuccess, isNewUser }: AuthWizardProps) {
  const { isLoaded: clerkLoaded, isSignedIn } = useAuth();
  const { user: clerkUser } = useUser();
  const clerk = useClerk();

  // Convex mutations
  const updateProfile = useMutation(api.users.updateProfile);
  const createSubProfile = useMutation(api.users.createSubProfile);
  const updateSubProfile = useMutation(api.users.updateSubProfile);

  const [mode, setMode] = useState<AuthMode>(isNewUser ? 'onboarding' : 'login');
  const [step, setStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [backgroundImagesLoaded, setBackgroundImagesLoaded] = useState<boolean>(false);
  const [locating, setLocating] = useState<boolean>(false);
  const [showLegalOverlay, setShowLegalOverlay] = useState<boolean>(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [cardHeight, setCardHeight] = useState<string>('auto');

  interface FormState {
    email: string;
    firstName: string;
    lastName: string;
    zip: string;
    roles: AccountType[];
    talentSubRole: string;
  }

  const [form, setForm] = useState<FormState>({
    email: '',
    firstName: '',
    lastName: '',
    zip: '',
    roles: [],
    talentSubRole: ''
  });

  // Initialize form from Clerk user when available
  useEffect(() => {
    const isCompleted = clerkUser?.unsafeMetadata?.onboarding_completed === true;
    if (clerkUser && clerkUser.id && (isNewUser || !isCompleted)) {
      setMode('onboarding');
      setStep(1);
      setForm(prev => ({
        ...prev,
        email: clerkUser?.primaryEmailAddress?.emailAddress || prev.email,
        firstName: clerkUser?.firstName || prev.firstName,
        lastName: clerkUser?.lastName || prev.lastName
      }));
    } else if (!clerkUser || !clerkUser.id) {
      setMode('login');
      setStep(1);
    }
  }, [clerkUser, isNewUser]);

  // Dynamic card height based on content
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

  // Complete signup handler
  const handleCompleteSignup = async () => {
    if (form.roles.length === 0) {
      setError("Please select at least one role.");
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (!clerkUser?.id) {
        setError('Authentication required. Please sign in first.');
        setIsLoading(false);
        return;
      }

      // Update profile with Convex
      const finalRoles = form.roles.length > 0 ? form.roles : ['Fan'];
      const displayName = `${form.firstName} ${form.lastName}`;
      const activeRole = finalRoles[0];

      await updateProfile({
        clerkId: clerkUser.id,
        firstName: form.firstName,
        lastName: form.lastName,
        zipCode: form.zip,
        accountTypes: finalRoles,
        activeProfileRole: activeRole,
        profileName: displayName,
      });

      // Create sub-profiles for each role
      const profileData: any = {
        displayName: displayName,
      };

      if (form.talentSubRole && finalRoles.includes('Talent')) {
        profileData.talentSubRole = form.talentSubRole;
      }

      for (const role of finalRoles) {
        try {
          // Try to create sub-profile in Convex
          await createSubProfile({
            clerkId: clerkUser.id,
            role: role,
            displayName: displayName,
            ...(role === 'Talent' && form.talentSubRole ? { talentSubRole: form.talentSubRole } : {}),
          });
        } catch (err: any) {
          console.warn(`Failed to create sub-profile for ${role}:`, err);
        }
      }

      // Update Clerk metadata
      try {
        await clerk.user.update({
          unsafeMetadata: {
            account_types: finalRoles,
            active_role: activeRole,
            onboarding_completed: true,
          }
        });
      } catch (metadataErr) {
        console.warn('Failed to update Clerk metadata:', metadataErr);
      }

      // Success
      if (onSuccess) onSuccess();

    } catch (err: any) {
      console.error('Profile update error:', err);
      setError('Failed to complete profile setup. Please try again.');
      setIsLoading(false);
    }
  };

  // Location helper
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
        } catch (e: any) { setError("Location lookup failed."); }
        setLocating(false);
      },
      () => { setError("Location permission denied."); setLocating(false); }
    );
  };

  // === LOGIN / SIGNUP MODE (using Clerk stock components) ===
  if (mode === 'login' || mode === 'signup') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-y-auto">
        <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
          <AuthWizardBackground onImagesLoaded={setBackgroundImagesLoaded} />
        </div>
        <div
          className="absolute inset-0 bg-gray-100 dark:bg-black transition-opacity duration-1000"
          style={{ opacity: backgroundImagesLoaded ? 0 : 1, pointerEvents: 'none' }}
        />

        <div className="absolute top-4 sm:top-6 right-4 sm:right-6 z-20">
          <button onClick={toggleTheme} className="p-2.5 sm:p-3 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-md border dark:border-gray-700">
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        <div className="bg-white/95 dark:bg-[#1a1d21]/95 dark:border dark:border-gray-700 rounded-3xl shadow-2xl w-full max-w-md my-auto relative overflow-hidden z-10 backdrop-blur-md p-5 sm:p-7">
          {/* Logo */}
          <div className="relative w-full h-16 sm:h-20 mb-3 sm:mb-4 flex items-center justify-center shrink-0">
            <img src={darkMode ? LogoWhite : LogoLight} alt="SeshNx" className="w-auto h-14 sm:h-18 max-w-[240px] object-contain drop-shadow-md" />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 mb-3">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {/* Clerk's Stock Components */}
          {mode === 'login' ? (
            <>
              <SignIn fallbackRedirectUrl="/" />
              <div className="mt-3 pt-3 border-t dark:border-gray-700 text-center">
                <button
                  onClick={() => {
                    setMode('signup');
                    setError('');
                  }}
                  className="text-xs sm:text-sm text-brand-blue hover:underline font-semibold"
                >
                  Don&apos;t have an account? Sign up
                </button>
              </div>
              <div className="mt-2 text-center">
                <button onClick={() => setShowLegalOverlay(true)} className="text-[11px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  Terms of Service • Privacy Policy
                </button>
              </div>
            </>
          ) : (
            <>
              <SignUp fallbackRedirectUrl="/" />
              <div className="mt-3 pt-3 border-t dark:border-gray-700 text-center">
                <button
                  onClick={() => {
                    setMode('login');
                    setError('');
                  }}
                  className="text-xs sm:text-sm text-brand-blue hover:underline font-semibold"
                >
                  Already have an account? Sign in
                </button>
              </div>
              <div className="mt-2 text-center">
                <button onClick={() => setShowLegalOverlay(true)} className="text-[11px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  Terms of Service • Privacy Policy
                </button>
              </div>
            </>
          )}
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
      <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-y-auto">
        <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
          <AuthWizardBackground onImagesLoaded={setBackgroundImagesLoaded} />
        </div>
        <div
          className="absolute inset-0 bg-gray-100 dark:bg-black transition-opacity duration-1000"
          style={{ opacity: backgroundImagesLoaded ? 0 : 1, pointerEvents: 'none' }}
        />

        <div className="absolute top-4 sm:top-6 right-4 sm:right-6 z-20">
          <button onClick={toggleTheme} className="p-2.5 sm:p-3 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-md border dark:border-gray-700">
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        <div
          className="bg-white/95 dark:bg-[#1a1d21]/95 dark:border dark:border-gray-700 rounded-3xl shadow-2xl w-full max-w-md my-auto relative overflow-hidden transition-[height] duration-500 z-10 backdrop-blur-md"
          style={{ height: cardHeight }}
        >
          <div ref={contentRef} className="p-5 sm:p-6">
            <div className="relative w-full h-14 sm:h-18 mb-2 flex items-center justify-center shrink-0">
              <img src={darkMode ? LogoWhite : LogoLight} alt="SeshNx" className="w-auto h-12 sm:h-16 max-w-[200px] object-contain drop-shadow-md" />
            </div>
            <div className="w-full text-center mb-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Complete Your Profile
              </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 mb-3">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            {/* Progress Indicator */}
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className={`h-1 flex-1 rounded-full transition-colors ${step >= 1 ? 'bg-brand-blue' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
              <div className={`h-1 flex-1 rounded-full transition-colors ${step >= 2 ? 'bg-brand-blue' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mb-3 px-2">
              <span className={step === 1 ? 'font-bold text-brand-blue' : ''}>Profile</span>
              <span className={step === 2 ? 'font-bold text-brand-blue' : ''}>Roles</span>
            </div>

            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-2.5 sm:space-y-3">
                <h3 className="text-base sm:text-lg font-bold dark:text-white text-center">
                  Let&apos;s get to know you
                </h3>
                <p className="text-xs text-gray-500 text-center mb-2">
                  Tell us your name and where you&apos;re located
                </p>

                <div className="space-y-2 sm:space-y-2.5">
                  <div className="flex gap-2 sm:gap-3">
                    <input
                      className="w-1/2 p-2.5 sm:p-3 text-xs sm:text-sm bg-gray-50 dark:bg-[#1f2128] border dark:border-gray-600 rounded-xl dark:text-white"
                      placeholder="First Name *"
                      value={form.firstName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(prev => ({ ...prev, firstName: e.target.value }))}
                      required
                    />
                    <input
                      className="w-1/2 p-2.5 sm:p-3 text-xs sm:text-sm bg-gray-50 dark:bg-[#1f2128] border dark:border-gray-600 rounded-xl dark:text-white"
                      placeholder="Last Name *"
                      value={form.lastName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(prev => ({ ...prev, lastName: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="relative flex gap-2">
                    <div className="relative flex-1">
                      <input
                        className="w-full p-2.5 sm:p-3 pl-9 sm:pl-10 text-xs sm:text-sm bg-gray-50 dark:bg-[#1f2128] border dark:border-gray-600 rounded-xl dark:text-white"
                        placeholder="Zip Code *"
                        maxLength={5}
                        value={form.zip}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(prev => ({ ...prev, zip: e.target.value.replace(/\D/g, '') }))}
                        required
                      />
                      <MapPin className="absolute left-3 top-2.5 sm:top-3 text-gray-400" size={16} />
                    </div>
                    <button
                      onClick={handleUseLocation}
                      className="p-2.5 sm:p-3 border dark:border-gray-600 rounded-xl text-brand-blue hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                      disabled={locating}
                      title="Use my current location"
                    >
                      {locating ? <Loader2 className="animate-spin" size={16} /> : <Crosshair size={16} />}
                    </button>
                  </div>

                  <ZipUserMap zip={form.zip} />

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-2 sm:p-2.5">
                    <p className="text-[11px] text-blue-800 dark:text-blue-200">
                      <strong>Why we need this:</strong> Connects you with nearby musicians, studios, and gigs.
                    </p>
                  </div>
                </div>

                <button
                  className="w-full bg-brand-blue hover:bg-blue-600 text-white py-2.5 sm:py-3 text-xs sm:text-sm rounded-xl font-bold disabled:opacity-50 transition shadow-lg mt-2"
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

            {/* Step 2: Roles */}
            {step === 2 && (
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-base sm:text-lg font-bold dark:text-white text-center">
                  How do you fit in the music industry?
                </h3>
                <p className="text-xs text-gray-500 text-center mb-2">
                  Select all that apply - you can always update these later
                </p>

                <div className="grid grid-cols-2 gap-2">
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
                        className={`p-2 sm:p-2.5 border-2 rounded-xl cursor-pointer text-center font-bold text-xs sm:text-sm transition-all duration-200 transform active:scale-95 ${
                          isSelected
                            ? 'border-brand-blue bg-blue-50 text-brand-blue dark:bg-blue-900/30 dark:border-blue-400 shadow-md'
                            : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-[#1f2128] hover:border-brand-blue hover:bg-blue-50 dark:hover:bg-blue-900/20 dark:text-gray-200'
                        }`}
                      >
                        {isSelected && <Check className="inline-block mr-1" size={13} />}
                        {role}
                      </button>
                    );
                  })}
                </div>

                {form.roles.includes('Talent') && (
                  <div className="animate-in slide-in-from-top-2">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 block">
                      Talent Specialization (Optional)
                    </label>
                    <select
                      className="w-full p-2.5 sm:p-3 text-xs sm:text-sm bg-gray-50 dark:bg-[#1f2128] border dark:border-gray-600 rounded-xl dark:text-white"
                      value={form.talentSubRole}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm(prev => ({ ...prev, talentSubRole: e.target.value }))}
                    >
                      <option value="">Select your talent type...</option>
                      {TALENT_SUBROLES.map(subRole => (<option key={subRole} value={subRole}>{subRole}</option>))}
                    </select>
                  </div>
                )}

                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-2 sm:p-2.5">
                  <p className="text-[11px] text-purple-800 dark:text-purple-200">
                    <strong>Pro tip:</strong> You can add or remove roles anytime from your settings.
                  </p>
                </div>

                <div className="space-y-1.5 pt-1">
                  <button
                    className="w-full bg-brand-blue hover:bg-blue-600 text-white py-2.5 sm:py-3 text-xs sm:text-sm rounded-xl font-bold disabled:opacity-50 transition shadow-lg"
                    onClick={handleCompleteSignup}
                    disabled={isLoading || form.roles.length === 0}
                  >
                    {isLoading ? <Loader2 className="animate-spin mx-auto" size={18} /> : "Complete Setup"}
                  </button>
                  <button
                    className="w-full text-gray-400 text-xs sm:text-sm hover:text-gray-600 dark:hover:text-gray-300 transition py-1.5"
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
