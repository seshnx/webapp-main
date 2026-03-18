/**
 * Convex hooks for social features
 * Replaces the old socialApi with Convex queries and mutations
 */

import { useQuery, useMutation } from 'convex/react';
import { api } from 'convex/_generated/api';
import type { Id } from 'convex/_generated/dataModel';

// =====================================================
// POSTS
// =====================================================

/**
 * Get feed posts
 */
export function useFeed(limit = 20) {
  return useQuery(api.social.getFeed, { limit });
}

/**
 * Get home feed (personalized)
 */
export function useHomeFeed(userId: string, limit = 20) {
  return useQuery(api.social.getHomeFeed, { userId, limit });
}

/**
 * Get posts by author
 */
export function usePostsByAuthor(authorId: string, limit = 20) {
  return useQuery(api.social.getPostsByAuthor, {
    authorId,
    limit,
  });
}

/**
 * Get single post
 */
export function usePost(postId: string) {
  return useQuery(api.social.getPostById, { postId });
}

/**
 * Get trending posts
 */
export function useTrendingPosts(limit = 10) {
  return useQuery(api.social.getTrendingPosts, { limit });
}

/**
 * Create a new post
 */
export function useCreatePost() {
  return useMutation(api.social.createPost);
}

/**
 * Update a post
 */
export function useUpdatePost() {
  return useMutation(api.social.updatePost);
}

/**
 * Delete a post
 */
export function useDeletePost() {
  return useMutation(api.social.deletePost);
}

/**
 * Repost a post
 */
export function useRepostPost() {
  return useMutation(api.social.repostPost);
}

/**
 * Unrepost a post
 */
export function useUnrepostPost() {
  return useMutation(api.social.unrepostPost);
}

// =====================================================
// COMMENTS
// =====================================================

/**
 * Get comments for a post
 */
export function useComments(postId: string, limit = 20) {
  return useQuery(api.social.getCommentsByPost, {
    postId,
    limit,
  });
}

/**
 * Get comment replies
 */
export function useCommentReplies(commentId: string, limit = 20) {
  return useQuery(api.social.getCommentReplies, {
    commentId,
    limit,
  });
}

/**
 * Get comments by author
 */
export function useCommentsByAuthor(authorId: string, limit = 20) {
  return useQuery(api.social.getCommentsByAuthor, {
    authorId,
    limit,
  });
}

/**
 * Create a comment
 */
export function useCreateComment() {
  return useMutation(api.social.createComment);
}

/**
 * Update a comment
 */
export function useUpdateComment() {
  return useMutation(api.social.updateComment);
}

/**
 * Delete a comment
 */
export function useDeleteComment() {
  return useMutation(api.social.deleteComment);
}

// =====================================================
// REACTIONS
// =====================================================

/**
 * Get reactions for a target
 */
export function useReactions(targetId: string, targetType: 'post' | 'comment' = 'post') {
  return useQuery(api.social.getReactions, {
    targetId,
    targetType,
  });
}

/**
 * Get reaction summary grouped by emoji
 */
export function useReactionSummary(targetId: string, targetType: 'post' | 'comment' = 'post') {
  return useQuery(api.social.getReactionSummary, {
    targetId,
    targetType,
  });
}

/**
 * Get user's reaction on a target
 */
export function useUserReaction(targetId: string, userId: string, targetType: 'post' | 'comment' = 'post') {
  return useQuery(api.social.getUserReaction, {
    targetId,
    userId,
    targetType,
  });
}

/**
 * Toggle reaction (add/remove)
 */
export function useToggleReaction() {
  return useMutation(api.social.toggleReaction);
}

// =====================================================
// SAVED POSTS
// =====================================================

/**
 * Check if post is saved by user
 */
export function useIsPostSaved(userId: string, postId: string) {
  return useQuery(api.social.isPostSaved, {
    userId,
    postId,
  });
}

/**
 * Get user's saved posts
 */
export function useSavedPosts(userId: string, limit = 50) {
  return useQuery(api.social.getSavedPosts, {
    userId,
    limit,
  });
}

/**
 * Save a post
 */
export function useSavePost() {
  return useMutation(api.social.savePost);
}

/**
 * Unsave a post
 */
export function useUnsavePost() {
  return useMutation(api.social.unsavePost);
}

// =====================================================
// USERS (from users.ts)
// =====================================================

