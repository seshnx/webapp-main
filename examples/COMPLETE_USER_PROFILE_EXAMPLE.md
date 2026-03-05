/**
 * Complete User Profile Example
 *
 * This file demonstrates how to use the complete tri-database architecture
 * in a real application context.
 *
 * Shows:
 * 1. Creating a complete user profile (Neon + MongoDB)
 * 2. Using real-time presence (Convex)
 * 3. Switching active profiles (MongoDB)
 * 4. Displaying real-time stats (Convex)
 * 5. Managing notifications across all databases
 */

import React, { useState, useEffect } from 'react';
import { usePresence } from '../hooks/useRealtime';
import { useUnreadCounts } from '../hooks/useRealtime';
import { useDashboardStats } from '../hooks/useRealtime';
import {
  createCompleteUserProfile,
  getCompleteUserProfile,
  updateDisplayName,
  switchActiveProfile,
} from '../services/unifiedDataService';
import {
  updateMongoUserProfile,
  getProfileCompletionScore,
} from '../config/mongoProfiles';
import {
  PresenceIndicator,
  ProfileSwitcher,
  DashboardStatsCard,
  UnreadCountsBadge,
} from '../components/realtime/RealtimeComponents';

// ============================================================
// EXAMPLE 1: Creating a New User Profile
// ============================================================

/**
 * Example: Create a complete user profile across all 3 databases
 */
async function createNewUserExample() {
  // User creates account with Clerk
  const clerkUserId = 'user_12345';

  // Create complete profile (Neon + MongoDB)
  const user = await createCompleteUserProfile({
    // Neon: Legal identity (immutable, requires verification)
    clerk_user_id: clerkUserId,
    first_name: 'John',
    last_name: 'Smith',
    email: 'john@example.com',
    phone: '+1234567890',
    billing_address: {
      street_line1: '123 Main St',
      city: 'New York',
      state: 'NY',
      postal_code: '10001',
      country: 'USA',
    },

    // MongoDB: Flexible profile data (instant, no verification)
    display_name: 'Johnny Beats',
    username: '@johnnybeats',
    bio: 'Music producer specializing in hip-hop and R&B',
    active_profile: 'producer',
    sub_profiles: [
      {
        id: 'producer_1',
        type: 'producer',
        name: 'Producer',
        is_active: true,
        created_at: new Date(),
      },
      {
        id: 'engineer_1',
        type: 'engineer',
        name: 'Engineer',
        is_active: false,
        created_at: new Date(),
      },
    ],
    notification_settings: {
      email: {
        bookings: true,
        messages: true,
        promotions: false,
        recommendations: true,
      },
      push: {
        bookings: true,
        messages: true,
        session_reminders: true,
      },
    },
    social_links: [
      {
        platform: 'instagram',
        url: 'https://instagram.com/johnnybeats',
        username: '@johnnybeats',
        verified: true,
      },
      {
        platform: 'soundcloud',
        url: 'https://soundcloud.com/johnnybeats',
        username: '@johnnybeats',
      },
    ],
    genres: ['Hip-Hop', 'R&B', 'Trap'],
    skills: ['Mixing', 'Mastering', 'Beat Production'],
  });

  // Convex: Set online status (done from frontend via usePresence hook)
  // This happens automatically when user logs in

  console.log('User created:', user.id);
  console.log('Display name:', user.display_name);
  console.log('Legal name:', user.first_name, user.last_name);

  return user;
}

// ============================================================
// EXAMPLE 2: User Profile Component
// ============================================================

interface UserProfileProps {
  userId: string;
}

/**
 * Component: Display complete user profile with real-time features
 */
