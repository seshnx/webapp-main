/**
 * Data Distribution Strategy
 *
 * Defines which data goes to which database for optimal performance.
 *
 * NEON (PostgreSQL) - Immutable Core Data
 *   - Legal identity (first_name, last_name)
 *   - Addresses (billing, shipping)
 *   - Financial records (payments, invoices)
 *   - Audit trail (status changes, timestamps)
 *   - Compliance data (KYC, tax info)
 *
 * MONGODB - Flexible Profile Data
 *   - Display identity (artist name, username)
 *   - Active profiles (role switching)
 *   - Preferences (notifications, theme)
 *   - Social & creative (bio, genres, portfolio)
 *   - Dynamic data (equipment, availability, custom fields)
 *
 * CONVEX - Real-Time Data
 *   - Presence status (online/offline)
 *   - Typing indicators
 *   - Live chat messages
 *   - Real-time notifications
 *   - Active sessions & collaboration
 */

// ============================================================
// NEON (PostgreSQL) - Immutable Core Data
// ============================================================

export interface NeonUserProfile {
  id: string; // UUID
  clerk_user_id: string; // Clerk authentication ID

  // Legal Identity (Immutable)
  first_name: string; // Legal first name
  last_name: string; // Legal last name
  email: string; // Verified email
  phone?: string; // Verified phone
  date_of_birth?: Date; // For age verification
  tax_id?: string; // For payments (SSN, EIN)

  // Addresses
  billing_address?: Address;
  shipping_address?: Address;
  studio_location?: Address; // Physical studio address

  // Account Metadata
  account_created_at: Date;
  account_updated_at: Date;
  email_verified_at?: Date;
  phone_verified_at?: Date;

  // Compliance
  kyc_verified: boolean;
  kyc_verified_at?: Date;
  terms_accepted_at: Date;
  privacy_policy_accepted_at: Date;
}

export interface Address {
  street_line1: string;
  street_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export interface NeonBooking {
  id: string; // UUID
  sender_id: string; // References NeonUserProfile.id
  target_id: string; // References NeonUserProfile.id

  // Core Transaction Data
  service_type: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  start_time: Date;
  end_time: Date;
  duration_hours: number;

  // Financial Data (Immutable)
  agreed_price: number; // Final agreed price
  deposit_amount?: number;
  final_payment_amount?: number;
  payment_status: 'pending' | 'partial' | 'paid' | 'refunded';

  // Audit Trail
  created_at: Date;
  updated_at: Date;
  confirmed_at?: Date;
  completed_at?: Date;
  cancelled_at?: Date;
}

export interface NeonPayment {
  id: string; // UUID
  booking_id: string; // References NeonBooking.id
  user_id: string; // References NeonUserProfile.id

  // Financial Data (Immutable)
  amount: number;
  currency: string;
  stripe_payment_intent_id: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';

  // Tax & Compliance
  tax_amount?: number;
  invoice_number?: string;
  receipt_url?: string;

  // Audit Trail
  created_at: Date;
  updated_at: Date;
}

// ============================================================
// MONGODB - Flexible Profile Data
// ============================================================

export interface MongoUserProfile {
  _id?: string;
  user_id: string; // References NeonUserProfile.id

  // Display Identity (Flexible)
  display_name: string; // Artist name, studio name
  username: string; // @username handle
  profile_handle: string; // Custom URL slug
  bio?: string; // Rich text
  tagline?: string; // Short description

  // Active Profiles
  active_profile: string; // Current active role (e.g., "talent", "engineer")
  sub_profiles: SubProfile[]; // Multiple roles
  profile_switching_history: ProfileSwitch[];

  // Preferences (Flexible)
  notification_settings: NotificationSettings;
  theme_settings: ThemeSettings;
  privacy_settings: PrivacySettings;
  accessibility_settings: AccessibilitySettings;

  // Social & Creative
  social_links: SocialLink[];
  genres: string[]; // Tags
  skills: string[]; // Customizable
  influences?: string[];
  portfolio: PortfolioItem[];

  // Dynamic Data
  equipment_inventory?: EquipmentItem[];
  availability_schedule?: AvailabilityPattern[];
  custom_fields?: Record<string, any>; // Studio-specific

  // Media
  profile_photos: ProfilePhoto[];
  banner_photos?: string[]; // URLs

