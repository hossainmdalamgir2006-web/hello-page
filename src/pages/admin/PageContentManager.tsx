import { useState } from "react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";

import { usePageContents, PageContent } from "@/hooks/usePageContents";
import { useHomepageSections, HomepageSection } from "@/hooks/useHomepageSections";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Save, FileText, MessageSquare, Shield, Scale, Package, Ruler,
  Star, Image, HelpCircle, Phone, RotateCcw, Plus, Trash2, GripVertical,
  Layout, Megaphone, ShoppingBag, Zap, BookOpen, Mail, Truck, Grid3X3,
  Eye, EyeOff, ExternalLink, CreditCard, Lock, RefreshCw, X, Loader2
} from "lucide-react";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { toast } from "sonner";
import { CarouselSlidesManager } from "@/components/admin/CarouselSlidesManager";
import { SEOScoreIndicator } from "@/components/admin/SEOScoreIndicator";

// ===== Page Content Icons & Labels =====
const pageIcons: Record<string, React.ElementType> = {
  header: FileText,
  footer: FileText,
  faq: HelpCircle,
  contact: Phone,
  privacy: Shield,
  terms: Scale,
  returns: Package,
  "shipping-info": Package,
  "size-guide": Ruler,
  testimonials: Star,
  "promo-banners": Image,
};

const pageLabels: Record<string, string> = {
  header: "Store Header",
  footer: "Store Footer",
  faq: "FAQ Page",
  contact: "Contact Page",
  privacy: "Privacy Policy",
  terms: "Terms of Service",
  returns: "Returns & Exchange",
  "shipping-info": "Shipping Info",
  "size-guide": "Size Guide",
  testimonials: "Testimonials Section",
  "promo-banners": "Promo Banners",
};

// ===== Homepage Section Icons & Labels =====
const sectionIcons: Record<string, React.ElementType> = {
  hero: Layout, hero_carousel: Image, announcement: Megaphone, feature_bar: Truck,
  sale_banner: ShoppingBag, categories_grid: Grid3X3, new_arrivals: Package,
  promo_banners: Layout, best_sellers: Star, flash_sale: Zap, testimonials: Star,
  lookbook: BookOpen, newsletter: Mail,
};
const sectionLabels: Record<string, string> = {
  hero: "Hero Section", hero_carousel: "Hero Carousel", announcement: "Announcement Bar",
  feature_bar: "Feature Bar (Trust Badges)", sale_banner: "Sale / Promo Banner",
  categories_grid: "Categories Grid (8 Categories)", new_arrivals: "New Arrivals Section",
  promo_banners: "Promo Banners (2-up)", best_sellers: "Best Sellers Section",
  flash_sale: "Flash Sale (Countdown)", testimonials: "Testimonials",
  lookbook: "Lookbook / Style Grid", newsletter: "Newsletter Section",
};

