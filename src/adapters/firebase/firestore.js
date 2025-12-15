import { supabase } from '../../config/supabase';

// A lightweight Firestore-compat layer backed by a Supabase table.
//
// Required Supabase table (public): documents
// Columns:
// - collection_path text not null
// - id text not null
// - data jsonb not null default '{}'::jsonb
// - created_at timestamptz not null default now()
// - updated_at timestamptz not null default now()
// Primary key: (collection_path, id)
// Enable Realtime replication for the table if you want onSnapshot to be live.

const DOCUMENTS_TABLE = 'documents';

const SERVER_TIMESTAMP = Symbol('serverTimestamp');
const DELETE_FIELD = Symbol('deleteField');

export class Timestamp {
  constructor(date) {
    this._date = date instanceof Date ? date : new Date(date);
  }
  static now() {
    return new Timestamp(new Date());
  }
  static fromMillis(ms) {
    return new Timestamp(new Date(ms));
  }
  toMillis() {
    return this._date.getTime();
  }
  toDate() {
    return new Date(this._date);
  }
}

function ensureSupabase() {
  if (!supabase) {
    throw new Error('Supabase is not configured (missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).');
  }
}

function joinPathParts(parts) {
  return parts
    .flat()
    .filter((p) => p !== undefined && p !== null && String(p).length > 0)
    .map((p) => String(p))
    .join('/');
}

function splitDocPath(docPath) {
  const parts = String(docPath).split('/').filter(Boolean);
  if (parts.length < 2) {
    throw new Error(`Invalid document path: ${docPath}`);
  }
  const id = parts.pop();
  const collection_path = parts.join('/');
  return { collection_path, id };
}

function shallowMerge(base = {}, patch = {}) {
  return { ...base, ...patch };
}

function setByDottedPath(obj, dottedPath, value) {
  const parts = String(dottedPath).split('.').filter(Boolean);
  if (parts.length === 0) return obj;
  const out = Array.isArray(obj) ? [...obj] : { ...(obj || {}) };
  let cur = out;
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i];
    const next = cur[k];
    cur[k] = next && typeof next === 'object' ? (Array.isArray(next) ? [...next] : { ...next }) : {};
    cur = cur[k];
  }
  cur[parts[parts.length - 1]] = value;
  return out;
}

function deleteByDottedPath(obj, dottedPath) {
  const parts = String(dottedPath).split('.').filter(Boolean);
  if (parts.length === 0) return obj;
  const out = Array.isArray(obj) ? [...obj] : { ...(obj || {}) };
  let cur = out;
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i];
    if (!cur[k] || typeof cur[k] !== 'object') return out;
    cur[k] = Array.isArray(cur[k]) ? [...cur[k]] : { ...cur[k] };
    cur = cur[k];
  }
  delete cur[parts[parts.length - 1]];
  return out;
}

export function serverTimestamp() {
  return SERVER_TIMESTAMP;
}

export function deleteField() {
  return DELETE_FIELD;
}

export function increment(n = 1) {
  return { __op: 'increment', n };
}

export function arrayUnion(...values) {
  return { __op: 'arrayUnion', values };
}

export function arrayRemove(...values) {
  return { __op: 'arrayRemove', values };
}

export function doc(_dbOrCollection, ...pathParts) {
  // Supports:
  // - doc(db, 'a', 'b', 'c') (segments)
  // - doc(db, 'a/b/c') (single string)
  // - doc(collectionRef, 'id')
  if (_dbOrCollection && _dbOrCollection.__type === 'collection') {
    const id = String(pathParts[0]);
    return { __type: 'doc', collection_path: _dbOrCollection.collection_path, id };
  }

  const rawPath = pathParts.length === 1 ? String(pathParts[0]) : joinPathParts(pathParts);
  const { collection_path, id } = splitDocPath(rawPath);
  return { __type: 'doc', collection_path, id };
}

export function collection(_db, ...pathParts) {
  const collection_path = pathParts.length === 1 ? String(pathParts[0]) : joinPathParts(pathParts);
  return { __type: 'collection', collection_path };
}

export function collectionGroup(_db, groupId) {
  const gid = String(groupId).split('/').filter(Boolean).pop();
  return { __type: 'collectionGroup', groupId: gid };
}

export function where(field, op, value) {
  return { __type: 'where', field, op, value };
}

export function orderBy(field, direction = 'asc') {
  return { __type: 'orderBy', field, direction };
}

export function limit(n) {
  return { __type: 'limit', n };
}

