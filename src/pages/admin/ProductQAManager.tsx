import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DeleteConfirmModal } from "@/components/ui/DeleteConfirmModal";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  MessageCircleQuestion, Search, Trash2, Send, Package, Clock, CheckCircle2,
  History, UserCircle2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { formatDistanceToNow, format } from "date-fns";
import { logAuditAction } from "@/lib/auditLog";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";
import { cn } from "@/lib/utils";

type QARow = {
  id: string;
  product_id: string;
  question: string;
  answer: string | null;
  asked_by_name: string;
  user_id: string | null;
  helpful_count: number | null;
  answered_at: string | null;
  answered_by: string | null;
  created_at: string;
  updated_at?: string | null;
  products?: { name: string; slug: string } | null;
};

type StatusFilter = "all" | "pending" | "answered";

const answerSchema = z
  .string()
  .trim()
  .min(2, "Answer must be at least 2 characters")
  .max(2000, "Answer must be under 2000 characters");

export default function ProductQAManager() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [answerDrafts, setAnswerDrafts] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [historyOpenId, setHistoryOpenId] = useState<string | null>(null);

  const { data: questions = [], isLoading } = useQuery({
    queryKey: ["admin-product-questions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_questions" as any)
        .select("*, products(name, slug)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as any[]) as QARow[];
    },
  });

  // Collect unique answerer ids → fetch profiles for audit panel
  const answererIds = useMemo(
    () => Array.from(new Set(questions.map((q) => q.answered_by).filter(Boolean) as string[])),
    [questions]
  );

  const { data: answererProfiles = {} } = useQuery({
    queryKey: ["product-questions-answerers", answererIds],
    enabled: answererIds.length > 0,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("user_id, full_name, email")
        .in("user_id", answererIds);
      const map: Record<string, { full_name: string | null; email: string | null }> = {};
      (data || []).forEach((p: any) => {
        map[p.user_id] = { full_name: p.full_name, email: p.email };
      });
      return map;
    },
  });

  // Realtime subscription — refresh list when questions change
  useEffect(() => {
    const channel = supabase
      .channel("product-questions-admin")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "product_questions" },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ["admin-product-questions"] });
          if (payload.eventType === "INSERT") {
            toast.info("New customer question received", {
              description: (payload.new as any)?.question?.slice(0, 80),
            });
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const filtered = useMemo(() => {
    return questions.filter((q) => {
      if (statusFilter === "pending" && q.answer) return false;
      if (statusFilter === "answered" && !q.answer) return false;
      if (search.trim()) {
        const s = search.toLowerCase();
        const hay = `${q.question} ${q.answer || ""} ${q.asked_by_name} ${q.products?.name || ""}`.toLowerCase();
        if (!hay.includes(s)) return false;
      }
      return true;
    });
  }, [questions, statusFilter, search]);

  const counts = useMemo(() => ({
    total: questions.length,
    pending: questions.filter((q) => !q.answer).length,
    answered: questions.filter((q) => q.answer).length,
  }), [questions]);

  const answerMutation = useMutation({
    mutationFn: async ({ id, answer }: { id: string; answer: string }) => {
      const { error } = await supabase
        .from("product_questions" as any)
        .update({
          answer,
          answered_at: new Date().toISOString(),
          answered_by: user?.id || null,
        })
        .eq("id", id);
      if (error) throw error;
      logAuditAction({
        action: "update",
        resource_type: "product_question",
        resource_id: id,
        description: `Answered product question`,
      });
    },
    onSuccess: (_data, vars) => {
      toast.success("Answer published");
      setAnswerDrafts((d) => {
        const { [vars.id]: _, ...rest } = d;
        return rest;
      });
      queryClient.invalidateQueries({ queryKey: ["admin-product-questions"] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to save answer"),
    onSettled: () => setSavingId(null),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("product_questions" as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
      logAuditAction({
        action: "delete",
        resource_type: "product_question",
        resource_id: id,
        description: `Deleted product question`,
      });
    },
    onSuccess: () => {
      toast.success("Question deleted");
      setDeleteId(null);
      queryClient.invalidateQueries({ queryKey: ["admin-product-questions"] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to delete"),
  });

  const handleSubmitAnswer = (id: string) => {
    const draft = (answerDrafts[id] || "").trim();
    const parsed = answerSchema.safeParse(draft);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setSavingId(id);
    answerMutation.mutate({ id, answer: parsed.data });
  };

  const handleEditAnswered = (q: QARow) => {
    setAnswerDrafts((d) => ({ ...d, [q.id]: q.answer || "" }));
  };

  const getAnswererLabel = (uid: string | null) => {
    if (!uid) return "Staff";
    const p = answererProfiles[uid];
    return p?.full_name || p?.email || "Staff member";
  };

  const statCards = [
    { label: "Total Questions", value: counts.total, icon: MessageCircleQuestion, color: "primary" },
    { label: "Awaiting Answer", value: counts.pending, icon: Clock, color: "yellow" },
    { label: "Answered", value: counts.answered, icon: CheckCircle2, color: "success" },
  ];

  const borderMap: Record<string, string> = { primary: "border-l-primary", yellow: "border-l-yellow-500", success: "border-l-success" };
  const bgMap: Record<string, string> = { primary: "bg-primary/10", yellow: "bg-yellow-500/10", success: "bg-success/10" };
  const textMap: Record<string, string> = { primary: "text-primary", yellow: "text-yellow-500", success: "text-success" };
  const cardBgMap: Record<string, string> = { primary: "bg-primary/5 dark:bg-primary/10", yellow: "bg-yellow-500/5 dark:bg-yellow-500/10", success: "bg-success/5 dark:bg-success/10" };

  return (
    <>
      <SEOHead title="Product Q&A" noIndex />
      <div className="space-y-6">
        <AdminPageHeader
          title="Product Q&A"
          description="Answer customer questions about your products in real time"
        />

        {/* Stat Cards — Reviews-page style */}
        <div className="grid gap-4 sm:grid-cols-3">
          {statCards.map((card) => {
            const IconComp = card.icon;
            return (
              <div
                key={card.label}
                className={cn(
                  "group relative rounded-xl border border-border/50 p-4 sm:p-5 transition-all duration-300",
                  "hover:shadow-md hover:border-border hover:-translate-y-0.5 border-l-[3px]",
                  borderMap[card.color], cardBgMap[card.color], "animate-fade-in"
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{card.label}</p>
                    <p className="text-lg sm:text-xl font-bold tracking-tight mt-1">{card.value}</p>
                  </div>
                  <div className={cn("rounded-lg p-2", bgMap[card.color])}>
                    <IconComp className={cn("h-5 w-5", textMap[card.color])} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search question, answer, customer, product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="all">All Questions</SelectItem>
              <SelectItem value="pending">Awaiting Answer</SelectItem>
              <SelectItem value="answered">Answered</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <MessageCircleQuestion className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">
                {questions.length === 0
                  ? "No questions yet. Customers' product questions will appear here in real time."
                  : "No questions match your filters."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((q) => {
              const draft = answerDrafts[q.id];
              const isEditing = draft !== undefined;
              const hasAnswer = !!q.answer;
              const accent = hasAnswer ? "success" : "yellow";
              const showHistory = historyOpenId === q.id;

              return (
                <div
                  key={q.id}
                  className={cn(
                    "group relative rounded-xl border border-border/50 p-4 sm:p-5 transition-all duration-300",
                    "hover:shadow-md hover:border-border border-l-[3px]",
                    borderMap[accent], cardBgMap[accent], "animate-fade-in"
                  )}
                >
                  <div className="space-y-4">
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className={cn("shrink-0 rounded-lg p-2", bgMap[accent])}>
                          <MessageCircleQuestion className={cn("h-5 w-5", textMap[accent])} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground break-words leading-relaxed">
                            {q.question}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground flex-wrap">
                            <span className="inline-flex items-center gap-1">
                              <UserCircle2 className="h-3 w-3" />
                              {q.asked_by_name}
                            </span>
                            <span>·</span>
                            <span>{formatDistanceToNow(new Date(q.created_at), { addSuffix: true })}</span>
                            {q.products && (
                              <>
                                <span>·</span>
                                <Link
                                  to={`/product/${q.products.slug}`}
                                  target="_blank"
                                  className="inline-flex items-center gap-1 text-primary hover:underline"
                                >
                                  <Package className="h-3 w-3" />
                                  {q.products.name}
                                </Link>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {hasAnswer ? (
                          <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                            Answered
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/30">
                            Pending
                          </Badge>
                        )}
                        {hasAnswer && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => setHistoryOpenId(showHistory ? null : q.id)}
                            title="View history"
                          >
                            <History className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteId(q.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Existing answer (read-only) */}
                    {hasAnswer && !isEditing && (
                      <div className="pl-11">
                        <div className="flex items-start gap-3 rounded-lg bg-background/60 dark:bg-background/40 border border-border/50 p-3">
                          <span className="shrink-0 mt-0.5 h-6 w-6 rounded-full bg-success/15 text-success flex items-center justify-center text-xs font-bold">
                            A
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                              {q.answer}
                            </p>
                            {q.answered_at && (
                              <p className="text-xs text-muted-foreground mt-1.5">
                                {(q.helpful_count || 0) > 0 && `${q.helpful_count} found helpful`}
                              </p>
                            )}
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => handleEditAnswered(q)}>
                            Edit
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Audit history panel */}
                    {hasAnswer && showHistory && (
                      <div className="pl-11 animate-fade-in">
                        <div className="rounded-lg border border-border/60 bg-muted/30 p-3 space-y-2">
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <History className="h-3.5 w-3.5" />
                            Audit History
                          </p>
                          <div className="space-y-1.5 text-xs">
                            <div className="flex items-start gap-2">
                              <span className="text-muted-foreground shrink-0">•</span>
                              <div>
                                <span className="font-medium text-foreground">Question asked</span>
                                <span className="text-muted-foreground"> by {q.asked_by_name}</span>
                                <span className="text-muted-foreground"> — {format(new Date(q.created_at), "MMM d, yyyy 'at' h:mm a")}</span>
                              </div>
                            </div>
                            {q.answered_at && (
                              <div className="flex items-start gap-2">
                                <span className="text-muted-foreground shrink-0">•</span>
                                <div>
                                  <span className="font-medium text-foreground">Answered</span>
                                  <span className="text-muted-foreground"> by </span>
                                  <span className="font-medium text-primary">{getAnswererLabel(q.answered_by)}</span>
                                  <span className="text-muted-foreground"> — {format(new Date(q.answered_at), "MMM d, yyyy 'at' h:mm a")}</span>
                                </div>
                              </div>
                            )}
                            {q.updated_at && q.answered_at && new Date(q.updated_at).getTime() - new Date(q.answered_at).getTime() > 5000 && (
                              <div className="flex items-start gap-2">
                                <span className="text-muted-foreground shrink-0">•</span>
                                <div>
                                  <span className="font-medium text-foreground">Last edited</span>
                                  <span className="text-muted-foreground"> — {format(new Date(q.updated_at), "MMM d, yyyy 'at' h:mm a")}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Answer composer */}
                    {(!hasAnswer || isEditing) && (
                      <div className="pl-11 space-y-2">
                        <Textarea
                          placeholder="Write a helpful answer..."
                          rows={3}
                          value={draft ?? ""}
                          onChange={(e) =>
                            setAnswerDrafts((d) => ({ ...d, [q.id]: e.target.value }))
                          }
                          className="resize-none bg-background"
                        />
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs text-muted-foreground">
                            {(draft || "").length}/2000
                          </p>
                          <div className="flex items-center gap-2">
                            {isEditing && hasAnswer && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  setAnswerDrafts((d) => {
                                    const { [q.id]: _, ...rest } = d;
                                    return rest;
                                  })
                                }
                              >
                                Cancel
                              </Button>
                            )}
                            <Button
                              size="sm"
                              onClick={() => handleSubmitAnswer(q.id)}
                              disabled={savingId === q.id || !(draft || "").trim()}
                            >
                              <Send className="h-3.5 w-3.5 mr-1.5" />
                              {savingId === q.id
                                ? "Saving..."
                                : hasAnswer
                                ? "Update Answer"
                                : "Submit Answer"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <DeleteConfirmModal
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Delete this question?"
        description="This permanently removes the question and its answer. This action cannot be undone."
      />
    </>
  );
}
