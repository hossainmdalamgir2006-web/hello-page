import { useState } from "react";

import { useHomepageSections, HomepageSection } from "@/hooks/useHomepageSections";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Eye, EyeOff, Save, RotateCcw, ExternalLink,
  Layout, Megaphone, ShoppingBag, Star, Mail, Truck,
  Image, Grid3X3, Zap, BookOpen, Package
} from "lucide-react";
import { CarouselSlidesManager } from "@/components/admin/CarouselSlidesManager";

const sectionIcons: Record<string, React.ElementType> = {
  hero: Layout,
  hero_carousel: Image,
  announcement: Megaphone,
  feature_bar: Truck,
  sale_banner: ShoppingBag,
  categories_grid: Grid3X3,
  new_arrivals: Package,
  promo_banners: Layout,
  best_sellers: Star,
  flash_sale: Zap,
  testimonials: Star,
  lookbook: BookOpen,
  newsletter: Mail,
};

const sectionLabels: Record<string, string> = {
  hero: "Hero Section",
  hero_carousel: "Hero Carousel",
  announcement: "Announcement Bar",
  feature_bar: "Feature Bar (Trust Badges)",
  sale_banner: "Sale / Promo Banner",
  categories_grid: "Categories Grid (8 Categories)",
  new_arrivals: "New Arrivals Section",
  promo_banners: "Promo Banners (2-up)",
  best_sellers: "Best Sellers Section",
  flash_sale: "Flash Sale (Countdown)",
  testimonials: "Testimonials",
  lookbook: "Lookbook / Style Grid",
  newsletter: "Newsletter Section",
};

const sectionGroups = {
  "Hero & Navigation": ["hero_carousel", "announcement"],
  "Product Sections": ["categories_grid", "new_arrivals", "best_sellers", "flash_sale"],
  "Marketing": ["promo_banners", "testimonials", "lookbook", "sale_banner"],
  "Other": ["feature_bar", "newsletter", "hero"],
};

