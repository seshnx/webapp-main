// Firebase adapter stub - migration to Convex complete
// This file provides empty exports to prevent build errors

export const getDatabase = () => ({
  ref: () => ({}),
  onValue: () => () => {},
  set: () => Promise.reject(new Error('Firebase Realtime Database deprecated - use Convex')),
  update: () => Promise.reject(new Error('Firebase Realtime Database deprecated - use Convex')),
  remove: () => Promise.reject(new Error('Firebase Realtime Database deprecated - use Convex')),
});

export const ref = () => ({});
export const onValue = () => () => {};
export const set = () => Promise.reject(new Error('Use Convex'));
export const update = () => Promise.reject(new Error('Use Convex'));
export const remove = () => Promise.reject(new Error('Use Convex'));
export const query = () => ({});
export const orderByChild = () => ({});
export const limitToLast = () => ({});
export const serverTimestamp = () => new Date();

export default {};
