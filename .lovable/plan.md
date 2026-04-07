

## Fix: SQL Schema Export Broken

### Problem
Edge function `database-schema-export` returns `{ sql, success }` but the frontend (`useBackupData.ts`) expects:
- `data.schema` (instead of `data.sql`)
- `data.stats.tables`, `data.stats.policies`, `data.stats.indexes`, `data.stats.functions`

This causes the "Cannot read properties of undefined (reading 'tables')" error.

### Solution
Update the edge function to return the expected shape:

**File: `supabase/functions/database-schema-export/index.ts`**
- Change response from `{ sql, success }` to `{ schema: sql, stats: { tables, policies, indexes, functions }, success: true }`
- Count tables, policies, indexes, functions from the fetched data and include in `stats`

### Changes
- 1 file modified: `supabase/functions/database-schema-export/index.ts`
- Add stats counting logic before the response
- Change `sql` key to `schema` in the response JSON

