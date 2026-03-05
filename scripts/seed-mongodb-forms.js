/**
 * MongoDB Form Schema Seed Script
 *
 * This script seeds MongoDB with sample form schemas for testing.
 * Run with: node scripts/seed-mongodb-forms.js
 */

import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const MONGODB_CONNECTION_STRING = process.env.VITE_MONGODB_CONNECTION_STRING || '';
const MONGODB_DB_NAME = process.env.VITE_MONGODB_DB_NAME || 'seshnx';

if (!MONGODB_CONNECTION_STRING) {
  console.error('❌ VITE_MONGODB_CONNECTION_STRING not found in environment variables');
  console.error('Please set up MongoDB credentials in .env.local');
  process.exit(1);
}

/**
 * Sample form schemas for different studio types
 */
const formSchemas = [
  {
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
  },
  {
    studioId: 'studio_production_example',
    schemaName: 'Production Session Details',
    description: 'Tell us about your production needs',
    fields: [
      {
        id: 'genre',
        fieldType: 'select',
        label: 'Genre',
        required: true,
        order: 0,
        options: [
          { label: 'Hip-Hop', value: 'hiphop' },
          { label: 'R&B', value: 'rnb' },
          { label: 'Pop', value: 'pop' },
          { label: 'Rock', value: 'rock' },
          { label: 'Electronic', value: 'electronic' },
          { label: 'Other', value: 'other' }
        ]
      },
      {
        id: 'session_musicians',
        fieldType: 'number',
        label: 'Session Musicians Needed',
        required: false,
        order: 1,
        validation: {
          min: 0,
          max: 10
        },
        helpText: 'How many musicians do you need?'
      },
      {
        id: 'meal_preferences',
        fieldType: 'checkbox',
        label: 'Meal Preferences',
        required: false,
        order: 2,
        options: [
          { label: 'Vegetarian', value: 'vegetarian' },
          { label: 'Vegan', value: 'vegan' },
          { label: 'Gluten-Free', value: 'gluten_free' },
          { label: 'No Restrictions', value: 'none' }
        ]
      }
    ],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system',
    version: 1
  },
  {
    studioId: 'studio_mastering_example',
    schemaName: 'Mastering Requirements',
    description: 'Specify your mastering needs',
    fields: [
      {
        id: 'file_format',
        fieldType: 'select',
        label: 'Preferred File Format',
        required: true,
        order: 0,
        options: [
          { label: 'WAV 24-bit', value: 'wav_24' },
          { label: 'WAV 16-bit', value: 'wav_16' },
          { label: 'FLAC', value: 'flac' },
          { label: 'MP3 320kbps', value: 'mp3_320' }
        ]
      },
      {
        id: 'revision_rounds',
        fieldType: 'number',
        label: 'Revision Rounds Included',
        required: true,
        order: 1,
        validation: {
          min: 1,
          max: 5
        },
        helpText: 'How many revision rounds do you need?'
      },
      {
        id: 'reference_tracks',
        fieldType: 'file',
        label: 'Reference Tracks',
        required: true,
        order: 2,
        helpText: 'Upload tracks with similar sound you want'
      }
    ],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system',
    version: 1
  }
];

/**
 * Main seeding function
 */
async function seedMongoDB() {
  let client;

  try {
    console.log('🌱 Seeding MongoDB with sample form schemas...\n');

    // Connect to MongoDB
    client = new MongoClient(MONGODB_CONNECTION_STRING);
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db(MONGODB_DB_NAME);
    const collection = db.collection('form_schemas');

    // Clear existing sample schemas
    const deleteResult = await collection.deleteMany({
      studioId: { $in: formSchemas.map(s => s.studioId) }
    });
    console.log(`🗑️  Cleared ${deleteResult.deletedCount} existing sample schemas`);

    // Insert new schemas
    const insertResult = await collection.insertMany(formSchemas);
    console.log(`✅ Inserted ${insertResult.insertedCount} form schemas`);

    console.log('\n📋 Seeded Schemas:');
    formSchemas.forEach(schema => {
      console.log(`   - ${schema.schemaName} (studioId: ${schema.studioId})`);
      console.log(`     ${schema.fields.length} fields`);
    });

    console.log('\n✅ MongoDB seeding complete!\n');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 MongoDB connection closed');
    }
  }
}

// Run the seed function
seedMongoDB();
