# Using Convex Booking Functions in React Components

Examples of how to use studios, rooms, bookings, and payments features.

---

## 1. Studio Search and Listing

```typescript
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useState } from 'react';

function StudioSearch() {
  const [searchParams, setSearchParams] = useState({
    searchQuery: '',
    city: '',
    minHourlyRate: undefined,
    maxHourlyRate: undefined,
    amenities: [],
  });

  const studios = useQuery(api.bookings.searchStudios, {
    ...searchParams,
    limit: 20,
  });

  return (
    <div className="studio-search">
      {/* Search Filters */}
      <input
        type="text"
        placeholder="Search studios..."
        value={searchParams.searchQuery}
        onChange={(e) => setSearchParams({
          ...searchParams,
          searchQuery: e.target.value
        })}
      />

      <input
        type="text"
        placeholder="City"
        value={searchParams.city}
        onChange={(e) => setSearchParams({
          ...searchParams,
          city: e.target.value
        })}
      />

      <div className="amenities-filter">
        {['Vocal Booth', 'Live Room', 'Control Room', 'Equipment'].map((amenity) => (
          <label key={amenity}>
            <input
              type="checkbox"
              checked={searchParams.amenities.includes(amenity)}
              onChange={(e) => {
                const amenities = e.target.checked
                  ? [...searchParams.amenities, amenity]
                  : searchParams.amenities.filter(a => a !== amenity);
                setSearchParams({ ...searchParams, amenities });
              }}
            />
            {amenity}
          </label>
        ))}
      </div>

      {/* Results */}
      <div className="studios-grid">
        {studios?.map((studio) => (
          <StudioCard key={studio._id} studio={studio} />
        ))}
      </div>
    </div>
  );
}

function StudioCard({ studio }: { studio: any }) {
  return (
    <div className="studio-card">
      {studio.photos && studio.photos.length > 0 && (
        <img src={studio.photos[0]} alt={studio.name} />
      )}

      <h3>{studio.name}</h3>
      <p>{studio.description}</p>

      <div className="location">
        <span>{studio.city}, {studio.state}</span>
      </div>

      <div className="price">
        <span>${studio.minHourlyRate} - ${studio.maxHourlyRate}/hour</span>
      </div>

      {studio.amenities && studio.amenities.length > 0 && (
        <div className="amenities">
          {studio.amenities.slice(0, 3).map((amenity) => (
            <span key={amenity} className="amenity-tag">
              {amenity}
            </span>
          ))}
        </div>
      )}

      <button onClick={() => {/* Navigate to studio details */}}>
        View Details
      </button>
    </div>
  );
}
```

---

## 2. Studio Details and Room Listing

