import React, { useState, useEffect } from 'react';
import { useAuth, useClerk } from '@clerk/react';
import { GraduationCap, Check, Loader2, Building2, ArrowRight, X, AlertCircle } from 'lucide-react';
import { BYPASS_ENABLED, getBypassSessionToken, bypassApiCall } from '@/utils/clerkOrgBypass';

interface EduSetupWizardProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

export default function EduSetupWizard({ onComplete, onCancel }: EduSetupWizardProps) {
  const { user } = useAuth();
  const clerk = useClerk();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [schoolName, setSchoolName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');

  // Auto-generate slug from name
  useEffect(() => {
    if (schoolName) {
      const generatedSlug = schoolName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setSlug(generatedSlug);
      setSlugAvailable(null); // Reset availability check
    }
  }, [schoolName]);

  // Check slug availability (debounced)
  useEffect(() => {
    const checkSlug = setTimeout(async () => {
      if (slug && slug.length >= 3) {
        try {
          const response = await fetch(`/api/check-slug?slug=${slug}&type=edu`);
          const data = await response.json();
          setSlugAvailable(data.available);
        } catch (err) {
          console.error('Error checking slug:', err);
          setSlugAvailable(null);
        }
      }
    }, 500);

    return () => clearTimeout(checkSlug);
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !slugAvailable) {
      if (!slugAvailable) {
        setError('Please choose a unique slug');
      }
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let response;

      if (BYPASS_ENABLED) {
        // Use bypass endpoint for development
        console.log('[BYPASS] Using development bypass for EDU org creation');
        response = await bypassApiCall('/api/dev/bypass-org', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orgType: 'EDU',
            orgName: schoolName,
            slug,
            userId: user.id,
          }),
        });
      } else {
        // Use normal Clerk authentication
        response = await fetch('/api/business/create-edu-org', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await clerk.session?.getToken()}`,
          },
          body: JSON.stringify({
            schoolName,
            slug,
            ownerClerkId: user.id,
            description,
            address,
          }),
        });
      }

      const data = await response.json();
      if (response.ok) {
        onComplete?.();
      } else {
        setError(data.error || 'Failed to create school');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Setup error:', err);
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return schoolName.trim().length > 0 && slugAvailable === true;
      case 2:
        return description.trim().length > 0;
      case 3:
        return address.trim().length > 0;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (canProceed()) {
      setStep(prev => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 shadow-lg">
      {/* Header */}
      <div className="p-6 border-b dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-xl flex items-center justify-center">
            <GraduationCap size={24} className="text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold dark:text-white">Launch Your Institution</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Step {step} of 3
            </p>
          </div>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="px-6 pt-4">
        <div className="flex gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1 rounded-full transition-colors ${
                s <= step ? 'bg-orange-500' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
            <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Institution Name
              </label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="e.g., Audio Institute"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Slug (URL)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="audio-institute"
                  className={`w-full px-4 py-3 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    slugAvailable === false
                      ? 'border-red-300 dark:border-red-600'
                      : slugAvailable === true
                      ? 'border-green-300 dark:border-green-600'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {slugAvailable === true && (
                  <Check size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />
                )}
                {slugAvailable === false && (
                  <AlertCircle size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500" />
                )}
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                This will be your institution's URL: seshnx.com/edu/{slug}
              </p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell us about your institution and the educational programs you offer..."
                rows={5}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              />
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {description.length}/500 characters
              </p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Physical Address
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your institution's physical address..."
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              />
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {address.length}/500 characters
              </p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8">
          <button
            type="button"
            onClick={prevStep}
            disabled={step === 1}
            className="px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Back
          </button>

          {step < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={!canProceed()}
              className="px-6 py-3 rounded-lg bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              Next
              <ArrowRight size={18} />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!canProceed() || loading}
              className="px-6 py-3 rounded-lg bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Check size={18} />
                  Create Institution
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
