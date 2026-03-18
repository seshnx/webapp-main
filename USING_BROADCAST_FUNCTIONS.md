# Using Convex Broadcast Functions in React Components

Examples of how to use school broadcasts, announcements, and read tracking.

---

## 1. Broadcast Feed (Student/Staff View)

```typescript
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useEffect, useState } from 'react';

function BroadcastFeed({ schoolId, userId, userType }: {
  schoolId: Id<"schools">;
  userId: string;
  userType: 'student' | 'staff';
}) {
  const [activeTab, setActiveTab] = useState<'unread' | 'all' | 'read'>('unread');

  // Fetch broadcasts based on tab
  const unreadBroadcasts = useQuery(api.broadcasts.getUnreadBroadcasts, {
    userId,
    schoolId,
    userType,
  });

  const allBroadcasts = useQuery(api.broadcasts.getActiveBroadcasts, {
    schoolId,
  });

  const readBroadcasts = useQuery(api.broadcasts.getUserReadBroadcasts, {
    userId,
    schoolId,
  });

  const markAsRead = useMutation(api.broadcasts.markBroadcastAsRead);

  const handleMarkAsRead = async (broadcastId: Id<"broadcasts">) => {
    await markAsRead({ broadcastId, userId });
  };

  const broadcasts = activeTab === 'unread'
    ? unreadBroadcasts
    : activeTab === 'all'
    ? allBroadcasts
    : readBroadcasts?.map((r: any) => r.broadcast);

  return (
    <div className="broadcast-feed">
      <div className="header">
        <h1>Announcements</h1>
        <div className="tabs">
          <button
            onClick={() => setActiveTab('unread')}
            className={activeTab === 'unread' ? 'active' : ''}
          >
            Unread {unreadBroadcasts && unreadBroadcasts.length > 0 && (
              <span className="badge">{unreadBroadcasts.length}</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={activeTab === 'all' ? 'active' : ''}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab('read')}
            className={activeTab === 'read' ? 'active' : ''}
          >
            Read
          </button>
        </div>
      </div>

      <div className="broadcasts-list">
        {broadcasts?.length === 0 ? (
          <div className="empty-state">
            <p>No {activeTab} announcements</p>
          </div>
        ) : (
          broadcasts?.map((broadcast: any) => (
            <BroadcastCard
              key={broadcast._id}
              broadcast={broadcast}
              onRead={() => handleMarkAsRead(broadcast._id)}
              isRead={activeTab === 'read'}
            />
          ))
        )}
      </div>
    </div>
  );
}

function BroadcastCard({ broadcast, onRead, isRead }: {
  broadcast: any;
  onRead: () => void;
  isRead: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  const priorityConfig = {
    urgent: { color: 'red', icon: '🚨' },
    high: { color: 'orange', icon: '⚠️' },
    normal: { color: 'blue', icon: '📢' },
    low: { color: 'gray', icon: '📋' },
  };

  const categoryConfig = {
    announcement: { label: 'Announcement', icon: '📢' },
    emergency: { label: 'Emergency', icon: '🚨' },
    event: { label: 'Event', icon: '📅' },
    reminder: { label: 'Reminder', icon: '🔔' },
    news: { label: 'News', icon: '📰' },
  };

  const priority = priorityConfig[broadcast.priority as keyof typeof priorityConfig] || priorityConfig.normal;
  const category = broadcast.category
    ? categoryConfig[broadcast.category as keyof typeof categoryConfig]
    : null;

  const createdAt = new Date(broadcast.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={`broadcast-card priority-${broadcast.priority} ${isRead ? 'read' : 'unread'}`}
      onClick={() => {
        if (!isRead) {
          onRead();
        }
        setExpanded(!expanded);
      }}
    >
      <div className="broadcast-header">
        <div className="left">
          <span className="priority-icon">{priority.icon}</span>
          <h3>{broadcast.title}</h3>
          {category && (
            <span className="category-badge">
              {category.icon} {category.label}
            </span>
          )}
          {!isRead && <span className="unread-indicator">•</span>}
        </div>
        <div className="right">
          <span className="timestamp">{createdAt}</span>
          <button className="expand-btn">
            {expanded ? '▼' : '▶'}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="broadcast-content">
          <div className="author">
            <img src={broadcast.createdByPhoto || '/avatar.png'} alt="" />
            <span>{broadcast.createdByName}</span>
          </div>

          <div className="content">
            <p>{broadcast.content}</p>
          </div>

          {broadcast.attachments && broadcast.attachments.length > 0 && (
            <div className="attachments">
              <strong>Attachments:</strong>
              {broadcast.attachments.map((url: string, index: number) => (
                <a key={index} href={url} target="_blank" rel="noopener noreferrer">
                  Attachment {index + 1}
                </a>
              ))}
            </div>
          )}

          {broadcast.linkUrl && (
            <div className="link">
              <a href={broadcast.linkUrl} target="_blank" rel="noopener noreferrer" className="btn-link">
                {broadcast.linkLabel || 'Learn More'} →
              </a>
            </div>
          )}

          {broadcast.expiresAt && (
            <div className="expires">
              <small>Expires: {new Date(broadcast.expiresAt).toLocaleDateString()}</small>
            </div>
          )}

          {broadcast.readCount !== undefined && (
            <div className="read-count">
              <small>{broadcast.readCount} people read this</small>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

---

## 2. Create Broadcast Form (Admin)

```typescript
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useState } from 'react';
import { Id } from '@/convex/_generated/dataModel';

