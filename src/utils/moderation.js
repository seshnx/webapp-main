import { supabase } from '../config/supabase';

export const REPORT_REASONS = [
    "Spam or commercial solicitation",
    "Harassment or bullying",
    "Hate speech",
    "Nudity or sexual activity",
    "Violence or dangerous organizations",
    "Copyright / Intellectual Property Violation",
    "Scam or fraud",
    "Other"
];

/**
 * Submits a report to the global moderation queue.
 * If the reporter is School Faculty/Admin reporting content from their own school,
 * it can optionally trigger an immediate 'Hidden' state locally.
 */
export const submitReport = async ({
    contentId,
    contentType, // 'post', 'comment', 'user', 'message', 'market_item'
    contentSummary, // Short text preview or ID for context
    reporterId,
    reporterName,
    reason,
    description = '',
    schoolId = null, // If reporting within a school context
    isFacultyAction = false // Logic to hide immediately
}) => {
    if (!supabase) {
        return { success: false, error: 'Supabase not initialized' };
    }

    try {
        // 1. Create the Ticket in the Global Queue
        // Using moderation_reports table (create if doesn't exist via schema)
        const { error: reportError } = await supabase
            .from('moderation_reports')
            .insert({
                type: 'Report',
                status: 'Open', // Admin App filters by 'Open'
                priority: isFacultyAction ? 'High' : 'Normal',
                
                // Target Data
                target_id: contentId,
                target_type: contentType,
                target_summary: contentSummary || 'No preview available',
                
                // Reporter Data
                reporter_id: reporterId,
                reporter_name: reporterName,
                
                // Context
                reason,
                description,
                school_id: schoolId, // Helps Admins filter by school if needed
                
                created_at: new Date().toISOString()
            });

        if (reportError) {
            // If table doesn't exist, fall back to documents table
            if (reportError.code === '42P01') {
                const { error: docError } = await supabase
                    .from('documents')
                    .insert({
                        collection_path: 'moderation_queue',
                        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        data: {
                            type: 'Report',
                            status: 'Open',
                            priority: isFacultyAction ? 'High' : 'Normal',
                            targetId: contentId,
                            targetType: contentType,
                            targetSummary: contentSummary || 'No preview available',
                            reporterId,
                            reporterName,
                            reason,
                            description,
                            schoolId,
                            timestamp: Date.now()
                        },
                        public_read: false
                    });
                
                if (docError) throw docError;
            } else {
                throw reportError;
            }
        }

        // 2. Immediate Action (Faculty Only)
        // If a teacher flags a post, we hide it immediately on the client side
        // to preserve campus safety while the global admin reviews it.
        if (isFacultyAction && (contentType === 'post' || contentType === 'comment')) {
            const tableName = contentType === 'post' ? 'posts' : 'comments';
            
            // Try to update in proper table, fall back to documents if needed
            const { error: updateError } = await supabase
                .from(tableName)
                .update({
                    visibility: 'Hidden',
                    moderation_status: 'Flagged',
                    flagged_by: reporterId,
                    flagged_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', contentId);

            // If table doesn't exist, use documents table
            if (updateError && updateError.code === '42P01') {
                const collectionPath = `artifacts/${import.meta.env.VITE_APP_ID || 'seshnx-70c04'}/public/data/${contentType === 'post' ? 'posts' : 'comments'}`;
                const { error: docUpdateError } = await supabase
                    .from('documents')
                    .update({
                        data: {
                            visibility: 'Hidden',
                            moderationStatus: 'Flagged',
                            flaggedBy: reporterId,
                            flaggedAt: Date.now()
                        },
                        updated_at: new Date().toISOString()
                    })
                    .eq('collection_path', collectionPath)
                    .eq('id', contentId);
                
                if (docUpdateError) throw docUpdateError;
            } else if (updateError) {
                throw updateError;
            }
        }

        return { success: true };
    } catch (error) {
        console.error("Reporting failed:", error);
        return { success: false, error };
    }
};
