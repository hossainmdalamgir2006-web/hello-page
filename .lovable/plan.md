

## Backup পেজ — Refresh Button Remove

**File:** `src/components/settings/BackupSettings.tsx`

Refresh button (যেটা backup list reload করে) remove করব — অন্য পেজগুলোর সাথে consistent রাখতে।

### Changes
- `BackupSettings.tsx` থেকে Refresh button JSX remove
- `RefreshCw` icon import remove (যদি আর কোথাও ব্যবহার না হয়)

