// Minimal firebase/app shim.
// This project no longer uses Firebase client SDK.

export function initializeApp(config) {
  return { __type: 'firebase-app-shim', config };
}

export const getApp = () => ({ __type: 'firebase-app-shim' });
