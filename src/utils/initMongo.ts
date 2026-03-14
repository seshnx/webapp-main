/**
 * MongoDB Initialization Utility
 *
 * Initializes MongoDB connection and creates indexes.
 * Should be called during application startup.
 */

import { initMongoDB, ensureMongoIndexes, isMongoDbAvailable } from '../config/mongodb.js';
import * as Sentry from '@sentry/react';

/**
 * Initialize MongoDB for the application
 * This should be called once during app startup
 */
export async function initializeMongoDB(): Promise<void> {
  try {
    console.log('Initializing MongoDB...');

    // Initialize MongoDB connection
    await initMongoDB();

    // Check if MongoDB is available
    if (!isMongoDbAvailable()) {
      console.warn('⚠️ MongoDB not available - flexible booking features will be disabled');
      return;
    }

    // Create indexes for optimal query performance
    await ensureMongoIndexes();

    console.log('✅ MongoDB initialization complete');
  } catch (error) {
    console.error('❌ MongoDB initialization failed:', error);
    Sentry.captureException(error, {
      tags: { service: 'mongodb', operation: 'init' }
    });

    // Don't throw - allow app to run without MongoDB
    console.warn('Application will continue without MongoDB features');
  }
}

/**
 * Initialize MongoDB with sample form schemas
 * Useful for development/testing
 */
export async function seedSampleFormSchemas(): Promise<void> {
  if (!isMongoDbAvailable()) {
    console.warn('MongoDB not available - cannot seed sample data');
    return;
  }

  try {
    const { mongoCollections } = await import('../config/mongodb.js');

    // Sample recording studio form schema
    const recordingStudioSchema = {
      studioId: 'studio_recording_example',
      schemaName: 'Recording Session Requirements',
      description: 'Help us prepare for your recording session',
      fields: [
        {
          id: 'engineer_notes',
          fieldType: 'textarea',
          label: 'Engineer Setup Notes',
          placeholder: 'e.g., Use vintage Neve preamp, warm compression',
          required: true,
          order: 0,
          helpText: 'Help our engineer understand your vision'
        },
        {
          id: 'mic_preference',
          fieldType: 'select',
          label: 'Preferred Microphone',
          required: true,
          order: 1,
          options: [
            { label: 'Neumann U87', value: 'u87' },
            { label: 'Shure SM7B', value: 'sm7b' },
            { label: 'AKG C414', value: 'c414' },
            { label: 'Engineer Choice', value: 'engineer_choice' }
          ]
        },
        {
          id: 'gear_rental',
          fieldType: 'checkbox',
          label: 'Need Gear Rental?',
          required: false,
          order: 2,
          options: [
            { label: 'Bass Amp', value: 'bass_amp' },
            { label: 'Drums', value: 'drums' },
            { label: 'Keyboards', value: 'keyboards' },
            { label: 'Guitars', value: 'guitars' }
          ]
        },
        {
          id: 'reference_tracks',
          fieldType: 'file',
          label: 'Reference Tracks',
          required: false,
          order: 3,
          helpText: 'Upload MP3/WAV to show the vibe you want'
        }
      ],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system',
      version: 1
    };

    // Check if schema already exists
    const existing = await mongoCollections.formSchemas().findOne({
      studioId: 'studio_recording_example'
    });

    if (!existing) {
      await mongoCollections.formSchemas().insertOne(recordingStudioSchema);
      console.log('✅ Sample form schema seeded');
    } else {
      console.log('ℹ️ Sample form schema already exists');
    }
  } catch (error) {
    console.error('Failed to seed sample form schemas:', error);
    Sentry.captureException(error, {
      tags: { service: 'mongodb', operation: 'seed' }
    });
  }
}
