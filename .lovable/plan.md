

User wants:
1. Customers page theke tier system **complete remove**
2. Account Deletion Requests page-e: bulk approve/reject + auto-purge after 30 days + user info (email/name) display

## Plan: Customers Tier Removal + Deletion Requests Enhancement

### Part 1: Customers Page — Tier System সম্পূর্ণ Remove

`getLoyaltyTier` ও `tierConfig` (Bronze/Silver/Gold/Platinum) ৪টি ফাইল থেকে সরানো হবে:

| ফাইল | পরিবর্তন |
|------|----------|
| `src/components/admin/CustomerSegmentTabs.tsx` | "VIP" segment ও `getLoyaltyTier` মুছে ফেলা; অন্য segments (All, Active Buyers, High Value, At Risk, Flagged, Blocked) থাকবে |
| `src/components/admin/CustomerDetailModal.tsx` | `tierConfig`, `getLoyaltyTier`, tier Badge ও Crown icon header থেকে সরানো |
| `src/components/admin/MobileCustomerCard.tsx` | Tier Badge ও logic সরানো |
| `src/components/admin/CustomerQuickLookup.tsx` | Tier display সরানো, শুধু customer name/email/spent দেখাবে |

### Part 2: Account Deletion Requests — ৩টি নতুন ফিচার

**A. User Info Display (email + name)**
- `account_deletion_requests` শুধু `user_id` রাখে। আমরা parallel `profiles` query করে `email`, `full_name` JOIN করব (client-side `useQuery` map)
- টেবিলে নতুন কলাম "User" — avatar + name + email; পুরানো `User ID` কলামটি সরানো হবে

**B. Bulk Approve/Reject**
- প্রতিটি pending row-এ Checkbox যোগ
- Header-এ "Select All Pending" checkbox
- নির্বাচিত হলে উপরে একটি action bar দেখাবে: `Bulk Approve (N)` / `Bulk Reject (N)` বাটন
- Bulk approve sequentially `delete-user-account` edge function call করবে progress toast সহ
- Bulk reject একক `update` query-তে status='rejected' সেট করবে

**C. Auto-Purge after 30 Days**
- Pending request ৩০ দিন পর কিছু না হলে status='expired' করে দেওয়া হবে
- নতুন edge function: `auto-purge-deletion-requests` (Deno.serve, service role)
- pg_cron দৈনিক একবার এই function call করবে
- UI-তে pending row-এ "X days until auto-expire" countdown badge (existing `TrashPurgeCountdown` pattern)
- Expired status-এর জন্য নতুন Badge variant

### ফাইল পরিবর্তন

| ফাইল | কাজ |
|------|------|
| `src/components/admin/CustomerSegmentTabs.tsx` | VIP/tier remove |
| `src/components/admin/CustomerDetailModal.tsx` | Tier badge/icon remove |
| `src/components/admin/MobileCustomerCard.tsx` | Tier remove |
| `src/components/admin/CustomerQuickLookup.tsx` | Tier remove |
| `src/pages/admin/AccountDeletionRequests.tsx` | User info JOIN, Checkbox bulk select, bulk action bar, expire countdown, expired badge |
| `supabase/functions/auto-purge-deletion-requests/index.ts` | নতুন edge function (30+ দিনের pending → expired) |
| pg_cron schedule (insert SQL) | দৈনিক purge function trigger |

কোনো নতুন ডাটাবেস টেবিল লাগবে না — existing `account_deletion_requests` ও `profiles` টেবিল ব্যবহার হবে।

