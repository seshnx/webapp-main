import { useState, useEffect, useCallback } from 'react';
import { useUserSettings, applySettingsToDom } from './useUserSettings';

const STORAGE_KEY = 'seshnx_font_scale_prompt_dismissed';

export interface DeviceFontDetectionResult {
  isLargeFontDetected: boolean;
  baseFontSize: number;
  fontScaleRatio: number;
  hasDismissed: boolean;
  optimizeFontSize: () => Promise<void>;
  dismissPrompt: () => void;
  resetDismissal: () => void;
}

/**
 * Hook to detect whether the user's device/browser settings have caused an unusually
 * large font size that may cause button or text cutoffs across the application layout.
 */
export function useDeviceFontDetection(userId?: string | null): DeviceFontDetectionResult {
  const { settings, saveSettings } = useUserSettings(userId);
  const [baseFontSize, setBaseFontSize] = useState<number>(16);
  const [isLargeFontDetected, setIsLargeFontDetected] = useState<boolean>(false);
  const [hasDismissed, setHasDismissed] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  });

  // Function to inspect font scaling
  const checkFontScaling = useCallback(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    try {
      // 1. Measure default 1rem size in pixels
      const testEl = document.createElement('div');
      testEl.style.cssText = 'position: absolute; left: -9999px; top: -9999px; font-size: 1rem; line-height: 1; visibility: hidden;';
      testEl.innerText = 'M';
      document.body.appendChild(testEl);
      const measuredPx = parseFloat(window.getComputedStyle(testEl).fontSize) || 16;
      document.body.removeChild(testEl);

      setBaseFontSize(measuredPx);

      // 2. Check if user already explicitly set an optimized font in app settings
      const activeAccessibilityFont = settings?.accessibility?.fontSize;
      const isAlreadyCustomized = activeAccessibilityFont === 'small' || activeAccessibilityFont === 'medium';

      // 3. Large font heuristic:
      // - If base px > 18px (default is 16px, so > 18px represents >= 115% OS/browser font scaling)
      // - Or on compact mobile screens (width < 640px) when font size >= 18px
      const isMobile = window.innerWidth < 640;
      const isSystemScalingLarge = measuredPx >= 19 || (isMobile && measuredPx >= 18);

      const shouldPrompt = isSystemScalingLarge && !isAlreadyCustomized && !hasDismissed;
      setIsLargeFontDetected(shouldPrompt);
    } catch (e) {
      console.warn('Font scale detection error:', e);
    }
  }, [settings?.accessibility?.fontSize, hasDismissed]);

  useEffect(() => {
    checkFontScaling();

    const handleResize = () => checkFontScaling();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [checkFontScaling]);

  // Optimize font size by lowering to a balanced 15px / medium profile
  const optimizeFontSize = useCallback(async () => {
    const updatedSettings = {
      ...settings,
      accessibility: {
        ...settings?.accessibility,
        fontSize: 'medium' as const,
      },
    };

    // Apply immediately to DOM & localStorage
    applySettingsToDom(updatedSettings);
    document.documentElement.style.fontSize = '15px';
    localStorage.setItem('fontSize', 'medium');
    localStorage.setItem(STORAGE_KEY, 'true');

    if (userId) {
      await saveSettings(updatedSettings);
    }

    setHasDismissed(true);
    setIsLargeFontDetected(false);
  }, [settings, saveSettings, userId]);

  // Dismiss prompt
  const dismissPrompt = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setHasDismissed(true);
    setIsLargeFontDetected(false);
  }, []);

  // Reset dismissal (e.g. from accessibility settings)
  const resetDismissal = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setHasDismissed(false);
    checkFontScaling();
  }, [checkFontScaling]);

  return {
    isLargeFontDetected,
    baseFontSize,
    fontScaleRatio: baseFontSize / 16,
    hasDismissed,
    optimizeFontSize,
    dismissPrompt,
    resetDismissal,
  };
}
