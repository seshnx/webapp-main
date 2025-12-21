# Cross-App Agent Coordination Guide

## Overview

This repository contains documentation to help coordinate development between the Main App (`webapp-main`) and Business Center Module (`webapp-bcm`) when using separate Cursor agents.

## Key Documents

### 1. `CROSS_APP_INTEGRATION.md` ⭐ **START HERE**
**Purpose**: Shared contract between Main App and BCM agents

**Contains**:
- Data structure contracts (TypeScript interfaces)
- API query standards
- Service types and account types definitions
- Integration points and responsibilities
- Breaking change protocol

**When to Reference**:
- Before making changes to bookings, profiles, or shared data
- When adding new service types or account types
- When modifying authentication or database queries
- Before any breaking changes

### 2. `WEBAPP_BCM.md`
**Purpose**: BCM module documentation and planning

**Contains**:
- BCM feature specifications
- Component structure (proposed)
- Development roadmap
- Technical implementation details

**When to Reference**:
- Building BCM features
- Understanding BCM architecture
- Planning BCM development

### 3. `CHANGES_REVIEW.md`
**Purpose**: Review of changes made to Main App

**Contains**:
- Summary of EDU module removal
- Booking system changes
- Build optimizations
- Integration improvements

**When to Reference**:
- Understanding what was removed/changed
- Reviewing recent modifications
- Planning reintegration (if needed)

## Agent Coordination Workflow

### When Main App Agent Makes Changes:

1. **Check Integration Contract**: Review `CROSS_APP_INTEGRATION.md`
2. **Identify Impact**: Does this affect shared data or BCM?
3. **Update Documentation**: If breaking change, update integration contract
4. **Notify BCM Agent**: Reference integration doc in commit/PR
5. **Test Cross-App**: Verify integration still works

### When BCM Agent Makes Changes:

1. **Check Integration Contract**: Review `CROSS_APP_INTEGRATION.md`
2. **Verify Compatibility**: Ensure changes don't break Main App
3. **Update Documentation**: Document any new integration points
4. **Coordinate Changes**: If breaking change, coordinate with Main App
5. **Test Integration**: Verify Main App compatibility

## Quick Reference

### Shared Data Structures
- **Bookings**: See `CROSS_APP_INTEGRATION.md` → Booking Data Structure
- **Profiles**: See `CROSS_APP_INTEGRATION.md` → Profile Data Structure
- **Service Types**: Must match in both apps (see constants.js)
- **Account Types**: Must match in both apps

### Integration Points
- **Authentication**: Shared Supabase Auth (SSO)
- **Database**: Shared Supabase PostgreSQL
- **Bookings**: Main App creates, BCM manages (for studios)
- **Real-time**: Both apps subscribe to booking changes

### Breaking Change Protocol
1. Document in `CROSS_APP_INTEGRATION.md`
2. Update both apps simultaneously
3. Test cross-app functionality
4. Reference integration doc in commits

## Best Practices

### ✅ DO:
- Reference `CROSS_APP_INTEGRATION.md` before making changes
- Keep service types and account types in sync
- Test cross-app functionality after changes
- Update integration doc when making breaking changes
- Use shared data structures from integration contract

### ❌ DON'T:
- Modify shared data structures without coordination
- Change service types in one app without updating the other
- Remove fields from bookings/profiles without migration plan
- Make breaking changes without updating integration doc
- Assume one app's changes won't affect the other

## Communication

### Between Agents:
- Use `CROSS_APP_INTEGRATION.md` as the source of truth
- Reference specific sections when making changes
- Update version history in integration doc
- Document breaking changes clearly

### Example Commit Messages:
```
feat(bookings): Add new booking status 'rescheduled'

See CROSS_APP_INTEGRATION.md for updated Booking interface.
BCM agent: Please update booking status handling.
```

```
fix(integration): Sync service types with Main App

Updated SERVICE_TYPES to match Main App constants.js
See CROSS_APP_INTEGRATION.md → Service Types Contract
```

## Troubleshooting

### Integration Issues:
1. Check `CROSS_APP_INTEGRATION.md` for contract requirements
2. Verify data structures match exactly
3. Check service types and account types are identical
4. Verify Supabase queries match documented patterns
5. Test real-time subscriptions are working

### Data Mismatch:
1. Compare data structures in both apps
2. Check integration contract for expected structure
3. Verify database schema matches contract
4. Check for missing fields or type mismatches

---

**Last Updated**: December 2024  
**Purpose**: Coordinate development between Main App and BCM agents

