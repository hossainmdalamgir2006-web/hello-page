

## Store Settings → Content Manager রিস্ট্রাকচারিং

### সমস্যা
Store Information (name, email, phone, address, logo, favicon) এবং Branding & Social Media (description, social links) বর্তমানে `/admin/system-settings/store` পেজে আছে। এগুলো Content Manager-এ move করতে হবে — Store Header ও Store Footer সেকশনে organize করে। এবং Store Settings পেজকে "Site Settings" হিসেবে রিনেম করতে হবে যেখানে শুধু Upload Settings ও Maintenance Mode থাকবে।

### পরিবর্তন

#### 1. `src/config/siteContentRegistry.ts` — Header ও Footer সেকশন আপডেট

**Store Header** সেকশনে নতুন fields যোগ:
- `store_name` (text), `store_logo` (text/url), `store_favicon` (text/url)
- `store_phone` (text), `announcement_text` (text), `announcement_link` (text)

**Store Footer** সেকশনে নতুন fields যোগ:
- `store_description` (textarea)
- `store_email` (text), `store_phone` (text)
- `store_address` (text), `store_city` (text), `store_postal_code` (text)
- `facebook_url` (text), `instagram_url` (text), `twitter_url` (text), `youtube_url` (text)
- বিদ্যমান `shop_links`, `help_links`, `social_links` থাকবে

#### 2. `src/components/settings/StoreSettingsTab.tsx` — সিম্পলিফাই

Store Information কার্ড এবং Branding & Social Media কার্ড remove করব। শুধু `UploadSettings` ও `MaintenanceModeSettings` থাকবে। Props interface থেকে store fields remove।

#### 3. `src/pages/system-settings/StorePage.tsx` — "Site Settings" রিনেম

- Title: "Site Settings" (আগে "Store Settings")
- Description: "Upload limits and maintenance mode"
- Store Information ও Social Media সংক্রান্ত সব state, settings fetch, save logic remove
- শুধু `<StoreSettingsTab />` রেন্ডার করবে (যেটা এখন শুধু Upload + Maintenance)
- `useStoreSettings`, `useBeforeUnload`, dirty tracking ইত্যাদি remove (কারণ UploadSettings নিজেই save handle করে)

#### 4. `StoreFooter.tsx` ও `StoreHeader.tsx` — Content Manager থেকে data read

এগুলো already `usePageContent`/`useStoreSettingsCache` ব্যবহার করে। Content Manager-এ data save হলে এগুলো automatically সেখান থেকে read করবে। যদি store_settings table থেকেও fallback দরকার হয় তাহলে existing `useStoreSettingsCache` কে fallback হিসেবে রাখব।

### Technical Details
- Files modified: 3-4 files (`siteContentRegistry.ts`, `StoreSettingsTab.tsx`, `StorePage.tsx`, possibly header/footer components)
- No DB changes needed — Content Manager already uses `site_content_overrides` table
- Existing store_settings data fallback হিসেবে কাজ করবে যতক্ষণ না Content Manager-এ নতুন data save হয়

