// Firebase adapter stub - migration to Neon complete
// This file provides empty exports to prevent build errors

export const getFirestore = () => ({
  collection: () => ({}),
  doc: () => ({}),
  getDoc: () => Promise.reject(new Error('Firebase Firestore deprecated - use Neon')),
  getDocs: () => Promise.reject(new Error('Firebase Firestore deprecated - use Neon')),
  setDoc: () => Promise.reject(new Error('Firebase Firestore deprecated - use Neon')),
  updateDoc: () => Promise.reject(new Error('Firebase Firestore deprecated - use Neon')),
  deleteDoc: () => Promise.reject(new Error('Firebase Firestore deprecated - use Neon')),
  onSnapshot: () => () => {},
});

export const collection = () => ({});
export const doc = () => ({});
export const getDoc = () => Promise.reject(new Error('Use Neon queries'));
export const getDocs = () => Promise.reject(new Error('Use Neon queries'));
export const setDoc = () => Promise.reject(new Error('Use Neon queries'));
export const updateDoc = () => Promise.reject(new Error('Use Neon queries'));
export const deleteDoc = () => Promise.reject(new Error('Use Neon queries'));
export const onSnapshot = () => () => {};
export const query = () => ({});
export const where = () => ({});
export const orderBy = () => ({});
export const limit = () => ({});

export default {};