```typescript
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

function StudioDetails({ studioId }: { studioId: Id<"studios"> }) {
  const studio = useQuery(api.bookings.getStudioById, { studioId });
  const rooms = useQuery(api.bookings.getRoomsByStudio, { studioId });

  if (studio === undefined) return <div>Loading...</div>;
  if (studio === null) return <div>Studio not found</div>;

  return (
    <div className="studio-details">
      {/* Gallery */}
      {studio.photos && studio.photos.length > 0 && (
        <div className="gallery">
          {studio.photos.map((photo, index) => (
            <img key={index} src={photo} alt={`${studio.name} photo ${index + 1}`} />
          ))}
        </div>
      )}

      {/* Info */}
      <h1>{studio.name}</h1>
      <p>{studio.description}</p>

      <div className="details-grid">
        <div className="detail-item">
          <span className="label">Address:</span>
          <span>{studio.address}, {studio.city}, {studio.state} {studio.zipCode}</span>
        </div>

        {studio.phone && (
          <div className="detail-item">
            <span className="label">Phone:</span>
            <span>{studio.phone}</span>
          </div>
        )}

        {studio.email && (
          <div className="detail-item">
            <span className="label">Email:</span>
            <span>{studio.email}</span>
          </div>
        )}

        <div className="detail-item">
          <span className="label">Rate:</span>
          <span>${studio.minHourlyRate} - ${studio.maxHourlyRate}/hour</span>
        </div>
      </div>

      {/* Amenities */}
      {studio.amenities && studio.amenities.length > 0 && (
        <div className="amenities">
          <h3>Amenities</h3>
          <ul>
            {studio.amenities.map((amenity) => (
              <li key={amenity}>{amenity}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Policies */}
      {studio.cancellationPolicy && (
        <div className="policy">
          <h3>Cancellation Policy</h3>
          <p>{studio.cancellationPolicy}</p>
        </div>
      )}

      {/* Rooms */}
      <div className="rooms-section">
        <h2>Rooms</h2>
        <div className="rooms-grid">
          {rooms?.map((room) => (
            <RoomCard key={room._id} room={room} studioId={studioId} />
          ))}
        </div>
      </div>
    </div>
  );
}

function RoomCard({ room, studioId }: {
  room: any;
  studioId: Id<"studios">;
}) {
  return (
    <div className="room-card">
      {room.photos && room.photos.length > 0 && (
        <img src={room.photos[0]} alt={room.name} />
      )}

      <h3>{room.name}</h3>
      <p>{room.description}</p>

      <div className="room-details">
        <span>Capacity: {room.capacity} people</span>
        {room.size && <span>Size: {room.size} sq ft</span>}
        <span className="price">${room.hourlyRate}/hour</span>
      </div>

      {room.equipment && room.equipment.length > 0 && (
        <div className="equipment">
          <strong>Equipment:</strong>
          <ul>
            {room.equipment.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      <button onClick={() => {/* Open booking modal */}}>
        Book This Room
      </button>
    </div>
  );
}
```

---

## 3. Booking Creation with Availability Check

```typescript
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useState } from 'react';

function BookingForm({ roomId, studioId, userId }: {
  roomId: Id<"rooms">;
  studioId: Id<"studios">;
  userId: string;
}) {
  const createBooking = useMutation(api.bookings.createBooking);

  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    numberOfPeople: 1,
    purpose: '',
    specialRequests: '',
  });

  const [isChecking, setIsChecking] = useState(false);

  // Check availability
  const availableRooms = useQuery(api.bookings.getAvailableRooms, {
    studioId,
    date: formData.date,
    startTime: formData.startTime,
    endTime: formData.endTime,
    minCapacity: formData.numberOfPeople,
  });

  const isAvailable = availableRooms?.some(r => r._id === roomId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAvailable) {
      alert('This room is not available for the selected time slot');
      return;
    }

    try {
      // Get room details for pricing
      const room = availableRooms?.find(r => r._id === roomId);
      if (!room) return;

      // Calculate duration and total amount
      const [startHours, startMinutes] = formData.startTime.split(':').map(Number);
      const [endHours, endMinutes] = formData.endTime.split(':').map(Number);
      const durationHours = (endHours - startHours) + (endMinutes - startMinutes) / 60;
      const totalAmount = Math.round(durationHours * room.hourlyRate);

      await createBooking({
        studioId,
        roomId,
        clientId: userId,
        clientName: 'Client Name', // Get from user profile
        clientEmail: 'client@example.com', // Get from user profile
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        numberOfPeople: formData.numberOfPeople,
        purpose: formData.purpose || undefined,
        specialRequests: formData.specialRequests || undefined,
        totalAmount,
        depositAmount: Math.round(totalAmount * 0.2), // 20% deposit
        depositRequired: true,
      });

      alert('Booking created! Please pay the deposit to confirm.');
      // Reset form or navigate to payment
    } catch (error) {
      console.error('Booking failed:', error);
      alert('Failed to create booking. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="booking-form">
      <h2>Book This Room</h2>

      <div className="form-group">
        <label>Date</label>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          min={new Date().toISOString().split('T')[0]}
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Start Time</label>
          <input
            type="time"
            value={formData.startTime}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>End Time</label>
          <input
            type="time"
            value={formData.endTime}
            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label>Number of People</label>
        <input
          type="number"
          min="1"
          value={formData.numberOfPeople}
          onChange={(e) => setFormData({
            ...formData,
            numberOfPeople: parseInt(e.target.value)
          })}
          required
        />
      </div>

      <div className="form-group">
        <label>Purpose</label>
        <input
          type="text"
          placeholder="e.g., Recording session, rehearsal"
          value={formData.purpose}
          onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label>Special Requests</label>
        <textarea
          placeholder="Any special requirements..."
          value={formData.specialRequests}
          onChange={(e) => setFormData({
            ...formData,
            specialRequests: e.target.value
          })}
        />
      </div>

      {/* Availability Status */}
      {formData.date && formData.startTime && formData.endTime && (
        <div className={`availability-status ${isAvailable ? 'available' : 'unavailable'}`}>
          {isAvailable ? '✓ Available' : '✗ Not available'}
        </div>
      )}

      <button
        type="submit"
        disabled={!isAvailable}
        className={!isAvailable ? 'disabled' : ''}
      >
        Request Booking
      </button>
    </form>
  );
}
```

