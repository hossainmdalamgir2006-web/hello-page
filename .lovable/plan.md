

## Shipping Info Page — সম্ভাব্য Updates

বর্তমানে page টা খুব basic — plain cards, no animations, no visual hierarchy।

### 1. Gradient Hero Banner
- Contact/FAQ page-এর মতো gradient hero section with title & subtitle
- Decorative blur elements

### 2. Animated Entry
- Framer Motion দিয়ে cards ও sections-এ staggered animations

### 3. Shipping Cost Calculator
- Interactive calculator — area select করলে estimated shipping cost দেখাবে
- Inside/Outside Dhaka dropdown

### 4. Delivery Timeline Visual
- Step-by-step visual timeline (Order Placed → Processing → Shipped → Delivered)
- Estimated days সহ

### 5. Courier Partner Logos
- যেসব courier ব্যবহার হয় (Steadfast, Pathao, RedX, etc.) তাদের logo grid

### 6. FAQ Section
- Shipping-related common questions accordion (Contact/FAQ page-এর design-এ)

### 7. Default Fallback Content
- Database-এ content না থাকলে meaningful default data দেখানো

### 8. CTA — Track Order
- Page-এর নিচে "Track Your Order" button/section with link to /track-order

---

## Track Order Page — সম্ভাব্য Updates

বর্তমানে functional কিন্তু visually plain।

### 1. Gradient Hero Banner
- Same gradient hero style as other pages

### 2. Animated Entry
- Framer Motion animations on card and results

### 3. Recent Order History (Logged-in Users)
- Logged-in user হলে তার recent orders automatically দেখানো
- Quick-click করে track করা যাবে

### 4. Live Status Stepper
- Phone search result-এ visual step indicator (pending → processing → shipped → delivered)
- OrderTracking page-এর মতো stepper

### 5. Order Result Card Enhancement
- Result card-এ আরো info — shipping address preview, estimated delivery date
- Better visual styling with shadows and hover effects

### 6. Copy Order Number
- Order number-এ click করলে clipboard-এ copy হবে

### 7. "Need Help?" CTA
- Page-এর নিচে Contact page-এ redirect section

### 8. Better Empty/Error States
- Animated empty states with illustrations
- More helpful error messages

---

### Files to Modify
- `src/pages/store/ShippingInfo.tsx` — all shipping updates
- `src/pages/store/TrackOrder.tsx` — all tracking updates

কোন কোন update চাও বলো, implement করে দিচ্ছি।

