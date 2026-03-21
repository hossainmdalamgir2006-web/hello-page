

# Enhanced Product Filters — Sidebar

## What's Available in Database

Based on the `products` and `product_variants` tables, here are ALL the filters we can add:

| Filter | Source | Currently Exists |
|---|---|---|
| Category | `products.category` | Yes |
| Price Range | `products.price` | Yes |
| On Sale | `compare_at_price > price` | Yes |
| New Arrivals | `created_at` last 30 days | Yes |
| **Brand** | `products.brand` | No |
| **Tags** | `products.tags[]` | No |
| **Stock Status** | `products.quantity` | No |
| **Color** | `product_variants.color` | No |
| **Size** | `product_variants.size` | No |
| **Rating** | `product_reviews.rating` (avg) | No |
| **Product Type** | `products.product_type` | No |

## Plan

### `src/pages/store/StoreProducts.tsx`

**1. Fetch additional data on mount:**
- Brands: `SELECT DISTINCT brand FROM products WHERE is_active AND brand IS NOT NULL`
- Colors: `SELECT DISTINCT color FROM product_variants WHERE color IS NOT NULL`
- Sizes: `SELECT DISTINCT size FROM product_variants WHERE size IS NOT NULL`
- Tags: Aggregate unique tags from products
- Average ratings: `SELECT product_id, AVG(rating) FROM product_reviews GROUP BY product_id`

**2. Add new filter state:**
- `selectedBrands: string[]`
- `selectedColors: string[]`
- `selectedSizes: string[]`
- `selectedTags: string[]`
- `stockStatus: "all" | "in-stock" | "out-of-stock"`
- `minRating: number` (0-5, 0 = show all)

**3. Update `FilterPanel` with new sections:**
- **Brand** — checkboxes (like categories)
- **Color** — color swatches (circles with `color_code` if available, else text)
- **Size** — compact badges/chips (S, M, L, XL, etc.)
- **Rating** — star buttons (4+, 3+, 2+, 1+)
- **Stock** — radio: All / In Stock / Out of Stock
- **Tags** — collapsible checkbox list

**4. Update `filteredProducts` memo** to apply all new filters.

**5. Update `activeFilterCount` and active filter badges** to reflect new filters.

**6. Update `clearFilters`** to reset all new state.

### `src/components/skeletons/StoreFrontSkeletons.tsx`
- Extend `FilterSkeleton` with a few more shimmer rows to match the taller sidebar.

### Files Changed
- `src/pages/store/StoreProducts.tsx` — main changes
- `src/components/skeletons/StoreFrontSkeletons.tsx` — minor update

