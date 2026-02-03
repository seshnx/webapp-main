import React from 'react';

/**
 * Page transition component props
 */
export interface PageTransitionProps {
  /** Child elements to animate */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Page Transition Component
 *
 * Wraps children with a fade-in animation module.
 * Used for smooth page transitions.
 *
 * @param props - Page transition props
 * @returns Animated children
 *
 * @example
 * <PageTransition>
 *   <YourPageContent />
 * </PageTransition>
 *
 * @example
 * // With custom classes
 * <PageTransition className="custom-animation">
 *   <YourPageContent />
 * </PageTransition>
 */
export default function PageTransition({ children, className = "" }: PageTransitionProps): React.ReactElement {
  return (
    <div className={`module-fade-in ${className}`}>
      {children}
    </div>
  );
}