export default function PageContentManager() {
  const { pages, loading, updatePage } = usePageContents();
  const { sections, loading: hpLoading, updateSection, toggleSection } = useHomepageSections();
  const [editingPage, setEditingPage] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const startEdit = (page: PageContent) => {
    setEditingPage(page.id);
    setEditData({
      title: page.title || "",
      subtitle: page.subtitle || "",
      content: JSON.parse(JSON.stringify(page.content)),
      is_enabled: page.is_enabled,
    });
  };

  const handleSave = async (pageId: string) => {
    setSaving(true);
    await updatePage(pageId, editData);
    setSaving(false);
    setEditingPage(null);
    setEditData(null);
  };

  const cancelEdit = () => {
    setEditingPage(null);
    setEditData(null);
  };

  if (loading || hpLoading) {
    return (
      <>
        <div className="space-y-4 p-6">
          <Skeleton className="h-8 w-64" />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Page & Content Manager</h1>
            <p className="text-sm text-muted-foreground">Manage all page content and homepage sections</p>
          </div>
          <Button variant="outline" asChild>
            <a href="/" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" /> View Store
            </a>
          </Button>
        </div>

        <Tabs defaultValue="pages">
          <TabsList className="mb-4">
            <TabsTrigger value="pages">Pages</TabsTrigger>
            <TabsTrigger value="homepage">Homepage Sections</TabsTrigger>
            <TabsTrigger value="trust-badges">Trust Badges</TabsTrigger>
          </TabsList>

          {/* ===== Pages Tab ===== */}
          <TabsContent value="pages">
            <div className="space-y-4">
              {pages.map((page) => {
                const Icon = pageIcons[page.page_slug] || FileText;
                const label = pageLabels[page.page_slug] || page.page_slug;
                const isEditing = editingPage === page.id;

                return (
                  <Card key={page.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Icon className="h-5 w-5" />
                          {label}
                          <Badge variant={page.is_enabled ? "default" : "secondary"}>
                            {page.is_enabled ? "Active" : "Disabled"}
                          </Badge>
                        </CardTitle>
                        {!isEditing ? (
                          <Button size="sm" onClick={() => startEdit(page)}>Edit</Button>
                        ) : (
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" onClick={cancelEdit}>
                              <RotateCcw className="h-4 w-4 mr-1" /> Cancel
                            </Button>
                            <Button size="sm" onClick={() => handleSave(page.id)} disabled={saving}>
                              <Save className="h-4 w-4 mr-1" /> Save
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardHeader>

                    {isEditing && editData && (
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={editData.is_enabled}
                            onCheckedChange={(v) => setEditData({ ...editData, is_enabled: v })}
                          />
                          <Label>Enabled</Label>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <Label>Page Title</Label>
                            <Input
                              value={editData.title}
                              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label>Subtitle</Label>
                            <Input
                              value={editData.subtitle}
                              onChange={(e) => setEditData({ ...editData, subtitle: e.target.value })}
                            />
                          </div>
                        </div>

                        <Separator />

                        <PageContentEditor
                          slug={page.page_slug}
                          content={editData.content}
                          onChange={(content) => setEditData({ ...editData, content })}
                        />
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* ===== Homepage Sections Tab ===== */}
          <TabsContent value="homepage">
            <div className="space-y-3">
              {sections.sort((a, b) => a.sort_order - b.sort_order).map((section) => (
                <HomepageSectionEditor key={section.id} section={section} onSave={updateSection} onToggle={toggleSection} />
              ))}
            </div>
          </TabsContent>

          {/* ===== Trust Badges Tab ===== */}
          <TabsContent value="trust-badges">
            <TrustBadgesEditor />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

// ========== Homepage Section Editor ==========
function HomepageSectionEditor({ section, onSave, onToggle }: {
  section: HomepageSection;
  onSave: (id: string, updates: Partial<HomepageSection>) => Promise<boolean>;
  onToggle: (id: string, enabled: boolean) => Promise<boolean>;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    title: section.title || "", subtitle: section.subtitle || "",
    badge_text: section.badge_text || "", image_url: section.image_url || "",
    content: section.content || {},
  });
  const [saving, setSaving] = useState(false);
  const Icon = sectionIcons[section.section_type] || Layout;
  const updateContent = (key: string, value: any) => setForm(prev => ({ ...prev, content: { ...prev.content, [key]: value } }));

  const handleSave = async () => {
    setSaving(true);
    const success = await onSave(section.id, {
      title: form.title || null, subtitle: form.subtitle || null,
      badge_text: form.badge_text || null, image_url: form.image_url || null,
      content: form.content,
    });
    if (success) setEditing(false);
    setSaving(false);
  };

  return (
    <Card className={!section.is_enabled ? "opacity-60" : ""}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10"><Icon className="h-5 w-5 text-primary" /></div>
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
            <Button variant="outline" size="sm" className="mt-2" onClick={() => setEditing(true)}>Edit Content</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Badge Text</Label><Input value={form.badge_text} onChange={(e) => setForm(p => ({ ...p, badge_text: e.target.value }))} /></div>
            </div>
            <div className="space-y-2"><Label>Subtitle</Label><Textarea value={form.subtitle} onChange={(e) => setForm(p => ({ ...p, subtitle: e.target.value }))} rows={2} /></div>
            <div className="space-y-2"><Label>Image URL</Label><Input value={form.image_url} onChange={(e) => setForm(p => ({ ...p, image_url: e.target.value }))} /></div>

            {section.section_type === "hero_carousel" && (
              <div className="border-t pt-4 space-y-4">
                <p className="text-sm font-medium text-muted-foreground">Carousel Settings</p>
                <div className="flex items-center gap-3">
                  <Switch checked={form.content.autoplay !== false} onCheckedChange={(v) => updateContent("autoplay", v)} /><Label>Auto-play</Label>
                </div>
                <div className="space-y-2"><Label>Delay (ms)</Label><Input type="number" value={form.content.autoplay_delay || 5000} onChange={(e) => updateContent("autoplay_delay", Number(e.target.value))} /></div>
                <div className="flex items-center gap-3">
                  <Switch checked={form.content.show_arrows !== false} onCheckedChange={(v) => updateContent("show_arrows", v)} /><Label>Show Arrow Navigation</Label>
                </div>
                <Separator className="my-4" />
                <CarouselSlidesManager />
              </div>
            )}

            {section.section_type === "flash_sale" && (
              <div className="border-t pt-4 space-y-3">
                <div className="space-y-2"><Label>End Date</Label><Input type="datetime-local" value={form.content.end_time || ""} onChange={(e) => updateContent("end_time", e.target.value)} /></div>
                <div className="space-y-2"><Label>Products</Label><Input type="number" value={form.content.product_count || 4} onChange={(e) => updateContent("product_count", Number(e.target.value))} min={1} max={8} /></div>
              </div>
            )}

            {(section.section_type === "hero" || section.section_type === "sale_banner") && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                <div className="space-y-2"><Label>CTA Text</Label><Input value={form.content.cta_text || ""} onChange={(e) => updateContent("cta_text", e.target.value)} /></div>
                <div className="space-y-2"><Label>CTA Link</Label><Input value={form.content.cta_link || ""} onChange={(e) => updateContent("cta_link", e.target.value)} /></div>
              </div>
            )}

            {section.section_type === "newsletter" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                <div className="space-y-2"><Label>Button Text</Label><Input value={form.content.button_text || ""} onChange={(e) => updateContent("button_text", e.target.value)} /></div>
                <div className="space-y-2"><Label>Placeholder</Label><Input value={form.content.placeholder || ""} onChange={(e) => updateContent("placeholder", e.target.value)} /></div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} disabled={saving} size="sm"><Save className="h-4 w-4 mr-1" /> {saving ? "Saving..." : "Save"}</Button>
              <Button variant="outline" size="sm" onClick={() => setEditing(false)}><RotateCcw className="h-4 w-4 mr-1" /> Cancel</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ========== Trust Badges Editor ==========
interface TrustBadge { icon: string; label: string; enabled: boolean; }

const defaultTrustBadges: TrustBadge[] = [
  { icon: "truck", label: "Free Shipping", enabled: true },
  { icon: "refresh", label: "7-Day Returns", enabled: true },
  { icon: "lock", label: "SSL Secured", enabled: true },
  { icon: "credit-card", label: "Safe Payment", enabled: true },
];

const iconOptions = [
  { value: "truck", label: "Truck (Shipping)" },
  { value: "refresh", label: "Refresh (Returns)" },
  { value: "lock", label: "Lock (Security)" },
  { value: "credit-card", label: "Credit Card (Payment)" },
  { value: "shield", label: "Shield (Protection)" },
];

function getIconComponent(iconName: string) {
  switch (iconName) {
    case "truck": return Truck;
    case "refresh": return RefreshCw;
    case "lock": return Lock;
    case "credit-card": return CreditCard;
    case "shield": return Shield;
    default: return Shield;
  }
}

function TrustBadgesEditor() {
  const { getSettingValue, updateMultipleSettings, saving } = useStoreSettings();
  const [trustBadges, setTrustBadges] = useState<TrustBadge[]>(defaultTrustBadges);
  const [localSaving, setLocalSaving] = useState(false);

  // Load from store_settings
  useState(() => {
    const badgesRaw = getSettingValue("PRODUCT_TRUST_BADGES");
    if (badgesRaw) {
      try { setTrustBadges(JSON.parse(badgesRaw)); } catch {}
    }
  });

  const handleSave = async () => {
    setLocalSaving(true);
    await updateMultipleSettings([
      { key: "PRODUCT_TRUST_BADGES", value: JSON.stringify(trustBadges) },
    ]);
    setLocalSaving(false);
  };

  const updateBadge = (index: number, field: keyof TrustBadge, value: any) => {
    setTrustBadges(prev => prev.map((b, i) => i === index ? { ...b, [field]: value } : b));
  };
  const addBadge = () => setTrustBadges(prev => [...prev, { icon: "shield", label: "New Badge", enabled: true }]);
  const removeBadge = (index: number) => setTrustBadges(prev => prev.filter((_, i) => i !== index));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-accent" />Trust Badges</CardTitle>
            <CardDescription>প্রোডাক্ট পেজে দেখানো ট্রাস্ট ব্যাজগুলো কাস্টমাইজ করুন</CardDescription>
          </div>
          <Button onClick={handleSave} disabled={localSaving || saving} size="sm" className="gap-2">
            {localSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Save
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {trustBadges.map((badge, index) => {
          const Icon = getIconComponent(badge.icon);
          return (
            <div key={index} className="flex items-center gap-3 p-3 rounded-lg border">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted shrink-0"><Icon className="h-5 w-5 text-muted-foreground" /></div>
              <select value={badge.icon} onChange={(e) => updateBadge(index, "icon", e.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
                {iconOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
              <Input value={badge.label} onChange={(e) => updateBadge(index, "label", e.target.value)} className="flex-1" placeholder="Badge label" />
              <Switch checked={badge.enabled} onCheckedChange={(v) => updateBadge(index, "enabled", v)} />
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeBadge(index)}><X className="h-4 w-4" /></Button>
            </div>
          );
        })}
        <Button variant="outline" size="sm" onClick={addBadge} className="gap-2"><Plus className="h-4 w-4" /> Add Badge</Button>
        <div className="mt-2">
          <p className="text-xs text-muted-foreground">প্রিভিউ:</p>
          <div className="grid grid-cols-4 gap-3 p-4 bg-muted rounded-lg mt-2">
            {trustBadges.filter(b => b.enabled).map((badge, i) => {
              const Icon = getIconComponent(badge.icon);
              return (<div key={i} className="text-center"><Icon className="h-5 w-5 mx-auto mb-1 text-primary" /><p className="text-[10px] font-medium">{badge.label}</p></div>);
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ========== Dynamic Page Content Editors ==========
function PageContentEditor({ slug, content, onChange }: { slug: string; content: any; onChange: (c: any) => void }) {
  switch (slug) {
    case "header": return <HeaderEditor content={content} onChange={onChange} />;
    case "footer": return <FooterEditor content={content} onChange={onChange} />;
    case "faq": return <FAQEditor content={content} onChange={onChange} />;
    case "contact": return <ContactEditor content={content} onChange={onChange} />;
    case "privacy": case "terms": return <SectionsEditor content={content} onChange={onChange} />;
    case "returns": return <ReturnsEditor content={content} onChange={onChange} />;
    case "shipping-info": return <ShippingEditor content={content} onChange={onChange} />;
    case "size-guide": return <SizeGuideEditor content={content} onChange={onChange} />;
    case "testimonials": return <TestimonialsEditor content={content} onChange={onChange} />;
    case "promo-banners": return <PromoBannersEditor content={content} onChange={onChange} />;
    default:
      return (<div><Label>Raw JSON Content</Label><Textarea rows={10} value={JSON.stringify(content, null, 2)} onChange={(e) => { try { onChange(JSON.parse(e.target.value)); } catch {} }} /></div>);
  }
}

function HeaderEditor({ content, onChange }: { content: any; onChange: (c: any) => void }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Switch checked={content.banner_enabled !== false} onCheckedChange={(v: boolean) => onChange({ ...content, banner_enabled: v })} />
        <Label>Show Top Banner</Label>
      </div>
      <div><Label>Banner Text</Label><Input value={content.banner_text || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...content, banner_text: e.target.value })} placeholder="e.g. 🔥 Free Shipping on Orders Over ৳2,000" /></div>
    </div>
  );
}

function DraggableFooterLink({ id, link, linkKey, index, updateLink, removeLink }: {
  id: string; link: any; linkKey: string; index: number;
  updateLink: (key: string, i: number, field: string, value: string) => void;
  removeLink: (key: string, i: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined, transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <div ref={setNodeRef} style={style} className="flex gap-2 items-center">
      <button type="button" className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground" {...attributes} {...listeners}>
        <GripVertical className="h-4 w-4" />
      </button>
      <Input placeholder="Label" value={link.label} onChange={(e) => updateLink(linkKey, index, "label", e.target.value)} />
      <Input placeholder="URL" value={link.url} onChange={(e) => updateLink(linkKey, index, "url", e.target.value)} />
      <Button size="icon" variant="destructive" onClick={() => removeLink(linkKey, index)}><Trash2 className="h-4 w-4" /></Button>
    </div>
  );
}

function FooterLinksList({ linkKey, links, updateLink, addLink, removeLink, onChange, content, label }: {
  linkKey: string; links: any[]; label: string;
  updateLink: (key: string, i: number, field: string, value: string) => void;
  addLink: (key: string) => void;
  removeLink: (key: string, i: number) => void;
  onChange: (c: any) => void; content: any;
}) {
  const ids = links.map((_: any, i: number) => `${linkKey}-${i}`);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = ids.indexOf(active.id as string);
    const newIndex = ids.indexOf(over.id as string);
    const reordered = arrayMove([...links], oldIndex, newIndex);
    onChange({ ...content, [linkKey]: reordered });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">{label} ({links.length})</Label>
        <Button size="sm" variant="outline" onClick={() => addLink(linkKey)}><Plus className="h-4 w-4 mr-1" /> Add</Button>
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          {links.map((link: any, i: number) => (
            <DraggableFooterLink key={ids[i]} id={ids[i]} link={link} linkKey={linkKey} index={i} updateLink={updateLink} removeLink={removeLink} />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}

function FooterEditor({ content, onChange }: { content: any; onChange: (c: any) => void }) {
  const shopLinks = content.shop_links || [];
  const helpLinks = content.help_links || [];
  const updateLink = (key: string, i: number, field: string, value: string) => { const links = [...(content[key] || [])]; links[i] = { ...links[i], [field]: value }; onChange({ ...content, [key]: links }); };
  const addLink = (key: string) => onChange({ ...content, [key]: [...(content[key] || []), { label: "", url: "" }] });
  const removeLink = (key: string, i: number) => onChange({ ...content, [key]: (content[key] || []).filter((_: any, idx: number) => idx !== i) });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div><Label>Newsletter Title</Label><Input value={content.newsletter_title || ""} onChange={(e) => onChange({ ...content, newsletter_title: e.target.value })} /></div>
        <div><Label>Newsletter Button Text</Label><Input value={content.newsletter_button || ""} onChange={(e) => onChange({ ...content, newsletter_button: e.target.value })} /></div>
      </div>
      <div><Label>Newsletter Description</Label><Textarea rows={2} value={content.newsletter_text || ""} onChange={(e) => onChange({ ...content, newsletter_text: e.target.value })} /></div>
      <div><Label>Copyright Text</Label><Input value={content.copyright_text || ""} onChange={(e) => onChange({ ...content, copyright_text: e.target.value })} /></div>
      <Separator />
      <FooterLinksList linkKey="shop_links" links={shopLinks} label="Shop Links" updateLink={updateLink} addLink={addLink} removeLink={removeLink} onChange={onChange} content={content} />
      <FooterLinksList linkKey="help_links" links={helpLinks} label="Help Links" updateLink={updateLink} addLink={addLink} removeLink={removeLink} onChange={onChange} content={content} />
    </div>
  );
}

function FAQEditor({ content, onChange }: { content: any; onChange: (c: any) => void }) {
  const faqs = content.faqs || [];
  const updateFaq = (i: number, field: string, value: string) => { const updated = [...faqs]; updated[i] = { ...updated[i], [field]: value }; onChange({ ...content, faqs: updated }); };
  const addFaq = () => onChange({ ...content, faqs: [...faqs, { question: "", answer: "" }] });
  const removeFaq = (i: number) => onChange({ ...content, faqs: faqs.filter((_: any, idx: number) => idx !== i) });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between"><Label className="text-base font-semibold">FAQ Items ({faqs.length})</Label><Button size="sm" variant="outline" onClick={addFaq}><Plus className="h-4 w-4 mr-1" /> Add FAQ</Button></div>
      <Accordion type="multiple" className="w-full">
        {faqs.map((faq: any, i: number) => (
          <AccordionItem key={i} value={`faq-${i}`}>
            <AccordionTrigger className="text-left text-sm">{faq.question || `FAQ #${i + 1}`}</AccordionTrigger>
            <AccordionContent className="space-y-3 pt-2">
              <div><Label>Question</Label><Input value={faq.question} onChange={(e) => updateFaq(i, "question", e.target.value)} /></div>
              <div><Label>Answer</Label><Textarea rows={3} value={faq.answer} onChange={(e) => updateFaq(i, "answer", e.target.value)} /></div>
              <Button size="sm" variant="destructive" onClick={() => removeFaq(i)}><Trash2 className="h-4 w-4 mr-1" /> Remove</Button>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

function ContactEditor({ content, onChange }: { content: any; onChange: (c: any) => void }) {
  const cards = content.cards || [];
  const updateCard = (i: number, field: string, value: string) => { const updated = [...cards]; updated[i] = { ...updated[i], [field]: value }; onChange({ ...content, cards: updated }); };
  return (
    <div className="space-y-4">
      <div><Label>Form Title</Label><Input value={content.form_title || ""} onChange={(e) => onChange({ ...content, form_title: e.target.value })} /></div>
      <Label className="text-base font-semibold">Contact Info Cards</Label>
      {cards.map((card: any, i: number) => (
        <Card key={i} className="p-4 space-y-2">
          <div className="grid gap-2 md:grid-cols-2">
            <div><Label>Icon</Label><Input value={card.icon} onChange={(e) => updateCard(i, "icon", e.target.value)} /></div>
            <div><Label>Title</Label><Input value={card.title} onChange={(e) => updateCard(i, "title", e.target.value)} /></div>
          </div>
          <div><Label>Text</Label><Textarea rows={2} value={card.text} onChange={(e) => updateCard(i, "text", e.target.value)} /></div>
        </Card>
      ))}
    </div>
  );
}

function SectionsEditor({ content, onChange }: { content: any; onChange: (c: any) => void }) {
  const sections = content.sections || [];
  const updateSection = (i: number, field: string, value: any) => { const updated = [...sections]; updated[i] = { ...updated[i], [field]: value }; onChange({ ...content, sections: updated }); };
  const addSection = () => onChange({ ...content, sections: [...sections, { heading: "", body: "" }] });
  const removeSection = (i: number) => onChange({ ...content, sections: sections.filter((_: any, idx: number) => idx !== i) });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between"><Label className="text-base font-semibold">Sections ({sections.length})</Label><Button size="sm" variant="outline" onClick={addSection}><Plus className="h-4 w-4 mr-1" /> Add Section</Button></div>
      <Accordion type="multiple" className="w-full">
        {sections.map((sec: any, i: number) => (
          <AccordionItem key={i} value={`sec-${i}`}>
            <AccordionTrigger className="text-left text-sm">{sec.heading || `Section #${i + 1}`}</AccordionTrigger>
            <AccordionContent className="space-y-3 pt-2">
              <div><Label>Heading</Label><Input value={sec.heading} onChange={(e) => updateSection(i, "heading", e.target.value)} /></div>
              <div><Label>Body</Label><Textarea rows={4} value={sec.body} onChange={(e) => updateSection(i, "body", e.target.value)} /></div>
              {sec.list && (<div><Label>List Items (one per line)</Label><Textarea rows={4} value={(sec.list || []).join("\n")} onChange={(e) => updateSection(i, "list", e.target.value.split("\n").filter(Boolean))} /></div>)}
              {sec.extra !== undefined && (<div><Label>Extra Text</Label><Textarea rows={2} value={sec.extra || ""} onChange={(e) => updateSection(i, "extra", e.target.value)} /></div>)}
              <Button size="sm" variant="destructive" onClick={() => removeSection(i)}><Trash2 className="h-4 w-4 mr-1" /> Remove</Button>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

function ReturnsEditor({ content, onChange }: { content: any; onChange: (c: any) => void }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div><Label>Policy Title</Label><Input value={content.policy_title || ""} onChange={(e) => onChange({ ...content, policy_title: e.target.value })} /></div>
        <div><Label>Policy Text</Label><Textarea rows={2} value={content.policy_text || ""} onChange={(e) => onChange({ ...content, policy_text: e.target.value })} /></div>
      </div>
      <div><Label>Eligible Items (one per line)</Label><Textarea rows={4} value={(content.eligible || []).join("\n")} onChange={(e) => onChange({ ...content, eligible: e.target.value.split("\n").filter(Boolean) })} /></div>
      <div><Label>Not Eligible Items (one per line)</Label><Textarea rows={4} value={(content.not_eligible || []).join("\n")} onChange={(e) => onChange({ ...content, not_eligible: e.target.value.split("\n").filter(Boolean) })} /></div>
      <div><Label>Return Steps</Label>
        {(content.steps || []).map((step: any, i: number) => (
          <Card key={i} className="p-3 mt-2 space-y-2">
            <Input value={step.title} onChange={(e) => { const steps = [...(content.steps || [])]; steps[i] = { ...steps[i], title: e.target.value }; onChange({ ...content, steps }); }} placeholder="Step title" />
            <Textarea rows={2} value={step.text} onChange={(e) => { const steps = [...(content.steps || [])]; steps[i] = { ...steps[i], text: e.target.value }; onChange({ ...content, steps }); }} placeholder="Step description" />
          </Card>
        ))}
      </div>
      <div><Label>Exchange Text</Label><Textarea rows={3} value={content.exchange_text || ""} onChange={(e) => onChange({ ...content, exchange_text: e.target.value })} /></div>
      <div><Label>Refund Info (one per line)</Label><Textarea rows={4} value={(content.refund_info || []).join("\n")} onChange={(e) => onChange({ ...content, refund_info: e.target.value.split("\n").filter(Boolean) })} /></div>
    </div>
  );
}

function ShippingEditor({ content, onChange }: { content: any; onChange: (c: any) => void }) {
  const updateListItem = (key: string, i: number, field: string, value: string) => { const list = [...(content[key] || [])]; list[i] = { ...list[i], [field]: value }; onChange({ ...content, [key]: list }); };
  return (
    <div className="space-y-4">
      <Label className="text-base font-semibold">Delivery Options</Label>
      {(content.delivery_options || []).map((opt: any, i: number) => (
        <div key={i} className="grid gap-2 md:grid-cols-2">
          <Input value={opt.title} onChange={(e) => updateListItem("delivery_options", i, "title", e.target.value)} placeholder="Title" />
          <Input value={opt.text} onChange={(e) => updateListItem("delivery_options", i, "text", e.target.value)} placeholder="Details" />
        </div>
      ))}
      <Label className="text-base font-semibold">Delivery Areas</Label>
      {(content.delivery_areas || []).map((area: any, i: number) => (
        <div key={i} className="grid gap-2 md:grid-cols-2">
          <Input value={area.title} onChange={(e) => updateListItem("delivery_areas", i, "title", e.target.value)} placeholder="Area" />
          <Input value={area.text} onChange={(e) => updateListItem("delivery_areas", i, "text", e.target.value)} placeholder="Details" />
        </div>
      ))}
      <div><Label>Processing Text</Label><Textarea rows={3} value={content.processing_text || ""} onChange={(e) => onChange({ ...content, processing_text: e.target.value })} /></div>
      <div><Label>Tracking Text</Label><Textarea rows={3} value={content.tracking_text || ""} onChange={(e) => onChange({ ...content, tracking_text: e.target.value })} /></div>
      <div><Label>Important Notes (one per line)</Label><Textarea rows={4} value={(content.notes || []).join("\n")} onChange={(e) => onChange({ ...content, notes: e.target.value.split("\n").filter(Boolean) })} /></div>
    </div>
  );
}

function SizeGuideEditor({ content, onChange }: { content: any; onChange: (c: any) => void }) {
  return (
    <div className="space-y-4">
      <Label className="text-base font-semibold">Men's Sizes (JSON)</Label>
      <Textarea rows={6} value={JSON.stringify(content.mens_sizes || [], null, 2)} onChange={(e) => { try { onChange({ ...content, mens_sizes: JSON.parse(e.target.value) }); } catch {} }} />
      <Label className="text-base font-semibold">Women's Sizes (JSON)</Label>
      <Textarea rows={6} value={JSON.stringify(content.womens_sizes || [], null, 2)} onChange={(e) => { try { onChange({ ...content, womens_sizes: JSON.parse(e.target.value) }); } catch {} }} />
      <Label className="text-base font-semibold">How to Measure</Label>
      {(content.how_to_measure || []).map((item: any, i: number) => (
        <div key={i} className="grid gap-2 md:grid-cols-2">
          <Input value={item.title} onChange={(e) => { const list = [...(content.how_to_measure || [])]; list[i] = { ...list[i], title: e.target.value }; onChange({ ...content, how_to_measure: list }); }} />
          <Input value={item.text} onChange={(e) => { const list = [...(content.how_to_measure || [])]; list[i] = { ...list[i], text: e.target.value }; onChange({ ...content, how_to_measure: list }); }} />
        </div>
      ))}
      <div><Label>Tips (one per line)</Label><Textarea rows={4} value={(content.tips || []).join("\n")} onChange={(e) => onChange({ ...content, tips: e.target.value.split("\n").filter(Boolean) })} /></div>
    </div>
  );
}

function TestimonialsEditor({ content, onChange }: { content: any; onChange: (c: any) => void }) {
  const testimonials = content.testimonials || [];
  const update = (i: number, field: string, value: any) => { const updated = [...testimonials]; updated[i] = { ...updated[i], [field]: value }; onChange({ ...content, testimonials: updated }); };
  const add = () => onChange({ ...content, testimonials: [...testimonials, { name: "", role: "", avatar: "", rating: 5, review: "" }] });
  const remove = (i: number) => onChange({ ...content, testimonials: testimonials.filter((_: any, idx: number) => idx !== i) });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between"><Label className="text-base font-semibold">Testimonials ({testimonials.length})</Label><Button size="sm" variant="outline" onClick={add}><Plus className="h-4 w-4 mr-1" /> Add</Button></div>
      {testimonials.map((t: any, i: number) => (
        <Card key={i} className="p-4 space-y-2">
          <div className="grid gap-2 md:grid-cols-3">
            <Input placeholder="Name" value={t.name} onChange={(e) => update(i, "name", e.target.value)} />
            <Input placeholder="Role" value={t.role} onChange={(e) => update(i, "role", e.target.value)} />
            <Input placeholder="Rating" type="number" min={1} max={5} value={t.rating} onChange={(e) => update(i, "rating", parseInt(e.target.value) || 5)} />
          </div>
          <Textarea rows={2} placeholder="Review" value={t.review} onChange={(e) => update(i, "review", e.target.value)} />
          <Button size="sm" variant="destructive" onClick={() => remove(i)}><Trash2 className="h-4 w-4 mr-1" /> Remove</Button>
        </Card>
      ))}
    </div>
  );
}

function PromoBannersEditor({ content, onChange }: { content: any; onChange: (c: any) => void }) {
  const banners = content.banners || [];
  const update = (i: number, field: string, value: string) => { const updated = [...banners]; updated[i] = { ...updated[i], [field]: value }; onChange({ ...content, banners: updated }); };

  return (
    <div className="space-y-3">
      <Label className="text-base font-semibold">Banners ({banners.length})</Label>
      {banners.map((b: any, i: number) => (
        <Card key={i} className="p-4 space-y-2">
          <div className="grid gap-2 md:grid-cols-2">
            <Input placeholder="Badge" value={b.badge || ""} onChange={(e) => update(i, "badge", e.target.value)} />
            <Input placeholder="Title" value={b.title} onChange={(e) => update(i, "title", e.target.value)} />
          </div>
          <Input placeholder="Subtitle" value={b.subtitle || ""} onChange={(e) => update(i, "subtitle", e.target.value)} />
          <div className="grid gap-2 md:grid-cols-2">
            <Input placeholder="CTA Text" value={b.cta_text || ""} onChange={(e) => update(i, "cta_text", e.target.value)} />
            <Input placeholder="CTA Link" value={b.cta_link || ""} onChange={(e) => update(i, "cta_link", e.target.value)} />
          </div>
          <Input placeholder="Image URL" value={b.image} onChange={(e) => update(i, "image", e.target.value)} />
          <Input placeholder="Overlay color" value={b.overlay || ""} onChange={(e) => update(i, "overlay", e.target.value)} />
        </Card>
      ))}
    </div>
  );
}
