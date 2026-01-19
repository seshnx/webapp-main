import React, { useState } from 'react';
import { Users, Upload, Archive, AlertTriangle, FileText } from 'lucide-react';
export default function EduCohorts({ schoolId, logAction }) {
    const [csvInput, setCsvInput] = useState('');
    const [processing, setProcessing] = useState(false);

    const handleBatchImport = async () => {
        if (!csvInput.trim() || !supabase || !schoolId) {
            if (!csvInput.trim()) alert("Please paste CSV data first.");
            return;
        }
        
        setProcessing(true);
        const lines = csvInput.trim().split('\n');
        let count = 0;
        let errors = 0;

        try {
            const studentsToInsert = [];
            
            for (let line of lines) {
                // Expected format: email, firstName, lastName, cohort
                const parts = line.split(',');
                if (parts.length >= 3) {
                    const email = parts[0].trim();
                    const firstName = parts[1].trim();
                    const lastName = parts[2].trim();
                    const cohort = parts[3]?.trim() || 'General';
                    const displayName = `${firstName} ${lastName}`;

                    if (email && firstName) {
                        studentsToInsert.push({
                            school_id: schoolId,
                            email,
                            display_name: displayName,
                            first_name: firstName,
                            last_name: lastName,
                            cohort,
                            student_id: null, // Can be updated later
                            status: 'Enrolled',
                            hours_logged: 0,
                            created_at: new Date().toISOString()
                        });
                        count++;
                    } else {
                        errors++;
                    }
                } else {
                    errors++;
                }
            }
            
            if (studentsToInsert.length > 0) {
                const { error } = await supabase
                    .from('students')
                    .insert(studentsToInsert);
                
                if (error) throw error;
            }
            
            if (logAction) await logAction('Batch Import', `Imported ${count} students. (${errors} skipped)`);
            alert(`Import complete! Added ${count} students.`);
            setCsvInput('');
        } catch (e) {
            console.error("Import failed:", e);
            alert("Batch import encountered an error.");
        }
        setProcessing(false);
    };

    const handleRollover = async () => {
        // Safety check for destructive action
        const confirmation = prompt("Type 'ROLLOVER' to confirm. This will archive current internship logs for all students.");
        if (confirmation !== 'ROLLOVER') return;

        // In a real app, this would trigger a Cloud Function to move data to 'archived_logs' collection
        alert("Rollover process initiated. (This is a placeholder for the Cloud Function trigger).");
        await logAction('Term Rollover', 'Initiated term archival');
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            
            {/* Batch Import Section */}
            <div className="bg-white dark:bg-[#2c2e36] p-6 rounded-xl border dark:border-gray-700 shadow-sm">
                <h3 className="font-bold dark:text-white mb-4 flex items-center gap-2">
                    <Upload size={18} className="text-indigo-600"/> Batch Import Students
                </h3>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-4 border border-blue-100 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-300">
                    <strong>Format:</strong> <code>email, first_name, last_name, cohort</code><br/>
                    Example: <code>student@test.edu, John, Doe, Fall 2024</code>
                </div>

                <textarea 
                    className="w-full h-40 p-3 text-sm border rounded-lg dark:bg-black/20 dark:border-gray-600 dark:text-white font-mono resize-y focus:ring-2 focus:ring-indigo-500 outline-none" 
                    placeholder="Paste CSV data here..."
                    value={csvInput}
                    onChange={e => setCsvInput(e.target.value)}
                    disabled={processing}
                />
                
                <div className="mt-3 flex justify-end">
                    <button 
                        onClick={handleBatchImport} 
                        disabled={processing || !csvInput}
                        className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 transition"
                    >
                        {processing ? 'Processing...' : <><FileText size={16}/> Import Students</>}
                    </button>
                </div>
            </div>

            {/* Term Management Section */}
            <div className="bg-white dark:bg-[#2c2e36] p-6 rounded-xl border dark:border-gray-700 shadow-sm">
                <h3 className="font-bold dark:text-white mb-4 flex items-center gap-2">
                    <Archive size={18} className="text-orange-500"/> Term Management
                </h3>
                
                <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="flex-1">
                        <h4 className="font-bold text-sm dark:text-gray-200 mb-1">End of Term Rollover</h4>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            Use this tool at the end of a semester or cohort period. It will:
                        </p>
                        <ul className="list-disc list-inside text-xs text-gray-500 mt-2 space-y-1 ml-1">
                            <li>Archive all active internship logs.</li>
                            <li>Reset "Current Hours" counters (preserving Total Lifetime Hours).</li>
                            <li>Mark graduating students as "Alumni" (optional).</li>
                        </ul>
                    </div>
                    
                    <div className="w-full md:w-auto">
                        <button 
                            onClick={handleRollover} 
                            className="w-full md:w-auto bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 border border-red-200 dark:border-red-800 transition"
                        >
                            <AlertTriangle size={16}/> Execute Rollover
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
