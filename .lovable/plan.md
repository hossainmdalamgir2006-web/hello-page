

## Edge Function Error Handling Improvement

### বর্তমান সমস্যা

সব edge function-এ একই pattern:
1. **কোনো retry logic নেই** — external API (Resend, courier APIs, payment gateways) fail করলে সাথে সাথে error return করে
2. **Generic error messages** — catch block-এ শুধু `error.message` return হয়, user-friendly context নেই
3. **Missing secret detection নেই** — function শুরুতে secret check না করে runtime-এ crash করে
4. **Frontend hooks-এ retry নেই** — `supabase.functions.invoke()` fail হলে একবারেই error দেখায়
5. **`error.message` type unsafe** — কিছু function-এ `error: any` type use হচ্ছে

### পরিবর্তন

#### 1. Shared retry utility — Edge Functions
সব edge function-এ inline retry helper add করব (shared file সম্ভব না edge function structure-এ):

```ts
async function fetchWithRetry(url, options, maxRetries = 2) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, options);
      if (res.ok || res.status < 500) return res; // Don't retry 4xx
      if (attempt < maxRetries) await delay(1000 * (attempt + 1));
    } catch (err) {
      if (attempt === maxRetries) throw err;
      await delay(1000 * (attempt + 1));
    }
  }
}
```

#### 2. Edge Functions Update (External API calls সহ — 14 files)

**Courier functions** (4 files):
- `steadfast-courier` — Steadfast API calls-এ retry add
- `redx-courier` — RedX API calls-এ retry add
- `paperfly-courier` — Paperfly API calls-এ retry add
- `pathao-courier` — Pathao token refresh + API calls-এ retry add

**Email functions** (6 files):
- `send-order-confirmation` — Resend/Gmail send-এ retry add
- `send-contact-reply` — Resend/Gmail send-এ retry add
- `send-login-alert` — Resend/Gmail send-এ retry add
- `send-lockout-alert` — Resend/Gmail send-এ retry add
- `send-unlock-alert` — Resend/Gmail send-এ retry add
- `send-abandoned-cart-reminder` — Resend send-এ retry add

**Payment functions** (3 files):
- `payment-gateway-init` — gateway init calls-এ retry add
- `sslcommerz-init` — SSLCommerz API call-এ retry add
- `send-scheduled-report` — email send-এ retry add

**Other** (1 file):
- `process-abandoned-carts` — email send already has some handling, retry add

প্রতিটি function-এ:
- `fetchWithRetry()` helper inline add
- Error response-এ proper error code categories: `CONFIG_ERROR`, `AUTH_ERROR`, `API_ERROR`, `NETWORK_ERROR`
- Missing secret early detection with clear message
- Type-safe error handling (`error instanceof Error`)

#### 3. Frontend Hooks Update (5 files)
- `useSteadfastCourier.ts` — retry wrapper with exponential backoff
- `useRedXCourier.ts` — retry wrapper
- `usePaperflyCourier.ts` — retry wrapper
- `usePathaoCourier.ts` — retry wrapper
- `useBackupData.ts` — already updated, verify retry

Frontend retry pattern:
```ts
const callWithRetry = async (fn, maxRetries = 2) => {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === maxRetries) throw err;
      await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
    }
  }
};
```

Plus user-friendly toast messages with action context.

#### 4. Functions NOT updated (intentionally)
- `auto-clean-trash`, `auto-clean-chat` — internal cron, no external APIs
- `create-demo-users` — one-time setup
- `generate-sitemap` — DB read only
- `migrate-product-images` — internal migration
- `verify-login` — user-facing auth flow, retry could mask issues
- `track-order` — DB query only
- `database-backup`, `database-restore`, `delete-user-account` — already updated
- `payment-gateway-ipn`, `sslcommerz-ipn` — IPN callbacks from gateways, retrying doesn't apply

### Technical Details
- ~14 edge function files updated
- ~4 frontend hook files updated
- No DB changes
- Pattern: inline `fetchWithRetry()` + `delay()` helper per function
- Retry only on 5xx / network errors, NOT on 4xx (client errors)
- Max 2 retries with linear backoff (1s, 2s)

