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
export function usePostsByAuthor(clerkId: string, limit = 20) {
  return useQuery(api.social.getPostsByAuthor, {
    clerkId,
    limit,
  });
}

/**
 * Get single post
 */
export function usePost(postId: string) {
  return useQuery(api.posts.get, { postId: postId as Id<'posts'> });
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
  return useMutation(api.social.repostPost);
}

// =====================================================
// COMMENTS
// =====================================================

/**
 * Get comments for a post
 */
export function useComments(postId: string, limit = 20) {
  return useQuery(api.comments.getCommentsByPost, {
    postId: postId as Id<'posts'>,
    limit,
  });
}

/**
 * Get comment replies
 */
export function useCommentReplies(parentId: string | Id<'comments'>, limit = 20) {
  return useQuery(api.comments.getCommentReplies, {
    parentId: parentId as Id<'comments'>,
    limit,
  });
}

/**
 * Get comments by author
 */
export function useCommentsByAuthor(authorId: string, limit = 20) {
  return useQuery(api.comments.getCommentsByAuthor, {
    authorId: authorId as Id<'users'>,
    limit,
  });
}

/**
 * Create a comment
 */
export function useCreateComment() {
  return useMutation(api.comments.createComment);
}

/**
 * Update a comment
 */
export function useUpdateComment() {
  return useMutation(api.comments.updateComment);
}

/**
 * Delete a comment
 */
export function useDeleteComment() {
  return useMutation(api.comments.deleteComment);
}

// =====================================================
// REACTIONS
// =====================================================

/**
 * Get reactions for a target
 */
export function useReactions(targetId: string, targetType: 'post' | 'comment' = 'post') {
  return useQuery(api.social.getReactions, {
    targetId: targetId as any,
    targetType,
  });
}

/**
 * Get reaction summary grouped by emoji
 */
export function useReactionSummary(targetId: string, targetType: 'post' | 'comment' = 'post') {
  return useQuery(api.social.getReactions, {
    targetId: targetId as any,
    targetType,
  });
}

/**
 * Get user's reaction on a target
 */
