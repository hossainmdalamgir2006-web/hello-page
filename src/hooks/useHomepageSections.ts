import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logAuditAction } from "@/lib/auditLog";

export interface HomepageSection {
  id: string;
  section_type: string;
  title: string | null;
  subtitle: string | null;
  badge_text: string | null;
  content: Record<string, any>;
  image_url: string | null;
  is_enabled: boolean;
  sort_order: number;
  starts_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

const QUERY_KEY = ["homepage-sections"];

async function fetchSections(): Promise<HomepageSection[]> {
  const { data, error } = await supabase
    .from("homepage_sections")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching homepage sections:", error);
    return [];
  }
  return (data as any[]) || [];
}

export function useHomepageSections() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: sections = [], isLoading: loading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchSections,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000,
  });

  const getSection = (type: string) => sections.find((s) => s.section_type === type);

  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEY });
  }, [queryClient]);

  const updateSection = async (id: string, updates: Partial<HomepageSection>) => {
    const { error } = await supabase
      .from("homepage_sections")
      .update({ ...updates, updated_at: new Date().toISOString() } as any)
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: "Failed to update section", variant: "destructive" });
      return false;
    }
    logAuditAction({ action: "update", resource_type: "homepage", resource_id: id, description: "Homepage section updated", new_value: updates });
    toast({ title: "Success", description: "Section updated successfully" });
    refetch();
    return true;
  };

  const createSection = async (section: Partial<HomepageSection>) => {
    const { error } = await supabase
      .from("homepage_sections")
      .insert(section as any);

    if (error) {
      toast({ title: "Error", description: "Failed to create section", variant: "destructive" });
      return false;
    }
    toast({ title: "Success", description: "Section created successfully" });
    refetch();
    return true;
  };

  const deleteSection = async (id: string) => {
    const { error } = await supabase
      .from("homepage_sections")
      .delete()
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: "Failed to delete section", variant: "destructive" });
      return false;
    }
    toast({ title: "Success", description: "Section deleted successfully" });
    refetch();
    return true;
  };

  const toggleSection = async (id: string, enabled: boolean) => {
    return updateSection(id, { is_enabled: enabled });
  };

  return {
    sections,
    loading,
    getSection,
    updateSection,
    createSection,
    deleteSection,
    toggleSection,
    refetch,
  };
}
