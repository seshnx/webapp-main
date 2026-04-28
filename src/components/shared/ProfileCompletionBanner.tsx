import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';

/**
 * Profile Completion Banner Props
 */
export interface ProfileCompletionBannerProps {
  /** Callback when user clicks to complete profile */
  onCompleteProfile: () => void;
  /** Whether to show the banner */
  show?: boolean;
}

/**
 * Profile Completion Banner Component
 *
 * A dismissible banner that persists as a reminder for users who chose to
 * continue with incomplete profiles. Returns on new sessions but respects
 * dismissal within the same session.
 *
 * @param props - ProfileCompletionBanner props
 * @returns Banner component or null
 *
 * @example
 * <ProfileCompletionBanner
 *   onCompleteProfile={() => navigate('/?intent=onboarding')}
 *   show={shouldShowBanner}
 * />
 */
export default function ProfileCompletionBanner({
  onCompleteProfile,
  show = true,
}: ProfileCompletionBannerProps): React.ReactElement | null {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState<boolean>(false);

  useEffect(() => {
    if (show) {
      // Small delay for smooth entrance
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    } else {
      setIsAnimatingOut(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setIsAnimatingOut(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [show]);

  const handleDismiss = () => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsAnimatingOut(false);
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div
      className={`bg-gradient-to-r from-blue-600 to-brand-blue text-white px-4 py-3 shadow-lg transition-all duration-300 ${
        isAnimatingOut ? 'opacity-0 -translate-y-full' : 'opacity-100 translate-y-0'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <AlertCircle size={20} className="flex-shrink-0" />
          <p className="text-sm font-medium">
            Complete your profile to unlock all features
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onCompleteProfile}
            className="bg-white text-brand-blue px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-gray-100 transition-colors shadow-md"
          >
            Complete Now
          </button>
          <button
            onClick={handleDismiss}
            className="text-white/80 hover:text-white transition-colors p-1"
            aria-label="Dismiss"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
