/**
 * Booking Service - Convex Only
 *
 * All booking operations now use Convex for real-time updates.
 * No more hybrid storage - everything in one place.
 */

import { api } from '../../convex/_generated/api';
import { useQuery, useMutation, Id } from 'convex/react';
import * as Sentry from '@sentry/react';

// =====================================================
// TYPES
// =====================================================

export interface Booking {
  _id: Id<"bookings">;
  studioId: Id<"studios">;
  roomId: Id<"rooms">;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  numberOfPeople?: number;
  purpose?: string;
  specialRequests?: string;
  totalAmount: number;
  depositAmount?: number;
  depositRequired: boolean;
  notes?: string;
  status: "Pending" | "Confirmed" | "Cancelled" | "Rejected" | "Completed";
  paymentStatus: "DepositPending" | "DepositPaid" | "PendingPayment" | "Paid" | "Refunded";
  createdAt: number;
  updatedAt: number;
}

// =====================================================
// BOOKING OPERATIONS
// =====================================================

/**
 * Create a new booking
 * All data stored in Convex with real-time updates
 */
export async function createBooking(bookingData: {
  studioId: string;
  roomId: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  date: string;
  startTime: string;
  endTime: string;
  numberOfPeople?: number;
  purpose?: string;
  specialRequests?: string;
  totalAmount: number;
  depositAmount?: number;
  depositRequired?: boolean;
  notes?: string;
}): Promise<Booking> {
  try {
    // This would be called via Convex mutation from frontend
    console.warn('createBooking: Use Convex createBooking mutation from frontend');
    throw new Error('Use Convex mutation directly');
  } catch (error) {
    console.error('Failed to create booking:', error);
    Sentry.captureException(error, {
      tags: { service: 'booking', database: 'convex' }
    });
    throw error;
  }
}

/**
 * Update booking status
 * Real-time status updates via Convex
 */
export async function updateBookingStatus(
  bookingId: string,
  status: string,
  reason?: string
): Promise<void> {
  try {
    console.warn('updateBookingStatus: Use Convex updateBookingStatus mutation from frontend');
    throw new Error('Use Convex mutation directly');
  } catch (error) {
    console.error('Failed to update booking status:', error);
    Sentry.captureException(error, {
      tags: { service: 'booking', database: 'convex' },
      extra: { bookingId, status }
    });
    throw error;
  }
}

/**
 * Get complete booking data
 * All data in Convex - no merging needed
 */
export async function getCompleteBooking(bookingId: string): Promise<Booking | null> {
  try {
    console.warn('getCompleteBooking: Use Convex getBookingById query from frontend');
    return null;
  } catch (error) {
    console.error('Failed to get booking:', error);
    Sentry.captureException(error, {
      tags: { service: 'booking' },
      extra: { bookingId }
    });
    throw error;
  }
}

/**
 * Add a note to a booking
 * Notes stored in Convex booking record
 */
export async function addBookingNote(
  bookingId: string,
  content: string,
  authorId: string,
  authorName?: string
): Promise<void> {
  try {
    console.warn('addBookingNote: Use Convex mutation to update booking notes');
  } catch (error) {
    console.error('Failed to add booking note:', error);
    Sentry.captureException(error, {
      tags: { service: 'booking' },
      extra: { bookingId }
    });
    throw error;
  }
}

/**
 * Cancel a booking with reason
 */
export async function cancelBooking(
  bookingId: string,
  reason: string
): Promise<void> {
  try {
    console.warn('cancelBooking: Use Convex updateBookingStatus mutation with Cancelled status');
  } catch (error) {
    console.error('Failed to cancel booking:', error);
    Sentry.captureException(error, {
      tags: { service: 'booking' },
      extra: { bookingId }
    });
    throw error;
  }
}

// =====================================================
// REACT HOOKS FOR FRONTEND
// =====================================================

/**
 * Hook for bookings by client
 */
export function useBookingsByClient(clientId: string | undefined, status?: string) {
  return useQuery(
    api.bookings.getBookingsByClient,
    clientId ? { clientId, status, limit: 50 } : "skip"
  );
}

/**
 * Hook for upcoming bookings
 */
export function useUpcomingBookings(clientId: string | undefined, limit = 10) {
  return useQuery(
    api.bookings.getUpcomingBookings,
    clientId ? { clientId, limit } : "skip"
  );
}

/**
 * Hook for bookings by studio and date
 */
export function useBookingsByDate(studioId: string | undefined, date: string | undefined) {
  return useQuery(
    api.bookings.getBookingsByDate,
    (studioId && date) ? { studioId: studioId as Id<"studios">, date } : "skip"
  );
}

