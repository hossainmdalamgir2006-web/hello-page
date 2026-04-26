import { useState, useMemo } from "react";
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
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { logAuditAction } from "@/lib/auditLog";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";

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

  return (
    <>
      <SEOHead title="Product Q&A" noIndex />
      <div className="space-y-6">
        <AdminPageHeader
          title="Product Q&A"
          description="Answer customer questions about your products"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <MessageCircleQuestion className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{counts.total}</p>
                <p className="text-xs text-muted-foreground">Total Questions</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{counts.pending}</p>
                <p className="text-xs text-muted-foreground">Awaiting Answer</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{counts.answered}</p>
                <p className="text-xs text-muted-foreground">Answered</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
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
            <SelectContent>
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
                  ? "No questions yet. Customers' product questions will appear here."
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
              return (
                <Card key={q.id} className="overflow-hidden">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <span className="shrink-0 mt-0.5 h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                          Q
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground break-words">
                            {q.question}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground flex-wrap">
                            <span>{q.asked_by_name}</span>
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
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400">
                            Answered
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400">
                            Pending
                          </Badge>
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

                    {hasAnswer && !isEditing && (
                      <div className="pl-10">
                        <div className="flex items-start gap-3 rounded-lg bg-muted/40 p-3">
                          <span className="shrink-0 mt-0.5 h-6 w-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-xs font-bold">
                            A
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                              {q.answer}
                            </p>
                            {q.answered_at && (
                              <p className="text-xs text-muted-foreground mt-1.5">
                                Answered {formatDistanceToNow(new Date(q.answered_at), { addSuffix: true })}
                                {(q.helpful_count || 0) > 0 && ` · ${q.helpful_count} found helpful`}
                              </p>
                            )}
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => handleEditAnswered(q)}>
                            Edit
                          </Button>
                        </div>
                      </div>
                    )}

                    {(!hasAnswer || isEditing) && (
                      <div className="pl-10 space-y-2">
                        <Textarea
                          placeholder="Write a helpful answer..."
                          rows={3}
                          value={draft ?? ""}
                          onChange={(e) =>
                            setAnswerDrafts((d) => ({ ...d, [q.id]: e.target.value }))
                          }
                          className="resize-none"
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
                  </CardContent>
                </Card>
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
