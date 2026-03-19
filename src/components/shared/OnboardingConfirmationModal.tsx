import React, { useState, useEffect } from 'react';
import { X, UserCheck, Home } from 'lucide-react';

/**
 * Onboarding Confirmation Modal Props
 */
export interface OnboardingConfirmationModalProps {
  /** Whether to show the modal */
  show: boolean;
  /** Callback when user chooses to complete profile now */
  onCompleteNow: () => void;
  /** Callback when user chooses to continue to app */
  onContinue: () => void;
  /** Callback when user closes modal */
  onClose: () => void;
  /** Optional delay before showing modal (ms) */
  delay?: number;
}

/**
 * Onboarding Confirmation Modal Component
 *
 * A user-friendly modal that gives users the option to complete their profile now
 * or continue exploring the app with limited access. Respects user preferences
 * through localStorage and sessionStorage.
 *
 * @param props - OnboardingConfirmationModal props
 * @returns Modal component or null
 *
 * @example
 * <OnboardingConfirmationModal
 *   show={showModal}
 *   onCompleteNow={() => navigate('/?intent=onboarding')}
 *   onContinue={() => setShowModal(false)}
 *   onClose={() => setShowModal(false)}
 *   delay={2000}
 * />
 */
export default function OnboardingConfirmationModal({
  show,
  onCompleteNow,
  onContinue,
  onClose,
  delay = 2000,
}: OnboardingConfirmationModalProps): React.ReactElement | null {
  const [shouldRender, setShouldRender] = useState<boolean>(false);
  const [dontShowAgain, setDontShowAgain] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  // Handle delay before showing modal
  useEffect(() => {
    if (show && delay > 0) {
      const timer = setTimeout(() => {
        setShouldRender(true);
        // Small delay for animation
        setTimeout(() => setIsVisible(true), 50);
      }, delay);

      return () => clearTimeout(timer);
    } else if (show) {
      setShouldRender(true);
      setTimeout(() => setIsVisible(true), 50);
    } else {
      setIsVisible(false);
      // Wait for animation to complete before unmounting
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [show, delay]);

  // Check if user has previously selected "don't ask again"
  useEffect(() => {
    const neverAskAgain = localStorage.getItem('onboarding_never_ask_again');
    if (neverAskAgain === 'true' && show) {
      // Don't show modal if user permanently dismissed it
      setShouldRender(false);
      onClose();
    }
  }, [show, onClose]);

  const handleCompleteNow = () => {
    if (dontShowAgain) {
      localStorage.setItem('onboarding_never_ask_again', 'false'); // Clear if they choose to complete
    }
    onCompleteNow();
  };

  const handleContinue = () => {
    if (dontShowAgain) {
      localStorage.setItem('onboarding_never_ask_again', 'true');
    }
    // Mark as dismissed in this session
    sessionStorage.setItem('onboarding_prompt_dismissed', Date.now().toString());
    onContinue();
  };

  const handleClose = () => {
    // Treat close same as continue
    handleContinue();
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleBackdropClick}
    >
      <div
        className={`bg-white dark:bg-[#2c2e36] w-full max-w-md rounded-xl shadow-2xl border dark:border-gray-700 transition-all duration-300 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h3 className="text-lg font-bold dark:text-white flex items-center gap-2">
            <UserCheck size={20} className="text-brand-blue"/>
            Complete Your Profile
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
            aria-label="Close"
          >
            <X size={20}/>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
            Finish setting up your profile to get the most out of SeshNx.
            <br /><br />
            You can do this now or continue exploring and come back later.
          </p>

          {/* Benefits */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-brand-blue mb-2">Complete your profile to:</h4>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <li>• Connect with other music creators</li>
              <li>• Book studio time and sessions</li>
              <li>• Post content and engage with the community</li>
              <li>• Access all features of SeshNx</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 mb-4">
            <button
              onClick={handleCompleteNow}
              className="w-full bg-brand-blue text-white py-3 rounded-lg font-bold hover:bg-blue-600 flex items-center justify-center gap-2 shadow-lg transition-colors"
            >
              <UserCheck size={18}/> Complete Profile Now
            </button>
            <button
              onClick={handleContinue}
              className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-lg font-bold hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center gap-2 transition-colors"
            >
              <Home size={18}/> Continue to App
            </button>
          </div>

          {/* Checkbox */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Don't ask me again
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}