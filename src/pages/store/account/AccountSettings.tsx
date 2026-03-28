import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { SEOHead } from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { User, Lock, Camera, Loader2, Eye, EyeOff } from "lucide-react";

const profileSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  date_of_birth: z.string().optional(),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"]).optional().nullable(),
  company_name: z.string().optional(),
  bio: z.string().max(500, "Bio must be 500 characters or less").optional(),
  language_preference: z.string().optional(),
});

const passwordSchema = z.object({
  current_password: z.string().min(1, "Current password is required"),
  new_password: z.string().min(8, "Password must be at least 8 characters").regex(/[A-Z]/, "Must contain uppercase").regex(/[a-z]/, "Must contain lowercase").regex(/[0-9]/, "Must contain number"),
  confirm_password: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.new_password === data.confirm_password, { message: "Passwords don't match", path: ["confirm_password"] });

export default function AccountSettings() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const profileForm = useForm({ resolver: zodResolver(profileSchema), defaultValues: { full_name: "", email: "", phone: "", date_of_birth: "", gender: null as any, company_name: "", bio: "", language_preference: "en" } });
  const passwordForm = useForm({ resolver: zodResolver(passwordSchema), defaultValues: { current_password: "", new_password: "", confirm_password: "" } });

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const { data } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
        if (data) {
          setAvatarUrl(data.avatar_url);
          profileForm.reset({ full_name: data.full_name || "", email: user.email || "", phone: data.phone || "", date_of_birth: data.date_of_birth || "", gender: data.gender || null, company_name: data.company_name || "", bio: data.bio || "", language_preference: data.language_preference || "en" });
        }
      } catch (error) { console.error("Error:", error); }
      finally { setLoading(false); }
    };
    fetchProfile();
  }, [user]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/avatar.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const { error: updateError } = await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("user_id", user.id);
      if (updateError) throw updateError;
      setAvatarUrl(publicUrl);
      toast({ title: t('common.save'), description: "Avatar updated" });
    } catch (error: any) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
    finally { setUploadingAvatar(false); }
  };

  const onProfileSubmit = async (values: z.infer<typeof profileSchema>) => {
    if (!user) return;
    setSavingProfile(true);
    try {
      const { error } = await supabase.from("profiles").update({ full_name: values.full_name, phone: values.phone || null, date_of_birth: values.date_of_birth || null, gender: values.gender || null, company_name: values.company_name || null, bio: values.bio || null, language_preference: values.language_preference || "en" }).eq("user_id", user.id);
      if (error) throw error;
      toast({ title: t('common.save'), description: t('account.profileInformation') });
    } catch (error: any) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
    finally { setSavingProfile(false); }
  };

  const onPasswordSubmit = async (values: z.infer<typeof passwordSchema>) => {
    if (!user) return;
    setSavingPassword(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email: user.email!, password: values.current_password });
      if (signInError) throw new Error("Current password is incorrect");
      const { error: updateError } = await supabase.auth.updateUser({ password: values.new_password });
      if (updateError) throw updateError;
      toast({ title: t('common.save'), description: t('account.changePassword') });
      passwordForm.reset();
    } catch (error: any) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
    finally { setSavingPassword(false); }
  };

  const handleNotificationChange = async (key: keyof typeof notifications, value: boolean) => {
    if (!user) return;
    setNotifications((prev) => ({ ...prev, [key]: value }));
    setSavingNotifications(true);
    try {
      const updateData: Record<string, boolean> = {};
      updateData[`notify_${key}`] = value;
      const { error } = await supabase.from("profiles").update(updateData).eq("user_id", user.id);
      if (error) throw error;
    } catch (error: any) {
      setNotifications((prev) => ({ ...prev, [key]: !value }));
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally { setSavingNotifications(false); }
  };

  const getInitials = (name: string) => name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <>
    <SEOHead title="Account Settings" noIndex />
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">{t('account.settings')}</h1>
        <p className="text-sm text-muted-foreground">{t('account.manageSettings')}</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative group">
          <Avatar className="h-20 w-20 border-4 border-primary/20">
            <AvatarImage src={avatarUrl || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground text-lg">{getInitials(profileForm.getValues("full_name") || user?.email || "U")}</AvatarFallback>
          </Avatar>
          <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
            {uploadingAvatar ? <Loader2 className="h-5 w-5 text-white animate-spin" /> : <Camera className="h-5 w-5 text-white" />}
            <input type="file" accept="image/*" onChange={handleAvatarUpload} className="sr-only" disabled={uploadingAvatar} />
          </label>
        </div>
        <div>
          <h2 className="text-lg font-semibold">{profileForm.getValues("full_name") || "Customer"}</h2>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" />{t('account.profileInformation')}</CardTitle>
          <CardDescription>{t('account.updatePersonalInfo')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={profileForm.control} name="full_name" render={({ field }) => (<FormItem><FormLabel>{t('account.fullName')}</FormLabel><FormControl><Input placeholder={t('account.fullName')} {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={profileForm.control} name="email" render={({ field }) => (<FormItem><FormLabel>{t('common.email')}</FormLabel><FormControl><Input type="email" {...field} disabled className="bg-muted" /></FormControl><FormMessage /></FormItem>)} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={profileForm.control} name="phone" render={({ field }) => (<FormItem><FormLabel>{t('common.phone')}</FormLabel><FormControl><Input placeholder="01XXXXXXXXX" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={profileForm.control} name="date_of_birth" render={({ field }) => (<FormItem><FormLabel>{t('account.dateOfBirth')}</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
              </div>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={profileForm.control} name="gender" render={({ field }) => (<FormItem><FormLabel>{t('account.gender')}</FormLabel><Select onValueChange={field.onChange} value={field.value || undefined}><FormControl><SelectTrigger><SelectValue placeholder={t('account.selectGender')} /></SelectTrigger></FormControl><SelectContent><SelectItem value="male">{t('account.male')}</SelectItem><SelectItem value="female">{t('account.female')}</SelectItem><SelectItem value="other">{t('account.other')}</SelectItem><SelectItem value="prefer_not_to_say">{t('account.preferNotToSay')}</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                <FormField control={profileForm.control} name="company_name" render={({ field }) => (<FormItem><FormLabel>{t('account.companyName')}</FormLabel><FormControl><Input placeholder={t('account.companyName')} {...field} /></FormControl><FormMessage /></FormItem>)} />
              </div>
              <FormField control={profileForm.control} name="bio" render={({ field }) => (<FormItem><FormLabel>{t('account.bio')}</FormLabel><FormControl><textarea className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" placeholder={t('account.tellAboutYourself')} maxLength={500} {...field} /></FormControl><p className="text-xs text-muted-foreground text-right">{(field.value?.length || 0)}/500</p><FormMessage /></FormItem>)} />
              <Separator />
              <FormField control={profileForm.control} name="language_preference" render={({ field }) => (<FormItem className="max-w-xs"><FormLabel>{t('account.language')}</FormLabel><Select onValueChange={field.onChange} value={field.value || "en"}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="en">English</SelectItem><SelectItem value="bn">বাংলা (Bengali)</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
              <Button type="submit" disabled={savingProfile}>{savingProfile && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}{t('account.saveChanges')}</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5" />{t('account.changePassword')}</CardTitle>
          <CardDescription>{t('account.updatePassword')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              <FormField control={passwordForm.control} name="current_password" render={({ field }) => (<FormItem><FormLabel>{t('account.currentPassword')}</FormLabel><FormControl><div className="relative"><Input type={showCurrentPassword ? "text" : "password"} placeholder={t('account.currentPassword')} {...field} /><Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>{showCurrentPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}</Button></div></FormControl><FormMessage /></FormItem>)} />
              <FormField control={passwordForm.control} name="new_password" render={({ field }) => (<FormItem><FormLabel>{t('account.newPassword')}</FormLabel><FormControl><div className="relative"><Input type={showNewPassword ? "text" : "password"} placeholder={t('account.newPassword')} {...field} /><Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowNewPassword(!showNewPassword)}>{showNewPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}</Button></div></FormControl><p className="text-xs text-muted-foreground">{t('account.passwordHint')}</p><FormMessage /></FormItem>)} />
              <FormField control={passwordForm.control} name="confirm_password" render={({ field }) => (<FormItem><FormLabel>{t('account.confirmPassword')}</FormLabel><FormControl><div className="relative"><Input type={showConfirmPassword ? "text" : "password"} placeholder={t('account.confirmPassword')} {...field} /><Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>{showConfirmPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}</Button></div></FormControl><FormMessage /></FormItem>)} />
              <Button type="submit" disabled={savingPassword}>{savingPassword && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}{t('account.updatePasswordBtn')}</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

    </div>
    </>
  );
}
