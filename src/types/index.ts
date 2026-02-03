// =====================================================
// CORE TYPE DEFINITIONS FOR SESHNX WEBAPP
// =====================================================

// Leverage existing Convex types
import type { Doc, Id } from '../../convex/_generated/dataModel';

// =====================================================
// USER & ACCOUNT TYPES
// =====================================================

export type AccountType =
  | "Talent" | "Engineer" | "Producer" | "Composer" | "Studio" | "Technician" | "Fan"
  | "Student" | "EDUStaff" | "EDUAdmin" | "Intern" | "Label" | "Agent" | "GAdmin";

export type TalentSubRole =
  | "Singer"
  | "Singer-Songwriter"
  | "Lyricist"
  | "Rapper"
  | "Guitarist"
  | "Bassist"
  | "Drummer"
  | "Keyboardist"
  | "Pianist"
  | "Violinist"
  | "Cellist"
  | "Saxophonist"
  | "Trumpeter"
  | "DJ"
  | "Beatmaker"
  | "Multi-Instrumentalist"
  | "Session Musician"
  | "Vocalist"
  | "Backup Singer"
  | "Band";

export type VocalRange =
  | "Soprano"
  | "Mezzo-Soprano"
  | "Alto"
  | "Countertenor"
  | "Tenor"
  | "Baritone"
  | "Bass"
  | "Not Applicable";

export type AvailabilityStatus =
  | "Available for Work"
  | "Busy - Limited Availability"
  | "Not Available"
  | "On Tour";

export type EDURole = 'EDUAdmin' | 'EDUStaff' | 'Student' | 'Intern';

// User data structure
export interface UserData {
  id: string;
  uid?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  effectiveDisplayName?: string;
  email?: string;
  photoURL?: string | null;
  accountTypes?: AccountType[];
  activeProfileRole?: AccountType;
  preferredRole?: AccountType;
  talentSubRole?: TalentSubRole;

  // Profile fields
  bio?: string;
  profileName?: string;
  genres?: string[];
  instruments?: Record<string, string[]>;
  rates?: number;
  sessionRate?: number;
  dayRate?: number;
  hourlyRate?: number;
  availabilityStatus?: AvailabilityStatus;

  // Location
  zipCode?: string;
  address?: string;

  // Settings
  settings?: UserSettings;

  // Timestamps
  createdAt?: number;
  updatedAt?: number;

  // Additional fields from database
  [key: string]: any;
}

export interface UserSettings {
  theme?: 'light' | 'dark' | 'system';
  language?: string;
  accessibility?: {
    fontSize?: 'small' | 'medium' | 'large' | 'xlarge';
    reducedMotion?: boolean;
    highContrast?: boolean;
  };
  timezone?: string;
  currency?: string;
  dateFormat?: string;
  timeFormat?: string;
  numberFormat?: string;
}

// =====================================================
// MESSAGE TYPES
// =====================================================

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  content?: string;
  media?: MessageMedia;
  timestamp: number;
  edited?: boolean;
  editedAt?: number;
  deleted?: boolean;
  deletedForAll?: boolean;
  replyTo?: {
    messageId: string;
    text: string;
    sender: string;
  };
  reactions?: Record<string, string[]>;
}

export interface MessageMedia {
  type: string;
  url: string;
  thumbnail?: string;
  name?: string;
  gif?: boolean;
}

export interface Conversation {
  userId: string;
  chatId: string;
  lastMessage?: string;
  lastMessageTime?: number;
  unreadCount: number;
  lastSenderId?: string;
  chatName?: string;
  chatPhoto?: string;
  chatType: 'direct' | 'group';
  otherUserId?: string;
}

// =====================================================
// POST TYPES
// =====================================================

export interface Post {
  id: string;
  userId: string;
  displayName: string;
  photoURL?: string;
  text: string;
  imageUrl?: string;
  reactions?: Record<string, string[]>;
  commentCount?: number;
  timestamp: number;
  type?: 'text' | 'image' | 'audio' | 'video';
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  displayName: string;
  photoURL?: string;
  text: string;
  timestamp: number;
}

// =====================================================
// BOOKING TYPES
// =====================================================

export interface Booking {
  id: string;
  senderId: string;
  senderName?: string;
  senderPhoto?: string;
  targetId: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  serviceType?: string;
  date?: string;
  time?: string;
  duration?: number;
  offerAmount?: number;
  message?: string;
  createdAt: number;
  updatedAt: number;
}

// =====================================================
// NOTIFICATION TYPES
// =====================================================

export interface Notification {
  id: string;
  userId: string;
  type: 'booking' | 'follow' | 'like' | 'comment' | 'message' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: number;
  metadata?: Record<string, any>;
  actionUrl?: string;
}