export function useUserReaction(targetId: string, clerkId: string, targetType: 'post' | 'comment' = 'post', emoji?: string) {
  return useQuery(api.social.hasReacted, {
    targetId,
    clerkId,
    targetType,
    emoji,
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
export function useIsPostSaved(clerkId: string, postId: string | Id<'posts'>) {
  return useQuery(api.social.isSaved, {
    clerkId,
    postId: postId as Id<'posts'>,
  });
}

/**
 * Get user's saved posts
 */
export function useSavedPosts(clerkId: string, limit = 50) {
  return useQuery(api.social.getSavedPosts, {
    clerkId,
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
    searchText: searchQuery,
    limit,
  });
}

/**
 * Update user profile
 */
export function useUpdateProfile() {
  return useMutation(api.users.updateProfile);
}

/**
 * Update sub-profile
 */
export function useUpdateSubProfile() {
  return useMutation(api.users.updateSubProfile);
}

/**
 * Create sub-profile
 */
export function useCreateSubProfile() {
  return useMutation(api.users.createSubProfile);
}

/**
 * Get user's public display name based on their active role
 * Resolves display name using SubProfile preferences
 */
export function usePublicDisplayName(clerkId: string, role?: string) {
  return useQuery(
    api.users.getPublicDisplayName,
    clerkId ? { clerkId, role } : "skip"
  );
}

// =====================================================
// FOLLOWS
// =====================================================

/**
 * Get followers for a user
 */
export function useFollowers(userId: string) {
  return useQuery(api.users.getFollowers, { userId: userId as Id<'users'> });
}

/**
 * Get who a user is following
 */
export function useFollowing(userId: string) {
  return useQuery(api.users.getFollowing, { userId: userId as Id<'users'> });
}

/**
 * Check if following
 */
export function useIsFollowing(followerId: string, followingId: string) {
  return useQuery(api.users.isFollowing, {
    followerId: followerId as Id<'users'>,
    followingId: followingId as Id<'users'>,
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
// STUDIO BOOKINGS (sbookings)
// =====================================================

/**
 * Get studios by owner
 */
export function useStudiosByOwner(ownerId: string) {
  return useQuery(api.sbookings.getStudiosByOwner, { ownerId: ownerId as any });
}

/**
 * Get studio by ID
 */
export function useStudio(studioId: string | Id<'studios'>) {
  return useQuery(api.sbookings.getStudioById, { studioId: studioId as Id<'studios'> });
}

/**
 * Get rooms by studio
 */
export function useRoomsByStudio(studioId?: string) {
  return useQuery(
    api.sbookings.getRoomsByStudio,
    studioId ? { studioId: studioId as Id<'studios'> } : "skip"
  );
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
  return useQuery(api.sbookings.getAvailableRooms, {
    studioId,
    date,
    startTime,
    endTime,
    minCapacity,
  });
}

/**
 * Get studio bookings by studio
 */
export function useBookingsByStudio(studioId?: string, status?: string) {
  return useQuery(
    api.sbookings.getBookingsByStudio,
    studioId ? { studioId: studioId as Id<'studios'>, status } : "skip"
  );
}

/**
 * Get studio bookings by client
 */
export function useStudioBookingsByClient(clerkId: string, status?: string) {
  return useQuery(api.sbookings.getBookingsByClient, {
    clientClerkId: clerkId,
    status,
  });
}

/**
 * Get upcoming studio bookings for a client
 */
export function useUpcomingStudioBookings(clerkId: string, limit = 10) {
  return useQuery(api.sbookings.getUpcomingBookings, {
    clerkId,
    limit,
  });
}

/**
 * Create a studio booking
 */
export function useCreateStudioBooking() {
  return useMutation(api.sbookings.createBooking);
}

/**
 * Update a studio booking
 */
export function useUpdateStudioBooking() {
  return useMutation(api.sbookings.updateBooking);
}

/**
 * Confirm a studio booking
 */
export function useConfirmStudioBooking() {
  return useMutation(api.sbookings.confirmBooking);
}

/**
 * Start a studio booking
 */
export function useStartStudioBooking() {
  return useMutation(api.sbookings.startBooking);
}

/**
 * Complete a studio booking
 */
export function useCompleteStudioBooking() {
  return useMutation(api.sbookings.completeBooking);
}

/**
 * Cancel a studio booking
 */
export function useCancelStudioBooking() {
  return useMutation(api.sbookings.cancelBooking);
}

/**
 * Get payments by booking ID
 */
export function usePaymentsByBooking(bookingId: string) {
  return useQuery(api.sbookings.getPaymentsByBooking, {
    bookingId,
  });
}

/**
 * Create a payment (universal)
 */
export function useCreatePayment() {
  return useMutation(api.sbookings.createPayment);
}

/**
 * Update payment status
 */
export function useUpdatePaymentStatus() {
  return useMutation(api.sbookings.updatePaymentStatus);
}

/**
 * Get blocked dates for a studio
 */
export function useBlockedDates(studioId: string | Id<'studios'>) {
  return useQuery(api.sbookings.getBlockedDates, { studioId: studioId as Id<'studios'> });
}

/**
 * Add blocked date
 */
export function useAddBlockedDate() {
  return useMutation(api.sbookings.addBlockedDate);
}

/**
 * Remove blocked date
 */
export function useRemoveBlockedDate() {
  return useMutation(api.sbookings.removeBlockedDate);
}

// =====================================================
// BACKWARD-COMPAT ALIASES (Studio Booking hooks)
// =====================================================
/** @deprecated Use useStudioBookingsByClient */
export const useBookingsByClient = useStudioBookingsByClient;
/** @deprecated Use useConfirmStudioBooking */
export const useConfirmBooking = useConfirmStudioBooking;
/** @deprecated Use useCancelStudioBooking */
export const useCancelBooking = useCancelStudioBooking;
/** @deprecated Use useUpdateStudioBooking */
export const useUpdateBooking = useUpdateStudioBooking;
/** @deprecated Use useCreateStudioBooking */
export const useCreateBooking = useCreateStudioBooking;

// =====================================================
// TALENT BOOKINGS (bookings) - Direct Talent Hiring
// =====================================================

/**
 * Create a talent booking (direct hire request)
 */
export function useCreateTalentBooking() {
  return useMutation(api.bookings.createBooking);
}

/**
 * Get bookings where user is the talent (incoming)
 */
export function useTalentBookings(talentClerkId: string, status?: string, limit = 50) {
  return useQuery(api.bookings.getTalentBookings, { talentClerkId, status, limit });
}

/**
 * Get bookings where user is the client (outgoing)
 */
export function useClientBookings(clientClerkId: string, status?: string, limit = 50) {
  return useQuery(api.bookings.getClientBookings, { clientClerkId, status, limit });
}

/**
 * Get upcoming talent bookings for a user
 */
export function useUpcomingTalentBookings(clerkId: string, limit = 10) {
  return useQuery(api.bookings.getUpcomingBookings, { clerkId, limit });
}

/**
 * Accept a talent booking (talent action)
 */
export function useAcceptTalentBooking() {
  return useMutation(api.bookings.acceptBooking);
}

/**
 * Decline a talent booking (talent action)
 */
export function useDeclineTalentBooking() {
  return useMutation(api.bookings.declineBooking);
}

/**
 * Cancel a talent booking (either party)
 */
export function useCancelTalentBooking() {
  return useMutation(api.bookings.cancelBooking);
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
 * Get eduAnnouncements for a school
 */
export function useEduAnnouncements(schoolId: Id<'schools'>, status?: string) {
  return useQuery(api.eduAnnouncements.getEduAnnouncementsBySchool, {
    schoolId,
    status,
  });
}

/**
 * Get unread eduAnnouncements for a user
 */
export function useUnreadEduAnnouncements(userId: string, schoolId: Id<'schools'>, userType: 'student' | 'staff') {
  return useQuery(api.eduAnnouncements.getUnreadEduAnnouncements, {
    userId,
    schoolId,
    userType,
  });
}

/**
 * Get active eduAnnouncements
 */
export function useActiveEduAnnouncements(schoolId: Id<'schools'>) {
  return useQuery(api.eduAnnouncements.getActiveEduAnnouncements, {
    schoolId,
  });
}

/**
 * Get draft eduAnnouncements
 */
export function useDraftEduAnnouncements(schoolId: Id<'schools'>, createdBy?: string) {
  return useQuery(api.eduAnnouncements.getDraftEduAnnouncements, {
    schoolId,
    createdBy,
  });
}

/**
 * Create eduAnnouncement
 */
export function useCreateEduAnnouncement() {
  return useMutation(api.eduAnnouncements.createEduAnnouncement);
}

/**
 * Update eduAnnouncement
 */
export function useUpdateEduAnnouncement() {
  return useMutation(api.eduAnnouncements.updateEduAnnouncement);
}

/**
 * Publish eduAnnouncement
 */
export function usePublishEduAnnouncement() {
  return useMutation(api.eduAnnouncements.publishEduAnnouncement);
}

/**
 * Archive eduAnnouncement
 */
export function useArchiveEduAnnouncement() {
  return useMutation(api.eduAnnouncements.archiveEduAnnouncement);
}

/**
 * Mark eduAnnouncement as read
 */
export function useMarkEduAnnouncementAsRead() {
  return useMutation(api.eduAnnouncements.markEduAnnouncementAsRead);
}

/**
 * Get eduAnnouncement stats
 */
export function useEduAnnouncementStats(schoolId: Id<'schools'>) {
  return useQuery(api.eduAnnouncements.getEduAnnouncementStats, {
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
  return useQuery(api.edu.getStudentByUserId, { userId: userId as Id<'users'> });
}

/**
 * Get students by school
 */
export function useStudentsBySchool(schoolId: Id<'schools'>, limit = 50) {
  return useQuery(api.edu.getStudentsBySchool, {
    schoolId,
    limit,
  });
}

/**
 * Get staff by user ID
 */
export function useStaffByUserId(userId: string) {
  return useQuery(api.edu.getStaffByUserId, { userId: userId as Id<'users'> });
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
export function useClassesBySchool(schoolId: Id<'schools'>, limit = 50) {
  return useQuery(api.edu.getClassesBySchool, {
    schoolId,
    limit,
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
export function useEnrollmentsByStudent(studentId: string | Id<'users'>) {
  return useQuery(api.edu.getEnrollmentsByStudent, {
    studentId: studentId as Id<'users'>,
  });
}

/**
 * Enroll student in class
 */
export function useEnrollStudent() {
  return useMutation(api.edu.enrollStudent);
}

/**
 * Unenroll student from class
 */
export function useUnenrollStudent() {
  return useMutation(api.edu.unenrollStudent);
}

/**
 * Backward compatibility alias for useUnenrollStudent
 */
export const useDropStudent = useUnenrollStudent;

// =====================================================
// STUDIOS
// =====================================================

/**
 * Get studio by owner ID
 */
export function useStudioByOwner(ownerId: string | undefined) {
  return useQuery(
    api.studios.getStudioByOwner,
    ownerId ? { ownerId: ownerId as Id<'users'> } : 'skip'
  );
}

/**
 * Get all active studios
 */
export function useActiveStudios(filters?: {
  city?: string;
  state?: string;
}) {
  return useQuery(
    api.studios.getActiveStudios,
    filters || {}
  );
}

/**
 * Create a new studio
 */
export function useCreateStudio() {
  return useMutation(api.studios.createStudio);
}

/**
 * Update studio settings
 */
export function useUpdateStudio() {
  return useMutation(api.studios.updateStudio);
}

/**
 * Update studio by owner (convenience function)
 */
export function useUpdateStudioByOwner() {
  return useMutation(api.studios.updateStudioByOwner);
}

/**
 * Delete studio (soft delete)
 */
export function useDeleteStudio() {
  return useMutation(api.studios.deleteStudio);
}

// =====================================================
// STUDIO MANAGER - FLOOR PLANS
// =====================================================

/**
 * Get floor plan by studio ID
 */
export function useFloorplanByStudio(studioId: string | Id<'studios'>) {
  return useQuery(
    api.studioManager.getFloorplanByStudio,
    { studioId: studioId as Id<'studios'> }
  );
}

/**
 * Get floor plan by room ID
 */
export function useFloorplanByRoom(roomId: Id<'rooms'>) {
  return useQuery(
    api.studioManager.getFloorplanByRoom,
    { roomId }
  );
}

/**
 * Get floor plan version history
 */
export function useFloorplanHistory(studioId: Id<'studios'>, limit?: number) {
  return useQuery(
    api.studioManager.getFloorplanHistory,
    { studioId, limit }
  );
}

/**
 * Save floor plan
 */
export function useSaveFloorplan() {
  return useMutation(api.studioManager.saveFloorplan);
}

/**
 * Delete floor plan
 */
export function useDeleteFloorplan() {
  return useMutation(api.studioManager.deleteFloorplan);
}

// =====================================================
// STUDIO MANAGER - EQUIPMENT
// =====================================================

/**
 * Get all equipment for a studio
 */
export function useEquipmentByStudio(studioId: Id<'studios'>, includeInactive?: boolean) {
  return useQuery(
    api.studioManager.getEquipmentByStudio,
    { studioId, includeInactive }
  );
}

/**
 * Get equipment by category
 */
export function useEquipmentByCategory(studioId: Id<'studios'>, category: string) {
  return useQuery(
    api.studioManager.getEquipmentByCategory,
    { studioId, category }
  );
}

/**
 * Get equipment by room
 */
export function useEquipmentByRoom(roomId: Id<'rooms'>) {
  return useQuery(
    api.studioManager.getEquipmentByRoom,
    { roomId }
  );
}

/**
 * Get equipment by status
 */
export function useEquipmentByStatus(studioId: Id<'studios'>, status: string) {
  return useQuery(
    api.studioManager.getEquipmentByStatus,
    { studioId, status }
  );
}

/**
 * Create equipment
 */
export function useCreateEquipment() {
  return useMutation(api.studioManager.createEquipment);
}

/**
 * Update equipment
 */
export function useUpdateEquipment() {
  return useMutation(api.studioManager.updateEquipment);
}

/**
 * Delete equipment
 */
export function useDeleteEquipment() {
  return useMutation(api.studioManager.deleteEquipment);
}

// =====================================================
// STUDIO MANAGER - CLIENTS
// =====================================================

/**
 * Get all clients for a studio
 */
export function useClientsByStudio(studioId: Id<'studios'>, clientType?: string, includeBlacklisted?: boolean) {
  return useQuery(
    api.studioManager.getClientsByStudio,
    { studioId, clientType, includeBlacklisted }
  );
}

/**
 * Get client profile by user ID
 */
export function useClientByUser(studioId: Id<'studios'>, userId: Id<'users'>) {
  return useQuery(
    api.studioManager.getClientByUser,
    { studioId, userId }
  );
}

/**
 * Get blacklisted clients
 */
export function useBlacklistedClients(studioId: Id<'studios'>) {
  return useQuery(
    api.studioManager.getBlacklistedClients,
    { studioId }
  );
}

/**
 * Create client
 */
export function useCreateClient() {
  return useMutation(api.studioManager.createClient);
}

/**
 * Update client
 */
export function useUpdateClient() {
  return useMutation(api.studioManager.updateClient);
}

/**
 * Update client metrics
 */
export function useUpdateClientMetrics() {
  return useMutation(api.studioManager.updateClientMetrics);
}

/**
 * Delete client
 */
export function useDeleteClient() {
  return useMutation(api.studioManager.deleteClient);
}

// =====================================================
// STUDIO MANAGER - STAFF
// =====================================================

/**
 * Get all staff for a studio
 */
export function useStaffByStudio(studioId: Id<'studios'>, includeInactive?: boolean) {
  return useQuery(
    api.studioManager.getStaffByStudio,
    { studioId, includeInactive }
  );
}

/**
 * Get staff by role
 */
export function useStaffByRole(studioId: Id<'studios'>, role: string) {
  return useQuery(
    api.studioManager.getStaffByRole,
    { studioId, role }
  );
}

/**
 * Get staff member by user ID
 */
export function useStaffByUser(studioId: Id<'studios'>, userId: Id<'users'>) {
  return useQuery(
    api.studioManager.getStaffByUser,
    { studioId, userId }
  );
}

/**
 * Create staff
 */
export function useCreateStaff() {
  return useMutation(api.studioManager.createStaff);
}

/**
 * Update staff
 */
export function useUpdateStaff() {
  return useMutation(api.studioManager.updateStaff);
}

/**
 * Delete staff
 */
export function useDeleteStaff() {
  return useMutation(api.studioManager.deleteStaff);
}

// =====================================================
// STUDIO MANAGER - ANALYTICS
// =====================================================

/**
 * Get analytics for a studio
 */
export function useStudioAnalytics(studioId: Id<'studios'>, period?: string, startDate?: string, endDate?: string) {
  return useQuery(
    api.studioManager.getAnalytics,
    { studioId, period, startDate, endDate }
  );
}

/**
 * Get all analytics for a studio
 */
export function useAllStudioAnalytics(studioId: Id<'studios'>) {
  return useQuery(
    api.studioManager.getAllAnalytics,
    { studioId }
  );
}

/**
 * Generate analytics
 */
export function useGenerateAnalytics() {
  return useMutation(api.studioManager.generateAnalytics);
}

/**
 * Delete analytics
 */
export function useDeleteAnalytics() {
  return useMutation(api.studioManager.deleteAnalytics);
}

// =====================================================
// STUDIO MANAGER - GALLERY
// =====================================================

/**
 * Update studio photos
 */
export function useUpdateStudioPhotos() {
  return useMutation(api.studioManager.updateStudioPhotos);
}

// =====================================================
// STORIES, LIVE ROOMS & TIPPING
// =====================================================

export function useActiveStories() {
  return useQuery(api.stories.getActiveStories);
}

export function useCreateStory() {
  return useMutation(api.stories.createStory);
}

export function useMarkStoryViewed() {
  return useMutation(api.stories.markStoryViewed);
}

export function useLiveRooms() {
  return useQuery(api.liveRooms.getLiveRooms);
}

export function useLiveRoom(roomId?: Id<'liveRooms'>) {
  return useQuery(api.liveRooms.getRoomById, roomId ? { roomId } : 'skip');
}

export function useCreateLiveRoom() {
  return useMutation(api.liveRooms.createLiveRoom);
}

export function useEndLiveRoom() {
  return useMutation(api.liveRooms.endLiveRoom);
}

export function useLiveRoomParticipants(roomId?: Id<'liveRooms'>) {
  return useQuery(api.liveRooms.getParticipants, roomId ? { roomId } : 'skip');
}

export function useJoinLiveRoom() {
  return useMutation(api.liveRooms.joinRoom);
}

export function useLeaveLiveRoom() {
  return useMutation(api.liveRooms.leaveRoom);
}

export function useLiveRoomHeartbeat() {
  return useMutation(api.liveRooms.heartbeat);
}

export function useToggleLiveRoomMute() {
  return useMutation(api.liveRooms.toggleMute);
}

export function useRaiseLiveRoomHand() {
  return useMutation(api.liveRooms.raiseHand);
}

export function useLowerLiveRoomHand() {
  return useMutation(api.liveRooms.lowerHand);
}

export function useApproveLiveRoomSpeaker() {
  return useMutation(api.liveRooms.approveSpeaker);
}

export function useDemoteLiveRoomSpeaker() {
  return useMutation(api.liveRooms.demoteSpeaker);
}

export function useKickLiveRoomParticipant() {
  return useMutation(api.liveRooms.kickParticipant);
}

export function useLiveRoomMessages(roomId?: Id<'liveRooms'>) {
  return useQuery(api.liveRooms.getMessages, roomId ? { roomId } : 'skip');
}

export function useSendLiveRoomMessage() {
  return useMutation(api.liveRooms.sendMessage);
}

export function useLiveRoomSignals(roomId?: Id<'liveRooms'>, targetClerkId?: string) {
  return useQuery(
    api.liveRooms.getSignals,
    roomId && targetClerkId ? { roomId, targetClerkId } : 'skip'
  );
}

export function useSendLiveRoomSignal() {
  return useMutation(api.liveRooms.sendSignal);
}

export function useSendTip() {
  return useMutation(api.tips.sendTip);
}

export function useReceivedTips(clerkId: string) {
  return useQuery(api.tips.getReceivedTips, { clerkId });
}

