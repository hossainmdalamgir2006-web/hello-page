import { useState, useEffect } from 'react';
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Camera, User, Mail, Phone, FileText, Copy, Check, IdCard } from 'lucide-react';
import { format } from 'date-fns';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone: z.string().max(20).optional().or(z.literal('')),
  bio: z.string().max(200, 'Bio must be 200 characters or less').optional().or(z.literal('')),
});

const emailSchema = z.object({
  newEmail: z.string().email('Invalid email address'),
});

export default function PersonalInfoPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [roles, setRoles] = useState<string[]>([]);

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: user?.user_metadata?.full_name || '', phone: '', bio: '' },
  });

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { newEmail: '' },
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchRoles();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase.from('profiles').select('avatar_url, full_name, phone, bio').eq('user_id', user.id).maybeSingle();
    if (data) {
      if (data.avatar_url) setAvatarUrl(data.avatar_url);
      profileForm.reset({
        fullName: data.full_name || user.user_metadata?.full_name || '',
        phone: (data as any).phone || '',
        bio: (data as any).bio || '',
      });
    }
  };

  const fetchRoles = async () => {
    if (!user) return;
    const { data } = await supabase.from('user_roles').select('role').eq('user_id', user.id);
    if (data) setRoles(data.map((r: any) => r.role));
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0 || !user) return;
    const file = event.target.files[0];
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const MAX_SIZE = 5 * 1024 * 1024;
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast({ variant: 'destructive', title: 'Upload Failed', description: 'Invalid file type.' });
      return;
    }
    if (file.size > MAX_SIZE) {
      toast({ variant: 'destructive', title: 'Upload Failed', description: 'Maximum size is 5MB.' });
      return;
    }
    const mimeToExt: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };
    const fileExt = mimeToExt[file.type] || 'jpg';
    const filePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`;
    setUploading(true);
    try {
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const { error: updateError } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('user_id', user.id);
      if (updateError) throw updateError;
      setAvatarUrl(publicUrl);
      toast({ title: 'Avatar Updated', description: 'Your profile photo has been updated.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Upload Failed', description: error.message });
    } finally {
      setUploading(false);
    }
  };

  const onProfileSubmit = async (values: z.infer<typeof profileSchema>) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { error: authError } = await supabase.auth.updateUser({ data: { full_name: values.fullName } });
      if (authError) throw authError;
      const { error: profileError } = await supabase.from('profiles').update({
        full_name: values.fullName,
        phone: values.phone || null,
        bio: values.bio || null,
      } as any).eq('user_id', user.id);
      if (profileError) throw profileError;
      toast({ title: 'Profile Updated', description: 'Your profile information has been saved.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Update Failed', description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const onEmailSubmit = async (values: z.infer<typeof emailSchema>) => {
    if (!user) return;
    setIsEmailLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: values.newEmail });
      if (error) throw error;
      emailForm.reset();
      toast({ title: 'Email Change Requested', description: 'A confirmation link has been sent to your new email address.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Email Update Failed', description: error.message });
    } finally {
      setIsEmailLoading(false);
    }
  };

  const copyId = () => {
    if (!user) return;
    navigator.clipboard.writeText(user.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getInitials = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return user?.email?.slice(0, 2).toUpperCase() || 'AD';
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Personal Info" description="Manage your profile details and email" />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Avatar Card */}
          <div className="rounded-xl border border-border/50 bg-card p-5 hover:shadow-md transition-all border-l-[3px] border-l-primary">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-lg bg-primary/10 p-2"><Camera className="h-5 w-5 text-primary" /></div>
              <div>
                <h3 className="font-semibold">Avatar</h3>
                <p className="text-xs text-muted-foreground">Upload a profile photo</p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="h-28 w-28">
                  <AvatarImage src={avatarUrl || ''} />
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">{getInitials()}</AvatarFallback>
                </Avatar>
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                )}
              </div>
              <div>
                <input type="file" id="avatar" accept="image/*" className="hidden" onChange={uploadAvatar} disabled={uploading} />
                <Button asChild variant="outline" disabled={uploading}>
                  <label htmlFor="avatar" className="cursor-pointer">
                    {uploading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Uploading...</>) : (<><Camera className="mr-2 h-4 w-4" />Change Avatar</>)}
                  </label>
                </Button>
              </div>
            </div>
          </div>

          {/* Personal Info Card */}
          <div className="rounded-xl border border-border/50 bg-card p-5 hover:shadow-md transition-all border-l-[3px] border-l-primary">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-lg bg-primary/10 p-2"><User className="h-5 w-5 text-primary" /></div>
              <div>
                <h3 className="font-semibold">Personal Information</h3>
                <p className="text-xs text-muted-foreground">Update your personal details</p>
              </div>
            </div>
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                <FormField control={profileForm.control} name="fullName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={profileForm.control} name="phone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input className="pl-10" placeholder="+880 1XXX-XXXXXX" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={profileForm.control} name="bio" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio <span className="text-xs text-muted-foreground">(max 200)</span></FormLabel>
                    <FormControl>
                      <Textarea placeholder="A short bio about yourself..." rows={3} maxLength={200} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="space-y-2">
                  <FormLabel>Email</FormLabel>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-10" disabled value={user?.email || ''} />
                  </div>
                  <p className="text-xs text-muted-foreground">To change your email, use the form on the right.</p>
                </div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save
                </Button>
              </form>
            </Form>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Account Overview */}
          <div className="rounded-xl border border-border/50 bg-card p-5 hover:shadow-md transition-all border-l-[3px] border-l-success">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-lg bg-success/10 p-2"><IdCard className="h-5 w-5 text-success" /></div>
              <div>
                <h3 className="font-semibold">Account Overview</h3>
                <p className="text-xs text-muted-foreground">Read-only account details</p>
              </div>
            </div>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Member Since</dt>
                <dd className="font-medium">{user?.created_at ? format(new Date(user.created_at), 'MMM d, yyyy') : '—'}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Last Sign-in</dt>
                <dd className="font-medium">{user?.last_sign_in_at ? format(new Date(user.last_sign_in_at), 'MMM d, yyyy h:mm a') : '—'}</dd>
              </div>
              <div className="flex justify-between gap-4 items-center">
                <dt className="text-muted-foreground">Roles</dt>
                <dd className="flex flex-wrap gap-1 justify-end">
                  {roles.length === 0 ? <span className="text-muted-foreground">user</span> : roles.map((r) => (
                    <Badge key={r} variant="secondary" className="text-xs">{r}</Badge>
                  ))}
                </dd>
              </div>
              <div className="flex justify-between gap-4 items-center">
                <dt className="text-muted-foreground">Account ID</dt>
                <dd className="flex items-center gap-2">
                  <code className="text-xs bg-muted px-2 py-1 rounded max-w-[180px] truncate">{user?.id}</code>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={copyId}>
                    {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                </dd>
              </div>
            </dl>
          </div>

          {/* Change Email Card */}
          <div className="rounded-xl border border-border/50 bg-card p-5 hover:shadow-md transition-all border-l-[3px] border-l-accent">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-lg bg-accent/10 p-2"><Mail className="h-5 w-5 text-accent" /></div>
              <div>
                <h3 className="font-semibold">Change Email</h3>
                <p className="text-xs text-muted-foreground">A confirmation link will be sent to the new email</p>
              </div>
            </div>
            <Form {...emailForm}>
              <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <FormLabel>Current Email</FormLabel>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-10" disabled value={user?.email || ''} />
                  </div>
                </div>
                <FormField control={emailForm.control} name="newEmail" render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input className="pl-10" placeholder="Enter new email address" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" disabled={isEmailLoading}>
                  {isEmailLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Update Email
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