// =====================================================
// ROUTER TYPES
// =====================================================

export type TabId =
  | 'feed' | 'chat' | 'discover' | 'marketplace'
  | 'EDU' | 'studio' | 'business' | 'labels';

// =====================================================
// COMPONENT PROP TYPES
// =====================================================

export interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  className?: string;
  onClick?: () => void;
  status?: 'online' | 'offline';
  isGroup?: boolean;
  square?: boolean;
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  helperText?: string;
  fullWidth?: boolean;
}

// =====================================================
// PROFILE FIELD TYPES (from PROFILE_SCHEMAS)
// =====================================================

export type ProfileFieldType =
  | 'text'
  | 'textarea'
  | 'select'
  | 'multi_select'
  | 'nested_select'
  | 'number'
  | 'checkbox';

export interface ProfileField {
  key: string;
  label: string;
  type: ProfileFieldType;
  options?: string[];
  data?: string[] | Record<string, string[]>;
  showFor?: string[];
  isSubRole?: boolean;
  placeholder?: string;
  isToggle?: boolean;
}

export type ProfileSchemas = Record<string, ProfileField[]>;

// =====================================================
// SERVICE TYPES
// =====================================================

export interface ServiceTypes {
  general: string[];
  talent: string[];
  instrumentalist: string[];
  dj: string[];
  production: string[];
  engineering: string[];
  studio: string[];
  composer: string[];
  tech: string[];
}

// =====================================================
// MARKETPLACE TYPES
// =====================================================

export interface MarketplaceListing {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: 'new' | 'used' | 'refurbished';
  images: string[];
  location?: string;
  fulfillmentMethod: 'local_pickup' | 'safe_exchange' | 'shipping';
  createdAt: number;
  status: 'active' | 'sold' | 'removed';
}

export interface SafeExchangeStatus {
  currentStep: string;
  buyerApproved: boolean;
  sellerApproved: boolean;
  photos: {
    seller?: string[];
    buyer?: string[];
  };
}

// =====================================================
// STUDIO OPS TYPES
// =====================================================

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  type: 'vip' | 'regular' | 'prospect' | 'inactive';
  totalBookings: number;
  lastBooking?: number;
  tags?: string[];
}

export interface Staff {
  id: string;
  userId: string;
  name: string;
  role: 'engineer' | 'assistant' | 'manager' | 'intern' | 'technician' | 'producer';
  status: 'active' | 'inactive' | 'on_leave';
  hourlyRate?: number;
  payType?: 'hourly' | 'per_session' | 'percentage' | 'salary';
}

export interface StudioTask {
  id: string;
  title: string;
  description?: string;
  assignedTo?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'completed' | 'cancelled';
  type: 'one_time' | 'recurring' | 'template';
  dueDate?: number;
  createdAt: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  location?: string;
  minStock?: number;
  lastRestocked?: number;
}

// =====================================================
// EDU TYPES
// =====================================================

export interface School {
  id: string;
  name: string;
  address?: string;
  adminId: string;
  staffIds: string[];
  studentIds: string[];
  partnerIds: string[];
  createdAt: number;
}

export interface Student {
  id: string;
  userId: string;
  schoolId: string;
  status: 'active' | 'inactive' | 'graduated' | 'expelled';
  internshipStudio?: string;
  enrolledHours: number;
  approvedHours: number;
  gpa?: number;
  expectedGraduation?: number;
}

export interface InternshipHours {
  id: string;
  studentId: string;
  studioId: string;
  date: string;
  hours: number;
  tasks: string;
  approvedBy?: string;
  status: 'pending' | 'approved' | 'rejected';
}

// =====================================================
// DISTRIBUTION TYPES
// =====================================================

export interface Release {
  id: string;
  userId: string;
  title: string;
  type: 'single' | 'ep' | 'album';
  genre: string;
  releaseDate: string;
  artworkUrl?: string;
  tracks: ReleaseTrack[];
  stores: string[];
  status: 'draft' | 'submitted' | 'approved' | 'released' | 'rejected';
  createdAt: number;
}

export interface ReleaseTrack {
  id: string;
  title: string;
  duration: number;
  audioUrl: string;
  ISRC?: string;
  explicit: boolean;
}

// =====================================================
// UTILITY TYPES
// =====================================================

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Dict<T> = Record<string, T>;

// =====================================================
// CONVEX INTEGRATION TYPES
// =====================================================

export type ConvexDocument<T extends keyof Doc<"tableName">> = Doc<T>;
export type ConvexId<T extends keyof Doc<"tableName">> = Id<T>;

// =====================================================
// RE-export Convex types for convenience
// =====================================================

export type { Doc, Id } from '../../convex/_generated/dataModel';