  // Metadata
  profile_completed_at?: Date;
  profile_views?: number;
  last_modified: Date;
}

export interface SubProfile {
  id: string;
  type: 'talent' | 'engineer' | 'producer' | 'studio' | 'technician' | 'label' | 'student' | 'fan';
  name: string;
  description?: string;
  is_active: boolean;
  created_at: Date;
}

export interface ProfileSwitch {
  from_profile: string;
  to_profile: string;
  switched_at: Date;
}

export interface NotificationSettings {
  email: {
    bookings: boolean;
    messages: boolean;
    promotions: boolean;
    recommendations: boolean;
  };
  push: {
    bookings: boolean;
    messages: boolean;
    session_reminders: boolean;
  };
  in_app: {
    sound_enabled: boolean;
    desktop_notifications: boolean;
  };
  custom?: Record<string, boolean>; // User-defined
}

export interface ThemeSettings {
  mode: 'light' | 'dark' | 'system';
  accent_color?: string;
  font_size?: 'small' | 'medium' | 'large' | 'xlarge';
  custom_css?: string;
}

export interface PrivacySettings {
  profile_visibility: 'public' | 'contacts_only' | 'private';
  show_email: boolean;
  show_phone: boolean;
  show_location: boolean;
  allow_messages_from: 'anyone' | 'contacts' | 'none';
  custom?: Record<string, any>;
}

export interface AccessibilitySettings {
  high_contrast: boolean;
  reduced_motion: boolean;
  screen_reader: boolean;
  font_size?: string;
  custom?: Record<string, any>;
}

export interface SocialLink {
  platform: string;
  url: string;
  username?: string;
  verified?: boolean;
}

export interface PortfolioItem {
  id: string;
  title: string;
  type: 'track' | 'video' | 'image' | 'project';
  url: string;
  thumbnail_url?: string;
  description?: string;
  tags?: string[];
  created_at: Date;
}

export interface EquipmentItem {
  id: string;
  name: string;
  brand: string;
  category: string;
  serial_number?: string;
  purchase_date?: Date;
  photos?: string[];
  custom_fields?: Record<string, any>;
}

export interface AvailabilityPattern {
  id: string;
  day_of_week: number; // 0-6 (Sunday-Saturday)
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
  is_available: boolean;
  recurring: boolean;
  exceptions?: Date[];
}

export interface ProfilePhoto {
  url: string;
  is_primary: boolean;
  uploaded_at: Date;
}

// ============================================================
// CONVEX - Real-Time Data
// ============================================================

export interface ConvexPresence {
  user_id: string; // References NeonUserProfile.id
  status: 'online' | 'offline' | 'away' | 'busy' | 'in_session';
  last_seen_at: number; // Timestamp
  current_location?: {
    type: 'studio' | 'room' | 'session';
    id: string;
    name: string;
  };
  device_info?: {
    type: 'desktop' | 'mobile' | 'tablet';
    browser?: string;
  };
}

export interface ConvexTypingIndicator {
  conversation_id: string;
  user_id: string;
  is_typing: boolean;
  started_at: number;
}

export interface ConvexMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  attachments?: MessageAttachment[];
  sent_at: number;
  read_by?: string[]; // Array of user IDs who read it
  reactions?: MessageReaction[];
}

export interface MessageAttachment {
  type: 'image' | 'audio' | 'video' | 'file';
  url: string;
  name: string;
  size: number;
}

export interface MessageReaction {
  emoji: string;
  user_ids: string[];
}

export interface ConvexNotification {
  id: string;
  user_id: string;
  type: 'booking' | 'message' | 'session' | 'payment' | 'system';
  title: string;
  message: string;
  action_url?: string;
  created_at: number;
  read: boolean;
  read_at?: number;
  delivered: boolean;
  delivered_at?: number;
}

export interface ConvexActiveSession {
  session_id: string;
  booking_id: string;
  participants: SessionParticipant[];
  started_at: number;
  status: 'active' | 'paused' | 'ended';
}

export interface SessionParticipant {
  user_id: string;
  display_name: string; // From MongoUserProfile
  role: 'host' | 'guest' | 'observer';
  joined_at: number;
  is_active: boolean;
}

export interface ConvexPushToken {
  user_id: string;
  token: string;
  platform: 'ios' | 'android' | 'web';
  created_at: number;
  is_active: boolean;
}

export interface ConvexUnreadCounts {
  user_id: string;
  messages: number;
  notifications: number;
  booking_requests: number;
  last_updated: number;
}

// ============================================================
// Type Guards & Utilities
// ============================================================

export function isNeonData(obj: any): obj is NeonUserProfile | NeonBooking | NeonPayment {
  return obj && typeof obj.id === 'string' && obj.id.length === 36; // UUID
}

export function isMongoData(obj: any): obj is MongoUserProfile {
  return obj && typeof obj._id === 'string';
}

export function isConvexData(obj: any): obj is ConvexPresence | ConvexMessage | ConvexNotification {
  return obj && typeof obj.sent_at === 'number' || typeof obj.created_at === 'number';
}

// ============================================================
// Complete User Profile (Merged)
// ============================================================

export interface CompleteUserProfile {
  // From Neon (Core)
  id: string;
  clerk_user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  billing_address?: Address;
  account_created_at: Date;

  // From MongoDB (Flexible)
  display_name: string;
  username: string;
  bio?: string;
  active_profile: string;
  sub_profiles: SubProfile[];
  notification_settings: NotificationSettings;
  social_links: SocialLink[];
  portfolio: PortfolioItem[];

  // From Convex (Real-time)
  online_status: 'online' | 'offline' | 'away' | 'busy' | 'in_session';
  last_seen?: number;
  unread_counts?: {
    messages: number;
    notifications: number;
  };
}
