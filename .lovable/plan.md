## Plan: ৫টি অ্যাডমিন পেজে নতুন ফিচার যোগ

### বর্তমান অবস্থা সংক্ষেপে

- **Audit Log**: Stats cards, filters, search, detail dialog, CSV export, staff summary ✅
- **Integrations**: Steadfast, Pathao, RedX, Paperfly, GA4, GTM, Meta Pixel, Search Console ✅
- **Backup**: JSON/CSV backup, Schema export, Full export, restore, history ✅
- **Reviews**: Approve/reject/delete, bulk actions, search, ratings summary ✅
- **Trash**: 10 entity types, restore, permanent delete, activity log ✅

---

### Part 1: Audit Log Page — 2টি নতুন ফিচার

**A.**    **Critical Actions Alert Section**

- Top-এ একটি card যেটা শেষ ২৪ ঘন্টার critical actions দেখাবে: `delete`, `settings_change`, `permission_change`, failed login spikes
- Red/orange highlighted রো সহ

**B. Compare Old vs New Value Diff View**

- Detail dialog-এ side-by-side JSON diff (key-by-key colored: green=added, red=removed, yellow=changed)
- বর্তমানে শুধু raw JSON দেখায়

---

### Part 2: Integrations Page — ৩টি নতুন ফিচার

**A. Connection Health Dashboard (Top)**

- প্রতিটি integration-এর live status: Connected/Disconnected/Error + last successful sync time
- ৪ courier + ৩ analytics একসাথে এক grid-এ

**B. One-Click Test All**

- "Test All Connections" button: সব configured integration-এ একসাথে health check চালাবে
- Progress bar + per-integration result

**C. Webhook Logs Viewer**

- নতুন collapsible section: courier delivery status webhooks (last 50 entries)
- Timestamp, courier name, order ID, status, response code

---

### Part 3: Backup Page — ৩টি নতুন ফিচার

**A. Scheduled Auto-Backup**

- নতুন setting: Daily/Weekly/Monthly auto-backup toggle
- pg_cron + new edge function `auto-backup-database` (uses existing backup logic)
- Last auto-backup time + next scheduled time display

**B. Backup Storage Usage Card**

- Total backups count, total size, oldest backup date
- Bar visualization যদি storage কোনো limit ছাড়ায়

**C. Selective Table Backup**

- Checkbox list of all tables — user select করতে পারবে কোন table backup নিবে
- Default "All tables" selected

---

### Part 4: Reviews Page —  নতুন ফিচার

**A. Review Analytics Card**

- Avg rating trend (last 30 days line chart)
- Rating distribution bars (1★-5★ count)
- Most reviewed products (top 5)

---

### Part 5: Trash Page — ৩টি নতুন ফিচার

**A. Search Within Trash**

- Search bar to filter trashed items by name/title
- বর্তমানে শুধু entity type filter আছে

**B. Storage Impact Indicator**

- Top-এ stat: "Items pending purge in 7 days: X" (urgent)
- Total items, oldest item age, items added today

**C. Bulk Restore by Filter**

- "Restore All [Entity]" button per tab
- "Empty Trash" master button (Admin only) সব permanent delete

---

### Technical Files


| ফাইল                                                          | কাজ                                                                                  |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| **Audit Log**                                                 | &nbsp;                                                                               |
| `src/components/settings/AuditLogTab.tsx`                     | Heatmap component, Critical alerts card, Diff view                                   |
| `src/components/settings/audit/ActivityHeatmap.tsx` (নতুন)    | 7×24 grid SVG visualization                                                          |
| `src/components/settings/audit/JsonDiffView.tsx` (নতুন)       | Side-by-side key diff renderer                                                       |
| **Integrations**                                              | &nbsp;                                                                               |
| `src/components/settings/IntegrationsSettings.tsx`            | Health dashboard wrapper, Test All button                                            |
| `src/components/settings/IntegrationHealthGrid.tsx` (নতুন)    | All integration status grid                                                          |
| `src/components/settings/WebhookLogsViewer.tsx` (নতুন)        | Last 50 webhook events list                                                          |
| **Backup**                                                    | &nbsp;                                                                               |
| DB Migration                                                  | `backup_schedule_settings` table; pg_cron job                                        |
| `supabase/functions/auto-backup-database/index.ts` (নতুন)     | Scheduled backup runner                                                              |
| `src/components/settings/BackupSettings.tsx`                  | Schedule toggle, storage card, selective tables UI                                   |
| **Reviews**                                                   | &nbsp;                                                                               |
| DB Migration                                                  | `product_reviews.admin_reply`, `admin_reply_at`, `is_flagged`, `flag_reason` columns |
| `src/pages/admin/ReviewsManager.tsx`                          | Reply modal, Flagged tab, Analytics card                                             |
| `src/components/admin/reviews/ReviewAnalyticsCard.tsx` (নতুন) | Trend chart + distribution + top products                                            |
| `src/components/products/ProductReviews.tsx`                  | Display admin reply on storefront                                                    |
| **Trash**                                                     | &nbsp;                                                                               |
| `src/pages/GlobalTrash.tsx`                                   | Search input, storage stats, bulk restore by filter, Empty Trash button              |


কোনো নতুন third-party library লাগবে না — existing recharts, jsPDF (ব্যবহার হলে), date-fns দিয়ে সব হবে। সব features client-side ছাড়া auto-backup edge function ও DB migrations ছাড়া।