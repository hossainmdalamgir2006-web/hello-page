

## MyAccount Pages — Design Consistency Update

### সমস্যা চিহ্নিত

Screenshots থেকে দেখা যাচ্ছে:

1. **Duplicate Headers** — Layout-এ `AccountPageHeader` আছে (যেমন "My Orders / View and track your orders"), আবার প্রতিটি component-এর ভিতরেও CardHeader-এ নিজস্ব title আছে (যেমন "Order History", "My Wishlist", "Support Tickets", "Addresses", "Notification Preferences", "Recently Viewed")। এটা দুইবার header দেখাচ্ছে।

2. **Action Buttons floating** — Returns-এ "New Request", Reviews-এ "Write Review Btn", Addresses-এ "Add Address" বাটন page header-এর বাইরে আলাদাভাবে floating। Admin panel-এ এগুলো `AdminPageHeader`-এর `actions` prop-এ থাকে।

3. **Dashed borders** — Empty state cards-এ `border-dashed` ব্যবহার হচ্ছে যা Admin panel-এর solid border style-এর সাথে match করে না।

### পরিবর্তন

#### 1. Action buttons কে AccountPageHeader-এ move করা
এই page গুলোতে action button আছে যেগুলো header-এ যাবে:
- **AccountReturns** — "New Request" button → header actions-এ
- **AccountReviews** — "Write Review Btn" → header actions-এ  
- **AccountAddresses** — "Add Address" button → header actions-এ
- **AccountOrders** (OrdersTab) — "Refresh" button → header actions-এ

#### 2. Component internal headers remove করা
এই component গুলো থেকে duplicate CardHeader/title সরাতে হবে:
- **OrdersTab** — `CardHeader` থেকে "Order History" title ও description remove (CardHeader রাখব শুধু search/filter bar-এর জন্য)
- **WishlistTab** — CardHeader থেকে "My Wishlist" title ও description remove
- **RecentlyViewedTab** — CardHeader থেকে "Recently Viewed" title ও description remove, "Clear All" button header actions-এ move
- **CustomerSupportTickets** — CardHeader থেকে "Support Tickets" title/description remove, "New Ticket" button header actions-এ move
- **AccountNotificationPreferences** — CardHeader থেকে "Notification Preferences" title/description remove
- **AccountAddresses** — Internal `<h1>` title ও description remove

#### 3. `CustomerAccountLayout.tsx` — Header actions support
- `AccountPageHeader`-এ actions pass করার জন্য Outlet context বা state mechanism add করব
- প্রতিটি page থেকে actions set করতে পারবে

#### 4. Empty state cards — border-dashed → solid
- Returns, Wishlist, Reviews empty state cards থেকে `border-dashed` remove করব

### Technical Details
- ~8 files modified
- `CustomerAccountLayout.tsx` — Outlet context দিয়ে child pages থেকে header actions pass করার mechanism
- `AccountPageHeader.tsx` — already `actions` prop support করে
- No DB changes
- Pattern: Admin panel-এর `AdminPageHeader` + `actions` pattern follow

