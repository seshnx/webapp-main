import React, { useState } from 'react';
import { X, Flag, AlertTriangle, Loader2 } from 'lucide-react';
import { REPORT_REASONS, submitReport } from '../utils/moderation'; // Import constants and submission helper

/**
 * Modal component for users to submit a moderation report against content or another user.
 * * @param {Object} props
 * @param {Object} props.user - Current authenticated user object ({ uid, displayName })
 * @param {Object} props.target - Object defining the target: { id: string, type: string, summary: string }
 * @param {function} props.onClose - Function to close the modal
 */
export default function ReportModal({ user, target, onClose }) {
    const [reason, setReason] = useState(REPORT_REASONS[0]);
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async () => {
        if (!reason || !user?.uid) return;

        setSubmitting(true);
        try {
            const result = await submitReport({
                contentId: target.id,
                contentType: target.type,
                contentSummary: target.summary,
                reporterId: user.uid,
                reporterName: user.displayName || 'Anonymous User',
                reason: reason,
                description: description
                // Note: schoolId and isFacultyAction are omitted for a general user report flow
            });

            if (result.success) {
                setSubmitted(true);
                setTimeout(onClose, 2000); 
            } else {
                alert("Failed to submit report. Please try again.");
            }
        } catch (e) {
            console.error("Submission error:", e);
            alert("An unexpected error occurred during submission.");
        }
        setSubmitting(false);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
            <div className="bg-white dark:bg-[#2c2e36] rounded-2xl shadow-2xl w-full max-w-lg animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold text-xl dark:text-white flex items-center gap-2 text-red-500">
                            <AlertTriangle size={24} /> Report Violation
                        </h3>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"><X size={20} /></button>
                    </div>

                    <div className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                        You are reporting a violation regarding: <strong className="font-bold">{target.summary}</strong> ({target.type})
                    </div>

                    {submitted ? (
                        <div className="text-center py-12">
                            <Flag size={48} className="text-green-500 mx-auto mb-4"/>
                            <h4 className="font-bold text-lg dark:text-white">Report Submitted!</h4>
                            <p className="text-sm text-gray-500">Thank you for helping keep the community safe. We will review this shortly.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Reason for Report</label>
                                <select
                                    className="w-full p-3 border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white text-sm"
                                    value={reason}
                                    onChange={e => setReason(e.target.value)}
                                >
                                    {REPORT_REASONS.map(r => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Additional Details (Optional)</label>
                                <textarea
                                    className="w-full p-3 border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white text-sm resize-none"
                                    rows="3"
                                    placeholder="Provide any further context or relevant details."
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                />
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-md"
                            >
                                {submitting ? <Loader2 className="animate-spin" size={18}/> : <><Flag size={18}/> Submit Report</>}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
