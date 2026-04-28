# Plan: Redesign Studio Onboarding with Org Tagging and Backend-Controlled Roles

## Context

The current system allows users to manually toggle account types (Studio, Tech, Label, Agent) and create Clerk organizations directly. This needs to be redesigned so that:

1. The backend controls all org creation and role assignment
2. Org names are tagged with type indicators (e.g., "The Sound Farm {[STUDIO]}")
3. The Business Center becomes a welcome page for selecting business types to create
4. Staff management assigns org members, not account types
5. Agent role is only assignable within Label Manager

This change centralizes control, prevents user confusion, and ensures proper role/account type synchronization.

## Implementation Approach

### Phase 1: Create Utility Functions for Org Tag Parsing

**File: `src/utils/orgTagParser.ts`** (NEW)

```typescript
// Org type constants
export const ORG_TAGS = {
  STUDIO: '{[STUDIO]}',
  TECH: '{[TECH]}',
  LABEL: '{[LABEL]}',
  EDU: '{[EDU]}'
} as const;

export type OrgType = keyof typeof ORG_TAGS;

// Parse org name to extract display name and type
export function parseOrgTag(orgName: string): {
  displayName: string;
  orgType: OrgType | null;
} {
  const tagMatch = orgName.match(/\{\[(\w+)\]\}$/);
  if (!tagMatch) {
    // No tag found - return original name (backward compatibility)
    return { displayName: orgName, orgType: null };
  }

  const tag = tagMatch[0]; // e.g., "{[STUDIO]}"
  const type = tagMatch[1] as OrgType; // e.g., "STUDIO"
  const displayName = orgName.replace(tag, '').trim();

  return { displayName, orgType: ORG_TAGS[type] ? type : null };
}

// Add org tag to name
export function addOrgTag(name: string, type: OrgType): string {
  return `${name.trim()} ${ORG_TAGS[type]}`;
}

// Check if org name has a tag
export function hasOrgTag(orgName: string): boolean {
  return /\{\[\w+\]\}$/.test(orgName);
}

// Get org type from name
export function getOrgType(orgName: string): OrgType | null {
  return parseOrgTag(orgName).orgType;
}
```

### Phase 2: Update Backend API for Org Creation with Tags

**Modify: `api/studio/create-org.js`**

Update line 67-75 to append tag to org name:

```javascript
// Create Clerk Organization with tag
const orgNameWithTag = `${studioName} {[STUDIO]}`;

const org = await clerkClient.organizations.createOrganization({
  name: orgNameWithTag,  // Changed: append tag
  slug: slug,
  createdBy: ownerClerkId,
  privateMetadata: {
    studioId: studioId,
    type: 'studio',
    tagged: true,  // New flag to indicate tagged org
  },
});
```

**Create: `api/business/create-tech-org.js`** (NEW)