---

## 4. Studio Owner Dashboard

```typescript
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useState } from 'react';

function StudioOwnerDashboard({ ownerId }: { ownerId: string }) {
  const studios = useQuery(api.bookings.getStudiosByOwner, { ownerId });
  const confirmBooking = useMutation(api.bookings.confirmBooking);
  const startBooking = useMutation(api.bookings.startBooking);
  const completeBooking = useMutation(api.bookings.completeBooking);

  if (!studios) return <div>Loading...</div>;

  return (
    <div className="studio-dashboard">
      <h1>My Studios</h1>

      {studios.map((studio) => (
        <StudioBookings
          key={studio._id}
          studioId={studio._id}
          studioName={studio.name}
          onConfirm={confirmBooking}
          onStart={startBooking}
          onComplete={completeBooking}
        />
      ))}
    </div>
  );
}

function StudioBookings({
  studioId,
  studioName,
  onConfirm,
  onStart,
  onComplete
}: {
  studioId: Id<"studios">;
  studioName: string;
  onConfirm: any;
  onStart: any;
  onComplete: any;
}) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'inProgress'>('all');

  const bookings = useQuery(api.bookings.getBookingsByStudio, {
    studioId,
    status: filter === 'all' ? undefined : filter,
    limit: 50,
  });

  return (
    <div className="studio-bookings">
      <h2>{studioName}</h2>

      <div className="filters">
        <button onClick={() => setFilter('all')} className={filter === 'all' ? 'active' : ''}>
          All
        </button>
        <button onClick={() => setFilter('pending')} className={filter === 'pending' ? 'active' : ''}>
          Pending
        </button>
        <button onClick={() => setFilter('confirmed')} className={filter === 'confirmed' ? 'active' : ''}>
          Confirmed
        </button>
        <button onClick={() => setFilter('inProgress')} className={filter === 'inProgress' ? 'active' : ''}>
          In Progress
        </button>
      </div>

      <div className="bookings-list">
        {bookings?.map((booking) => (
          <BookingCard
            key={booking._id}
            booking={booking}
            onConfirm={() => onConfirm({ bookingId: booking._id })}
            onStart={() => onStart({ bookingId: booking._id })}
            onComplete={() => onComplete({ bookingId: booking._id })}
          />
        ))}
      </div>
    </div>
  );
}

function BookingCard({
  booking,
  onConfirm,
  onStart,
  onComplete
}: {
  booking: any;
  onConfirm: () => void;
  onStart: () => void;
  onComplete: () => void;
}) {
  return (
    <div className={`booking-card status-${booking.status.toLowerCase()}`}>
      <div className="booking-info">
        <h3>{booking.clientName}</h3>
        <p>{booking.date}</p>
        <p>{booking.startTime} - {booking.endTime}</p>
        {booking.purpose && <p>Purpose: {booking.purpose}</p>}
        {booking.specialRequests && <p>Notes: {booking.specialRequests}</p>}
        <p className="amount">${booking.totalAmount}</p>
        <p className="payment-status">{booking.paymentStatus}</p>
      </div>

      <div className="booking-actions">
        {booking.status === 'Pending' && (
          <button onClick={onConfirm}>Confirm Booking</button>
        )}
        {booking.status === 'Confirmed' && (
          <button onClick={onStart}>Start Session</button>
        )}
        {booking.status === 'InProgress' && (
          <button onClick={onComplete}>Complete Session</button>
        )}
      </div>
    </div>
  );
}
```

