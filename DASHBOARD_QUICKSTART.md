# Dashboard Expansion - Quick Start Guide

## 🚀 Getting Started with the New Dashboard

### Step 1: Test the New Dashboard

The new dashboard component is ready to use. To test it:

```typescript
// In your MainLayout.tsx or wherever Dashboard is rendered:
import Dashboard from './DashboardNew';

// Replace your existing Dashboard import:
<Dashboard
  user={user}
  userData={userData}
  subProfiles={subProfiles}
  setActiveTab={setActiveTab}
/>
```

### Step 2: Verify Role-Based Dashboards

The dashboard automatically detects the user's role from:
- `userData.activeProfileRole` (primary)
- `userData.accountTypes[0]` (fallback)

**Test with different roles:**
1. Producer → Shows beat sales, streaming revenue, collaborations
2. Studio → Shows bookings, room utilization, equipment alerts
3. Technician → Shows service requests, active jobs, warnings
4. Talent → Shows gigs, followers, profile views
5. EDUAdmin/EDUStaff/Student/Intern → Shows EDU dashboard
6. Fan/Other → Shows default dashboard

### Step 3: Check Activity Feed

The activity feed automatically aggregates:
- ✅ Posts from MongoDB
- ✅ Notifications from MongoDB
- ⏳ Bookings from Neon (skeleton ready)
- ⏳ Payments from Neon (skeleton ready)

**To add Neon data:**
1. Open `src/services/activityFeed.ts`
2. Uncomment the Neon import
3. Implement `fetchBookingActivity()` and `fetchPaymentActivity()`
4. Uncomment the calls in `fetchActivityFeed()`

### Step 4: Connect Real Data to Role Dashboards

Each role dashboard has mock data. To connect real data:

**Example for Producer Dashboard:**
```typescript
// In src/components/dashboard/role-views/ProducerDashboard.tsx
useEffect(() => {
  const fetchProducerData = async () => {
    const userId = user?.id;

    // Replace mock data with real queries:
    const beatSales = await getBeatSales(userId); // from Neon
    const revenue = await getStreamingRevenue(userId); // from Neon
    const collabs = await getCollaborationCount(userId); // from MongoDB

    setData({
      recentSales: beatSales,
      streamingRevenue: revenue,
      collaborationInvites: collabs,
      beatUploads: uploads
    });
  };

  fetchProducerData();
}, [user?.id]);
```

### Step 5: Add Navigation

Replace `console.log` in quick actions with actual navigation:

```typescript
// Add this import to role dashboards:
import { useNavigate } from 'react-router-dom';

// Inside component:
const navigate = useNavigate();

// Update quick actions:
const quickActions: QuickAction[] = [
  {
    id: 'new-beat',
    label: 'New Beat',
    icon: Plus,
    action: () => navigate('/studio'), // ← Real navigation
    variant: 'primary',
    roles: ['Producer']
  }
];
```

## 📁 What's Included

### ✅ Completed Components

**Type Definitions**
- `src/types/dashboard.ts` - All dashboard interfaces

**Sections**
- `GreetingSection` - Personalized header
- `ActivityFeedSection` - Unified activity stream
- `RoleMetrics` - Stats with trends
- `QuickActions` - Role-based shortcuts
- `NotificationsPanel` - Categorized alerts
- `WidgetGrid` - Layout manager

**Widgets**
- `StatsCard` - Single metric display
- `ActivityItemWidget` - Compact activity item
- `QuickActionCard` - Action button

**Role Dashboards**
- `ProducerDashboard` - Beat sales & collaborations
- `StudioDashboard` - Bookings & utilization
- `TechnicianDashboard` - Service requests
- `TalentDashboard` - Gigs & analytics
- `EDUDashboard` - Courses & assignments

**Services**
- `activityFeed.ts` - Data aggregation service

**Main Component**
- `DashboardNew.tsx` - Orchestrator component

## 🎨 Customization

Users can customize their dashboard:

1. Click "Customize" button (top right)
2. Add/remove widgets
3. Reorder widgets (drag-and-drop coming soon)
4. Layout auto-saves to `userData.settings.dashboard`

To reset:
```typescript
await handleResetLayout();
```

## 🔧 Configuration

### Dashboard Settings Structure

```typescript
interface DashboardConfig {
  layout: 'default' | 'custom';
  widgets: DashboardWidget[];
  role: string;
  lastUpdated?: Date;
}

interface DashboardWidget {
  id: string;
  type: 'stats' | 'feed' | 'quick-actions' | 'notifications' | 'custom';
  title?: string;
  size: 'small' | 'medium' | 'large' | 'full';
  position: { row: number; col: number };
  visible: boolean;
  config?: Record<string, any>;
}
```

## 🐛 Troubleshooting

**Dashboard not loading?**
- Check browser console for errors
- Verify `user?.id` is available
- Check `userData.activeProfileRole` is set

**Activity feed empty?**
- Verify MongoDB connection
- Check `src/services/activityFeed.ts` logs
- Ensure user has posts/notifications

**Wrong dashboard showing?**
- Verify `userData.activeProfileRole` value
- Check role is in `userData.accountTypes`
- Review role switch in `DashboardNew.tsx`

**Settings not saving?**
- Check MongoDB connection
- Verify `updateUserProfile()` in `unifiedUserData.ts`
- Review browser console for errors

## 📚 Additional Resources

- Full implementation guide: `DASHBOARD_IMPLEMENTATION.md`
- Type definitions: `src/types/dashboard.ts`
- Component examples: `src/components/dashboard/`
- Activity feed service: `src/services/activityFeed.ts`

## 🎯 Next Steps

1. **Test the dashboard** with different user roles
2. **Connect real data** sources (Neon bookings/payments)
3. **Add navigation** to quick actions
4. **Customize widgets** for your needs
5. **Gather user feedback** for improvements

---

**Need Help?**
- Check `DASHBOARD_IMPLEMENTATION.md` for detailed docs
- Review component types in `src/types/dashboard.ts`
- Check browser console for error messages
