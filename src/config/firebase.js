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

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});

// Initialize Storage only if storageBucket is configured
let storage = null;
try {
  if (firebaseConfig.storageBucket) {
    storage = getStorage(app);
  } else {
    console.warn('Firebase Storage is not configured. VITE_FIREBASE_STORAGE_BUCKET is missing.');
  }
} catch (error) {
  console.error('Failed to initialize Firebase Storage:', error);
  storage = null;
}
export { storage };

// Initialize Realtime Database with error handling
let rtdb = null;
try {
  if (firebaseConfig.projectId) {
    rtdb = getDatabase(app);
  } else {
    console.warn('Firebase Realtime Database is not configured. VITE_FIREBASE_PROJECT_ID is missing.');
  }
} catch (error) {
  console.error('Failed to initialize Firebase Realtime Database:', error);
  rtdb = null;
}
export { rtdb }; 

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
  // Note: Collections need odd segments, documents need even segments
  followers: `artifacts/${appId}/users/${uid}/followers`,
  following: `artifacts/${appId}/users/${uid}/following`,
  socialStats: `artifacts/${appId}/users/${uid}/stats/social`,
  notifications: `artifacts/${appId}/users/${uid}/notifications`,
  savedPosts: `artifacts/${appId}/users/${uid}/savedPosts`,
});
