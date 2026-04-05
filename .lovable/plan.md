

## Store Header/Footer → Site Settings পেজে Move

### সমস্যা
Store Header ও Store Footer বর্তমানে `/admin/content` পেজে আছে। এগুলো `/admin/system-settings/store` (Site Settings) পেজে move করতে হবে এবং সেই পেজে Content Manager-এর মতো sidebar navigation যোগ করতে হবে।

### পরিবর্তন

#### 1. `src/config/siteContentRegistry.ts`
- `header` ও `footer` entries remove করব registry array থেকে (line 507-559)
- এই দুটো আলাদা registry/config হিসেবে export করব Site Settings পেজের জন্য:
  ```ts
  export const siteSettingsRegistry = [headerDef, footerDef];
  ```

#### 2. `src/pages/system-settings/StorePage.tsx` — সম্পূর্ণ রিডিজাইন
- Content Manager-এর মতো sidebar layout যোগ করব
- Left sidebar: 3টি item — **Store Header**, **Store Footer**, **Site Settings** (Upload + Maintenance)
- Right side: selected item-এর editor form (Content Manager-এর section edit UI reuse)
- Site Settings select করলে existing `UploadSettings` + `MaintenanceModeSettings` দেখাবে
- Store Header/Footer select করলে Content Manager-এর মতো section editor দেখাবে
- `useSiteContent` hook ব্যবহার করব header/footer data manage করতে

#### 3. `src/components/settings/StoreSettingsTab.tsx`
- শুধু Upload + Maintenance render করবে (already done, no change needed)

### Technical Details
- 2 files modified: `siteContentRegistry.ts`, `StorePage.tsx`
- Content Manager-এর `renderFieldEditor` pattern reuse করব StorePage-তে
- No DB changes
- `StoreHeader.tsx`/`StoreFooter.tsx` unchanged — তারা `useSiteContent("header")`/`useSiteContent("footer")` ব্যবহার করে, registry-তে data থাকলেই কাজ করবে

