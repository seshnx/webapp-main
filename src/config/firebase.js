import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// 1. Initialize App
export const app = initializeApp(firebaseConfig);

// 2. Initialize & Export Core Services
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});

// 3. Initialize Optional Services (Storage & Realtime DB)
// We attempt to initialize these but catch errors if they aren't available/configured
let storageInstance = null;
let rtdbInstance = null;

try {
  if (firebaseConfig.storageBucket) {
    storageInstance = getStorage(app);
  }
} catch (error) {
  console.warn('Storage initialization deferred/failed:', error.message);
}

try {
  if (firebaseConfig.projectId) {
    rtdbInstance = getDatabase(app);
  }
} catch (error) {
  console.warn('RTDB initialization deferred/failed:', error.message);
}

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
