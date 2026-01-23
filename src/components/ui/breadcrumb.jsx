/**
 * Breadcrumb Navigation Component
 *
 * Displays breadcrumb navigation for the current page.
 * Automatically generates breadcrumbs from the current URL path.
 *
 * @example
 * <Breadcrumb />
 *
 * @example with custom home
 * <Breadcrumb home={{ label: 'Home', path: '/' }} />
 *
 * @example with custom separator
 * <Breadcrumb separator=">" />
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useBreadcrumbs } from '../../hooks/useBreadcrumbs';

// Utility for merging tailwind classes
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Breadcrumb Root Component
 */
const Breadcrumb = React.forwardRef((
  {
    className,
    ...props
  },
  ref
) => {
  return (
    <nav
      ref={ref}
      aria-label="Breadcrumb"
      className={cn("flex items-center text-sm", className)}
      {...props}
    />
  );
});

Breadcrumb.displayName = "Breadcrumb";

/**
 * Breadcrumb List Component
 */
const BreadcrumbList = React.forwardRef((
  {
    className,
    ...props
  },
  ref
) => {
  return (
    <ol
      ref={ref}
      className={cn("flex items-center gap-1.5 flex-wrap", className)}
      {...props}
    />
  );
});

BreadcrumbList.displayName = "BreadcrumbList";

/**
 * Breadcrumb Item Component
 */
const BreadcrumbItem = React.forwardRef((
  {
    className,
    ...props
  },
  ref
) => {
  return (
    <li
      ref={ref}
      className={cn("flex items-center gap-1.5", className)}
      {...props}
    />
  );
});

BreadcrumbItem.displayName = "BreadcrumbItem";

/**
 * Breadcrumb Link Component
 */
const BreadcrumbLink = React.forwardRef((
  {
    className,
    to,
    children,
    ...props
  },
  ref
) => {
  return (
    <Link
      ref={ref}
      to={to}
      className={cn(
        "transition-colors hover:text-brand-blue dark:hover:text-brand-blue/80",
        "text-gray-600 dark:text-gray-400 font-medium",
        className
      )}
      {...props}
    >
      {children}
    </Link>
  );
});

BreadcrumbLink.displayName = "BreadcrumbLink";

/**
 * Breadcrumb Page Component (current page, not a link)
 */
const BreadcrumbPage = React.forwardRef((
  {
    className,
    ...props
  },
  ref
) => {
  return (
    <span
      ref={ref}
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn(
        "font-normal text-gray-900 dark:text-white",
        className
      )}
      {...props}
    />
  );
});

BreadcrumbPage.displayName = "BreadcrumbPage";

/**
 * Breadcrumb Separator Component
 */
const BreadcrumbSeparator = ({
  children,
  className,
  ...props
}) => {
  return (
    <li
      role="presentation"
      aria-hidden="true"
      className={cn("flex items-center gap-1.5", className)}
      {...props}
    >
      {children || <ChevronRight className="h-4 w-4" />}
    </li>
  );
};

BreadcrumbSeparator.displayName = "BreadcrumbSeparator";

/**
 * Complete Breadcrumb Navigation Component
 * Automatically generates breadcrumbs from the current URL
 *
 * @example
 * <BreadcrumbNav />
 *
 * @example with custom options
 * <BreadcrumbNav
 *   showHome={true}
 *   homeLabel="Home"
 *   homePath="/"
 *   separator="/"
 * />
 */
const BreadcrumbNav = React.forwardRef((
  {
    className,
    showHome = false,
    homeLabel = 'dashboard',
    homePath = '/dashboard',
    separator,
    ...props
  },
  ref
) => {
  const { breadcrumbs, isRoot } = useBreadcrumbs();

  // Don't show breadcrumbs on root
  if (isRoot) {
    return null;
  }

  const displayBreadcrumbs = showHome
    ? [{ label: homeLabel, path: homePath }, ...breadcrumbs]
    : breadcrumbs;

  const Separator = separator !== undefined
    ? () => <BreadcrumbSeparator>{separator}</BreadcrumbSeparator>
    : BreadcrumbSeparator;

  return (
    <Breadcrumb ref={ref} className={className} {...props}>
      <BreadcrumbList>
        {displayBreadcrumbs.map((crumb, index) => {
          const isLast = index === displayBreadcrumbs.length - 1;
          const hasPath = crumb.path !== null && crumb.path !== undefined;

          return (
            <React.Fragment key={index}>
              <BreadcrumbItem>
                {isLast || !hasPath ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink to={crumb.path}>
                    {crumb.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <Separator />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
});

BreadcrumbNav.displayName = "BreadcrumbNav";

/**
 * Compact Breadcrumb Component
 * Shows only the current page with a back link to parent
 *
 * @example
 * <BreadcrumbNavCompact />
 */
const BreadcrumbNavCompact = React.forwardRef((
  {
    className,
    ...props
  },
  ref
) => {
  const { currentLabel, parentPath, hasParent, breadcrumbs } = useBreadcrumbs();

  if (!hasParent) {
    return null;
  }

  const parentLabel = breadcrumbs.length > 1
    ? breadcrumbs[breadcrumbs.length - 2].label
    : 'dashboard';

  return (
    <Breadcrumb ref={ref} className={className} {...props}>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink to={parentPath}>
            {parentLabel}
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{currentLabel}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
});

BreadcrumbNavCompact.displayName = "BreadcrumbNavCompact";

/**
 * Breadcrumb with Home Icon
 * Shows home icon as the first breadcrumb
 *
 * @example
 * <BreadcrumbNavWithHome />
 */
const BreadcrumbNavWithHome = React.forwardRef((
  {
    className,
    homePath = '/dashboard',
    ...props
  },
  ref
) => {
  const { breadcrumbs, isRoot } = useBreadcrumbs();

  if (isRoot) {
    return null;
  }

  return (
    <Breadcrumb ref={ref} className={className} {...props}>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink to={homePath} aria-label="Home">
            <Home className="h-4 w-4" />
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const hasPath = crumb.path !== null && crumb.path !== undefined;

          return (
            <React.Fragment key={index}>
              <BreadcrumbItem>
                {isLast || !hasPath ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink to={crumb.path}>
                    {crumb.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
});

BreadcrumbNavWithHome.displayName = "BreadcrumbNavWithHome";

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbNav,
  BreadcrumbNavCompact,
  BreadcrumbNavWithHome,
};

export default BreadcrumbNav;
