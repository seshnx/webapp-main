import { v } from 'convex/values';
import { query } from './_generated/server';

/**
 * Kiosk module for real-time studio display systems
 * Provides queries for live booking status and floor plan data
 */

/**
 * Get live bookings for a studio kiosk display
 * Returns today's bookings with real-time status updates via Convex subscriptions
 *
 * @param studioId - The studio ID to get bookings for
 * @returns Array of bookings for today with status and timing info
 */
export const getLiveBookings = query({
  args: { studioId: v.string() },
  handler: async (ctx, args) => {
    const { studioId } = args;

    // Get today's date in ISO format (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];

    // Get all bookings for this studio
    const allBookings = await ctx.db
      .query('bookings')
      .withIndex('by_target_status', (q) =>
        q.eq('targetId', studioId)
      )
      .collect();

    // Filter for today's bookings and confirmed status
    const todaysBookings = allBookings
      .filter(booking => {
        // Check if booking date matches today
        if (booking.date && booking.date !== today) {
          return false;
        }
        // Include confirmed, in_progress bookings
        return ['confirmed', 'in_progress'].includes(booking.status);
      })
      .map(booking => ({
        id: booking.id,
        senderId: booking.senderId,
        senderName: booking.senderName || 'Client',
        senderPhoto: booking.senderPhoto,
        status: booking.status,
        serviceType: booking.serviceType || 'Session',
        date: booking.date,
        time: booking.time,
        duration: booking.duration,
        // For EDU mode - optional fields
        isClassBooking: booking.isClassBooking as boolean | undefined,
        className: booking.className as string | undefined,
        professorName: booking.professorName as string | undefined,
        lessonPlan: booking.lessonPlan as string | undefined,
        // Timestamps
        startTime: booking.date && booking.time
          ? `${booking.date}T${booking.time}`
          : undefined,
        endTime: booking.date && booking.time && booking.duration
          ? `${booking.date}T${String(parseInt(booking.time.split(':')[0]) + Math.floor(booking.duration / 60)).padStart(2, '0')}:${String(parseInt(booking.time.split(':')[1]) + (booking.duration % 60)).padStart(2, '0')}`
          : undefined,
      }))
      .sort((a, b) => {
        // Sort by start time
        if (!a.time || !b.time) return 0;
        return a.time.localeCompare(b.time);
      });

    return todaysBookings;
  },
});

/**
 * Get studio information for kiosk display
 * Returns studio details including floor plan data
 *
 * @param studioId - The studio ID to get info for
 * @returns Studio information with floor plan data
 */
export const getStudioInfo = query({
  args: { studioId: v.string() },
  handler: async (ctx, args) => {
    const { studioId } = args;

    // This would typically query a studios table
    // For now, return a placeholder structure
    // In production, this should query the actual studio data from your database

    return {
      id: studioId,
      name: 'Studio Name',
      floorplan: {
        walls: [],
        structures: [],
      },
      rooms: [],
    };
  },
});

/**
 * Get real-time room status for a studio
 * Returns current status of each room (available/in_use)
 *
 * @param studioId - The studio ID to get room status for
 * @returns Object mapping room IDs to their current status
 */
export const getRoomStatuses = query({
  args: {
    studioId: v.string(),
    roomIds: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { studioId, roomIds } = args;

    // Get all bookings for this studio
    const allBookings = await ctx.db
      .query('bookings')
      .withIndex('by_target_status', (q) =>
        q.eq('targetId', studioId)
      )
      .collect();

    // Get current time
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
    const currentDate = now.toISOString().split('T')[0];

    // Build room status map
    const roomStatuses: Record<string, 'available' | 'in_use'> = {};

    // Check each booking to see if it's currently active
    for (const booking of allBookings) {
      if (booking.status !== 'confirmed') continue;
      if (booking.date !== currentDate) continue;
      if (!booking.time || !booking.duration) continue;

      // Calculate booking end time
      const [hours, minutes] = booking.time.split(':').map(Number);
      const bookingStart = new Date(now);
      bookingStart.setHours(hours, minutes, 0, 0);

      const bookingEnd = new Date(bookingStart.getTime() + booking.duration * 60000);

      // Check if current time is within booking window
      if (now >= bookingStart && now <= bookingEnd) {
        // This room is currently in use
        // Note: We'd need roomId in the booking schema for this to work properly
        // For now, using a placeholder
        const roomId = booking.roomId as string | undefined;
        if (roomId && (!roomIds || roomIds.includes(roomId))) {
          roomStatuses[roomId] = 'in_use';
        }
      }
    }

    return roomStatuses;
  },
});
