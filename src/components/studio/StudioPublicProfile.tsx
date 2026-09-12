import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { useUser, useClerk } from '@clerk/react';
import { api } from '../../../convex/_generated/api';
import toast from 'react-hot-toast';
import {
  Star,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Calendar,
  Home,
  CheckCircle2,
  DollarSign,
  Layers,
  Shield,
  FileText,
  X,
  Loader2,
  LogIn,
  Send,
  User
} from 'lucide-react';
import StudioNotFound from './StudioNotFound';

interface StudioPublicProfileProps {
  /** Override slug (used by SubdomainRouter). Falls back to URL params. */
  slug?: string;
}

export default function StudioPublicProfile({ slug: slugProp }: StudioPublicProfileProps) {
  const { slug: slugParam } = useParams<{ slug: string }>();
  const slug = slugProp || slugParam;

  const { isSignedIn, user } = useUser();
  const clerk = useClerk();

  // Queries
  const studio = useQuery(
    api.studios.getStudioPublicProfile,
    slug ? { slug } : "skip"
  );

  const rooms = useQuery(
    api.sbookings.getRoomsByStudio,
    studio?._id ? { studioId: studio._id } : "skip"
  );

  // Mutations
  const createStudioBooking = useMutation(api.sbookings.createBooking);
  const createDirectClient = useMutation(api.studioManager.createClient);

  // Booking Modal State
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('12:00');
  const [durationHours, setDurationHours] = useState(2);
  const [serviceType, setServiceType] = useState('Recording');
  const [bookingMessage, setBookingMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Offline inquiry state (for non-signed-in visitors)
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [inquiryMode, setInquiryMode] = useState<'auth' | 'guest'>('auth');

  const studioUrl = useMemo(() => {
    return window.location.origin;
  }, []);

  const policies = studio?.policies;
  const currencySymbol = studio?.currency === 'EUR' ? '€' : studio?.currency === 'GBP' ? '£' : '$';

  // Calculate rate for booking modal
  const activeRate = useMemo(() => {
    if (selectedRoomId && rooms) {
      const room = rooms.find((r: any) => String(r._id) === selectedRoomId);
      if (room?.hourlyRate) return room.hourlyRate;
    }
    return studio?.hourlyRate || studio?.minHourlyRate || 0;
  }, [selectedRoomId, rooms, studio]);

  const estimatedTotal = useMemo(() => {
    return activeRate * durationHours;
  }, [activeRate, durationHours]);

  const handleOpenBooking = (roomId?: string) => {
    if (roomId) {
      setSelectedRoomId(roomId);
    } else if (rooms && rooms.length > 0) {
      setSelectedRoomId(String(rooms[0]._id));
    } else {
      setSelectedRoomId('');
    }
    setIsBookingOpen(true);
  };

  const handleCloseBooking = () => {
    setIsBookingOpen(false);
    setIsSubmitting(false);
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studio) return;

    if (!bookingDate || !bookingTime) {
      toast.error('Please select both a date and start time.');
      return;
    }

    if (durationHours < 1) {
      toast.error('Session duration must be at least 1 hour.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isSignedIn && user) {
        // Authenticated direct booking
        await createStudioBooking({
          studioId: studio._id,
          clientClerkId: user.id,
          roomId: selectedRoomId ? (selectedRoomId as any) : undefined,
          date: bookingDate,
          time: bookingTime,
          duration: Number(durationHours),
          serviceType,
          offerAmount: estimatedTotal,
          currency: studio.currency || 'USD',
          message: bookingMessage,
        });

        toast.success('Booking request submitted to studio!');
        handleCloseBooking();
      } else {
        // Guest inquiry submission
        if (!guestName || !guestEmail) {
          toast.error('Please provide your name and email address.');
          setIsSubmitting(false);
          return;
        }

        await createDirectClient({
          studioId: studio._id,
          name: guestName,
          email: guestEmail,
          phone: guestPhone || undefined,
          notes: `Public Booking Inquiry for ${bookingDate} at ${bookingTime} (${durationHours} hrs, ${serviceType}). Estimated: ${currencySymbol}${estimatedTotal}. Message: ${bookingMessage}`,
          tags: ['Public Inquiry', serviceType],
        });

        toast.success('Your booking inquiry has been sent! The studio will contact you shortly.');
        handleCloseBooking();
      }
    } catch (err: any) {
      console.error('Booking submission error:', err);
      toast.error(err.message || 'Failed to submit booking request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (studio === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-pulse text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Loading studio...</p>
        </div>
      </div>
    );
  }

  // Not found
  if (!studio || !slug) {
    return <StudioNotFound slug={slug} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100">
      {/* Hero Section */}
      <div className="relative">
        {studio.studioPhotos && studio.studioPhotos.length > 0 ? (
          <div className="h-96 md:h-[480px] overflow-hidden">
            <img
              src={studio.studioPhotos[0]}
              alt={`${studio.name} - Cover`}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="h-96 md:h-[480px] bg-gradient-to-r from-blue-600 to-indigo-700 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="text-6xl font-bold mb-2">{studio.name.charAt(0)}</div>
              <div className="text-xl font-semibold">Studio Profile</div>
            </div>
          </div>
        )}

        {/* Studio Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 md:p-8">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-2 drop-shadow-md">
                {studio.name}
              </h1>
              {studio.city && studio.state && (
                <div className="flex items-center text-white/90 text-sm md:text-base font-medium">
                  <MapPin className="w-4 h-4 mr-2 text-blue-400" />
                  <span>{studio.city}, {studio.state}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => handleOpenBooking()}
              className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all text-sm md:text-base shrink-0"
            >
              Book Session Now
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            {studio.description && (
              <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-500" />
                  About the Studio
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line text-sm md:text-base">
                  {studio.description}
                </p>
              </section>
            )}

            {/* Studio Rooms Section */}
            {rooms && rooms.length > 0 && (
              <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-purple-500" />
                    Available Rooms & Spaces ({rooms.length})
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {rooms.map((room: any) => (
                    <div
                      key={room._id}
                      className="p-5 bg-gray-50 dark:bg-gray-900/60 rounded-xl border dark:border-gray-700 hover:border-blue-500/50 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-base text-gray-900 dark:text-white">{room.name}</h3>
                          {room.hourlyRate && (
                            <span className="text-xs font-bold px-2 py-1 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-md shrink-0">
                              {currencySymbol}{room.hourlyRate}/hr
                            </span>
                          )}
                        </div>

                        {room.description && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                            {room.description}
                          </p>
                        )}

                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
                          {room.capacity && (
                            <span className="bg-white dark:bg-gray-800 px-2 py-0.5 rounded border dark:border-gray-700">
                              Cap: {room.capacity} people
                            </span>
                          )}
                          {room.amenities && room.amenities.map((am: string, i: number) => (
                            <span key={i} className="bg-white dark:bg-gray-800 px-2 py-0.5 rounded border dark:border-gray-700">
                              {am}
                            </span>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => handleOpenBooking(String(room._id))}
                        className="mt-4 w-full py-2 bg-blue-600/10 hover:bg-blue-600 hover:text-white text-blue-600 dark:text-blue-400 font-semibold rounded-lg text-xs transition-colors border border-blue-200 dark:border-blue-800"
                      >
                        Book This Space
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Studio Policies & Guidelines */}
            {policies && (
              <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border dark:border-gray-700 space-y-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-500" />
                  Studio Policies & Rules
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border dark:border-gray-700">
                    <span className="text-xs text-gray-500 dark:text-gray-400 block font-medium">Cancellation Policy</span>
                    <span className="text-sm font-bold capitalize text-gray-800 dark:text-gray-200">
                      {policies.cancellationPolicy || 'Standard'}
                    </span>
                    {policies.cancellationNoticeHours && (
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {policies.cancellationNoticeHours}h notice required
                      </p>
                    )}
                  </div>

                  <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border dark:border-gray-700">
                    <span className="text-xs text-gray-500 dark:text-gray-400 block font-medium">Deposit Required</span>
                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                      {policies.depositRequired ? `${policies.depositPercentage || 50}% Deposit` : 'No Deposit'}
                    </span>
                    <p className="text-[11px] text-gray-500 mt-0.5">Due at confirmation</p>
                  </div>

                  <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border dark:border-gray-700">
                    <span className="text-xs text-gray-500 dark:text-gray-400 block font-medium">Min. Booking Duration</span>
                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                      {policies.minBookingHours ? `${policies.minBookingHours} Hours` : '1 Hour'}
                    </span>
                    <p className="text-[11px] text-gray-500 mt-0.5">Per session</p>
                  </div>
                </div>

                {policies.houseRules && (
                  <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-900/40 rounded-lg border dark:border-gray-700">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">House Rules</h4>
                    <p className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                      {policies.houseRules}
                    </p>
                  </div>
                )}
              </section>
            )}

            {/* Amenities */}
            {studio.amenities && studio.amenities.length > 0 && (
              <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Studio Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {studio.amenities.map((amenity: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-center text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/60 rounded-lg p-3 text-xs md:text-sm font-medium"
                    >
                      <Star className="w-4 h-4 mr-2 text-amber-500 shrink-0" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Photo Gallery */}
            {studio.studioPhotos && studio.studioPhotos.length > 1 && (
              <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Gallery</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {studio.studioPhotos.slice(1, 7).map((photo: string, index: number) => (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden border dark:border-gray-700">
                      <img
                        src={photo}
                        alt={`${studio.name} - Photo ${index + 2}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing & Booking Card */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-lg p-6 text-white">
              <h3 className="text-lg font-bold mb-3">Rates & Booking</h3>
              <div className="mb-6">
                {studio.minHourlyRate && studio.maxHourlyRate ? (
                  <div>
                    <div className="text-3xl font-extrabold mb-1">
                      {currencySymbol}{studio.minHourlyRate} - {currencySymbol}{studio.maxHourlyRate}
                    </div>
                    <div className="text-blue-100 text-xs">per hour</div>
                  </div>
                ) : studio.hourlyRate ? (
                  <div>
                    <div className="text-3xl font-extrabold mb-1">
                      {currencySymbol}{studio.hourlyRate}
                    </div>
                    <div className="text-blue-100 text-xs">per hour</div>
                  </div>
                ) : (
                  <div className="text-blue-100 text-sm">Flexible room rates available</div>
                )}
              </div>

              <button
                onClick={() => handleOpenBooking()}
                className="w-full bg-white text-blue-600 font-bold py-3 rounded-xl hover:bg-gray-100 shadow-md transition-colors text-sm flex items-center justify-center gap-2"
              >
                <Calendar size={16} />
                <span>Reserve Session</span>
              </button>
            </div>

            {/* Contact Info */}
            {(studio.email || studio.phoneCell || studio.website || studio.hours) && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border dark:border-gray-700">
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">
                  Contact & Hours
                </h3>
                <div className="space-y-3 text-xs md:text-sm">
                  {studio.email && (
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <Mail className="w-4 h-4 mr-3 text-gray-400 shrink-0" />
                      <a href={`mailto:${studio.email}`} className="hover:text-blue-600 transition-colors truncate">
                        {studio.email}
                      </a>
                    </div>
                  )}
                  {studio.phoneCell && (
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <Phone className="w-4 h-4 mr-3 text-gray-400 shrink-0" />
                      <a href={`tel:${studio.phoneCell}`} className="hover:text-blue-600 transition-colors">
                        {studio.phoneCell}
                      </a>
                    </div>
                  )}
                  {studio.website && (
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <Globe className="w-4 h-4 mr-3 text-gray-400 shrink-0" />
                      <a href={studio.website} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors truncate">
                        Visit Website
                      </a>
                    </div>
                  )}
                  {studio.hours && (
                    <div className="flex items-start text-gray-600 dark:text-gray-300">
                      <Clock className="w-4 h-4 mr-3 text-gray-400 mt-0.5 shrink-0" />
                      <span>{studio.hours}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Location */}
            {studio.location && !studio.hideAddress && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border dark:border-gray-700">
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3">Location</h3>
                <div className="flex items-start text-gray-600 dark:text-gray-300 text-xs md:text-sm">
                  <MapPin className="w-4 h-4 mr-3 text-gray-400 mt-0.5 shrink-0" />
                  <span>{studio.location}</span>
                </div>
                {studio.city && studio.state && (
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 ml-7">
                    {studio.city}, {studio.state}
                  </div>
                )}
              </div>
            )}

            {/* Back to SeshNx */}
            <a
              href={studioUrl}
              className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 transition-colors text-xs font-medium py-2"
            >
              <Home className="w-4 h-4" />
              Return to SeshNx
            </a>
          </div>
        </div>
      </div>

      {/* Embedded Studio Booking Modal */}
      {isBookingOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[80] p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#2c2e36] w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50">
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                  Request Studio Session
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {studio.name} • {studio.city || 'Studio'}
                </p>
              </div>
              <button
                onClick={handleCloseBooking}
                className="w-8 h-8 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitBooking} className="p-5 space-y-4 overflow-y-auto">
              {/* Room Selection */}
              {rooms && rooms.length > 0 && (
                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 block">
                    Select Room / Space
                  </label>
                  <select
                    value={selectedRoomId}
                    onChange={(e) => setSelectedRoomId(e.target.value)}
                    className="w-full p-2.5 border rounded-xl dark:bg-[#1f2128] dark:border-gray-600 dark:text-white text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">General Studio Session</option>
                    {rooms.map((r: any) => (
                      <option key={r._id} value={String(r._id)}>
                        {r.name} {r.hourlyRate ? `(${currencySymbol}${r.hourlyRate}/hr)` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Date & Start Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 block">
                    Session Date *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 text-gray-400" size={15} />
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full pl-9 p-2 border rounded-xl dark:bg-[#1f2128] dark:border-gray-600 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 block">
                    Start Time *
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-2.5 text-gray-400" size={15} />
                    <input
                      type="time"
                      required
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className="w-full pl-9 p-2 border rounded-xl dark:bg-[#1f2128] dark:border-gray-600 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Duration & Service Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 block">
                    Duration (Hours) *
                  </label>
                  <input
                    type="number"
                    min={policies?.minBookingHours || 1}
                    max={24}
                    required
                    value={durationHours}
                    onChange={(e) => setDurationHours(Math.max(1, Number(e.target.value)))}
                    className="w-full p-2 border rounded-xl dark:bg-[#1f2128] dark:border-gray-600 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 block">
                    Service Type
                  </label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    className="w-full p-2 border rounded-xl dark:bg-[#1f2128] dark:border-gray-600 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="Recording">Recording</option>
                    <option value="Mixing">Mixing</option>
                    <option value="Mastering">Mastering</option>
                    <option value="Production">Production</option>
                    <option value="Rehearsal">Rehearsal</option>
                    <option value="Podcast">Podcast</option>
                    <option value="Writing Session">Writing Session</option>
                  </select>
                </div>
              </div>

              {/* Non-signed in guest details */}
              {!isSignedIn && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800/80 rounded-xl border dark:border-gray-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                      <User size={14} className="text-blue-500" />
                      Contact Information
                    </span>
                    <button
                      type="button"
                      onClick={() => clerk?.openSignIn ? clerk.openSignIn() : null}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1"
                    >
                      <LogIn size={12} /> Sign In
                    </button>
                  </div>

                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Your Full Name *"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full p-2 border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white text-xs"
                    />
                    <input
                      type="email"
                      placeholder="Your Email Address *"
                      required
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      className="w-full p-2 border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white text-xs"
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number (Optional)"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      className="w-full p-2 border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Message / Requirements */}
              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 block">
                  Session Notes & Requirements
                </label>
                <textarea
                  rows={3}
                  value={bookingMessage}
                  onChange={(e) => setBookingMessage(e.target.value)}
                  placeholder="Describe your project, gear requests, or specific session requirements..."
                  className="w-full p-2.5 border rounded-xl dark:bg-[#1f2128] dark:border-gray-600 dark:text-white text-xs resize-none focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Pricing Summary */}
              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-100 dark:border-blue-900/40 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Estimated Total</span>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    {durationHours} hrs @ {currencySymbol}{activeRate}/hr
                  </p>
                </div>
                <div className="text-xl font-extrabold text-blue-600 dark:text-blue-400">
                  {currencySymbol}{estimatedTotal}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCloseBooking}
                  className="w-1/3 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-2/3 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs shadow-md hover:shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      <Send size={14} />
                      <span>{isSignedIn ? 'Confirm Booking Request' : 'Send Booking Inquiry'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
