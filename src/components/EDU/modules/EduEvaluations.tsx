import React, { useState, useEffect } from 'react';
import {
    GraduationCap, Search, ChevronRight, Star, User, Plus, History, Save
} from 'lucide-react';
import { formatHours } from '../../../utils/eduTime';

/**
 * Student interface
 */
interface Student {
    id: string;
    displayName?: string;
    display_name?: string;
    firstName?: string;
    first_name?: string;
    lastName?: string;
    last_name?: string;
    email?: string;
    status?: string;
    studentId?: string;
    student_id?: string;
    cohort?: string;
    hoursLogged?: number;
    hours_logged?: number;
    [key: string]: any;
}

/**
 * Evaluation interface
 */
interface Evaluation {
    id: string;
    student_id?: string;
    studentId?: string;
    technical?: number;
    soft_skills?: number;
    softSkills?: number;
    notes?: string;
    evaluator?: string;
    date?: any;
    [key: string]: any;
}

/**
 * Grade form interface
 */
interface GradeForm {
    technical: number;
    softSkills: number;
    notes: string;
}

/**
 * EduEvaluations props
 */
export interface EduEvaluationsProps {
    schoolId?: string;
    logAction?: (action: string, details: string) => Promise<void> | void;
    graderName?: string;
}

export default function EduEvaluations({ schoolId, logAction, graderName }: EduEvaluationsProps) {
    // TODO: Migrate to Neon/Convex - Supabase legacy code
    // @ts-ignore - supabase is global for legacy support
    const supabase = (window as any).supabase;

    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>('');

    // Selection State
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [studentHistory, setStudentHistory] = useState<Evaluation[]>([]);
    const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

    // Form State
    const [showForm, setShowForm] = useState<boolean>(false);
    const [gradeForm, setGradeForm] = useState<GradeForm>({
        technical: 5,
        softSkills: 5,
        notes: ''
    });

    // --- INITIAL DATA ---
    useEffect(() => {
        if (!schoolId || !supabase) return;

        const fetchStudents = async () => {
            setLoading(true);
            try {
                const { data: studentsData, error } = await supabase
                    .from('students')
                    .select('id, display_name, first_name, last_name, email, status')
                    .eq('school_id', schoolId)
                    .order('display_name', { ascending: true });

                if (error) throw error;

                setStudents((studentsData || []).map((s: any) => ({
                    id: s.id,
                    displayName: s.display_name,
                    firstName: s.first_name,
                    lastName: s.last_name,
                    email: s.email,
                    status: s.status
                })));
            } catch (e) {
                console.error("Error loading students:", e);
            }
            setLoading(false);
        };
        fetchStudents();
    }, [schoolId]);

    // --- FETCH HISTORY ON SELECTION ---
    useEffect(() => {
        if (!selectedStudent || !supabase || !schoolId) return;

        const fetchHistory = async () => {
            setLoadingHistory(true);
            try {
                const { data: evaluationsData, error } = await supabase
                    .from('evaluations')
                    .select('*')
                    .eq('school_id', schoolId)
                    .eq('student_id', selectedStudent.id)
                    .order('date', { ascending: false });

                if (error) throw error;

                setStudentHistory((evaluationsData || []).map((e: any) => ({
                    id: e.id,
                    ...e,
                    softSkills: e.soft_skills,
                    date: e.date
                })));
            } catch (e) {
                console.error("Error loading history:", e);
            }
            setLoadingHistory(false);
        };

        fetchHistory();
        setShowForm(false); // Reset view to history
        setGradeForm({ technical: 5, softSkills: 5, notes: '' }); // Reset form
    }, [selectedStudent, schoolId]);

    // --- ACTIONS ---

    const handleSubmitGrade = async () => {
        if (!selectedStudent || !supabase || !schoolId) return;

        try {
            const { data: newEvaluation, error } = await supabase
                .from('evaluations')
                .insert({
                    school_id: schoolId,
                    student_id: selectedStudent.id,
                    technical: gradeForm.technical,
                    soft_skills: gradeForm.softSkills,
                    notes: gradeForm.notes || null,
                    evaluator: graderName || 'EDUStaff',
                    date: new Date().toISOString()
                })
                .select()
                .single();

            if (error) throw error;

            // Update local history
            setStudentHistory(prev => [{
                id: newEvaluation.id,
                ...newEvaluation,
                softSkills: newEvaluation.soft_skills,
                date: newEvaluation.date
            }, ...prev]);

            if (logAction) await logAction('Grade Student', `Graded ${selectedStudent.displayName}: Tech(${gradeForm.technical}) Soft(${gradeForm.softSkills})`);

            setShowForm(false);
            alert("Evaluation submitted successfully.");
        } catch (e) {
            console.error("Grading failed:", e);
            alert("Failed to save evaluation.");
        }
    };

    // --- HELPERS ---
    const filteredStudents = students.filter(s =>
        s.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.studentId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getScoreColor = (score?: number): string => {
        if (!score) return 'text-gray-500';
        if (score >= 8) return 'text-green-500';
        if (score >= 5) return 'text-yellow-500';
        return 'text-red-500';
    };

    if (loading) return <div className="p-10 text-center text-gray-500">Loading Roster...</div>;

    return (
        <div className="flex flex-col md:flex-row h-[600px] border dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-[#2c2e36] animate-in fade-in shadow-sm">

            {/* LEFT: STUDENT LIST */}
            <div className="w-full md:w-1/3 border-r dark:border-gray-700 flex flex-col bg-gray-50 dark:bg-[#23262f]">
                <div className="p-4 border-b dark:border-gray-700">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={16}/>
                        <input
                            className="w-full pl-9 p-2 text-sm border rounded-lg dark:bg-black/20 dark:border-gray-600 dark:text-white"
                            placeholder="Search Students..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {filteredStudents.map(s => (
                        <div
                            key={s.id}
                            onClick={() => setSelectedStudent(s)}
                            className={`p-3 px-4 cursor-pointer flex justify-between items-center transition border-b dark:border-gray-700/50 last:border-0
                                ${selectedStudent?.id === s.id ? 'bg-white dark:bg-[#2c2e36] border-l-4 border-l-indigo-600 shadow-sm' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}
                            `}
                        >
                            <div>
                                <div className={`font-bold text-sm ${selectedStudent?.id === s.id ? 'text-indigo-700 dark:text-white' : 'dark:text-gray-300'}`}>
                                    {s.displayName}
                                </div>
                                <div className="text-xs text-gray-500">{s.cohort || 'General'} • {s.hoursLogged || 0} hrs</div>
                            </div>
                            {selectedStudent?.id === s.id && <ChevronRight size={16} className="text-indigo-500"/>}
                        </div>
                    ))}
                </div>
            </div>

            {/* RIGHT: GRADING PANEL */}
            <div className="flex-1 flex flex-col relative">
                {!selectedStudent ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <GraduationCap size={48} className="mb-4 opacity-20"/>
                        <p>Select a student to view history or submit grades.</p>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center bg-white dark:bg-[#2c2e36]">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold">
                                    {selectedStudent.displayName?.[0] || '?'}
                                </div>
                                <div>
                                    <h2 className="font-bold dark:text-white">{selectedStudent.displayName}</h2>
                                    <p className="text-xs text-gray-500">ID: {selectedStudent.studentId || 'N/A'}</p>
                                </div>
                            </div>
                            {!showForm ? (
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-700 flex items-center gap-2"
                                >
                                    <Plus size={16}/> New Evaluation
                                </button>
                            ) : (
                                <button
                                    onClick={() => setShowForm(false)}
                                    className="text-gray-500 hover:text-gray-700 dark:hover:text-white flex items-center gap-2 text-sm font-bold"
                                >
                                    <History size={16}/> View History
                                </button>
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-[#2c2e36]">

                            {/* MODE 1: NEW EVALUATION FORM */}
                            {showForm && (
                                <div className="max-w-lg mx-auto space-y-6 animate-in slide-in-from-bottom-4">
                                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-100 dark:border-indigo-800/50 mb-6">
                                        <h4 className="font-bold text-indigo-800 dark:text-indigo-300 mb-1">New Assessment</h4>
                                        <p className="text-xs text-indigo-600 dark:text-indigo-400">
                                            Rating performance for {new Date().toLocaleDateString()}.
                                        </p>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <div className="flex justify-between mb-2">
                                                <label className="font-bold text-sm dark:text-gray-300">Technical Proficiency</label>
                                                <span className={`font-bold ${getScoreColor(gradeForm.technical)}`}>{gradeForm.technical}/10</span>
                                            </div>
                                            <input
                                                type="range" min="1" max="10" step="1"
                                                className="w-full accent-indigo-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                                value={gradeForm.technical}
                                                onChange={e => setGradeForm({...gradeForm, technical: parseInt(e.target.value)})}
                                            />
                                            <p className="text-xs text-gray-400 mt-1">Knowledge of equipment, software, and signal flow.</p>
                                        </div>

                                        <div>
                                            <div className="flex justify-between mb-2">
                                                <label className="font-bold text-sm dark:text-gray-300">Soft Skills / Professionalism</label>
                                                <span className={`font-bold ${getScoreColor(gradeForm.softSkills)}`}>{gradeForm.softSkills}/10</span>
                                            </div>
                                            <input
                                                type="range" min="1" max="10" step="1"
                                                className="w-full accent-indigo-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                                value={gradeForm.softSkills}
                                                onChange={e => setGradeForm({...gradeForm, softSkills: parseInt(e.target.value)})}
                                            />
                                            <p className="text-xs text-gray-400 mt-1">Punctuality, attitude, communication, and client handling.</p>
                                        </div>

                                        <div>
                                            <label className="font-bold text-sm dark:text-gray-300 block mb-2">Instructor Notes</label>
                                            <textarea
                                                className="w-full p-3 border rounded-lg dark:bg-black/20 dark:border-gray-600 dark:text-white min-h-[100px]"
                                                placeholder="Detailed feedback..."
                                                value={gradeForm.notes}
                                                onChange={e => setGradeForm({...gradeForm, notes: e.target.value})}
                                            />
                                        </div>

                                        <button
                                            onClick={handleSubmitGrade}
                                            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-2 shadow-lg"
                                        >
                                            <Save size={18}/> Submit Evaluation
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* MODE 2: HISTORY LIST */}
                            {!showForm && (
                                <div className="space-y-4">
                                    {loadingHistory ? (
                                        <p className="text-center text-gray-500">Loading history...</p>
                                    ) : studentHistory.length === 0 ? (
                                        <div className="text-center py-10 border-2 border-dashed dark:border-gray-700 rounded-xl">
                                            <GraduationCap size={32} className="mx-auto text-gray-300 mb-2"/>
                                            <p className="text-gray-500">No evaluations recorded yet.</p>
                                            <button onClick={() => setShowForm(true)} className="text-indigo-500 font-bold text-sm mt-2 hover:underline">Start first evaluation</button>
                                        </div>
                                    ) : (
                                        studentHistory.map(evalItem => (
                                            <div key={evalItem.id} className="border dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition bg-gray-50 dark:bg-[#23262f]">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">
                                                            {evalItem.date?.toDate ? evalItem.date.toDate().toLocaleDateString() : 'Unknown Date'}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <User size={14} className="text-gray-400"/>
                                                            <span className="text-sm font-medium dark:text-gray-200">{evalItem.evaluator}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <div className="text-center px-3 py-1 bg-white dark:bg-black/20 rounded border dark:border-gray-600">
                                                            <div className={`font-bold ${getScoreColor(evalItem.technical)}`}>{evalItem.technical}</div>
                                                            <div className="text-[9px] text-gray-400 uppercase">Tech</div>
                                                        </div>
                                                        <div className="text-center px-3 py-1 bg-white dark:bg-black/20 rounded border dark:border-gray-600">
                                                            <div className={`font-bold ${getScoreColor(evalItem.softSkills)}`}>{evalItem.softSkills}</div>
                                                            <div className="text-[9px] text-gray-400 uppercase">Soft</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                {evalItem.notes && (
                                                    <div className="text-sm text-gray-600 dark:text-gray-300 border-t dark:border-gray-700 pt-3 mt-2">
                                                        "{evalItem.notes}"
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
