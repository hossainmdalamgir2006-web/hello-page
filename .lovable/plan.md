

## Plan: Homepage-এ ৫টি Enhancement

### বর্তমান অবস্থা
Homepage-এ আছে: Hero Carousel, Feature Bar, Categories Grid, New Arrivals, Promo Banners, Best Sellers, Flash Sale, Testimonials, Newsletter।

### যা করা হবে

**1. Brand Logos Marquee Section** (নতুন কম্পোনেন্ট)
- `src/components/store/BrandMarquee.tsx` তৈরি করা
- CSS `@keyframes` দিয়ে infinite scroll animation (marquee effect)
- Database `brands` টেবিল থেকে active brands-এর logo fetch করবে
- Feature Bar-এর পরে দেখাবে
- Framer Motion ছাড়া pure CSS animation ব্যবহার করা হবে (lightweight)

**2. Trending / Popular Products Section** (নতুন কম্পোনেন্ট)
- `src/components/store/TrendingProductsSection.tsx` তৈরি করা
- Database থেকে সবচেয়ে বেশি বিক্রি হওয়া প্রোডাক্ট fetch করবে (orders টেবিল থেকে count করে)
- অথবা সরাসরি products টেবিলের `total_sold` / view count ব্যবহার করা যাবে
- FeaturedProductCard দিয়ে render করবে
- Best Sellers-এর আগে বসবে

**3. Recently Viewed Products Carousel** (নতুন কম্পোনেন্ট)
- `src/components/store/RecentlyViewedCarousel.tsx` তৈরি করা
- `useRecentlyViewed` hook আগে থেকেই আছে — সেটা ব্যবহার করবে
- Horizontal scroll carousel (CSS snap scroll)
- Newsletter-এর আগে দেখাবে, শুধু logged-in বা যাদের viewed history আছে তাদের জন্য

**4. Parallax Scroll Effects**
- Hero Carousel-এর পরে sections-এ subtle parallax যোগ করা
- `useEffect` + `scroll` event listener দিয়ে lightweight parallax
- Best Sellers ও Testimonials section-এ background parallax effect
- Performance-এর জন্য `transform: translateY()` ব্যবহার করা হবে (GPU accelerated)

**5. Better Product Card Hover**
- `FeaturedProductCard.tsx`-এ hover-এ 2nd image swap যোগ করা
- Product data-তে 2nd image থাকলে hover-এ দেখাবে
- Quick Add button-এ slide-up animation আগে থেকেই আছে — সেটা রাখা হবে
- Wishlist heart icon hover-এ দেখাবে

### ফাইল পরিবর্তন
| ফাইল | পরিবর্তন |
|---|---|
| `src/components/store/BrandMarquee.tsx` | নতুন তৈরি |
| `src/components/store/TrendingProductsSection.tsx` | নতুন তৈরি |
| `src/components/store/RecentlyViewedCarousel.tsx` | নতুন তৈরি |
| `src/components/store/FeaturedProductCard.tsx` | Image swap + wishlist hover |
| `src/pages/store/StoreHome.tsx` | নতুন সেকশনগুলো integrate + parallax |
| `src/index.css` | Marquee keyframes animation |

### সেকশন অর্ডার (উপর থেকে নিচে)
1. Hero Carousel
2. Feature Bar
3. **Brand Logos Marquee** ← নতুন
4. Categories Grid
5. New Arrivals
6. Promo Banners
7. **Trending Products** ← নতুন
8. Best Sellers (with parallax bg)
9. Flash Sale
10. Testimonials (with parallax bg)
11. **Recently Viewed** ← নতুন
12. Newsletter

