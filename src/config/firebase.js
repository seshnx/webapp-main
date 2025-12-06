import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, getFirestore as getExistingFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';
// import { getFunctions } from 'firebase/functions';

// Firebase Configuration
// NEW PROJECT: seshnx-db (fresh start to clear misconfigurations)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCmGxvXX2D11Jo3NZlD0jO1vQpskaG0sCU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "seshnx-db.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://seshnx-db-default-rtdb.firebaseio.com", // RTDB URL
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "seshnx-db",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "seshnx-db.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "718084970004",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:718084970004:web:d68ba48c5eb493af9db901",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-7SP53NK9FM"
};

// 1. Singleton Pattern for App (Fixes HMR/Re-init issues and _checkNotDeleted error)
// Ensure databaseURL is in config before initializing
if (!firebaseConfig.databaseURL) {
  firebaseConfig.databaseURL = import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://seshnx-db-default-rtdb.firebaseio.com";
}

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
// Services are initialized with error handling - if not available, they'll be null
let storageInstance = null;
let rtdbInstance = null;

// Initialize RTDB - Rebuilt initialization pattern
const initializeRTDB = () => {
  const dbURL = firebaseConfig.databaseURL;
  
  if (!dbURL || dbURL.trim() === '') {
    console.warn('⚠️ databaseURL not found in config. RTDB will not be available.');
    return null;
  }

  try {
    console.log('🔄 Initializing RTDB...');
    console.log('📍 Database URL:', dbURL);
    console.log('📍 Project ID:', firebaseConfig.projectId);
    
    // Get database instance - Firebase uses databaseURL from app config
    const db = getDatabase(app);
    
    // Test if database is accessible by checking the app's options
    if (db && app.options?.databaseURL) {
      console.log('✅ RTDB initialized successfully');
      console.log('✅ Database URL confirmed:', app.options.databaseURL);
      return db;
    }
    
    console.warn('⚠️ RTDB instance created but may not be properly configured');
    return db;
  } catch (error) {
    console.error('❌ RTDB initialization failed:', error.message);
    console.error('Error details:', {
      name: error.name,
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    console.warn('💡 Troubleshooting:');
    console.warn('   1. Verify RTDB is enabled in Firebase Console');
    console.warn('   2. Check databaseURL matches Firebase Console');
    console.warn('   3. Ensure environment variables are set in Vercel');
    return null;
  }
};

rtdbInstance = initializeRTDB();

// Initialize Storage if storageBucket is configured
if (firebaseConfig.storageBucket && firebaseConfig.storageBucket.trim() !== '') {
  try {
    storageInstance = getStorage(app);
  } catch (error) {
    // Service not available - expected if Storage is not enabled in Firebase project
    storageInstance = null;
  }
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
