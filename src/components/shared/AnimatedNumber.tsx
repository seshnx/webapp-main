import React from 'react';

/**
 * Animated number component props
 */
export interface AnimatedNumberProps {
  /** Numeric value to display */
  value: number;
  /** Locale for number formatting */
  locale?: string;
  /** Number of decimal places */
  decimals?: number;
}

/**
 * Animated Number Component
 *
 * Displays a formatted number with locale-specific formatting.
 * Animation temporarily removed to avoid TDZ issues.
 *
 * @param props - Animated number props
 * @returns Formatted number component
 *
 * @example
 * <AnimatedNumber value={1234} /> // "1,234"
 *
 * @example
 * // With decimals
 * <AnimatedNumber value={1234.56} decimals={2} /> // "1,234.56"
 *
 * @example
 * // European locale
 * <AnimatedNumber value={1234} locale="de-DE" /> // "1.234"
 */
export default function AnimatedNumber({
  value,
  locale = 'en-US',
  decimals
}: AnimatedNumberProps): React.ReactElement {
  // Direct display without animation to avoid TDZ issues with useState during module initialization
  const formattedValue = decimals !== undefined
    ? value.toLocaleString(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    : value.toLocaleString(locale);

  return <span>{formattedValue}</span>;
}
