import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../config/supabase';
import { Loader2, AlertCircle, ArrowLeft, Check, Sun, Moon, MapPin, User, Crosshair, School, Search, Mail, Key, ShieldCheck, X } from 'lucide-react';
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

// Map Components
function RecenterAutomatically({ lat, lng }) {
  const map = useMap();
  useEffect(() => { map.setView([lat, lng], 11); }, [lat, lng, map]);
  return null;
}

function ZipUserMap({ zip }) {
  const [mapState, setMapState] = useState({
    center: [34.0522, -118.2437], userCount: 0, densityColor: 'gray',
    locationName: '', regionLabel: '', isValid: false, loading: false
  });

  useEffect(() => {
    if (!zip || zip.length < 5) return;
    const loadData = async () => {
      setMapState(prev => ({ ...prev, loading: true }));
      try {
        const location = await fetchZipLocation(zip);
        if (location) {
          // Mock data until geo-backend is migrated
          setMapState({
            center: [location.lat, location.lng],
            userCount: 50, 
            densityColor: '#0066ff',
            locationName: location.cityState,
            regionLabel: 'Active Area',
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
                <Circle center={mapState.center} radius={4000} pathOptions={{ color: mapState.densityColor, fillColor: mapState.densityColor, fillOpacity: 0.15, stroke: false }} />
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
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState('login');
  const [backgroundImagesLoaded, setBackgroundImagesLoaded] = useState(false); 
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '', zip: '', roles: [], talentSubRole: '' });
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [cardHeight, setCardHeight] = useState('auto');
  const [locating, setLocating] = useState(false);
  const [showLegalOverlay, setShowLegalOverlay] = useState(false);
  const contentRef = useRef(null);

  // Student State
  const [isStudent, setIsStudent] = useState(false);
  const [schoolQuery, setSchoolQuery] = useState('');
  const [schoolResults, setSchoolResults] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [studentIdInput, setStudentIdInput] = useState('');
  const [studentEmailInput, setStudentEmailInput] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [sentCode, setSentCode] = useState(null);

  const publicRoles = ACCOUNT_TYPES.filter(role => !HIDDEN_ROLES.includes(role));
  const getHeaderText = () => mode === 'signup' ? "Create Account" : mode === 'forgot' ? "Recovery" : mode === 'onboarding' ? "Finalize Setup" : null;

  useEffect(() => {
    // Only show onboarding if we have a valid user with an ID
    // Check both user and isNewUser, but ensure user actually exists
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

  const [passwordValidations, setPasswordValidations] = useState({ hasUpper: false, hasLower: false, hasNumber: false, isLength: false });
  useEffect(() => {
      const p = form.password;
      setPasswordValidations({ hasUpper: /[A-Z]/.test(p), hasLower: /[a-z]/.test(p), hasNumber: /[0-9]/.test(p), isLength: p.length >= 6 });
  }, [form.password]);
  const isPasswordValid = Object.values(passwordValidations).every(Boolean);

  // Resize Observer
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
  }, [step, mode, error, resetSent, form.zip, isStudent, schoolResults, sentCode, form.roles]);

  useEffect(() => { setError(''); }, [step]);

  // --- ACTIONS ---
  const handleLogin = async () => {
    if (!form.email || !form.password) return setError("Please fill in all fields.");
    if (!supabase) {
      setError("Authentication service unavailable. Please check your configuration.");
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: form.email.trim(), 
        password: form.password 
      });
      if (error) {
        console.error('Login error:', error);
        // Provide more helpful error messages
        if (error.message?.includes('Invalid login credentials') || error.message?.includes('Email not confirmed')) {
          setError("Invalid email or password. Please check your credentials.");
        } else if (error.message?.includes('Email rate limit')) {
          setError("Too many login attempts. Please try again later.");
        } else {
          setError(error.message || "Failed to sign in. Please try again.");
        }
        setIsLoading(false);
      } else {
        // Success - App.jsx listener handles redirect
        console.log('Login successful:', data.user?.id);
      }
    } catch (err) {
      console.error('Unexpected login error:', err);
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!supabase) {
      setError("Authentication service unavailable. Please check your configuration.");
      return;
    }
    setError(''); setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({ 
        provider: 'google', 
        options: { 
          queryParams: { access_type: 'offline', prompt: 'consent' },
          redirectTo: window.location.origin
        } 
      });
      if (error) { 
        console.error('Google login error:', error);
        setError(error.message || "Failed to sign in with Google."); 
        setIsLoading(false); 
      }
      // OAuth redirects, so we don't need to handle success here
    } catch (err) {
      console.error('Unexpected Google login error:', err);
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleSignup = async () => {
    if (mode === 'signup' && !isPasswordValid) {
      setError("Password requirements not met.");
      return;
    }
    if (!supabase) {
      setError("Authentication service unavailable. Please check your configuration.");
      return;
    }
    if (form.roles.length === 0) {
      setError("Please select at least one role.");
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      let uid = user?.id;
      let currentUser = user;
      
      // 1. Register if not already
      if (!uid) {
          console.log('Creating new user account...');
          const { data, error: signUpError } = await supabase.auth.signUp({
              email: form.email.trim(), 
              password: form.password,
              options: { 
                data: { first_name: form.firstName, last_name: form.lastName },
                emailRedirectTo: window.location.origin
              }
          });
          
          if (signUpError) {
            console.error('Signup error:', signUpError);
            // Provide more helpful error messages
            if (signUpError.message?.includes('already registered') || signUpError.message?.includes('already exists')) {
              setError("An account with this email already exists. Please sign in instead.");
            } else if (signUpError.message?.includes('Password')) {
              setError("Password does not meet requirements. Please check and try again.");
            } else {
              setError(signUpError.message || "Failed to create account. Please try again.");
            }
            setIsLoading(false);
            return;
          }
          
          uid = data.user?.id;
          currentUser = data.user;
          
          if (!uid) {
            setError("Account created but unable to retrieve user ID. Please try signing in.");
            setIsLoading(false);
            return;
          }
          
          console.log('User account created:', uid);
      }

      const finalRoles = form.roles.length > 0 ? form.roles : ['Fan'];
      console.log('Creating profile with roles:', finalRoles);
      
      // 2. Insert Profile
      const profileData = {
          id: uid,
          first_name: form.firstName,
          last_name: form.lastName,
          email: form.email.trim(),
          zip_code: form.zip || null,
          account_types: finalRoles,
          active_role: finalRoles[0],
          talent_sub_role: finalRoles.includes('Talent') ? form.talentSubRole : null,
          avatar_url: currentUser?.user_metadata?.avatar_url || null,
          updated_at: new Date().toISOString(),
      };
      
      // Only add created_at if the field exists (some tables auto-generate it)
      const { error: profileError } = await supabase.from('profiles').upsert(profileData, {
        onConflict: 'id'
      });
      
      if (profileError) {
        console.error('Profile creation error:', profileError);
        throw profileError;
      }
      
      console.log('Profile created successfully');

      // 3. Init Wallet (don't fail if it already exists)
      const { error: walletError } = await supabase.from('wallets').upsert({
        user_id: uid, 
        balance: 0
      }, {
        onConflict: 'user_id'
      });
      
      if (walletError) {
        console.warn('Wallet creation warning:', walletError);
        // Don't fail the whole signup if wallet creation fails
      } else {
        console.log('Wallet created successfully');
      }

      // Success - reload the page to trigger auth state change
      console.log('Signup successful, reloading page...');
      // Don't set loading to false - let the reload happen
      setTimeout(() => {
        window.location.reload();
      }, 500); // Small delay to ensure all data is saved
      
    } catch (e) { 
      console.error('Signup error:', e);
      const errorMessage = e.message || e.error?.message || e.toString() || 'Failed to complete setup. Please try again.';
      setError(errorMessage); 
      setIsLoading(false);
    }
  };
  
  // Safety timeout - if loading takes too long, reset it
  useEffect(() => {
    if (isLoading) {
      const timeout = setTimeout(() => {
        console.warn('Signup process timed out - resetting loading state');
        setIsLoading(false);
        setError('The signup process is taking longer than expected. Please check your connection and try again.');
      }, 15000); // 15 second timeout
      
      return () => clearTimeout(timeout);
    }
  }, [isLoading]);

  const handleForgotPassword = async () => {
      if (!form.email) return setError("Enter email address.");
      setIsLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(form.email, { redirectTo: window.location.origin });
      if (error) setError(error.message); else { setResetSent(true); setError(''); }
      setIsLoading(false);
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) return setError("Geolocation not supported.");
    setLocating(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
            const data = await res.json();
            if (data.address.postcode) setForm(prev => ({ ...prev, zip: data.address.postcode.split('-')[0] }));
            else setError("Could not determine Zip Code.");
        } catch (e) { setError("Failed to find location."); }
        setLocating(false);
    }, () => { setError("Permission denied."); setLocating(false); });
  };

  const Requirement = ({ met, text }) => (<div className={`flex items-center gap-1.5 text-xs ${met ? 'text-green-600' : 'text-gray-400'}`}>{met ? <Check size={12}/> : <div className="w-3 h-3 border rounded-full"/>}{text}</div>);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}><AuthWizardBackground onImagesLoaded={setBackgroundImagesLoaded} /></div>
      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-black transition-opacity duration-1000" style={{ opacity: backgroundImagesLoaded ? 0 : 1, pointerEvents: 'none' }} />
      
      <div className="absolute top-6 right-6 z-20"><button onClick={toggleTheme} className="p-3 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-md border dark:border-gray-700">{darkMode ? <Sun size={20} /> : <Moon size={20} />}</button></div>

      <div className="bg-white/95 dark:bg-[#1a1d21]/95 dark:border dark:border-gray-700 rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden transition-[height] duration-500 z-10 backdrop-blur-md" style={{ height: cardHeight, minHeight: '500px' }}>
        <div ref={contentRef} className="pt-12 px-8 pb-8">
            <div className="relative w-full h-48 mb-6 flex justify-center shrink-0"> 
                <div className={`absolute transition-all duration-500 ${mode === 'signup' || mode === 'onboarding' ? 'top-0 scale-90' : 'top-8 scale-100'}`}>
                    <img src={darkMode ? LogoDark : LogoLight} alt="SeshNx" className="w-96 h-40 object-contain drop-shadow-md" />
                </div>
                {getHeaderText() && <div className="absolute bottom-2 w-full text-center"><p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{getHeaderText()}</p></div>}
            </div>

            {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm flex items-center gap-2 mb-4"><AlertCircle size={16}/>{error}</div>}
            {resetSent && <div className="bg-green-50 text-green-600 p-3 rounded-xl text-sm flex items-center gap-2 mb-4"><Check size={16}/>Check your email.</div>}
            
            {mode === 'login' && (
                <div className="space-y-4">
                    <input className="w-full p-3.5 bg-gray-50 dark:bg-[#1f2128] border dark:border-gray-600 rounded-xl dark:text-white" placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} />
                    <input className="w-full p-3.5 bg-gray-50 dark:bg-[#1f2128] border dark:border-gray-600 rounded-xl dark:text-white" type="password" placeholder="Password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
                    <div className="flex justify-end"><button onClick={() => setMode('forgot')} className="text-xs text-gray-500 hover:text-brand-blue">Forgot Password?</button></div>
                    <button className="w-full bg-brand-blue text-white py-3.5 rounded-xl font-bold hover:bg-blue-600" onClick={handleLogin} disabled={isLoading}>{isLoading ? <Loader2 className="animate-spin" /> : 'Sign In'}</button>
                    <button onClick={handleGoogleLogin} className="w-full border dark:border-gray-600 py-3.5 rounded-xl font-bold dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800">Continue with Google</button>
                    <p className="text-center text-sm text-gray-500 cursor-pointer hover:text-brand-blue pt-2" onClick={() => setMode('signup')}>New here? Create Account</p>
                </div>
            )}

            {(mode === 'signup' || mode === 'onboarding') && (
                <div>
                    {step === 1 && (
                        <div className="space-y-4">
                           {mode === 'signup' ? (
                                <>
                                   <input className="w-full p-3.5 bg-gray-50 dark:bg-[#1f2128] border dark:border-gray-600 rounded-xl dark:text-white" placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} />
                                   <input className="w-full p-3.5 bg-gray-50 dark:bg-[#1f2128] border dark:border-gray-600 rounded-xl dark:text-white" type="password" placeholder="Create Password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} />
                                   <div className="grid grid-cols-2 gap-2 pl-1"><Requirement met={passwordValidations.hasUpper} text="Uppercase" /><Requirement met={passwordValidations.isLength} text="6+ Chars" /></div>
                                   <button className="w-full bg-brand-blue text-white py-3.5 rounded-xl font-bold" onClick={() => { if(isPasswordValid && form.email) setStep(2); }} disabled={!isPasswordValid || !form.email}>Continue</button>
                                   <p className="text-center text-sm text-gray-500 cursor-pointer pt-2" onClick={() => setMode('login')}>Have an account? Log In</p>
                                </>
                           ) : (
                                <div className="text-center space-y-4">
                                    <h3 className="text-2xl font-bold dark:text-white">Welcome!</h3>
                                    <button className="w-full bg-brand-blue text-white py-3.5 rounded-xl font-bold" onClick={() => setStep(2)}>Let's Go</button>
                                </div>
                           )}
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <input className="w-1/2 p-3.5 bg-gray-50 dark:bg-[#1f2128] border dark:border-gray-600 rounded-xl dark:text-white" placeholder="First Name" value={form.firstName} onChange={e=>setForm({...form, firstName:e.target.value})} />
                                <input className="w-1/2 p-3.5 bg-gray-50 dark:bg-[#1f2128] border dark:border-gray-600 rounded-xl dark:text-white" placeholder="Last Name" value={form.lastName} onChange={e=>setForm({...form, lastName:e.target.value})} />
                            </div>
                            <div className="relative flex gap-2">
                                <div className="relative flex-1">
                                    <input className="w-full p-3.5 pl-10 bg-gray-50 dark:bg-[#1f2128] border dark:border-gray-600 rounded-xl dark:text-white" placeholder="Zip Code" maxLength={5} value={form.zip} onChange={e=>setForm({...form, zip:e.target.value})} />
                                    <MapPin className="absolute left-3 top-3.5 text-gray-400" size={18} />
                                </div>
                                <button onClick={handleUseLocation} className="p-3.5 border dark:border-gray-600 rounded-xl text-brand-blue">{locating ? <Loader2 className="animate-spin" /> : <Crosshair />}</button>
                            </div>
                            <ZipUserMap zip={form.zip} />
                            <div className="flex justify-between pt-2">
                                <button className="text-gray-500" onClick={()=>setStep(1)}>Back</button>
                                <button className="bg-black dark:bg-white dark:text-black text-white px-6 py-2.5 rounded-xl font-bold" onClick={() => { if(form.firstName && form.zip) setStep(5); }}>Next</button>
                            </div>
                        </div>
                    )}

                    {step === 5 && (
                        <div className="space-y-5">
                            <div className="grid grid-cols-2 gap-2.5">
                                {publicRoles.map(role => (
                                    <div key={role} onClick={() => { 
                                        const newRoles = form.roles.includes(role) ? form.roles.filter(r => r !== role) : [...form.roles, role]; 
                                        setForm({...form, roles: newRoles});
                                    }} className={`p-3 border-2 rounded-xl cursor-pointer text-center font-bold text-sm transition ${form.roles.includes(role) ? 'border-brand-blue bg-blue-50 text-brand-blue dark:bg-blue-900/20 dark:border-blue-500' : 'border-gray-100 dark:border-gray-700 hover:border-gray-300'}`}>{role}</div>
                                ))}
                            </div>
                            {form.roles.length === 0 && (
                                <p className="text-xs text-red-500 dark:text-red-400 text-center">Please select at least one role to continue</p>
                            )}
                            <button 
                                className="w-full bg-green-600 text-white py-3.5 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition" 
                                onClick={handleSignup} 
                                disabled={isLoading || form.roles.length === 0}
                            >
                                {isLoading ? <Loader2 className="animate-spin mx-auto" size={20} /> : "Complete Setup"}
                            </button>
                            <button className="w-full text-gray-400 text-xs hover:text-gray-600 dark:hover:text-gray-300" onClick={()=>setStep(2)}>Back</button>
                        </div>
                    )}
                </div>
            )}

            {mode === 'forgot' && (
                <div className="space-y-4">
                    <input className="w-full p-3.5 bg-gray-50 dark:bg-[#1f2128] border dark:border-gray-600 rounded-xl dark:text-white" placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} />
                    <button className="w-full bg-brand-blue text-white py-3.5 rounded-xl font-bold" onClick={handleForgotPassword} disabled={isLoading || resetSent}>{resetSent ? 'Sent!' : 'Send Link'}</button>
                    <button className="w-full text-gray-500 text-sm" onClick={()=>setMode('login')}>Back</button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
