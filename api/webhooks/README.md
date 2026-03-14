# Convex Sync Webhooks

This directory contains webhook handlers that sync data changes from Neon/MongoDB to Convex for real-time updates.

## Overview

When data changes in your primary database (Neon/MongoDB), these webhooks are triggered to update Convex, which then pushes real-time updates to all connected clients via WebSocket subscriptions.

## Webhook Endpoints

### Master Webhook
- **URL**: `/api/webhooks/convex`
- **Methods**: `GET`, `POST`, `OPTIONS`
- **Purpose**: Routes all webhook events to appropriate handlers

### Category-Specific Webhooks
- `/api/webhooks/convex/bookings` - Booking events
- `/api/webhooks/convex/notifications` - Notification events
- `/api/webhooks/convex/comments` - Comment events

## Event Types

### Booking Events
- `booking.created` - New booking created
- `booking.updated` - Booking details updated
- `booking.status_changed` - Booking status changed
- `booking.deleted` - Booking deleted

### Notification Events
- `notification.created` - New notification created
- `notification.updated` - Notification updated
- `notification.read` - Notification marked as read
- `notification.all_read` - All notifications marked as read
- `notification.deleted` - Notification deleted

### Comment Events
- `comment.created` - New comment created
- `comment.updated` - Comment updated
- `comment.deleted` - Comment deleted
- `comment.reaction_updated` - Comment reaction count updated

## Usage

### Triggering Webhooks from Backend Code

```typescript
import { triggerBookingWebhook } from '@/utils/webhookTrigger';

// After creating a booking in Neon
await createBookingInNeon(bookingData);

// Trigger webhook to sync to Convex
await triggerBookingWebhook('booking.created', bookingData);
```

### Webhook Payload Format

```json
{
  "event": "booking.created",
  "data": {
    "id": "booking_123",
    "senderId": "user_456",
    "targetId": "studio_789",
    "status": "Pending",
    "serviceType": "Recording",
    "date": "2026-03-15",
    "time": "10:00",
    "duration": 4,
    "offerAmount": 200,
    "message": "I'd like to book your studio",
    "createdAt": 1678867200000
  }
}
```

## Authentication

Webhooks are secured using a shared secret:

1. Set `WEBHOOK_SECRET` environment variable
2. Include in requests: `Authorization: Bearer {WEBHOOK_SECRET}`

```bash
# .env.local
WEBHOOK_SECRET=your-secret-key-here
```

## Testing Webhooks

### Test the Master Webhook

```bash
curl -X POST http://localhost:3000/api/webhooks/convex \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-secret-key" \
  -d '{
    "event": "booking.created",
    "data": {
      "id": "test_123",
      "senderId": "user_456",
      "status": "Pending"
    }
  }'
```

### Test Health Check

```bash
curl http://localhost:3000/api/webhooks/convex
```

Expected response:
```json
{
  "status": "ok",
  "service": "convex-webhook",
  "timestamp": "2026-03-11T10:30:00.000Z"
}
```

## Integration Points

Add webhook triggers to these database operations:

1. **Booking Creation/Updates** (`src/config/neonQueries.ts`)
   - After `createBooking()`
   - After `updateBookingStatus()`
   - After `updateBooking()`

2. **Notification Creation** (`src/config/mongoSocial.ts`)
   - After `createSocialNotification()`
   - After `markAllNotificationsAsRead()`

3. **Comment Creation** (`src/config/mongoSocial.ts`)
   - After `createComment()`
   - After `updateComment()`
   - After `deleteComment()`

## Monitoring

Webhooks log all events to console:

```
[Convex Webhook] Received: booking.created
[Convex Webhook] Processing booking event
✅ Booking synced: booking_123
```

## Troubleshooting

### Webhooks Not Syncing

1. Check Convex is configured:
   ```bash
   echo $VITE_CONVEX_URL
   ```

2. Verify webhook secret matches

3. Check server logs for errors

### Real-time Updates Not Working

1. Run `npx convex dev` to generate types
2. Ensure Convex client is initialized
3. Check browser console for WebSocket connection errors

## Next Steps

1. Generate Convex types: `npx convex dev`
2. Implement actual Convex mutations in webhook handlers
3. Add webhook triggers to all database operations
4. Set up production webhook authentication
5. Monitor webhook delivery rates

## Architecture

```
┌─────────────────┐
│  Neon/MongoDB   │ (Primary Database)
└────────┬────────┘
         │ Database Operation
         ▼
┌─────────────────┐
│  Backend API    │ (Vercel API Routes)
└────────┬────────┘
         │ Webhook Trigger
         ▼
┌─────────────────┐
│ Convex Webhooks │ (This Directory)
└────────┬────────┘
         │ Mutation
         ▼
┌─────────────────┐
│     Convex      │ (Real-time Layer)
└────────┬────────┘
         │ WebSocket
         ▼
┌─────────────────┐
│   React App     │ (Real-time Updates)
└─────────────────┘
```
