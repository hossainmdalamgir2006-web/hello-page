import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Filter, Grid3X3, LayoutList, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";

import { SEOHead } from "@/components/SEOHead";
import { StoreProductCard } from "@/components/store/StoreProductCard";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  name: string;
  price: number;
  compare_at_price: number | null;
  images: string[];
  category: string | null;
  is_active: boolean;
  quantity: number;
  created_at: string;
  product_type: string | null;
}

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name", label: "Name A-Z" },
];

export default function StoreProducts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [dbCategories, setDbCategories] = useState<string[]>([]);

  // Filter states
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get("category")?.split(",").filter(Boolean) || []
  );
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "newest");
  const [showSale, setShowSale] = useState(searchParams.get("filter") === "sale");
  const [showNew, setShowNew] = useState(searchParams.get("filter") === "new");

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("categories")
      .select("name")
      .eq("is_active", true)
      .is("deleted_at", null)
      .order("sort_order");
    if (data) {
      setDbCategories(data.map((c: any) => c.name));
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("id, name, slug, price, compare_at_price, images, category, is_active, quantity, created_at, product_type")
      .eq("is_active", true)
      .is("deleted_at", null);

    if (!error && data) {
      // For variable products, fetch variant stock totals
      const variableProductIds = data
        .filter(p => p.product_type === 'variable')
        .map(p => p.id);

      let variantStockMap: Record<string, number> = {};
      if (variableProductIds.length > 0) {
        const { data: variants } = await supabase
          .from("product_variants")
          .select("product_id, quantity")
          .in("product_id", variableProductIds);

        if (variants) {
          for (const v of variants) {
            variantStockMap[v.product_id] = (variantStockMap[v.product_id] || 0) + (v.quantity || 0);
          }
        }
      }

      // For grouped products, fetch group items and child product data
      const groupedProductIds = data
        .filter(p => p.product_type === 'grouped')
        .map(p => p.id);

      let groupStockMap: Record<string, number> = {};
      let groupPriceMap: Record<string, number> = {};
      if (groupedProductIds.length > 0) {
        const { data: groupItems } = await supabase
          .from("product_group_items")
          .select("parent_product_id, child_product_id")
          .in("parent_product_id", groupedProductIds);

        if (groupItems && groupItems.length > 0) {
          const childIds = [...new Set(groupItems.map((g: any) => g.child_product_id))];
          const { data: childProducts } = await supabase
            .from("products")
            .select("id, quantity, price")
            .in("id", childIds);

          if (childProducts) {
            const childMap: Record<string, { quantity: number; price: number }> = {};
            for (const cp of childProducts as any[]) {
              childMap[cp.id] = { quantity: cp.quantity || 0, price: Number(cp.price) || 0 };
            }
            for (const gi of groupItems as any[]) {
              const child = childMap[gi.child_product_id];
              if (!child) continue;
              const pid = gi.parent_product_id;
              if (groupStockMap[pid] === undefined) {
                groupStockMap[pid] = child.quantity;
              } else {
                groupStockMap[pid] = Math.min(groupStockMap[pid], child.quantity);
              }
              if (!groupPriceMap[pid] || child.price < groupPriceMap[pid]) {
                groupPriceMap[pid] = child.price;
              }
            }
          }
        }
      }

      setProducts(data.map(p => {
        let qty = p.quantity;
        let price = Number(p.price);

        if (p.product_type === 'variable') {
          qty = variantStockMap[p.id] ?? p.quantity;
        } else if (p.product_type === 'grouped') {
          qty = groupStockMap[p.id] ?? p.quantity;
          if ((!price || price === 0) && groupPriceMap[p.id]) {
            price = groupPriceMap[p.id];
          }
        }

        return {
          id: p.id,
          name: p.name,
          slug: (p as any).slug || undefined,
          price,
          compare_at_price: p.compare_at_price ? Number(p.compare_at_price) : null,
          images: p.images || [],
          category: p.category,
          is_active: p.is_active ?? true,
          quantity: qty,
          created_at: p.created_at,
          product_type: p.product_type,
        };
      }));
    }
    setLoading(false);
  };

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.category?.toLowerCase().includes(searchLower)
      );
    }

    // Category filter
    if (selectedCategories.length > 0) {
      result = result.filter(p => 
        selectedCategories.some(cat => 
          p.category?.toLowerCase() === cat.toLowerCase()
        )
      );
    }

    // Price filter
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Sale filter
    if (showSale) {
      result = result.filter(p => p.compare_at_price && p.compare_at_price > p.price);
    }

    // New Arrivals filter (products created in last 30 days)
    if (showNew) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      result = result.filter(p => new Date(p.created_at) > thirtyDaysAgo);
    }

    // Sorting
    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // newest - keep original order or sort by id
        break;
    }

    return result;
  }, [products, search, selectedCategories, priceRange, sortBy, showSale, showNew]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedCategories([]);
    setPriceRange([0, 10000]);
    setShowSale(false);
    setShowNew(false);
    setSortBy("newest");
  };

  const activeFilterCount = [
    search,
    selectedCategories.length > 0,
    priceRange[0] > 0 || priceRange[1] < 10000,
    showSale,
    showNew,
  ].filter(Boolean).length;

  // Convert to format expected by StoreProductCard
  const getProductForCard = (product: Product) => ({
    id: product.id,
    name: product.name,
    slug: (product as any).slug,
    price: product.price,
    compare_price: product.compare_at_price,
    image_url: product.images.length > 0 ? product.images[0] : null,
    category: product.category,
    status: product.is_active ? 'active' : 'draft',
    stock: product.quantity,
    product_type: product.product_type,
    created_at: product.created_at,
  });

  return (
    <>
      <SEOHead
        title={showSale ? "Sale Items" : showNew ? "New Arrivals" : "All Products"}
        description="Browse our collection of fashion, clothing and accessories. Filter by category, price and more."
        canonicalPath="/products"
      />
      {/* Page Header */}
      <section className="bg-gradient-to-r from-store-primary to-store-secondary py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-store-primary-foreground mb-2">
            {showSale ? "Sale Items" : showNew ? "New Arrivals" : "All Products"}
          </h1>
          <p className="text-store-primary-foreground/80">
            {filteredProducts.length} products available
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Filters Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <div className="flex items-center gap-3">
            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge className="bg-store-primary text-store-primary-foreground ml-1">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="py-6 space-y-6">
                  {/* Categories */}
                  <div>
                    <h4 className="font-medium mb-3">Categories</h4>
                    <div className="space-y-2">
                      {dbCategories.map((cat) => (
                        <label key={cat} className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={selectedCategories.includes(cat)}
                            onCheckedChange={() => toggleCategory(cat)}
                          />
                          <span>{cat}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <h4 className="font-medium mb-3">Price Range</h4>
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={10000}
                      step={100}
                      className="mb-2"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>৳{priceRange[0].toLocaleString()}</span>
                      <span>৳{priceRange[1].toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Quick Filters */}
                  <div>
                    <h4 className="font-medium mb-3">Quick Filters</h4>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={showSale}
                          onCheckedChange={(checked) => setShowSale(checked as boolean)}
                        />
                        <span>On Sale</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={showNew}
                          onCheckedChange={(checked) => setShowNew(checked as boolean)}
                        />
                        <span>New Arrivals</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={clearFilters}
                    >
                      Clear All
                    </Button>
                    <Button 
                      className="flex-1 bg-store-primary hover:bg-store-primary/90"
                      onClick={() => setFiltersOpen(false)}
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="hidden sm:flex border rounded-lg">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <LayoutList className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {search && (
              <Badge variant="secondary" className="gap-1">
                Search: {search}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setSearch("")} />
              </Badge>
            )}
            {selectedCategories.map((cat) => (
              <Badge key={cat} variant="secondary" className="gap-1">
                {cat}
                <X className="h-3 w-3 cursor-pointer" onClick={() => toggleCategory(cat)} />
              </Badge>
            ))}
            {showSale && (
              <Badge variant="secondary" className="gap-1">
                On Sale
                <X className="h-3 w-3 cursor-pointer" onClick={() => setShowSale(false)} />
              </Badge>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground"
              onClick={clearFilters}
            >
              Clear all
            </Button>
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-store-muted flex items-center justify-center">
              <Filter className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="font-display text-xl font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your filters or search terms</p>
            <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
          </div>
        ) : (
          <div className={
            viewMode === "grid" 
              ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
              : "space-y-4"
          }>
            {filteredProducts.map((product) => (
              <StoreProductCard 
                key={product.id} 
                product={getProductForCard(product)} 
                viewMode={viewMode}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