/**
 * Get user by Clerk ID
 */
export function useUserByClerkId(clerkId: string) {
  return useQuery(api.users.getUserByClerkId, { clerkId });
}

/**
 * Get user by username
 */
export function useUserByUsername(username: string) {
  return useQuery(api.users.getUserByUsername, { username });
}

/**
 * Get current user
 */
export function useCurrentUser(clerkId: string) {
  return useQuery(api.users.getCurrentUser, { clerkId });
}

/**
 * Search users
 */
export function useSearchUsers(searchQuery: string, limit = 20) {
  return useQuery(api.users.searchUsers, {
    searchQuery,
    limit,
  });
}

/**
 * Update user profile
 */
export function useUpdateProfile() {
  return useMutation(api.users.updateProfile);
}

// =====================================================
// FOLLOWS
// =====================================================

/**
 * Get followers for a user
 */
export function useFollowers(userId: string) {
  return useQuery(api.users.getFollowers, { userId });
}

/**
 * Get who a user is following
 */
export function useFollowing(userId: string) {
  return useQuery(api.users.getFollowing, { userId });
}

/**
 * Check if following
 */
export function useIsFollowing(followerId: string, followingId: string) {
  return useQuery(api.users.isFollowing, {
    followerId,
    followingId,
  });
}

/**
 * Follow a user
 */
export function useFollowUser() {
  return useMutation(api.users.followUser);
}

/**
 * Unfollow a user
 */
export function useUnfollowUser() {
  return useMutation(api.users.unfollowUser);
}

// =====================================================
// BOOKINGS
// =====================================================

/**
 * Get studios by owner
 */
export function useStudiosByOwner(ownerId: string) {
  return useQuery(api.bookings.getStudiosByOwner, { ownerId });
}

/**
 * Get studio by ID
 */
export function useStudio(studioId: Id<'studios'>) {
  return useQuery(api.bookings.getStudioById, { studioId });
}

/**
 * Get rooms by studio
 */
export function useRoomsByStudio(studioId: Id<'studios'>) {
  return useQuery(api.bookings.getRoomsByStudio, { studioId });
}

/**
 * Get available rooms
 */
export function useAvailableRooms(
  studioId: Id<'studios'>,
  date: string,
  startTime: string,
  endTime: string,
  minCapacity?: number
) {
  return useQuery(api.bookings.getAvailableRooms, {
    studioId,
    date,
    startTime,
    endTime,
    minCapacity,
  });
}

/**
 * Get bookings by studio
 */
export function useBookingsByStudio(studioId: Id<'studios'>, status?: string) {
  return useQuery(api.bookings.getBookingsByStudio, {
    studioId,
    status,
  });
}

/**
 * Get bookings by client
 */
export function useBookingsByClient(clientId: string, status?: string) {
  return useQuery(api.bookings.getBookingsByClient, {
    clientId,
    status,
  });
}

/**
 * Get upcoming bookings for a client
 */
export function useUpcomingBookings(clientId: string, limit = 10) {
  return useQuery(api.bookings.getUpcomingBookings, {
    clientId,
    limit,
  });
}

/**
 * Create a booking
 */
export function useCreateBooking() {
  return useMutation(api.bookings.createBooking);
}

/**
 * Update a booking
 */
export function useUpdateBooking() {
  return useMutation(api.bookings.updateBooking);
}

/**
 * Confirm a booking
 */
export function useConfirmBooking() {
  return useMutation(api.bookings.confirmBooking);
}

/**
 * Start a booking
 */
export function useStartBooking() {
  return useMutation(api.bookings.startBooking);
}

/**
 * Complete a booking
 */
export function useCompleteBooking() {
  return useMutation(api.bookings.completeBooking);
}

/**
 * Cancel a booking
 */
export function useCancelBooking() {
  return useMutation(api.bookings.cancelBooking);
}

/**
 * Get payments by booking
 */
export function usePaymentsByBooking(bookingId: Id<'bookings'>) {
  return useQuery(api.bookings.getPaymentsByBooking, {
    bookingId,
  });
}

/**
 * Create a payment
 */
export function useCreatePayment() {
  return useMutation(api.bookings.createPayment);
}

/**
 * Update payment status
 */
export function useUpdatePaymentStatus() {
  return useMutation(api.bookings.updatePaymentStatus);
}

