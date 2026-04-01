import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Truck, Shield, RefreshCw, Headphones, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

import { SEOHead } from "@/components/SEOHead";
import { useFeaturedProducts } from "@/hooks/useFeaturedProducts";
import { FeaturedProductCard } from "@/components/store/FeaturedProductCard";
import { FeaturedProductsSkeleton } from "@/components/store/FeaturedProductsSkeleton";
import { useHomepageSections } from "@/hooks/useHomepageSections";
import { HeroCarousel } from "@/components/store/HeroCarousel";
import { CategoryGrid } from "@/components/store/CategoryGrid";
import { NewArrivalsSection } from "@/components/store/NewArrivalsSection";
import { PromoBannerSection } from "@/components/store/PromoBannerSection";
import { FlashSaleSection } from "@/components/store/FlashSaleSection";
import { TestimonialsSection } from "@/components/store/TestimonialsSection";
import { BrandMarquee } from "@/components/store/BrandMarquee";
import { TrendingProductsSection } from "@/components/store/TrendingProductsSection";
import { RecentlyViewedCarousel } from "@/components/store/RecentlyViewedCarousel";
import {
  WaveDivider,
  ZigzagDivider,
  SlantDivider,
  CurveDivider,
  DoubleWaveDivider,
  TiltCurveDivider,
  ScallopDivider,
  ArrowDivider,
} from "@/components/store/SectionDividers";

import { useSiteTitle } from "@/components/DynamicTitleProvider";
import { useLanguage } from "@/contexts/LanguageContext";

const iconMap: Record<string, React.ElementType> = {
  Truck, Shield, RefreshCw, Headphones,
};

