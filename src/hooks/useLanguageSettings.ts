import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface LanguageSetting {
  id: string;
  language_code: string;
  language_name: string;
  native_name: string;
  flag_emoji: string;
  enabled: boolean;
  is_default: boolean;
  sort_order: number;
  created_at: string;
}

export function useLanguageSettings() {
  const queryClient = useQueryClient();

  const { data: languages = [], isLoading } = useQuery({
    queryKey: ["language-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("language_settings" as any)
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data || []) as unknown as LanguageSetting[];
    },
  });

  const enabledLanguages = languages.filter((l) => l.enabled);
  const defaultLanguage = languages.find((l) => l.is_default) || enabledLanguages[0];

  const toggleLanguage = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const { error } = await supabase
        .from("language_settings" as any)
        .update({ enabled } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["language-settings"] });
      toast.success("Language updated");
    },
    onError: () => toast.error("Failed to update language"),
  });

  const setDefault = useMutation({
    mutationFn: async (id: string) => {
      // unset all defaults first
      await supabase
        .from("language_settings" as any)
        .update({ is_default: false } as any)
        .neq("id", "00000000-0000-0000-0000-000000000000"); // update all
      const { error } = await supabase
        .from("language_settings" as any)
        .update({ is_default: true, enabled: true } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["language-settings"] });
      toast.success("Default language updated");
    },
    onError: () => toast.error("Failed to set default"),
  });

  const addLanguage = useMutation({
    mutationFn: async (lang: {
      language_code: string;
      language_name: string;
      native_name: string;
      flag_emoji: string;
    }) => {
      const maxSort = languages.length > 0 ? Math.max(...languages.map((l) => l.sort_order)) + 1 : 0;
      const { error } = await supabase
        .from("language_settings" as any)
        .insert({ ...lang, sort_order: maxSort, enabled: true, is_default: false } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["language-settings"] });
      toast.success("Language added");
    },
    onError: (e: any) => toast.error(e?.message?.includes("duplicate") ? "Language code already exists" : "Failed to add language"),
  });

  const deleteLanguage = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("language_settings" as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["language-settings"] });
      toast.success("Language deleted");
    },
    onError: () => toast.error("Failed to delete language"),
  });

  return {
    languages,
    enabledLanguages,
    defaultLanguage,
    isLoading,
    toggleLanguage,
    setDefault,
    addLanguage,
    deleteLanguage,
  };
}