/**
 * Get blocked dates for a studio
 */
export function useBlockedDates(studioId: string) {
  return useQuery(api.bookings.getBlockedDates, { studioId });
}

/**
 * Add blocked date
 */
export function useAddBlockedDate() {
  return useMutation(api.bookings.addBlockedDate);
}

/**
 * Remove blocked date
 */
export function useRemoveBlockedDate() {
  return useMutation(api.bookings.removeBlockedDate);
}

// =====================================================
// MARKETPLACE
// =====================================================

/**
 * Search market items
 */
export function useMarketItems(searchParams?: {
  searchQuery?: string;
  category?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  itemType?: string;
  limit?: number;
}) {
  return useQuery(api.marketplace.searchMarketItems, {
    ...searchParams,
  });
}

/**
 * Get market item by ID
 */
export function useMarketItem(itemId: Id<'marketItems'>) {
  return useQuery(api.marketplace.getMarketItemById, { itemId });
}

/**
 * Get items by seller
 */
export function useMarketItemsBySeller(sellerId: string, status?: string) {
  return useQuery(api.marketplace.getMarketItemsBySeller, {
    sellerId,
    status,
  });
}

/**
 * Get featured items
 */
export function useFeaturedItems(limit = 10) {
  return useQuery(api.marketplace.getFeaturedItems, { limit });
}

/**
 * Get transactions by buyer
 */
export function useTransactionsByBuyer(buyerId: string, status?: string) {
  return useQuery(api.marketplace.getTransactionsByBuyer, {
    buyerId,
    status,
  });
}

/**
 * Get transactions by seller
 */
export function useTransactionsBySeller(sellerId: string, status?: string) {
  return useQuery(api.marketplace.getTransactionsBySeller, {
    sellerId,
    status,
  });
}

/**
 * Get transaction by ID
 */
export function useTransaction(transactionId: Id<'marketTransactions'>) {
  return useQuery(api.marketplace.getTransactionById, { transactionId });
}

/**
 * Create market item
 */
export function useCreateMarketItem() {
  return useMutation(api.marketplace.createMarketItem);
}

/**
 * Update market item
 */
export function useUpdateMarketItem() {
  return useMutation(api.marketplace.updateMarketItem);
}

/**
 * Create transaction (make offer)
 */
export function useCreateTransaction() {
  return useMutation(api.marketplace.createTransaction);
}

/**
 * Accept offer
 */
export function useAcceptOffer() {
  return useMutation(api.marketplace.acceptOffer);
}

/**
 * Reject offer
 */
export function useRejectOffer() {
  return useMutation(api.marketplace.rejectOffer);
}

/**
 * Confirm purchase
 */
export function useConfirmPurchase() {
  return useMutation(api.marketplace.confirmPurchase);
}

/**
 * Complete transaction
 */
export function useCompleteTransaction() {
  return useMutation(api.marketplace.completeTransaction);
}

/**
 * Check if in watchlist
 */
export function useIsInWatchlist(userId: string, itemId: Id<'marketItems'>) {
  return useQuery(api.marketplace.isInWatchlist, {
    userId,
    itemId,
  });
}

/**
 * Get watchlist
 */
export function useWatchlist(userId: string) {
  return useQuery(api.marketplace.getWatchlist, { userId });
}

/**
 * Add to watchlist
 */
export function useAddToWatchlist() {
  return useMutation(api.marketplace.addToWatchlist);
}

/**
 * Remove from watchlist
 */
export function useRemoveFromWatchlist() {
  return useMutation(api.marketplace.removeFromWatchlist);
}

/**
 * Get seller rating
 */
export function useSellerRating(sellerId: string) {
  return useQuery(api.marketplace.getSellerRating, { sellerId });
}

/**
 * Get seller reviews
 */
export function useSellerReviews(sellerId: string, limit = 10) {
  return useQuery(api.marketplace.getSellerReviews, {
    sellerId,
    limit,
  });
}

// =====================================================
// BROADCASTS
// =====================================================

/**
 * Get broadcasts for a school
 */
export function useBroadcasts(schoolId: Id<'schools'>, status?: string) {
  return useQuery(api.broadcasts.getBroadcastsBySchool, {
    schoolId,
    status,
  });
}

/**
 * Get unread broadcasts for a user
 */
