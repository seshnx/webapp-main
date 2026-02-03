import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for merging tailwind classes
function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

/**
 * Button variant types
 */
type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';

/**
 * Button size types
 */
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

/**
 * Button component props
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Additional CSS classes */
  className?: string;
  /** Button variant style */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Child elements */
  children?: React.ReactNode;
}

/**
 * Button Component
 *
 * A versatile button component with multiple variants and sizes.
 *
 * @param props - Button props
 * @returns Button component
 *
 * @example
 * <Button variant="default" size="md">Click me</Button>
 *
 * @example
 * <Button variant="destructive" size="sm">Delete</Button>
 *
 * @example
 * <Button variant="outline" size="icon"><Icon /></Button>
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variants: Record<ButtonVariant, string> = {
      default: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
      destructive: "bg-red-500 text-white hover:bg-red-600 shadow-sm",
      outline: "border border-gray-200 bg-transparent hover:bg-gray-100 text-gray-900",
      secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
      ghost: "hover:bg-gray-100 hover:text-gray-900 text-gray-600",
      link: "text-blue-600 underline-offset-4 hover:underline",
    };

    const sizes: Record<ButtonSize, string> = {
      default: "h-9 px-4 py-2",
      sm: "h-8 rounded-md px-3 text-xs",
      lg: "h-10 rounded-md px-8",
      icon: "h-9 w-9",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
