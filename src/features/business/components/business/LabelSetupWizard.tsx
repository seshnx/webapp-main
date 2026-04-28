import React, { useState, useEffect } from 'react';
import { useAuth, useClerk } from '@clerk/react';
import { Music, Check, Loader2, Building2, ArrowRight, X, AlertCircle } from 'lucide-react';

interface LabelSetupWizardProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

export default function LabelSetupWizard({ onComplete, onCancel }: LabelSetupWizardProps) {
  const { user } = useAuth();
  const clerk = useClerk();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [labelName, setLabelName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [description, setDescription] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  const genres = [
    'Hip Hop', 'R&B', 'Pop', 'Rock', 'Electronic', 'Jazz', 'Classical',
    'Country', 'Latin', 'Reggae', 'Metal', 'Indie', 'Folk', 'Blues',
    'Soul', 'Funk', 'Disco', 'House', 'Techno', 'Ambient', 'Other'
  ];

  // Auto-generate slug from name
  useEffect(() => {
    if (labelName) {
      const generatedSlug = labelName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setSlug(generatedSlug);
      setSlugAvailable(null); // Reset availability check
    }
  }, [labelName]);

  // Check slug availability (debounced)
  useEffect(() => {
    const checkSlug = setTimeout(async () => {
      if (slug && slug.length >= 3) {
        try {
          const response = await fetch(`/api/check-slug?slug=${slug}&type=label`);
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

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

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
      const response = await fetch('/api/business/create-label-org', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await clerk.session?.getToken()}`,
        },
        body: JSON.stringify({
          labelName,
          slug,
          ownerClerkId: user.id,
          description,
          genres: selectedGenres,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        onComplete?.();
      } else {
        setError(data.error || 'Failed to create label');
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
        return labelName.trim().length > 0 && slugAvailable === true;
      case 2:
        return description.trim().length > 0;
      case 3:
        return selectedGenres.length > 0;
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
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center">
            <Music size={24} className="text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold dark:text-white">Register Your Label</h2>
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
                s <= step ? 'bg-purple-500' : 'bg-gray-200 dark:bg-gray-700'
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
                Label Name
              </label>
              <input
                type="text"
                value={labelName}
                onChange={(e) => setLabelName(e.target.value)}
                placeholder="e.g., Neon Records"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                  placeholder="neon-records"
                  className={`w-full px-4 py-3 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
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
                This will be your label's URL: seshnx.com/label/{slug}
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
                placeholder="Tell us about your label and the type of artists you represent..."
                rows={5}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Genres You Focus On
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {genres.map((genre) => (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => toggleGenre(genre)}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      selectedGenres.includes(genre)
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <span className={`text-sm font-medium ${
                      selectedGenres.includes(genre)
                        ? 'text-purple-700 dark:text-purple-400'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {genre}
                    </span>
                  </button>
                ))}
              </div>
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
              className="px-6 py-3 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              Next
              <ArrowRight size={18} />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!canProceed() || loading}
              className="px-6 py-3 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Check size={18} />
                  Create Label
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