---

## 5. Client My Bookings

```typescript
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useState } from 'react';

function MyBookings({ clientId }: { clientId: string }) {
  const [tab, setTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');

  const upcomingBookings = useQuery(api.bookings.getUpcomingBookings, {
    clientId,
    limit: 20,
  });

  const pastBookings = useQuery(api.bookings.getBookingsByClient, {
    clientId,
    status: 'Completed',
    limit: 20,
  });

  const cancelledBookings = useQuery(api.bookings.getBookingsByClient, {
    clientId,
    status: 'Cancelled',
    limit: 20,
  });

  const bookings = tab === 'upcoming'
    ? upcomingBookings
    : tab === 'past'
    ? pastBookings
    : cancelledBookings;

  return (
    <div className="my-bookings">
      <h1>My Bookings</h1>

      <div className="tabs">
        <button onClick={() => setTab('upcoming')} className={tab === 'upcoming' ? 'active' : ''}>
          Upcoming
        </button>
        <button onClick={() => setTab('past')} className={tab === 'past' ? 'active' : ''}>
          Past
        </button>
        <button onClick={() => setTab('cancelled')} className={tab === 'cancelled' ? 'active' : ''}>
          Cancelled
        </button>
      </div>

      <div className="bookings-list">
        {bookings?.map((booking) => (
          <ClientBookingCard key={booking._id} booking={booking} clientId={clientId} />
        ))}

        {bookings?.length === 0 && (
          <p>No {tab} bookings</p>
        )}
      </div>
    </div>
  );
}

function ClientBookingCard({ booking, clientId }: {
  booking: any;
  clientId: string;
}) {
  const payments = useQuery(api.bookings.getPaymentsByBooking, {
    bookingId: booking._id,
  });

  const totalPaid = payments
    ?.filter(p => p.status === 'Completed')
    .reduce((sum, p) => sum + p.amount, 0) || 0;

  const remainingAmount = booking.totalAmount - totalPaid;

  return (
    <div className={`booking-card status-${booking.status.toLowerCase()}`}>
      <div className="booking-info">
        <h3>Studio Booking</h3>
        <p>{booking.date}</p>
        <p>{booking.startTime} - {booking.endTime}</p>
        {booking.purpose && <p>Purpose: {booking.purpose}</p>}

        <div className="amount">
          <p>Total: ${booking.totalAmount}</p>
          <p>Paid: ${totalPaid}</p>
          {remainingAmount > 0 && <p>Remaining: ${remainingAmount}</p>}
        </div>

        <div className="status">
          <span className={`status-badge ${booking.status.toLowerCase()}`}>
            {booking.status}
          </span>
          <span className={`payment-status-badge ${booking.paymentStatus.toLowerCase().replace(' ', '-')}`}>
            {booking.paymentStatus}
          </span>
        </div>
      </div>

      {remainingAmount > 0 && booking.status !== 'Cancelled' && (
        <button onClick={() => {/* Navigate to payment */}}>
          Pay ${remainingAmount}
        </button>
      )}
    </div>
  );
}
```

---

## 6. Payment Processing

