// src/utils/moderation.ts

// TODO: Replace with Convex mutations and queries
// import { useMutation, useQuery } from 'convex/react';
// import { api } from '../../convex/_generated/api';

// Stub type for compatibility
type ContentReport = {
  id: string;
  reporterId: string;
  targetType: 'post' | 'comment' | 'user';
  targetId: string;
  reason: string;
  description?: string;
};

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
 * Now uses Neon content_reports table
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

    // TODO: Replace with Convex mutation
    // await reportContentMutation({ reporterId, targetType: mappedType, targetId: contentId, reason: mappedReason, description })
    console.log('Content report submitted (TODO: implement via Convex):', {
      reporterId, targetType: mappedType, targetId: contentId, reason: mappedReason
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
 * Now uses Neon content_reports table
 */
export const getReports = async (filters: Record<string, any> = {}): Promise<any[]> => {
  try {
    const status = filters.status || 'pending';
    const limit = filters.limit || 50;

    // TODO: Replace with Convex query
    // return await convexQuery(api.moderation.getReports, { status, limit });
    console.log('getReports called (TODO: implement via Convex)', { status, limit });
    return [];
  } catch (error: any) {
    console.error('Failed to get reports:', error);
    return [];
  }
};

/**
 * Update report status
 * Now uses Neon content_reports table
 */
export const updateReportStatus = async (
  reportId: string,
  status: string,
  notes: string,
  reviewedBy: string
): Promise<{ success: boolean }> => {
  try {
    // TODO: Replace with Convex mutation
    // await updateReportStatusMutation({ reportId, status, reviewedBy, notes })
    console.log('updateReportStatus called (TODO: implement via Convex)', { reportId, status });
    return { success: true };
  } catch (error: any) {
    console.error('Failed to update report status:', error);
    return { success: false };
  }
};

/**
 * Check if content is flagged/hidden
 * TODO: Implement with Neon - needs content moderation status tracking
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

    // TODO: Replace with Convex query
    // return await convexQuery(api.moderation.hasReports, { contentId: contentId })
    return { isHidden: false, isFlagged: false };
  } catch (error) {
    console.error('Failed to check content status:', error);
    return { isHidden: false, isFlagged: false };
  }
};

/**
 * Check if a specific user has reported content
 */
export const checkIfUserReported = async (
  userId: string,
  contentType: 'post' | 'comment' | 'user',
  contentId: string
): Promise<boolean> => {
  try {
    // TODO: Replace with Convex query
    // return await convexQuery(api.moderation.hasUserReported, { userId, contentType, contentId })
    return false;
  } catch (error) {
    console.error('Failed to check if user reported:', error);
    return false;
  }
};
