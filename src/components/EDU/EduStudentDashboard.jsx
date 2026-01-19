import React, { useState, useEffect } from 'react';
import { useSchool } from '../../contexts/SchoolContext';
import { MapPin, Search, CheckCircle, Clock, School, BookOpen, Award, Users, Calendar, Play } from 'lucide-react';
import { useEduAuth } from '../../contexts/EduAuthContext';

export default function EduStudentDashboard({ user: propUser, userData: propUserData }) {
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
    
    const { schoolData, studentProfile } = useSchool();
    
    const [newInterest, setNewInterest] = useState('');
    const [studios, setStudios] = useState([]);
    const [loadingStudios, setLoadingStudios] = useState(false);
    const [courses, setCourses] = useState([]);
    const [enrollments, setEnrollments] = useState([]);
    const [learningPaths, setLearningPaths] = useState([]);
    const [badges, setBadges] = useState([]);
    const [loadingCourses, setLoadingCourses] = useState(false);

    const interests = userData?.internshipCities || [];
    const schoolId = userData?.schoolId;
    
    const handleAddInterest = async () => {
        const trimmed = newInterest.trim();
        const userId = user?.id || user?.uid;
        if (trimmed && interests.length < 3 && supabase) {
            try {
                const updatedInterests = [...interests, trimmed];
                await supabase
                    .from('profiles')
                    .update({ internship_cities: updatedInterests })
                    .eq('id', userId);
                setNewInterest('');
            } catch (e) { console.error("Error adding interest:", e); }
        }
    };

    const handleRemoveInterest = async (interest) => {
        const userId = user?.id || user?.uid;
        if (!supabase) return;
        try {
            const updatedInterests = interests.filter(i => i !== interest);
            await supabase
                .from('profiles')
                .update({ internship_cities: updatedInterests })
                .eq('id', userId);
        } catch (e) { console.error("Error removing interest:", e); }
    };

    useEffect(() => {
        if (userData?.programComplete) {
            fetchAvailableStudios();
        }
    }, [userData?.programComplete, interests]);

    useEffect(() => {
        if (schoolId && user?.uid) {
            loadCourses();
            loadEnrollments();
            loadLearningPaths();
            loadBadges();
        }
    }, [schoolId, user?.uid]);

    const fetchAvailableStudios = async () => {
        if (!supabase) return;
        setLoadingStudios(true);
        try {
            const { data: studiosData, error } = await supabase
                .from('studios')
                .select('*')
                .eq('allow_internship', true);
            
            if (error) throw error;
            
            let results = (studiosData || []).map(d => ({
                id: d.id,
                ...d,
                allowInternship: d.allow_internship,
                zipCode: d.zip_code
            }));

            if (interests.length > 0) {
                results = results.filter(studio => 
                    interests.some(interest => 
                        studio.city?.toLowerCase().includes(interest.toLowerCase()) || 
                        studio.zipCode?.includes(interest)
                    )
                );
            }
            setStudios(results);
        } catch (e) { console.error("Error fetching studios:", e); } 
        finally { setLoadingStudios(false); }
    };

    const loadCourses = async () => {
        if (!supabase || !schoolId) return;
        setLoadingCourses(true);
        try {
            const { data: coursesData, error } = await supabase
                .from('courses')
                .select('*')
                .eq('school_id', schoolId)
                .eq('status', 'published');
            
            if (error) throw error;
            
            setCourses((coursesData || []).map(c => ({ id: c.id, ...c })));
        } catch (error) {
            console.error('Error loading courses:', error);
        }
        setLoadingCourses(false);
    };

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

    const loadLearningPaths = async () => {
        if (!supabase || !schoolId) return;
        try {
            const { data: pathsData, error } = await supabase
                .from('learning_paths')
                .select('*')
                .eq('school_id', schoolId);
            
            if (error) throw error;
            
            setLearningPaths((pathsData || []).map(p => ({ id: p.id, ...p })));
        } catch (error) {
            console.error('Error loading learning paths:', error);
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

    const handleEnroll = async (courseId) => {
        if (!supabase || !schoolId) return;
        const userId = user?.id || user?.uid;
        try {
            await supabase
                .from('enrollments')
                .insert({
                    school_id: schoolId,
                    student_id: userId,
                    course_id: courseId,
                    enrolled_at: new Date().toISOString(),
                    progress: 0,
                    status: 'active'
                });
            loadEnrollments();
        } catch (error) {
            console.error('Error enrolling:', error);
            alert('Failed to enroll in course.');
        }
    };

    const enrolledCourseIds = enrollments.map(e => e.courseId);
    const availableCourses = courses.filter(c => !enrolledCourseIds.includes(c.id));
    const myEnrolledCourses = courses.filter(c => enrolledCourseIds.includes(c.id));
    
    const progress = (studentProfile?.hoursLogged || 0) / (schoolData?.requiredHours || 100);

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            
            {/* --- SCHOOL IDENTITY HEADER --- */}
            <div className="bg-white dark:bg-[#2c2e36] p-6 rounded-2xl border dark:border-gray-700 shadow-sm flex flex-col md:flex-row items-center gap-6">
                <div className="h-24 w-24 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center overflow-hidden border-2 border-gray-200 dark:border-gray-600 shrink-0 p-2">
                    {schoolData?.logoURL ? (
                        <img src={schoolData.logoURL} className="h-full w-full object-contain" alt="School Logo" />
                    ) : (
                        <School size={32} className="text-gray-400"/>
                    )}
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h1 className="text-3xl font-extrabold dark:text-white tracking-tight mb-1">
                        {schoolData?.name || 'Student Dashboard'}
                    </h1>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                        <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 px-2 py-0.5 rounded text-xs uppercase font-bold tracking-wide">
                            Student Portal
                        </span>
                        <span>•</span>
                        <span>ID: {userData?.studentId || 'N/A'}</span>
                        <span>•</span>
                        <span>Cohort: {studentProfile?.cohort || 'General'}</span>
                    </div>
                </div>
                
                {/* Progress Stats */}
                <div className="w-full md:w-64 bg-gray-50 dark:bg-black/20 p-4 rounded-xl border dark:border-gray-700">
                    <div className="flex justify-between text-sm font-bold mb-2">
                        <span className="dark:text-gray-300">Progress</span>
                        <span className="text-indigo-600">{Math.round(progress * 100)}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
                        <div className="h-full bg-indigo-600" style={{ width: `${Math.min(100, progress * 100)}%` }}></div>
                    </div>
                    <p className="text-xs text-gray-500 text-right">{studentProfile?.hoursLogged || 0} / {schoolData?.requiredHours || 100} Hours</p>
                </div>
            </div>
            
            {/* Internship Interests */}
            <div className="bg-white dark:bg-[#2c2e36] p-6 rounded-xl border dark:border-gray-700 shadow-sm space-y-6">
                <h2 className="text-xl font-bold dark:text-white flex items-center gap-2"><MapPin size={20} className="text-indigo-500" /> Internship Locations</h2>
                <p className="text-gray-500 text-sm">Add up to 3 target locations (City, Zip, or County) to find matched studios.</p>
                
                <div className="flex flex-wrap gap-2">
                    {interests.map(interest => (
                        <span key={interest} className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 text-sm font-medium px-3 py-1 rounded-full flex items-center gap-1">
                            {interest}
                            <button onClick={() => handleRemoveInterest(interest)} className="ml-1 hover:text-indigo-800">&times;</button>
                        </span>
                    ))}
                </div>

                {interests.length < 3 && (
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Enter City or Zip Code"
                            value={newInterest}
                            onChange={(e) => setNewInterest(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddInterest()}
                            className="flex-1 p-2 border rounded-lg dark:bg-black/20 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        <button onClick={handleAddInterest} disabled={!newInterest.trim()} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold disabled:opacity-50">Add</button>
                    </div>
                )}
            </div>
            
            {/* My Courses */}
            <div className="bg-white dark:bg-[#2c2e36] p-6 rounded-xl border dark:border-gray-700 shadow-sm space-y-4">
                <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
                    <BookOpen size={20} className="text-indigo-500" /> 
                    My Courses
                </h2>
                {myEnrolledCourses.length === 0 ? (
                    <p className="text-gray-500">You haven't enrolled in any courses yet.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {myEnrolledCourses.map(course => {
                            const enrollment = enrollments.find(e => e.courseId === course.id);
                            return (
                                <div key={course.id} className="p-4 border rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-white/5 transition">
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="font-bold dark:text-white">{course.title}</h3>
                                        <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                                            Enrolled
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                                        {course.description}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <Play size={14} />
                                            <span>{course.lessonCount || 0} lessons</span>
                                        </div>
                                        <button className="text-indigo-600 text-sm font-semibold hover:underline">
                                            Continue Learning →
                                        </button>
                                    </div>
                                    {enrollment && (
                                        <div className="mt-3">
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-gray-500">Progress</span>
                                                <span className="text-gray-700 dark:text-gray-300">{enrollment.progress || 0}%</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-indigo-600 transition-all"
                                                    style={{ width: `${enrollment.progress || 0}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Available Courses */}
            {availableCourses.length > 0 && (
                <div className="bg-white dark:bg-[#2c2e36] p-6 rounded-xl border dark:border-gray-700 shadow-sm space-y-4">
                    <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
                        <BookOpen size={20} className="text-indigo-500" /> 
                        Available Courses
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {availableCourses.slice(0, 4).map(course => (
                            <div key={course.id} className="p-4 border rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-white/5 transition">
                                <h3 className="font-bold dark:text-white mb-1">{course.title}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                                    {course.description}
                                </p>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <Play size={14} />
                                        <span>{course.lessonCount || 0} lessons</span>
                                    </div>
                                    <button
                                        onClick={() => handleEnroll(course.id)}
                                        className="px-4 py-1.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition"
                                    >
                                        Enroll
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Badges & Certificates */}
            {badges.length > 0 && (
                <div className="bg-white dark:bg-[#2c2e36] p-6 rounded-xl border dark:border-gray-700 shadow-sm space-y-4">
                    <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
                        <Award size={20} className="text-yellow-500" /> 
                        Earned Badges & Certificates
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {badges.map(badge => (
                            <div key={badge.id} className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <Award size={32} className="mx-auto text-yellow-500 mb-2" />
                                <p className="text-sm font-semibold dark:text-white">{badge.name}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {badge.earnedAt?.toDate?.().toLocaleDateString() || 'Recently'}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Available Studios */}
            {userData?.programComplete && (
                <div className="bg-white dark:bg-[#2c2e36] p-6 rounded-xl border dark:border-gray-700 shadow-sm space-y-4">
                    <h2 className="text-xl font-bold dark:text-white flex items-center gap-2"><Search size={20} className="text-indigo-500" /> Available Studios</h2>
                    {loadingStudios ? <p className="text-gray-500 flex items-center gap-2"><Clock className="animate-spin" size={16}/> Searching...</p> : (
                        studios.length > 0 ? (
                            <div className="space-y-3">
                                {studios.map(studio => (
                                    <div key={studio.id} className="p-4 border rounded-lg dark:border-gray-700 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-white/5 transition">
                                        <div>
                                            <p className="font-bold dark:text-white text-lg">{studio.name}</p>
                                            <p className="text-sm text-gray-500 flex items-center gap-1"><MapPin size={12}/> {studio.city}, {studio.state}</p>
                                        </div>
                                        <button className="text-indigo-600 font-bold text-sm hover:underline">View Details</button>
                                    </div>
                                ))}
                            </div>
                        ) : <p className="text-gray-500 flex items-center gap-2"><CheckCircle size={16}/> No studios found matching your criteria yet.</p>
                    )}
                </div>
            )}
        </div>
    );
}
