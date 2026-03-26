import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/contexts/LanguageContext";

interface Category {
  name: string;
  slug: string;
  image: string;
  href: string;
}

interface CategoryGridProps {
  title?: string;
  subtitle?: string;
  categories?: Category[];
}

const defaultImage = "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=800&fit=crop";

export function CategoryGrid({ title, subtitle, categories }: CategoryGridProps) {
  const { t } = useLanguage();
  const displayTitle = title || t('categoryGrid.shopByCategory');
  const [dbCategories, setDbCategories] = useState<Category[]>([]);

  useEffect(() => {
    if (categories && categories.length > 0) {
      setLoading(false);
      return;
    }

    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('name, slug, image_url')
          .eq('is_active', true)
          .is('deleted_at', null)
          .is('parent_id', null)
          .order('sort_order', { ascending: true });

        if (error) throw error;

        const mapped = ((data as any[]) || []).map((cat) => ({
          name: cat.name,
          slug: cat.slug,
          image: cat.image_url || defaultImage,
          href: `/products?category=${cat.slug}`,
        }));
        setDbCategories(mapped);
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [categories]);

  const cats = categories && categories.length > 0 ? categories : dbCategories;

  return (
    <section className="py-16 bg-store-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3 relative inline-block">
            {title}
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-16 h-1 rounded-full bg-store-primary" />
          </h2>
          {subtitle && (
            <p className="text-muted-foreground max-w-md mx-auto mt-4">{subtitle}</p>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
            ))}
          </div>
        ) : cats.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No categories available yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
            {cats.map((cat, i) => (
              <Link
                key={cat.slug}
                to={cat.href}
                className="group relative overflow-hidden rounded-2xl aspect-[3/4] block"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent transition-opacity duration-300" />
                <div className="absolute inset-0 bg-store-primary/0 group-hover:bg-store-primary/20 transition-all duration-300" />
                <div className="absolute bottom-0 inset-x-0 p-4 text-white">
                  <h3 className="font-display text-lg md:text-xl font-bold leading-tight mb-1">
                    {cat.name}
                  </h3>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-store-accent opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                    Shop Now <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-300" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
