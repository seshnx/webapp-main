# Business Center Module (BCM) - Documentation

> **⚠️ IMPORTANT: This is a PLANNING/REFERENCE document only.**
> 
> - The file structure shown below is **PROPOSED/PLANNED** - these files do not exist yet
> - This document describes **what should be built**, not what currently exists
> - **DO NOT delete any files** based on this document
> - This is a **blueprint for future development**, not a list of existing files to modify

> **🔗 CROSS-APP INTEGRATION**: See `CROSS_APP_INTEGRATION.md` for shared contracts, data structures, and integration requirements between Main App and BCM.

## Overview

The Business Center Module (BCM) is a specialized subdomain application (`bcm.seshnx.com`) designed for business-focused users to manage their operations, studio facilities, and business workflows. It serves as a control center for studios, labels, agents, and other business entities on the SeshNx platform.

## Architecture

### Subdomain Structure
- **Main App**: `app.seshnx.com` - User-facing application for all creators
- **BCM**: `bcm.seshnx.com` - Business operations and studio management
- **EDU**: `edu.seshnx.com` - Educational institution module (separate)

### Shared Infrastructure
- **Authentication**: Shared Supabase Auth across all subdomains
- **Database**: Shared Supabase database with role-based access
- **User Sessions**: Single sign-on (SSO) across subdomains

## Target Users

BCM is designed for users with business-focused account types:

- **Studio** - Recording studio owners and managers
- **Label** - Record label representatives
- **Agent** - Talent agents and managers
- **Producer** - Music producers managing projects
- **Engineer** - Audio engineers managing sessions
- **Talent** - Artists managing their business operations

## Core Features

### 1. Studio Management Dashboard

#### Studio Overview
- **Real-time Availability**: Current booking status and calendar view
- **Revenue Analytics**: Earnings, pending payments, transaction history
- **Booking Statistics**: 
  - Total bookings (sent/received)
  - "Booked Me" count (incoming bookings)
  - "We Booked" count (outgoing bookings)
  - Booking completion rates
- **Equipment Status**: Track studio equipment and maintenance schedules

#### Studio Calendar
- **Multi-view Calendar**: Day, week, month views
- **Booking Management**: View, edit, confirm, cancel bookings
- **Availability Blocking**: Block time slots for maintenance or private use
- **Recurring Bookings**: Set up repeating sessions
- **Resource Allocation**: Assign rooms, engineers, equipment to bookings

#### Studio Settings
- **Profile Management**: Studio name, description, location, amenities
- **Pricing**: Hourly rates, day rates, package deals
- **Availability**: Operating hours, blackout dates, maintenance windows
- **Equipment Inventory**: List and manage studio equipment
- **Staff Management**: Add/manage engineers, assistants, staff members

### 2. Booking Operations

#### Booking Types (Handled in Main App)
**Note**: All user bookings (creating, receiving, managing) are handled in the main app (`app.seshnx.com`). BCM provides a **control center** for studio owners to manage their studio's operations.

**Service Types Available:**
- **General**: Session, Lesson, Consultation, Rehearsal, Collaboration
- **Studio**: Studio Time, Mixing Session, Mastering Session, Live Room Rental, Isolation Booth Rental
- **Engineering**: Mixing, Mastering, Recording, Editing, Sound Design
- **Production**: Beat Production, Full Production, Arrangement, Programming
- **Talent**: Vocal Recording, Feature Verse, Background Vocals, Live Performance

#### Booking Status Workflow
1. **Pending** - Booking request sent, awaiting confirmation
2. **Confirmed** - Booking accepted by target
3. **In Progress** - Session currently active
4. **Completed** - Session finished, payment processing
5. **Cancelled** - Booking cancelled by either party

### 3. Financial Management

#### Payment Processing
- **Stripe Integration**: Secure payment processing via Stripe Connect
- **Payout Management**: Track earnings, pending payouts, transaction history
- **Fee Structure**: Platform fees (0-20% based on subscription tier)
- **Invoicing**: Generate and send invoices for bookings
- **Tax Documentation**: Track earnings for tax purposes

#### Revenue Analytics
- **Earnings Dashboard**: Total revenue, monthly trends, projections
- **Payment Status**: Pending, completed, failed payments
- **Refund Management**: Process refunds and disputes
- **Financial Reports**: Export financial data for accounting

### 4. Team & Roster Management

#### For Labels & Agents
- **Artist Roster**: Manage signed artists and their profiles
- **Booking on Behalf**: Create bookings for roster artists
- **Revenue Sharing**: Track earnings per artist
- **Contract Management**: Store and manage artist contracts