export function query(ref, ...constraints) {
  return { __type: 'query', ref, constraints };
}

function toDocRefParentMeta(collection_path, id) {
  const parts = String(collection_path).split('/').filter(Boolean);
  const collectionId = parts[parts.length - 1] || '';
  const parentDocId = parts[parts.length - 2] || '';

  return {
    id,
    parent: {
      id: collectionId,
      parent: {
        id: parentDocId,
      },
    },
  };
}

function makeDocSnap(row) {
  const exists = !!row;
  const dataObj = row?.data ?? null;
  const id = row?.id ?? undefined;
  const collection_path = row?.collection_path ?? undefined;

  return {
    id,
    ref: exists ? toDocRefParentMeta(collection_path, id) : undefined,
    exists: () => exists,
    data: () => (exists ? dataObj : undefined),
  };
}

function makeQuerySnap(rows) {
  const docs = (rows || []).map((r) => ({
    id: r.id,
    ref: toDocRefParentMeta(r.collection_path, r.id),
    data: () => r.data,
  }));

  return {
    docs,
    empty: docs.length === 0,
    size: docs.length,
    forEach: (fn) => docs.forEach(fn),
  };
}

function applyFieldOps(existing, updates) {
  let out = existing && typeof existing === 'object' ? { ...existing } : {};

  for (const [k, v] of Object.entries(updates || {})) {
    if (v === DELETE_FIELD) {
      out = deleteByDottedPath(out, k);
      continue;
    }
    if (v === SERVER_TIMESTAMP) {
      out = setByDottedPath(out, k, new Date().toISOString());
      continue;
    }
    if (v && typeof v === 'object' && v.__op === 'increment') {
      const current = k.split('.').reduce((acc, part) => (acc && typeof acc === 'object' ? acc[part] : undefined), out);
      const nextVal = (Number(current) || 0) + Number(v.n || 0);
      out = setByDottedPath(out, k, nextVal);
      continue;
    }
    if (v && typeof v === 'object' && v.__op === 'arrayUnion') {
      const current = k.split('.').reduce((acc, part) => (acc && typeof acc === 'object' ? acc[part] : undefined), out);
      const curArr = Array.isArray(current) ? current : [];
      const merged = [...curArr];
      for (const item of v.values || []) {
        if (!merged.some((x) => JSON.stringify(x) === JSON.stringify(item))) {
          merged.push(item);
        }
      }
      out = setByDottedPath(out, k, merged);
      continue;
    }
    if (v && typeof v === 'object' && v.__op === 'arrayRemove') {
      const current = k.split('.').reduce((acc, part) => (acc && typeof acc === 'object' ? acc[part] : undefined), out);
      const curArr = Array.isArray(current) ? current : [];
      const filtered = curArr.filter((x) => !(v.values || []).some((y) => JSON.stringify(x) === JSON.stringify(y)));
      out = setByDottedPath(out, k, filtered);
      continue;
    }

    out = setByDottedPath(out, k, v);
  }

  return out;
}

export async function getDoc(docRef) {
  ensureSupabase();
  const { data, error } = await supabase
    .from(DOCUMENTS_TABLE)
    .select('collection_path,id,data')
    .eq('collection_path', docRef.collection_path)
    .eq('id', docRef.id)
    .maybeSingle();

  if (error) throw error;
  return makeDocSnap(data || null);
}

export async function setDoc(docRef, data, options = {}) {
  ensureSupabase();
  const merge = !!options.merge;

  let finalData = data;
  if (merge) {
    const existing = await getDoc(docRef);
    finalData = shallowMerge(existing.exists() ? existing.data() : {}, data || {});
  }

  const { error } = await supabase
    .from(DOCUMENTS_TABLE)
    .upsert(
      {
        collection_path: docRef.collection_path,
        id: docRef.id,
        data: finalData || {},
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'collection_path,id' }
    );

  if (error) throw error;
}

export async function updateDoc(docRef, updates) {
  ensureSupabase();
  const existing = await getDoc(docRef);
  if (!existing.exists()) {
    throw new Error(`Document does not exist: ${docRef.collection_path}/${docRef.id}`);
  }

  const nextData = applyFieldOps(existing.data(), updates);
  await setDoc(docRef, nextData, { merge: false });
}

function randomId() {
  // Good-enough ID for client-side doc creation.
  return (globalThis.crypto?.randomUUID?.() || `id_${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`);
}

