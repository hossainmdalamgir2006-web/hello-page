# অপ্রয়োজনীয় / অসম্পূর্ণ ফিচার তালিকা

প্রতিটি feature পর্যালোচনা করে নিচে **যেগুলো fully functional না** সেগুলো চিহ্নিত করা হলো:

---

##  

### 1. **Language Settings** (`src/pages/settings/LanguagesPage.tsx`)

- Translation system সরিয়ে দেওয়া হয়েছে — `t()` এখন শুধু key convert করে
- Language settings পেজে ভাষা enable/disable করলেও কোনো effect নেই
- Google Translate Widget ও remove করা হয়েছে

### 2. **Currency Settings** (`src/pages/settings/CurrenciesPage.tsx`)

- CurrencyProvider ও CurrencySwitcher remove করা হয়েছে
- Settings page-এ currency যোগ করলেও storefront-এ কোনো effect নেই

###  

&nbsp;

ei 2ta features tu ami clean korte bolsi koro 

&nbsp;

&nbsp;