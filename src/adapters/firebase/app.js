// Firebase adapter stub - migration to Neon/Convex complete
// This file provides empty exports to prevent build errors

export const initializeApp = () => {
  console.warn('[DEPRECATED] Firebase app initialized - migration to Neon/Convex complete');
  return { name: 'stub' };
};

export const getApps = () => [];
export const getApp = () => ({ name: 'stub' });

export default {};
