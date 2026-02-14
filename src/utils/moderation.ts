// src/utils/moderation.ts

import {
  reportContent,
  getPendingReports,
  updateReportStatus as updateReportStatusQuery,
  hasUserReported,
  type ContentReport
} from '../config/neonQueries';

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
    // Map the content type (handle message and market_item as post for now)
    const mappedType: 'post' | 'comment' | 'user' =
      contentType === 'message' || contentType === 'market_item'
        ? 'post'
        : contentType;

    // Map the reason to database value
    const mappedReason = REASON_MAP[reason] || 'other';

    // Submit report to Neon
    const report = await reportContent({
      reporterId,
      targetType: mappedType,
      targetId: contentId,
      reason: mappedReason,
      description: description || `Summary: ${contentSummary}`
    });

    return {
      success: true,
      message: 'Report submitted successfully',
      reportId: report.id
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

    if (status === 'pending') {
      return await getPendingReports(limit);
    }

    // For other statuses, you would need to add more query functions
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
    await updateReportStatusQuery(
      reportId,
      status as 'reviewed' | 'resolved' | 'dismissed',
      reviewedBy,
      notes
    );
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
    // Check if there are pending reports
    const mappedType: 'post' | 'comment' | 'user' =
      contentType === 'message' || contentType === 'market_item'
        ? 'post'
        : contentType as 'post' | 'comment' | 'user';

    const reports = await hasUserReported('any', mappedType, contentId);

    return {
      isHidden: false,
      isFlagged: reports
    };
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
    return await hasUserReported(userId, contentType, contentId);
  } catch (error) {
    console.error('Failed to check if user reported:', error);
    return false;
  }
};
