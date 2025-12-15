import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// 1. CONFIGURATION
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCmGxvXX2D11Jo3NZlD0jO1vQpskaG0sCU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "seshnx-db.firebaseapp.com",
  // databaseURL is no longer needed since you use Convex, but keeping it in config doesn't hurt
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://seshnx-db-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "seshnx-db",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "seshnx-db.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "718084970004",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:718084970004:web:d68ba48c5eb493af9db901",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-7SP53NK9FM"
};

// 2. INITIALIZE NAMED APP
// Using a specific name "SeshNx-Client" isolates us from any broken [DEFAULT] instances
const APP_NAME = "SeshNx-Client";
let appInstance;

try {
  appInstance = getApp(APP_NAME);
} catch (e) {
  appInstance = initializeApp(firebaseConfig, APP_NAME);
  console.log(`🚀 Initialized new Firebase App: ${APP_NAME}`);
}

export const app = appInstance;

// 3. INITIALIZE SERVICES
export const auth = getAuth(app);

// Firestore (Synchronous Fallback to avoid build errors)
let firestoreDb;
try {
    firestoreDb = initializeFirestore(app, {
        localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
    });
} catch (e) {
    // Just use the statically imported getFirestore directly
    const { getFirestore } = require('firebase/firestore'); 
    // OR more simply, relying on the top-level import since we are in a module:
    // We already imported getFirestore at the top, so we can use it.
    // However, since we are inside a catch block, let's just use the standard getter.
    // To be safe and avoid "require" issues in Vite, we assume the import works or rely on the global.
    // Actually, simply calling the imported function is safest:
    firestoreDb = getFirestore(app);
}
export const db = firestoreDb;

// --- REALTIME DATABASE ---
// DISABLED: You are using Convex for real-time data.
export const rtdb = null; 

// --- STORAGE ---
let storageInstance = null;
try {
    // Ensure bucket URL has gs:// prefix if needed by the SDK
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
