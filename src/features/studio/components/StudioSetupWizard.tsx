import React, { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { useAuth, useClerk } from '@clerk/react';
import { api } from '@convex/api';
import { Home, Check, X, Loader2, ArrowRight, Building2, RefreshCw, AlertTriangle } from 'lucide-react';
import { BYPASS_ENABLED, bypassClerkOrg, bypassApiCall } from '@/utils/clerkOrgBypass';

// Inline slug generation (same logic as convex/utils/slugs.ts)
function generateSlug(name: string): string {
  let slug = name.toLowerCase();
  slug = slug.replace(/[^a-z0-9]+/g, '-');
  slug = slug.replace(/^-+|-+$/g, '');
  slug = slug.replace(/-+/g, '-');
  if (slug.length > 40) {
    slug = slug.substring(0, 40).replace(/-+$/, '');
  }
  slug = slug.replace(/^-/, '').replace(/-$/, '');
  if (slug.length < 3) {
    slug = 'studio-' + Math.random().toString(36).substring(2, 6);
  }
  return slug;
}

type SetupStep = 'form' | 'creating-studio' | 'creating-org' | 'activating' | 'complete' | 'partial';

interface StudioSetupWizardProps {
  clerkId: string;
  /** studioId if studio was created but org linking failed */
  existingStudioId?: string;
  existingStudioName?: string;
  existingSlug?: string;
  onComplete?: () => void;
}

export default function StudioSetupWizard({
  clerkId,
  existingStudioId,
  existingStudioName,
  existingSlug,
  onComplete,
}: StudioSetupWizardProps) {
  const { getToken } = useAuth();
  const clerk = useClerk();

  // If we have an existing studio, start in retry mode
  const [step, setStep] = useState<SetupStep>(
    existingStudioId ? 'partial' : 'form'
  );
  const [name, setName] = useState(existingStudioName || '');
  const [slug, setSlug] = useState(existingSlug || '');
  const [slugEdited, setSlugEdited] = useState(!!existingSlug);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-complete setup when bypass is enabled and in partial state
  useEffect(() => {
    if (BYPASS_ENABLED && step === 'partial' && existingStudioId) {
      console.log('[BYPASS] Auto-completing studio setup for existing studio');
      setStep('complete');
      onComplete?.();
    }
  }, [BYPASS_ENABLED, step, existingStudioId, onComplete]);

  // Auto-generate slug from name (unless user manually edited it)
  const handleNameChange = useCallback((value: string) => {
    setName(value);
    if (!slugEdited) {
      setSlug(generateSlug(value));
    }
  }, [slugEdited]);

  const handleSlugChange = useCallback((value: string) => {
    setSlugEdited(true);
    setSlug(value.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-'));
  }, []);

  // Real-time slug availability check
  const slugAvailability = useQuery(
    api.studios.checkSlugAvailability,
    slug.length >= 3 ? { slug } : 'skip'
  );

  // Create studio mutation
  const createStudio = useMutation(api.studios.createStudio);

  // Derived state
  const nameValid = name.trim().length >= 3;
  const slugValid = slug.length >= 3 && /^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(slug);
  const slugAvailable = slugAvailability?.available === true;
  const canSubmit = nameValid && slugValid && slugAvailable && !creating;

  /**
   * Link a Clerk org to an existing studio (retry path).
   * Called when studio was created but org creation failed.
   */
  const handleRetryOrgLink = async () => {
    if (!existingStudioId || !clerkId) return;

    setCreating(true);
    setError(null);
    setStep('creating-org');

    try {
      let orgId: string | null = null;

      if (BYPASS_ENABLED) {
        // Use bypass for organization linking
        console.log('[BYPASS] Creating mock organization for existing studio');
        const mockOrg = bypassClerkOrg('STUDIO', existingStudioName || name.trim());
        orgId = mockOrg?.id || null;

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        console.log('[BYPASS] Mock organization linked:', orgId);
      } else {
        // Normal Clerk organization linking
        const token = await getToken();
        const response = await fetch('/api/studio/create-org', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            studioId: existingStudioId,
            slug: existingSlug || slug,
            ownerClerkId: clerkId,
            studioName: existingStudioName || name.trim(),
          }),
        });

        if (response.ok) {
          const data = await response.json();
          orgId = data.organizationId;
        } else {
          const data = await response.json().catch(() => ({}));
          setError(data.error || 'Failed to link organization. You can retry from Studio Settings.');
          setStep('partial');
          setCreating(false);
          return;
        }
      }

      if (orgId) {
        setStep('activating');
        if (!BYPASS_ENABLED) {
          try {
            await clerk.setActive({ organization: orgId });
          } catch (err) {
            console.warn('setActive failed:', err);
          }
        }
      }

      setStep('complete');
      onComplete?.();
    } catch (err: any) {
      setError(err.message || 'Network error. Please try again.');
      setStep('partial');
    } finally {
      setCreating(false);
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit || !clerkId) return;

    setCreating(true);
    setError(null);
    let studioId = existingStudioId;

    try {
      // Step 1: Create the Convex studio record (skip if already exists)
      if (!studioId) {
        setStep('creating-studio');
        studioId = await createStudio({
          clerkId,
          name: name.trim(),
          slug,
        });
      }

      // Step 2: Create Clerk Organization via API (or use bypass)
      setStep('creating-org');
      let orgId: string | null = null;

      if (BYPASS_ENABLED) {
        // Use bypass for organization creation
        console.log('[BYPASS] Creating mock organization for studio');
        const mockOrg = bypassClerkOrg('STUDIO', name.trim());
        orgId = mockOrg?.id || null;

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        console.log('[BYPASS] Mock organization created:', orgId);
      } else {
        // Normal Clerk organization creation
        const token = await getToken();

        try {
          const response = await fetch('/api/studio/create-org', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              studioId,
              slug,
              ownerClerkId: clerkId,
              studioName: name.trim(),
            }),
          });

          if (response.ok) {
            const data = await response.json();
            orgId = data.organizationId;
          } else {
            const data = await response.json().catch(() => ({}));
            console.warn('Org creation returned non-ok:', data.error || data.message);
          }
        } catch (orgErr) {
          console.warn('Org creation failed:', orgErr);
        }
      }

      // Step 3: Switch user into the new org context (skip in bypass mode)
      if (orgId && !BYPASS_ENABLED) {
        setStep('activating');
        try {
          await clerk.setActive({ organization: orgId });
        } catch (setActiveErr) {
          console.warn('setActive failed:', setActiveErr);
        }
      }

      // Step 4: Complete
      setStep('complete');
      onComplete?.();
    } catch (err: any) {
      setError(err.message || 'Failed to create studio. Please try again.');
      setStep('form');
    } finally {
      setCreating(false);
    }
  };

  // ── Step indicator (shown during creation) ──────────────
  const renderStepIndicator = () => {
    const steps = [
      { key: 'creating-studio', label: 'Creating Studio', icon: Home },
      { key: 'creating-org', label: 'Setting Up Organization', icon: Building2 },
      { key: 'activating', label: 'Activating', icon: Check },
    ];

    const currentIndex = steps.findIndex(s => s.key === step);

    return (
      <div className="space-y-3">
        {steps.map((s, i) => {
          const Icon = s.icon;
          const isActive = s.key === step;
          const isDone = i < currentIndex || step === 'complete';
          const isPending = i > currentIndex;

          return (
            <div
              key={s.key}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                  : isDone
                  ? 'bg-green-50 dark:bg-green-900/10'
                  : 'bg-gray-50 dark:bg-gray-800/50 opacity-50'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                isDone
                  ? 'bg-green-500 text-white'
                  : isActive
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
              }`}>
                {isDone ? (
                  <Check size={16} />
                ) : isActive ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Icon size={16} />
                )}
              </div>
              <span className={`text-sm font-medium ${
                isDone ? 'text-green-700 dark:text-green-400'
                  : isActive ? 'text-blue-700 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  // ── Retry mode (studio exists, org link failed) ──────────
  if (step === 'partial' && existingStudioId) {
    return (
      <div className="max-w-xl mx-auto">
        {/* Bypass Warning Banner */}
        {BYPASS_ENABLED && (
          <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex items-center gap-3">
            <AlertTriangle size={20} className="text-amber-600 dark:text-amber-500 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                Development Bypass Active
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Organization linking is bypassed for development testing.
              </p>
            </div>
          </div>
        )}

        <div className="text-center mb-8">
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 ${
            BYPASS_ENABLED ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 'bg-gradient-to-br from-amber-500 to-orange-600'
          }`}>
            <Building2 size={36} />
          </div>
          <h1 className="text-3xl font-bold dark:text-white mb-2">Finish Studio Setup</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Your studio "{existingStudioName}" was created but needs an organization link.
          </p>
        </div>

        <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-6 space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <button
            onClick={handleRetryOrgLink}
            disabled={creating}
            className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-white font-medium transition shadow-lg ${
              BYPASS_ENABLED
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-amber-500/25'
                : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-amber-500/25'
            }`}
          >
            {creating ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                {BYPASS_ENABLED ? 'Bypassing Organization Link...' : 'Linking Organization...'}
              </>
            ) : (
              <>
                <RefreshCw size={18} />
                {BYPASS_ENABLED ? 'Skip Organization Link (Bypass)' : 'Link Organization'}
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // ── Creating state ──────────────────────────────────────
  if (creating) {
    return (
      <div className="max-w-xl mx-auto">
        {/* Bypass Warning Banner */}
        {BYPASS_ENABLED && (
          <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex items-center gap-3">
            <AlertTriangle size={20} className="text-amber-600 dark:text-amber-500 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                Development Bypass Active
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Using mock organization data for development testing.
              </p>
            </div>
          </div>
        )}

        <div className="text-center mb-8">
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 ${
            BYPASS_ENABLED ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 'bg-gradient-to-br from-blue-500 to-indigo-600'
          }`}>
            <Loader2 size={36} className="animate-spin" />
          </div>
          <h1 className="text-3xl font-bold dark:text-white mb-2">
            {BYPASS_ENABLED ? 'Setting Up Studio (Bypass Mode)' : 'Setting Up Your Studio'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {BYPASS_ENABLED
              ? 'Creating studio with mock organization data...'
              : 'Just a moment while we create everything...'}
          </p>
        </div>
        <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-6">
          {renderStepIndicator()}
        </div>
      </div>
    );
  }

  // ── Form ────────────────────────────────────────────────
  return (
    <div className="max-w-xl mx-auto">
      {/* Bypass Warning Banner */}
      {BYPASS_ENABLED && (
        <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex items-center gap-3">
          <AlertTriangle size={20} className="text-amber-600 dark:text-amber-500 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
              Development Bypass Active
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Studio creation will use mock organization data.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-8">
        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 ${
          BYPASS_ENABLED ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 'bg-gradient-to-br from-blue-500 to-indigo-600'
        }`}>
          <Home size={36} />
        </div>
        <h1 className="text-3xl font-bold dark:text-white mb-2">Set Up Your Studio</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Create your studio profile to start managing bookings, rooms, and clients.
        </p>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-6 space-y-6">
        {/* Studio Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Studio Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g. Platinum Sound Studios"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            autoFocus
          />
          {name.length > 0 && name.length < 3 && (
            <p className="mt-1 text-sm text-amber-500">Name must be at least 3 characters</p>
          )}
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            URL Slug
          </label>
          <div className="relative">
            <input
              type="text"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="your-studio-name"
              className={`w-full px-4 py-3 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:border-transparent transition pr-10 ${
                slug.length >= 3 && slugAvailability !== undefined
                  ? slugAvailable
                    ? 'border-green-400 dark:border-green-500 focus:ring-green-500'
                    : 'border-red-400 dark:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
              }`}
            />
            {/* Status icon */}
            {slug.length >= 3 && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {slugAvailability === undefined ? (
                  <Loader2 size={18} className="animate-spin text-gray-400" />
                ) : slugAvailable ? (
                  <Check size={18} className="text-green-500" />
                ) : (
                  <X size={18} className="text-red-500" />
                )}
              </div>
            )}
          </div>
          {/* Subdomain preview */}
          {slug.length >= 3 && (
            <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
              {slugAvailable ? (
                <span className="text-green-600 dark:text-green-400">
                  {slug}.seshnx.com
                </span>
              ) : slugAvailability?.reason === 'reserved' ? (
                <span className="text-amber-500">This slug is reserved</span>
              ) : (
                <span className="text-red-500">This slug is already taken</span>
              )}
            </p>
          )}
          {slug.length > 0 && slug.length < 3 && (
            <p className="mt-1 text-sm text-amber-500">Slug must be at least 3 characters</p>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-white font-medium transition shadow-lg ${
            canSubmit
              ? BYPASS_ENABLED
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-amber-500/25'
                : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-blue-500/25'
              : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
          }`}
        >
          {creating ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              {BYPASS_ENABLED ? 'Creating Studio (Bypass)...' : 'Creating Studio...'}
            </>
          ) : (
            <>
              {BYPASS_ENABLED ? 'Create Studio (Bypass Mode)' : 'Create Studio'}
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
