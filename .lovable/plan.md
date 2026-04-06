
## Edge Function 401 Error — Review Result

### আমি যা confirm করেছি
- তোমার log-এ valid authenticated JWT দেখা যাচ্ছে: `auth_user` আছে, `role=authenticated` আছে।
- মানে request backend-এ authenticated হিসেবেই পৌঁছাচ্ছে।
- `src/hooks/useBackupData.ts` থেকে `database-backup` function-এ manual `fetch()` দিয়ে call করা হচ্ছে।
- `supabase/functions/database-backup/index.ts`-এ function-এর ভিতরে আবার:
  1. `Authorization` header নেয়
  2. anon client বানায়
  3. `supabaseUser.auth.getUser()` call করে
  4. fail হলে `401` return করে
- একই auth pattern আছে:
  - `supabase/functions/database-restore/index.ts`
  - `supabase/functions/delete-user-account/index.ts`
- `supabase/config.toml` এখনো old project ref (`rxuiclgaixjunpisvhjr`) দেখাচ্ছে।

### সবচেয়ে likely root cause
#### 1. Edge function auth validation pattern পুরোনো / brittle
`auth.getUser()` edge function-এর ভিতরে অনেক সময় fail করে, বিশেষ করে যখন project নিজের backend-এ migrate করা হয়।  
তোমার log এইটাই support করে: JWT valid, তবুও function 401 দিচ্ছে।

#### 2. New backend-এ old backend setup পুরো copy হয়নি
`database-backup` কাজ করতে এগুলো লাগবে:
- `user_roles`
- `database_backups`
- `has_admin_role()`
- `get_table_columns()`
- `database-backups` storage bucket
- তোমার user-এর admin/manager role row

#### 3. অনেক function-এ secret dependency আছে
নিজের backend-এ নতুন করে secrets set না করলে email / courier / payment function-গুলাও fail করবে।

#### 4. Repo config আর deployed backend fully aligned না
`supabase/config.toml` old project-এ pointing করছে, তাই future deploy/debug-এ mismatch হওয়ার chance আছে।

### কেন এটা auth-check issue বলছি
- request gateway-level এ authenticated হয়েছে
- missing secret হলে `database-backup` code অনুযায়ী `500` আসার কথা
- role problem হলে `403` আসার কথা
- কিন্তু তুমি `401` পাচ্ছো
- তাই strongest suspect: function-এর ভিতরের `getUser()` validation step

## Solution Plan

### Step 1 — Edge function auth fix
এই 3টা file আগে update করতে হবে:
- `supabase/functions/database-backup/index.ts`
- `supabase/functions/database-restore/index.ts`
- `supabase/functions/delete-user-account/index.ts`

`auth.getUser()` বাদ দিয়ে token-based validation use করতে হবে:

```ts
const authHeader = req.headers.get('Authorization')
if (!authHeader?.startsWith('Bearer ')) {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
}

const token = authHeader.replace('Bearer ', '')

const authClient = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_ANON_KEY')!,
  { global: { headers: { Authorization: authHeader } } }
)

const { data, error } = await authClient.auth.getClaims(token)
if (error || !data?.claims?.sub) {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
}

const userId = data.claims.sub
```

তারপর DB/storage/admin কাজের জন্য service-role client use থাকবে।

### Step 2 — Frontend function calls harden করা
`useBackupData.ts`-এ manual `fetch()` আছে। এটা safer করতে হবে:
- possible হলে `supabase.functions.invoke('database-backup')` use করা
- না হলে call করার আগে `session?.access_token` check করা
- `Bearer undefined` type request prevent করা

এটাই `AccountDeletionRequests.tsx`-এর manual function call-এর ক্ষেত্রেও apply হবে।

### Step 3 — New backend prerequisites verify করা
তোমার own backend-এ confirm করতে হবে:
- table: `user_roles`
- table: `database_backups`
- function: `has_admin_role`
- function: `get_table_columns`
- bucket: `database-backups`
- তোমার user row: `admin` বা `manager`

### Step 4 — Secrets verify করা
Own backend-এ অন্তত এগুলো থাকতে হবে:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

আর extra function-এর জন্য:
- email provider key
- payment keys
- courier keys

### Step 5 — Project linkage cleanup
`supabase/config.toml` old project ref থেকে তোমার own project-এর সাথে align করতে হবে, না হলে later deploy/debug issue করবে।

## আমি কী update করতাম
1. Edge functions-এ `getUser()` → `getClaims()` auth migration
2. Manual raw fetch → standardized function invoke / token guard
3. 401 / 403 / 500 error messages আলাদা ও clear করা
4. Missing table / missing RPC / missing bucket / missing role detect করে proper error return

## Technical Details
Directly involved files:
- `src/hooks/useBackupData.ts`
- `src/pages/admin/AccountDeletionRequests.tsx`
- `supabase/functions/database-backup/index.ts`
- `supabase/functions/database-restore/index.ts`
- `supabase/functions/delete-user-account/index.ts`
- `supabase/config.toml`

## Expected outcome after fix
- valid logged-in admin user হলে 401 বন্ধ হবে
- admin role missing থাকলে clean 403 পাবে
- backend object missing থাকলে exact missing dependency ধরা যাবে
- অন্য edge function fail করলে secret/config missing issue আলাদা করে isolate করা সহজ হবে
