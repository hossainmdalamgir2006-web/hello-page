
## MyAccount Sidebar Update

`AccountSidebar.tsx`-এ default group state পরিবর্তন করব — শুধু **Overview** open থাকবে, বাকি ৪টি group (Orders, Shopping, Settings, Help) collapsed থাকবে।

### পরিবর্তন
**File:** `src/components/account/AccountSidebar.tsx`

```ts
const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
  overview: true,    // খোলা
  orders: false,     // বন্ধ
  shopping: false,   // বন্ধ
  account: false,    // বন্ধ (Settings group)
  help: false,       // বন্ধ
});
```

### ফলাফল
- Sidebar load হলে শুধু **OVERVIEW → Dashboard** দেখা যাবে
- বাকি groups (ORDERS, SHOPPING, SETTINGS, HELP) এ ক্লিক করলে expand হবে
- User-এর toggle state runtime-এ preserve থাকবে (page না refresh হওয়া পর্যন্ত)
- Collapsed sidebar mode (icon-only) আগের মতোই কাজ করবে

কোনো অন্য file বা logic পরিবর্তন হবে না।
