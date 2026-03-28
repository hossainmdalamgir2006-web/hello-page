import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Shield, Trash2, Loader2, AlertTriangle, Monitor, History } from 'lucide-react';
import { TwoFactorSetup } from '@/components/profile/TwoFactorSetup';
import { LoginActivity } from '@/components/profile/LoginActivity';
import { SessionManagement } from '@/components/profile/SessionManagement';

export function SecurityTab() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    setDeleting(true);
    try {
      if (user) {
        await supabase.from('user_addresses').delete().eq('user_id', user.id);
        await supabase.from('user_sessions').delete().eq('user_id', user.id);
        await supabase.from('profiles').delete().eq('user_id', user.id);
      }
      await signOut();
      toast({ title: 'Account Deleted', description: 'Your account data has been removed. You have been signed out.' });
      navigate('/');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to delete account', variant: 'destructive' });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Two-Factor Authentication */}
          <div className="rounded-xl border border-border/50 bg-card p-5 hover:shadow-md transition-all border-l-[3px] border-l-primary">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-lg bg-primary/10 p-2"><Shield className="h-5 w-5 text-primary" /></div>
              <div>
                <h3 className="font-semibold">Two-Factor Authentication</h3>
                <p className="text-xs text-muted-foreground">Add an extra layer of security to your account</p>
              </div>
            </div>
            <TwoFactorSetup />
          </div>

          {/* Active Sessions */}
          <div className="rounded-xl border border-border/50 bg-card p-5 hover:shadow-md transition-all border-l-[3px] border-l-primary">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-lg bg-primary/10 p-2"><Monitor className="h-5 w-5 text-primary" /></div>
              <div>
                <h3 className="font-semibold">Active Sessions</h3>
                <p className="text-xs text-muted-foreground">Manage your active login sessions</p>
              </div>
            </div>
            <SessionManagement />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Login Activity */}
          <div className="rounded-xl border border-border/50 bg-card p-5 hover:shadow-md transition-all border-l-[3px] border-l-accent">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-lg bg-accent/10 p-2"><History className="h-5 w-5 text-accent" /></div>
              <div>
                <h3 className="font-semibold">Login Activity</h3>
                <p className="text-xs text-muted-foreground">Recent login history for your account</p>
              </div>
            </div>
            <LoginActivity />
          </div>

          {/* Delete Account */}
          <div className="rounded-xl border border-destructive/30 bg-card p-5 hover:shadow-md transition-all border-l-[3px] border-l-destructive">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-lg bg-destructive/10 p-2"><Trash2 className="h-5 w-5 text-destructive" /></div>
              <div>
                <h3 className="font-semibold text-destructive">Delete Account</h3>
                <p className="text-xs text-muted-foreground">Permanently delete your account and all data</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/5 border border-destructive/20 mb-4">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-destructive">Warning</p>
                <p className="text-muted-foreground mt-1">
                  Deleting your account will permanently remove all your data including orders, addresses,
                  wishlist items, and preferences. This action is irreversible.
                </p>
              </div>
            </div>
            <Button variant="destructive" onClick={() => setDeleteConfirmOpen(true)}>
              <Trash2 className="h-4 w-4 mr-2" />Delete My Account
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                This will permanently delete your account and all your data.
                You will lose access to your order history, saved addresses, and all other account information.
              </p>
              <div className="space-y-2">
                <p className="font-medium text-foreground text-sm">
                  Type <span className="font-mono text-destructive">DELETE</span> to confirm:
                </p>
                <Input
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Type DELETE"
                  className="font-mono"
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirmText('')}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText !== 'DELETE' || deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Deleting...</>) : 'Delete Account Forever'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
