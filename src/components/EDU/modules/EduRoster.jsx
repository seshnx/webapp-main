import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Briefcase, Link, Edit2, Trash2, X, Save } from 'lucide-react';
import { exportToCSV } from '../../../utils/dataExport';

export default function EduRoster({ schoolId, logAction }) {
    const [students, setStudents] = useState([]);
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal States
    const [showStudentModal, setShowStudentModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    // Forms
    const [studentForm, setStudentForm] = useState({ 
        firstName: '', lastName: '', email: '', studentId: '', cohort: '', status: 'Enrolled' 
    });
    const [assignStudioId, setAssignStudioId] = useState('');

    // --- DATA FETCHING ---
    useEffect(() => {
        if (!schoolId || !supabase) return;
        
        const loadData = async () => {
            setLoading(true);
            try {
                // Fetch Students
                const { data: studentsData, error: studentsError } = await supabase
                    .from('students')
                    .select('*')
                    .eq('school_id', schoolId);
                
                if (studentsError) throw studentsError;
                
                setStudents((studentsData || []).map(d => ({
                    id: d.id,
                    ...d,
                    displayName: d.display_name,
                    studentId: d.student_id,
                    hoursLogged: d.hours_logged || 0
                })));

                // Fetch Partners (for assignment dropdown)
                const { data: partnersData, error: partnersError } = await supabase
                    .from('school_partners')
                    .select('*')
                    .eq('school_id', schoolId);
                
                if (partnersError) throw partnersError;
                
                setPartners((partnersData || []).map(d => ({ id: d.id, ...d })));
            } catch (e) {
                console.error("Roster load failed:", e);
            }
            setLoading(false);
        };
        loadData();
    }, [schoolId]);

    // --- HANDLERS ---

    const handleOpenAdd = () => {
        setStudentForm({ firstName: '', lastName: '', email: '', studentId: '', cohort: '', status: 'Enrolled' });
        setIsEditing(false);
        setSelectedStudent(null);
        setShowStudentModal(true);
    };

    const handleOpenEdit = (student) => {
        setStudentForm({
            firstName: student.displayName?.split(' ')[0] || '',
            lastName: student.displayName?.split(' ').slice(1).join(' ') || '',
            email: student.email || '',
            studentId: student.studentId || '',
            cohort: student.cohort || '',
            status: student.status || 'Enrolled'
        });
        setIsEditing(true);
        setSelectedStudent(student);
        setShowStudentModal(true);
    };

    const handleSaveStudent = async () => {
        if (!supabase || !schoolId) return;
        
        const displayName = `${studentForm.firstName} ${studentForm.lastName}`.trim();
        if (!displayName || !studentForm.email) return alert("Name and Email required.");

        try {
            if (isEditing && selectedStudent) {
                const { error } = await supabase
                    .from('students')
                    .update({
                        first_name: studentForm.firstName,
                        last_name: studentForm.lastName,
                        display_name: displayName,
                        email: studentForm.email,
                        student_id: studentForm.studentId || null,
                        cohort: studentForm.cohort || null,
                        status: studentForm.status
                    })
                    .eq('id', selectedStudent.id)
                    .eq('school_id', schoolId);
                
                if (error) throw error;
                
                setStudents(prev => prev.map(s => s.id === selectedStudent.id ? { ...s, ...studentForm, displayName } : s));
                if (logAction) await logAction('Edit Student', `Updated ${displayName}`);
            } else {
                const { data: newStudent, error } = await supabase
                    .from('students')
                    .insert({
                        school_id: schoolId,
                        first_name: studentForm.firstName,
                        last_name: studentForm.lastName,
                        display_name: displayName,
                        email: studentForm.email,
                        student_id: studentForm.studentId || null,
                        cohort: studentForm.cohort || null,
                        status: studentForm.status,
                        hours_logged: 0,
                        created_at: new Date().toISOString()
                    })
                    .select()
                    .single();
                
                if (error) throw error;
                
                setStudents(prev => [...prev, { 
                    id: newStudent.id, 
                    ...studentForm, 
                    displayName, 
                    hoursLogged: 0 
                }]);
                if (logAction) await logAction('Add Student', `Added ${displayName}`);
            }
            setShowStudentModal(false);
        } catch (e) {
            console.error("Save student failed:", e);
            alert("Failed to save student.");
        }
    };

    const handleDeleteStudent = async (id, name) => {
        if (!confirm(`Remove ${name} from the roster? This does not delete their user account.`) || !supabase) return;
        try {
            await supabase
                .from('students')
                .delete()
                .eq('id', id)
                .eq('school_id', schoolId);
            
            setStudents(prev => prev.filter(s => s.id !== id));
            if (logAction) await logAction('Remove Student', `Removed ${name}`);
        } catch (e) {
            console.error("Delete failed:", e);
        }
    };

    const handleAssignStudio = async () => {
        if (!selectedStudent || !assignStudioId || !supabase) return;
        try {
            await supabase
                .from('students')
                .update({ internship_studio_id: assignStudioId })
                .eq('id', selectedStudent.id)
                .eq('school_id', schoolId);
            
            setStudents(prev => prev.map(s => s.id === selectedStudent.id ? { ...s, internshipStudioId: assignStudioId, internship_studio_id: assignStudioId } : s));
            setShowAssignModal(false);
            setAssignStudioId('');
            alert(`Assigned ${selectedStudent.displayName} to studio.`);
            if (logAction) await logAction('Assign Internship', `Assigned ${selectedStudent.displayName}`);
        } catch (e) {
            console.error("Assignment failed:", e);
        }
    };

    const filteredStudents = students.filter(s => 
        s.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.studentId?.includes(searchTerm)
    );

    if (loading) return <div className="p-10 text-center text-gray-500">Loading Roster...</div>;

    return (
        <div className="space-y-4 animate-in fade-in">
            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row gap-2 justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={16}/>
                    <input 
                        className="w-full pl-9 p-2 text-sm border rounded-lg dark:bg-black/20 dark:border-gray-600 dark:text-white"
                        placeholder="Search by Name or ID..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <button onClick={() => exportToCSV(students, 'student_roster')} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-bold text-xs">
                        Export CSV
                    </button>
                    <button onClick={handleOpenAdd} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-indigo-700">
                        <UserPlus size={16}/> Add Student
                    </button>
                </div>
            </div>

            {/* Data Table */}
            <div className="overflow-x-auto bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 font-bold uppercase text-xs">
                        <tr>
                            <th className="p-3">Name</th>
                            <th className="p-3">ID</th>
                            <th className="p-3">Cohort</th>
                            <th className="p-3">Internship</th>
                            <th className="p-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-gray-700">
                        {filteredStudents.length === 0 ? (
                            <tr><td colSpan="5" className="p-6 text-center text-gray-500">No students found.</td></tr>
                        ) : (
                            filteredStudents.map(s => (
                                <tr key={s.id} className="group hover:bg-gray-50 dark:hover:bg-white/5 transition">
                                    <td className="p-3 font-bold dark:text-white">{s.displayName}</td>
                                    <td className="p-3 text-gray-500">{s.studentId || '--'}</td>
                                    <td className="p-3">{s.cohort || 'General'}</td>
                                    <td className="p-3 text-gray-500">
                                        {s.internshipStudioId ? (
                                            <span className="flex items-center gap-1 text-green-600 font-medium text-xs bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded w-fit">
                                                <Briefcase size={12}/> Assigned
                                            </span>
                                        ) : (
                                            <span className="text-gray-400 italic text-xs">Pending</span>
                                        )}
                                    </td>
                                    <td className="p-3 text-right">
                                        <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => { setSelectedStudent(s); setShowAssignModal(true); }} 
                                                className="p-1.5 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300 rounded hover:bg-indigo-100" 
                                                title="Assign Internship"
                                            >
                                                <Link size={14}/>
                                            </button>
                                            <button 
                                                onClick={() => handleOpenEdit(s)} 
                                                className="p-1.5 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded hover:bg-gray-200" 
                                                title="Edit Details"
                                            >
                                                <Edit2 size={14}/>
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteStudent(s.id, s.displayName)} 
                                                className="p-1.5 bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded hover:bg-red-100" 
                                                title="Remove Student"
                                            >
                                                <Trash2 size={14}/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* --- MODALS --- */}

            {/* Add/Edit Student Modal */}
            {showStudentModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#2c2e36] w-full max-w-md rounded-xl p-6 space-y-4 animate-in zoom-in-95 shadow-2xl">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-xl dark:text-white">{isEditing ? 'Edit Student' : 'Add New Student'}</h3>
                            <button onClick={() => setShowStudentModal(false)}><X className="text-gray-400 hover:text-red-500"/></button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">First Name</label>
                                <input className="w-full p-2 border rounded dark:bg-black/20 dark:border-gray-600 dark:text-white" value={studentForm.firstName} onChange={e => setStudentForm({...studentForm, firstName: e.target.value})}/>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Last Name</label>
                                <input className="w-full p-2 border rounded dark:bg-black/20 dark:border-gray-600 dark:text-white" value={studentForm.lastName} onChange={e => setStudentForm({...studentForm, lastName: e.target.value})}/>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Email Address</label>
                            <input type="email" className="w-full p-2 border rounded dark:bg-black/20 dark:border-gray-600 dark:text-white" value={studentForm.email} onChange={e => setStudentForm({...studentForm, email: e.target.value})}/>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Student ID</label>
                                <input className="w-full p-2 border rounded dark:bg-black/20 dark:border-gray-600 dark:text-white" value={studentForm.studentId} onChange={e => setStudentForm({...studentForm, studentId: e.target.value})} placeholder="e.g. S123"/>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Cohort</label>
                                <input className="w-full p-2 border rounded dark:bg-black/20 dark:border-gray-600 dark:text-white" value={studentForm.cohort} onChange={e => setStudentForm({...studentForm, cohort: e.target.value})} placeholder="Fall 2024"/>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Enrollment Status</label>
                            <select className="w-full p-2 border rounded dark:bg-black/20 dark:border-gray-600 dark:text-white" value={studentForm.status} onChange={e => setStudentForm({...studentForm, status: e.target.value})}>
                                <option value="Enrolled">Enrolled</option>
                                <option value="Graduated">Graduated</option>
                                <option value="Dropped">Dropped</option>
                                <option value="Leave">On Leave</option>
                            </select>
                        </div>

                        <button onClick={handleSaveStudent} className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-bold hover:bg-indigo-700 mt-2">
                            {isEditing ? 'Update Student' : 'Create Student Record'}
                        </button>
                    </div>
                </div>
            )}

            {/* Assign Studio Modal */}
            {showAssignModal && selectedStudent && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#2c2e36] w-full max-w-sm rounded-xl p-6 space-y-4 animate-in zoom-in-95 shadow-2xl">
                        <h3 className="font-bold text-lg dark:text-white">Assign Internship</h3>
                        <p className="text-sm text-gray-500">Select a partner studio for <strong>{selectedStudent.displayName}</strong>.</p>
                        
                        <select className="w-full p-2 border rounded dark:bg-black/20 dark:border-gray-600 dark:text-white" value={assignStudioId} onChange={e => setAssignStudioId(e.target.value)}>
                            <option value="">Select Studio...</option>
                            {partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>

                        <div className="flex gap-2">
                            <button onClick={() => setShowAssignModal(false)} className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded font-bold text-sm">Cancel</button>
                            <button onClick={handleAssignStudio} disabled={!assignStudioId} className="flex-1 bg-indigo-600 text-white py-2 rounded font-bold disabled:opacity-50">Confirm</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
