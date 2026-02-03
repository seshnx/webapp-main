// Firebase adapter stub - migration to Vercel Blob complete
// This file provides empty exports to prevent build errors

export const getStorage = () => ({
  ref: () => ({}),
  uploadBytes: () => Promise.reject(new Error('Firebase Storage deprecated - use Vercel Blob')),
  getDownloadURL: () => Promise.reject(new Error('Firebase Storage deprecated - use Vercel Blob')),
  deleteObject: () => Promise.reject(new Error('Firebase Storage deprecated - use Vercel Blob')),
});

export const ref = () => ({});
export const uploadBytes = () => Promise.reject(new Error('Use Vercel Blob'));
export const getDownloadURL = () => Promise.reject(new Error('Use Vercel Blob'));
export const deleteObject = () => Promise.reject(new Error('Use Vercel Blob'));
export const uploadBytesResumable = () => ({});
export const uploadString = () => Promise.reject(new Error('Use Vercel Blob'));

export default {};
