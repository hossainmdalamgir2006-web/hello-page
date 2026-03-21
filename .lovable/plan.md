

# Complete Translation Coverage — All Remaining Hardcoded Strings

## Problem
Many storefront pages and components still have hardcoded English strings that don't change when language is toggled to Bengali. The previous translation pass covered headers, navigation, footer, cart, and static pages — but missed product detail, checkout, product cards, reviews, account sub-pages, order confirmation, auth pages, and various sub-components.

## Files Requiring Translation (Grouped by Priority)

### Batch 1: Product Pages (~100 new keys)

**`src/pages/store/ProductDetail.tsx`** (603 lines, zero t() usage)
- "Product Not Found", "Back to Products"
- "Size Guide", "Size", "Chest", "Waist", "Hip", "Full guide"
- "Limited Time Offer", "In Stock", "Out of Stock", "Notify When Available", "Notify Me"
- "Select Variant", "Quantity", "This bundle includes", "Products in this group"
- "Description", "Specifications", "Details", "Reviews"
- "No description available", "Compare Products", "Feature", "Price", "Category", "Brand", "Stock", "Available"
- "Added to cart!", "Bundle added to cart!", "Please select a variant", "Link copied!", "SKU copied!"
- "Only X left in stock — order soon!", toast messages

**`src/components/store/StoreProductCard.tsx`** (263 lines, zero t() usage)
- "Add to Cart", "Out of Stock", "Select Options", "Quick Add", "New", "Bundle", "Variable", "From"
- "Uncategorized"

**`src/components/store/FeaturedProductCard.tsx`**
- "Quick Add", "New", "Uncategorized"

**`src/components/product/ProductActions.tsx`**
- "Add to Cart", "Buy Now", "Compare", "WhatsApp", "Facebook"

**`src/components/store/ProductQuickView.tsx`**
- All action labels, variant selection, stock status text

**`src/components/store/ProductReviews.tsx`**
- "Write a Review", "Rating", "Submit", "Verified Buyer", review form labels

### Batch 2: Checkout & Order (~80 new keys)

**`src/pages/store/Checkout.tsx`** (986 lines, zero t() usage)
- "Checkout", "Shipping Information", "Billing Address", "Payment Method"
- Form labels: "First Name", "Last Name", "Phone Number", "Address", "City", "Postal Code", "Order Notes"
- "Shipping Zone & Rate", "Delivery Option", "Loading shipping options..."
- "Same as shipping address", "Save this address for future orders", "Address Label"
- "Cash on Delivery", "Pay with cash when...", "Terms & Conditions", "Privacy Policy"
- "Your cart is empty", "Shop Now", "Place Order"
- All toast messages (validation errors)
- "Home", "Office", "Other" labels

**`src/components/checkout/CheckoutOrderSummary.tsx`**
- "Order Summary", "Subtotal", "Discount", "Shipping", "COD Charge", "Total", "Apply", "Place Order"

**`src/components/checkout/GiftOptions.tsx`**, `OrderReviewModal.tsx`, `CheckoutContactSection.tsx`
- Gift option labels, review modal text, contact section labels

**`src/pages/store/OrderConfirmation.tsx`**
- "Order Confirmed!", "Thank you for your order", "Order Number", "Estimated Delivery", etc.

### Batch 3: Account Pages (~60 new keys)

**`src/pages/store/account/AccountDashboard.tsx`**
- "My Orders", "Shop Now", "Edit Profile", "Get Support", "Total Orders", "Recent Orders", status labels

**`src/pages/store/account/AccountAddresses.tsx`**
- "Add Address", "Edit", "Delete", "Default", "Shipping", "Billing", form labels

**`src/pages/store/account/AccountOrders.tsx`**, `AccountShopping.tsx`, `AccountInvoice.tsx`, `AccountPaymentMethods.tsx`, `AccountNotifications.tsx`
- Page titles, empty states, action buttons

**`src/pages/store/account/AccountSettings.tsx`**, `AccountSecurity.tsx`, `AccountSupport.tsx`, `AccountReviews.tsx`, `AccountReturns.tsx`, `AccountRecentlyViewed.tsx`
- Page titles and descriptions

### Batch 4: Auth & Misc (~20 new keys)

**`src/components/auth/LoginSignupView.tsx`**
- "Welcome", "Sign in to your account", "Login", "Sign Up", "Email", "Password", "Full Name", "Forgot Password?", "Back to Store"

**`src/pages/store/StoreHome.tsx`**
- Default features: "Free Shipping", "Secure Payment", "Easy Returns", "24/7 Support"
- "Shop by Category", "New Arrivals", "Best Sellers", "Flash Sale", "What Our Customers Say", "Style Inspiration"
- Newsletter: "Stay in the Loop", "Subscribe", toast messages

**`src/pages/store/StoreProducts.tsx`**
- Filter section titles: "Categories", "Brands", "Price Range", "Colors", "Sizes", "Rating", "Availability", "Tags", "Quick Filters"
- Sort labels: "Newest", "Price: Low to High", "Price: High to Low", "Name A-Z"
- "Filters", "Clear All", "Apply", "No products found", "Clear Filters", "Search products...", "& Up", "On Sale", "New Arrivals", "All", "In Stock", "Out of Stock"
- Page title: "All Products", "Sale Items", "products available"

### Batch 5: Sub-components
- `CheckoutSteps.tsx`, `FreeShippingProgress.tsx`, `ProductTrustBadges.tsx`, `RelatedProductsGrid.tsx`
- `OrderTracking.tsx`, `TrackOrder.tsx`, `SizeGuide.tsx`

## Implementation Approach

1. **`src/contexts/LanguageContext.tsx`** — Add ~260 new translation keys (en + bn) organized by section
2. **All files listed above** — Import `useLanguage`, call `t()` for every hardcoded string
3. Toast messages will also be translated via `t()` keys

## Total Scope
- ~260 new translation keys in LanguageContext
- ~35-40 files modified to use `t()`
- After this, **every visible string** in the storefront will respond to the language toggle

