import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Store,
  Globe,
  Building,
  Upload,
  Loader2,
  ImageIcon,
  X,
} from "lucide-react";
import { UploadSettings } from "@/components/settings/UploadSettings";
import { MaintenanceModeSettings } from "@/components/settings/MaintenanceModeSettings";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface StoreSettings {
  storeName: string;
  storeEmail: string;
  storePhone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  currency: string;
  timezone: string;
  logo: string;
  favicon: string;
  description: string;
  facebookUrl: string;
  instagramUrl: string;
  twitterUrl: string;
  youtubeUrl: string;
}

interface StoreSettingsTabProps {
  storeSettings: StoreSettings;
  updateStoreField: <K extends keyof StoreSettings>(key: K, value: StoreSettings[K]) => void;
}

export function StoreSettingsTab({ storeSettings, updateStoreField }: StoreSettingsTabProps) {
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error("Please upload an image file"); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error("Image must be less than 2MB"); return; }

    setUploadingLogo(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const { error } = await supabase.storage.from('brand-logos').upload(`logos/${fileName}`, file, { upsert: true });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('brand-logos').getPublicUrl(`logos/${fileName}`);
      updateStoreField('logo', publicUrl);
      toast.success("Logo uploaded successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload logo");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (storeSettings.logo) {
      try {
        const bucketPath = storeSettings.logo.split('/brand-logos/').pop();
        if (bucketPath) await supabase.storage.from('brand-logos').remove([bucketPath]);
      } catch (error) { console.error('Error removing logo:', error); }
    }
    updateStoreField('logo', '');
  };

  const handleFaviconUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error("Please upload an image file"); return; }
    if (file.size > 500 * 1024) { toast.error("Favicon must be less than 500KB"); return; }

    setUploadingFavicon(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `favicon-${Date.now()}.${fileExt}`;
      const { error } = await supabase.storage.from('brand-logos').upload(`favicons/${fileName}`, file, { upsert: true });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('brand-logos').getPublicUrl(`favicons/${fileName}`);
      updateStoreField('favicon', publicUrl);
      toast.success("Favicon uploaded successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload favicon");
    } finally {
      setUploadingFavicon(false);
    }
  };

  const handleRemoveFavicon = async () => {
    if (storeSettings.favicon) {
      try {
        const bucketPath = storeSettings.favicon.split('/brand-logos/').pop();
        if (bucketPath) await supabase.storage.from('brand-logos').remove([bucketPath]);
      } catch (error) { console.error('Error removing favicon:', error); }
    }
    updateStoreField('favicon', '');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-accent" />
            Store Information
          </CardTitle>
          <CardDescription>Basic information about your store</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="storeName">Store Name</Label>
              <Input id="storeName" value={storeSettings.storeName} onChange={(e) => updateStoreField("storeName", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="storeEmail">Store Email</Label>
              <Input id="storeEmail" type="email" value={storeSettings.storeEmail} onChange={(e) => updateStoreField("storeEmail", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="storePhone">Phone Number</Label>
              <Input id="storePhone" value={storeSettings.storePhone} onChange={(e) => updateStoreField("storePhone", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" value={storeSettings.address} onChange={(e) => updateStoreField("address", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" value={storeSettings.city} onChange={(e) => updateStoreField("city", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input id="postalCode" value={storeSettings.postalCode} onChange={(e) => updateStoreField("postalCode", e.target.value)} />
            </div>
          </div>

          {/* Logo Upload */}
          <Separator />
          <div className="space-y-4">
            <Label>Store Logo</Label>
            <div className="flex items-start gap-6">
              <div className="relative">
                {storeSettings.logo ? (
                  <div className="relative group">
                    <div className="h-24 w-24 rounded-lg border-2 border-border overflow-hidden bg-muted">
                      <img src={storeSettings.logo} alt="Store Logo" className="h-full w-full object-contain" />
                    </div>
                    <button type="button" onClick={handleRemoveLogo} className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="h-24 w-24 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted/50">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-3">
                <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                <Button type="button" variant="outline" onClick={() => logoInputRef.current?.click()} disabled={uploadingLogo} className="w-fit gap-2">
                  {uploadingLogo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {uploadingLogo ? "Uploading..." : "Upload Logo"}
                </Button>
                <p className="text-xs text-muted-foreground">Recommended: Square image, at least 200x200px. Max 2MB. PNG or JPG.</p>
              </div>
            </div>
          </div>

          {/* Favicon Upload */}
          <Separator />
          <div className="space-y-4">
            <Label>Browser Favicon</Label>
            <div className="flex items-start gap-6">
              <div className="relative">
                {storeSettings.favicon ? (
                  <div className="relative group">
                    <div className="h-16 w-16 rounded-lg border-2 border-border overflow-hidden bg-muted">
                      <img src={storeSettings.favicon} alt="Favicon" className="h-full w-full object-contain" />
                    </div>
                    <button type="button" onClick={handleRemoveFavicon} className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="h-16 w-16 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted/50">
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-3">
                <input ref={faviconInputRef} type="file" accept="image/png,image/x-icon,image/ico,.ico" onChange={handleFaviconUpload} className="hidden" />
                <Button type="button" variant="outline" onClick={() => faviconInputRef.current?.click()} disabled={uploadingFavicon} className="w-fit gap-2">
                  {uploadingFavicon ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {uploadingFavicon ? "Uploading..." : "Upload Favicon"}
                </Button>
                <p className="text-xs text-muted-foreground">Recommended: 32x32px or 64x64px. ICO or PNG format. Max 500KB.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Branding & Social */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5 text-accent" />
            Branding & Social Media
          </CardTitle>
          <CardDescription>Store description and social media links for footer</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="description">Store Description</Label>
            <Textarea id="description" value={storeSettings.description} onChange={(e) => updateStoreField("description", e.target.value)} placeholder="Brief description about your store..." rows={3} />
            <p className="text-xs text-muted-foreground">This appears in the footer and meta descriptions.</p>
          </div>
          <Separator />
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="facebookUrl">Facebook URL</Label>
              <Input id="facebookUrl" type="url" value={storeSettings.facebookUrl} onChange={(e) => updateStoreField("facebookUrl", e.target.value)} placeholder="https://facebook.com/yourpage" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instagramUrl">Instagram URL</Label>
              <Input id="instagramUrl" type="url" value={storeSettings.instagramUrl} onChange={(e) => updateStoreField("instagramUrl", e.target.value)} placeholder="https://instagram.com/yourpage" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="twitterUrl">Twitter / X URL</Label>
              <Input id="twitterUrl" type="url" value={storeSettings.twitterUrl} onChange={(e) => updateStoreField("twitterUrl", e.target.value)} placeholder="https://twitter.com/yourpage" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="youtubeUrl">YouTube URL</Label>
              <Input id="youtubeUrl" type="url" value={storeSettings.youtubeUrl} onChange={(e) => updateStoreField("youtubeUrl", e.target.value)} placeholder="https://youtube.com/@yourchannel" />
            </div>
          </div>
        </CardContent>
      </Card>

      <UploadSettings />
      <MaintenanceModeSettings />
    </div>
  );
}
