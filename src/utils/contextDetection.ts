import type { AccountType } from '@/types/index.js';

export type AppContext = 'studio' | 'edu';

/**
 * Detect current app context based on URL path
 * EDU context if path starts with 'edu', otherwise Studio/default
 */
export function detectContextFromPath(pathname: string): AppContext {
  const firstSegment = pathname.split('/')[1];
  return firstSegment?.startsWith('edu') ? 'edu' : 'studio';
}

/**
 * Detect context based on user's account types
 * EDU context if user has any EDU-related roles
 */
export function detectContextFromRoles(accountTypes?: AccountType[]): AppContext {
  if (!accountTypes || accountTypes.length === 0) {
    return 'studio';
  }

  const hasEduRole = accountTypes.some(
    type => type.startsWith('EDU') || type === 'Student' || type === 'Intern'
  );

  return hasEduRole ? 'edu' : 'studio';
}

/**
 * Get roles available for a specific context
 */
export function getRolesForContext(
  allRoles: AccountType[],
  context: AppContext
): AccountType[] {
  if (context === 'edu') {
    return allRoles.filter(role =>
      role === 'Student' ||
      role === 'Intern' ||
      role.startsWith('EDU')
    );
  }

  return allRoles.filter(role =>
    role !== 'Student' &&
    role !== 'Intern' &&
    !role.startsWith('EDU')
  );
}
