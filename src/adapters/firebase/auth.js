// Firebase adapter stub - migration to Clerk complete
// This file provides empty exports to prevent build errors

export const getAuth = () => ({
  currentUser: null,
  signInWithEmailAndPassword: () => Promise.reject(new Error('Firebase Auth deprecated - use Clerk')),
  createUserWithEmailAndPassword: () => Promise.reject(new Error('Firebase Auth deprecated - use Clerk')),
  signOut: () => Promise.reject(new Error('Firebase Auth deprecated - use Clerk')),
  onAuthStateChanged: () => () => {},
});

export const signInWithEmailAndPassword = () => Promise.reject(new Error('Firebase Auth deprecated'));
export const createUserWithEmailAndPassword = () => Promise.reject(new Error('Firebase Auth deprecated'));
export const signOut = () => Promise.reject(new Error('Firebase Auth deprecated'));
export const onAuthStateChanged = () => () => {};

export default {};
