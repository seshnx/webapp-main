/**
 * Hybrid Booking Service
 *
 * Handles booking operations across Neon (PostgreSQL) and MongoDB.
 * - Neon: Core booking data (transactions, payments, audit trail)
 * - MongoDB: Flexible metadata (custom fields, notes, attachments)
 */

import { createBooking as createNeonBooking, updateBookingStatus as updateNeonBookingStatus } from '../config/neonQueries';
import { mongoCollections, isMongoDbAvailable } from '../config/mongodb';
import * as Sentry from '@sentry/react';
import type {
  Booking,
  BookingMetadata,
  FormResponse,
  BookingNote,
  BookingCancellation,
  CompleteBooking
} from '../types';

/**
 * Create a new booking with hybrid storage
 *
 * @param bookingData - Core booking data for Neon
 * @param metadata - Optional flexible metadata for MongoDB
 * @returns Created booking
 */
export async function createBooking(
  bookingData: {
    sender_id: string;
    target_id: string;
    studio_owner_id?: string;
    status?: string;
    service_type?: string;
    date?: string;
    time?: string;
    duration?: number;
    offer_amount?: number;
    message?: string;
  },
  metadata?: Partial<BookingMetadata>
): Promise<Booking> {
  try {
    // 1. Create core booking in Neon (transactional)
    const booking = await createNeonBooking(bookingData);

    // 2. Store flexible metadata in MongoDB (async, non-blocking)
    if (metadata && isMongoDbAvailable()) {
      try {
        await mongoCollections.bookingMetadata().insertOne({
          bookingId: booking.id,
          studioId: booking.targetId,
          ...metadata,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as any);

        Sentry.captureMessage('Booking metadata stored in MongoDB', 'info', {
          tags: { service: 'booking', database: 'mongodb' },
          extra: { bookingId: booking.id }
        });
      } catch (mongoError) {
        // Log but don't fail - Neon booking is already created
        console.error('Failed to store booking metadata in MongoDB:', mongoError);
        Sentry.captureException(mongoError, {
          tags: { service: 'booking', database: 'mongodb' },
          extra: { bookingId: booking.id }
        });
      }
    }

    return booking;
  } catch (error) {
    console.error('Failed to create booking:', error);
    Sentry.captureException(error, {
      tags: { service: 'booking', database: 'neon' }
    });
    throw error;
  }
}

/**
 * Update booking status in Neon with optional MongoDB metadata
 *
 * @param bookingId - Booking ID
 * @param status - New status
 * @param cancellationReason - Optional cancellation reason for MongoDB
 */
export async function updateBookingStatus(
  bookingId: string,
  status: string,
  cancellationReason?: string
): Promise<void> {
  try {
    // 1. Update status in Neon
    await updateNeonBookingStatus(bookingId, status);

    // 2. Store cancellation details in MongoDB
    if (status === 'Cancelled' && cancellationReason && isMongoDbAvailable()) {
      try {
        await mongoCollections.bookingCancellations().insertOne({
          bookingId,
          reason: cancellationReason,
          cancelledAt: new Date(),
          cancelledBy: 'user', // Would be actual user ID
          refundStatus: 'pending',
        } as any);

        Sentry.captureMessage('Cancellation recorded in MongoDB', 'info', {
          tags: { service: 'booking', database: 'mongodb' },
          extra: { bookingId }
        });
      } catch (mongoError) {
        console.error('Failed to store cancellation in MongoDB:', mongoError);
        Sentry.captureException(mongoError, {
          tags: { service: 'booking', database: 'mongodb' },
          extra: { bookingId }
        });
      }
    }
  } catch (error) {
    console.error('Failed to update booking status:', error);
    Sentry.captureException(error, {
      tags: { service: 'booking', database: 'neon' },
      extra: { bookingId, status }
    });
    throw error;
  }
}

/**
 * Get complete booking data (Neon + MongoDB)
 *
 * @param bookingId - Booking ID
 * @returns Complete booking with metadata
 */
export async function getCompleteBooking(bookingId: string): Promise<CompleteBooking | null> {
  try {
    // 1. Get core data from Neon
    const neonBookings = await fetch(`/api/studio-ops/bookings/${bookingId}`).then(r => r.json());
    const core = neonBookings;

    if (!core) {
      return null;
    }

    // 2. Get flexible metadata from MongoDB
    let metadata: BookingMetadata | undefined;
    let formResponses: FormResponse | undefined;
    let notes: BookingNote[] = [];
    let attachments: any[] = [];
    let cancellation: BookingCancellation | undefined;

    if (isMongoDbAvailable()) {
      try {
        // Get booking metadata
        const metadataDoc = await mongoCollections.bookingMetadata().findOne({ bookingId });
        metadata = metadataDoc as any;

        // Get form responses
        const responseDoc = await mongoCollections.formResponses().findOne({ bookingId });
        formResponses = responseDoc as any;

        // Get notes
        const notesDocs = await mongoCollections.bookingNotes()
          .find({ bookingId })
          .sort({ createdAt: -1 })
          .toArray();
        notes = notesDocs as any;

        // Get attachments
        const attachmentsDocs = await mongoCollections.bookingAttachments()
          .find({ bookingId })
          .sort({ uploadedAt: -1 })
          .toArray();
        attachments = attachmentsDocs as any;

        // Get cancellation details
        const cancellationDoc = await mongoCollections.bookingCancellations().findOne({ bookingId });
        cancellation = cancellationDoc as any;
      } catch (mongoError) {
        console.error('Failed to fetch MongoDB data:', mongoError);
        Sentry.captureException(mongoError, {
          tags: { service: 'booking', database: 'mongodb' },
          extra: { bookingId }
        });
      }
    }

    // 3. Merge and return
    return {
      ...core,
      metadata,
      formResponses,
      notes,
      attachments,
      cancellation,
    };
  } catch (error) {
    console.error('Failed to get complete booking:', error);
    Sentry.captureException(error, {
      tags: { service: 'booking' },
      extra: { bookingId }
    });
    throw error;
  }
}

/**
 * Add a note to a booking (MongoDB only)
 *
 * @param bookingId - Booking ID
 * @param content - Note content
 * @param authorId - Author user ID
 * @param authorName - Author display name
 */
export async function addBookingNote(
  bookingId: string,
  content: string,
  authorId: string,
  authorName?: string
): Promise<void> {
  if (!isMongoDbAvailable()) {
    console.warn('MongoDB not available - cannot add booking note');
    return;
  }

  try {
    await mongoCollections.bookingNotes().insertOne({
      bookingId,
      content,
      authorId,
      authorName,
      createdAt: new Date(),
    } as any);

    Sentry.captureMessage('Booking note added', 'info', {
      tags: { service: 'booking', database: 'mongodb' },
      extra: { bookingId, authorId }
    });
  } catch (error) {
    console.error('Failed to add booking note:', error);
    Sentry.captureException(error, {
      tags: { service: 'booking', database: 'mongodb' },
      extra: { bookingId }
    });
    throw error;
  }
}

/**
 * Submit form response for a booking (MongoDB only)
 *
 * @param bookingId - Booking ID
 * @param studioId - Studio ID
 * @param schemaId - Form schema ID
 * @param responses - Form responses
 * @param submittedBy - User ID of submitter
 */
export async function submitFormResponse(
  bookingId: string,
  studioId: string,
  schemaId: string,
  responses: Record<string, any>,
  submittedBy: string
): Promise<void> {
  if (!isMongoDbAvailable()) {
    console.warn('MongoDB not available - cannot submit form response');
    return;
  }

  try {
    await mongoCollections.formResponses().insertOne({
      bookingId,
      studioId,
      schemaId,
      responses,
      submittedAt: new Date(),
      submittedBy,
    } as any);

    Sentry.captureMessage('Form response submitted', 'info', {
      tags: { service: 'booking', database: 'mongodb' },
      extra: { bookingId, studioId }
    });
  } catch (error) {
    console.error('Failed to submit form response:', error);
    Sentry.captureException(error, {
      tags: { service: 'booking', database: 'mongodb' },
      extra: { bookingId, studioId }
    });
    throw error;
  }
}

/**
 * Get form schema for a studio (MongoDB only)
 *
 * @param studioId - Studio ID
 * @returns Active form schema or null
 */
export async function getFormSchema(studioId: string): Promise<any> {
  if (!isMongoDbAvailable()) {
    return null;
  }

  try {
    const schema = await mongoCollections.formSchemas().findOne({
      studioId,
      isActive: true,
    });

    return schema;
  } catch (error) {
    console.error('Failed to get form schema:', error);
    Sentry.captureException(error, {
      tags: { service: 'booking', database: 'mongodb' },
      extra: { studioId }
    });
    return null;
  }
}