export function useUnreadBroadcasts(userId: string, schoolId: Id<'schools'>, userType: 'student' | 'staff') {
  return useQuery(api.broadcasts.getUnreadBroadcasts, {
    userId,
    schoolId,
    userType,
  });
}

/**
 * Get active broadcasts
 */
export function useActiveBroadcasts(schoolId: Id<'schools'>) {
  return useQuery(api.broadcasts.getActiveBroadcasts, {
    schoolId,
  });
}

/**
 * Get draft broadcasts
 */
export function useDraftBroadcasts(schoolId: Id<'schools'>, createdBy?: string) {
  return useQuery(api.broadcasts.getDraftBroadcasts, {
    schoolId,
    createdBy,
  });
}

/**
 * Create broadcast
 */
export function useCreateBroadcast() {
  return useMutation(api.broadcasts.createBroadcast);
}

/**
 * Update broadcast
 */
export function useUpdateBroadcast() {
  return useMutation(api.broadcasts.updateBroadcast);
}

/**
 * Publish broadcast
 */
export function usePublishBroadcast() {
  return useMutation(api.broadcasts.publishBroadcast);
}

/**
 * Archive broadcast
 */
export function useArchiveBroadcast() {
  return useMutation(api.broadcasts.archiveBroadcast);
}

/**
 * Mark broadcast as read
 */
export function useMarkBroadcastAsRead() {
  return useMutation(api.broadcasts.markBroadcastAsRead);
}

/**
 * Get broadcast stats
 */
export function useBroadcastStats(schoolId: Id<'schools'>) {
  return useQuery(api.broadcasts.getBroadcastStats, {
    schoolId,
  });
}

// =====================================================
// EDU
// =====================================================

/**
 * Get schools
 */
export function useSchools() {
  return useQuery(api.edu.getSchools);
}

/**
 * Get school by ID
 */
export function useSchool(schoolId: Id<'schools'>) {
  return useQuery(api.edu.getSchoolById, { schoolId });
}

/**
 * Get student by user ID
 */
export function useStudentByUserId(userId: string) {
  return useQuery(api.edu.getStudentByUserId, { userId });
}

/**
 * Get students by school
 */
export function useStudentsBySchool(schoolId: Id<'schools'>, status?: string) {
  return useQuery(api.edu.getStudentsBySchool, {
    schoolId,
    status,
  });
}

/**
 * Get staff by user ID
 */
export function useStaffByUserId(userId: string) {
  return useQuery(api.edu.getStaffByUserId, { userId });
}

/**
 * Get staff by school
 */
export function useStaffBySchool(schoolId: Id<'schools'>, role?: string) {
  return useQuery(api.edu.getStaffBySchool, {
    schoolId,
    role,
  });
}

/**
 * Get classes by school
 */
export function useClassesBySchool(schoolId: Id<'schools'>, status?: string) {
  return useQuery(api.edu.getClassesBySchool, {
    schoolId,
    status,
  });
}

/**
 * Get enrollments by class
 */
export function useEnrollmentsByClass(classId: Id<'classes'>) {
  return useQuery(api.edu.getEnrollmentsByClass, {
    classId,
  });
}

/**
 * Get enrollments by student
 */
export function useEnrollmentsByStudent(studentId: Id<'students'>, status?: string) {
  return useQuery(api.edu.getEnrollmentsByStudent, {
    studentId,
    status,
  });
}

/**
 * Enroll student in class
 */
export function useEnrollStudent() {
  return useMutation(api.edu.enrollStudent);
}

/**
 * Drop student from class
 */
export function useDropStudent() {
  return useMutation(api.edu.dropStudent);
}

/**
 * Add grade to enrollment
 */
export function useAddGrade() {
  return useMutation(api.edu.addGrade);
}

/**
 * Get internships by student
 */
export function useInternshipsByStudent(studentId: Id<'students'>, status?: string) {
  return useQuery(api.edu.getInternshipsByStudent, {
    studentId,
    status,
  });
}

/**
 * Create internship
 */
export function useCreateInternship() {
  return useMutation(api.edu.createInternship);
}

/**
 * Start internship
 */
export function useStartInternship() {
  return useMutation(api.edu.startInternship);
}

/**
 * Complete internship
 */
export function useCompleteInternship() {
  return useMutation(api.edu.completeInternship);
}
