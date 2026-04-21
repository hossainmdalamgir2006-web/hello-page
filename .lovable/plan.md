## Plan: Store Settings পেজে নতুন ফিচার যোগ

### বর্তমান অবস্থা

`/admin/system-settings/store` পেজে এখন আছে: Header config, Footer config, Upload Settings, Maintenance Mode — সাইডবার navigation সহ চারটা section।

### কী যোগ করা যেতে পারে (৪টি কাজের মত enhancement)

**Part 1: Maintenance Mode — ২টি ফিচার**

**A. Live Countdown Preview**

- Estimated end time set থাকলে settings page-এ একটা live countdown দেখাবে ("Maintenance ends in 2h 15m")
- Real-time tick (every minute)

**B. IP Whitelist (Bypass List)**

- Maintenance চালু থাকলেও যেসব IP address দিয়ে store access করা যাবে — comma-separated list
- নতুন setting key: `MAINTENANCE_BYPASS_IPS`
- Maintenance check logic-এ IP match হলে bypass

---

**** 

---

**** 

---

###  

---

### Technical Files


| ফাইল                                                  | কাজ                                 |
| ----------------------------------------------------- | ----------------------------------- |
| `src/components/settings/MaintenanceModeSettings.tsx` | Live countdown + IP whitelist input |
| `src/hooks/useMaintenanceMode.ts`                     | IP bypass field handling            |
| `src/components/MaintenanceCheck.tsx` (existing)      | Client IP check against whitelist   |
| ``                                                    | &nbsp;                              |
| `src/components/SEOHead.tsx`                          | Default fallback values use করা     |


কোনো নতুন database migration বা edge function লাগবে না — সব existing `store_settings` table এবং Supabase Storage SDK দিয়ে হবে।

**দরকার আছে কি?** যদি শুধুমাত্র aesthetics/cleanliness দেখেন, তাহলে current state ঠিক আছে। কিন্তু **SEO Defaults** এবং **Store Info** দুইটা practically useful — invoice, email, meta tags একসাথে centralize হবে। **Storage Overview**ও admin-এর জন্য helpful (orphaned files দেখা যায়)।

কোন part গুলো implement করতে চান জানালে approve করে দিন।