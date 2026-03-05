# MongoDB Integration for SeshNx

## Overview

This implementation adds MongoDB as a flexible metadata store to complement the existing Neon PostgreSQL database. The hybrid architecture provides:

- **Neon (PostgreSQL)**: Core transactional data with ACID guarantees
- **MongoDB**: Flexible, schema-less metadata storage
- **Best of both worlds**: Financial safety + unlimited flexibility

## Architecture

```
┌──────────────────────────────────────────────────────┐
│         Booking Flexibility Without Risk              │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Neon (PostgreSQL)                                   │
│  ├── bookings (core transaction data)                │
│  ├── payments (financial records)                    │
│  ├── booking_status_history (audit trail)            │
│  └── [constraints, triggers, audit functions]        │
│                                                      │
│  MongoDB                                             │
│  ├── booking_metadata (flexible attributes)          │
│  ├── booking_notes (rich text, attachments)          │
│  ├── booking_custom_fields (user-defined)            │
│  ├── booking_preferences (artist wants...)           │
│  └── booking_requests (flexible form responses)      │
│                                                      │
└──────────────────────────────────────────────────────┘
```

## What's Been Built

### 1. Core Infrastructure

#### MongoDB Configuration (`src/config/mongodb.ts`)
- MongoDB client initialization
- Connection management
- Health checks
- Index creation
- Collection accessors with type safety

#### TypeScript Types (`src/types/mongodb.ts`)
- `BookingMetadata` - Flexible booking attributes
- `FormSchema` - Dynamic form definitions
- `FormResponse` - Customer submissions
- `BookingNote` - Booking notes
- `BookingAttachment` - File attachments
- `BookingCancellation` - Cancellation details
- `CompleteBooking` - Merged Neon + MongoDB data

### 2. Booking Service (`src/services/bookingService.ts`)

Hybrid operations that work with both databases:

```typescript
// Create booking with core data in Neon + metadata in MongoDB
await createBooking(
  {
    sender_id: 'user123',
    target_id: 'studio456',
    service_type: 'Bid',
    offer_amount: 500,
    status: 'Pending',
  },
  {
    studioType: 'recording',
    equipmentPreferences: ['Neumann U87', 'Vintage Preamp'],
    engineerNotes: 'Warm, vintage sound desired',
  }
);

// Get complete booking (merged from both databases)
const booking = await getCompleteBooking('booking789');

// Add note to booking (MongoDB only)
await addBookingNote('booking789', 'Client confirmed', 'user123');
```

### 3. React Hooks (`src/hooks/useBooking.ts`)

```typescript
// Get complete booking data
const { booking, loading, error } = useBooking('booking123');

// Get studio's form schema
const { schema, submitResponse } = useFormSchema('studio456');

// Add note to booking
await addNote('Great session!', 'user123', 'John Doe');
```

### 4. Dynamic Form Component (`src/components/bookings/DynamicBookingForm.tsx`)

Renders forms based on MongoDB schemas:

```tsx
<DynamicBookingForm
  studioId="studio456"
  bookingId="booking789"
  onSubmit={handleSubmit}
/>
```

### 5. Updated Modals

Created updated versions of booking modals that use the hybrid system:

- `src/components/BidModal.updated.tsx` - Bid submission with metadata
- `src/components/tech/TechBookingModal.updated.tsx` - Tech service requests with metadata

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

Dependencies added:
- `mongodb@^6.3.0` - MongoDB Node.js driver
- `@types/mongodb@^4.0.7` - TypeScript types

### 2. Set Up MongoDB Atlas

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster (free tier available)
3. Create a database user
4. Whitelist IP addresses (use `0.0.0.0/0` for Vercel)
5. Get connection string from Atlas → Connect → Connect your application

### 3. Configure Environment Variables

Copy `.env.mongodb.template` to `.env.local` and fill in your credentials:

```bash
# MongoDB Connection String
VITE_MONGODB_CONNECTION_STRING=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority

# MongoDB Database Name
VITE_MONGODB_DB_NAME=seshnx
```

### 4. Initialize MongoDB

The MongoDB connection is initialized automatically when the app starts. To manually seed sample form schemas:

```bash
node scripts/seed-mongodb-forms.js
```

### 5. Replace Old Components

Replace the original modals with the updated versions:

```tsx
// Replace this:
import BidModal from './components/BidModal';
import TechBookingModal from './components/tech/TechBookingModal';

// With this:
import BidModal from './components/BidModal.updated';
import TechBookingModal from './components/tech/TechBookingModal.updated';
```

## MongoDB Collections

### booking_metadata
Stores flexible booking attributes:
```javascript
{
  bookingId: "uuid",
  studioId: "uuid",
  studioType: "recording",
  equipmentPreferences: ["Neumann U87", "API Preamp"],
  engineerNotes: "Warm vintage sound",
  customFields: { /* any key-value pairs */ }
}
```

### form_schemas
Dynamic form definitions:
```javascript
{
  studioId: "uuid",
  schemaName: "Recording Session Requirements",
  fields: [
    {
      id: "engineer_notes",
      fieldType: "textarea",
      label: "Engineer Setup Notes",
      required: true,
      order: 0
    }
  ],
  isActive: true
}
```

### form_responses
Customer form submissions:
```javascript
{
  bookingId: "uuid",
  studioId: "uuid",
  schemaId: "uuid",
  responses: {
    engineer_notes: "Warm vintage sound please",
    mic_preference: "u87"
  },
  submittedAt: ISODate("2024-01-15T10:00:00Z")
}
```

