# Using Convex User Functions in React Components

This guide shows you how to use the new Convex user functions in your React components.

---

## 1. Basic User Display

```typescript
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

function UserProfile({ clerkId }: { clerkId: string }) {
  // Get user data
  const user = useQuery(api.users.getUserByClerkId, { clerkId });

  if (user === undefined) {
    return <div>Loading...</div>;
  }

  if (user === null) {
    return <div>User not found</div>;
  }

  return (
    <div>
      <img src={user.avatarUrl || '/default-avatar.png'} alt={user.displayName} />
      <h2>{user.displayName}</h2>
      <p>{user.bio}</p>
      <p>{user.location}</p>
    </div>
  );
}
```

---

## 2. Profile Editing

```typescript
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useState } from 'react';

function EditProfileForm({ clerkId }: { clerkId: string }) {
  const user = useQuery(api.users.getUserByClerkId, { clerkId });
  const updateProfile = useMutation(api.users.updateProfile);

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');

  // Load existing data when user loads
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setBio(user.bio || '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateProfile({
        clerkId,
        displayName,
        bio,
      });
      alert('Profile updated!');
    } catch (error) {
      alert('Error updating profile: ' + error);
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        placeholder="Display Name"
      />
      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        placeholder="Bio"
      />
      <button type="submit">Save Profile</button>
    </form>
  );
}
```

---

## 3. Follow System

```typescript
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

function FollowButton({ followerId, followingId }: {
  followerId: string;
  followingId: string;
}) {
  // Check if following
  const isFollowing = useQuery(api.users.isFollowing, {
    followerId,
    followingId,
  });

  const followUser = useMutation(api.users.followUser);
  const unfollowUser = useMutation(api.users.unfollowUser);

  const handleFollowToggle = async () => {
    if (isFollowing) {
      await unfollowUser({ followerId, followingId });
    } else {
      await followUser({ followerId, followingId });
    }
  };

  if (isFollowing === undefined) {
    return <button disabled>Loading...</button>;
  }

  return (
    <button onClick={handleFollowToggle}>
      {isFollowing ? 'Unfollow' : 'Follow'}
    </button>
  );
}

// Display followers/following count
function FollowStats({ userId }: { userId: string }) {
  const followers = useQuery(api.users.getFollowers, { userId });
  const following = useQuery(api.users.getFollowing, { userId });

  return (
    <div>
      <p>{followers?.length || 0} Followers</p>
      <p>{following?.length || 0} Following</p>
    </div>
  );
}
```

---

## 4. Sub-Profile Management

```typescript
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

function SubProfiles({ userId }: { userId: string }) {
  const subProfiles = useQuery(api.users.getSubProfiles, { userId });
  const createSubProfile = useMutation(api.users.createSubProfile);

  const handleCreateSubProfile = async (role: string) => {
    await createSubProfile({
      userId,
      role,
      displayName: `My ${role} Profile`,
      bio: '',
    });
  };

  return (
    <div>
      <h3>My Profiles</h3>
      {subProfiles?.map((profile) => (
        <div key={profile._id}>
          <h4>{profile.role}: {profile.displayName}</h4>
        </div>
      ))}

      <button onClick={() => handleCreateSubProfile('Talent')}>
        Add Talent Profile
      </button>
      <button onClick={() => handleCreateSubProfile('Studio')}>
        Add Studio Profile
      </button>
    </div>
  );
}
```

---

## 5. Search Users

```typescript
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useState } from 'react';

function UserSearch() {
  const [searchTerm, setSearchTerm] = useState('');

  // Search users with debouncing (you'd want to add this)
  const searchResults = useQuery(api.users.searchUsers, {
    searchText: searchTerm,
    limit: 10,
  });

  return (
    <div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search users..."
      />

      <ul>
        {searchResults?.map((user) => (
          <li key={user._id}>
            <img src={user.avatarUrl || '/default.png'} alt={user.displayName} />
            <span>{user.displayName}</span>
            <span>@{user.username}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

## 6. Update Last Active (for presence)

```typescript
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useEffect } from 'react';

function PresenceTracker({ clerkId }: { clerkId: string }) {
  const updateLastActive = useMutation(api.users.updateLastActive);

  // Update last active every minute
  useEffect(() => {
    const interval = setInterval(() => {
      updateLastActive({ clerkId });
    }, 60000); // Every minute

    return () => clearInterval(interval);
  }, [clerkId, updateLastActive]);

  // Also update on mount
  useEffect(() => {
    updateLastActive({ clerkId });
  }, [clerkId, updateLastActive]);

  return null; // This component doesn't render anything
}
```

---

## 7. Complete Profile Component Example

```typescript
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useState, useEffect } from 'react';

