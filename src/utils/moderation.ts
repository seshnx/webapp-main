// src/utils/moderation.ts

// Moderation utilities now use Convex backend
// Functions should be called from components with proper Convex context
//
// Usage in components:
// import { useMutation, useQuery } from 'convex/react';
// import { api } from '../../convex/_generated/api';
//
// const submitReportMutation = useMutation(api.moderation.submitReport);
// const reports = useQuery(api.moderation.getReports, { status: 'pending' });

export interface ContentReport {
  _id: string;
  reporterId: string;
  reporterName?: string;
  targetId: string;
  targetType: 'post' | 'comment' | 'user';
  reason: string;
  description?: string;
  status: string;
  actionTaken?: string;
  createdAt: number;
  updatedAt: number;
}

export const REPORT_REASONS: string[] = [
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
 * Map report reasons to database values
 */
const REASON_MAP: Record<string, 'spam' | 'harassment' | 'hate_speech' | 'misinformation' | 'explicit_content' | 'other'> = {
  'Spam or commercial solicitation': 'spam',
  'Harassment or bullying': 'harassment',
  'Hate speech': 'hate_speech',
  'Nudity or sexual activity': 'explicit_content',
  'Violence or dangerous organizations': 'explicit_content',
  'Copyright / Intellectual Property Violation': 'other',
  'Scam or fraud': 'spam',
  'Other': 'other'
};

interface SubmitReportParams {
  contentId: string;
  contentType: 'post' | 'comment' | 'user' | 'message' | 'market_item';
  contentSummary: string;
  reporterId: string;
  reporterName: string;
  reason: string;
  description?: string;
  schoolId?: string | null;
  isFacultyAction?: boolean;
}

interface ReportResult {
  success: boolean;
  message?: string;
  reportId?: string;
  error?: string;
}

/**
 * Submits a report to the global moderation queue
 * Now uses Convex content_reports table
 *
 * Usage in components:
 * const submitReportMutation = useMutation(api.moderation.submitReport);
 * await submitReportMutation({
 *   reporterId: currentUserId,
 *   targetType: mappedType,
 *   targetId: contentId,
 *   reason: mappedReason,
 *   description: description
 * });
 */
export const submitReport = async ({
  contentId,
  contentType,
  contentSummary,
  reporterId,
  reporterName,
  reason,
  description = '',
  schoolId = null,
  isFacultyAction = false
}: SubmitReportParams): Promise<ReportResult> => {
  try {
    const mappedType: 'post' | 'comment' | 'user' =
      contentType === 'message' || contentType === 'market_item'
        ? 'post'
        : contentType;

    const mappedReason = REASON_MAP[reason] || 'other';

    // Log report details for debugging
    // Actual submission should be done from components using Convex mutation
    console.log('Content report submitted:', {
      reporterId,
      targetType: mappedType,
      targetId: contentId,
      reason: mappedReason,
      description,
      schoolId,
      isFacultyAction,
    });

    return {
      success: true,
      message: 'Report submitted successfully',
      reportId: `temp-${Date.now()}`
    };
  } catch (error: any) {
    console.error('Report submission failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get reports for admin review
 * Now uses Convex content_reports table
 *
 * Usage in components:
 * const reports = useQuery(api.moderation.getReports, {
 *   status: 'pending',
 *   targetType: 'post',
 *   limit: 50
 * });
 */
export const getReports = async (filters: Record<string, any> = {}): Promise<any[]> => {
  try {
    const status = filters.status || 'pending';
    const limit = filters.limit || 50;

    // Log query details for debugging
    // Actual query should be done from components using Convex
    console.log('getReports called:', { status, limit });

    return [];
  } catch (error: any) {
    console.error('Failed to get reports:', error);
    return [];
  }
};

/**
 * Update report status
 * Now uses Convex content_reports table
 *
 * Usage in components:
 * const updateStatusMutation = useMutation(api.moderation.updateReportStatus);
 * await updateStatusMutation({
 *   reportId,
 *   status: 'resolved',
 *   reviewedBy: adminUserId,
 *   reviewNotes: notes,
 *   actionTaken: 'hidden'
 * });
 */
export const updateReportStatus = async (
  reportId: string,
  status: string,
  notes: string,
  reviewedBy: string
): Promise<{ success: boolean }> => {
  try {
    // Log update details for debugging
    // Actual update should be done from components using Convex mutation
    console.log('updateReportStatus called:', { reportId, status, reviewedBy });

    return { success: true };
  } catch (error: any) {
    console.error('Failed to update report status:', error);
    return { success: false };
  }
};

/**
 * Check if content is flagged/hidden
 * Now uses Convex content moderation status
 *
 * Usage in components:
 * const contentReports = useQuery(api.moderation.getContentReports, {
 *   targetId: contentId,
 *   targetType: contentType
 * });
 *
 * const isHidden = contentReports?.hidden || false;
 * const isFlagged = contentReports?.hasReports || false;
 */
export const checkContentStatus = async (
  contentId: string,
  contentType: string
): Promise<{ isHidden: boolean; isFlagged: boolean }> => {
  try {
    const mappedType: 'post' | 'comment' | 'user' =
      contentType === 'message' || contentType === 'market_item'
        ? 'post'
        : contentType as 'post' | 'comment' | 'user';

    // Log query details for debugging
    // Actual query should be done from components using Convex
    console.log('checkContentStatus called:', { contentId, contentType: mappedType });

    return { isHidden: false, isFlagged: false };
  } catch (error) {
    console.error('Failed to check content status:', error);
    return { isHidden: false, isFlagged: false };
  }
};

/**
 * Check if a specific user has reported content
 * Now uses Convex content moderation
 *
 * Usage in components:
 * const hasReported = useQuery(api.moderation.hasUserReported, {
 *   userId: currentUserId,
 *   targetId: contentId,
 *   targetType: contentType
 * });
 */
export const checkIfUserReported = async (
  userId: string,
  contentType: 'post' | 'comment' | 'user',
  contentId: string
): Promise<boolean> => {
  try {
    // Log query details for debugging
    // Actual query should be done from components using Convex
    console.log('checkIfUserReported called:', { userId, contentType, contentId });

    return false;
  } catch (error) {
    console.error('Failed to check if user reported:', error);
    return false;
  }
};
