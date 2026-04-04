

## Reports Page — Current Status & What Needs to Be Done

### Current State: 100% Mock/Placeholder

The entire Reports page (`src/pages/Reports.tsx`) is **non-functional**. Here's what's fake:

| Feature | Status | Problem |
|---------|--------|---------|
| Report List | Hardcoded 5 reports | Static array, no DB |
| Generate Report | Simulated with `setTimeout` | No actual data fetched, no real file created |
| Download button | Shows toast only | No file download |
| Scheduled Reports | Hardcoded 3 schedules | Not persisted, lost on refresh |
| Create Schedule | Local state only | Not saved to DB, no cron/automation |
| Stats cards | Counts from mock array | Not from real data |
| Report Builder dialog | UI only | No actual query or export logic |

### What Can Be Made Functional (Realistic Scope)

#### Phase 1 — Real Report Generation & Download (High Impact)
1. **Sales Report**: Query `orders` table by date range → generate CSV/JSON with real data → download
2. **Inventory Report**: Query `products` table (stock, category) → export
3. **Customer Report**: Query `customers` table (with LTV, orders) → export
4. **Order Report**: Query `orders` + `order_items` → export
5. **Product Report**: Query `products` + `order_items` for performance → export
6. **Financial Report**: Query `orders` for revenue/profit summary → export

Each report will:
- Use real DB queries based on selected date range and filters
- Generate actual CSV files for download (CSV is most reliable in-browser)
- Show real generation status
- Persist generated reports list in `localStorage` (or optionally a new DB table)

#### Phase 2 — Persist Reports History (Optional)
- Create a `generated_reports` table to track report metadata
- Store report files in storage bucket or as downloadable blobs

#### Phase 3 — Scheduled Reports (Requires Email System)
- This needs a working email integration (Resend/SMTP) + a cron mechanism
- Can build the DB structure but actual scheduling won't work without email credentials
- Mark as "Coming Soon" or keep UI but note it's placeholder

### Recommended Approach

**Phase 1 only** — make report generation functional with real DB data and real CSV downloads. This covers:
- Real data queries per report type
- Date range filtering works
- CSV download produces actual files
- Stats cards show real counts from DB
- Report list shows actually generated reports (session-persisted)

### Technical Details

**File to modify**: `src/pages/Reports.tsx`

**Changes**:
- Import `supabase` client
- Add async functions for each report type that query real tables
- Replace `handleGenerateReport` with actual DB queries → CSV blob → download
- Replace `handleDownload` with real file download
- Stats cards: query real counts from DB
- Keep scheduled reports UI but mark as placeholder (needs email system)

**No DB migrations needed** — all data already exists in `orders`, `products`, `customers`, `order_items` tables.