```javascript
import { createClerkClient } from '@clerk/backend';
import { ConvexHttpClient } from 'convex/browser';
import pkg from '../../convex/_generated/api.js';
const { api } = pkg;

const convexUrl = process.env.VITE_CONVEX_URL;
const httpClient = new ConvexHttpClient(convexUrl);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { shopName, slug, ownerClerkId, description, services } = req.body;

    if (!shopName || !slug || !ownerClerkId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify authentication
    const sessionToken = req.headers['authorization']?.replace('Bearer ', '');
    if (!sessionToken) {
      return res.status(401).json({ error: 'Missing authorization header' });
    }

    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    // Verify caller identity
    const session = await clerkClient.sessions.getSession(sessionToken);
    if (!session || session.userId !== ownerClerkId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Check if user already has a tech shop
    const existingShop = await httpClient.query(api.techShops.getByOwner, { ownerClerkId });
    if (existingShop) {
      return res.status(400).json({ error: 'User already has a tech shop' });
    }

    // Create Clerk Organization with tag
    const orgNameWithTag = `${shopName} {[TECH]}`;

    const org = await clerkClient.organizations.createOrganization({
      name: orgNameWithTag,
      slug: slug,
      createdBy: ownerClerkId,
      privateMetadata: {
        type: 'tech',
        tagged: true,
      },
    });

    // Create tech shop record in Convex
    const shopId = await httpClient.mutation(api.techShops.create, {
      clerkId: ownerClerkId,
      name: shopName,
      slug: slug,
      description: description || '',
      services: services || [],
      clerkOrgId: org.id,
    });

    // Add Technician account type to user
    const user = await clerkClient.users.getUser(ownerClerkId);
    const currentAccountTypes = user.publicMetadata?.accountTypes || [];

    // Add Technician if not already present
    if (!currentAccountTypes.includes('Technician')) {
      await clerkClient.users.updateUser(ownerClerkId, {
        publicMetadata: {
          accountTypes: [...currentAccountTypes, 'Technician'],
        },
      });
    }

    return res.status(200).json({
      organizationId: org.id,
      shopId: shopId,
      name: org.name,
      slug: org.slug,
    });

  } catch (error) {
    console.error('Create tech org error:', error);

    // Handle slug-already-taken specifically
    if (error.errors?.[0]?.code === 'form_identifier_exists') {
      return res.status(409).json({ error: 'Organization slug already taken', details: error.errors });
    }

    return res.status(500).json({
      error: 'Failed to create tech organization',
      message: error.message,
    });
  }
}
```

**Create: `api/business/create-label-org.js`** (NEW)

```javascript
import { createClerkClient } from '@clerk/backend';
import { ConvexHttpClient } from 'convex/browser';
import pkg from '../../convex/_generated/api.js';
const { api } = pkg;

const convexUrl = process.env.VITE_CONVEX_URL;
const httpClient = new ConvexHttpClient(convexUrl);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { labelName, slug, ownerClerkId, description, genres } = req.body;

    if (!labelName || !slug || !ownerClerkId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify authentication
    const sessionToken = req.headers['authorization']?.replace('Bearer ', '');
    if (!sessionToken) {
      return res.status(401).json({ error: 'Missing authorization header' });
    }

    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    // Verify caller identity
    const session = await clerkClient.sessions.getSession(sessionToken);
    if (!session || session.userId !== ownerClerkId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Check if user already has a label
    const existingLabel = await httpClient.query(api.labels.getByOwner, { ownerClerkId });
    if (existingLabel) {
      return res.status(400).json({ error: 'User already has a label' });
    }

    // Create Clerk Organization with tag
    const orgNameWithTag = `${labelName} {[LABEL]}`;

    const org = await clerkClient.organizations.createOrganization({
      name: orgNameWithTag,
      slug: slug,
      createdBy: ownerClerkId,
      privateMetadata: {
        type: 'label',
        tagged: true,
      },
    });

    // Create label record in Convex
    const labelId = await httpClient.mutation(api.labels.create, {
      clerkId: ownerClerkId,
      name: labelName,
      slug: slug,
      description: description || '',
      genres: genres || [],
      clerkOrgId: org.id,
    });

    // Add Label account type to user
    const user = await clerkClient.users.getUser(ownerClerkId);
    const currentAccountTypes = user.publicMetadata?.accountTypes || [];

    // Add Label if not already present
    if (!currentAccountTypes.includes('Label')) {
      await clerkClient.users.updateUser(ownerClerkId, {
        publicMetadata: {
          accountTypes: [...currentAccountTypes, 'Label'],
        },
      });
    }

    return res.status(200).json({
      organizationId: org.id,
      labelId: labelId,
      name: org.name,
      slug: org.slug,
    });

  } catch (error) {
    console.error('Create label org error:', error);

    // Handle slug-already-taken specifically
    if (error.errors?.[0]?.code === 'form_identifier_exists') {
      return res.status(409).json({ error: 'Organization slug already taken', details: error.errors });
    }

    return res.status(500).json({
      error: 'Failed to create label organization',
      message: error.message,
    });
  }
}
```

