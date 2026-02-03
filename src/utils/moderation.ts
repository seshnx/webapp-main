// src/utils/moderation.ts

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
 * TODO: Migrate to Neon moderation_reports table
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
    // TODO: Implement Neon query for moderation_reports table
    console.warn('Moderation report submission not yet implemented with Neon');
    console.table({
      contentId,
      contentType,
      reporterId,
      reason,
      schoolId,
      isFacultyAction
    });

    return {
      success: true,
      message: 'Report logged (not yet persisted to database)',
      reportId: `temp-${Date.now()}`
    };
  } catch (error: any) {
    console.error('Report submission failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get reports for admin review
 * TODO: Implement with Neon
 */
export const getReports = async (filters: Record<string, any> = {}): Promise<any[]> => {
  console.warn('getReports not yet implemented with Neon');
  return [];
};

/**
 * Update report status
 * TODO: Implement with Neon
 */
export const updateReportStatus = async (
  reportId: string,
  status: string,
  notes: string
): Promise<{ success: boolean }> => {
  console.warn('updateReportStatus not yet implemented with Neon');
  return { success: false };
};

/**
 * Check if content is flagged/hidden
 * TODO: Implement with Neon
 */
export const checkContentStatus = async (
  contentId: string,
  contentType: string
): Promise<{ isHidden: boolean; isFlagged: boolean }> => {
  // TODO: Implement Neon query
  return { isHidden: false, isFlagged: false };
};
