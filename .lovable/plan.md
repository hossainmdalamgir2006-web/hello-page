

## Plan: Role Permissions ও Change History কে একটি Tabbed Card-এ মার্জ করা

বর্তমানে `RolePermissionsOverview` এবং `RoleChangeHistory` দুটি আলাদা Card হিসেবে দেখাচ্ছে। এই দুটিকে একটি Card-এ দুটি ট্যাব (`Permissions` ও `Change History`) আকারে রাখা হবে।

### পরিবর্তন

**1. নতুন কম্পোনেন্ট তৈরি: `src/components/admin/roles/RoleDetailsCard.tsx`**
- একটি একক `Card` কম্পোনেন্ট যাতে `Tabs` (shadcn) ব্যবহার করে দুটি ট্যাব থাকবে:
  - **Permissions** — বর্তমান `RolePermissionsOverview` এর টেবিল কন্টেন্ট
  - **Change History** — বর্তমান `RoleChangeHistory` এর টাইমলাইন কন্টেন্ট
- Card header-এ শুধু title/description থাকবে, ট্যাব নিচে

**2. `RoleManagement.tsx` আপডেট**
- আলাদা `<RolePermissionsOverview />` ও `<RoleChangeHistory />` সরিয়ে একটি `<RoleDetailsCard />` রেন্ডার করা হবে

**3. পুরানো ফাইল**
- `RoleChangeHistory.tsx` ও `RolePermissionsOverview.tsx` ফাইল দুটি রাখা হবে (import হিসেবে `RoleDetailsCard` থেকে ব্যবহার করা যাবে), অথবা কন্টেন্ট সরাসরি নতুন কম্পোনেন্টে inline করা যাবে

