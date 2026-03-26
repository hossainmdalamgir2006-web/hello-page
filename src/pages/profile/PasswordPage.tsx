import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { usePasswordSecurity } from '@/hooks/usePasswordSecurity';
import { PasswordStrengthIndicator } from '@/components/ui/password-strength';
import { Loader2, Lock, Eye, EyeOff } from 'lucide-react';

const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Password must be at least 6 characters'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function PasswordPage() {
  const { toast } = useToast();
  const { calculateStrength, checkLeakedPassword, leakCheck, resetLeakCheck } = usePasswordSecurity();
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [leakCheckTimeout, setLeakCheckTimeout] = useState<NodeJS.Timeout | null>(null);
  const passwordStrength = calculateStrength(newPassword);

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const handleNewPasswordChange = useCallback((value: string) => {
    setNewPassword(value);
    if (leakCheckTimeout) clearTimeout(leakCheckTimeout);
    resetLeakCheck();
    if (value.length >= 6) {
      const timeout = setTimeout(() => checkLeakedPassword(value), 500);
      setLeakCheckTimeout(timeout);
    }
  }, [leakCheckTimeout, checkLeakedPassword, resetLeakCheck]);

  const onPasswordSubmit = async (values: z.infer<typeof passwordSchema>) => {
    if (leakCheck.isLeaked) {
      toast({ variant: 'destructive', title: 'Compromised Password', description: 'This password has been exposed in data breaches. Please choose a different password.' });
      return;
    }
    if (passwordStrength.score < 2) {
      toast({ variant: 'destructive', title: 'Weak Password', description: 'Please choose a stronger password that meets more requirements.' });
      return;
    }
    setIsPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: values.newPassword });
      if (error) throw error;
      passwordForm.reset();
      setNewPassword('');
      resetLeakCheck();
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      toast({ title: 'Password Changed', description: 'Your password has been updated successfully.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Password Change Failed', description: error.message });
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const PasswordToggle = ({ show, onToggle }: { show: boolean; onToggle: () => void }) => (
    <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3 hover:bg-transparent" onClick={onToggle}>
      {show ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
    </Button>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5" />Change Password</CardTitle>
          <CardDescription>Update your password for security</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              <FormField control={passwordForm.control} name="currentPassword" render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input type={showCurrentPassword ? "text" : "password"} className="pl-10 pr-10" {...field} />
                      <PasswordToggle show={showCurrentPassword} onToggle={() => setShowCurrentPassword(!showCurrentPassword)} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={passwordForm.control} name="newPassword" render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input type={showNewPassword ? "text" : "password"} className="pl-10 pr-10" {...field} onChange={(e) => { field.onChange(e); handleNewPasswordChange(e.target.value); }} />
                      <PasswordToggle show={showNewPassword} onToggle={() => setShowNewPassword(!showNewPassword)} />
                    </div>
                  </FormControl>
                  <PasswordStrengthIndicator password={newPassword} strength={passwordStrength} leakCheck={leakCheck} />
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={passwordForm.control} name="confirmPassword" render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input type={showConfirmPassword ? "text" : "password"} className="pl-10 pr-10" {...field} />
                      <PasswordToggle show={showConfirmPassword} onToggle={() => setShowConfirmPassword(!showConfirmPassword)} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit" disabled={isPasswordLoading}>
                {isPasswordLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Update Password
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
