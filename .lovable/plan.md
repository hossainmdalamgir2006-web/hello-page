

## Edge Function Health Check — Error Fix

### সমস্যা

Network logs থেকে দেখা যাচ্ছে সব `OPTIONS` request "Failed to fetch" error দিচ্ছে। কারণ:
- Browser থেকে custom headers (`apikey`, `Authorization`) সহ `OPTIONS` request পাঠালে CORS preflight fail করে
- Supabase edge functions browser-initiated OPTIONS requests properly handle করে না cross-origin থেকে

### সমাধান

`fetch()` + `OPTIONS` method বাদ দিয়ে `supabase.functions.invoke()` ব্যবহার করব। এটা internally CORS handle করে। যেকোনো response (400, 500 সহ) মানে function deployed ও online — শুধু network failure/timeout মানে offline।

### পরিবর্তন

**File: `src/pages/admin/EdgeFunctionHealth.tsx`** — `checkFunction` method update:

```ts
const checkFunction = async (name: string) => {
  const start = Date.now();
  try {
    const { data, error } = await supabase.functions.invoke(name, {
      body: { action: "health_check" },
    });
    const responseTime = Date.now() - start;
    
    // Any response (even error) = function is deployed & reachable
    return { status: "ok", responseTime, error: undefined };
  } catch (err) {
    const responseTime = Date.now() - start;
    if (responseTime >= 7500) {
      return { status: "timeout", responseTime, error: "Timeout (>8s)" };
    }
    return { status: "error", responseTime, error: "Failed to reach" };
  }
};
```

Key point: `supabase.functions.invoke()` returns `{ error }` for 400/500 responses but does NOT throw — so if we reach the `catch`, it's a real network failure. The `error` object from invoke just means the function returned a non-2xx status, which still confirms it's online.

### Technical Details
- 1 file modified: `src/pages/admin/EdgeFunctionHealth.tsx`
- `AbortController` timeout removed (SDK handles timeout)
- No DB changes

