# EDU Messaging System Documentation

## Overview

The EDU messaging system provides communication channels between different user roles within the education platform. This document outlines the messaging requirements and architecture.

## Messaging Channels

### 1. EDUAdmin to GAdmin Communication

**Purpose**: Allow EDUAdmins (school administrators) to contact Global Admins (platform administrators) for support, requests, or issues.

**Implementation**:
- **Separate API**: This communication channel uses a **separate API**, not Convex or Firestore directly
- **Access**: Only EDUAdmins can initiate messages to GAdmins
- **Recipients**: All GAdmins receive messages from EDUAdmins
- **Use Cases**:
  - School setup requests
  - Permission escalation
  - Technical support
  - Feature requests
  - Account management requests

**Technical Notes**:
- The messaging API should be implemented as a separate service/endpoint
- Messages should be stored in a dedicated database (not Firestore)
- Authentication should verify the user has `EDUAdmin` role
- GAdmins should be notified of new messages (email, push notification, or in-app notification)

### 2. Internal School Staff Messaging

**Purpose**: Allow EDUAdmins and EDUStaff to communicate within their school(s).

**Implementation**:
- **Scope**: Limited to staff members listed within the same school
- **Access**: 
  - EDUAdmins can message all staff in their assigned school(s)
  - EDUStaff can message all staff in their assigned school(s)
  - Staff can be on multiple schools, so messaging should be scoped per school
- **Recipients**: Only staff members listed in `schools/{schoolId}/staff` collection

**Technical Notes**:
- Messages should be scoped by `schoolId`
- Users with multiple school assignments should see separate message threads per school
- Can be implemented using Firestore or a separate messaging service
- Should filter staff list based on `schools/{schoolId}/staff` collection

## Role-Based Access

### EDUAdmin
- Can message GAdmins (via separate API)
- Can message all staff in their assigned school(s)
- Can see all staff-to-staff messages within their school(s) (optional, for moderation)

### EDUStaff
- Can message all staff in their assigned school(s)
- Cannot message GAdmins directly (must go through EDUAdmin)
- Can see messages from other staff in their school(s)

### Students and Interns
- Do not have access to staff messaging system
- Use standard platform messaging for peer-to-peer communication

## Implementation Recommendations

### Option 1: Separate Messaging Service
- Create a dedicated messaging API/service
- Store messages in a separate database
- Integrate with main app via API calls
- Pros: Better separation of concerns, easier to scale
- Cons: Additional infrastructure, more complex integration

### Option 2: Firestore with Custom Rules
- Use Firestore collections for messages
- Implement custom security rules to enforce school scoping
- Pros: Simpler integration, uses existing infrastructure
- Cons: More complex security rules, potential performance issues at scale

### Recommended Structure (if using Firestore)

```
schools/{schoolId}/staff_messages/{messageId}
  - from: userId
  - to: userId (or 'all' for broadcast)
  - schoolId: string
  - subject: string
  - body: string
  - timestamp: timestamp
  - read: boolean
  - recipients: array of userIds
```

## Security Considerations

1. **Authentication**: Verify user roles before allowing message creation
2. **Authorization**: Ensure users can only message staff in schools they're assigned to
3. **Data Privacy**: Messages should only be visible to intended recipients
4. **Audit Trail**: Log all messages for compliance and moderation
5. **Rate Limiting**: Prevent spam/abuse with rate limiting

## Future Enhancements

- Message threading
- File attachments
- Read receipts
- Message search
- Notifications (email, push)
- Message templates for common requests
- Integration with ticketing system for GAdmin requests

