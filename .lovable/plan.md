

# Paperfly API Integration Fix

## Problem
Current implementation uses wrong authentication (`X-Auth-Token` header) and wrong base URL. Paperfly actually requires **Basic Auth** (username/password) + **paperflykey** custom header, with base URL `https://api.paperfly.com.bd`.

## Changes

### 1. Settings Page (`src/components/settings/PaperflySettings.tsx`)
- Replace single "API Token" field with 3 fields: **Username**, **Password**, **Paperfly Key**
- Store as `PAPERFLY_USERNAME`, `PAPERFLY_PASSWORD`, `PAPERFLY_KEY` in store_settings
- Remove environment selector (Paperfly has single production API)
- Update "How to get credentials" instructions
- Update `isConfigured` check to require all 3 fields

### 2. Edge Function (`supabase/functions/paperfly-courier/index.ts`)
- Fetch `PAPERFLY_USERNAME`, `PAPERFLY_PASSWORD`, `PAPERFLY_KEY` from DB
- Use `Authorization: Basic base64(username:password)` header
- Add `paperflykey: <key>` custom header
- Change base URL to `https://api.paperfly.com.bd`
- Update API endpoint paths to match Paperfly's actual API structure (e.g., `/merchant/api/service/...`)

### 3. Hook (`src/hooks/usePaperflyCourier.ts`)
- No changes needed (it just calls the edge function)

## Technical Detail
```
Headers for every Paperfly API call:
  Authorization: Basic btoa("username:password")
  paperflykey: Paperfly_~La?Rj73FcLm  (example)
  Content-Type: application/json

Base URL: https://api.paperfly.com.bd
```

