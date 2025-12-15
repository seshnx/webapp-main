import { supabase } from '../../config/supabase';

function ensureSupabase() {
  if (!supabase) {
    throw new Error('Supabase is not configured (missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).');
  }
}

export function getAuth() {
  return auth;
}

export function onAuthStateChanged(_auth, callback) {
  ensureSupabase();
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    const u = session?.user ? { ...session.user, uid: session.user.id } : null;
    callback(u);
  });
  return () => data.subscription.unsubscribe();
}

export class GoogleAuthProvider {
  constructor() {
    this.providerId = 'google';
    this.params = {};
  }
  setCustomParameters(params) {
    this.params = { ...this.params, ...(params || {}) };
  }
}

export const EmailAuthProvider = {
  credential: (email, password) => ({ email, password }),
};

export async function reauthenticateWithCredential(_user, credential) {
  ensureSupabase();
  // Supabase doesn't have a dedicated reauth call; we re-sign-in.
  const { error } = await supabase.auth.signInWithPassword({
    email: credential.email,
    password: credential.password,
  });
  if (error) throw error;
}

export async function updateEmail(_user, newEmail) {
  ensureSupabase();
  const { error } = await supabase.auth.updateUser({ email: newEmail });
  if (error) throw error;
}

export async function updatePassword(_user, newPassword) {
  ensureSupabase();
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

export async function deleteUser(_user) {
  // Client-side delete requires admin/service-role key. Keep behavior explicit.
  throw Object.assign(new Error('Account deletion requires a server-side admin endpoint in Supabase.'), {
    code: 'auth/admin-required',
  });
}

export async function signInWithEmailAndPassword(_auth, email, password) {
  ensureSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    // Provide Firebase-ish error codes where possible
    const code = error.message?.toLowerCase().includes('invalid') ? 'auth/wrong-password' : 'auth/unknown';
    throw Object.assign(new Error(error.message), { code });
  }
  return { user: data.user ? { ...data.user, uid: data.user.id } : null };
}

export async function signInWithPopup(_auth, provider) {
  ensureSupabase();
  const prov = provider?.providerId || 'google';
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: prov,
    options: { queryParams: provider?.params || {} },
  });
  if (error) {
    throw Object.assign(new Error(error.message), { code: 'auth/popup' });
  }
  // OAuth redirects; user will be set by onAuthStateChange.
  return { user: data?.user ? { ...data.user, uid: data.user.id } : null };
}

export async function signOut(_auth) {
  ensureSupabase();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Provide a Firebase-like auth object for legacy code that calls auth.onAuthStateChanged
export const auth = {
  onAuthStateChanged: (cb) => onAuthStateChanged(auth, cb),
};