function CreateBroadcastForm({
  schoolId,
  userId,
  userName,
  userPhoto
}: {
  schoolId: Id<"schools">;
  userId: string;
  userName: string;
  userPhoto?: string;
}) {
  const createBroadcast = useMutation(api.broadcasts.createBroadcast);
  const publishBroadcast = useMutation(api.broadcasts.publishBroadcast);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    targetType: 'all',
    targetId: '',
    priority: 'normal',
    category: 'announcement',
    status: 'draft',
    scheduledFor: '',
    expiresAt: '',
    linkUrl: '',
    linkLabel: '',
    sendPush: false,
    sendEmail: false,
  });

  const [attachments, setAttachments] = useState<string[]>([]);

  const handleSubmit = async (publish: boolean = false) => {
    try {
      const result = await createBroadcast({
        schoolId,
        createdBy: userId,
        createdByName: userName,
        createdByPhoto: userPhoto,
        title: formData.title,
        content: formData.content,
        targetType: formData.targetType,
        targetId: formData.targetId || undefined,
        priority: formData.priority as any,
        category: formData.category,
        status: publish ? 'published' : 'draft',
        scheduledFor: formData.scheduledFor ? new Date(formData.scheduledFor).getTime() : undefined,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt).getTime() : undefined,
        linkUrl: formData.linkUrl || undefined,
        linkLabel: formData.linkLabel || undefined,
        attachments: attachments.length > 0 ? attachments : undefined,
        sendPush: formData.sendPush,
        sendEmail: formData.sendEmail,
      });

      if (publish) {
        await publishBroadcast({ broadcastId: result.broadcastId });
        alert('Broadcast published successfully!');
      } else {
        alert('Broadcast saved as draft!');
      }

      // Reset form
      setFormData({
        title: '',
        content: '',
        targetType: 'all',
        targetId: '',
        priority: 'normal',
        category: 'announcement',
        status: 'draft',
        scheduledFor: '',
        expiresAt: '',
        linkUrl: '',
        linkLabel: '',
        sendPush: false,
        sendEmail: false,
      });
      setAttachments([]);
    } catch (error) {
      console.error('Failed to create broadcast:', error);
      alert('Failed to create broadcast. Please try again.');
    }
  };

  return (
    <div className="create-broadcast-form">
      <h2>Create Announcement</h2>

      <div className="form-group">
        <label>Title *</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Announcement title"
          required
        />
      </div>

      <div className="form-group">
        <label>Content *</label>
        <textarea
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder="What's your announcement?"
          rows={6}
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Target Audience *</label>
          <select
            value={formData.targetType}
            onChange={(e) => setFormData({ ...formData, targetType: e.target.value })}
          >
            <option value="all">Everyone</option>
            <option value="students">Students Only</option>
            <option value="staff">Staff Only</option>
            <option value="specific">Specific User</option>
          </select>
        </div>

        {formData.targetType === 'specific' && (
          <div className="form-group">
            <label>User ID *</label>
            <input
              type="text"
              value={formData.targetId}
              onChange={(e) => setFormData({ ...formData, targetId: e.target.value })}
              placeholder="Enter user ID"
            />
          </div>
        )}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Priority</label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
          >
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div className="form-group">
          <label>Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          >
            <option value="announcement">📢 Announcement</option>
            <option value="emergency">🚨 Emergency</option>
            <option value="event">📅 Event</option>
            <option value="reminder">🔔 Reminder</option>
            <option value="news">📰 News</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Schedule For (Optional)</label>
          <input
            type="datetime-local"
            value={formData.scheduledFor}
            onChange={(e) => setFormData({ ...formData, scheduledFor: e.target.value })}
          />
          <small>Leave empty to publish immediately</small>
        </div>

        <div className="form-group">
          <label>Expires At (Optional)</label>
          <input
            type="datetime-local"
            value={formData.expiresAt}
            onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
          />
          <small>When should this announcement expire?</small>
        </div>
      </div>

      <div className="form-group">
        <label>Link URL (Optional)</label>
        <input
          type="url"
          value={formData.linkUrl}
          onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
          placeholder="https://example.com"
        />
      </div>

      {formData.linkUrl && (
        <div className="form-group">
          <label>Link Label</label>
          <input
            type="text"
            value={formData.linkLabel}
            onChange={(e) => setFormData({ ...formData, linkLabel: e.target.value })}
            placeholder="Learn More"
          />
        </div>
      )}

      <div className="form-group">
        <label>Attachments (Optional)</label>
        <input
          type="file"
          multiple
          onChange={(e) => {
            // Handle file upload - would need to upload to storage first
            const files = Array.from(e.target.files || []);
            // Upload to Vercel Blob or similar
            // setAttachments([...attachments, ...uploadedUrls]);
          }}
        />
        {attachments.length > 0 && (
          <div className="attachments-preview">
            {attachments.map((url, index) => (
              <div key={index} className="attachment-item">
                <a href={url} target="_blank" rel="noopener noreferrer">
                  Attachment {index + 1}
                </a>
                <button onClick={() => {
                  setAttachments(attachments.filter((_, i) => i !== index));
                }}>Remove</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="form-group">
        <label>Notifications</label>
        <div className="checkbox-group">
          <label>
            <input
              type="checkbox"
              checked={formData.sendPush}
              onChange={(e) => setFormData({ ...formData, sendPush: e.target.checked })}
            />
            Send Push Notification
          </label>
          <label>
            <input
              type="checkbox"
              checked={formData.sendEmail}
              onChange={(e) => setFormData({ ...formData, sendEmail: e.target.checked })}
            />
            Send Email
          </label>
        </div>
      </div>

      <div className="form-actions">
        <button
          onClick={() => handleSubmit(false)}
          className="btn-secondary"
        >
          Save as Draft
        </button>
        <button
          onClick={() => handleSubmit(true)}
          className="btn-primary"
        >
          {formData.scheduledFor ? 'Schedule Broadcast' : 'Publish Now'}
        </button>
      </div>
    </div>
  );
}
```

---

## 3. Admin Broadcast Dashboard

```typescript
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useState } from 'react';

function BroadcastDashboard({ schoolId }: { schoolId: Id<"schools"> }) {
  const [activeTab, setActiveTab] = useState<'published' | 'draft' | 'scheduled' | 'archived'>('published');
  const [selectedBroadcast, setSelectedBroadcast] = useState<Id<"broadcasts"> | null>(null);

  // Fetch broadcasts by status
  const publishedBroadcasts = useQuery(api.broadcasts.getBroadcastsBySchool, {
    schoolId,
    status: 'published',
  });

  const draftBroadcasts = useQuery(api.broadcasts.getDraftBroadcasts, {
    schoolId,
  });

  const scheduledBroadcasts = useQuery(api.broadcasts.getScheduledBroadcasts, {
    schoolId,
  });

  const archivedBroadcasts = useQuery(api.broadcasts.getBroadcastsBySchool, {
    schoolId,
    status: 'archived',
  });

  const stats = useQuery(api.broadcasts.getBroadcastStats, {
    schoolId,
  });

  const deleteBroadcast = useMutation(api.broadcasts.deleteBroadcast);
  const archiveBroadcast = useMutation(api.broadcasts.archiveBroadcast);
  const publishBroadcast = useMutation(api.broadcasts.publishBroadcast);

  const broadcasts = activeTab === 'published'
    ? publishedBroadcasts
    : activeTab === 'draft'
    ? draftBroadcasts
    : activeTab === 'scheduled'
    ? scheduledBroadcasts
    : archivedBroadcasts;

  return (
    <div className="broadcast-dashboard">
      <div className="header">
        <h1>Broadcast Management</h1>
        <button onClick={() => {/* Navigate to create form */}}>
          + New Announcement
        </button>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>{stats.byStatus.published}</h3>
            <p>Published</p>
          </div>
          <div className="stat-card">
            <h3>{stats.byStatus.draft}</h3>
            <p>Drafts</p>
          </div>
          <div className="stat-card">
            <h3>{stats.byStatus.scheduled}</h3>
            <p>Scheduled</p>
          </div>
          <div className="stat-card">
            <h3>{stats.totalReads}</h3>
            <p>Total Reads</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        <button
          onClick={() => setActiveTab('published')}
          className={activeTab === 'published' ? 'active' : ''}
        >
          Published ({publishedBroadcasts?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('draft')}
          className={activeTab === 'draft' ? 'active' : ''}
        >
          Drafts ({draftBroadcasts?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('scheduled')}
          className={activeTab === 'scheduled' ? 'active' : ''}
        >
          Scheduled ({scheduledBroadcasts?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('archived')}
          className={activeTab === 'archived' ? 'active' : ''}
        >
          Archived ({archivedBroadcasts?.length || 0})
        </button>
      </div>

      {/* Broadcasts List */}
      <div className="broadcasts-list">
        {broadcasts?.map((broadcast) => (
          <AdminBroadcastCard
            key={broadcast._id}
            broadcast={broadcast}
            onEdit={() => setSelectedBroadcast(broadcast._id)}
            onDelete={async () => {
              if (confirm('Are you sure you want to delete this broadcast?')) {
                await deleteBroadcast({ broadcastId: broadcast._id });
              }
            }}
            onArchive={async () => {
              await archiveBroadcast({ broadcastId: broadcast._id });
            }}
            onPublish={async () => {
              await publishBroadcast({ broadcastId: broadcast._id });
            }}
          />
        ))}
      </div>
    </div>
  );
}

function AdminBroadcastCard({
  broadcast,
  onEdit,
  onDelete,
  onArchive,
  onPublish
}: {
  broadcast: any;
  onEdit: () => void;
  onDelete: () => void;
  onArchive: () => void;
  onPublish: () => void;
}) {
  const reads = useQuery(api.broadcasts.getBroadcastReads, {
    broadcastId: broadcast._id,
  });

  const createdAt = new Date(broadcast.createdAt).toLocaleDateString();
  const scheduledFor = broadcast.scheduledFor
    ? new Date(broadcast.scheduledFor).toLocaleString()
    : null;

  return (
    <div className={`admin-broadcast-card priority-${broadcast.priority}`}>
      <div className="card-header">
        <div className="title-section">
          <h3>{broadcast.title}</h3>
          <span className={`priority-badge ${broadcast.priority}`}>
            {broadcast.priority}
          </span>
          <span className="category-badge">{broadcast.category}</span>
          <span className="target-badge">
            Target: {broadcast.targetType}
          </span>
        </div>
        <div className="status-badge">{broadcast.status}</div>
      </div>

      <div className="card-content">
        <p>{broadcast.content.substring(0, 150)}...</p>
      </div>

      <div className="card-meta">
        <span>By: {broadcast.createdByName}</span>
        <span>Created: {createdAt}</span>
        {scheduledFor && <span>Scheduled: {scheduledFor}</span>}
        <span>Reads: {broadcast.readCount || 0}</span>
      </div>

      <div className="card-actions">
        <button onClick={onEdit}>Edit</button>
        {broadcast.status === 'draft' && (
          <button onClick={onPublish}>Publish</button>
        )}
        {broadcast.status === 'published' && (
          <button onClick={onArchive}>Archive</button>
        )}
        <button onClick={onDelete} className="btn-danger">
          Delete
        </button>
      </div>

      {/* Read Details */}
      {reads && reads.length > 0 && (
        <details className="read-details">
          <summary>Read by {reads.length} people</summary>
          <ul>
            {reads.map((read: any) => (
              <li key={read._id}>
                {new Date(read.readAt).toLocaleString()} - User ID: {read.userId}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
```

---

## 4. Analytics Dashboard

```typescript
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useState } from 'react';

function BroadcastAnalytics({ schoolId }: { schoolId: Id<"schools"> }) {
  const [dateRange, setDateRange] = useState<{
    startDate?: number;
    endDate?: number;
  }>({
    startDate: undefined,
    endDate: undefined,
  });

  const stats = useQuery(api.broadcasts.getBroadcastStats, {
    schoolId,
    ...dateRange,
  });

  const handleDateChange = (type: 'start' | 'end', value: string) => {
    const timestamp = value ? new Date(value).getTime() : undefined;
    setDateRange({
      ...dateRange,
      [type === 'start' ? 'startDate' : 'endDate']: timestamp,
    });
  };

  return (
    <div className="analytics-dashboard">
      <div className="header">
        <h1>Broadcast Analytics</h1>

        {/* Date Range Filter */}
        <div className="date-filter">
          <input
            type="date"
            onChange={(e) => handleDateChange('start', e.target.value)}
          />
          <span>to</span>
          <input
            type="date"
            onChange={(e) => handleDateChange('end', e.target.value)}
          />
          <button onClick={() => setDateRange({ startDate: undefined, endDate: undefined })}>
            Clear
          </button>
        </div>
      </div>

      {stats && (
        <>
          {/* Overview Stats */}
          <div className="stats-section">
            <h2>Overview</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>{stats.total}</h3>
                <p>Total Broadcasts</p>
              </div>
              <div className="stat-card">
                <h3>{stats.totalReads}</h3>
                <p>Total Reads</p>
              </div>
              <div className="stat-card">
                <h3>{stats.avgReadsPerBroadcast}</h3>
                <p>Avg Reads/Broadcast</p>
              </div>
            </div>
          </div>

          {/* Status Breakdown */}
          <div className="section">
            <h2>By Status</h2>
            <div className="breakdown-grid">
              <div className="breakdown-item">
                <span className="label">Published</span>
                <div className="bar">
                  <div
                    className="fill published"
                    style={{ width: `${(stats.byStatus.published / stats.total) * 100}%` }}
                  />
                </div>
                <span className="count">{stats.byStatus.published}</span>
              </div>
              <div className="breakdown-item">
                <span className="label">Draft</span>
                <div className="bar">
                  <div
                    className="fill draft"
                    style={{ width: `${(stats.byStatus.draft / stats.total) * 100}%` }}
                  />
                </div>
                <span className="count">{stats.byStatus.draft}</span>
              </div>
              <div className="breakdown-item">
                <span className="label">Scheduled</span>
                <div className="bar">
                  <div
                    className="fill scheduled"
                    style={{ width: `${(stats.byStatus.scheduled / stats.total) * 100}%` }}
                  />
                </div>
                <span className="count">{stats.byStatus.scheduled}</span>
              </div>
              <div className="breakdown-item">
                <span className="label">Archived</span>
                <div className="bar">
                  <div
                    className="fill archived"
                    style={{ width: `${(stats.byStatus.archived / stats.total) * 100}%` }}
                  />
                </div>
                <span className="count">{stats.byStatus.archived}</span>
              </div>
            </div>
          </div>

          {/* Priority Breakdown */}
          <div className="section">
            <h2>By Priority</h2>
            <div className="priority-grid">
              {Object.entries(stats.byPriority).map(([priority, count]) => (
                <div key={priority} className={`priority-card ${priority}`}>
                  <span className="priority-label">{priority}</span>
                  <span className="count">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="section">
            <h2>By Category</h2>
            <div className="category-list">
              {Object.entries(stats.byCategory).map(([category, count]) => (
                <div key={category} className="category-item">
                  <span className="category-label">{category}</span>
                  <span className="count">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Target Breakdown */}
          <div className="section">
            <h2>By Target Audience</h2>
            <div className="target-grid">
              {Object.entries(stats.byTargetType).map(([target, count]) => (
                <div key={target} className="target-item">
                  <span className="target-label">{target}</span>
                  <span className="count">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
```

---

## Common Patterns

### Poll for New Broadcasts
```typescript
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

function BroadcastNotification({ userId, schoolId, userType }: {
  userId: string;
  schoolId: Id<"schools">;
  userType: 'student' | 'staff';
}) {
  const unreadBroadcasts = useQuery(api.broadcasts.getUnreadBroadcasts, {
    userId,
    schoolId,
    userType,
  });

  // Show notification badge if there are urgent broadcasts
  const urgentCount = unreadBroadcasts?.filter(
    (b) => b.priority === 'urgent'
  ).length || 0;

  return (
    <div className="notification-icon">
      🔔
      {urgentCount > 0 && (
        <span className="urgent-badge">{urgentCount}</span>
      )}
    </div>
  );
}
```

### Mark Multiple as Read
```typescript
const markAsRead = useMutation(api.broadcasts.markBroadcastAsRead);

const markAllAsRead = async () => {
  for (const broadcast of unreadBroadcasts) {
    await markAsRead({
      broadcastId: broadcast._id,
      userId,
    });
  }
};
```

### Auto-Publish Scheduled Broadcasts
```typescript
// This would run in a Convex action or cron job
import { action } from "./_generated/server";

export const publishScheduledBroadcasts = action({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // Get scheduled broadcasts that should be published
    const scheduled = await ctx.runQuery(api.broadcasts.getScheduledBroadcasts, {});

    for (const broadcast of scheduled) {
      if (broadcast.scheduledFor && broadcast.scheduledFor <= now) {
        await ctx.runMutation(api.broadcasts.publishBroadcast, {
          broadcastId: broadcast._id,
          publishImmediately: true,
        });
      }
    }
  },
});
```

---

## Next Steps

1. ✅ Broadcast functions created
2. ⏳ Use in your components
3. ⏳ Add push notification integration
4. ⏳ Add email notification integration
5. ⏳ Set up scheduled publishing cron job

All your broadcast features are ready to go! 📢
