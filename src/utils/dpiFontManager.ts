/**
 * DPI & Screen Density Aware Font Manager
 * 
 * Dynamically detects screen DPI (devicePixelRatio), screen resolution,
 * and display scaling to compute a baseline font size.
 * User accessibility preferences ('small', 'medium', 'large', 'xlarge')
 * apply offsets relative to this dynamic baseline.
 */

export type FontSizePreference = 'small' | 'medium' | 'large' | 'xlarge';

export interface ScreenDensityProfile {
  dpr: number;
  densityCategory: 'compact' | 'standard' | 'medium-high' | 'retina-4k' | 'ultra-high';
  label: string;
  baseFontSizePx: number;
  offsetPx: number;
  computedFontSizePx: number;
  screenWidth: number;
  screenHeight: number;
  viewportWidth: number;
  viewportHeight: number;
}

const PREFERENCE_OFFSETS: Record<FontSizePreference, number> = {
  small: -2,
  medium: 0,
  large: 2,
  xlarge: 4,
};

/**
 * Calculates the current screen density metrics and optimal root font size.
 */
export function calculateDpiFontMetrics(
  fontSizePreference?: FontSizePreference | string | null
): ScreenDensityProfile {
  if (typeof window === 'undefined') {
    return {
      dpr: 1,
      densityCategory: 'standard',
      label: 'Standard (SSR)',
      baseFontSizePx: 13,
      offsetPx: 0,
      computedFontSizePx: 13,
      screenWidth: 1920,
      screenHeight: 1080,
      viewportWidth: 1920,
      viewportHeight: 1080,
    };
  }

  const dpr = window.devicePixelRatio || 1;
  const screenWidth = window.screen?.width || window.innerWidth || 1920;
  const screenHeight = window.screen?.height || window.innerHeight || 1080;
  const viewportWidth = window.innerWidth || 1920;
  const viewportHeight = window.innerHeight || 1080;
  const isMobile = viewportWidth < 640;

  let baseFontSizePx = 13;
  let densityCategory: ScreenDensityProfile['densityCategory'] = 'standard';
  let label = 'Standard Display (1080p / 1.0x)';

  if (isMobile) {
    densityCategory = 'compact';
    // Mobile high-DPI screens have small physical screen real-estate with simulated CSS pixels (~390-430px)
    baseFontSizePx = dpr >= 2.5 ? 13.5 : 13;
    label = `Mobile Display (${Math.round(viewportWidth)}px • ${dpr.toFixed(1)}x DPR)`;
  } else if (screenWidth >= 3200 || (dpr >= 2.2 && screenWidth >= 2560)) {
    densityCategory = 'ultra-high';
    baseFontSizePx = 17;
    label = `Ultra High-Res 4K/5K (${screenWidth}×${screenHeight} • ${dpr.toFixed(1)}x DPR)`;
  } else if (dpr >= 1.8 || screenWidth >= 2560) {
    densityCategory = 'retina-4k';
    baseFontSizePx = 16;
    label = `Retina / High-DPI (${screenWidth}×${screenHeight} • ${dpr.toFixed(1)}x DPR)`;
  } else if (dpr > 1.1 || screenWidth >= 2000) {
    densityCategory = 'medium-high';
    baseFontSizePx = 14.5;
    label = `Scaled / 1440p QHD (${screenWidth}×${screenHeight} • ${dpr.toFixed(1)}x DPR)`;
  } else {
    densityCategory = 'standard';
    baseFontSizePx = 13;
    label = `Standard 1080p (${screenWidth}×${screenHeight} • ${dpr.toFixed(1)}x DPR)`;
  }

  const validPreference: FontSizePreference = 
    fontSizePreference && fontSizePreference in PREFERENCE_OFFSETS
      ? (fontSizePreference as FontSizePreference)
      : 'medium';

  const offsetPx = PREFERENCE_OFFSETS[validPreference] ?? 0;
  // Keep font size in safe readable boundary [10px, 22px]
  const computedFontSizePx = Math.max(10, Math.min(22, baseFontSizePx + offsetPx));

  return {
    dpr,
    densityCategory,
    label,
    baseFontSizePx,
    offsetPx,
    computedFontSizePx,
    screenWidth,
    screenHeight,
    viewportWidth,
    viewportHeight,
  };
}

/**
 * Gets the current font size preference from localStorage
 */
export function getCurrentFontSizePreference(): FontSizePreference {
  if (typeof window === 'undefined') return 'medium';
  const saved = localStorage.getItem('fontSize');
  if (saved && saved in PREFERENCE_OFFSETS) {
    return saved as FontSizePreference;
  }
  return 'medium';
}

/**
 * Applies the calculated DPI-aware font size to document root and localStorage
 */
export function applyDpiAwareFontSize(
  fontSizePreference?: FontSizePreference | string | null
): ScreenDensityProfile {
  const profile = calculateDpiFontMetrics(fontSizePreference);

  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    root.style.fontSize = `${profile.computedFontSizePx}px`;
    root.style.setProperty('--seshnx-base-font-size', `${profile.computedFontSizePx}px`);
    root.style.setProperty('--seshnx-dpr', String(profile.dpr));

    const pref = fontSizePreference && fontSizePreference in PREFERENCE_OFFSETS
      ? fontSizePreference
      : 'medium';
    localStorage.setItem('fontSize', pref);
  }

  return profile;
}

/**
 * Listens for DPI changes (moving window to another monitor with different DPI,
 * changing OS scaling, or resizing) and recalculates dynamically.
 * 
 * Returns an unregister cleanup function.
 */
export function initDpiFontListener(
  onUpdate?: (profile: ScreenDensityProfile) => void
): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  let mediaQueryList: MediaQueryList | null = null;
  let resizeTimer: number | null = null;

  const handleRecalibration = () => {
    const currentPref = getCurrentFontSizePreference();
    const profile = applyDpiAwareFontSize(currentPref);
    if (onUpdate) {
      onUpdate(profile);
    }
    setupResolutionListener();
  };

  const setupResolutionListener = () => {
    if (mediaQueryList) {
      try {
        mediaQueryList.removeEventListener('change', handleRecalibration);
      } catch {
        // Fallback for older browsers
        mediaQueryList.removeListener?.(handleRecalibration);
      }
    }

    try {
      const currentDpr = window.devicePixelRatio || 1;
      mediaQueryList = window.matchMedia(`(resolution: ${currentDpr}dppx)`);
      if (mediaQueryList.addEventListener) {
        mediaQueryList.addEventListener('change', handleRecalibration);
      } else if (mediaQueryList.addListener) {
        mediaQueryList.addListener(handleRecalibration);
      }
    } catch (e) {
      console.warn('Resolution media query listener not supported:', e);
    }
  };

  const handleResize = () => {
    if (resizeTimer !== null) {
      window.clearTimeout(resizeTimer);
    }
    resizeTimer = window.setTimeout(handleRecalibration, 150);
  };

  // Initial application & listener setup
  handleRecalibration();
  window.addEventListener('resize', handleResize);

  return () => {
    window.removeEventListener('resize', handleResize);
    if (resizeTimer !== null) {
      window.clearTimeout(resizeTimer);
    }
    if (mediaQueryList) {
      try {
        mediaQueryList.removeEventListener('change', handleRecalibration);
      } catch {
        mediaQueryList.removeListener?.(handleRecalibration);
      }
    }
  };
}
