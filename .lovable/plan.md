

## Plan: Security পেজে Device Block ও Rate Limits উন্নত করা

### বর্তমান অবস্থা
- **Rate Limits** ট্যাব আছে কিন্তু শুধু existing settings দেখায়, নতুন rule যোগ করার উপায় নেই
- **Device Block** ফিচার নেই

### পরিবর্তনসমূহ

#### 1. নতুন টেবিল: `blocked_devices`
```text
blocked_devices
├── id (uuid, PK)
├── device_fingerprint (text) — browser/device identifier
├── device_name (text) — human-readable label (e.g. "Chrome on Windows")
├── user_agent (text)
├── reason (text, nullable)
├── blocked_by (uuid, nullable)
├── is_permanent (boolean, default true)
├── blocked_until (timestamptz, nullable)
├── created_at (timestamptz)
```
RLS: Admin-only (ALL).

#### 2. Rate Limits ট্যাবে "Add Rule" ফিচার
- নতুন rate limit rule যোগ করার Dialog — Endpoint name, Max Requests, Time Window, Block Duration ইনপুট
- প্রতিটি rule-এ Delete বাটন যোগ

#### 3. নতুন "Device Blocking" ট্যাব (IPSecuritySettings-এ)
- ট্যাবে blocked device তালিকা দেখাবে (device name, user agent, reason, status, blocked date)
- "Block Device" Dialog — device fingerprint/user agent, reason, permanent/temporary
- Unblock বাটন প্রতিটি entry-তে

#### 4. ফাইল পরিবর্তন

| ফাইল | কাজ |
|------|------|
| DB Migration | `blocked_devices` টেবিল ও RLS তৈরি |
| `src/components/settings/IPSecuritySettings.tsx` | নতুন "Device Blocking" ট্যাব যোগ, Rate Limits ট্যাবে Add/Delete actions যোগ |