**Create: `api/business/create-edu-org.js`** (NEW)

```javascript
import { createClerkClient } from '@clerk/backend';
import { ConvexHttpClient } from 'convex/browser';
import pkg from '../../convex/_generated/api.js';
const { api } = pkg;

const convexUrl = process.env.VITE_CONVEX_URL;
const httpClient = new ConvexHttpClient(convexUrl);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { schoolName, slug, ownerClerkId, description, address } = req.body;

    if (!schoolName || !slug || !ownerClerkId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify authentication
    const sessionToken = req.headers['authorization']?.replace('Bearer ', '');
    if (!sessionToken) {
      return res.status(401).json({ error: 'Missing authorization header' });
    }

    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    // Verify caller identity
    const session = await clerkClient.sessions.getSession(sessionToken);
    if (!session || session.userId !== ownerClerkId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Check if user already has a school
    const existingSchool = await httpClient.query(api.schools.getByOwner, { ownerClerkId });
    if (existingSchool) {
      return res.status(400).json({ error: 'User already has a school' });
    }

    // Create Clerk Organization with tag
    const orgNameWithTag = `${schoolName} {[EDU]}`;

    const org = await clerkClient.organizations.createOrganization({
      name: orgNameWithTag,
      slug: slug,
      createdBy: ownerClerkId,
      privateMetadata: {
        type: 'edu',
        tagged: true,
      },
    });

    // Create school record in Convex
    const schoolId = await httpClient.mutation(api.schools.create, {
      clerkId: ownerClerkId,
      name: schoolName,
      slug: slug,
      description: description || '',
      address: address || '',
      clerkOrgId: org.id,
    });

    // Add EDUAdmin account type to user
    const user = await clerkClient.users.getUser(ownerClerkId);
    const currentAccountTypes = user.publicMetadata?.accountTypes || [];

    // Add EDUAdmin if not already present
    if (!currentAccountTypes.includes('EDUAdmin')) {
      await clerkClient.users.updateUser(ownerClerkId, {
        publicMetadata: {
          accountTypes: [...currentAccountTypes, 'EDUAdmin'],
        },
      });
    }

    return res.status(200).json({
      organizationId: org.id,
      schoolId: schoolId,
      name: org.name,
      slug: org.slug,
    });

  } catch (error) {
    console.error('Create edu org error:', error);

    // Handle slug-already-taken specifically
    if (error.errors?.[0]?.code === 'form_identifier_exists') {
      return res.status(409).json({ error: 'Organization slug already taken', details: error.errors });
    }

    return res.status(500).json({
      error: 'Failed to create edu organization',
      message: error.message,
    });
  }
}
```

### Phase 3: Create Setup Wizard Components

**Create: `src/components/business/TechSetupWizard.tsx`** (NEW)

```typescript
import React, { useState, useEffect } from 'react';
import { useAuth, useClerk } from '@clerk/react';
import { Wrench, Check, Loader2, Building2 } from 'lucide-react';

export default function TechSetupWizard() {
  const { user } = useAuth();
  const clerk = useClerk();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [shopName, setShopName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [description, setDescription] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const services = [
    'Recording', 'Mixing', 'Mastering', 'Equipment Repair',
    'Studio Installation', 'Consulting', 'Live Sound', 'Other'
  ];

  // Auto-generate slug from name
  useEffect(() => {
    if (shopName) {
      const generatedSlug = shopName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setSlug(generatedSlug);
    }
  }, [shopName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !slugAvailable) return;

    setLoading(true);
    try {
      const response = await fetch('/api/business/create-tech-org', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await clerk.session?.getToken()}`,
        },
        body: JSON.stringify({
          shopName,
          slug,
          ownerClerkId: user.id,
          description,
          services: selectedServices,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        // Redirect to tech management
        window.location.href = '/business-center/tech';
      } else {
        console.error('Error:', data.error);
      }
    } catch (error) {
      console.error('Setup error:', error);
    } finally {
      setLoading(false);
    }
  };

  // ... rest of wizard UI

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit}>
        {/* Wizard steps UI */}
        {/* Step 1: Name and Slug */}
        {/* Step 2: Description */}
        {/* Step 3: Services */}
      </form>
    </div>
  );
}
```

**Create: `src/components/business/LabelSetupWizard.tsx`** (NEW)

Similar structure to TechSetupWizard but for label-specific fields (name, slug, description, genres).

**Create: `src/components/business/EduSetupWizard.tsx`** (NEW)

Similar structure for school-specific fields (name, slug, description, address).

### Phase 4: Redesign Business Overview as Welcome Page

**Modify: `src/components/business/BusinessOverview.tsx`**

Replace current metrics-focused overview with a business selection welcome page:

```typescript
import React from 'react';
import { Building2, Wrench, Music, GraduationCap, ArrowRight } from 'lucide-react';

