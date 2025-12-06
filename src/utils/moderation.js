import { doc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, appId } from '../config/firebase';

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
    try {
        // 1. Create the Ticket in the Global Queue
        await addDoc(collection(db, `artifacts/${appId}/moderation_queue`), {
            type: 'Report',
            status: 'Open', // Admin App filters by 'Open'
            priority: isFacultyAction ? 'High' : 'Normal',
            
            // Target Data
            targetId: contentId,
            targetType: contentType,
            targetSummary: contentSummary || 'No preview available',
            
            // Reporter Data
            reporterId,
            reporterName,
            
            // Context
            reason,
            description,
            schoolId, // Helps Admins filter by school if needed
            
            timestamp: serverTimestamp()
        });

        // 2. Immediate Action (Faculty Only)
        // If a teacher flags a post, we hide it immediately on the client side
        // to preserve campus safety while the global admin reviews it.
        if (isFacultyAction && (contentType === 'post' || contentType === 'comment')) {
            const collectionPath = contentType === 'post' 
                ? `artifacts/${appId}/public/data/posts` 
                : `artifacts/${appId}/public/data/comments`;

            await updateDoc(doc(db, collectionPath, contentId), {
                visibility: 'Hidden',
                moderationStatus: 'Flagged',
                flaggedBy: reporterId,
                flaggedAt: serverTimestamp()
            });
        }

        return { success: true };
    } catch (error) {
        console.error("Reporting failed:", error);
        return { success: false, error };
    }
};
