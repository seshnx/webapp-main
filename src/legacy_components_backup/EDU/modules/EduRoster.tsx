import React, { useState } from 'react';
import { Search, UserPlus, Briefcase, Link, Edit2, Trash2, X } from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@convex/api';
import { Id } from '@convex/dataModel';
import { exportToCSV } from '../../../utils/dataExport';

/**
 * Student interface (from Convex)
 */
interface Student {
    _id: Id<"students">;
    userId: Id<"users">;
    schoolId: Id<"schools">;
    studentId: string;
    major?: string;
    year?: number;
    gpa?: number;
    expectedGraduation?: number;
    isActive: boolean;
    enrolledAt: number;
}

/**
 * Partner interface (from Convex)
 */
interface Partner {
    _id: Id<"partners">;
    schoolId: Id<"schools">;
    name: string;
    address?: string;
    website?: string;
    contactEmail?: string;
    status: string;
    createdAt: number;
    updatedAt: number;
}

/**
 * Student form interface
 */
interface StudentForm {
    userId: string;
    studentId: string;
    major: string;
    year: string;
    gpa: string;
}

/**
 * EduRoster props
 */
export interface EduRosterProps {
    schoolId?: Id<"schools">;
    logAction?: (action: string, details: string) => Promise<void> | void;
}

export default function EduRoster({ schoolId, logAction }: EduRosterProps) {
    // Fetch data from Convex
    const students = useQuery(
        schoolId ? api.edu.getStudentsBySchool : undefined,
        schoolId ? { schoolId } : "skip"
    );
    const partners = useQuery(
        schoolId ? api.partners.getPartnersBySchool : undefined,
        schoolId ? { schoolId, status: "Active" } : "skip"
    );

    const deleteStudent = useMutation(api.edu.deleteStudent);

    const [searchTerm, setSearchTerm] = useState<string>('');

    // Modal States
    const [showAssignModal, setShowAssignModal] = useState<boolean>(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [assignPartnerId, setAssignPartnerId] = useState<string>('');

    const loading = students === undefined || partners === undefined;

    // --- HANDLERS ---

    const handleDelete = async (id: Id<"students">, name: string) => {
        if (!confirm(`Remove ${name} from the roster? This does not delete their user account.`)) return;
        try {
            await deleteStudent({ studentId: id });
            if (logAction) await logAction('Remove Student', `Removed student ID: ${name}`);
        } catch (e) {
            console.error("Delete failed:", e);
        }
    };

    const handleAssignPartner = async () => {
        // Placeholder for partner assignment functionality
        // This would require additional fields in the students schema
        if (!selectedStudent || !assignPartnerId) return;

        alert("Partner assignment functionality requires additional schema fields (internship tracking).");
        setShowAssignModal(false);
        setAssignPartnerId('');
        if (logAction) await logAction('Assign Internship', `Attempted to assign student to partner`);
    };

    const filteredStudents = (students || []).filter(s =>
        s.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.major?.toLowerCase().includes(searchTerm.toLowerCase())
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
                        placeholder="Search by Student ID or Major..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <button onClick={() => students && exportToCSV(students, 'student_roster')} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-bold text-xs">
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Data Table */}
            <div className="overflow-x-auto bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 font-bold uppercase text-xs">
                        <tr>
                            <th className="p-3">Student ID</th>
                            <th className="p-3">Major</th>
                            <th className="p-3">Year</th>
                            <th className="p-3">GPA</th>
                            <th className="p-3">Status</th>
                            <th className="p-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-gray-700">
                        {filteredStudents.length === 0 ? (
                            <tr><td colSpan={6} className="p-6 text-center text-gray-500">No students found.</td></tr>
                        ) : (
                            filteredStudents.map(s => (
                                <tr key={s._id} className="group hover:bg-gray-50 dark:hover:bg-white/5 transition">
                                    <td className="p-3 font-bold dark:text-white">{s.studentId}</td>
                                    <td className="p-3">{s.major || 'Undeclared'}</td>
                                    <td className="p-3">{s.year ? `Year ${s.year}` : '--'}</td>
                                    <td className="p-3">{s.gpa ? s.gpa.toFixed(2) : '--'}</td>
                                    <td className="p-3">
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                                            s.isActive
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                        }`}>
                                            {s.isActive ? 'Active' : 'Inactive'}
                                        </span>
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
                                                onClick={() => handleDelete(s._id, s.studentId)}
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

            {/* Assign Partner Modal */}
            {showAssignModal && selectedStudent && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#2c2e36] w-full max-w-sm rounded-xl p-6 space-y-4 animate-in zoom-in-95 shadow-2xl">
                        <h3 className="font-bold text-lg dark:text-white">Assign Internship</h3>
                        <p className="text-sm text-gray-500">Select a partner studio for student <strong>{selectedStudent.studentId}</strong>.</p>

                        <select
                            className="w-full p-2 border rounded dark:bg-black/20 dark:border-gray-600 dark:text-white"
                            value={assignPartnerId}
                            onChange={e => setAssignPartnerId(e.target.value)}
                        >
                            <option value="">Select Studio...</option>
                            {(partners || []).map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                        </select>

                        <div className="flex gap-2">
                            <button onClick={() => setShowAssignModal(false)} className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded font-bold text-sm">Cancel</button>
                            <button onClick={handleAssignPartner} disabled={!assignPartnerId} className="flex-1 bg-indigo-600 text-white py-2 rounded font-bold disabled:opacity-50">Confirm</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
