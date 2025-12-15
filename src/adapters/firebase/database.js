// Firebase Realtime Database shim.
// Chat has been migrated to Convex.

function notAvailable() {
  throw new Error('firebase/database is not available. Chat uses Convex; remove RTDB usage.');
}

export const ref = notAvailable;
export const onValue = notAvailable;
export const query = notAvailable;
export const orderByChild = notAvailable;
export const limitToLast = notAvailable;
export const push = notAvailable;
export const update = notAvailable;
export const set = notAvailable;
export const remove = notAvailable;
export const serverTimestamp = notAvailable;
