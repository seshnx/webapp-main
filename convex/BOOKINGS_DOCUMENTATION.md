# SeshNx Bookings System - Complete Documentation

## Overview

The SeshNx Bookings System is a comprehensive studio booking and management platform built on Convex for real-time performance. It enables music creators to discover, book, and manage recording studio sessions with secure payment processing and advanced scheduling features.

## Architecture

### Database Schema (Convex)

**Core Tables:**
- `studios` - Studio profiles with media, equipment, amenities
- `rooms` - Individual rooms within studios
- `bookings` - Booking records with status and payment tracking
- `payments` - Payment transactions and history
- `blockedDates` - Unavailable date ranges
- `reviews` - User reviews and ratings

## Core Features

### 1. Studio Management

#### Create Studio
```typescript
const studioId = await ctx.runMutation(api.bookings.createStudio, {
  name: "Sunset Recording Studio",
  ownerId: user.clerkId,
  address: {
    street: "123 Music Lane",
    city: "Los Angeles",
    state: "CA",
    zipCode: "90001",
    country: "USA",
  },
  description: "Professional recording studio with vintage equipment",
  photos: ["https://example.com/photo1.jpg"],
  videos: ["https://example.com/tour.mp4"],
  equipment: ["Neumann U87", "API 1608 Console", "Pultec EQ"],
  amenities: ["Soundproof", "AC", "Parking", "Lounge"],
  pricing: {
    hourly: 100,
    daily: 800,
    custom: {
      "half_day": 400,
      "weekend": 1200,
    },
  },
  contactInfo: {
    email: "studio@example.com",
    phone: "+1234567890",
    website: "https://example.com",
  },
});

// Returns: studioId
```

#### Studio Fields
- **name** - Studio name
- **ownerId** - Owner's Clerk ID
- **address** - Full address object
- **description** - Studio description
- **photos** - Array of photo URLs
- **videos** - Array of video URLs
- **equipment** - List of equipment
- **amenities** - List of amenities
- **pricing** - Pricing structure (hourly, daily, custom)
- **contactInfo** - Contact details

#### Update Studio
```typescript
await ctx.runMutation(api.bookings.updateStudio, {
  studioId: studioId,
  updates: {
    description: "Updated description",
    pricing: {
      hourly: 120,
      daily: 900,
    },
  },
});
```

#### Studio Search
```typescript
// Search by name or location
const studios = await ctx.runQuery(api.bookings.searchStudios, {
  searchQuery: "recording studio",
  location: "Los Angeles",
  limit: 20,
});

// Returns array of matching studios
```

### 2. Room Management

#### Create Room
```typescript
const roomId = await ctx.runMutation(api.bookings.createRoom, {
  studioId: studioId,
  name: "Studio A",
  description: "Main recording room",
  capacity: 10,
  size: 500, // sq ft
  equipment: ["Console", "Monitors", "Microphones"],
  hourlyRate: 100,
  status: "active",
});

// Returns: roomId
```

#### Room Fields
- **studioId** - Parent studio ID
- **name** - Room name
- **description** - Room description
- **capacity** - Max occupancy
- **size** - Room size in sq ft
- **equipment** - Equipment list
- **hourlyRate** - Hourly rate
- **status** - active/inactive/maintenance

#### Check Availability
```typescript
const available = await ctx.runQuery(api.bookings.checkRoomAvailability, {
  roomId: roomId,
  startTime: Date.now() + 86400000, // Tomorrow
  endTime: Date.now() + 90000000,    // Tomorrow + 1 hour
});

// Returns: { available: true/false, conflictingBookings: [] }
```

#### Get Rooms by Studio
```typescript
const rooms = await ctx.runQuery(api.bookings.getRoomsByStudio, {
  studioId: studioId,
});

// Returns array of rooms
```

### 3. Booking System

#### Create Booking
```typescript
const bookingId = await ctx.runMutation(api.bookings.createBooking, {
  studioId: studioId,
  roomId: roomId,
  userId: user.clerkId,
  startTime: Date.now() + 86400000,
  endTime: Date.now() + 90000000,
  status: "Pending",
  attendeeCount: 5,
  specialRequirements: "Need vocal booth isolation",
  projectType: "Music Recording",
  notes: "Bring own instruments",
});

// Returns: bookingId
```

