import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface FeaturedProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_at_price: number | null;
  images: string[];
  category: string | null;
  created_at: string;
}

async function fetchFeaturedProducts(limit: number): Promise<FeaturedProduct[]> {
  // First try featured products
  let { data, error } = await supabase
    .from("products")
    .select("id, name, slug, price, compare_at_price, images, category, created_at")
    .eq("is_active", true)
    .is("deleted_at", null)
    .eq("is_featured", true)
    .limit(limit);

  // Fallback to newest
  if (!error && (!data || data.length === 0)) {
    const fallback = await supabase
      .from("products")
      .select("id, name, slug, price, compare_at_price, images, category, created_at")
      .eq("is_active", true)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(limit);
    data = fallback.data;
    error = fallback.error;
  }

  if (error || !data) return [];

  return data.map((p) => ({
    id: p.id,
    name: p.name,
    slug: (p as any).slug || "",
    price: Number(p.price),
    compare_at_price: p.compare_at_price ? Number(p.compare_at_price) : null,
    // Filter out base64 images to reduce memory usage; keep only URL-based images
    images: (p.images || []).filter((img: string) => typeof img === 'string' && !img.startsWith('data:')).slice(0, 2),
    category: p.category,
    created_at: p.created_at,
  }));
}

export function useFeaturedProducts(limit: number = 8) {
  const { data: products = [], isLoading: loading, refetch } = useQuery({
    queryKey: ["featured-products", limit],
    queryFn: () => fetchFeaturedProducts(limit),
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  const isNewProduct = (createdAt: string) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return new Date(createdAt) > thirtyDaysAgo;
  };

  return { products, loading, isNewProduct, refetch };
}
