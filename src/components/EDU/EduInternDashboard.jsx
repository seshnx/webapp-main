import React, { useState } from 'react';
import { useSchool } from '../../contexts/SchoolContext';
import { MapPin, Clock, Briefcase, CheckCircle, AlertCircle, School } from 'lucide-react';
import { formatHours } from '../../utils/eduTime';

export default function EduInternDashboard({ user, userData }) {
    const { 
        schoolData, studentProfile, internshipStudio, 
        checkIn, checkOut 
    } = useSchool();

    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

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
        </div>
    );
}