#### Booking States
- **Pending** - Initial state, awaiting confirmation
- **Confirmed** - Deposit paid, booking confirmed
- **InProgress** - Session in progress
- **Completed** - Session finished, full payment processed
- **Cancelled** - Booking cancelled by user or studio

#### Update Booking
```typescript
await ctx.runMutation(api.bookings.updateBooking, {
  bookingId: bookingId,
  updates: {
    attendeeCount: 8,
    specialRequirements: "Updated requirements",
  },
});
```

#### Cancel Booking
```typescript
await ctx.runMutation(api.bookings.cancelBooking, {
  bookingId: bookingId,
  userId: user.clerkId,
  reason: "Schedule conflict",
});

// Returns: { success: true, refunded: true }
```

#### Check Booking Conflicts
```typescript
const hasConflict = await ctx.runQuery(api.bookings.checkBookingConflict, {
  roomId: roomId,
  startTime: Date.now() + 86400000,
  endTime: Date.now() + 90000000,
  excludeBookingId: existingBookingId, // Optional
});

// Returns: true if conflict exists
```

### 4. Payment Processing

#### Process Deposit Payment
```typescript
const payment = await ctx.runMutation(api.bookings.processDepositPayment, {
  bookingId: bookingId,
  userId: user.clerkId,
  amount: 100, // Deposit amount
  paymentMethod: "credit_card",
  transactionId: "txn_12345",
});

// Returns: paymentId
```

#### Process Full Payment
```typescript
const payment = await ctx.runMutation(api.bookings.processFullPayment, {
  bookingId: bookingId,
  userId: user.clerkId,
  amount: 400, // Full amount
  paymentMethod: "credit_card",
  transactionId: "txn_67890",
});

// Returns: paymentId
```

#### Payment Methods
- **credit_card** - Credit/debit card
- **paypal** - PayPal
- **bank_transfer** - Bank transfer
- **cash** - Cash payment
- **other** - Other methods

#### Refund Payment
```typescript
const refunded = await ctx.runMutation(api.bookings.refundPayment, {
  paymentId: paymentId,
  userId: user.clerkId,
  amount: 100,
  reason: "Booking cancelled",
});

// Returns: { success: true, refundId: "..." }
```

#### Get Payments by Booking
```typescript
const payments = await ctx.runQuery(api.bookings.getPaymentsByBooking, {
  bookingId: bookingId,
});

// Returns array of payments
```

### 5. Blocked Dates

#### Block Date Range
```typescript
await ctx.runMutation(api.bookings.blockDate, {
  studioId: studioId,
  roomId: roomId, // Optional - blocks entire studio if omitted
  startDate: Date.now() + 86400000,
  endDate: Date.now() + 172800000,
  reason: "Maintenance",
  recurring: {
    frequency: "weekly", // daily, weekly, monthly
    endDate: Date.now() + 2592000000, // Optional end date
  },
});
```

#### Unblock Date
```typescript
await ctx.runMutation(api.bookings.unblockDate, {
  blockId: blockId,
});
```

#### Get Blocked Dates
```typescript
const blockedDates = await ctx.runQuery(api.bookings.getBlockedDates, {
  studioId: studioId,
  roomId: roomId, // Optional
  startDate: Date.now(),
  endDate: Date.now() + 2592000000, // 30 days out
});

// Returns array of blocked date ranges
```

### 6. Reviews & Ratings

#### Submit Review
```typescript
const reviewId = await ctx.runMutation(api.bookings.submitReview, {
  bookingId: bookingId,
  userId: user.clerkId,
  studioId: studioId,
  rating: 5,
  comment: "Amazing studio! Great equipment and helpful staff.",
});

// Returns: reviewId
```

#### Rating Scale
- **5** - Excellent
- **4** - Good
- **3** - Average
- **2** - Poor
- **1** - Terrible

#### Update Review
```typescript
await ctx.runMutation(api.bookings.updateReview, {
  reviewId: reviewId,
  userId: user.clerkId,
  rating: 4,
  comment: "Updated review text",
});
```

#### Get Reviews by Studio
```typescript
const reviews = await ctx.runQuery(api.bookings.getReviewsByStudio, {
  studioId: studioId,
  limit: 20,
});

// Returns array of reviews with user info
```

#### Get Average Rating
```typescript
const avgRating = await ctx.runQuery(api.bookings.getAverageRating, {
  studioId: studioId,
});

// Returns: { rating: 4.5, count: 20 }
```

