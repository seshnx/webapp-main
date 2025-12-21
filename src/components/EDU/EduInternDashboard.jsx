import React, { useState, useEffect } from 'react';
import { useSchool } from '../../contexts/SchoolContext';
import { MapPin, Clock, Briefcase, CheckCircle, AlertCircle, School, BookOpen, Award, Target } from 'lucide-react';
import { formatHours } from '../../utils/eduTime';
import { useEduAuth } from '../../contexts/EduAuthContext';
import { supabase } from '../../config/supabase';

export default function EduInternDashboard({ user: propUser, userData: propUserData }) {
    // Use EduAuth hook if available, otherwise fall back to props (backward compatibility)
    let eduAuth;
    try {
        eduAuth = useEduAuth();
    } catch (e) {
        // Not wrapped in EduAuthProvider, use props
        eduAuth = null;
    }
    
    const user = eduAuth?.user || propUser;
    const userData = eduAuth?.userData || propUserData;
    
    const { 
        schoolData, studentProfile, internshipStudio, 
        checkIn, checkOut 
    } = useSchool();

    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [enrollments, setEnrollments] = useState([]);
    const [badges, setBadges] = useState([]);
    const [milestones, setMilestones] = useState([]);

    const schoolId = userData?.schoolId;

    useEffect(() => {
        if (schoolId && (user?.id || user?.uid) && supabase) {
            loadEnrollments();
            loadBadges();
            loadMilestones();
        }
    }, [schoolId, user?.id, user?.uid]);

    const loadEnrollments = async () => {
        if (!supabase || !schoolId) return;
        const userId = user?.id || user?.uid;
        try {
            const { data: enrollmentsData, error } = await supabase
                .from('enrollments')
                .select('*')
                .eq('school_id', schoolId)
                .eq('student_id', userId);
            
            if (error) throw error;
            
            setEnrollments((enrollmentsData || []).map(e => ({
                id: e.id,
                ...e,
                studentId: e.student_id,
                courseId: e.course_id,
                enrolledAt: e.enrolled_at
            })));
        } catch (error) {
            console.error('Error loading enrollments:', error);
        }
    };

    const loadBadges = async () => {
        if (!supabase || !schoolId) return;
        const userId = user?.id || user?.uid;
        try {
            const { data: badgesData, error } = await supabase
                .from('badges')
                .select('*')
                .eq('school_id', schoolId)
                .eq('student_id', userId);
            
            if (error) throw error;
            
            setBadges((badgesData || []).map(b => ({
                id: b.id,
                ...b,
                studentId: b.student_id
            })));
        } catch (error) {
            console.error('Error loading badges:', error);
        }
    };

    const loadMilestones = async () => {
        // Load internship milestones from student profile or separate collection
        if (studentProfile?.milestones) {
            setMilestones(studentProfile.milestones);
        }
    };

    const handleClockAction = async () => {
        setLoading(true);
        try {
            if (studentProfile?.isClockedIn) {
                await checkOut(description);
                setDescription('');
            } else {
                await checkIn(internshipStudio?.name || 'Remote Internship', 'studio');
            }
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    if (!studentProfile) return <div className="p-8 text-center">Loading student profile...</div>;

    const progress = Math.min(100, (studentProfile.hoursLogged || 0) / (schoolData?.requiredHours || 100) * 100);

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
            
            {/* --- SCHOOL IDENTITY HEADER --- */}
            <div className="bg-white dark:bg-[#2c2e36] p-6 rounded-2xl border dark:border-gray-700 shadow-sm flex flex-col md:flex-row items-center gap-6">
                <div className="h-20 w-20 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center overflow-hidden border-2 border-gray-200 dark:border-gray-600 shrink-0 p-1">
                    {schoolData?.logoURL ? (
                        <img src={schoolData.logoURL} className="h-full w-full object-contain" alt="School Logo" />
                    ) : (
                        <School size={32} className="text-gray-400"/>
                    )}
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h1 className="text-3xl font-extrabold dark:text-white tracking-tight mb-1">
                        {schoolData?.name || 'Internship Dashboard'}
                    </h1>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                         <span className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 px-2 py-0.5 rounded text-xs uppercase font-bold tracking-wide">
                            Active Intern
                        </span>
                        <span>•</span>
                        <span>Cohort: {studentProfile.cohort}</span>
                    </div>
                </div>
                <div className="text-right hidden md:block">
                    <div className="text-3xl font-black dark:text-white text-indigo-600">{studentProfile.hoursLogged || 0}</div>
                    <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Total Hours</div>
                </div>
            </div>

            {/* Active Internship Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-8 rounded-2xl relative overflow-hidden shadow-lg border border-indigo-800/50">
                    <div className="relative z-10">
                        <h3 className="text-xs font-bold uppercase tracking-widest opacity-60 mb-2">Assigned Studio Location</h3>
                        <h2 className="text-3xl font-extrabold mb-4 tracking-tight">{internshipStudio?.name || "Pending Assignment"}</h2>
                        
                        {internshipStudio ? (
                            <div className="space-y-3 text-sm opacity-90">
                                <p className="flex items-center gap-2"><MapPin size={18} className="text-indigo-400"/> {internshipStudio.address || "Address not listed"}</p>
                                <p className="flex items-center gap-2"><CheckCircle size={18} className="text-green-400"/> Status: Active Placement</p>
                            </div>
                        ) : (
                            <div className="bg-white/10 p-4 rounded-xl flex items-start gap-3 border border-white/10">
                                <AlertCircle className="text-yellow-400 shrink-0 mt-0.5" size={20}/>
                                <p className="text-sm leading-relaxed">You haven't been assigned an internship location yet. Please contact your school coordinator to get placed.</p>
                            </div>
                        )}
                    </div>
                    {/* Decorative Circle */}
                    <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl"></div>
                </div>

                {/* Time Clock */}
                <div className="bg-white dark:bg-[#2c2e36] p-6 rounded-2xl border dark:border-gray-700 shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="font-bold dark:text-white mb-4 flex items-center gap-2">
                            <Clock className={studentProfile.isClockedIn ? "text-green-500 animate-pulse" : "text-gray-400"}/> 
                            {studentProfile.isClockedIn ? 'Currently Working' : 'Time Clock'}
                        </h3>
                        {studentProfile.isClockedIn && (
                            <textarea 
                                className="w-full p-3 text-sm border rounded-xl mb-4 dark:bg-black/20 dark:border-gray-600 dark:text-white resize-none focus:ring-2 focus:ring-indigo-500 outline-none"
                                rows="4"
                                placeholder="Describe your tasks for this session..."
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                            />
                        )}
                    </div>
                    
                    <button 
                        onClick={handleClockAction}
                        disabled={loading || (!internshipStudio && !studentProfile.isClockedIn)}
                        className={`w-full py-3.5 rounded-xl font-bold text-white transition shadow-lg transform active:scale-95 ${
                            loading ? 'bg-gray-400' :
                            studentProfile.isClockedIn ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30' : 
                            'bg-green-600 hover:bg-green-700 shadow-green-600/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none'
                        }`}
                    >
                        {loading ? 'Processing...' : studentProfile.isClockedIn ? 'Clock Out' : 'Clock In'}
                    </button>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-white dark:bg-[#2c2e36] p-6 rounded-2xl border dark:border-gray-700 shadow-sm">
                <div className="flex justify-between text-sm font-bold mb-2">
                    <span className="dark:text-white">Completion Progress</span>
                    <span className="text-indigo-600">{Math.round(progress)}%</span>
                </div>
                <div className="w-full h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-1000 ease-out" style={{width: `${progress}%`}}></div>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                    {studentProfile.hoursLogged} / {schoolData?.requiredHours || 100} Hours Required
                </p>
            </div>

            {/* Course Progress */}
            {enrollments.length > 0 && (
                <div className="bg-white dark:bg-[#2c2e36] p-6 rounded-2xl border dark:border-gray-700 shadow-sm space-y-4">
                    <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
                        <BookOpen size={20} className="text-indigo-500" />
                        Course Progress
                    </h2>
                    <div className="space-y-3">
                        {enrollments.map(enrollment => (
                            <div key={enrollment.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-semibold dark:text-white">Course {enrollment.courseId}</span>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">{enrollment.progress || 0}%</span>
                                </div>
                                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-indigo-600 transition-all"
                                        style={{ width: `${enrollment.progress || 0}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Milestones */}
            {milestones.length > 0 && (
                <div className="bg-white dark:bg-[#2c2e36] p-6 rounded-2xl border dark:border-gray-700 shadow-sm space-y-4">
                    <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
                        <Target size={20} className="text-purple-500" />
                        Internship Milestones
                    </h2>
                    <div className="space-y-2">
                        {milestones.map((milestone, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                {milestone.completed ? (
                                    <CheckCircle size={20} className="text-green-500" />
                                ) : (
                                    <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-full" />
                                )}
                                <span className={milestone.completed ? 'text-gray-600 dark:text-gray-400 line-through' : 'dark:text-white'}>
                                    {milestone.name}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Badges */}
            {badges.length > 0 && (
                <div className="bg-white dark:bg-[#2c2e36] p-6 rounded-2xl border dark:border-gray-700 shadow-sm space-y-4">
                    <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
                        <Award size={20} className="text-yellow-500" />
                        Earned Badges
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {badges.map(badge => (
                            <div key={badge.id} className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <Award size={32} className="mx-auto text-yellow-500 mb-2" />
                                <p className="text-sm font-semibold dark:text-white">{badge.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
