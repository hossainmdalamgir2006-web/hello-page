

## SEO ও Google Ranking — বর্তমান অবস্থা ও করণীয়

### ✅ যা করা হয়েছে (Already Done)

| Feature | Status |
|---------|--------|
| **SEOHead Component** | সব store page-এ `<title>`, meta description, Open Graph, Twitter Card আছে |
| **Canonical URLs** | সব public page-এ `canonicalPath` set আছে |
| **JSON-LD Structured Data** | Homepage (Organization), Product Detail (Product), FAQ (FAQPage), Contact (ContactPage) — ৪টি page-এ আছে |
| **robots.txt** | Admin, manager, support, myaccount, login blocked; public pages allowed |
| **Dynamic Sitemap** | Edge function `generate-sitemap` — products, categories, static pages include করে |
| **Google Analytics (GA4)** | Dynamic injection, settings থেকে enable/disable |
| **Google Tag Manager (GTM)** | Dynamic injection support |
| **Meta Pixel** | Facebook pixel tracking support |
| **Google Search Console** | Verification meta tag support (settings থেকে configure) |
| **noIndex on private pages** | Account pages, cart, order tracking — সব noIndex আছে |
| **OG Image** | Product pages-এ product image OG image হিসেবে set হয় |
| **Dynamic Title** | Store name + page title dynamically set হয় |
| **Preconnect/DNS Prefetch** | Supabase ও Google Fonts-এর জন্য index.html-এ আছে |

### ❌ যা এখনো করা হয়নি / Update দরকার

#### 1. **robots.txt — Sitemap URL ভুল**
- বর্তমানে: `Sitemap: https://say-hi-alif.lovable.app/sitemap.xml`
- এটি পুরোনো URL — আপনার actual published URL-এ update করতে হবে
- আর sitemap edge function call করে না, static file point করে

#### 2. **Sitemap Route নেই**
- `generate-sitemap` edge function আছে কিন্তু `/sitemap.xml` route frontend-এ নেই
- Google কে sitemap দিতে হলে হয় edge function URL সরাসরি দিতে হবে অথবা frontend route বানাতে হবে

#### 3. **JSON-LD Structured Data অসম্পূর্ণ**
- **BreadcrumbList** schema নেই — Google search results-এ breadcrumb দেখাবে না
- **WebSite** schema (SearchAction সহ) নেই — Google-এ sitelinks search box আসবে না
- Category/Products listing page-এ **ItemList** schema নেই

#### 4. **Image Alt Text**
- Product images-এ alt attribute আছে কিনা verify করতে হবে — SEO-র জন্য critical

#### 5. **Page Speed Optimization**
- Large hero images-এ lazy loading / WebP format check করা দরকার
- Unsplash image preload index.html-এ আছে — এটা dynamic হওয়া উচিত

#### 6. **Heading Hierarchy (h1-h6)**
- প্রতিটি page-এ একটি মাত্র `<h1>` আছে কিনা check করা উচিত

---

### প্রস্তাবিত পরিবর্তন

#### File Changes:

1. **`public/robots.txt`** — Sitemap URL update করব actual domain-এ, edge function URL point করব
2. **`src/pages/store/StoreHome.tsx`** — WebSite JSON-LD schema add (SearchAction সহ)
3. **`src/pages/store/StoreProducts.tsx`** — ItemList JSON-LD add
4. **`src/components/SEOHead.tsx`** — BreadcrumbList support add
5. **`src/components/store/StoreBreadcrumb.tsx`** — Breadcrumb JSON-LD auto-generate
6. **`index.html`** — Static Unsplash preload remove (dynamic content হওয়া উচিত)

### Technical Details
- ~5-6 files modified
- No DB changes
- JSON-LD schemas: BreadcrumbList, WebSite+SearchAction, ItemList
- robots.txt sitemap URL fix