#### For Studios
- **Staff Management**: Add engineers, assistants, technicians
- **Role Permissions**: Assign access levels to staff members
- **Scheduling**: Manage staff schedules and availability
- **Performance Tracking**: Monitor staff booking completion rates

### 5. Analytics & Reporting

#### Business Metrics
- **Booking Trends**: Booking volume over time
- **Revenue Trends**: Revenue growth and patterns
- **Client Analytics**: Top clients, repeat bookings, client retention
- **Service Popularity**: Most requested service types
- **Peak Times**: Identify busiest days/times for optimization

#### Custom Reports
- **Revenue Reports**: Monthly, quarterly, annual revenue breakdowns
- **Booking Reports**: Booking statistics and trends
- **Client Reports**: Client activity and engagement
- **Export Options**: CSV, PDF export for accounting/analysis

### 6. Communication Hub

#### Messaging Integration
- **Direct Messages**: Communicate with clients and collaborators
- **Booking Messages**: Contextual messages within booking workflows
- **Notifications**: Real-time updates for bookings, payments, messages
- **Email Integration**: Send automated emails for booking confirmations

## Technical Implementation

### Component Structure

> **📋 NOTE: This is a PROPOSED file structure for future development.**
> **These files do NOT exist yet and should NOT be deleted.**
> **This structure shows what SHOULD be created when building BCM.**

```
src/
├── components/
│   ├── BusinessCenter/
│   │   ├── BusinessCenter.jsx          # Main dashboard component (TO BE CREATED)
│   │   ├── StudioDashboard.jsx         # Studio overview (TO BE CREATED)
│   │   ├── StudioCalendar.jsx         # Calendar view (TO BE CREATED)
│   │   ├── BookingManagement.jsx     # Booking operations (TO BE CREATED)
│   │   ├── FinancialDashboard.jsx    # Revenue & payments (TO BE CREATED)
│   │   ├── TeamManagement.jsx         # Staff/roster management (TO BE CREATED)
│   │   ├── Analytics.jsx              # Business analytics (TO BE CREATED)
│   │   └── Settings/
│   │       ├── StudioSettings.jsx     # Studio configuration (TO BE CREATED)
│   │       ├── PricingSettings.jsx   # Rate management (TO BE CREATED)
│   │       └── EquipmentManagement.jsx # Equipment tracking (TO BE CREATED)
│   └── shared/
│       ├── BookingCalendar.jsx        # Reusable calendar component (EXISTS in main app)
│       └── RevenueChart.jsx           # Revenue visualization (TO BE CREATED)
├── hooks/
│   ├── useStudioBookings.js          # Booking data hook (TO BE CREATED)
│   ├── useRevenue.js                 # Revenue data hook (TO BE CREATED)
│   └── useStudioAnalytics.js         # Analytics data hook (TO BE CREATED)
└── utils/
    ├── bookingHelpers.js             # Booking utilities (TO BE CREATED)
    └── revenueHelpers.js             # Financial calculations (TO BE CREATED)
```

### Database Schema

> **📋 NOTE: These are REFERENCE schemas showing the expected database structure.**
> **DO NOT modify or delete existing database tables based on this documentation.**

#### Bookings Table
```sql
bookings (
  id UUID PRIMARY KEY,
  sender_id UUID REFERENCES profiles(id),
  target_id UUID REFERENCES profiles(id),
  service_type TEXT,
  date TIMESTAMP,
  duration INTEGER, -- hours
  status TEXT, -- pending, confirmed, completed, cancelled
  offer_amount DECIMAL,
  message TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

#### Studio Profiles
```sql
profiles (
  id UUID PRIMARY KEY,
  account_types TEXT[], -- ['Studio', 'Label', etc.]
  studio_name TEXT,
  address TEXT,
  hourly_rate DECIMAL,
  day_rate DECIMAL,
  availability_status TEXT,
  amenities TEXT[],
  equipment JSONB,
  staff_members JSONB[]
)
```

### API Integration

#### Supabase Queries
- **Bookings**: Real-time subscriptions for booking updates
- **Revenue**: Aggregate queries for financial data
- **Analytics**: Complex queries for business metrics
- **User Data**: Profile and account type verification

#### Stripe Integration
- **Connect Accounts**: Onboard studios for payments
- **Payouts**: Track and manage payouts
- **Webhooks**: Handle payment events
- **Invoicing**: Generate invoices

## User Access & Permissions

### Access Control
- **Business Account Types**: Users with Studio, Label, Agent, Producer, Engineer, or Talent roles
- **Role-Based Features**: Different features based on account type
- **Staff Permissions**: Studio owners can grant limited access to staff

### Navigation
- **Sidebar Link**: "Business Center" appears in main app sidebar for business users
- **Direct Access**: Navigate to `bcm.seshnx.com` for full BCM experience
- **SSO**: Seamless authentication across subdomains

## Integration with Main App

> **🔗 See `CROSS_APP_INTEGRATION.md` for detailed integration contracts, data structures, and coordination requirements.**

### Booking Flow
1. **Main App**: Users create bookings in `app.seshnx.com`
2. **BCM**: Studio owners view and manage bookings in `bcm.seshnx.com`
3. **Shared Database**: Both apps read/write to same `bookings` table
4. **Real-time Sync**: Supabase subscriptions keep data synchronized

### Data Flow
```
User creates booking (Main App)
    ↓