interface BusinessOption {
  id: 'studio' | 'tech' | 'label' | 'edu';
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  comingSoon?: boolean;
}

const businessOptions: BusinessOption[] = [
  {
    id: 'studio',
    title: 'Open A Studio',
    description: 'Set up your recording studio, manage rooms, bookings, and clients',
    icon: Building2,
    color: 'blue',
  },
  {
    id: 'tech',
    title: 'Start Your Tech Shop',
    description: 'Offer technical services, equipment repair, and studio installation',
    icon: Wrench,
    color: 'green',
  },
  {
    id: 'label',
    title: 'Register a Platform Label',
    description: 'Sign artists, manage releases, and grow your music label',
    icon: Music,
    color: 'purple',
  },
  {
    id: 'edu',
    title: 'Launch an EDU Institution',
    description: 'Create educational programs, manage students and staff',
    icon: GraduationCap,
    color: 'orange',
    comingSoon: true,
  },
];

export default function BusinessOverview({ user, userData, setActiveTab }: BusinessOverviewProps) {
  const handleSelect = (option: BusinessOption) => {
    if (option.comingSoon) return;

    // Redirect to appropriate setup wizard
    switch (option.id) {
      case 'studio':
        window.location.href = '/studio/setup';
        break;
      case 'tech':
        window.location.href = '/business/tech/setup';
        break;
      case 'label':
        window.location.href = '/business/label/setup';
        break;
      case 'edu':
        // Coming soon
        break;
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Business Center</h1>
        <p className="text-indigo-100 max-w-xl">
          Start your music business journey. Choose your business type below to get started.
        </p>
      </div>

      {/* Business Type Selection */}
      <div>
        <h2 className="text-2xl font-bold dark:text-white mb-6">
          What would you like to start?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {businessOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <button
                key={option.id}
                onClick={() => handleSelect(option)}
                disabled={option.comingSoon}
                className={`
                  relative bg-white dark:bg-[#2c2e36] p-6 rounded-xl border dark:border-gray-700
                  shadow-sm hover:shadow-md transition-all text-left group
                  ${option.comingSoon ? 'opacity-50 cursor-not-allowed' : 'hover:border-brand-blue dark:hover:border-brand-blue'}
                `}
              >
                <div className="flex items-start gap-4">
                  <div className={`
                    w-14 h-14 rounded-xl flex items-center justify-center shrink-0
                    bg-${option.color}-100 dark:bg-${option.color}-900/20
                  `}>
                    <IconComponent size={28} className={`text-${option.color}-600 dark:text-${option.color}-400`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold dark:text-white mb-2">
                      {option.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {option.description}
                    </p>
                  </div>
                  {!option.comingSoon && (
                    <ArrowRight size={20} className="text-gray-400 group-hover:text-brand-blue transition-colors" />
                  )}
                </div>
                {option.comingSoon && (
                  <div className="absolute top-4 right-4">
                    <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-medium rounded">
                      Coming Soon
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Existing Orgs Section */}
      {userData?.accountTypes && userData.accountTypes.length > 0 && (
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold dark:text-white mb-4">
            Your Businesses
          </h2>
          <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-6">
            {/* Display existing orgs with their types */}
            <p className="text-gray-500 dark:text-gray-400">
              You have access to: {userData.accountTypes.join(', ')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
```

### Phase 5: Update Org Manager to Parse and Strip Tags

**Modify: `src/components/studio/StudioOrgManager.tsx`**

Import and use the tag parser:

```typescript
import { parseOrgTag, OrgType } from '../../utils/orgTagParser';

// Update line 124-129 to strip tags from display
<div className="flex items-center gap-3">
  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0">
    {parseOrgTag(activeOrg.name).displayName?.charAt(0)?.toUpperCase() || <Building2 size={18} />}
  </div>
  <div className="flex-1 min-w-0">
    <p className="font-bold text-gray-900 dark:text-white truncate">
      {parseOrgTag(activeOrg.name).displayName}
    </p>
    {/* ... rest of role display ... */}
  </div>
</div>

// Update line 189-194 in org switcher
<div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0 ${
  isActive
    ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
    : 'bg-gray-400 dark:bg-gray-600'
}`}>
  {parseOrgTag(org.name).displayName?.charAt(0)?.toUpperCase() || <Building2 size={14} />}
</div>
<div className="flex-1 min-w-0">
  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
    {parseOrgTag(org.name).displayName}
  </p>
  {/* ... role display ... */}
</div>
```

### Phase 6: Update Business Center Tab Logic

**Modify: `src/components/BusinessCenter.tsx`**

Update tab availability based on org tags instead of account types:

```typescript
import { getOrgType, OrgType } from '../../utils/orgTagParser';

// Replace lines 86-93 with:
const clerk = useClerk();
const activeOrg = clerk.organization;
const orgType = activeOrg ? getOrgType(activeOrg.name) : null;

// Determine which features the user has access to based on org type
const isStudio = orgType === 'STUDIO';
const isLabel = orgType === 'LABEL';
const isTechnician = orgType === 'TECH';
const isEdu = orgType === 'EDU';

// Update tabs to use org type instead of account types
const tabs: BusinessTab[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: Briefcase,
    iconSize: 18,
    available: true
  },
  {
    id: 'studio',
    label: 'Studio Ops',
    icon: Home,
    iconSize: 18,
    available: isStudio,
    description: 'Manage rooms, rates & amenities'
  },
  {
    id: 'tech',
    label: 'Tech Management',
    icon: Wrench,
    iconSize: 18,
    available: isTechnician,
    description: 'Manage service requests & earnings'
  },
  {
    id: 'roster',
    label: 'Label Manager',
    icon: Users,
    iconSize: 18,
    available: isLabel,
    description: 'Manage your signed artists'
  },
  {
    id: 'distribution',
    label: 'Distribution',
    icon: Globe,
    iconSize: 18,
    available: isStudio || isLabel || isArtist,
    description: 'Release music to streaming platforms'
  },
].filter(tab => tab.available);
```

### Phase 7: Add Convex Functions for New Org Types

**Modify: `convex/studios.ts`**

Add new functions (or create new files `convex/techShops.ts`, `convex/labels.ts`, `convex/schools.ts`):

```typescript
// techShops.ts (NEW)
export const create = mutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    services: v.array(v.string()),
    clerkOrgId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Check if user already has a tech shop
    const existingShop = await ctx.db
      .query("techShops")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .first();

    if (existingShop) {
      throw new Error("User already has a tech shop");
    }

    // Validate slug
    const slugTaken = await ctx.db
      .query("techShops")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (slugTaken) {
      throw new Error("Slug is already in use");
    }

    const now = Date.now();

    const shopId = await ctx.db.insert("techShops", {
      name: args.name,
      ownerId: user._id,
      slug: args.slug,
      description: args.description,
      services: args.services,
      clerkOrgId: args.clerkOrgId,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    return shopId;
  },
});

export const getByOwner = query({
  args: { ownerClerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.ownerClerkId))
      .first();

    if (!user) return null;

    return await ctx.db
      .query("techShops")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .first();
  },
});
```

Similar patterns for `labels.ts` and `schools.ts`.

### Phase 8: Prevent Manual Role Toggling

**Action Required:** Search for and remove any UI components that allow users to manually toggle Studio, Tech, Label, or Agent account types. These should only be assigned through org creation.

Search for:
- Toggle switches for account types
- Settings pages with account type selection
- Profile edit forms with account type options

Remove or disable these controls and add comments indicating roles are managed by org membership.

### Phase 9: Handle Agent Role Assignment in Label Manager

**Modify: `src/components/LabelManager.tsx`**

Add agent assignment functionality (currently TODO/placeholder):

```typescript
const handleAssignAgent = async (artistId: string, agentId: string) => {
  // Only label owners can assign agents
  if (!isLabelOwner) return;

  try {
    await fetch('/api/labels/assign-agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ labelId, artistId, agentId }),
    });
  } catch (error) {
    console.error('Failed to assign agent:', error);
  }
};

// In the artist roster item, add agent assignment UI for label owners
{isLabelOwner && (
  <select
    onChange={(e) => handleAssignAgent(artist.id, e.target.value)}
    className="mt-2 px-3 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-800 text-sm"
  >
    <option value="">Select Agent</option>
    {availableAgents.map(agent => (
      <option key={agent.id} value={agent.id}>{agent.name}</option>
    ))}
  </select>
)}
```

### Phase 10: Backward Compatibility for Existing Orgs

**Create: `api/migrations/migrate-org-tags.js`** (NEW)

```javascript
import { createClerkClient } from '@clerk/backend';
import { ConvexHttpClient } from 'convex/browser';
import pkg from '../../convex/_generated/api.js';
const { api } = pkg;

const convexUrl = process.env.VITE_CONVEX_URL;
const httpClient = new ConvexHttpClient(convexUrl);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    // Get all studios from Convex
    const studios = await httpClient.query(api.studios.getAll);

    let migrated = 0;
    let errors = 0;

    for (const studio of studios) {
      try {
        if (!studio.clerkOrgId) continue;

        // Check if org already has a tag
        const org = await clerkClient.organizations.getOrganization({
          organizationId: studio.clerkOrgId,
        });

        if (!org.name.includes('{[STUDIO]}')) {
          // Update org name with tag
          const newName = `${org.name} {[STUDIO]}`;
          await clerkClient.organizations.updateOrganization({
            organizationId: studio.clerkOrgId,
            name: newName,
            privateMetadata: {
              ...org.privateMetadata,
              tagged: true,
            },
          });
          migrated++;
        }
      } catch (error) {
        console.error(`Failed to migrate studio ${studio._id}:`, error);
        errors++;
      }
    }

    return res.status(200).json({
      message: 'Migration complete',
      migrated,
      errors,
      total: studios.length,
    });

  } catch (error) {
    return res.status(500).json({
      error: 'Migration failed',
      message: error.message,
    });
  }
}
```

Run this migration once to tag existing orgs.

## Critical Files to Modify

### Backend
- `api/studio/create-org.js` - Add tag to studio org names
- `convex/studios.ts` - Add migration function
- `api/business/create-tech-org.js` - NEW
- `api/business/create-label-org.js` - NEW
- `api/business/create-edu-org.js` - NEW
- `convex/techShops.ts` - NEW
- `convex/labels.ts` - NEW
- `convex/schools.ts` - NEW

### Frontend
- `src/utils/orgTagParser.ts` - NEW
- `src/components/business/BusinessOverview.tsx` - Redesign as welcome page
- `src/components/business/TechSetupWizard.tsx` - NEW
- `src/components/business/LabelSetupWizard.tsx` - NEW
- `src/components/business/EduSetupWizard.tsx` - NEW
- `src/components/studio/StudioOrgManager.tsx` - Parse and strip tags
- `src/components/BusinessCenter.tsx` - Use org types for tab logic
- `src/components/LabelManager.tsx` - Add agent assignment

## Verification

### Testing Steps

1. **Test Org Tag Parsing:**
   - Run `parseOrgTag("The Sound Farm {[STUDIO]}")` → should return `{ displayName: "The Sound Farm", orgType: "STUDIO" }`
   - Run `parseOrgTag("Old Org Name")` → should return `{ displayName: "Old Org Name", orgType: null }`

2. **Test Studio Creation:**
   - Go to Business Center → "Open A Studio"
   - Complete StudioSetupWizard
   - Verify Clerk org is created with tag: "Studio Name {[STUDIO]}"
   - Verify user has Studio account type
   - Verify Studio Ops tab is available in Business Center

3. **Test Tech Shop Creation:**
   - Go to Business Center → "Start Your Tech Shop"
   - Complete TechSetupWizard
   - Verify Clerk org is created with tag: "Tech Shop Name {[TECH]}"
   - Verify user has Technician account type
   - Verify Tech Management tab is available

4. **Test Label Creation:**
   - Go to Business Center → "Register a Platform Label"
   - Complete LabelSetupWizard
   - Verify Clerk org is created with tag: "Label Name {[LABEL]}"
   - Verify user has Label account type
   - Verify Label Manager tab is available

5. **Test Org Display:**
   - In StudioOrgManager, verify org names display without tags
   - Verify org switcher shows clean names
   - Verify role badges still work correctly

6. **Test Backward Compatibility:**
   - Run migration script on existing orgs
   - Verify existing orgs now have tags
   - Verify they display correctly in UI

7. **Test Agent Assignment:**
   - As a label owner, verify you can assign agents to artists
   - Verify non-owners cannot assign agents
   - Verify Agent role is not user-toggleable

8. **Test Staff Management:**
   - As studio owner, invite team member
   - Verify member is added to org
   - Verify staff management in Studio Manager works

### End-to-End Test

1. Create a new user account
2. Navigate to Business Center
3. Select "Open A Studio"
4. Complete studio setup
5. Verify org created with tag
6. Invite team member
7. Assign staff roles
8. Verify member sees studio in their org switcher
9. Verify Business Center tabs show correctly based on org type

### Edge Cases

- User tries to create multiple orgs of same type (should be prevented)
- User tries to manually toggle account types (should be prevented/disabled)
- Org name already has tag (should not add another)
- Existing orgs without tags (migration handles this)
- Agent assignment by non-label owner (should be prevented)

## Notes

- The tag format `{[TYPE]}` is consistent and easy to parse
- Existing orgs can be migrated via script
- Account types are now synchronized with org membership
- Staff management separates org membership from account types
- Agent role is properly scoped to label operations only

## Implementation Status

✅ Completed:
- src/utils/orgTagParser.ts - Utility functions for tag parsing
- api/studio/create-org.js - Updated to append {[STUDIO]} tags
- api/business/create-tech-org.js - NEW tech shop org creation API
- api/business/create-label-org.js - NEW label org creation API  
- api/business/create-edu-org.js - NEW edu org creation API
- convex/techShops.ts - NEW tech shop Convex functions
- convex/labels.ts - NEW label Convex functions
- convex/schools.ts - NEW school Convex functions
- src/components/business/TechSetupWizard.tsx - NEW tech shop setup wizard
- src/components/business/LabelSetupWizard.tsx - NEW label setup wizard

🔄 In Progress:
- src/components/business/EduSetupWizard.tsx - EDU setup wizard

⏳ Remaining:
- src/components/business/BusinessOverview.tsx - Redesign as welcome page
- src/components/studio/StudioOrgManager.tsx - Parse and strip tags from display
- src/components/BusinessCenter.tsx - Update tab logic based on org types
- src/components/LabelManager.tsx - Add agent assignment functionality
- Prevent manual role toggling in UI
