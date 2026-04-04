

## Dashboard Stats Cards — New Card Ideas

### Current 6 Cards
Total Sales, Total Orders, Total Products, Total Customers, Total Refunds, Total Refunded

### Suggested New Cards (pick any combination)

| Card | Value | Why Useful |
|------|-------|------------|
| **Average Order Value (AOV)** | `totalSales / totalOrders` | Key e-commerce KPI — shows how much each customer spends per order |
| **Pending Orders** | Already in `stats.pendingOrders` | Quick visibility into orders needing action |
| **Low Stock Products** | Already in `stats.lowStockProducts` | Alert for inventory that needs restocking |
| **Conversion Rate** | `orders / visitors` (needs tracking) | Shows how effectively visitors become buyers |
| **Active Coupons** | Count from `coupons` table | Shows running promotions at a glance |
| **Open Tickets** | Count from `support_tickets` where status = open | Customer support workload visibility |
| **Abandoned Carts** | Count from `abandoned_carts` | Lost revenue awareness |
| **Today's Sales** | Orders from today only | Real-time daily performance |

### Recommendation
Add these 3 most impactful cards (no new DB queries needed — data already exists):
1. **Average Order Value** — calculated from existing `totalSales / totalOrders`
2. **Pending Orders** — `stats.pendingOrders` already fetched
3. **Low Stock Products** — `stats.lowStockProducts` already fetched

This brings the total to **9 cards** (3 rows of 3 on desktop). All three use data already available in `useDashboardData.ts` — zero additional DB queries.

### Implementation
- **File to modify:** `src/pages/Index.tsx` — add 3 new entries to `statsData` array
- **Grid update:** Change `xl:grid-cols-6` to a responsive layout that fits 9 cards (e.g., `xl:grid-cols-3` with 3 rows, or keep flexible with `grid-cols-2 md:grid-cols-3`)

### Alternative: If you want all 8 new cards
Would require adding queries for `coupons`, `support_tickets`, and `abandoned_carts` counts in `useDashboardData.ts`. Happy to include those too.

