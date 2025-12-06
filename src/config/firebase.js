import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, getFirestore as getExistingFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';
// import { getFunctions } from 'firebase/functions';

// Firebase Configuration
// NEW PROJECT: seshnx-db (fresh start to clear misconfigurations)

// Debug: Log environment variables (values only, not full keys for security)
console.log('🔍 Environment Variables Check:', {
  hasApiKey: !!import.meta.env.VITE_FIREBASE_API_KEY,
  hasAuthDomain: !!import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  hasDatabaseURL: !!import.meta.env.VITE_FIREBASE_DATABASE_URL,
  hasProjectId: !!import.meta.env.VITE_FIREBASE_PROJECT_ID,
  hasStorageBucket: !!import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  databaseURL_from_env: import.meta.env.VITE_FIREBASE_DATABASE_URL || 'NOT SET - using fallback'
});

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

// Ensure databaseURL is always set
if (!firebaseConfig.databaseURL) {
  firebaseConfig.databaseURL = import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://seshnx-db-default-rtdb.firebaseio.com";
}

// 1. Singleton Pattern for App (Fixes HMR/Re-init issues and _checkNotDeleted error)
// CRITICAL: Always initialize with databaseURL included
let existingApp = null;
try {
  existingApp = getApp();
  // Check if existing app has databaseURL
  if (existingApp.options?.databaseURL) {
    console.log('✅ Found existing app with databaseURL:', existingApp.options.databaseURL);
  } else if (firebaseConfig.databaseURL) {
    console.warn('⚠️ Existing app missing databaseURL!');
    console.warn('   This can cause "Service database is not available" error');
    console.warn('   Solution: Hard refresh browser (Ctrl+Shift+R) to reinitialize app');
    // Continue with existing app - user needs to refresh
  }
} catch (e) {
  // No existing app - will create new one
  existingApp = null;
}

export const app = existingApp || initializeApp(firebaseConfig);

// Log app configuration for debugging
console.log('📋 Firebase App Configuration:', {
  name: app.name,
  projectId: app.options?.projectId,
  databaseURL: app.options?.databaseURL || 'NOT SET (this is the problem!)',
  authDomain: app.options?.authDomain
});

// Verify databaseURL is in app options
if (!app.options?.databaseURL && firebaseConfig.databaseURL) {
  console.error('❌ CRITICAL: App initialized without databaseURL!');
  console.error('   Expected:', firebaseConfig.databaseURL);
  console.error('   This will cause "Service database is not available" error');
  console.error('   Fix: Clear browser cache and hard refresh (Ctrl+Shift+R)');
}

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

// Initialize RTDB - Rebuilt with explicit app reinitialization if needed
const initializeRTDB = () => {
  const dbURL = firebaseConfig.databaseURL;
  
  if (!dbURL || dbURL.trim() === '') {
    console.warn('⚠️ databaseURL not found in config. RTDB will not be available.');
    return null;
  }

  try {
    console.log('🔄 Initializing RTDB...');
    console.log('📍 Config databaseURL:', dbURL);
    console.log('📍 App options databaseURL:', app.options?.databaseURL || 'NOT SET');
    console.log('📍 Project ID:', firebaseConfig.projectId);
    
    // CRITICAL CHECK: App must have databaseURL in options
    if (!app.options?.databaseURL) {
      console.error('❌ CRITICAL ERROR: App.options.databaseURL is missing!');
      console.error('   Config has:', dbURL);
      console.error('   But app.options.databaseURL is:', app.options?.databaseURL);
      console.error('');
      console.error('   ROOT CAUSE: App was initialized before databaseURL was added to config');
      console.error('   OR: Environment variable VITE_FIREBASE_DATABASE_URL is not being read');
      console.error('');
      console.error('   SOLUTIONS:');
      console.error('   1. Hard refresh browser: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)');
      console.error('   2. Clear browser cache completely');
      console.error('   3. Verify VITE_FIREBASE_DATABASE_URL is set in Vercel environment variables');
      console.error('   4. Check Vercel build logs to confirm env var is being injected');
      console.error('');
      console.error('   Attempting getDatabase() anyway (will likely fail)...');
    }
    
    // Get database instance - Firebase uses databaseURL from app config
    const db = getDatabase(app);
    
    // Verify database instance
    if (db) {
      console.log('✅ RTDB instance created successfully');
      if (app.options?.databaseURL) {
        console.log('✅ Database URL confirmed in app options:', app.options.databaseURL);
      } else {
        console.warn('⚠️ WARNING: Database URL not in app options, but instance was created');
        console.warn('   This is unusual - RTDB may not work properly');
      }
      return db;
    }
    
    return null;
  } catch (error) {
    console.error('❌ RTDB initialization failed:', error.message);
    console.error('Error details:', {
      name: error.name,
      code: error.code,
      message: error.message
    });
    
    // More specific troubleshooting
    if (error.message.includes('Service database is not available')) {
      console.error('🔍 DIAGNOSIS: Firebase cannot find the Realtime Database service');
      console.error('   Possible causes:');
      console.error('   1. Realtime Database API not enabled in Google Cloud Console');
      console.error('   2. App was initialized before databaseURL was added (cache issue)');
      console.error('   3. databaseURL mismatch between config and Firebase Console');
      console.error('');
      console.error('   SOLUTIONS:');
      console.error('   A. Enable Realtime Database API:');
      console.error('      https://console.cloud.google.com/apis/library/firebasedatabase.googleapis.com?project=seshnx-db');
      console.error('   B. Clear browser cache and hard refresh (Ctrl+Shift+R)');
      console.error('   C. Verify databaseURL in Firebase Console matches:', dbURL);
    }
    
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
