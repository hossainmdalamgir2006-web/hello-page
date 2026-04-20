## Plan: Account Settings ৪টি পেজে নতুন ফিচার যোগ

### বর্তমান অবস্থা

- **Personal Info**: Avatar upload, name update, email change ✅
- **Password**: Change password + strength + leak check + tips ✅
- **Security**: 2FA, Recovery Codes, Trusted Devices ✅
- **Login Activity**: Active sessions + login history list ✅

---

### Part 1: Personal Info Page — ৩টি নতুন ফিচার

**A. Phone Number Field**

- `profiles` টেবিলে `phone` কলাম যোগ (যদি না থাকে)
- Personal Information কার্ডে নতুন "Phone" input field সহ country prefix (+880 default)

**B. Bio / Job Title Field**

- Admin/Manager/Support staff-এর জন্য একটি optional "Bio" textarea (max 200 chars)
- Profile-এর "About" সেকশনে দেখাবে

**C. Account Overview Card (Right Column)**

- Member since date, role badge, last login time, account ID (copy button সহ)
- Read-only informational card

---

### Part 2: Password Page — ২টি নতুন ফিচার

**A. Password History (Last 5 Changes)**

- নতুন টেবিল: `password_change_history` (id, user_id, changed_at, ip_address, user_agent)
- পাসওয়ার্ড পরিবর্তনের সময় auto-log
- Right column-এ "Recent Password Changes" timeline (last 5 entries: date + device)

**** 

---

### Part 3: Security Page — ২টি নতুন ফিচার

**A. Security Score Widget**

- ০-১০০ score calculate: 2FA enabled (+40), Recovery codes generated (+20), Strong password (+20), Trusted devices configured (+10), Recent activity check (+10)
- Top-এ একটি card with circular progress + actionable tips ("Enable 2FA to gain +40 points")

**B. Active Security Alerts Section**

- Recent suspicious activity দেখাবে (failed logins, lockouts, new device logins from last 7 days)
- "Review" বাটন → Login Activity পেজে navigate

---

### Part 4: Login Activity Page — ৩টি নতুন ফিচার

**A. Filters & Search**

- ট্যাব দিয়ে filter: All / Successful / Failed / Last 7 days / Last 30 days
- Search by IP address বা device

**B. Suspicious Activity Highlight**

- নতুন device বা location থেকে login → "New" badge সহ highlight
- Failed attempts cluster (5+ within 1 hour) → "Suspicious" red badge

**C. Export Login History (CSV)**

- "Export CSV" বাটন: full activity history download (date, status, device, browser, OS, IP, location)
- Client-side CSV generation, কোনো backend লাগবে না

---

### Technical Files


| ফাইল                                                     | কাজ                                                                               |
| -------------------------------------------------------- | --------------------------------------------------------------------------------- |
| DB Migration                                             | `password_change_history` টেবিল + RLS; `profiles.phone` ও `profiles.bio` কলাম যোগ |
| `src/pages/profile/PersonalInfoPage.tsx`                 | Phone + Bio field, Account Overview card                                          |
| `src/pages/profile/PasswordPage.tsx`                     | Password history timeline + expiry banner; insert into history on password update |
| `src/pages/profile/SecurityPage.tsx`                     | SecurityScoreCard + ActiveAlertsCard                                              |
| `src/components/profile/LoginActivity.tsx`               | Filter tabs, search, suspicious badges, CSV export                                |
| `src/components/profile/SecurityScoreCard.tsx` (নতুন)    | Score calculation + circular progress UI                                          |
| `src/components/profile/ActiveSecurityAlerts.tsx` (নতুন) | Alert list from failed_login_attempts + login_activity                            |


কোনো নতুন edge function লাগবে না — সব client-side। Existing `failed_login_attempts`, `login_activity`, `account_lockouts` টেবিল ব্যবহার হবে।