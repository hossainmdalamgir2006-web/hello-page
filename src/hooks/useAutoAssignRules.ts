import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AutoAssignRule {
  id: string;
  name: string;
  rule_type: string;
  conditions: Record<string, any>;
  assign_to: string | null;
  assign_to_email: string | null;
  is_active: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface CreateRuleData {
  name: string;
  rule_type: string;
  conditions: Record<string, any>;
  assign_to: string | null;
  assign_to_email?: string | null;
  is_active?: boolean;
  priority?: number;
}

export function useAutoAssignRules() {
  const queryClient = useQueryClient();

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ["auto-assign-rules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("auto_assign_rules")
        .select("*")
        .order("priority", { ascending: false });

      if (error) throw error;
      return data as AutoAssignRule[];
    },
  });

  const createRule = useMutation({
    mutationFn: async (ruleData: CreateRuleData) => {
      const { data, error } = await supabase
        .from("auto_assign_rules")
        .insert({
          name: ruleData.name,
          rule_type: ruleData.rule_type,
          conditions: ruleData.conditions as any,
          assign_to: ruleData.assign_to,
          assign_to_email: ruleData.assign_to_email || null,
          is_active: ruleData.is_active ?? true,
          priority: ruleData.priority ?? 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auto-assign-rules"] });
      toast.success("Rule created");
    },
    onError: () => toast.error("Failed to create rule"),
  });

  const updateRule = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AutoAssignRule> & { id: string }) => {
      const { error } = await supabase
        .from("auto_assign_rules")
        .update(updates as any)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auto-assign-rules"] });
      toast.success("Rule updated");
    },
    onError: () => toast.error("Failed to update rule"),
  });

  const deleteRule = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("auto_assign_rules")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auto-assign-rules"] });
      toast.success("Rule deleted");
    },
    onError: () => toast.error("Failed to delete rule"),
  });

  const toggleRule = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("auto_assign_rules")
        .update({ is_active } as any)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auto-assign-rules"] });
    },
    onError: () => toast.error("Failed to toggle rule"),
  });

  // Match function — given subject/message/category/priority, find matching rule
  const findMatchingRule = (params: {
    subject?: string;
    message?: string;
    category?: string;
    priority?: string;
  }): AutoAssignRule | null => {
    const activeRules = rules
      .filter((r) => r.is_active)
      .sort((a, b) => b.priority - a.priority);

    for (const rule of activeRules) {
      const conditions = rule.conditions || {};

      if (rule.rule_type === "keyword") {
        const keywords: string[] = conditions.keywords || [];
        const text = `${params.subject || ""} ${params.message || ""}`.toLowerCase();
        if (keywords.some((kw) => text.includes(kw.toLowerCase()))) {
          return rule;
        }
      }

      if (rule.rule_type === "category") {
        if (conditions.category && params.category === conditions.category) {
          return rule;
        }
      }

      if (rule.rule_type === "priority") {
        if (conditions.priority && params.priority === conditions.priority) {
          return rule;
        }
      }
    }

    return null;
  };

  return {
    rules,
    isLoading,
    createRule: createRule.mutate,
    updateRule: updateRule.mutate,
    deleteRule: deleteRule.mutate,
    toggleRule: toggleRule.mutate,
    findMatchingRule,
    isCreating: createRule.isPending,
  };
}