### booking_notes
Booking notes:
```javascript
{
  bookingId: "uuid",
  content: "Client confirmed session",
  authorId: "uuid",
  authorName: "John Doe",
  createdAt: ISODate("2024-01-15T10:00:00Z")
}
```

### booking_cancellations
Cancellation details:
```javascript
{
  bookingId: "uuid",
  reason: "Client had schedule conflict",
  cancelledAt: ISODate("2024-01-15T10:00:00Z"),
  refundStatus: "pending"
}
```

## Usage Examples

### Creating a Booking with Metadata

```typescript
import { createBooking } from './services/bookingService';

const booking = await createBooking(
  // Neon data (core)
  {
    sender_id: user.id,
    target_id: studio.id,
    service_type: 'Session Recording',
    offer_amount: 500,
    status: 'Pending',
  },
  // MongoDB data (flexible)
  {
    studioType: 'recording',
    equipmentPreferences: ['Neumann U87', 'Vintage API'],
    engineerNotes: 'Looking for warm, vintage sound',
    micSetup: 'U87 through API 312 into LA-2A',
    customFields: {
      vibe: 'vintage',
      tempo: '120 BPM',
      key: 'C minor'
    }
  }
);
```

### Getting Complete Booking Data

```typescript
import { useBooking } from './hooks/useBooking';

function BookingDetails({ bookingId }) {
  const { booking, loading, error } = useBooking(bookingId);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {/* From Neon */}
      <h2>{booking.serviceType}</h2>
      <p>Status: {booking.status}</p>
      <p>Price: ${booking.offerAmount}</p>

      {/* From MongoDB */}
      {booking.metadata && (
        <div>
          <p>Equipment: {booking.metadata.equipmentPreferences?.join(', ')}</p>
          <p>Notes: {booking.metadata.engineerNotes}</p>
        </div>
      )}

      {/* Notes from MongoDB */}
      {booking.notes?.map(note => (
        <div key={note._id}>
          <p>{note.content}</p>
          <small>By {note.authorName}</small>
        </div>
      ))}
    </div>
  );
}
```

### Creating Dynamic Forms

```typescript
import { mongoCollections } from './config/mongodb';

// Create a form schema
await mongoCollections.formSchemas().insertOne({
  studioId: 'studio123',
  schemaName: 'Recording Session Requirements',
  fields: [
    {
      id: 'engineer_notes',
      fieldType: 'textarea',
      label: 'Engineer Setup Notes',
      required: true,
      order: 0
    },
    {
      id: 'mic_preference',
      fieldType: 'select',
      label: 'Preferred Microphone',
      required: true,
      order: 1,
      options: [
        { label: 'Neumann U87', value: 'u87' },
        { label: 'Shure SM7B', value: 'sm7b' }
      ]
    }
  ],
  isActive: true,
  createdAt: new Date(),
  createdBy: 'admin'
});

// Form will automatically render in DynamicBookingForm component
```

## Field Types Supported

The dynamic form system supports these field types:

- `text` - Single-line text input
- `textarea` - Multi-line text input
- `number` - Numeric input with min/max validation
- `email` - Email input with validation
- `phone` - Phone number input
- `date` - Date picker
- `time` - Time picker
- `select` - Dropdown menu
- `radio` - Radio button group
- `checkbox` - Checkbox group (multiple selections)
- `file` - File upload
- `address` - Address input (future)

## Monitoring & Error Handling

All MongoDB operations are integrated with Sentry:

- Connection errors logged with context
- Query failures tracked with field names
- Performance metrics collected
- Automatic retries for transient failures

## Performance Considerations

### Indexes
The following indexes are automatically created:

```javascript
// booking_metadata
{ bookingId: 1 } (unique)
{ studioId: 1 }

// form_schemas
{ studioId: 1, isActive: 1 }
{ schemaName: 1 }

// form_responses
{ bookingId: 1 } (unique)
{ studioId: 1, submittedAt: -1 }

// booking_notes
{ bookingId: 1, createdAt: -1 }

// booking_cancellations
{ bookingId: 1 }
```

### Query Patterns

- Always use indexed fields in queries
- Limit result sets with `.limit()` and `.skip()`
- Use projection to reduce data transfer
- Consider Atlas Search for full-text search

## Future Enhancements

Potential additions to the MongoDB system:

1. **Form Builder UI** - Drag-and-drop form creator for studio admins
2. **Conditional Logic** - Show/hide fields based on other field values
3. **Form Versioning** - Track schema changes over time
4. **Analytics** - Form response analytics and trends
5. **File Upload Integration** - Store file metadata in MongoDB, files in Vercel Blob
6. **Real-time Sync** - Convex integration for real-time form updates

## Troubleshooting

### MongoDB Connection Issues

```javascript
// Check if MongoDB is available
import { isMongoDbAvailable } from './config/mongodb';

if (!isMongoDbAvailable()) {
  console.warn('MongoDB not connected - flexible features disabled');
}
```

### Seed Script Issues

```bash
# Make sure you have a .env.local file with MongoDB credentials
node scripts/seed-mongodb-forms.js
```

### Type Errors

Make sure to import MongoDB types:

```typescript
import type { BookingMetadata, FormSchema } from './types/mongodb';
```

## Migration Path

To migrate existing bookings to use MongoDB metadata:

1. Run migration script to create metadata documents
2. Update booking creation flow to use hybrid service
3. Gradually add custom fields to MongoDB
4. Remove hardcoded columns from Neon (future)

## Support

For issues or questions:
- Check MongoDB Atlas logs
- Review Sentry error tracking
- Verify environment variables
- Test with seed data first

## License

Part of SeshNx project. See main project LICENSE.
