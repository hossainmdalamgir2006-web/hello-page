
# Documentation Video Plan — "demo" E-commerce Platform

Apnar website ekta full-stack, BD-localized e-commerce + business automation platform. Niche ami video-er jonno (1) full feature inventory, (2) "100% business automation" narrative/flow, ar (3) screenshot list dilam.

Build mode-e switch korle ami sob screenshot `/mnt/documents/` e save kore debo (admin dashboard ar storefront home ami already capture korechi — preview-te dekha jacche).

---

## 1. Full Feature Inventory

### A. Customer-facing Storefront (`/`)
- **Homepage**: Hero carousel, category grid, New Arrivals, Trending Now, Best Sellers, Flash Sale (live countdown), Customer Reviews, Newsletter, SVG-divided sections
- **Product Catalog** (`/products`): Sticky filter sidebar (category, brand, price, color, size, rating), sort, 3-col grid, hover image swap, Quick Add, wishlist toggle
- **Product Detail** (`/product/:slug`): Image zoom, sticky Add-to-Cart, real-time "X viewers now", Reviews + media, Q&A, related products, sharing
- **Cart & Checkout**: Cart drawer + page, coupon validation, free-shipping threshold banner, address selection, multiple payment methods (bKash, Nagad, Visa, MasterCard, COD, SSLCommerz)
- **Order Tracking** (`/track-order`): Public tracking + auto-fill via `?order=ID`
- **Wishlist, Recently Viewed, Compare**
- **Help/Policy Pages**: FAQ (searchable), Shipping Info (with calculator), Size Guide (with recommender), Returns, Privacy, Terms, Contact (with LocalBusiness schema)
- **SEO**: JSON-LD, sitemap (dynamic product URLs), `llms.txt`, OG/meta tags

### B. Customer Account (`/myaccount`)
- Personalized dashboard with stat cards
- Orders + per-order tracking + invoice PDF (jsPDF)
- Returns/refund requests
- Addresses (multiple)
- Wishlist, Recently Viewed
- Reviews submitted
- Real-time **Chat with Support** (presence, typing, file attachments)
- Notifications + preferences
- Security: password, 2FA, recovery codes
- Personal info, change email
- Account deletion request (admin-approved workflow)

### C. Admin Panel (`/admin`) — Operations
- **Dashboard**: 18 KPI cards (sales, orders, AOV, conversion, abandoned carts, returns, low stock, newsletter subs…), Period Comparison, Sales Chart, Top Products, Goal Tracker, Activity Feed, Return/Refund queue, Recent Orders
- **Products**: CRUD, variants, images (Supabase Storage with WebP transforms), bulk actions, duplicate, sync pagination
- **Categories / Brands** management
- **Orders**: full lifecycle, status changes auto-logged, payment status, courier dispatch modal (Steadfast, Pathao, RedX, Paperfly)
- **Customers**: profiles, order history, LTV, 3-column status grid
- **Abandoned Carts**: list + one-click recovery + scheduled reminder emails
- **Coupons**: code/%/flat, min order, max discount, first-order-only, schedule
- **Shipping**: zones, free-shipping threshold + banner toggle
- **Reports**: CSV generation, pg_cron scheduled email delivery
- **Analytics**: traffic, conversions, product performance
- **Global Trash**: soft-delete recovery for 10 entities, auto-purge
- **Messages / Live Chat inbox** with quick replies & tags

### D. Admin — Content
- **Appearance Manager**: themes, banners, hero carousel
- **Content Manager (CMS)**: config-driven registry, FAQ, policy pages, homepage sections
- **Reviews Manager**: moderate, reply
- **Product Q&A Manager**

### E. Admin — System Settings
- **Store** (name, logo, contact, free-shipping)
- **Payments** (enable methods, manual mobile-banking account details, gateway keys)
- **Integrations** (couriers, SMS, email, analytics)
- **Emails**: 40 transactional templates with dynamic variables + QR codes
- **Notifications**: SLA alerts, scheduled reports
- **Security**: login alerts, lockout alerts, audit log
- **Audit Log**: Old vs New JSON diff, CSV export
- **Backup & Restore**: SQL schema + storage; scheduled DB backups
- **Document Templates**: dynamic jsPDF invoice/receipt/return labels
- **Edge Function Health**: live status of 28+ functions
- **Account Deletion Requests** queue
- **Role Management**: admin / manager / user via secure `user_roles` table

