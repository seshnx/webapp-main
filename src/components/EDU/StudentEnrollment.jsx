import React, { useMemo, useState } from 'react';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { Search, Sparkles, Megaphone, Building2, CheckCircle2, Loader2, Mail, Link as LinkIcon, Clipboard } from 'lucide-react';
import { db } from '../../config/firebase';

const PETITION_TARGET = 50;

export default function StudentEnrollment({ user }) {
    const [schoolSearchTerm, setSchoolSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedSchool, setSelectedSchool] = useState(null);
    const [studentId, setStudentId] = useState('');
    const [studentEmail, setStudentEmail] = useState(user?.email || '');
    const [verifyError, setVerifyError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [showPetitionModal, setShowPetitionModal] = useState(false);

    const [petitionSchool, setPetitionSchool] = useState('');
    const [petitionCity, setPetitionCity] = useState('');
    const [petitionEmail, setPetitionEmail] = useState(user?.email || '');
    const [petitionLink, setPetitionLink] = useState('');
    const [petitionError, setPetitionError] = useState('');
    const [petitionSubmitting, setPetitionSubmitting] = useState(false);

    const primaryCta = useMemo(() => selectedSchool?.name || 'Activate Student Access', [selectedSchool]);

    const searchSchools = async (term) => {
        if (term.length < 2) {
            setSearchResults([]);
            return;
        }
        const q = query(collection(db, 'schools'), where('name', '>=', term), where('name', '<=', term + '\uf8ff'));
        const snap = await getDocs(q);
        setSearchResults(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };

    const submitVerification = async () => {
        if (!selectedSchool || !studentId || !studentEmail) {
            setVerifyError('Please pick a school and provide your student details.');
            return;
        }
        setVerifyError('');
        setIsSubmitting(true);
        try {
            await addDoc(collection(db, 'edu_verifications'), {
                userId: user?.uid || null,
                email: studentEmail,
                studentId,
                schoolId: selectedSchool.id,
                schoolName: selectedSchool.name,
                status: 'PENDING',
                createdAt: serverTimestamp()
            });
            setShowVerifyModal(false);
        } catch (e) {
            console.error('Verification request failed', e);
            setVerifyError('Could not submit verification. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCreatePetition = async () => {
        if (!petitionSchool || !petitionEmail) {
            setPetitionError('School name and email are required.');
            return;
        }
        setPetitionError('');
        setPetitionSubmitting(true);
        try {
            const petitionRef = await addDoc(collection(db, 'edu_petitions'), {
                schoolName: petitionSchool,
                city: petitionCity || null,
                createdBy: user?.uid || null,
                email: petitionEmail,
                signatures: user ? [user.uid] : [],
                signatureCount: user ? 1 : 0,
                target: PETITION_TARGET,
                status: 'COLLECTING',
                createdAt: serverTimestamp()
            });
            const shareUrl = `${window.location.origin}/edu/petition/${petitionRef.id}`;
            setPetitionLink(shareUrl);
        } catch (e) {
            console.error('Petition creation failed', e);
            setPetitionError('Could not start petition. Please try again.');
        } finally {
            setPetitionSubmitting(false);
        }
    };

    const copyPetitionLink = () => {
        if (!petitionLink) return;
        navigator.clipboard.writeText(petitionLink);
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="bg-white dark:bg-[#1f2128] border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300">
                        <Sparkles size={18} />
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-indigo-600">EDU Welcome Center</p>
                        <h1 className="text-2xl font-extrabold dark:text-white">Preview first. Verify when you’re ready.</h1>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Access public EDU resources, then unlock full campus tools with verification.</p>
                    </div>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <div className="bg-white dark:bg-[#1f2128] border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm space-y-3">
                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm uppercase">
                        <CheckCircle2 size={16} /> Student Activation
                    </div>
                    <h3 className="text-lg font-bold dark:text-white">{primaryCta}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Verify your enrollment to unlock hours tracking, announcements, and internship placement.</p>
                    <button 
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl transition"
                        onClick={() => setShowVerifyModal(true)}
                    >
                        Activate Student Access
                    </button>
                </div>

                <div className="bg-white dark:bg-[#1f2128] border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm space-y-3">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm uppercase">
                        <Megaphone size={16} /> Petition Your School
                    </div>
                    <h3 className="text-lg font-bold dark:text-white">School not listed?</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Start a petition link for classmates. Hit {PETITION_TARGET}+ signatures and we trigger EDU sales outreach.</p>
                    <button 
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl transition"
                        onClick={() => setShowPetitionModal(true)}
                    >
                        Start a Petition
                    </button>
                    {petitionLink && (
                        <div className="text-xs bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-2 flex items-center justify-between">
                            <span className="truncate">{petitionLink}</span>
                            <button onClick={copyPetitionLink} className="text-emerald-700 dark:text-emerald-300 hover:underline flex items-center gap-1"><Clipboard size={14}/>Copy</button>
                        </div>
                    )}
                </div>

                <div className="bg-white dark:bg-[#1f2128] border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm space-y-3">
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm uppercase">
                        <Building2 size={16} /> Program Discovery
                    </div>
                    <h3 className="text-lg font-bold dark:text-white">Find or list a program</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Browse partner schools or request partnership info for your administrators.</p>
                    <div className="grid grid-cols-1 gap-2">
                        <a className="text-sm font-bold text-indigo-600 hover:text-indigo-700 underline" href="https://seshnx.com/edu-directory" target="_blank" rel="noreferrer">Explore Partner Schools</a>
                        <a className="text-sm font-bold text-gray-700 dark:text-gray-200 hover:text-brand-blue underline" href="mailto:edu@seshnx.com?subject=Partnership%20Request">Request Partnership Info</a>
                    </div>
                </div>
            </div>

            {/* Verification Modal */}
            {showVerifyModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#1f2128] w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs uppercase font-bold text-indigo-600">Student Activation</p>
                                <h3 className="text-xl font-extrabold dark:text-white">Verify your enrollment</h3>
                            </div>
                            <button onClick={() => setShowVerifyModal(false)} className="text-gray-500 hover:text-gray-800 dark:hover:text-white text-sm font-bold">Close</button>
                        </div>

                        <div className="space-y-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search for your school..."
                                    value={schoolSearchTerm}
                                    onChange={(e) => {
                                        setSchoolSearchTerm(e.target.value);
                                        searchSchools(e.target.value);
                                    }}
                                    className="w-full pl-10 p-3 border rounded-lg dark:bg-black/20 dark:border-gray-600 dark:text-white"
                                />
                                {schoolSearchTerm.length > 0 && searchResults.length > 0 && (
                                    <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                                        {searchResults.map(school => (
                                            <div 
                                                key={school.id}
                                                className={`p-3 cursor-pointer hover:bg-indigo-50 dark:hover:bg-gray-700/50 ${selectedSchool?.id === school.id ? 'bg-indigo-100 dark:bg-indigo-900/30' : ''}`}
                                                onClick={() => {
                                                    setSelectedSchool(school);
                                                    setSchoolSearchTerm(school.name);
                                                    setSearchResults([]);
                                                }}
                                            >
                                                <div className="font-medium dark:text-white">{school.name}</div>
                                                <div className="text-xs text-gray-500">{school.city}, {school.state}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {selectedSchool && (
                                <div className="grid gap-3 md:grid-cols-2">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Student ID</label>
                                        <input
                                            type="text"
                                            value={studentId}
                                            onChange={(e) => setStudentId(e.target.value)}
                                            className="w-full p-3 border rounded-lg dark:bg-black/20 dark:border-gray-600 dark:text-white"
                                            placeholder="e.g., SESH00123"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase block mb-1">School Email</label>
                                        <div className="relative">
                                            <Mail size={16} className="absolute left-3 top-3 text-gray-400" />
                                            <input
                                                type="email"
                                                value={studentEmail}
                                                onChange={(e) => setStudentEmail(e.target.value)}
                                                className="w-full pl-9 p-3 border rounded-lg dark:bg-black/20 dark:border-gray-600 dark:text-white"
                                                placeholder="you@school.edu"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {verifyError && <p className="text-sm text-red-500">{verifyError}</p>}

                            <div className="flex gap-3 justify-end">
                                <button 
                                    className="px-4 py-2 rounded-lg border dark:border-gray-700 text-sm font-bold text-gray-600 dark:text-gray-300"
                                    onClick={() => setShowVerifyModal(false)}
                                >
                                    Cancel
                                </button>
                                <button 
                                    className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 disabled:opacity-60"
                                    onClick={submitVerification}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" size={16}/> : 'Submit Verification'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Petition Modal */}
            {showPetitionModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#1f2128] w-full max-w-xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs uppercase font-bold text-emerald-600">Petition</p>
                                <h3 className="text-xl font-extrabold dark:text-white">Start a petition for your school</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">We’ll notify the EDU team once signatures reach {PETITION_TARGET}.</p>
                            </div>
                            <button onClick={() => setShowPetitionModal(false)} className="text-gray-500 hover:text-gray-800 dark:hover:text-white text-sm font-bold">Close</button>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">School name</label>
                                <input 
                                    className="w-full p-3 border rounded-lg dark:bg-black/20 dark:border-gray-600 dark:text-white"
                                    value={petitionSchool}
                                    onChange={(e) => setPetitionSchool(e.target.value)}
                                    placeholder="e.g., Riverside Community College"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">City / Region</label>
                                <input 
                                    className="w-full p-3 border rounded-lg dark:bg-black/20 dark:border-gray-600 dark:text-white"
                                    value={petitionCity}
                                    onChange={(e) => setPetitionCity(e.target.value)}
                                    placeholder="City, State (optional)"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Your email</label>
                                <input 
                                    className="w-full p-3 border rounded-lg dark:bg-black/20 dark:border-gray-600 dark:text-white"
                                    value={petitionEmail}
                                    onChange={(e) => setPetitionEmail(e.target.value)}
                                    placeholder="name@email.com"
                                />
                            </div>
                            {petitionError && <p className="text-sm text-red-500">{petitionError}</p>}
                            {petitionLink && (
                                <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3 text-sm">
                                    <LinkIcon size={16} className="text-emerald-600" />
                                    <span className="truncate">{petitionLink}</span>
                                    <button onClick={copyPetitionLink} className="ml-auto text-emerald-700 dark:text-emerald-300 hover:underline flex items-center gap-1"><Clipboard size={14}/>Copy</button>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3">
                            <button 
                                className="px-4 py-2 rounded-lg border dark:border-gray-700 text-sm font-bold text-gray-600 dark:text-gray-300"
                                onClick={() => setShowPetitionModal(false)}
                            >
                                Cancel
                            </button>
                            <button 
                                className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 disabled:opacity-60"
                                onClick={handleCreatePetition}
                                disabled={petitionSubmitting}
                            >
                                {petitionSubmitting ? <Loader2 className="animate-spin" size={16}/> : 'Generate Petition Link'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
