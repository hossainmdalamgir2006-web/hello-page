

# Profile & Settings UX Enhancement

## What's Changing

### 1. Profile Completion Progress Bar (Profile sidebar)
Profile sidebar এর top এ একটা progress bar যোগ হবে যেটা দেখাবে profile কতটুকু complete:
- Avatar uploaded? (+25%)
- Full name set? (+25%)
- 2FA enabled? (+25%)
- Password recently updated? (+25%)

Small circular or linear progress indicator with percentage text.

### 2. Sub-page Cards — Hover + Accent Styling
Profile ও Settings এর সব sub-page cards এ:
- Hover এ subtle shadow lift (`hover:shadow-md transition-shadow`)
- Left border accent (primary color, 3px left border)
- Card header icons এ colored background circle (e.g., `bg-primary/10 text-primary rounded-lg p-2`)

### 3. Admin Sidebar — New "Account" Collapsible Group
Bottom menu তে Profile ও Settings কে একটা collapsible **"Account"** group এ wrap করা হবে — System group এর pattern follow করবে। Collapsed sidebar এ flat icons থাকবে।

## Files to Modify

| File | Change |
|------|--------|
| `src/layouts/ProfileLayout.tsx` | Add profile completion progress component in sidebar |
| `src/pages/profile/PersonalInfoPage.tsx` | Card accent styling (left border, hover shadow, icon bg) |
| `src/pages/profile/PasswordPage.tsx` | Same card styling |
| `src/pages/profile/Security2FAPage.tsx` | Same card styling |
| `src/pages/profile/SecurityRecoveryPage.tsx` | Same card styling |
| `src/pages/profile/SecurityDevicesPage.tsx` | Same card styling |
| `src/pages/profile/SessionsActivePage.tsx` | Same card styling |
| `src/pages/profile/SessionsActivityPage.tsx` | Same card styling |
| `src/pages/settings/StorePage.tsx` | Card styling in StoreSettingsTab |
| `src/pages/settings/SecurityPage.tsx` | Card styling |
| `src/pages/settings/AuditPage.tsx` | Card styling |
| `src/pages/settings/BackupPage.tsx` | Card styling |
| `src/pages/settings/PaymentsPage.tsx` | Card styling |
| `src/pages/settings/EmailsPage.tsx` | Card styling |
| `src/pages/settings/NotificationsPage.tsx` | Card styling |
| `src/pages/settings/IntegrationsPage.tsx` | Card styling |
| `src/components/admin/AdminSidebar.tsx` | Move Profile + Settings into collapsible "Account" group |

## Technical Details

### Progress Calculation
```typescript
const completionItems = [
  { label: "Avatar", done: !!avatarUrl },
  { label: "Full Name", done: !!user?.user_metadata?.full_name },
  { label: "Two-Factor Auth", done: !!has2FA },
  { label: "Password", done: true }, // default true, or check last_password_change
];
const percentage = Math.round((completionItems.filter(i => i.done).length / completionItems.length) * 100);
```

Fetch avatar and 2FA status in ProfileLayout via quick queries.

### Card Styling Pattern
```tsx
<Card className="border-l-4 border-l-primary/20 hover:shadow-md transition-shadow">
  <CardHeader>
    <CardTitle className="flex items-center gap-3">
      <div className="rounded-lg bg-primary/10 p-2">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      Title
    </CardTitle>
  </CardHeader>
</Card>
```

### Admin Sidebar Account Group
```tsx
// In bottom menu section, replace flat items with:
<Collapsible open={openGroups['account']} onOpenChange={() => toggleGroup('account')}>
  <CollapsibleTrigger>Account</CollapsibleTrigger>
  <CollapsibleContent>
    <NavLink to="profile" /> 
    <NavLink to="settings" />
  </CollapsibleContent>
</Collapsible>
```

