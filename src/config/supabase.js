/**
 * Supabase Stub - Migration Status
 *
 * ⚠️  MIGRATION STATUS: API ROUTES COMPLETE ⚠️
 *
 * Migration Progress:
 * - ✅ API Routes: Fully migrated to Clerk + Neon (9 files)
 * - ✅ Authentication: Migrated to Clerk
 * - ✅ Database: Neon PostgreSQL with comprehensive query library
 * - ✅ Real-time: Convex for chat, presence, and real-time features
 * - ⚠️  Components: Some frontend components still reference Supabase (pending migration)
 *
 * This stub prevents crashes in components that haven't been migrated yet.
 * It logs warnings in development to help identify remaining work.
 *
 * TODO: Migrate remaining components to use Neon API routes or direct Neon queries
 * TODO: Remove this file once all components are fully migrated
 */

const SUPABASE_STUB_WARNING = `
⚠️  SUPABASE STUB - MIGRATION IN PROGRESS ⚠️
This component is using Supabase, but the backend has migrated to:
- Authentication: Clerk
- Database: Neon PostgreSQL
- Real-time: Convex

API routes are fully migrated. This component needs frontend updates.
Contact development team to prioritize this migration.
`;

class SupabaseStub {
    constructor() {
        this.auth = {
            getSession: () => Promise.resolve({ data: { session: null }, error: null }),
            signInWithPassword: () => Promise.reject(new Error('Authentication migrated to Clerk. Use Clerk hooks instead.')),
            signOut: () => Promise.resolve({ error: null }),
            getUser: () => Promise.resolve({ data: { user: null }, error: { message: 'Use Clerk useUser() hook' } })
        };
    }

    from(table) {
        if (import.meta.env.DEV) {
            console.warn(SUPABASE_STUB_WARNING, `Table: ${table}`);
            console.trace('Stack trace for debugging:');
        }
        return this;
    }

    select(columns = '*') {
        return this;
    }

    insert(data) {
        if (import.meta.env.DEV) {
            console.warn(SUPABASE_STUB_WARNING, 'Insert called:', data);
            console.trace('Stack trace for debugging:');
        }
        return Promise.resolve({ data: null, error: { message: 'Supabase stub - please migrate to Neon API' } });
    }

    update(updates) {
        if (import.meta.env.DEV) {
            console.warn(SUPABASE_STUB_WARNING, 'Update called:', updates);
            console.trace('Stack trace for debugging:');
        }
        return Promise.resolve({ data: null, error: { message: 'Supabase stub - please migrate to Neon API' } });
    }

    delete() {
        if (import.meta.env.DEV) {
            console.warn(SUPABASE_STUB_WARNING, 'Delete called');
            console.trace('Stack trace for debugging:');
        }
        return Promise.resolve({ data: null, error: { message: 'Supabase stub - please migrate to Neon API' } });
    }

    eq(column, value) {
        return this;
    }

    or(filter) {
        return this;
    }

    order(column, options = {}) {
        return this;
    }

    limit(count) {
        return this;
    }

    single() {
        return Promise.resolve({ data: null, error: { message: 'Supabase stub - please migrate to Neon API' } });
    }

    async then(callback) {
        const result = await this.single();
        callback(result);
        return this;
    }
}

class ChannelStub {
    on(event, config, callback) {
        if (import.meta.env.DEV) {
            console.warn(SUPABASE_STUB_WARNING, 'Real-time subscription ignored (use Convex instead)');
            console.trace('Stack trace for debugging:');
        }
        return this;
    }

    subscribe() {
        return {
            unsubscribe: () => {}
        };
    }
}

// Export stub instance
export const supabase = {
    from: (table) => new SupabaseStub().from(table),
    channel: (name) => new ChannelStub()
};

export const isSupabaseAvailable = () => false;

export default supabase;
