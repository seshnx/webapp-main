import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Star, MapPin, Phone, Mail, Globe, Clock, Calendar, Home } from 'lucide-react';
import StudioNotFound from './StudioNotFound';

interface StudioPublicProfileProps {
  /** Override slug (used by SubdomainRouter). Falls back to URL params. */
  slug?: string;
}

const StudioPublicProfile: React.FC<StudioPublicProfileProps> = ({ slug: slugProp }) => {
  const { slug: slugParam } = useParams<{ slug: string }>();
  const slug = slugProp || slugParam;
  const studio = useQuery(
    api.studios.getStudioPublicProfile,
    slug ? { slug } : "skip"
  );

  const studioUrl = useMemo(() => {
    return window.location.origin;
  }, []);

  const handleBookNow = () => {
    if (!studio) return;
    window.open(`${studioUrl}/bookings?studio=${studio._id}`, '_blank');
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="relative">
        {studio.studioPhotos && studio.studioPhotos.length > 0 ? (
          <div className="h-96 md:h-[500px] overflow-hidden">
            <img
              src={studio.studioPhotos[0]}
              alt={`${studio.name} - Cover`}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="h-96 md:h-[500px] bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="text-6xl font-bold mb-2">{studio.name.charAt(0)}</div>
              <div className="text-xl font-semibold">Studio Profile</div>
            </div>
          </div>
        )}

        {/* Studio Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 md:p-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {studio.name}
            </h1>
            {studio.city && studio.state && (
              <div className="flex items-center text-white/90">
                <MapPin className="w-5 h-5 mr-2" />
                <span>{studio.city}, {studio.state}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            {studio.description && (
              <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">About</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{studio.description}</p>
              </section>
            )}

            {/* Amenities */}
            {studio.amenities && studio.amenities.length > 0 && (
              <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {studio.amenities.map((amenity, index) => (
                    <div
                      key={index}
                      className="flex items-center text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-lg p-3"
                    >
                      <Star className="w-4 h-4 mr-2 text-yellow-500" />
                      <span className="text-sm">{amenity}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Photo Gallery */}
            {studio.studioPhotos && studio.studioPhotos.length > 1 && (
              <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Gallery</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {studio.studioPhotos.slice(1, 7).map((photo, index) => (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden">
                      <img
                        src={photo}
                        alt={`${studio.name} - Photo ${index + 2}`}
                        className="w-full h-full object-cover hover:opacity-95 transition-opacity cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
              <h3 className="text-xl font-bold mb-4">Pricing</h3>
              <div className="mb-6">
                {studio.minHourlyRate && studio.maxHourlyRate ? (
                  <div>
                    <div className="text-3xl font-bold mb-1">
                      ${studio.minHourlyRate} - ${studio.maxHourlyRate}
                    </div>
                    <div className="text-blue-100">per hour</div>
                  </div>
                ) : studio.hourlyRate ? (
                  <div>
                    <div className="text-3xl font-bold mb-1">${studio.hourlyRate}</div>
                    <div className="text-blue-100">per hour</div>
                  </div>
                ) : (
                  <div className="text-blue-100">Contact for pricing</div>
                )}
              </div>
              <button
                onClick={handleBookNow}
                className="w-full bg-white text-blue-600 font-semibold py-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Book Now
              </button>
            </div>

            {/* Contact Info */}
            {(studio.email || studio.phoneCell || studio.website || studio.hours) && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Contact Information
                </h3>
                <div className="space-y-3">
                  {studio.email && (
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <Mail className="w-5 h-5 mr-3 text-gray-400" />
                      <a href={`mailto:${studio.email}`} className="hover:text-blue-600 transition-colors">
                        {studio.email}
                      </a>
                    </div>
                  )}
                  {studio.phoneCell && (
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <Phone className="w-5 h-5 mr-3 text-gray-400" />
                      <a href={`tel:${studio.phoneCell}`} className="hover:text-blue-600 transition-colors">
                        {studio.phoneCell}
                      </a>
                    </div>
                  )}
                  {studio.website && (
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <Globe className="w-5 h-5 mr-3 text-gray-400" />
                      <a href={studio.website} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">
                        Visit Website
                      </a>
                    </div>
                  )}
                  {studio.hours && (
                    <div className="flex items-start text-gray-600 dark:text-gray-300">
                      <Clock className="w-5 h-5 mr-3 text-gray-400 mt-0.5" />
                      <span>{studio.hours}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Location */}
            {studio.location && !studio.hideAddress && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Location</h3>
                <div className="flex items-start text-gray-600 dark:text-gray-300">
                  <MapPin className="w-5 h-5 mr-3 text-gray-400 mt-0.5" />
                  <span>{studio.location}</span>
                </div>
                {studio.city && studio.state && (
                  <div className="mt-2 text-sm text-gray-500">
                    {studio.city}, {studio.state}
                  </div>
                )}
              </div>
            )}

            {/* Back to SeshNx */}
            <a
              href={studioUrl}
              className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 transition-colors text-sm"
            >
              <Home className="w-4 h-4" />
              Back to SeshNx
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudioPublicProfile;
