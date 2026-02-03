// Firebase adapter stub - migration to Vercel API routes complete
// This file provides empty exports to prevent build errors

export const getFunctions = () => ({
  httpsCallable: () => () => Promise.reject(new Error('Firebase Functions deprecated - use Vercel API routes')),
});

export const httpsCallable = () => () => Promise.reject(new Error('Use Vercel API routes'));
export const connectFunctionsEmulator = () => console.warn('Functions emulator not available');

export default {};
