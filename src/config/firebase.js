import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, getFirestore as getExistingFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';
// import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// 1. Singleton Pattern for App (Fixes HMR/Re-init issues and _checkNotDeleted error)
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// 2. Initialize Core Services
export const auth = getAuth(app);

// Initialize Firestore safely
// initializeFirestore throws if called twice on the same app with different settings.
let firestoreDb;
try {
  firestoreDb = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
  });
} catch (e) {
  // If already initialized (e.g. during HMR), just get the existing instance
  firestoreDb = getExistingFirestore(app);
}
export const db = firestoreDb;

// Export functions globally again, now that app is guaranteed to be stable
// TEMPORARILY DISABLED: Firebase Functions service not available
// export const functions = getFunctions(app);
// export const functions = null; // Removed export to prevent null access errors

// 3. Initialize Optional Services (Storage & Realtime DB)
// Only initialize if services are properly configured to avoid Firebase validation errors
// Export null if services are not available - consuming code must check for null
let storageInstance = null;
let rtdbInstance = null;

// Initialize Storage only if storageBucket is configured
// Don't attempt initialization if config is missing to prevent Firebase errors
if (firebaseConfig.storageBucket && firebaseConfig.storageBucket.trim() !== '') {
  try {
    storageInstance = getStorage(app);
  } catch (error) {
    // Service not available - expected if Storage is not enabled in Firebase project
    storageInstance = null;
  }
}

// Initialize RTDB only if projectId is configured
// Don't attempt initialization if config is missing to prevent Firebase errors
if (firebaseConfig.projectId && firebaseConfig.projectId.trim() !== '') {
  try {
    rtdbInstance = getDatabase(app);
  } catch (error) {
    // Service not available - expected if RTDB is not enabled in Firebase project
    rtdbInstance = null;
  }
}

// Export services - will be null if not available
// All consuming code must check for null before using these services
export const storage = storageInstance;
export const rtdb = rtdbInstance;
export const appId = firebaseConfig.projectId;

export const getPaths = (uid) => ({
  // Core Profile
  userProfile: `artifacts/${appId}/users/${uid}/profiles/main`,
  userSubProfile: (role) => `artifacts/${appId}/users/${uid}/profiles/${role}`,
  userPublicProfile: `artifacts/${appId}/users/${uid}/public_profile/main`, 
  
  // Public Data
  publicProfileCollectionGroup: 'public_profile',
  publicFeed: `artifacts/${appId}/public/data/posts`,
  serviceRequests: `artifacts/${appId}/public/data/service_requests`,
  
  // Interactions
  messages: `artifacts/${appId}/public/data/direct_messages`,
  
  // SeshFx Market
  marketplaceItems: `artifacts/${appId}/public/data/market_items`,
  userLibrary: `artifacts/${appId}/users/${uid}/library`, 
  marketAssets: `artifacts/${appId}/users/${uid}/assets/market`,
  
  // Financials
  userWallet: `artifacts/${appId}/users/${uid}/wallet/account`, 
  profileImages: `artifacts/${appId}/users/${uid}/images/profile`,
  
  // Tech/Gear
  equipmentSubmissions: `artifacts/${appId}/public/data/equipment_submissions`, 
  
  // Education
  studentRecord: (schoolId, studentUid) => `schools/${schoolId}/students/${studentUid}`,

  // --- DISTRIBUTION & LABEL ---
  distributionReleases: `artifacts/${appId}/distribution/${uid}/releases`,
  royaltyReports: `artifacts/${appId}/distribution/${uid}/royalty_reports`,
  distributionStats: `artifacts/${appId}/distribution/${uid}/stats/main`,
  
  labelRoster: (labelId) => `artifacts/${appId}/labels/${labelId}/roster`,
  labelInvites: (labelId) => `artifacts/${appId}/labels/${labelId}/invites`,
  
  // --- GEAR EXCHANGE (NEW) ---
  gearListings: `artifacts/${appId}/public/data/gear_listings`,
  
  // --- SOCIAL GRAPH (Phase 1) ---
  followers: `artifacts/${appId}/users/${uid}/followers`,
  following: `artifacts/${appId}/users/${uid}/following`,
  socialStats: `artifacts/${appId}/users/${uid}/stats/social`,
  notifications: `artifacts/${appId}/users/${uid}/notifications`,
  savedPosts: `artifacts/${appId}/users/${uid}/savedPosts`,
});