export default function StoreHome() {
  const { products, loading: productsLoading, isNewProduct } = useFeaturedProducts(8);
  const { getSection, loading: cmsLoading } = useHomepageSections();
  const { storeName } = useSiteTitle();
  const { t } = useLanguage();
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterLoading, setNewsletterLoading] = useState(false);

  const defaultFeatures = [
    { icon: "Truck", title: t('store.freeShipping'), desc: t('store.freeShippingDesc') },
    { icon: "Shield", title: t('store.securePayment'), desc: t('store.securePaymentDesc') },
    { icon: "RefreshCw", title: t('store.easyReturns'), desc: t('store.easyReturnsDesc') },
    { icon: "Headphones", title: t('store.support247'), desc: t('store.support247Desc') },
  ];

  const handleNewsletterSubmit = async () => {
    if (!newsletterEmail || !newsletterEmail.includes("@")) {
      toast.error(t('store.validEmail'));
      return;
    }
    setNewsletterLoading(true);
    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert({ email: newsletterEmail, source: "homepage" });
      if (error) {
        if (error.code === "23505") {
          toast.info(t('store.alreadySubscribed'));
        } else throw error;
      } else {
        toast.success(t('store.subscribedSuccess'));
        setNewsletterEmail("");
      }
    } catch {
      toast.error(t('store.subscribeFailed'));
    } finally {
      setNewsletterLoading(false);
    }
  };

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: storeName,
    url: window.location.origin,
  };

  const heroCarousel = getSection("hero_carousel");
  const featureBar = getSection("feature_bar");
  const categoriesGrid = getSection("categories_grid");
  const newArrivals = getSection("new_arrivals");
  const promoBanners = getSection("promo_banners");
  const bestSellers = getSection("best_sellers");
  const flashSale = getSection("flash_sale");
  const testimonials = getSection("testimonials");
  const newsletter = getSection("newsletter");

  const features = featureBar?.content?.features || defaultFeatures;
  const isEnabled = (s: ReturnType<typeof getSection>) => !s || s.is_enabled !== false;

  return (
    <>
      <SEOHead
        description="Shop the latest fashion, clothing and accessories online."
        canonicalPath="/"
        jsonLd={orgJsonLd}
      />

      {/* 1. Hero Carousel */}
      {isEnabled(heroCarousel) && (
        <HeroCarousel
          autoplay={heroCarousel?.content?.autoplay !== false}
          autoplayDelay={heroCarousel?.content?.autoplay_delay || 5000}
          showArrows={heroCarousel?.content?.show_arrows !== false}
        />
      )}

      {/* ── Divider: Hero → Feature Bar ── */}
      <WaveDivider fillClass="fill-store-card" />

      {/* 2. Trust / Features Bar */}
      {isEnabled(featureBar) && (
        <section className="bg-store-card py-5 border-b border-store-muted/50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {features.map((feature: any) => {
                const FeatureIcon = iconMap[feature.icon] || Truck;
                return (
                  <div key={feature.title} className="flex items-center gap-3 group cursor-default">
                    <div className="w-11 h-11 rounded-full bg-store-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-store-primary/20 transition-colors duration-300 group-hover:animate-[bounce_0.6s_ease-in-out]">
                      <FeatureIcon className="h-5 w-5 text-store-primary group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{feature.title}</p>
                      
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Divider: Feature Bar → Brand Marquee ── */}
      <ZigzagDivider fillClass="fill-store-background" />

      {/* 3. Brand Logos Marquee */}
      <BrandMarquee />

      {/* ── Divider: Brand Marquee → Categories ── */}
      <SlantDivider fillClass="fill-store-background" direction="right" />

      {/* 4. Categories Grid */}
      {isEnabled(categoriesGrid) && (
        <CategoryGrid
          title={categoriesGrid?.title || t('store.shopByCategory')}
          subtitle={categoriesGrid?.subtitle || undefined}
          categories={categoriesGrid?.content?.categories}
        />
      )}

      {/* ── Divider: Categories → New Arrivals ── */}
      <CurveDivider fillClass="fill-store-card" />

      {/* 5. New Arrivals */}
      {isEnabled(newArrivals) && (
        <NewArrivalsSection
          title={newArrivals?.title || t('store.newArrivals')}
          subtitle={newArrivals?.subtitle || undefined}
          badge={newArrivals?.badge_text || t('store.new')}
          count={newArrivals?.content?.product_count || 8}
        />
      )}

      {/* ── Divider: New Arrivals → Promo Banners ── */}
      <DoubleWaveDivider fillClass="fill-store-background" accentClass="fill-store-primary/5" />

      {/* 6. Promo Banners */}
      {isEnabled(promoBanners) && (
        <PromoBannerSection banners={promoBanners?.content?.banners} />
      )}

      {/* ── Divider: Promo → Trending ── */}
      <TiltCurveDivider fillClass="fill-store-background" />

      {/* 7. Trending Products */}
      <TrendingProductsSection count={4} />

      {/* ── Divider: Trending → Best Sellers ── */}
      <ScallopDivider fillClass="fill-store-muted" />

      {/* 8. Best Sellers / Featured Products */}
      {isEnabled(bestSellers) && (
        <section className="py-16 bg-store-muted">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
              <div>
                {bestSellers?.badge_text && (
                  <Badge className="bg-store-secondary/15 text-store-secondary border-0 text-xs uppercase tracking-wider mb-2">
                    {bestSellers.badge_text}
                  </Badge>
                )}
                <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                  {bestSellers?.title || t('store.bestSellers')}
                </h2>
                {bestSellers?.subtitle && (
                  <p className="text-muted-foreground mt-1">{bestSellers.subtitle}</p>
                )}
              </div>
              <Button variant="outline" asChild>
                <Link to="/products">
                  {t('store.viewAll')} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            {productsLoading ? (
              <FeaturedProductsSkeleton />
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">{t('store.noProductsYet')}</p>
                <Button asChild className="mt-4">
                  <Link to="/products">{t('store.browseAllProducts')}</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {products.slice(0, 8).map((product) => (
                  <FeaturedProductCard
                    key={product.id}
                    product={product}
                    isNew={isNewProduct(product.created_at)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Divider: Best Sellers → Flash Sale ── */}
      <ArrowDivider fillClass="fill-store-primary" />

      {/* 9. Flash Sale */}
      {isEnabled(flashSale) && (
        <FlashSaleSection
          title={flashSale?.title || t('store.flashSale')}
          subtitle={flashSale?.subtitle || undefined}
          badge={flashSale?.badge_text || `⚡ ${t('store.flashSale')}`}
          endTime={flashSale?.content?.end_time || null}
          count={flashSale?.content?.product_count || 4}
        />
      )}

      {/* ── Divider: Flash Sale → Testimonials ── */}
      <WaveDivider fillClass="fill-store-muted" flip />

      {/* 10. Testimonials */}
      {isEnabled(testimonials) && (
        <TestimonialsSection
          title={testimonials?.title || t('store.whatCustomersSay')}
          subtitle={testimonials?.subtitle || undefined}
          testimonials={testimonials?.content?.testimonials}
        />
      )}

      {/* ── Divider: Testimonials → Recently Viewed ── */}
      <SlantDivider fillClass="fill-store-background" direction="left" />

      {/* 11. Recently Viewed */}
      <RecentlyViewedCarousel />

      {/* ── Divider: Recently Viewed → Newsletter ── */}
      <CurveDivider fillClass="fill-store-primary" />

      {/* 12. Newsletter */}
      {isEnabled(newsletter) && (
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-store-primary via-store-primary/90 to-store-highlight" />
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
          
          <div className="container mx-auto px-4 text-center max-w-2xl relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center mx-auto mb-6 border border-white/20">
              <Mail className="h-8 w-8 text-white" />
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">
              {newsletter?.title || t('store.stayInLoop')}
            </h2>
            <p className="text-white/70 mb-8 text-lg">
              {newsletter?.subtitle || t('store.newsletterSubtitle')}
            </p>
            <form
              onSubmit={(e) => { e.preventDefault(); handleNewsletterSubmit(); }}
              className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
            >
              <Input
                type="email"
                placeholder={newsletter?.content?.placeholder || t('store.enterYourEmail')}
                className="flex-1 h-12 bg-white/15 border-white/20 text-white placeholder:text-white/50 backdrop-blur-sm focus:bg-white/25"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                disabled={newsletterLoading}
              />
              <Button
                type="submit"
                size="lg"
                className="h-12 px-8 bg-white text-store-primary hover:bg-white/90 font-semibold"
                disabled={newsletterLoading}
              >
                {newsletterLoading ? "..." : newsletter?.content?.button_text || t('store.subscribe')}
              </Button>
            </form>
            <p className="text-white/40 text-xs mt-4">Join 5,000+ subscribers. No spam, unsubscribe anytime.</p>
          </div>
        </section>
      )}
    </>
  );
}
