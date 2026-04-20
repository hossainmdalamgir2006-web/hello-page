

## Plan: Emails ও Notifications পেজে নতুন ফিচার যোগ

### Emails Page — 3টি নতুন ফিচার

#### 1. Template Preview (HTML Live Preview)
- EmailTemplatesTab-এ প্রতিটি টেমপ্লেটের জন্য "Preview" বাটন যোগ
- ক্লিক করলে Dialog-এ iframe/dangerouslySetInnerHTML দিয়ে HTML preview দেখাবে
- Variables গুলো sample data দিয়ে replace করে দেখাবে

#### 2. Template Duplicate
- প্রতিটি টেমপ্লেটের action area-তে "Duplicate" বাটন
- ক্লিক করলে টেমপ্লেটের কপি তৈরি হবে "(Copy)" suffix সহ
- `onCreateTemplate` ব্যবহার করে নতুন entry তৈরি

#### 3. Email Send Log Tab
- Emails পেজে একটি নতুন ট্যাব "Send History" যোগ
- `email_templates` টেবিলের সাথে একটি `email_send_log` টেবিল (যদি না থাকে) তৈরি করে সাম্প্রতিক email sends দেখাবে
- Template name, recipient, status, timestamp কলাম সহ টেবিল

### Notifications Page — 3টি নতুন ফিচার

#### 4. Notification Schedule (Delivery Timing)
- প্রতিটি notification-এ delivery mode সিলেক্ট: Instant / Daily Digest / Weekly Summary
- `store_settings`-এ `notification_schedules` key-তে সেভ হবে
- AllEmailNotifications কম্পোনেন্টে প্রতিটি item-এ ছোট Select/dropdown যোগ

#### 5. Test Notification Button
- প্রতিটি notification item-এ একটি ছোট "Test" বাটন
- ক্লিক করলে logged-in admin-এর email-এ test notification পাঠাবে
- `send-login-alert` এর মতো edge function invoke করবে

#### 6. Recent Notification Log
- Notifications পেজের নিচে "Recent Activity" সেকশন
- `notifications` টেবিল থেকে সাম্প্রতিক 20টি sent notification দেখাবে
- Type badge, recipient, timestamp, status সহ

### ফাইল পরিবর্তন

| ফাইল | কাজ |
|------|------|
| `src/components/settings/EmailTemplatesTab.tsx` | Preview Dialog ও Duplicate বাটন যোগ |
| `src/pages/system-settings/EmailsPage.tsx` | Send History ট্যাব যোগ (Tabs layout) |
| `src/components/settings/AllEmailNotifications.tsx` | Schedule dropdown ও Test বাটন যোগ |
| `src/pages/system-settings/NotificationsPage.tsx` | Recent Activity log সেকশন যোগ |

কোনো নতুন ডাটাবেস টেবিল লাগবে না — existing `store_settings`, `notifications` টেবিল ব্যবহার হবে।