export async function addDoc(collectionRef, data) {
  ensureSupabase();
  const id = randomId();
  const docRef = { __type: 'doc', collection_path: collectionRef.collection_path, id };

  const finalData = applyFieldOps(data || {}, {});

  const { error } = await supabase
    .from(DOCUMENTS_TABLE)
    .insert({
      collection_path: docRef.collection_path,
      id: docRef.id,
      data: finalData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

  if (error) throw error;
  return { id: docRef.id, ...docRef };
}

export async function deleteDoc(docRef) {
  ensureSupabase();
  const { error } = await supabase
    .from(DOCUMENTS_TABLE)
    .delete()
    .eq('collection_path', docRef.collection_path)
    .eq('id', docRef.id);
  if (error) throw error;
}

function applyClientSideConstraints(rows, constraints) {
  let out = [...(rows || [])];

  const wheres = constraints.filter((c) => c?.__type === 'where');
  const order = constraints.find((c) => c?.__type === 'orderBy');
  const lim = constraints.find((c) => c?.__type === 'limit');

  for (const w of wheres) {
    const { field, op, value } = w;
    if (op !== '==' && op !== '!=') {
      // Minimal compatibility: support == and != only.
      continue;
    }
    out = out.filter((r) => {
      const v = r?.data ? r.data[field] : undefined;
      if (op === '==') return v === value;
      if (op === '!=') return v !== value;
      return true;
    });
  }

  if (order) {
    const dir = order.direction === 'desc' ? -1 : 1;
    const field = order.field;
    out.sort((a, b) => {
      const av = a?.data?.[field];
      const bv = b?.data?.[field];
      if (av === bv) return 0;
      if (av === undefined) return 1;
      if (bv === undefined) return -1;
      return av > bv ? dir : -dir;
    });
  }

  if (lim) {
    out = out.slice(0, Math.max(0, Number(lim.n) || 0));
  }

  return out;
}

export async function getDocs(q) {
  ensureSupabase();

  const isQuery = q && q.__type === 'query';
  const ref = isQuery ? q.ref : q;
  const constraints = isQuery ? q.constraints || [] : [];

  let queryBuilder = supabase.from(DOCUMENTS_TABLE).select('collection_path,id,data');

  if (ref.__type === 'collection') {
    queryBuilder = queryBuilder.eq('collection_path', ref.collection_path);
  } else if (ref.__type === 'collectionGroup') {
    queryBuilder = queryBuilder.like('collection_path', `%/${ref.groupId}`);
  } else {
    throw new Error('getDocs expected a collection, collectionGroup, or query');
  }

  // Fetch enough rows, then apply constraints client-side.
  const { data, error } = await queryBuilder.limit(1000);
  if (error) throw error;

  const filtered = applyClientSideConstraints(data || [], constraints);
  return makeQuerySnap(filtered);
}

export async function getCountFromServer(q) {
  const snap = await getDocs(q);
  return {
    data: () => ({ count: snap.size }),
  };
}

export function writeBatch(_db) {
  const ops = [];
  return {
    set: (docRef, data, options) => ops.push({ type: 'set', docRef, data, options }),
    update: (docRef, data) => ops.push({ type: 'update', docRef, data }),
    delete: (docRef) => ops.push({ type: 'delete', docRef }),
    commit: async () => {
      for (const op of ops) {
        if (op.type === 'set') await setDoc(op.docRef, op.data, op.options);
        if (op.type === 'update') await updateDoc(op.docRef, op.data);
        if (op.type === 'delete') await deleteDoc(op.docRef);
      }
    },
  };
}

export function onSnapshot(refOrQuery, onNext, onError) {
  // Minimal realtime: subscribe to table changes and refetch.
  // Falls back to a short poll if realtime isn't available.
  try {
    ensureSupabase();
  } catch (e) {
    onError?.(e);
    return () => {};
  }

  let cancelled = false;

  const doFetch = async () => {
    try {
      const isDoc = refOrQuery?.__type === 'doc';
      if (isDoc) {
        const snap = await getDoc(refOrQuery);
        if (!cancelled) onNext?.(snap);
      } else {
        const snap = await getDocs(refOrQuery);
        if (!cancelled) onNext?.(snap);
      }
    } catch (e) {
      if (!cancelled) onError?.(e);
    }
  };

  // Initial
  doFetch();

  // Try realtime channel
  let channel = null;
  try {
    // Subscribe broadly; refetch on change.
    channel = supabase
      .channel(`documents-watch:${Math.random().toString(16).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: DOCUMENTS_TABLE }, () => doFetch())
      .subscribe();

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  } catch (e) {
    // Poll fallback
    const interval = setInterval(doFetch, 4000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }
}