function CompleteProfile({ clerkId }: { clerkId: string }) {
  const user = useQuery(api.users.getUserByClerkId, { clerkId });
  const followers = useQuery(api.users.getFollowers, { userId: user?._id });
  const following = useQuery(api.users.getFollowing, { userId: user?._id });
  const subProfiles = useQuery(api.users.getSubProfiles, { userId: user?._id });

  const updateProfile = useMutation(api.users.updateProfile);
  const followUser = useMutation(api.users.followUser);
  const unfollowUser = useMutation(api.users.unfollowUser);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: '',
    bio: '',
    location: '',
    website: '',
  });

  // Load form data when editing starts
  useEffect(() => {
    if (user && isEditing) {
      setEditForm({
        displayName: user.displayName || '',
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
      });
    }
  }, [user, isEditing]);

  if (user === undefined) {
    return <div className="loading">Loading profile...</div>;
  }

  if (user === null) {
    return <div className="error">User not found</div>;
  }

  const handleSave = async () => {
    try {
      await updateProfile({
        clerkId: user.clerkId,
        ...editForm,
      });
      setIsEditing(false);
    } catch (error) {
      alert('Error updating profile: ' + error);
    }
  };

  return (
    <div className="profile">
      {/* Banner */}
      {user.bannerUrl && (
        <img src={user.bannerUrl} alt="Banner" className="banner" />
      )}

      {/* Avatar */}
      <img
        src={user.avatarUrl || '/default-avatar.png'}
        alt={user.displayName}
        className="avatar"
      />

      {/* Profile Info */}
      {isEditing ? (
        <div className="edit-form">
          <input
            value={editForm.displayName}
            onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
            placeholder="Display Name"
          />
          <textarea
            value={editForm.bio}
            onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
            placeholder="Bio"
          />
          <input
            value={editForm.location}
            onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
            placeholder="Location"
          />
          <input
            value={editForm.website}
            onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
            placeholder="Website"
          />
          <button onClick={handleSave}>Save</button>
          <button onClick={() => setIsEditing(false)}>Cancel</button>
        </div>
      ) : (
        <div className="profile-info">
          <h1>{user.displayName}</h1>
          <p>@{user.username}</p>
          <p>{user.headline}</p>
          <p>{user.bio}</p>
          <p>📍 {user.location}</p>
          {user.website && (
            <a href={user.website} target="_blank" rel="noopener noreferrer">
              {user.website}
            </a>
          )}

          {/* Skills */}
          {user.skills && user.skills.length > 0 && (
            <div className="skills">
              {user.skills.map((skill) => (
                <span key={skill} className="skill-tag">{skill}</span>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="stats">
            <span>{followers?.length || 0} Followers</span>
            <span>{following?.length || 0} Following</span>
            <span>{user.stats?.postsCount || 0} Posts</span>
          </div>

          <button onClick={() => setIsEditing(true)}>Edit Profile</button>
        </div>
      )}

      {/* Sub-profiles */}
      {subProfiles && subProfiles.length > 0 && (
        <div className="sub-profiles">
          <h3>Profiles</h3>
          {subProfiles.map((profile) => (
            <div key={profile._id} className="sub-profile">
              <span className="role">{profile.role}</span>
              <span className="name">{profile.displayName}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## Common Patterns

### Loading States
```typescript
const user = useQuery(api.users.getUserByClerkId, { clerkId });

if (user === undefined) {
  return <div>Loading...</div>;
}

if (user === null) {
  return <div>User not found</div>;
}

// User is loaded
return <div>{user.displayName}</div>;
```

### Error Handling
```typescript
const updateProfile = useMutation(api.users.updateProfile);

const handleUpdate = async () => {
  try {
    await updateProfile({ clerkId, displayName: 'New Name' });
    alert('Updated!');
  } catch (error) {
    console.error('Update failed:', error);
    alert('Failed to update profile');
  }
};
```

### Optimistic Updates (for instant UI feedback)
```typescript
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

function FollowButton({ followerId, followingId }: Props) {
  const isFollowing = useQuery(api.users.isFollowing, {
    followerId,
    followingId
  });

  const followUser = useMutation(api.users.followUser);

  // You can add optimistic updates here
  // For now, the mutation will handle it
}
```

---

## Next Steps

1. ✅ User functions created
2. ⏳ Add to your components
3. ⏳ Test with real data
4. ⏳ Handle edge cases
5. ⏳ Add loading/error states
