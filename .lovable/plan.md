## Fix: Pathao Courier Edge Function — নিজের Supabase-এ কাজ করছে না

### সমস্যা

তোমার অন্য সব edge function `Deno.serve()` ব্যবহার করে — যেটা নতুন Supabase Edge Runtime-এ কাজ করে। কিন্তু **pathao-courier** function পুরোনো `serve` import ব্যবহার করছে:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
```

নতুন Supabase Edge Runtime-এ এই পুরোনো import কাজ নাও করতে পারে। এছাড়া CORS headers-এও কিছু header missing আছে যেগুলো অন্য function-এ আছে।

### সমাধান

**File:** `supabase/functions/pathao-courier/index.ts`

1. **পুরোনো `serve` import সরিয়ে `Deno.serve` ব্যবহার করো** — অন্য সব working function-এর মতো
2. **CORS headers update করো** — অন্য function-গুলোতে যে extended headers আছে সেগুলো add করো

### Changes

```text
// BEFORE (line 1):
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// AFTER:
// (remove the import entirely)

// BEFORE (lines 4-7):
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// AFTER:
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// BEFORE (~line 155):
serve(async (req) => {

// AFTER:
Deno.serve(async (req) => {
```

### সারাংশ


| Item         | Before                  | After                                |
| ------------ | ----------------------- | ------------------------------------ |
| Server API   | `serve()` from deno std | `Deno.serve()` (native)              |
| CORS headers | 4 headers               | 8 headers (matching other functions) |


এই change করার পর নিজের Supabase-এ redeploy করলে Pathao function কাজ করবে।...............update koro tumi