### 7. Studio Statistics

#### Get Studio Statistics
```typescript
const stats = await ctx.runQuery(api.bookings.getStudioStats, {
  studioId: studioId,
});

// Returns:
// {
//   totalBookings: 150,
//   totalRevenue: 45000,
//   averageRating: 4.5,
//   totalReviews: 80,
//   roomUtilization: 0.75,
//   cancellationRate: 0.05,
//   popularRooms: [{ roomId: "...", bookingCount: 50 }],
//   revenueByPeriod: [{ period: "2024-01", revenue: 5000 }]
// }
```

## API Reference

### Studio API

#### Queries
- `getStudio` - Get studio by ID
- `getStudios` - Get all studios
- `searchStudios` - Search by name/location
- `getStudioStats` - Studio statistics

#### Mutations
- `createStudio` - Create new studio
- `updateStudio` - Update studio details
- `deleteStudio` - Remove studio
- `addStudioMedia` - Add photo/video
- `removeStudioMedia` - Remove media
- `updateStudioMediaOrder` - Reorder media
- `setStudioCoverImage` - Set cover photo

### Room API

#### Queries
- `getRoom` - Get room by ID
- `getRoomsByStudio` - Get all studio rooms
- `checkRoomAvailability` - Check availability

#### Mutations
- `createRoom` - Add room to studio
- `updateRoom` - Update room details
- `deleteRoom` - Remove room
- `updateRoomStatus` - Update room status

### Booking API

#### Queries
- `getBooking` - Get booking by ID
- `getBookingsByUser` - User's bookings
- `getBookingsByStudio` - Studio's bookings
- `getBookingsByRoom` - Room's bookings
- `checkBookingConflict` - Check for conflicts

#### Mutations
- `createBooking` - Create new booking
- `updateBooking` - Modify booking
- `cancelBooking` - Cancel booking
- `updateBookingStatus` - Update status

### Payment API

#### Queries
- `getPaymentsByBooking` - Booking payments
- `getPaymentsByUser` - User's payments
- `getPayment` - Get payment by ID

#### Mutations
- `processDepositPayment` - Process deposit
- `processFullPayment` - Process full payment
- `refundPayment` - Process refund
- `updatePaymentStatus` - Update status

### Blocked Dates API

#### Queries
- `getBlockedDates` - Get blocked dates
- `checkDateAvailability` - Check availability

#### Mutations
- `blockDate` - Block date range
- `unblockDate` - Unblock date
- `blockRecurringDates` - Block recurring

### Reviews API

#### Queries
- `getReviewsByStudio` - Studio reviews
- `getReviewsByUser` - User's reviews
- `getAverageRating` - Average rating

#### Mutations
- `submitReview` - Submit review
- `updateReview` - Update review
- `deleteReview` - Delete review

## Real-Time Features

### WebSocket Subscriptions
All queries support real-time updates via Convex's WebSocket layer:
```typescript
// Automatic updates when bookings change
const bookings = useQuery(api.bookings.getBookingsByUser, {
  userId: user.clerkId,
});

// Real-time availability updates
const available = useQuery(api.bookings.checkRoomAvailability, {
  roomId: roomId,
  startTime: startTime,
  endTime: endTime,
});

// Live statistics
const stats = useQuery(api.bookings.getStudioStats, {
  studioId: studioId,
});
```

## File Structure

```
convex/
├── bookings.ts           # Studio & booking system (934 lines)
│   ├── Studio CRUD operations
│   ├── Room management
│   ├── Booking workflow
│   ├── Payment processing
│   ├── Blocked dates
│   ├── Reviews & ratings
│   └── Statistics & analytics
│
└── broadcasts.ts         # Broadcast system (645 lines)
    ├── Announcement creation
    ├── Target management
    ├── Scheduling
    ├── Read tracking
    └── Analytics
```

## Performance Optimizations

### Indexing Strategy
- `by_owner` - Studio owner lookup
- `by_studio` - Room and booking lookup
- `by_room` - Room-specific bookings
- `by_user` - User's bookings
- `by_dates` - Date range queries
- `by_status` - Status filtering

### Pagination
All list queries support:
- `limit` - Results per page (default: 20)
- `skip` - Offset for pagination

