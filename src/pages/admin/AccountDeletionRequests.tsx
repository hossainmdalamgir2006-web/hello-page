import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CheckCircle, XCircle, Clock, Loader2, UserX, AlertTriangle, Shield, TimerOff } from 'lucide-react';
import { formatDistanceToNow, format, differenceInDays, addDays } from 'date-fns';

interface DeletionRequest {
  id: string;
  user_id: string;
  reason: string | null;
  status: string;
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

interface UserProfile {
  user_id: string;
  email: string | null;
  full_name: string | null;
}

const PURGE_DAYS = 30;

const getInitials = (name: string) =>
  name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

export default function AccountDeletionRequests() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<DeletionRequest | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<'approve' | 'reject' | null>(null);
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ done: 0, total: 0 });

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['account-deletion-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('account_deletion_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as DeletionRequest[];
    },
  });

  // Fetch profiles for all user_ids in requests
  const userIds = useMemo(() => requests.map((r) => r.user_id), [requests]);
  const { data: profiles = [] } = useQuery({
    queryKey: ['deletion-request-profiles', userIds],
    queryFn: async () => {
      if (userIds.length === 0) return [];
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, email, full_name')
        .in('user_id', userIds);
      if (error) throw error;
      return data as UserProfile[];
    },
    enabled: userIds.length > 0,
  });

  const profileMap = useMemo(() => {
    const m = new Map<string, UserProfile>();
    profiles.forEach((p) => m.set(p.user_id, p));
    return m;
  }, [profiles]);

  const pendingRequests = useMemo(() => requests.filter((r) => r.status === 'pending'), [requests]);
  const pendingCount = pendingRequests.length;
  const allPendingSelected =
    pendingRequests.length > 0 && pendingRequests.every((r) => selectedIds.has(r.id));

  const toggleAllPending = () => {
    if (allPendingSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pendingRequests.map((r) => r.id)));
    }
  };

  const toggleOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleAction = async () => {
    if (!selectedRequest || !actionType) return;
    setProcessing(true);
    try {
      if (actionType === 'approve') {
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session?.access_token) {
          throw new Error('No active session. Please sign in again.');
        }
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-user-account`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${sessionData.session.access_token}`,
              apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            },
            body: JSON.stringify({
              request_id: selectedRequest.id,
              admin_notes: adminNotes || null,
            }),
          }
        );
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Failed to delete account');
        toast({
          title: 'Account Deleted',
          description: 'The user account and all associated data have been permanently deleted.',
        });
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        const { error } = await supabase
          .from('account_deletion_requests')
          .update({
            status: 'rejected',
            admin_notes: adminNotes || null,
            reviewed_by: user?.id || null,
            reviewed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', selectedRequest.id);
        if (error) throw error;
        toast({
          title: 'Request Rejected',
          description: 'The account deletion request has been rejected.',
        });
      }
      queryClient.invalidateQueries({ queryKey: ['account-deletion-requests'] });
      setSelectedRequest(null);
      setActionType(null);
      setAdminNotes('');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedIds.size === 0) return;
    setBulkProcessing(true);
    const ids = Array.from(selectedIds);
    setBulkProgress({ done: 0, total: ids.length });

    try {
      if (bulkAction === 'reject') {
        const { data: { user } } = await supabase.auth.getUser();
        const { error } = await supabase
          .from('account_deletion_requests')
          .update({
            status: 'rejected',
            admin_notes: adminNotes || 'Bulk rejected by admin',
            reviewed_by: user?.id || null,
            reviewed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .in('id', ids);
        if (error) throw error;
        toast({
          title: 'Bulk Reject Complete',
          description: `${ids.length} request(s) rejected.`,
        });
      } else {
        // Bulk approve: sequentially call edge function
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session?.access_token) {
          throw new Error('No active session. Please sign in again.');
        }
        let succeeded = 0;
        let failed = 0;
        for (let i = 0; i < ids.length; i++) {
          try {
            const response = await fetch(
              `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-user-account`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${sessionData.session.access_token}`,
                  apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
                },
                body: JSON.stringify({
                  request_id: ids[i],
                  admin_notes: adminNotes || 'Bulk approved by admin',
                }),
              }
            );
            if (response.ok) succeeded++;
            else failed++;
          } catch {
            failed++;
          }
          setBulkProgress({ done: i + 1, total: ids.length });
        }
        toast({
          title: 'Bulk Approve Complete',
          description: `${succeeded} succeeded, ${failed} failed.`,
          variant: failed > 0 ? 'destructive' : 'default',
        });
      }
      queryClient.invalidateQueries({ queryKey: ['account-deletion-requests'] });
      setSelectedIds(new Set());
      setBulkAction(null);
      setAdminNotes('');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setBulkProcessing(false);
      setBulkProgress({ done: 0, total: 0 });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="gap-1 text-yellow-600 border-yellow-300 bg-yellow-50 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-800"><Clock className="h-3 w-3" />Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="gap-1 text-green-600 border-green-300 bg-green-50 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800"><CheckCircle className="h-3 w-3" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="gap-1 text-red-600 border-red-300 bg-red-50 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800"><XCircle className="h-3 w-3" />Rejected</Badge>;
      case 'expired':
        return <Badge variant="outline" className="gap-1 text-muted-foreground border-border bg-muted/40"><TimerOff className="h-3 w-3" />Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getExpireCountdown = (createdAt: string) => {
    const expireDate = addDays(new Date(createdAt), PURGE_DAYS);
    const daysLeft = differenceInDays(expireDate, new Date());
    if (daysLeft <= 0) return null;
    const isUrgent = daysLeft <= 7;
    return (
      <span className={`inline-flex items-center gap-1 text-xs ${isUrgent ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
        <Clock className="h-3 w-3" />
        {daysLeft}d to auto-expire
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Account Deletion Requests"
        description="Review and manage user account deletion requests"
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: 'Pending', value: pendingCount, icon: Clock, border: 'border-l-warning', iconBg: 'bg-warning/10 text-warning', cardBg: 'bg-warning/5 dark:bg-warning/10' },
          { label: 'Approved', value: requests.filter((r) => r.status === 'approved').length, icon: CheckCircle, border: 'border-l-success', iconBg: 'bg-success/10 text-success', cardBg: 'bg-success/5 dark:bg-success/10' },
          { label: 'Rejected', value: requests.filter((r) => r.status === 'rejected').length, icon: XCircle, border: 'border-l-destructive', iconBg: 'bg-destructive/10 text-destructive', cardBg: 'bg-destructive/5 dark:bg-destructive/10' },
          { label: 'Expired', value: requests.filter((r) => r.status === 'expired').length, icon: TimerOff, border: 'border-l-muted-foreground', iconBg: 'bg-muted text-muted-foreground', cardBg: 'bg-muted/30' },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`rounded-xl border border-border/50 p-4 border-l-[3px] transition-all duration-300 hover:shadow-md hover:border-border hover:-translate-y-0.5 ${stat.border} ${stat.cardBg}`}
          >
            <div className="flex items-center gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg shrink-0 ${stat.iconBg}`}>
                <stat.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xl font-bold tracking-tight text-foreground">{stat.value}</p>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 p-3">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-primary" />
            <span className="font-medium">{selectedIds.size} pending request(s) selected</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="text-green-600 border-green-300 hover:bg-green-50 dark:hover:bg-green-950/30"
              onClick={() => setBulkAction('approve')}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Bulk Approve ({selectedIds.size})
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-950/30"
              onClick={() => setBulkAction('reject')}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Bulk Reject ({selectedIds.size})
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserX className="h-5 w-5" />
            Deletion Requests
            {pendingCount > 0 && (
              <Badge variant="destructive" className="ml-2">{pendingCount} pending</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No deletion requests yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        checked={allPendingSelected}
                        onCheckedChange={toggleAllPending}
                        disabled={pendingRequests.length === 0}
                        aria-label="Select all pending"
                      />
                    </TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Reviewed</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => {
                    const profile = profileMap.get(request.user_id);
                    const displayName = profile?.full_name || profile?.email?.split('@')[0] || 'Unknown User';
                    const isPending = request.status === 'pending';
                    return (
                      <TableRow key={request.id}>
                        <TableCell>
                          {isPending && (
                            <Checkbox
                              checked={selectedIds.has(request.id)}
                              onCheckedChange={() => toggleOne(request.id)}
                              aria-label={`Select ${displayName}`}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3 min-w-[180px]">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {getInitials(displayName)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{displayName}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                {profile?.email || `${request.user_id.slice(0, 8)}...`}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          <p className="truncate text-sm">
                            {request.reason || <span className="text-muted-foreground italic">No reason provided</span>}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {getStatusBadge(request.status)}
                            {isPending && getExpireCountdown(request.created_at)}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {request.reviewed_at
                            ? format(new Date(request.reviewed_at), 'MMM d, yyyy')
                            : '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          {isPending ? (
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 border-green-300 hover:bg-green-50 dark:hover:bg-green-950/30"
                                onClick={() => { setSelectedRequest(request); setActionType('approve'); }}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-950/30"
                                onClick={() => { setSelectedRequest(request); setActionType('reject'); }}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              {request.admin_notes && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => { setSelectedRequest(request); setActionType(null); }}
                                >
                                  View Notes
                                </Button>
                              )}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Single Action Dialog */}
      <Dialog open={!!selectedRequest && !!actionType} onOpenChange={(open) => { if (!open) { setSelectedRequest(null); setActionType(null); setAdminNotes(''); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {actionType === 'approve' ? (
                <><AlertTriangle className="h-5 w-5 text-yellow-500" />Approve Account Deletion</>
              ) : (
                <><XCircle className="h-5 w-5 text-red-500" />Reject Deletion Request</>
              )}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve'
                ? 'Are you sure you want to approve this account deletion? This action will permanently delete the account.'
                : 'Provide a reason for rejecting this request. The user will be able to see your notes.'}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              {selectedRequest.reason && (
                <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                  <p className="text-xs font-medium text-muted-foreground mb-1">User's Reason</p>
                  <p className="text-sm">{selectedRequest.reason}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Admin Notes {actionType === 'reject' && <span className="text-muted-foreground">(recommended)</span>}</label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder={actionType === 'approve' ? 'Optional notes...' : 'Reason for rejection...'}
                  className="min-h-[80px]"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => { setSelectedRequest(null); setActionType(null); setAdminNotes(''); }}>
              Cancel
            </Button>
            <Button
              variant={actionType === 'approve' ? 'destructive' : 'default'}
              onClick={handleAction}
              disabled={processing}
            >
              {processing ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Processing...</>
              ) : actionType === 'approve' ? (
                <><CheckCircle className="h-4 w-4 mr-2" />Confirm Approval</>
              ) : (
                <><XCircle className="h-4 w-4 mr-2" />Confirm Rejection</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Action Confirmation Dialog */}
      <Dialog open={!!bulkAction} onOpenChange={(open) => { if (!open && !bulkProcessing) { setBulkAction(null); setAdminNotes(''); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {bulkAction === 'approve' ? (
                <><AlertTriangle className="h-5 w-5 text-yellow-500" />Bulk Approve {selectedIds.size} Request(s)</>
              ) : (
                <><XCircle className="h-5 w-5 text-red-500" />Bulk Reject {selectedIds.size} Request(s)</>
              )}
            </DialogTitle>
            <DialogDescription>
              {bulkAction === 'approve'
                ? `This will permanently delete ${selectedIds.size} user account(s). This action cannot be undone.`
                : `This will reject ${selectedIds.size} pending deletion request(s).`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <label className="text-sm font-medium">Admin Notes (applied to all)</label>
            <Textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Optional notes..."
              className="min-h-[80px]"
              disabled={bulkProcessing}
            />
          </div>

          {bulkProcessing && bulkProgress.total > 0 && (
            <div className="text-sm text-muted-foreground">
              Processing {bulkProgress.done} / {bulkProgress.total}...
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => { setBulkAction(null); setAdminNotes(''); }} disabled={bulkProcessing}>
              Cancel
            </Button>
            <Button
              variant={bulkAction === 'approve' ? 'destructive' : 'default'}
              onClick={handleBulkAction}
              disabled={bulkProcessing}
            >
              {bulkProcessing ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Processing...</>
              ) : bulkAction === 'approve' ? (
                <><CheckCircle className="h-4 w-4 mr-2" />Confirm Bulk Approval</>
              ) : (
                <><XCircle className="h-4 w-4 mr-2" />Confirm Bulk Rejection</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Notes Dialog */}
      <Dialog open={!!selectedRequest && !actionType} onOpenChange={(open) => { if (!open) setSelectedRequest(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Admin Notes</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Status:</span>
                {getStatusBadge(selectedRequest.status)}
              </div>
              {selectedRequest.reason && (
                <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                  <p className="text-xs font-medium text-muted-foreground mb-1">User's Reason</p>
                  <p className="text-sm">{selectedRequest.reason}</p>
                </div>
              )}
              {selectedRequest.admin_notes && (
                <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Admin Notes</p>
                  <p className="text-sm">{selectedRequest.admin_notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedRequest(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