Booking saved to Supabase
    ↓
BCM receives real-time update
    ↓
Studio owner manages booking (BCM)
    ↓
Status updates sync to Main App
```

### Integration Contract
- **Shared Data Structures**: See `CROSS_APP_INTEGRATION.md` for exact TypeScript interfaces
- **Service Types**: Must match Main App exactly (see constants.js)
- **Account Types**: Must match Main App exactly
- **API Queries**: Standardized Supabase queries documented in integration contract
- **Breaking Changes**: Coordinate via integration document before making changes

## Development Roadmap

> **📋 REMINDER: These are tasks to CREATE new features, NOT to delete existing code.**

### Phase 1: Core Studio Management ✅
- [x] Studio dashboard layout
- [x] Basic booking view
- [ ] Calendar integration
- [ ] Availability management

### Phase 2: Financial Features
- [ ] Revenue dashboard
- [ ] Payment tracking
- [ ] Stripe Connect integration
- [ ] Payout management

### Phase 3: Advanced Features
- [ ] Team/staff management
- [ ] Equipment tracking
- [ ] Analytics & reporting
- [ ] Automated notifications

### Phase 4: Optimization
- [ ] Performance optimization
- [ ] Mobile responsiveness
- [ ] Advanced filtering
- [ ] Bulk operations

## Environment Variables

```env
# Supabase (Shared)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key
STRIPE_SECRET_KEY=your_stripe_secret

# Sentry (Error Monitoring)
VITE_SENTRY_DSN=your_sentry_dsn

# Domain Configuration
VITE_MAIN_APP_URL=https://app.seshnx.com
VITE_BCM_URL=https://bcm.seshnx.com
```

## Deployment

### Vercel Configuration
- **Project Name**: `webapp-bcm`
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Domain Setup
1. Add custom domain `bcm.seshnx.com` in Vercel
2. Configure DNS records
3. Enable SSL certificate
4. Set up environment variables

## Testing Checklist

### Studio Management
- [ ] View studio dashboard
- [ ] Update studio settings
- [ ] Manage availability
- [ ] View booking calendar
- [ ] Confirm/cancel bookings

### Financial
- [ ] View revenue dashboard
- [ ] Track payments
- [ ] Process payouts
- [ ] Generate invoices

### Team Management
- [ ] Add staff members
- [ ] Assign permissions
- [ ] Manage roster (for labels/agents)

### Integration
- [ ] SSO authentication
- [ ] Real-time booking updates
- [ ] Cross-subdomain navigation

## Support & Resources

### Documentation
- Main App Docs: `README.md`
- EDU Module: `WEBAPP_EDU.md`
- Build Environment: `BUILD_ENVIRONMENT_RECOMMENDATIONS.md`
- Vercel Setup: `VERCEL_INTEGRATIONS_SETUP.md`

### Key Contacts
- **Legal**: legal@seshnx.com
- **Technical Support**: support@seshnx.com

## Notes

### Current Status
- **BCM Component**: Referenced in `MainLayout.jsx` but component file doesn't exist yet
- **Booking System**: Currently in main app (`BookingSystem.jsx`) - **DO NOT DELETE**
- **Scope**: BCM should focus on **studio operations management**, not booking creation
- **Separation**: All user bookings remain in main app; BCM is a control center

### ⚠️ Important Reminders
- **This is a PLANNING document** - it describes what should be built
- **File paths shown are PROPOSED** - they don't exist yet
- **DO NOT delete existing files** based on this documentation
- **DO NOT modify existing components** unless explicitly instructed
- This document is for **reference and planning purposes only**

### Future Considerations
- Extract BCM to separate repository
- Implement micro-frontend architecture
- Add advanced analytics
- Integrate with external calendar systems (Google Calendar, Outlook)
- Mobile app support

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Status**: Planning/Development

