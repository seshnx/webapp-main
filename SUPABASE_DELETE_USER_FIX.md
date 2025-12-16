# Fixing User Deletion Foreign Key Constraint Error

## Problem

When trying to delete a user, you get this error:
```
ERROR: update or delete on table "users" violates foreign key constraint "profiles_id_fkey" on table "profiles"
```

This happens because the `profiles` table has a foreign key constraint that references `auth.users.id`, and Supabase won't let you delete a user if there are still records in `profiles` (or other tables) that reference that user.

## Solution Options

### Option 1: Update Foreign Key Constraint (Recommended)

Run this SQL in your Supabase SQL Editor to add CASCADE deletion:

```sql
-- Drop the existing foreign key constraint
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Recreate it with ON DELETE CASCADE
ALTER TABLE profiles
ADD CONSTRAINT profiles_id_fkey
FOREIGN KEY (id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Do the same for other tables that reference users
ALTER TABLE wallets
DROP CONSTRAINT IF EXISTS wallets_user_id_fkey;

ALTER TABLE wallets
ADD CONSTRAINT wallets_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Repeat for other tables as needed:
-- notifications, saved_posts, followers, following, posts, comments, etc.
```

### Option 2: Delete Related Records First (Current Implementation)

The code now deletes all related records before attempting to delete the user. This is handled in `SettingsTab.jsx` in the `handleDeleteAccount` function.

### Option 3: Create a Database Function

Create a function that handles cascading deletes:

```sql
CREATE OR REPLACE FUNCTION delete_user_cascade(user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete all related records
  DELETE FROM profiles WHERE id = user_id;
  DELETE FROM wallets WHERE user_id = user_id;
  DELETE FROM notifications WHERE user_id = user_id;
  DELETE FROM saved_posts WHERE user_id = user_id;
  DELETE FROM followers WHERE follower_id = user_id OR following_id = user_id;
  DELETE FROM following WHERE user_id = user_id OR target_id = user_id;
  DELETE FROM posts WHERE user_id = user_id;
  DELETE FROM comments WHERE user_id = user_id;
  DELETE FROM bookings WHERE sender_id = user_id OR target_id = user_id;
  DELETE FROM marketplace_items WHERE seller_id = user_id;
  DELETE FROM distribution_releases WHERE uploader_id = user_id;
  DELETE FROM equipment_submissions WHERE submitted_by = user_id;
  DELETE FROM safe_exchange_transactions WHERE buyer_id = user_id OR seller_id = user_id;
  DELETE FROM shipping_transactions WHERE buyer_id = user_id OR seller_id = user_id;
  
  -- Delete the auth user (requires admin privileges)
  -- This would need to be called from a backend API with service_role key
END;
$$;
```

### Option 4: Use Supabase Admin API (Backend Required)

Create a backend endpoint that uses the `service_role` key to delete users:

```javascript
// Backend API endpoint (Node.js example)
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service_role, not anon key
);

async function deleteUser(userId) {
  // Delete related records first
  await supabaseAdmin.from('profiles').delete().eq('id', userId);
  await supabaseAdmin.from('wallets').delete().eq('user_id', userId);
  // ... delete other related records
  
  // Then delete the auth user
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (error) throw error;
}
```

## Recommended Approach

**Use Option 1** (CASCADE deletion) as it's the cleanest and most database-native solution. It ensures that when a user is deleted, all related records are automatically deleted, preventing orphaned data and foreign key constraint violations.

## Testing

After implementing the fix:

1. Create a test user account
2. Add some data (profile, posts, etc.)
3. Try deleting the account
4. Verify all related records are deleted
5. Verify the user is removed from `auth.users`

## Notes

- The `service_role` key should **NEVER** be used in client-side code
- Always use a backend API endpoint for user deletion if you need admin privileges
- CASCADE deletion is the safest approach as it's handled at the database level