### Caching
- Real-time subscriptions eliminate cache invalidation
- Convex handles automatic updates
- No manual cache management needed

## Security & Validation

### Access Control
- Studio ownership verification for updates
- Booking ownership checks for modifications
- User permission validation
- Payment authorization

### Data Validation
- Date range validation
- Time slot validation
- Capacity enforcement
- Payment amount verification
- Status transition rules

## Best Practices

### Creating Studios
1. Always include complete address information
2. Upload high-quality photos and videos
3. List all equipment and amenities
4. Set competitive pricing
5. Provide accurate contact information

### Managing Bookings
1. Always check availability before booking
2. Validate date ranges
3. Confirm capacity requirements
4. Track special requirements
5. Monitor booking status changes

### Processing Payments
1. Verify payment amounts
2. Use secure payment methods
3. Track transaction IDs
4. Handle refunds promptly
5. Maintain payment history

### Handling Reviews
1. Encourage honest feedback
2. Respond to reviews professionally
3. Monitor ratings trends
4. Address negative feedback
5. Showcase positive reviews

## Integration Examples

### React Component - Booking Flow
```typescript
function BookingFlow({ studioId, roomId, user }) {
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const createBooking = useMutation(api.bookings.createBooking);
  const processDeposit = useMutation(api.bookings.processDepositPayment);
  const checkAvailability = useQuery(api.bookings.checkRoomAvailability, {
    roomId,
    startTime,
    endTime,
  });

  const handleBook = async () => {
    if (!checkAvailability?.available) {
      alert("Room not available for selected dates");
      return;
    }

    const bookingId = await createBooking({
      studioId,
      roomId,
      userId: user.clerkId,
      startTime,
      endTime,
      status: "Pending",
      attendeeCount: 5,
    });

    await processDeposit({
      bookingId,
      userId: user.clerkId,
      amount: 100,
      paymentMethod: "credit_card",
    });
  };

  return (
    <div>
      <DateTimePicker
        onStart={setStartTime}
        onEnd={setEndTime}
      />
      <button onClick={handleBook}>Book Now</button>
    </div>
  );
}
```

### Studio Search Component
```typescript
function StudioSearch() {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const searchStudios = useQuery(api.bookings.searchStudios, {
    searchQuery: query,
    location: location,
    limit: 20,
  });

  return (
    <div>
      <input
        placeholder="Search studios..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <input
        placeholder="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />
      {searchStudios?.map(studio => (
        <StudioCard key={studio._id} studio={studio} />
      ))}
    </div>
  );
}
```

## Error Handling

### Common Errors
- **Room not available** - Selected time slot is booked
- **Invalid date range** - End time before start time
- **Capacity exceeded** - Too many attendees
- **Payment failed** - Invalid payment method
- **Booking not found** - Invalid booking ID
- **Unauthorized** - User doesn't have permission

### Error Handling Pattern
```typescript
try {
  const bookingId = await ctx.runMutation(api.bookings.createBooking, {
    studioId,
    roomId,
    userId: user.clerkId,
    startTime,
    endTime,
    status: "Pending",
    attendeeCount: 5,
  });
} catch (error) {
  if (error.message.includes("not available")) {
    alert("Room is not available for selected dates");
  } else if (error.message.includes("capacity")) {
    alert("Attendee count exceeds room capacity");
  } else {
    alert("Failed to create booking. Please try again.");
  }
}
```

## Future Enhancements

### Planned Features
- Calendar integration (Google, Outlook)
- Advanced scheduling (recurring bookings)
- Waiting list system
- Dynamic pricing
- Bundle packages
- Equipment rental add-ons
- Session recording services
- Backline rental
- Catering services
- Multi-room bookings
- Invoice generation
- Tax calculation
- Discount codes
- Loyalty program

### Performance Improvements
- Full-text search integration
- Geographic search optimization
- Availability caching
- Batch booking support
- Export functionality
- Advanced analytics dashboard

## Support & Documentation

For questions or issues:
1. Check this documentation
2. Review inline code comments
3. Examine similar existing functions
4. Test with Convex dashboard
5. Check schema definitions

## Changelog

### v1.0.0 (Current)
- Complete booking system
- Real-time availability
- Secure payment processing
- Review and rating system
- Advanced search and discovery
- Analytics and insights
- Blocked date management

---

Built with ❤️ using Convex for real-time booking features.
