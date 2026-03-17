import { useState } from "react";

import { useSiteThemeSettings } from "@/hooks/useSiteThemeSettings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Palette, Type, Square, PanelLeft, LayoutDashboard, ShoppingBag, FormInput, Tag, Navigation, Layers, Bell, BarChart3, Grid3X3, Code, Image, Save, RotateCcw, Wand2 } from "lucide-react";
import { ThemePresets } from "@/components/admin/ThemePresets";

const GOOGLE_FONTS = [
  "Inter", "Poppins", "Roboto", "Open Sans", "Lato", "Montserrat", "Raleway",
  "Nunito", "Playfair Display", "Merriweather", "Source Sans Pro", "Ubuntu",
  "Noto Sans", "Oswald", "Quicksand", "Work Sans", "DM Sans", "Outfit",
  "Space Grotesk", "Sora", "Lexend", "Figtree", "Geist"
];

export default function AppearanceManager() {
  const { settings, loading, saving, getValue, updateMultiple } = useSiteThemeSettings();
  const [localValues, setLocalValues] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState("colors");

  const getVal = (key: string) => localValues[key] ?? getValue(key);
  const setVal = (key: string, value: string) => setLocalValues(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    const updates = Object.entries(localValues).map(([key, value]) => ({ key, value }));
    if (updates.length === 0) return;
    const success = await updateMultiple(updates);
    if (success) {
      setLocalValues({});
      // Reload to apply theme changes
      setTimeout(() => window.location.reload(), 500);
    }
  };

  const handleReset = () => setLocalValues({});

  const hasChanges = Object.keys(localValues).length > 0;

  // HSL color input helper
  const ColorField = ({ label, settingKey, description }: { label: string; settingKey: string; description?: string }) => {
    const hslValue = getVal(settingKey);
    // Convert HSL string to a hex-like preview
    const previewStyle = hslValue ? { backgroundColor: `hsl(${hslValue})` } : {};
    
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">{label}</Label>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg border border-border shrink-0" style={previewStyle} />
          <Input
            value={hslValue}
            onChange={(e) => setVal(settingKey, e.target.value)}
            placeholder="222 47% 20%"
            className="flex-1"
          />
        </div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
    );
  };

  const NumberField = ({ label, settingKey, suffix, description }: { label: string; settingKey: string; suffix?: string; description?: string }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={getVal(settingKey)}
          onChange={(e) => setVal(settingKey, e.target.value)}
          className="flex-1"
        />
        {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
      </div>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </div>
  );

  const TextField = ({ label, settingKey, description }: { label: string; settingKey: string; description?: string }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <Input
        value={getVal(settingKey)}
        onChange={(e) => setVal(settingKey, e.target.value)}
        className="flex-1"
      />
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </div>
  );

  const SelectField = ({ label, settingKey, options, description }: { label: string; settingKey: string; options: { value: string; label: string }[]; description?: string }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <Select value={getVal(settingKey)} onValueChange={(v) => setVal(settingKey, v)}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          {options.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
        </SelectContent>
      </Select>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </div>
  );

  const SwitchField = ({ label, settingKey, description }: { label: string; settingKey: string; description?: string }) => (
    <div className="flex items-center justify-between">
      <div>
        <Label className="text-sm font-medium">{label}</Label>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <Switch
        checked={getVal(settingKey) === 'true'}
        onCheckedChange={(checked) => setVal(settingKey, checked ? 'true' : 'false')}
      />
    </div>
  );

  if (loading) {
    return (
      <>
        <div className="space-y-6 p-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Appearance Manager</h1>
            <p className="text-sm text-muted-foreground">Customize your store's complete look and feel</p>
          </div>
          <div className="flex items-center gap-3">
            {hasChanges && (
              <Button variant="outline" onClick={handleReset} disabled={saving}>
                <RotateCcw className="h-4 w-4 mr-2" /> Reset
              </Button>
            )}
            <Button onClick={handleSave} disabled={!hasChanges || saving}>
              <Save className="h-4 w-4 mr-2" /> {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex flex-wrap h-auto gap-1 bg-muted p-1">
            <TabsTrigger value="colors" className="gap-1.5"><Palette className="h-3.5 w-3.5" />Colors</TabsTrigger>
            <TabsTrigger value="buttons" className="gap-1.5"><Square className="h-3.5 w-3.5" />Buttons</TabsTrigger>
            <TabsTrigger value="typography" className="gap-1.5"><Type className="h-3.5 w-3.5" />Typography</TabsTrigger>
            <TabsTrigger value="sidebar" className="gap-1.5"><PanelLeft className="h-3.5 w-3.5" />Sidebar</TabsTrigger>
            <TabsTrigger value="header" className="gap-1.5"><LayoutDashboard className="h-3.5 w-3.5" />Header</TabsTrigger>
            <TabsTrigger value="cards" className="gap-1.5"><Layers className="h-3.5 w-3.5" />Cards</TabsTrigger>
            <TabsTrigger value="store" className="gap-1.5"><ShoppingBag className="h-3.5 w-3.5" />Store</TabsTrigger>
            <TabsTrigger value="forms" className="gap-1.5"><FormInput className="h-3.5 w-3.5" />Forms</TabsTrigger>
            <TabsTrigger value="badges" className="gap-1.5"><Tag className="h-3.5 w-3.5" />Badges</TabsTrigger>
            <TabsTrigger value="navigation" className="gap-1.5"><Navigation className="h-3.5 w-3.5" />Tabs</TabsTrigger>
            <TabsTrigger value="modals" className="gap-1.5"><Layers className="h-3.5 w-3.5" />Modals</TabsTrigger>
            <TabsTrigger value="toast" className="gap-1.5"><Bell className="h-3.5 w-3.5" />Toast</TabsTrigger>
            <TabsTrigger value="charts" className="gap-1.5"><BarChart3 className="h-3.5 w-3.5" />Charts</TabsTrigger>
            <TabsTrigger value="spacing" className="gap-1.5"><Grid3X3 className="h-3.5 w-3.5" />Spacing</TabsTrigger>
            <TabsTrigger value="branding" className="gap-1.5"><Image className="h-3.5 w-3.5" />Branding</TabsTrigger>
            <TabsTrigger value="custom" className="gap-1.5"><Code className="h-3.5 w-3.5" />Custom CSS</TabsTrigger>
          </TabsList>

          {/* Colors Tab */}
          <TabsContent value="colors">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Light Mode Colors</CardTitle>
                  <CardDescription>সাইটের Light theme এর সব রঙ নিয়ন্ত্রণ করুন</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ColorField label="Primary Color" settingKey="primary_color" description="Main brand color" />
                  <ColorField label="Secondary Color" settingKey="secondary_color" />
                  <ColorField label="Accent Color" settingKey="accent_color" />
                  <ColorField label="Background" settingKey="background_color" />
                  <ColorField label="Foreground (Text)" settingKey="foreground_color" />
                  <ColorField label="Muted Text" settingKey="muted_color" />
                  <ColorField label="Border Color" settingKey="border_color" />
                  <ColorField label="Card Background" settingKey="card_color" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Status & Dark Mode</CardTitle>
                  <CardDescription>Status colors ও Dark mode settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ColorField label="Success Color" settingKey="success_color" />
                  <ColorField label="Warning Color" settingKey="warning_color" />
                  <ColorField label="Error / Destructive" settingKey="destructive_color" />
                  <ColorField label="Link Color" settingKey="link_color" />
                  <ColorField label="Link Hover" settingKey="link_hover_color" />
                  <div className="border-t pt-4 mt-4">
                    <SwitchField label="Dark Mode Toggle" settingKey="dark_mode_enabled" description="Allow dark mode switching" />
                  </div>
                  <ColorField label="Dark Primary" settingKey="dark_primary_color" />
                  <ColorField label="Dark Background" settingKey="dark_background_color" />
                  <ColorField label="Dark Foreground" settingKey="dark_foreground_color" />
                  <ColorField label="Dark Card" settingKey="dark_card_color" />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Buttons Tab */}
          <TabsContent value="buttons">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Button Styling</CardTitle>
                <CardDescription>বাটনের রঙ, radius ও shadow কাস্টমাইজ করুন</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <TextField label="Button Border Radius" settingKey="button_radius" description="e.g. 0.5rem, 8px, 9999px" />
                  <SwitchField label="Button Shadow" settingKey="button_shadow" description="বাটনে shadow দেখাবে" />
                  <ColorField label="Primary Button BG" settingKey="button_primary_bg" />
                  <ColorField label="Primary Button Text" settingKey="button_primary_text" />
                  <ColorField label="Secondary Button BG" settingKey="button_secondary_bg" />
                  <ColorField label="Destructive Button BG" settingKey="button_destructive_bg" />
                </div>
                {/* Preview */}
                <div className="mt-6 p-4 border rounded-lg bg-muted/30">
                  <p className="text-sm font-medium mb-3">Preview:</p>
                  <div className="flex flex-wrap gap-3">
                    <Button>Primary Button</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="destructive">Destructive</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Typography Tab */}
          <TabsContent value="typography">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Typography</CardTitle>
                <CardDescription>ফন্ট, সাইজ ও স্পেসিং নিয়ন্ত্রণ করুন</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <SelectField label="Heading Font" settingKey="heading_font" options={GOOGLE_FONTS.map(f => ({ value: f, label: f }))} />
                  <SelectField label="Body Font" settingKey="body_font" options={GOOGLE_FONTS.map(f => ({ value: f, label: f }))} />
                  <NumberField label="Base Font Size" settingKey="font_size_base" suffix="px" />
                  <NumberField label="H1 Size" settingKey="font_size_h1" suffix="px" />
                  <NumberField label="H2 Size" settingKey="font_size_h2" suffix="px" />
                  <NumberField label="H3 Size" settingKey="font_size_h3" suffix="px" />
                  <SelectField label="Heading Weight" settingKey="heading_weight" options={[
                    { value: "400", label: "Regular (400)" },
                    { value: "500", label: "Medium (500)" },
                    { value: "600", label: "Semibold (600)" },
                    { value: "700", label: "Bold (700)" },
                  ]} />
                  <SelectField label="Body Weight" settingKey="body_weight" options={[
                    { value: "300", label: "Light (300)" },
                    { value: "400", label: "Regular (400)" },
                    { value: "500", label: "Medium (500)" },
                  ]} />
                  <NumberField label="Line Height" settingKey="line_height" />
                  <NumberField label="Letter Spacing" settingKey="letter_spacing" suffix="em" />
                </div>
                {/* Preview */}
                <div className="mt-6 p-4 border rounded-lg bg-muted/30 space-y-2">
                  <p className="text-sm font-medium mb-3">Preview:</p>
                  <h1 className="text-3xl font-display font-bold">Heading 1 Preview</h1>
                  <h2 className="text-2xl font-display font-semibold">Heading 2 Preview</h2>
                  <h3 className="text-xl font-display font-medium">Heading 3 Preview</h3>
                  <p className="text-base">Body text preview — The quick brown fox jumps over the lazy dog.</p>
                  <p className="text-sm text-muted-foreground">Muted small text preview</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sidebar Tab */}
          <TabsContent value="sidebar">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sidebar Styling</CardTitle>
                <CardDescription>Admin, Manager, Support, Customer সব panel-এর sidebar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <ColorField label="Sidebar Background" settingKey="sidebar_bg" />
                  <ColorField label="Sidebar Text" settingKey="sidebar_text" />
                  <ColorField label="Active Item Color" settingKey="sidebar_active" />
                  <ColorField label="Icon Color" settingKey="sidebar_icon_color" />
                  <NumberField label="Sidebar Width (Expanded)" settingKey="sidebar_width" suffix="px" />
                  <NumberField label="Sidebar Width (Collapsed)" settingKey="sidebar_collapsed_width" suffix="px" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Header Tab */}
          <TabsContent value="header">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Header / Navbar</CardTitle>
                <CardDescription>সব panel-এর header কাস্টমাইজ করুন</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <ColorField label="Header Background" settingKey="header_bg" />
                  <ColorField label="Header Text" settingKey="header_text" />
                  <NumberField label="Header Height" settingKey="header_height" suffix="px" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cards Tab */}
          <TabsContent value="cards">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Cards & Containers</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <TextField label="Card Border Radius" settingKey="card_radius" />
                  <SelectField label="Card Shadow" settingKey="card_shadow" options={[
                    { value: "none", label: "None" },
                    { value: "sm", label: "Small" },
                    { value: "md", label: "Medium" },
                    { value: "lg", label: "Large" },
                  ]} />
                  <SwitchField label="Card Border" settingKey="card_border" />
                  <SelectField label="Card Hover Effect" settingKey="card_hover_effect" options={[
                    { value: "none", label: "None" },
                    { value: "shadow", label: "Shadow" },
                    { value: "scale", label: "Scale" },
                    { value: "glow", label: "Border Glow" },
                  ]} />
                  <NumberField label="Container Max Width" settingKey="container_max_width" suffix="px" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Shadows & Borders</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <TextField label="Global Border Radius" settingKey="global_radius" description="e.g. 0.75rem" />
                  <SelectField label="Shadow Intensity" settingKey="shadow_intensity" options={[
                    { value: "none", label: "None" },
                    { value: "sm", label: "Small" },
                    { value: "md", label: "Medium" },
                    { value: "lg", label: "Large" },
                  ]} />
                  <SelectField label="Border Style" settingKey="border_style" options={[
                    { value: "solid", label: "Solid" },
                    { value: "dashed", label: "Dashed" },
                    { value: "dotted", label: "Dotted" },
                    { value: "none", label: "None" },
                  ]} />
                  <ColorField label="Divider Color" settingKey="divider_color" />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Store Tab */}
          <TabsContent value="store">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Store Frontend</CardTitle>
                <CardDescription>Customer-facing store-এর design control</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <ColorField label="Store Primary" settingKey="store_primary" />
                  <ColorField label="Store Secondary" settingKey="store_secondary" />
                  <ColorField label="Store Accent" settingKey="store_accent" />
                  <ColorField label="Store Background" settingKey="store_bg" />
                  <NumberField label="Product Grid Columns" settingKey="product_card_columns" />
                  <NumberField label="Product Card Gap" settingKey="product_card_gap" suffix="px" />
                  <ColorField label="New Badge Color" settingKey="badge_new_color" />
                  <ColorField label="Sale Badge Color" settingKey="badge_sale_color" />
                  <ColorField label="Footer Background" settingKey="footer_bg" />
                  <ColorField label="Footer Text" settingKey="footer_text" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Forms Tab */}
          <TabsContent value="forms">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Form Elements</CardTitle>
                <CardDescription>Input, Select, Switch, Checkbox styling</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <TextField label="Input Border Radius" settingKey="input_radius" />
                  <ColorField label="Input Border Color" settingKey="input_border_color" />
                  <ColorField label="Input Focus Color" settingKey="input_focus_color" />
                  <ColorField label="Switch/Checkbox Accent" settingKey="switch_accent" />
                  <ColorField label="Label Text Color" settingKey="label_color" />
                </div>
                {/* Preview */}
                <div className="mt-6 p-4 border rounded-lg bg-muted/30 space-y-3">
                  <p className="text-sm font-medium mb-3">Preview:</p>
                  <Input placeholder="Sample input field" />
                  <div className="flex items-center gap-3">
                    <Switch /> <Label>Toggle switch</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Badges Tab */}
          <TabsContent value="badges">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Badges & Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <ColorField label="Default Badge BG" settingKey="badge_default_bg" />
                  <ColorField label="Success Badge BG" settingKey="badge_success_bg" />
                  <ColorField label="Warning Badge BG" settingKey="badge_warning_bg" />
                  <ColorField label="Error Badge BG" settingKey="badge_error_bg" />
                  <SelectField label="Badge Shape" settingKey="badge_shape" options={[
                    { value: "rounded", label: "Rounded" },
                    { value: "pill", label: "Pill" },
                    { value: "square", label: "Square" },
                  ]} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Navigation Tab */}
          <TabsContent value="navigation">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Navigation & Tabs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <ColorField label="Tab Active Color" settingKey="tab_active_color" />
                  <ColorField label="Tab Inactive Color" settingKey="tab_inactive_color" />
                  <SelectField label="Tab Style" settingKey="tab_style" options={[
                    { value: "underline", label: "Underline" },
                    { value: "pill", label: "Pill" },
                  ]} />
                  <SelectField label="Pagination Style" settingKey="pagination_style" options={[
                    { value: "rounded", label: "Rounded" },
                    { value: "square", label: "Square" },
                  ]} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Modals Tab */}
          <TabsContent value="modals">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Modals & Dialogs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <NumberField label="Overlay Opacity" settingKey="modal_overlay_opacity" description="0 to 1" />
                  <TextField label="Modal Border Radius" settingKey="modal_radius" />
                  <SelectField label="Modal Shadow" settingKey="modal_shadow" options={[
                    { value: "sm", label: "Small" },
                    { value: "md", label: "Medium" },
                    { value: "lg", label: "Large" },
                  ]} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Toast Tab */}
          <TabsContent value="toast">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Toast / Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <SelectField label="Toast Position" settingKey="toast_position" options={[
                    { value: "top-right", label: "Top Right" },
                    { value: "top-center", label: "Top Center" },
                    { value: "top-left", label: "Top Left" },
                    { value: "bottom-right", label: "Bottom Right" },
                    { value: "bottom-center", label: "Bottom Center" },
                    { value: "bottom-left", label: "Bottom Left" },
                  ]} />
                  <NumberField label="Toast Duration" settingKey="toast_duration" suffix="ms" />
                  <ColorField label="Success Toast BG" settingKey="toast_success_bg" />
                  <ColorField label="Error Toast BG" settingKey="toast_error_bg" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Charts Tab */}
          <TabsContent value="charts">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Charts & Analytics</CardTitle>
                <CardDescription>Chart color palette কাস্টমাইজ করুন</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <ColorField label="Chart Color 1" settingKey="chart_color_1" />
                  <ColorField label="Chart Color 2" settingKey="chart_color_2" />
                  <ColorField label="Chart Color 3" settingKey="chart_color_3" />
                  <ColorField label="Chart Color 4" settingKey="chart_color_4" />
                  <ColorField label="Chart Color 5" settingKey="chart_color_5" />
                  <ColorField label="Grid Line Color" settingKey="chart_grid_color" />
                </div>
                {/* Color preview row */}
                <div className="mt-6 flex gap-2">
                  {['chart_color_1', 'chart_color_2', 'chart_color_3', 'chart_color_4', 'chart_color_5'].map(key => (
                    <div
                      key={key}
                      className="h-12 flex-1 rounded-lg border"
                      style={{ backgroundColor: `hsl(${getVal(key)})` }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Spacing Tab */}
          <TabsContent value="spacing">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Spacing & Layout</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <NumberField label="Page Padding" settingKey="page_padding" suffix="px" />
                  <NumberField label="Section Gap" settingKey="section_gap" suffix="px" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Branding Tab */}
          <TabsContent value="branding">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Logo & Branding</CardTitle>
                <CardDescription>ব্র্যান্ড নাম, লোগো ও favicon</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <TextField label="Brand Name" settingKey="brand_name" description="Header ও sidebar-এ দেখাবে" />
                  <TextField label="Logo URL" settingKey="logo_url" description="Logo image URL (optional)" />
                  <TextField label="Favicon URL" settingKey="favicon_url" description="Browser tab icon URL" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Custom CSS Tab */}
          <TabsContent value="custom">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Custom CSS Override</CardTitle>
                <CardDescription>Advanced users-এর জন্য raw CSS inject করুন</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={getVal('custom_css')}
                  onChange={(e) => setVal('custom_css', e.target.value)}
                  placeholder={`/* Custom CSS */\n.my-class {\n  color: red;\n}`}
                  className="min-h-[300px] font-mono text-sm"
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Floating save bar */}
        {hasChanges && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-card border shadow-lg rounded-lg px-6 py-3">
            <span className="text-sm text-muted-foreground">{Object.keys(localValues).length} changes unsaved</span>
            <Button variant="outline" size="sm" onClick={handleReset}>Reset</Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-1" /> Save
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
