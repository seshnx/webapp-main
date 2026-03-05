# Recent Fixes

## 2025-03-05: PostgreSQL Array Literal Error Fix

### Problem
Error: `NeonDbError: malformed array literal: "[]"`
Location: `createPost` function in `neonQueries.ts:909`

### Root Cause
The `createPost` and `updatePost` functions were using `JSON.stringify()` to convert JavaScript arrays before passing them to PostgreSQL. However, the database columns (`media_urls`, `hashtags`, `mentions`) are defined as `TEXT[]` (PostgreSQL array type), not JSONB.

When `JSON.stringify([])` produces the string `"[]"`, PostgreSQL cannot parse it as an array literal for `TEXT[]` columns.

### Solution
Pass JavaScript arrays directly to the Neon driver, which automatically converts them to PostgreSQL arrays:

**Before:**
```typescript
const result = await executeQuery<Post>(
  `INSERT INTO posts (user_id, text, media_urls) VALUES ($1, $2, $3) RETURNING *`,
  [user_id, text, JSON.stringify(media_urls)],  // ❌ Wrong for TEXT[]
  'createPost'
);
```

**After:**
```typescript
const result = await executeQuery<Post>(
  `INSERT INTO posts (user_id, text, media_urls) VALUES ($1, $2, $3) RETURNING *`,
  [user_id, text, media_urls],  // ✅ Correct - Neon handles conversion
  'createPost'
);
```

### Changes Made
1. **createPost** (line 911): Removed `JSON.stringify()` for `media_urls`
2. **updatePost** (lines 931-933): Extended to handle all PostgreSQL array columns (`media_urls`, `hashtags`, `mentions`) without `JSON.stringify()`

### Files Modified
- `src/config/neonQueries.ts`

### Note
- `JSON.stringify()` is still used correctly for JSONB columns (like `location`, `metadata`)
- Only PostgreSQL array columns (`TEXT[]`, `INTEGER[]`, etc.) should pass arrays directly
- The Neon driver automatically handles JavaScript array → PostgreSQL array conversion