```typescript
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

function PaymentForm({ bookingId, amount }: {
  bookingId: Id<"bookings">;
  amount: number;
}) {
  const createPayment = useMutation(api.bookings.createPayment);
  const updatePaymentStatus = useMutation(api.bookings.updatePaymentStatus);

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      // Create payment record
      const result = await createPayment({
        bookingId,
        amount,
        paymentMethod,
        paymentType: 'remainder', // or 'deposit'
      });

      // Process payment with Stripe (example)
      // const stripeResult = await processStripePayment(amount, paymentMethod);

      // Simulate payment success
      await updatePaymentStatus({
        paymentId: result.paymentId,
        status: 'Completed',
      });

      alert('Payment successful!');
    } catch (error) {
      console.error('Payment failed:', error);

      // Mark as failed
      if (result?.paymentId) {
        await updatePaymentStatus({
          paymentId: result.paymentId,
          status: 'Failed',
          failureReason: 'Payment declined',
        });
      }

      alert('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="payment-form">
      <h3>Complete Payment</h3>
      <p className="amount">Amount: ${amount}</p>

      <div className="payment-methods">
        <label>
          <input
            type="radio"
            value="card"
            checked={paymentMethod === 'card'}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
          Credit/Debit Card
        </label>
        <label>
          <input
            type="radio"
            value="transfer"
            checked={paymentMethod === 'transfer'}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
          Bank Transfer
        </label>
        <label>
          <input
            type="radio"
            value="cash"
            checked={paymentMethod === 'cash'}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
          Cash (pay at studio)
        </label>
      </div>

      <button
        onClick={handlePayment}
        disabled={isProcessing}
      >
        {isProcessing ? 'Processing...' : `Pay $${amount}`}
      </button>
    </div>
  );
}
```

---

## 7. Manage Blocked Dates

```typescript
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

function BlockedDatesManager({ studioId }: {
  studioId: Id<"studios">;
}) {
  const blockedDates = useQuery(api.bookings.getBlockedDates, {
    studioId,
  });

  const addBlockedDate = useMutation(api.bookings.addBlockedDate);
  const removeBlockedDate = useMutation(api.bookings.removeBlockedDate);

  const [newBlock, setNewBlock] = useState({
    startDate: '',
    endDate: '',
    reason: '',
    recurring: false,
  });

  const handleAddBlock = async () => {
    try {
      await addBlockedDate({
        studioId,
        startDate: newBlock.startDate,
        endDate: newBlock.endDate,
        reason: newBlock.reason || undefined,
        recurring: newBlock.recurring,
      });

      setNewBlock({
        startDate: '',
        endDate: '',
        reason: '',
        recurring: false,
      });
    } catch (error) {
      console.error('Failed to add blocked date:', error);
    }
  };

  return (
    <div className="blocked-dates-manager">
      <h3>Blocked Dates</h3>

      {/* Add Blocked Date Form */}
      <div className="add-block-form">
        <input
          type="date"
          value={newBlock.startDate}
          onChange={(e) => setNewBlock({ ...newBlock, startDate: e.target.value })}
          required
        />
        <input
          type="date"
          value={newBlock.endDate}
          onChange={(e) => setNewBlock({ ...newBlock, endDate: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Reason (optional)"
          value={newBlock.reason}
          onChange={(e) => setNewBlock({ ...newBlock, reason: e.target.value })}
        />
        <label>
          <input
            type="checkbox"
            checked={newBlock.recurring}
            onChange={(e) => setNewBlock({ ...newBlock, recurring: e.target.checked })}
          />
          Recurring
        </label>
        <button onClick={handleAddBlock}>Block Dates</button>
      </div>

      {/* Blocked Dates List */}
      <div className="blocked-dates-list">
        {blockedDates?.map((block) => (
          <div key={block._id} className="blocked-date-item">
            <span>
              {block.startDate} - {block.endDate}
            </span>
            {block.reason && <span>{block.reason}</span>}
            {block.recurring && <span className="recurring-badge">Recurring</span>}
            <button onClick={() => removeBlockedDate({ blockedDateId: block._id })}>
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Common Patterns

### Loading States
```typescript
const studio = useQuery(api.bookings.getStudioById, { studioId });

if (studio === undefined) return <div>Loading...</div>;
if (studio === null) return <div>Studio not found</div>;
```

### Error Handling
```typescript
const createBooking = useMutation(api.bookings.createBooking);

const handleSubmit = async () => {
  try {
    await createBooking({ /* ... */ });
    alert('Booking created!');
  } catch (error) {
    console.error('Booking failed:', error);
    alert('Failed to create booking. Please try again.');
  }
};
```

### Date Formatting
```typescript
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatTime = (timeString: string) => {
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};
```

---

## Next Steps

1. ✅ Booking functions created
2. ⏳ Use in your components
3. ⏳ Add Stripe integration for payments
4. ⏳ Add calendar view for availability
5. ⏳ Add email notifications for bookings

All your booking features are ready to go! 🎉
