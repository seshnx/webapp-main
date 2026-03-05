/**
 * MongoDB Data Types
 *
 * TypeScript types for MongoDB collections used in the hybrid booking system.
 */

/**
 * Booking metadata stored in MongoDB
 * Contains flexible, studio-specific booking attributes
 */
export interface BookingMetadata {
  _id?: string;
  bookingId: string;
  studioId: string;
  studioType?: 'recording' | 'production' | 'mastering' | 'rehearsal' | 'general';

  // Studio-specific fields (flexible)
  equipmentPreferences?: string[];
  engineerNotes?: string;
  micSetup?: string;
  preampSettings?: string;
  gearRental?: string[];
  referenceTracks?: string[];
  sessionMusicians?: number;
  mealPreferences?: string[];
  fileFormatSpecs?: string;
  revisionRounds?: number;

  // Custom fields (any key-value pairs)
  customFields?: Record<string, any>;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Form field definition for dynamic booking forms
 */
export interface FormFieldDefinition {
  id: string;
  fieldType: 'text' | 'textarea' | 'number' | 'email' | 'phone' | 'date' | 'time' |
            'select' | 'checkbox' | 'radio' | 'file' | 'address';
  label: string;
  placeholder?: string;
  required: boolean;
  order: number;
  options?: Array<{ label: string; value: string }>;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number;
    max?: number;
  };
  helpText?: string;
  conditional?: {
    dependsOn: string;
    value: string;
  };
}

/**
 * Form schema stored in MongoDB
 * Defines the structure of dynamic booking forms
 */
export interface FormSchema {
  _id?: string;
  studioId: string;
  schemaName: string;
  description?: string;
  fields: FormFieldDefinition[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  version: number;
}

/**
 * Form response stored in MongoDB
 * Contains customer-submitted form data
 */
export interface FormResponse {
  _id?: string;
  bookingId: string;
  studioId: string;
  schemaId: string;
  responses: Record<string, any>;
  submittedAt: Date;
  submittedBy: string;
  ipAddress?: string;
}

/**
 * Booking note stored in MongoDB
 */
export interface BookingNote {
  _id?: string;
  bookingId: string;
  content: string;
  authorId: string;
  authorName?: string;
  createdAt: Date;
}

/**
 * Booking attachment stored in MongoDB
 */
export interface BookingAttachment {
  _id?: string;
  bookingId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date;
  uploadedBy: string;
}

/**
 * Booking cancellation record stored in MongoDB
 */
export interface BookingCancellation {
  _id?: string;
  bookingId: string;
  reason: string;
  cancelledAt: Date;
  cancelledBy: string;
  refundStatus?: 'pending' | 'approved' | 'denied' | 'processed';
  refundAmount?: number;
  refundNotes?: string;
}

/**
 * Form version history
 */
export interface FormVersion {
  _id?: string;
  studioId: string;
  schemaId: string;
  schema: FormSchema;
  version: number;
  changeReason?: string;
  createdAt: Date;
  createdBy: string;
}

/**
 * Form backup record
 */
export interface FormBackup {
  _id?: string;
  studioId: string;
  schema: FormSchema;
  snapshotDate: Date;
  reason: string;
}

/**
 * Complete booking data (merged from Neon + MongoDB)
 */
export interface CompleteBooking {
  // From Neon (core)
  id: string;
  senderId: string;
  targetId: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  serviceType?: string;
  date?: string;
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  offerAmount?: number;
  message?: string;
  createdAt: Date;
  updatedAt: Date;

  // From MongoDB (flexible)
  metadata?: BookingMetadata;
  formResponses?: FormResponse;
  notes?: BookingNote[];
  attachments?: BookingAttachment[];
  cancellation?: BookingCancellation;
}
