/**
 * Unified Booking Hook
 *
 * Combines data from Neon (core) and MongoDB (flexible)
 * to provide a single interface for booking operations.
 */

import { useEffect, useState, useCallback } from 'react';
import { getCompleteBooking, addBookingNote, submitFormResponse, getFormSchema } from '../services/bookingService';
import { isMongoDbAvailable } from '../config/mongodb';
import * as Sentry from '@sentry/react';
import type { CompleteBooking, FormSchema } from '../types';

/**
 * Hook for fetching and managing complete booking data
 */
export function useBooking(bookingId: string | null) {
  const [booking, setBooking] = useState<CompleteBooking | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchBooking = useCallback(async () => {
    if (!bookingId) {
      setBooking(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getCompleteBooking(bookingId);
      setBooking(data);
    } catch (err) {
      const error = err as Error;
      setError(error);
      Sentry.captureException(error, {
        tags: { hook: 'useBooking' },
        extra: { bookingId }
      });
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  const addNote = useCallback(async (
    content: string,
    authorId: string,
    authorName?: string
  ) => {
    if (!bookingId) return;

    try {
      await addBookingNote(bookingId, content, authorId, authorName);

      // Refresh booking data
      await fetchBooking();
    } catch (error) {
      console.error('Failed to add note:', error);
      throw error;
    }
  }, [bookingId, fetchBooking]);

  return {
    booking,
    loading,
    error,
    refetch: fetchBooking,
    addNote,
  };
}

/**
 * Hook for fetching a studio's form schema
 */
export function useFormSchema(studioId: string | null) {
  const [schema, setSchema] = useState<FormSchema | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [mongoDbAvailable, setMongoDbAvailable] = useState<boolean>(false);

  useEffect(() => {
    setMongoDbAvailable(isMongoDbAvailable());
  }, []);

  useEffect(() => {
    if (!studioId || !mongoDbAvailable) {
      setSchema(null);
      return;
    }

    const fetchSchema = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getFormSchema(studioId);
        setSchema(data);
      } catch (err) {
        const error = err as Error;
        setError(error);
        Sentry.captureException(error, {
          tags: { hook: 'useFormSchema' },
          extra: { studioId }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSchema();
  }, [studioId, mongoDbAvailable]);

  const submitResponse = useCallback(async (
    bookingId: string,
    responses: Record<string, any>,
    submittedBy: string
  ) => {
    if (!studioId || !schema) {
      throw new Error('No form schema available');
    }

    try {
      await submitFormResponse(
        bookingId,
        studioId,
        schema._id || '',
        responses,
        submittedBy
      );
    } catch (error) {
      console.error('Failed to submit form response:', error);
      throw error;
    }
  }, [studioId, schema]);

  return {
    schema,
    loading,
    error,
    submitResponse,
    mongoDbAvailable,
  };
}

/**
 * Hook for managing multiple bookings
 */
export function useBookings(bookingIds: string[]) {
  const [bookings, setBookings] = useState<CompleteBooking[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!bookingIds.length) {
      setBookings([]);
      return;
    }

    const fetchBookings = async () => {
      setLoading(true);
      setError(null);

      try {
        const promises = bookingIds.map(id => getCompleteBooking(id));
        const results = await Promise.allSettled(promises);

        const successfulBookings = results
          .filter((result): result is PromiseFulfilledResult<CompleteBooking> =>
            result.status === 'fulfilled' && result.value !== null
          )
          .map(result => result.value);

        setBookings(successfulBookings);
      } catch (err) {
        const error = err as Error;
        setError(error);
        Sentry.captureException(error, {
          tags: { hook: 'useBookings' },
          extra: { bookingIds }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [bookingIds]);

  return {
    bookings,
    loading,
    error,
  };
}
