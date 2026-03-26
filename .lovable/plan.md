

# All-Page Speed Optimization — Sub-1.5s Load Plan

## Critical Issues Found

### A. Admin Dashboard (`useDashboardData.ts`) — SLOWEST PAGE
**12 sequential DB queries** including a loop of 12 monthly sales queries (one per month). Each query waits for the previous one.
- Fix: Replace 12-month loop with **single query** fetching all orders, then group by month in JS
- Convert to React Query with `staleTime: 5min`

### B. Analytics Page (`useAnalyticsData.ts`) — SAME PROBLEM  
Another **12-month loop** + 8+ sequential queries
- Fix: Same approach — single orders query, group in JS

### C. Admin Products (`useProductsData.ts`) — TIMEOUT ERROR
`select('*')` fetches ALL product columns for ALL products — network shows **500 timeout**
- Fix: Select only needed columns, add pagination (limit 50 per page)
- Convert from `useState+useEffect` to React Query

### D. Store Products Page (`StoreProducts.tsx`) — 5 PARALLEL FETCHES
`fetchProducts`, `fetchCategories`, `fetchBrands`, `fetchVariantOptions`, `fetchRatings` — 5 separate calls
- Fix: Categories already cached via `useCategoriesCache`, use it. Batch variant options into product fetch

### E. Customers Page (`useCustomersData.ts`) — FETCHES ALL ORDERS
Pulls **all orders** just to group by customer_id
- Fix: Use Supabase join or aggregate. Convert to React Query

### F. Multiple hooks still `useState+useEffect`
`useDashboardData`, `useProductsData`, `useCustomersData`, `useAnalyticsData`, `useStoreSettings` — no caching, refetch on every mount
- Fix: Migrate to React Query

---

## Implementation Steps

### Step 1: Fix Dashboard — single query for sales chart
**File:** `src/hooks/useDashboardData.ts`
- Replace `fetchSalesData()` 12-iteration loop with single query: `orders.select('total_amount, created_at').gte('created_at', 12MonthsAgo)`
- Group by month in JS
- Run `fetchStats`, `fetchRecentOrders`, `fetchTopProducts`, `fetchSalesData` with `Promise.all` (already done) but fix internal sequential calls in `fetchStats` — batch the 8 queries into 3-4 using `Promise.all`
- Migrate to React Query

### Step 2: Fix Analytics — same pattern
**File:** `src/hooks/useAnalyticsData.ts`
- Replace 12-month revenue loop with single query
- Replace daily sales loop with single query
- Batch parallel-safe queries with `Promise.all`
- Migrate to React Query

### Step 3: Fix Products Admin — select specific columns + pagination
**File:** `src/hooks/useProductsData.ts`
- Change `select('*')` to select only displayed columns
- Add server-side pagination (limit 50)
- Migrate to React Query

### Step 4: Fix Store Products — use shared cache
**File:** `src/pages/store/StoreProducts.tsx`
- Use `useCategoriesCache()` instead of `fetchCategories()`
- Combine `fetchBrands` and `fetchVariantOptions` into product query or batch
- Migrate to React Query

### Step 5: Fix Customers — join instead of 2 queries
**File:** `src/hooks/useCustomersData.ts`
- Use single query with Supabase join: `customers.select('*, orders(created_at, order_number, total_amount, status)')`
- Migrate to React Query

### Step 6: Fix remaining `useState+useEffect` hooks
- `useStoreSettings.ts` (admin settings page) — add React Query

---

## Files to modify
- `src/hooks/useDashboardData.ts` — single-query sales, React Query, batch parallel queries
- `src/hooks/useAnalyticsData.ts` — single-query revenue, React Query
- `src/hooks/useProductsData.ts` — select specific columns, pagination, React Query
- `src/hooks/useCustomersData.ts` — join query, React Query
- `src/pages/store/StoreProducts.tsx` — use shared cache, batch queries

## Expected Results
```text
Dashboard:  12+ sequential queries → 4 parallel queries, cached
Analytics:  12+ sequential queries → 3 parallel queries, cached  
Products:   timeout-causing select(*) → paginated lightweight query
Customers:  2 full-table scans → 1 join query
StoreProducts: 5 queries → 2-3 queries (shared cache)

All pages: <1.5s load, cached on revisit
```