### F. Backend Automation (Supabase Edge Functions — 28 total)
- `process-abandoned-carts` + `send-abandoned-cart-reminder` — auto-recovery
- `send-order-confirmation` — instant email on order
- `send-scheduled-report` — pg_cron CSV reports
- `send-login-alert` / `send-lockout-alert` / `send-unlock-alert` — security mail
- `verify-login`, `send-contact-reply`
- `auto-clean-chat` (>6h purge), `auto-clean-trash`, `auto-purge-deletion-requests`
- `steadfast-courier`, `pathao-courier`, `redx-courier`, `paperfly-courier` — auto-dispatch
- `track-order` — public tracking API
- `sslcommerz-init` / `sslcommerz-ipn`, `payment-gateway-init` / `payment-gateway-ipn`
- `database-backup`, `database-restore`, `database-schema-export`
- `generate-sitemap` — dynamic SEO
- `delete-user-account`, `migrate-product-images`, `create-demo-users`

---

## 2. Video Narrative — "How this 100% Automates a Business"

Suggested 8-12 min documentation video, divided into 6 chapters:

**Chapter 1 — Storefront (Customer Experience)** [~90s]
Show: Homepage → category browse → product detail → add to cart → checkout with bKash. *Voice-over*: "Customer order kora theke shuru kore… kono manual kaj nai."

**Chapter 2 — Automatic Order Pipeline** [~2 min]
Order place hole automatic:
1. Order confirmation email (edge function)
2. Invoice PDF generate
3. Admin dashboard-e instant notification + KPI update
4. Payment IPN verify (SSLCommerz/bKash)
5. Audit log entry
Show: Admin Orders page → ek click e Steadfast/Pathao/RedX/Paperfly dispatch modal → courier API call → tracking number auto-save.

**Chapter 3 — Customer Retention Automation** [~90s]
- Abandoned cart detection (cron) → reminder email auto-pathay
- Scheduled CSV reports email-e
- Newsletter, review request, return workflow
- Real-time chat (presence, typing, attachments) → 6h inactive hole auto-purge

**Chapter 4 — Inventory & Catalog Automation** [~90s]
- Product CRUD + variant + image WebP auto-transform
- Low-stock KPI + alerts
- Soft-delete + auto-purge trash
- Sitemap auto-generation from active products

**Chapter 5 — Admin Intelligence** [~2 min]
- Dashboard: 18 KPIs, Period Comparison, Goal Tracker, Activity Feed
- Analytics page
- Reports (scheduled)
- Audit Log (Old vs New diff)
- Edge Function Health monitor
- Backup/Restore (scheduled)

**Chapter 6 — Security, Roles & CMS Control** [~90s]
- Role table (admin/manager/user), RLS
- 2FA, recovery codes, login/lockout email alerts
- CMS: FAQ, policies, homepage sections edit korle live update
- Appearance Manager: theme/banner ek click e change
- Store settings: free-shipping threshold, payment methods, courier keys

**Outro** [~30s]
"Ekta dokan owner ke shudhu product upload korle baki sob — order, payment, courier, email, report, security — system nije handle kore."

---

## 3. Screenshot Package (deliverable)

Build mode-e switch korle ami eigulor full-page PNG `/mnt/documents/screenshots/` e save kore debo, file-naming `NN-name.png`:

1. `01-storefront-home.png` — Homepage (already captured)
2. `02-product-listing.png` — `/products` filter sidebar
3. `03-product-detail.png` — `/product/:slug`
4. `04-cart-checkout.png` — Cart + Checkout
5. `05-order-tracking.png` — `/track-order`
6. `06-account-dashboard.png` — `/myaccount`
7. `07-account-orders-invoice.png`
8. `08-account-chat.png` — live chat
9. `09-admin-dashboard.png` — KPI grid (already captured)
10. `10-admin-products.png`
11. `11-admin-orders.png` + courier dispatch modal
12. `12-admin-abandoned-carts.png`
13. `13-admin-coupons.png`
14. `14-admin-analytics.png`
15. `15-admin-reports.png`
16. `16-admin-customers.png`
17. `17-admin-messages-chat.png`
18. `18-cms-content-manager.png`
19. `19-cms-appearance.png`
20. `20-system-emails.png`
21. `21-system-payments.png`
22. `22-system-integrations-couriers.png`
23. `23-system-audit-log.png`
24. `24-system-backup.png`
25. `25-system-edge-function-health.png`
26. `26-role-management.png`
27. `27-trash-recovery.png`
28. `28-mobile-storefront.png` (375px viewport)
29. `29-mobile-admin.png` (375px viewport)

Optional bonus: ekta architecture diagram (Mermaid) jeta dekhabe Customer → Storefront → Supabase RLS → Edge Functions → 3rd-party (couriers, payment, email) — video-te overlay korar jonno.

---

## Next step

Switch to **build mode** bolun — ami:
1. Upor er sob route browser-e visit kore screenshot tulbo
2. `/mnt/documents/screenshots/` folder e save kore artifact link debo
3. Chaile ekta `BUSINESS_AUTOMATION.md` o likhe debo (video script + feature list, copy-paste ready)
4. Mermaid architecture diagram artifact o include korte pari