function UserProfile({ userId }: UserProfileProps) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Real-time presence (Convex)
  const { status } = usePresence(userId);

  // Unread counts (Convex)
  const { counts } = useUnreadCounts(userId);

  // Dashboard stats (Convex)
  const { stats } = useDashboardStats(userId);

  // Load complete user profile
  useEffect(() => {
    async function loadProfile() {
      try {
        const completeUser = await getCompleteUserProfile(userId);
        setUser(completeUser);
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [userId]);

  if (loading) {
    return <div>Loading profile...</div>;
  }

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header with presence indicator */}
      <div className="flex items-start gap-6 mb-8">
        <div className="relative">
          <img
            src={user.profile_photos?.find(p => p.is_primary)?.url || '/default-avatar.png'}
            alt={user.display_name}
            className="w-32 h-32 rounded-full object-cover"
          />
          <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-4 border-white rounded-full" />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{user.display_name}</h1>
            <span className="text-sm text-gray-500">({user.first_name} {user.last_name})</span>
          </div>

          <p className="text-gray-600 mt-2">{user.bio}</p>

          <div className="flex items-center gap-4 mt-4">
            <span className="text-sm text-gray-500">
              Status: <span className="capitalize text-green-600">{status}</span>
            </span>
            <span className="text-sm text-gray-500">
              Active as: <span className="font-semibold">{user.active_profile}</span>
            </span>
          </div>

          {/* Profile switcher */}
          <div className="mt-4">
            <ProfileSwitcher
              userId={user.id}
              subProfiles={user.sub_profiles}
              activeProfile={user.active_profile}
              onSwitch={async (newProfile) => {
                await switchActiveProfile(user.id, newProfile);
                setUser(prev => ({ ...prev, active_profile: newProfile }));
              }}
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="text-2xl font-bold text-blue-900">{stats?.todayBookingCount || 0}</p>
          <p className="text-sm text-blue-600">Today's Bookings</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <p className="text-2xl font-bold text-green-900">${stats?.todayRevenue || 0}</p>
          <p className="text-sm text-green-600">Today's Revenue</p>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg">
          <p className="text-2xl font-bold text-purple-900">{counts?.messages || 0}</p>
          <p className="text-sm text-purple-600">Unread Messages</p>
        </div>
      </div>

      {/* Social links */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Social Links</h2>
        <div className="flex gap-3">
          {user.social_links?.map((link, index) => (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              {link.platform} {link.verified && '✓'}
            </a>
          ))}
        </div>
      </div>

      {/* Genres & Skills */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Genres & Skills</h2>
        <div className="flex flex-wrap gap-2">
          {user.genres?.map((genre, index) => (
            <span key={index} className="px-3 py-1 bg-brand-blue/10 text-brand-blue rounded-full text-sm">
              {genre}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {user.skills?.map((skill, index) => (
            <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// EXAMPLE 3: Profile Editing
// ============================================================

/**
 * Example: Update user profile data
 */
async function updateProfileExample(userId: string) {
  // Instant update: Display name (MongoDB only)
  await updateDisplayName(userId, 'Johnny Beats Productions');

  // Instant update: Bio (MongoDB only)
  await updateMongoUserProfile(userId, {
    bio: 'Award-winning music producer with 10+ years experience',
  });

  // Instant update: Add social link (MongoDB only)
  await updateMongoUserProfile(userId, {
    social_links: [
      {
        platform: 'spotify',
        url: 'https://open.spotify.com/artist/johnnybeats',
        username: '@johnnybeats',
      },
    ],
  });

  // Requires verification: Email address (Neon)
  // await updateUserEmail(userId, 'newemail@example.com');
  // This would send verification email before updating

  // Requires verification: Billing address (Neon)
  // await updateBillingAddress(userId, newAddress);
  // This would require address verification for payments
}

// ============================================================
// EXAMPLE 4: Real-Time Chat
// ============================================================

/**
 * Component: Real-time chat with typing indicators
 */
function RealTimeChat({ conversationId, currentUserId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Handle typing indicator
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isTyping) {
        // Send typing indicator to Convex
        // setTyping({ conversationId, userId: currentUserId, displayName, isTyping: true });
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [isTyping, conversationId, currentUserId]);

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    setIsTyping(true);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    // Save message to database
    // await sendMessage(conversationId, currentUserId, newMessage);

    setNewMessage('');
    setIsTyping(false);

    // Clear typing indicator
    // setTyping({ conversationId, userId: currentUserId, displayName, isTyping: false });
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
          <div key={message.id} className={`mb-2 ${message.senderId === currentUserId ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block px-4 py-2 rounded-lg ${
              message.senderId === currentUserId
                ? 'bg-brand-blue text-white'
                : 'bg-gray-200 text-gray-900'
            }`}>
              {message.content}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        <TypingIndicator conversationId={conversationId} excludeUserId={currentUserId} />
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
          <button
            onClick={handleSendMessage}
            className="px-6 py-2 bg-brand-blue text-white rounded-lg hover:bg-blue-600 transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// EXAMPLE 5: Collaboration Session
// ============================================================

/**
 * Example: Real-time collaboration session
 */
function SessionCollaboration({ bookingId, hostId, hostName }) {
  const { session, create, join, leave } = useActiveSession();
  const { users } = useUsersInLocation('session', session?.sessionId);

  const startSession = async () => {
    const sessionId = await create(bookingId, hostId, hostName);
    console.log('Session started:', sessionId);
  };

  const joinSession = async () => {
    await join(session.sessionId, currentUserId, displayName, 'guest');
  };

  const leaveSession = async () => {
    await leave(session.sessionId, currentUserId);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      {session ? (
        <div>
          <h2 className="text-xl font-semibold mb-4">Active Session</h2>

          {/* Participants */}
          <SessionParticipants sessionId={session.sessionId} />

          {/* Actions */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => leaveSession()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Leave Session
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-gray-600 mb-4">No active session</p>
          <button
            onClick={startSession}
            className="px-6 py-3 bg-brand-blue text-white rounded-lg hover:bg-blue-600 transition"
          >
            Start Collaboration Session
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================
// EXAMPLE 6: Profile Completion Tracking
// ============================================================

/**
 * Component: Profile completion tracker
 */
function ProfileCompletionTracker({ userId }) {
  const [completion, setCompletion] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCompletion() {
      try {
        const score = await getProfileCompletionScore(userId);
        setCompletion(score);
      } catch (error) {
        console.error('Failed to get completion score:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCompletion();
  }, [userId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Profile Completion</span>
        <span className="text-sm font-semibold">{completion}%</span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-brand-blue h-2 rounded-full transition-all duration-300"
          style={{ width: `${completion}%` }}
        />
      </div>

      {completion < 100 && (
        <p className="text-xs text-gray-500 mt-2">
          Complete your profile to get more visibility!
        </p>
      )}
    </div>
  );
}

// ============================================================
// USAGE EXAMPLE
// ============================================================

/**
 * Example: How to use everything together
 */
function App() {
  const [userId] = useState('user_123');

  return (
    <div>
      {/* Profile with real-time presence */}
      <UserProfile userId={userId} />

      {/* Real-time dashboard */}
      <DashboardStatsCard userId={userId} />

      {/* Profile completion tracker */}
      <ProfileCompletionTracker userId={userId} />

      {/* Collaboration session */}
      <SessionCollaboration
        bookingId="booking_456"
        hostId={userId}
        hostName="Johnny Beats"
      />
    </div>
  );
}

export default App;
