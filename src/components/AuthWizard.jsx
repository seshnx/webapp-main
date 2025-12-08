import React, { useState, useEffect, useRef } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { Loader2, AlertCircle, ArrowLeft, Check, Sun, Moon, MapPin, User, Crosshair, School, Search, Mail, Key, ShieldCheck, X } from 'lucide-react';
import { MapContainer, TileLayer, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { auth, db, getPaths } from '../config/firebase';
import { ACCOUNT_TYPES } from '../config/constants';
import { fetchZipLocation, fetchRegionalUserCount } from '../utils/geocode'; 
import LegalDocs from './LegalDocs';
import AuthWizardBackground from './AuthWizardBackground';

// Assets
import LogoLight from '../assets/SeshNx-PNG cCropped.png';
import LogoDark from '../assets/SeshNx-PNG cCropped white text.png';

// Roles to hide from public signup
const HIDDEN_ROLES = ['Student', 'Instructor', 'Intern', 'Admin'];

// --- SUB-COMPONENT: Zip Code Map ---
function RecenterAutomatically({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 11); 
  }, [lat, lng, map]);
  return null;
}

function ZipUserMap({ zip }) {
  const [mapState, setMapState] = useState({
    center: [34.0522, -118.2437], 
    userCount: 0,
    densityColor: 'gray',
    locationName: '',
    regionLabel: '',
    isValid: false,
    loading: false
  });

  useEffect(() => {
    if (!zip || zip.length < 5) return;
    const loadData = async () => {
      setMapState(prev => ({ ...prev, loading: true }));
      const location = await fetchZipLocation(zip);
      if (location) {
        const { count, density, label } = await fetchRegionalUserCount(zip);
        setMapState({
            center: [location.lat, location.lng],
            userCount: count,
            densityColor: density,
            locationName: location.cityState,
            regionLabel: label,
            isValid: true,
            loading: false
        });
      } else {
          setMapState(prev => ({ ...prev, loading: false }));
      }
    };
    const timer = setTimeout(loadData, 800); 
    return () => clearTimeout(timer);
  }, [zip]);

  return (
    <div className="w-full h-36 rounded-xl overflow-hidden relative border dark:border-gray-600 shadow-inner animate-in fade-in duration-500 bg-gray-100 dark:bg-[#1f2128]">
        <MapContainer center={mapState.center} zoom={11} scrollWheelZoom={false} zoomControl={false} className="h-full w-full" style={{ background: 'transparent' }}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>' />
            <RecenterAutomatically lat={mapState.center[0]} lng={mapState.center[1]} />
            {mapState.isValid && (
                <>
                    <Circle center={mapState.center} radius={8000} pathOptions={{ color: mapState.densityColor, fillColor: mapState.densityColor, fillOpacity: 0.05, stroke: false }} />
                    <Circle center={mapState.center} radius={4000} pathOptions={{ color: mapState.densityColor, fillColor: mapState.densityColor, fillOpacity: 0.15, stroke: false }} />
                    <Circle center={mapState.center} radius={400} pathOptions={{ color: 'white', fillColor: mapState.densityColor, fillOpacity: 0.9, weight: 2 }} />
                </>
            )}
        </MapContainer>
        <div className="absolute bottom-3 right-3 bg-white/95 dark:bg-black/85 backdrop-blur-md p-2.5 rounded-xl shadow-lg z-[400] border border-gray-100 dark:border-gray-700 flex flex-col items-end min-w-[120px]">
            <div className="flex items-center gap-2 mb-1">
                <div className={`w-2.5 h-2.5 rounded-full ${mapState.loading ? 'animate-ping' : ''} shadow-sm`} style={{ backgroundColor: mapState.isValid ? mapState.densityColor : 'gray' }}></div>
                <div className="text-xs font-extrabold text-gray-700 dark:text-gray-100 leading-none">{mapState.loading ? 'Scanning...' : (mapState.isValid ? `${mapState.userCount} Nearby` : 'Enter Zip')}</div>
            </div>
            {mapState.isValid && !mapState.loading && (
                <div className="flex flex-col items-end">
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">{mapState.regionLabel}</span>
                    <span className="text-[9px] text-gray-400 font-normal truncate max-w-[140px]">{mapState.locationName}</span>
                </div>
            )}
        </div>
    </div>
  );
}