function SectionEditor({ section, onSave, onToggle }: {
  section: HomepageSection;
  onSave: (id: string, updates: Partial<HomepageSection>) => Promise<boolean>;
  onToggle: (id: string, enabled: boolean) => Promise<boolean>;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    title: section.title || "",
    subtitle: section.subtitle || "",
    badge_text: section.badge_text || "",
    image_url: section.image_url || "",
    content: section.content || {},
  });
  const [saving, setSaving] = useState(false);

  const Icon = sectionIcons[section.section_type] || Layout;

  const handleSave = async () => {
    setSaving(true);
    const success = await onSave(section.id, {
      title: form.title || null,
      subtitle: form.subtitle || null,
      badge_text: form.badge_text || null,
      image_url: form.image_url || null,
      content: form.content,
    });
    if (success) setEditing(false);
    setSaving(false);
  };

  const handleReset = () => {
    setForm({
      title: section.title || "",
      subtitle: section.subtitle || "",
      badge_text: section.badge_text || "",
      image_url: section.image_url || "",
      content: section.content || {},
    });
    setEditing(false);
  };

  const updateContent = (key: string, value: any) => {
    setForm(prev => ({ ...prev, content: { ...prev.content, [key]: value } }));
  };

  return (
    <Card className={!section.is_enabled ? "opacity-60" : ""}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">{sectionLabels[section.section_type] || section.section_type}</CardTitle>
            <CardDescription className="text-xs mt-0.5">Sort: {section.sort_order}</CardDescription>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={section.is_enabled ? "default" : "secondary"} className="text-xs">
            {section.is_enabled ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
            {section.is_enabled ? "Visible" : "Hidden"}
          </Badge>
          <Switch checked={section.is_enabled} onCheckedChange={(c) => onToggle(section.id, c)} />
        </div>
      </CardHeader>
      <CardContent>
        {!editing ? (
          <div className="space-y-2">
            {section.title && <p className="text-sm"><span className="font-medium">Title:</span> {section.title}</p>}
            {section.subtitle && <p className="text-sm text-muted-foreground line-clamp-1">{section.subtitle}</p>}
            {section.badge_text && <Badge variant="outline" className="text-xs">{section.badge_text}</Badge>}
            <Button variant="outline" size="sm" className="mt-2" onClick={() => setEditing(true)}>
              Edit Content
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Badge Text</Label>
                <Input value={form.badge_text} onChange={(e) => setForm(p => ({ ...p, badge_text: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Subtitle</Label>
              <Textarea value={form.subtitle} onChange={(e) => setForm(p => ({ ...p, subtitle: e.target.value }))} rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input value={form.image_url} onChange={(e) => setForm(p => ({ ...p, image_url: e.target.value }))} placeholder="https://..." />
            </div>

            {/* Section-specific fields */}
            {section.section_type === "hero_carousel" && (
              <div className="border-t pt-4 space-y-3">
                <p className="text-sm font-medium text-muted-foreground">Carousel Settings</p>
                <div className="flex items-center gap-3">
                  <Switch checked={form.content.autoplay !== false} onCheckedChange={(v) => updateContent("autoplay", v)} />
                  <Label>Auto-play slides</Label>
                </div>
                <div className="space-y-2">
                  <Label>Auto-play Delay (ms)</Label>
                  <Input type="number" value={form.content.autoplay_delay || 5000} onChange={(e) => updateContent("autoplay_delay", Number(e.target.value))} />
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={form.content.show_arrows !== false} onCheckedChange={(v) => updateContent("show_arrows", v)} />
                  <Label>Show Arrow Navigation</Label>
                </div>
                <p className="text-xs text-muted-foreground">📝 Manage individual slides from the <strong>Carousel Slides</strong> tab above.</p>
              </div>
            )}

            {section.section_type === "flash_sale" && (
              <div className="border-t pt-4 space-y-3">
                <p className="text-sm font-medium text-muted-foreground">Flash Sale Settings</p>
                <div className="space-y-2">
                  <Label>End Date & Time</Label>
                  <Input type="datetime-local" value={form.content.end_time || ""} onChange={(e) => updateContent("end_time", e.target.value)} />
                  <p className="text-xs text-muted-foreground">Leave empty to show without countdown timer</p>
                </div>
                <div className="space-y-2">
                  <Label>Number of Products</Label>
                  <Input type="number" value={form.content.product_count || 4} onChange={(e) => updateContent("product_count", Number(e.target.value))} min={1} max={8} />
                </div>
              </div>
            )}

            {(section.section_type === "hero" || section.section_type === "sale_banner") && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                <div className="space-y-2">
                  <Label>CTA Button Text</Label>
                  <Input value={form.content.cta_text || ""} onChange={(e) => updateContent("cta_text", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>CTA Link</Label>
                  <Input value={form.content.cta_link || ""} onChange={(e) => updateContent("cta_link", e.target.value)} />
                </div>
                {section.section_type === "hero" && (
                  <>
                    <div className="space-y-2">
                      <Label>Secondary Button Text</Label>
                      <Input value={form.content.secondary_cta_text || ""} onChange={(e) => updateContent("secondary_cta_text", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Secondary Button Link</Label>
                      <Input value={form.content.secondary_cta_link || ""} onChange={(e) => updateContent("secondary_cta_link", e.target.value)} />
                    </div>
                  </>
                )}
              </div>
            )}

            {section.section_type === "newsletter" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                <div className="space-y-2">
                  <Label>Button Text</Label>
                  <Input value={form.content.button_text || ""} onChange={(e) => updateContent("button_text", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Placeholder Text</Label>
                  <Input value={form.content.placeholder || ""} onChange={(e) => updateContent("placeholder", e.target.value)} />
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} disabled={saving} size="sm">
                <Save className="h-4 w-4 mr-1" /> {saving ? "Saving..." : "Save"}
              </Button>
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-1" /> Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function HomepageManager() {
  const { sections, loading, updateSection, toggleSection } = useHomepageSections();

  const getSectionsByGroup = (groupKeys: string[]) =>
    sections.filter(s => groupKeys.includes(s.section_type)).sort((a, b) => a.sort_order - b.sort_order);

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Homepage Manager</h1>
            <p className="text-muted-foreground">Control every section of your store homepage</p>
          </div>
          <Button variant="outline" asChild>
            <a href="/" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" /> View Store
            </a>
          </Button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
                <CardContent><Skeleton className="h-16 w-full" /></CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Tabs defaultValue="sections">
            <TabsList className="mb-6">
              <TabsTrigger value="sections">All Sections</TabsTrigger>
              <TabsTrigger value="slides">Carousel Slides</TabsTrigger>
              <TabsTrigger value="hero">Hero & Nav</TabsTrigger>
              <TabsTrigger value="products">Product Sections</TabsTrigger>
              <TabsTrigger value="marketing">Marketing</TabsTrigger>
            </TabsList>

            <TabsContent value="sections">
              <div className="space-y-3">
                {sections.map((section) => (
                  <SectionEditor key={section.id} section={section} onSave={updateSection} onToggle={toggleSection} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="slides">
              <CarouselSlidesManager />
            </TabsContent>

            <TabsContent value="hero">
              <div className="space-y-3">
                {getSectionsByGroup(["hero_carousel", "announcement", "feature_bar", "hero"]).map((section) => (
                  <SectionEditor key={section.id} section={section} onSave={updateSection} onToggle={toggleSection} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="products">
              <div className="space-y-3">
                {getSectionsByGroup(["categories_grid", "new_arrivals", "best_sellers", "flash_sale"]).map((section) => (
                  <SectionEditor key={section.id} section={section} onSave={updateSection} onToggle={toggleSection} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="marketing">
              <div className="space-y-3">
                {getSectionsByGroup(["promo_banners", "testimonials", "lookbook", "sale_banner", "newsletter"]).map((section) => (
                  <SectionEditor key={section.id} section={section} onSave={updateSection} onToggle={toggleSection} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </>
  );
}
