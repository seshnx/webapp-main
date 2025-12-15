import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';

// 1. CONFIGURATION
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCmGxvXX2D11Jo3NZlD0jO1vQpskaG0sCU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "seshnx-db.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://seshnx-db-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "seshnx-db",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "seshnx-db.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "718084970004",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:718084970004:web:d68ba48c5eb493af9db901",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-7SP53NK9FM"
};

// 2. INITIALIZE NAMED APP (The Fix)
// We use a specific name "SeshNx-Client" to avoid conflicts with the broken [DEFAULT] app
const APP_NAME = "SeshNx-Client";
let appInstance;

try {
  // Try to find our specific named app
  appInstance = getApp(APP_NAME);
} catch (e) {
  // If not found, create it fresh
  appInstance = initializeApp(firebaseConfig, APP_NAME);
  console.log(`🚀 Initialized new Firebase App: ${APP_NAME}`);
}

export const app = appInstance;

// 3. INITIALIZE SERVICES (Attached to our Named App)
export const auth = getAuth(app);

// Firestore
let firestoreDb;
try {
    firestoreDb = initializeFirestore(app, {
        localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
    });
} catch (e) {
    // Fallback if already initialized
    const { getFirestore } = await import('firebase/firestore');
    firestoreDb = getFirestore(app);
}
export const db = firestoreDb;

// Realtime DB
export const rtdb = getDatabase(app);

// Storage
let storageInstance = null;
try {
    // Explicitly pass the app instance AND the bucket URL to be absolutely safe
    // The SDK sometimes needs the gs:// prefix if the config is flaky
    const bucketUrl = firebaseConfig.storageBucket.startsWith('gs://') 
        ? firebaseConfig.storageBucket 
        : `gs://${firebaseConfig.storageBucket}`;
        
    storageInstance = getStorage(app, bucketUrl);
    console.log("✅ Storage Service Attached to", APP_NAME);
} catch (error) {
    console.error("❌ Storage Init Failed:", error);
}

export const storage = storageInstance;
export const appId = firebaseConfig.projectId;

// (Path helpers remain the same)
export const getPaths = (uid) => ({
  userProfile: `artifacts/${appId}/users/${uid}/profiles/main`,
  userSubProfile: (role) => `artifacts/${appId}/users/${uid}/profiles/${role}`,
  userPublicProfile: `artifacts/${appId}/users/${uid}/public_profile/main`, 
  publicProfileCollectionGroup: 'public_profile',
  publicFeed: `artifacts/${appId}/public/data/posts`,
  serviceRequests: `artifacts/${appId}/public/data/service_requests`,
  messages: `artifacts/${appId}/public/data/direct_messages`,
  marketplaceItems: `artifacts/${appId}/public/data/market_items`,
  userLibrary: `artifacts/${appId}/users/${uid}/library`, 
  marketAssets: `artifacts/${appId}/users/${uid}/assets/market`,
  userWallet: `artifacts/${appId}/users/${uid}/wallet/account`, 
  profileImages: `artifacts/${appId}/users/${uid}/images/profile`,
  equipmentSubmissions: `artifacts/${appId}/public/data/equipment_submissions`, 
  studentRecord: (schoolId, studentUid) => `schools/${schoolId}/students/${studentUid}`,
  distributionReleases: `artifacts/${appId}/distribution/${uid}/releases`,
  royaltyReports: `artifacts/${appId}/distribution/${uid}/royalty_reports`,
  distributionStats: `artifacts/${appId}/distribution/${uid}/stats/main`,
  labelRoster: (labelId) => `artifacts/${appId}/labels/${labelId}/roster`,
  labelInvites: (labelId) => `artifacts/${appId}/labels/${labelId}/invites`,
  gearListings: `artifacts/${appId}/public/data/gear_listings`,
  followers: `artifacts/${appId}/users/${uid}/followers`,
  following: `artifacts/${appId}/users/${uid}/following`,
  socialStats: `artifacts/${appId}/users/${uid}/stats/social`,
  notifications: `artifacts/${appId}/users/${uid}/notifications`,
  savedPosts: `artifacts/${appId}/users/${uid}/savedPosts`,
  safeExchangeTransactions: `artifacts/${appId}/public/data/safe_exchange_transactions`,
  userSafeExchanges: `artifacts/${appId}/users/${uid}/safe_exchanges`,
  safeZones: `artifacts/${appId}/public/data/safe_zones`,
  escrowHolds: `artifacts/${appId}/escrow/holds`,
  shippingTransactions: `artifacts/${appId}/public/data/shipping_transactions`,
  userShippingTransactions: `artifacts/${appId}/users/${uid}/shipping_transactions`,
});
