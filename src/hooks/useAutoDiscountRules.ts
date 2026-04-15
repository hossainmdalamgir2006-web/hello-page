import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AutoDiscountRule {
  id: string;
  name: string;
  description: string | null;
  rule_type: string;
  conditions: any;
  discount_type: string;
  discount_value: number;
  min_purchase: number | null;
  max_discount: number | null;
  priority: number;
  is_active: boolean;
  starts_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
  size?: string;
  color?: string;
}

export function useAutoDiscountRules() {
  const [rules, setRules] = useState<AutoDiscountRule[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRules = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("auto_discount_rules")
        .select("*")
        .is("deleted_at", null)
        .order("priority", { ascending: false });

      if (error) throw error;
      setRules((data as AutoDiscountRule[]) || []);
    } catch (error: any) {
      console.error("Error fetching auto discount rules:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const addRule = async (rule: Omit<AutoDiscountRule, "id" | "created_at" | "updated_at">) => {
    try {
      const { data, error } = await supabase
        .from("auto_discount_rules")
        .insert(rule as any)
        .select()
        .single();

      if (error) throw error;
      setRules((prev) => [...prev, data as AutoDiscountRule]);
      toast.success("Auto discount rule created");
      return data as AutoDiscountRule;
    } catch (error: any) {
      toast.error(error.message || "Failed to create rule");
      throw error;
    }
  };

  const updateRule = async (id: string, updates: Partial<AutoDiscountRule>) => {
    try {
      const { error } = await supabase
        .from("auto_discount_rules")
        .update(updates as any)
        .eq("id", id);

      if (error) throw error;
      setRules((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
      toast.success("Auto discount rule updated");
    } catch (error: any) {
      toast.error(error.message || "Failed to update rule");
      throw error;
    }
  };

  const deleteRule = async (id: string) => {
    try {
      const { error } = await supabase.from("auto_discount_rules").delete().eq("id", id);
      if (error) throw error;
      setRules((prev) => prev.filter((r) => r.id !== id));
      toast.success("Auto discount rule deleted");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete rule");
      throw error;
    }
  };

  const getActiveRules = () => {
    const now = new Date();
    return rules.filter((r) => {
      if (!r.is_active) return false;
      if (r.starts_at && new Date(r.starts_at) > now) return false;
      if (r.expires_at && new Date(r.expires_at) < now) return false;
      return true;
    });
  };

  const calculateDiscount = (cartTotal: number, cartItems?: CartItem[]) => {
    const activeRules = getActiveRules();
    let totalDiscount = 0;

    for (const rule of activeRules) {
      let applies = false;
      let baseAmount = cartTotal;

      switch (rule.rule_type) {
        case "cart_total":
          applies = !rule.min_purchase || cartTotal >= rule.min_purchase;
          break;

        case "first_order":
          // Always applies for now — real check needs order history
          applies = true;
          break;

        case "bulk_purchase":
          if (cartItems) {
            const totalQty = cartItems.reduce((sum, item) => sum + item.quantity, 0);
            const minQty = rule.conditions?.min_quantity || rule.min_purchase || 0;
            applies = totalQty >= minQty;
          }
          break;

        case "item_quantity":
          if (cartItems) {
            const itemCount = cartItems.length;
            const minItems = rule.conditions?.min_quantity || rule.min_purchase || 0;
            applies = itemCount >= minItems;
          }
          break;

        case "category_based":
          if (cartItems && rule.conditions?.categories?.length > 0) {
            const matchingItems = cartItems.filter(item =>
              rule.conditions.categories.includes(item.category)
            );
            if (matchingItems.length > 0) {
              applies = true;
              baseAmount = matchingItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
            }
          }
          break;

        case "time_based":
          // Time validation is already handled by getActiveRules (starts_at/expires_at)
          applies = true;
          break;

        default:
          applies = false;
      }

      if (applies) {
        let discount = rule.discount_type === "percentage"
          ? (baseAmount * rule.discount_value) / 100
          : rule.discount_value;

        if (rule.max_discount) {
          discount = Math.min(discount, rule.max_discount);
        }
        totalDiscount += discount;
      }
    }

    return totalDiscount;
  };

  return {
    rules,
    loading,
    refetch: fetchRules,
    addRule,
    updateRule,
    deleteRule,
    getActiveRules,
    calculateDiscount,
  };
}