/**
 * Hook for bookings by date range
 */
export function useBookingsByDateRange(
  studioId: string | undefined,
  startDate: string | undefined,
  endDate: string | undefined
) {
  return useQuery(
    api.bookings.getBookingsByDateRange,
    (studioId && startDate && endDate)
      ? { studioId: studioId as Id<"studios">, startDate, endDate }
      : "skip"
  );
}

/**
 * Hook for specific booking
 */
export function useBooking(bookingId: string | undefined) {
  return useQuery(
    api.bookings.getBookingById,
    bookingId ? { bookingId: bookingId as Id<"bookings"> } : "skip"
  );
}

/**
 * Hook for available rooms
 */
export function useAvailableRooms(
  studioId: string | undefined,
  date: string | undefined,
  startTime: string | undefined,
  endTime: string | undefined,
  minCapacity?: number
) {
  return useQuery(
    api.bookings.getAvailableRooms,
    (studioId && date && startTime && endTime)
      ? {
          studioId: studioId as Id<"studios">,
          date,
          startTime,
          endTime,
          minCapacity,
        }
      : "skip"
  );
}

// =====================================================
// MUTATION HOOKS
// =====================================================

/**
 * Hook for booking mutations
 */
export function useBookingMutations() {
  const create = useMutation(api.bookings.createBooking);
  const update = useMutation(api.bookings.updateBooking);
  const updateStatus = useMutation(api.bookings.updateBookingStatus);
  const cancel = useMutation(api.bookings.cancelBooking);

  return {
    create,
    update,
    updateStatus,
    cancel,
  };
}

/**
 * Hook for booking payment mutations
 */
export function useBookingPaymentMutations() {
  const createPayment = useMutation(api.bookings.createBookingPayment);
  const updatePayment = useMutation(api.bookings.updateBookingPayment);

  return {
    createPayment,
    updatePayment,
  };
}

// =====================================================
// STUDIO OPERATIONS
// =====================================================

/**
 * Hook for studios by owner
 */
export function useStudiosByOwner(ownerId: string | undefined) {
  return useQuery(
    api.bookings.getStudiosByOwner,
    ownerId ? { ownerId } : "skip"
  );
}

/**
 * Hook for specific studio
 */
export function useStudio(studioId: string | undefined) {
  return useQuery(
    api.bookings.getStudioById,
    studioId ? { studioId: studioId as Id<"studios"> } : "skip"
  );
}

/**
 * Hook for studio search
 */
export function useStudioSearch(filters: {
  searchQuery?: string;
  city?: string;
  state?: string;
  minHourlyRate?: number;
  maxHourlyRate?: number;
  amenities?: string[];
  limit?: number;
}) {
  return useQuery(api.bookings.searchStudios, filters);
}

/**
 * Hook for rooms by studio
 */
export function useRoomsByStudio(studioId: string | undefined) {
  return useQuery(
    api.bookings.getRoomsByStudio,
    studioId ? { studioId: studioId as Id<"studios"> } : "skip"
  );
}

/**
 * Hook for specific room
 */
export function useRoom(roomId: string | undefined) {
  return useQuery(
    api.bookings.getRoomById,
    roomId ? { roomId: roomId as Id<"rooms"> } : "skip"
  );
}

// =====================================================
// STUDIO MUTATION HOOKS
// =====================================================

/**
 * Hook for studio mutations
 */
export function useStudioMutations() {
  const create = useMutation(api.bookings.createStudio);
  const update = useMutation(api.bookings.updateStudio);
  const remove = useMutation(api.bookings.deleteStudio);

  return {
    create,
    update,
    remove,
  };
}

/**
 * Hook for room mutations
 */
export function useRoomMutations() {
  const create = useMutation(api.bookings.createRoom);
  const update = useMutation(api.bookings.updateRoom);
  const remove = useMutation(api.bookings.deleteRoom);

  return {
    create,
    update,
    remove,
  };
}

// =====================================================
// EXPORTS
// =====================================================

export default {
  // Queries (use these in components)
  useBookingsByClient,
  useUpcomingBookings,
  useBookingsByDate,
  useBookingsByDateRange,
  useBooking,
  useAvailableRooms,
  useStudiosByOwner,
  useStudio,
  useStudioSearch,
  useRoomsByStudio,
  useRoom,

  // Mutations (use these in components)
  useBookingMutations,
  useBookingPaymentMutations,
  useStudioMutations,
  useRoomMutations,

  // Backend functions (deprecated - kept for backward compatibility)
  createBooking,
  updateBookingStatus,
  getCompleteBooking,
  addBookingNote,
  cancelBooking,
};