// --- MAIN COMPONENT ---
export default function AuthWizard({ darkMode, toggleTheme, user, onSuccess }) {
  // Steps: 1=Login, 2=Info, 3=SchoolSearch, 4=VerifyStudent, 5=Roles
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState('login');
  const [backgroundImagesLoaded, setBackgroundImagesLoaded] = useState(false); 
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '', zip: '', roles: [] });
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [cardHeight, setCardHeight] = useState('auto');
  const [locating, setLocating] = useState(false);
  const [showLegalOverlay, setShowLegalOverlay] = useState(false);
  const contentRef = useRef(null);

  // Student Linking State
  const [isStudent, setIsStudent] = useState(false);
  const [schoolQuery, setSchoolQuery] = useState('');
  const [schoolResults, setSchoolResults] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [studentIdInput, setStudentIdInput] = useState('');
  const [studentEmailInput, setStudentEmailInput] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [sentCode, setSentCode] = useState(null);
  const [verifiedStudent, setVerifiedStudent] = useState(null);

  const publicRoles = ACCOUNT_TYPES.filter(role => !HIDDEN_ROLES.includes(role));

  const getHeaderText = () => {
    if (mode === 'signup') return "Create your Account";
    if (mode === 'forgot') return "Password Recovery";
    if (mode === 'onboarding') return "Finalize Setup";
    return null;
  };

  useEffect(() => {
    if (user) {
        setMode('onboarding');
        setStep(1); 
        const names = user.displayName ? user.displayName.split(' ') : ['User', ''];
        setForm(prev => ({
            ...prev,
            email: user.email,
            firstName: names[0] || '',
            lastName: names.slice(1).join(' ') || ''
        }));
        setIsLoading(false);
    } else {
        setMode('login');
        setStep(1);
        setForm({ email: '', password: '', firstName: '', lastName: '', zip: '', roles: [] });
    }
  }, [user]);

  const [passwordValidations, setPasswordValidations] = useState({ hasUpper: false, hasLower: false, hasNumber: false, isLength: false });

  useEffect(() => {
      const p = form.password;
      setPasswordValidations({ hasUpper: /[A-Z]/.test(p), hasLower: /[a-z]/.test(p), hasNumber: /[0-9]/.test(p), isLength: p.length >= 6 });
  }, [form.password]);

  const isPasswordValid = Object.values(passwordValidations).every(Boolean);

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
  }, [step, mode, error, resetSent, form.zip, isStudent, schoolResults, sentCode]);

  useEffect(() => { setError(''); }, [step]);

  const handleLogin = async () => {
    if (!form.email || !form.password) return setError("Please fill in all fields.");
    setIsLoading(true);
    try { await signInWithEmailAndPassword(auth, form.email, form.password); } 
    catch (e) { setError("Invalid email or password."); setIsLoading(false); }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (e) {
      console.error("Google Sign-In Error:", e);
      setError(e.message);
      setIsLoading(false);
    }
  };

  const handleSignup = async () => {
    if (mode === 'signup' && !isPasswordValid) return setError("Password requirements not met.");
    setIsLoading(true);
    try {
      let uid;
      if (mode === 'onboarding' && user) {
          uid = user.uid; 
      } else {
          const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
          uid = cred.user.uid;
      }

      let finalRoles = form.roles.length > 0 ? form.roles : ['Fan'];
      if (verifiedStudent && !finalRoles.includes('Student')) finalRoles.push('Student');

      if (verifiedStudent) {
          await deleteDoc(verifiedStudent.ref);
          const studentData = verifiedStudent.data();
          await setDoc(doc(db, `schools/${selectedSchool.id}/students`, uid), {
              ...studentData, uid, email: form.email, status: 'Active'
          });
      }

      const profile = {
        firstName: form.firstName, lastName: form.lastName, zip: form.zip,
        accountTypes: finalRoles, activeProfileRole: finalRoles[0], 
        schoolId: selectedSchool?.id || null, studentId: studentIdInput || null,
        createdAt: serverTimestamp(), email: form.email, photoURL: user?.photoURL || null
      };

      await Promise.all([
          setDoc(doc(db, getPaths(uid).userProfile), profile, { merge: true }),
          setDoc(doc(db, getPaths(uid).userPublicProfile), {
            ...profile, uid, searchTerms: [form.firstName.toLowerCase(), form.lastName.toLowerCase(), form.zip, ...finalRoles.map(r=>r.toLowerCase())]
          }, { merge: true }),
          setDoc(doc(db, getPaths(uid).userWallet), { balance: 0, createdAt: serverTimestamp() }, { merge: true })
      ]);
      if (onSuccess) onSuccess(); 
    } catch (e) { setError(e.message.replace("Firebase: ", "").replace("auth/", "")); setIsLoading(false); }
  };

  const handleForgotPassword = async () => {
      if (!form.email) return setError("Enter email address.");
      setIsLoading(true);
      try { await sendPasswordResetEmail(auth, form.email); setResetSent(true); setError(''); } 
      catch (e) { setError(e.message); }
      setIsLoading(false);
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) return setError("Geolocation not supported.");
    setLocating(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`);
            const data = await res.json();
            if (data.address.postcode) setForm(prev => ({ ...prev, zip: data.address.postcode.split('-')[0] }));
            else setError("Could not determine Zip Code.");
        } catch (e) { setError("Failed to find location."); }
        setLocating(false);
    }, () => { setError("Location permission denied."); setLocating(false); });
  };

  // --- SCHOOL SEARCH LOGIC ---
  useEffect(() => {
      if (schoolQuery.length < 2) {
          setSchoolResults([]);
          return;
      }
      const timer = setTimeout(async () => {
          const q = query(collection(db, 'schools'), where('name', '>=', schoolQuery), where('name', '<=', schoolQuery + '\uf8ff'));
          const snap = await getDocs(q);
          setSchoolResults(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }, 300);
      return () => clearTimeout(timer);
  }, [schoolQuery]);

  const handleSendAuthCode = async () => {
      if (!selectedSchool || !studentIdInput || !studentEmailInput) return setError("All fields required.");
      setIsLoading(true);
      try {
          const q = query(collection(db, `schools/${selectedSchool.id}/students`), where('studentId', '==', studentIdInput));
          const snap = await getDocs(q);
          if (snap.empty) { setError("Student ID not found in this school's roster."); setIsLoading(false); return; }
          const studentRecord = snap.docs[0].data();
          if (studentRecord.email.toLowerCase() !== studentEmailInput.toLowerCase()) { setError("Email provided does not match the student record."); setIsLoading(false); return; }
          setForm(prev => ({ ...prev, firstName: studentRecord.firstName || studentRecord.displayName.split(' ')[0], lastName: studentRecord.lastName || studentRecord.displayName.split(' ').slice(1).join(' ') }));
          const mockCode = Math.floor(100000 + Math.random() * 900000).toString();
          console.log("MOCK AUTH CODE SENT:", mockCode);
          setSentCode(mockCode);
          setVerifiedStudent(snap.docs[0]); 
          alert(`Code sent to ${studentEmailInput}. (Dev: ${mockCode})`);
          setIsLoading(false);
      } catch (e) { console.error(e); setError("Verification failed."); setIsLoading(false); }
  };

  const handleVerifyCode = () => {
      if (authCode === sentCode) { setForm(prev => ({ ...prev, roles: [...prev.roles, 'Student'] })); setStep(5); } 
      else { setError("Invalid authorization code."); }
  };

  const handleKeyDown = (e, action) => { if (e.key === 'Enter') action(); };
  const Requirement = ({ met, text }) => (<div className={`flex items-center gap-1.5 text-xs transition-colors ${met ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>{met ? <Check size={12} strokeWidth={3} /> : <div className="w-3 h-3 rounded-full border border-gray-300 dark:border-gray-600" />}{text}</div>);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-500 relative overflow-hidden">
      {/* Animated Background - Behind everything */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <AuthWizardBackground onImagesLoaded={setBackgroundImagesLoaded} />
      </div>
      
      {/* Fallback gradient overlay (fades out when images load) */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-black transition-opacity duration-1000" 
        style={{ 
          zIndex: 0,
          opacity: backgroundImagesLoaded ? 0 : 1,
          pointerEvents: backgroundImagesLoaded ? 'none' : 'auto'
        }} 
      />
      
      <div className="absolute top-6 right-6 z-20">
          <button onClick={toggleTheme} className="p-3 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-md border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:scale-110 transition-transform shadow-sm">{darkMode ? <Sun size={20} /> : <Moon size={20} />}</button>
      </div>

      <div className="bg-white/95 dark:bg-dark-card/95 dark:border dark:border-gray-700 rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden transition-[height] duration-500 z-10 backdrop-blur-md" style={{ height: cardHeight, minHeight: '500px' }}>
        <div ref={contentRef} className="pt-12 px-8 pb-8">
            {/* Header Area */}
            <div className="relative w-full h-48 mb-6 flex justify-center shrink-0"> 
                <div className={`absolute transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${mode === 'signup' || mode === 'onboarding' ? 'top-0 scale-90' : 'top-8 scale-100'} z-0`}>
                    <div className={`w-96 h-40 ${mode === 'signup' || mode === 'onboarding' ? '' : 'animate-float'}`}>
                        <img src={darkMode ? LogoDark : LogoLight} alt="SeshNx" className="w-full h-full object-contain drop-shadow-md" />
                    </div>
                </div>
                <div className="absolute bottom-2 w-full text-center z-10 pointer-events-none">
                    {getHeaderText() && <p className="text-sm font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider animate-pulse transition-opacity duration-300">{getHeaderText()}</p>}
                </div>
            </div>

            {error && <div className="absolute top-4 left-0 right-0 mx-8 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 p-3 rounded-xl text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2 z-30 border border-red-100 dark:border-red-800/30"><AlertCircle size={16}/><span className="capitalize font-medium">{error}</span></div>}
            {resetSent && <div className="absolute top-4 left-0 right-0 mx-8 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-300 p-3 rounded-xl text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2 z-30 border border-green-100 dark:border-green-800/30"><Check size={16}/><span>Check your email.</span></div>}
            
            <div key={mode} className="animate-in fade-in slide-in-from-right-4 duration-500 fill-mode-forwards">
                {/* LOGIN */}
                {mode === 'login' && (
                    <div className="space-y-4 w-full">
                        <div className="space-y-3">
                            <input className="w-full p-3.5 bg-gray-50 dark:bg-[#1f2128] border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none dark:text-white transition-all" placeholder="Email Address" type="email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} onKeyDown={(e) => handleKeyDown(e, handleLogin)} disabled={isLoading} />
                            <input className="w-full p-3.5 bg-gray-50 dark:bg-[#1f2128] border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none dark:text-white transition-all" type="password" placeholder="Password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} onKeyDown={(e) => handleKeyDown(e, handleLogin)} disabled={isLoading} />
                        </div>
                        <div className="flex justify-end"><button onClick={() => setMode('forgot')} className="text-xs text-gray-500 hover:text-brand-blue font-medium transition-colors">Forgot Password?</button></div>
                        <button className="w-full bg-brand-blue text-white py-3.5 rounded-xl font-bold hover:bg-blue-600 transition-all shadow-lg flex justify-center disabled:opacity-70" onClick={handleLogin} disabled={isLoading}>{isLoading ? <Loader2 className="animate-spin" /> : 'Sign In'}</button>
                        <button onClick={handleGoogleLogin} className="w-full bg-white dark:bg-transparent border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white py-3.5 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex justify-center items-center gap-2" disabled={isLoading}>
                            <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                            Continue with Google
                        </button>
                        <div className="relative py-2"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-gray-700"></div></div><div className="relative flex justify-center text-sm"><span className="px-2 bg-white dark:bg-dark-card text-gray-500">or</span></div></div>
                        <p className="text-center text-sm text-gray-500 dark:text-gray-400 cursor-pointer hover:text-brand-blue font-medium transition-colors pt-2" onClick={() => setMode('signup')}>New here? Create an Account</p>
                    </div>
                )}

                {/* FORGOT PASSWORD */}
                {mode === 'forgot' && (
                    <div className="space-y-4 w-full">
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-2">Enter your email to receive reset instructions.</p>
                        <input className="w-full p-3.5 bg-gray-50 dark:bg-[#1f2128] border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none dark:text-white transition-all" placeholder="Email Address" type="email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} onKeyDown={(e) => handleKeyDown(e, handleForgotPassword)} disabled={isLoading || resetSent} />
                        <button className="w-full bg-brand-blue text-white py-3.5 rounded-xl font-bold hover:bg-blue-600 transition-all flex justify-center items-center gap-2 disabled:opacity-50" onClick={handleForgotPassword} disabled={isLoading || resetSent}>{isLoading ? <Loader2 className="animate-spin" /> : (resetSent ? 'Sent!' : 'Send Reset Link')}</button>
                        <button className="w-full text-gray-500 text-sm hover:text-gray-800 dark:hover:text-gray-200 mt-2" onClick={()=>setMode('login')}>Back to Login</button>
                    </div>
                )}

                {/* SIGNUP FLOW */}
                {(mode === 'signup' || mode === 'onboarding') && (
                    <div className="w-full">
                        {step === 1 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-500">
                                {mode === 'signup' ? (
                                    <>
                                        <div className="space-y-3">
                                            <input className="w-full p-3.5 bg-gray-50 dark:bg-[#1f2128] border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none dark:text-white transition-all" placeholder="Email Address" type="email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} disabled={isLoading} />
                                            <input className={`w-full p-3.5 bg-gray-50 dark:bg-[#1f2128] border ${!isPasswordValid && form.password ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 dark:border-gray-600 focus:ring-brand-blue'} rounded-xl focus:ring-2 outline-none dark:text-white transition-all`} type="password" placeholder="Create Password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} disabled={isLoading} />
                                        </div>
                                        <div className="pt-2"><div className="grid grid-cols-2 gap-2 pl-1"><Requirement met={passwordValidations.hasUpper} text="Uppercase Letter" /><Requirement met={passwordValidations.hasLower} text="Lowercase Letter" /><Requirement met={passwordValidations.hasNumber} text="Number (0-9)" /><Requirement met={passwordValidations.isLength} text="6+ Characters" /></div></div>
                                        <button className="w-full bg-brand-blue text-white py-3.5 rounded-xl font-bold hover:bg-blue-600 transition-all shadow-lg flex justify-center disabled:opacity-50" onClick={() => { if(!form.email) return setError("Email required"); if(!isPasswordValid) return setError("Fix password issues"); setStep(2); }} disabled={isLoading || !isPasswordValid || !form.email}>Continue</button>
                                        <button onClick={handleGoogleLogin} className="w-full bg-white dark:bg-transparent border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white py-3.5 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex justify-center items-center gap-2" disabled={isLoading}>
                                            <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                                            Continue with Google
                                        </button>
                                        <div className="relative py-2"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-gray-700"></div></div><div className="relative flex justify-center text-sm"><span className="px-2 bg-white dark:bg-dark-card text-gray-500">or</span></div></div>
                                        <p className="text-center text-sm text-gray-500 dark:text-gray-400 cursor-pointer hover:text-brand-blue font-medium transition-colors pt-2" onClick={() => setMode('login')}>Already have an account? Log In</p>
                                    </>
                                ) : (
                                    <div className="space-y-6 text-center">
                                        <div className="w-24 h-24 mx-auto rounded-full bg-gray-100 dark:bg-gray-800 p-1 border-2 border-brand-blue shadow-lg overflow-hidden">
                                            {user?.photoURL ? <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover rounded-full" /> : <div className="w-full h-full flex items-center justify-center text-brand-blue"><User size={40}/></div>}
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold dark:text-white">Welcome, {form.firstName}!</h3>
                                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Let's finish setting up your creative profile.</p>
                                        </div>
                                        <button className="w-full bg-brand-blue text-white py-3.5 rounded-xl font-bold hover:bg-blue-600 transition-all shadow-lg flex justify-center" onClick={() => setStep(2)}>Let's Go</button>
                                    </div>
                                )}
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-500">
                                <div className="flex gap-3">
                                    <input className="w-1/2 p-3.5 bg-gray-50 dark:bg-[#1f2128] border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none dark:text-white" placeholder="First Name" value={form.firstName} onChange={e=>setForm({...form, firstName:e.target.value})} autoFocus />
                                    <input className="w-1/2 p-3.5 bg-gray-50 dark:bg-[#1f2128] border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none dark:text-white" placeholder="Last Name" value={form.lastName} onChange={e=>setForm({...form, lastName:e.target.value})} />
                                </div>
                                <div className="relative flex gap-2">
                                    <div className="relative flex-1">
                                        <input className="w-full p-3.5 pl-10 bg-gray-50 dark:bg-[#1f2128] border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none dark:text-white" placeholder="Zip Code" maxLength={5} value={form.zip} onChange={e=>setForm({...form, zip:e.target.value.replace(/\D/g,'')})} />
                                        <MapPin className="absolute left-3 top-3.5 text-gray-400" size={18} />
                                    </div>
                                    <button onClick={handleUseLocation} className="p-3.5 bg-gray-50 dark:bg-[#1f2128] border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-brand-blue transition-colors">{locating ? <Loader2 size={20} className="animate-spin" /> : <Crosshair size={20} />}</button>
                                </div>
                                <ZipUserMap zip={form.zip} />
                                
                                <div className="bg-gray-50 dark:bg-[#23262f] p-3 rounded-xl border dark:border-gray-700 flex items-center gap-3 cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-[#2a2d36]" onClick={() => setIsStudent(!isStudent)}>
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isStudent ? 'bg-brand-blue border-brand-blue' : 'border-gray-400'}`}>
                                        {isStudent && <Check size={12} className="text-white" strokeWidth={3}/>}
                                    </div>
                                    <span className="text-sm font-bold dark:text-white flex-1">Are you a student?</span>
                                    <School size={18} className={isStudent ? 'text-brand-blue' : 'text-gray-400'}/>
                                </div>

                                <div className="flex justify-between pt-2">
                                    <button className={`text-gray-500 flex items-center gap-1 text-sm font-medium ${mode === 'onboarding' ? 'opacity-0 pointer-events-none' : ''}`} onClick={()=>setStep(1)}><ArrowLeft size={16}/> Back</button>
                                    <button className="bg-gray-900 dark:bg-white dark:text-black text-white px-6 py-2.5 rounded-xl font-bold transition-transform active:scale-95" onClick={() => { if(form.firstName && form.zip) setStep(isStudent ? 3 : 5); else setError("Info required"); }}>Next Step</button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                                <div><h4 className="font-bold dark:text-white text-lg mb-2">Find your School</h4><p className="text-xs text-gray-500">Search for your institution to link your enrollment.</p></div>
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 text-gray-400" size={16}/>
                                    <input className="w-full pl-10 p-3 border rounded-xl dark:bg-black/20 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-blue outline-none" placeholder="Search School Name..." value={schoolQuery} onChange={e => setSchoolQuery(e.target.value)} autoFocus />
                                    {schoolResults.length > 0 && (
                                        <div className="absolute z-10 w-full mt-2 bg-white dark:bg-[#2c2e36] border dark:border-gray-700 rounded-xl shadow-xl max-h-48 overflow-y-auto p-1">
                                            {schoolResults.map(s => (
                                                <div key={s.id} onClick={() => { setSelectedSchool(s); setStep(4); }} className="p-3 hover:bg-gray-50 dark:hover:bg-white/10 cursor-pointer rounded-lg flex items-center gap-3 transition">
                                                    <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-gray-500"><School size={16}/></div>
                                                    <div><div className="font-bold dark:text-white text-sm">{s.name}</div><div className="text-xs text-gray-500">{s.city || 'Location N/A'}</div></div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <button className="w-full text-gray-400 text-sm hover:text-gray-600" onClick={()=>setStep(2)}>Back</button>
                            </div>
                        )}

                        {step === 4 && selectedSchool && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                                <div className="text-center"><h4 className="font-bold dark:text-white text-lg">{selectedSchool.name}</h4><p className="text-xs text-gray-500">Verify your enrollment</p></div>
                                {!sentCode ? (
                                    <div className="space-y-3">
                                        <div className="relative"><User className="absolute left-3 top-3 text-gray-400" size={16}/><input className="w-full pl-10 p-3 border rounded-xl dark:bg-black/20 dark:border-gray-600 dark:text-white" placeholder="Student ID Number" value={studentIdInput} onChange={e => setStudentIdInput(e.target.value)} /></div>
                                        <div className="relative"><Mail className="absolute left-3 top-3 text-gray-400" size={16}/><input className="w-full pl-10 p-3 border rounded-xl dark:bg-black/20 dark:border-gray-600 dark:text-white" placeholder="School Email Address" value={studentEmailInput} onChange={e => setStudentEmailInput(e.target.value)} /></div>
                                        <button onClick={handleSendAuthCode} disabled={isLoading} className="w-full bg-brand-blue text-white py-3 rounded-xl font-bold hover:bg-blue-600 transition">{isLoading ? 'Verifying...' : 'Verify & Send Code'}</button>
                                    </div>
                                ) : (
                                    <div className="space-y-4 text-center animate-in fade-in">
                                        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-100 dark:border-green-800"><p className="text-xs text-green-700 dark:text-green-400">Code sent to {studentEmailInput}</p></div>
                                        <div className="relative"><Key className="absolute left-3 top-3 text-gray-400" size={16}/><input className="w-full pl-10 p-3 border rounded-xl dark:bg-black/20 dark:border-gray-600 dark:text-white text-center font-mono tracking-widest text-lg" placeholder="000000" maxLength={6} value={authCode} onChange={e => setAuthCode(e.target.value)} /></div>
                                        <button onClick={handleVerifyCode} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition">Confirm Code</button>
                                    </div>
                                )}
                                <button className="w-full text-gray-400 text-sm hover:text-gray-600" onClick={()=>setStep(3)}>Change School</button>
                            </div>
                        )}

                        {step === 5 && (
                            <div className="space-y-5 animate-in fade-in slide-in-from-right-8 duration-500">
                                <div className="text-center"><h4 className="font-bold dark:text-white">Select Additional Roles</h4><p className="text-xs text-gray-500 dark:text-gray-400">You can change these later.</p></div>
                                <div className="grid grid-cols-2 gap-2.5 h-auto">
                                    {publicRoles.map(role => (
                                        <div key={role} onClick={() => { const newRoles = form.roles.includes(role) ? form.roles.filter(r => r !== role) : [...form.roles, role]; setForm({...form, roles: newRoles}); }} className={`relative p-3 border-2 rounded-xl cursor-pointer text-sm font-bold text-center transition-colors duration-200 select-none ${form.roles.includes(role) ? 'bg-blue-50 border-brand-blue text-brand-blue dark:bg-blue-900/20 dark:border-blue-500 dark:text-blue-300 shadow-sm' : 'bg-white border-gray-100 text-gray-500 hover:border-gray-300 dark:bg-[#1f2128] dark:border-gray-700 dark:text-gray-400'}`}>{role}{form.roles.includes(role) && <div className="absolute top-1 right-1 text-brand-blue"><Check size={10} strokeWidth={4}/></div>}</div>
                                    ))}
                                </div>
                                <p className="text-[10px] text-gray-400 text-center px-4 leading-tight">
                                    By completing setup, you agree to our <button onClick={() => setShowLegalOverlay(true)} className="underline hover:text-brand-blue mx-1">Terms of Service</button> and <button onClick={() => setShowLegalOverlay(true)} className="underline hover:text-brand-blue mx-1">Privacy Policy</button>.
                                </p>
                                <button className="w-full bg-green-600 text-white py-3.5 rounded-xl font-bold mt-2 hover:bg-green-700 transition-colors flex justify-center items-center gap-2 disabled:opacity-50" onClick={handleSignup} disabled={isLoading}>{isLoading ? <Loader2 className="animate-spin" /> : "Complete Setup"}</button>
                                <button className="w-full text-gray-400 text-xs hover:text-gray-600 transition-colors" onClick={()=>setStep(2)}>Back to Personal Info</button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* NEW: Legal Button (Sticky at Bottom) */}
      <div className="absolute bottom-6 z-20">
          <button 
              onClick={() => setShowLegalOverlay(true)} 
              className="text-xs text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors flex items-center gap-2 opacity-80 hover:opacity-100 backdrop-blur-sm px-3 py-1.5 rounded-full"
          >
              <ShieldCheck size={14}/> Legal Center & Terms
          </button>
      </div>

      {/* NEW: Legal Overlay Modal */}
      {showLegalOverlay && (
          <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-white dark:bg-[#1f2128] w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-gray-200 dark:border-gray-700 relative animate-in slide-in-from-bottom-4">
                  <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-[#23262f] shrink-0">
                      <h3 className="font-bold text-lg dark:text-white flex items-center gap-2">
                          <ShieldCheck size={20} className="text-brand-blue"/> Legal Center
                      </h3>
                      <button 
                          onClick={() => setShowLegalOverlay(false)} 
                          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition"
                      >
                          <X size={20} className="text-gray-500 dark:text-gray-400"/>
                      </button>
                  </div>
                  <div className="flex-1 overflow-y-auto relative">
                       <LegalDocs isEmbedded={true} />
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}
