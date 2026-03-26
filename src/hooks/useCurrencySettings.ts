import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface CurrencySetting {
  id: string;
  code: string;
  symbol: string;
  name: string;
  rate_to_bdt: number;
  is_enabled: boolean;
  is_default: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export function useCurrencySettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: currencies = [], isLoading } = useQuery({
    queryKey: ["currency-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("currency_settings" as any)
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return (data as any[]) as CurrencySetting[];
    },
    staleTime: 10 * 60 * 1000,
  });

  const enabledCurrencies = currencies.filter((c) => c.is_enabled);
  const defaultCurrency = currencies.find((c) => c.is_default) || currencies[0];

  const updateCurrency = useMutation({
    mutationFn: async (updates: Partial<CurrencySetting> & { id: string }) => {
      const { id, ...rest } = updates;
      const { error } = await supabase
        .from("currency_settings" as any)
        .update({ ...rest, updated_at: new Date().toISOString() } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currency-settings"] });
      toast({ title: "Currency updated" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const addCurrency = useMutation({
    mutationFn: async (c: { code: string; symbol: string; name: string; rate_to_bdt: number }) => {
      const { error } = await supabase
        .from("currency_settings" as any)
        .insert({ ...c, sort_order: currencies.length } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currency-settings"] });
      toast({ title: "Currency added" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteCurrency = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("currency_settings" as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currency-settings"] });
      toast({ title: "Currency deleted" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const setDefault = useMutation({
    mutationFn: async (id: string) => {
      // Unset all defaults first
      await supabase
        .from("currency_settings" as any)
        .update({ is_default: false, updated_at: new Date().toISOString() } as any)
        .neq("id", id);
      const { error } = await supabase
        .from("currency_settings" as any)
        .update({ is_default: true, updated_at: new Date().toISOString() } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currency-settings"] });
      toast({ title: "Default currency updated" });
    },
  });

  return {
    currencies,
    enabledCurrencies,
    defaultCurrency,
    isLoading,
    updateCurrency,
    addCurrency,
    deleteCurrency,
    setDefault,
  };
}
