import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const CACHE_KEY = '_translations_en';

function getCachedTranslations(): Record<string, string> | undefined {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return undefined;
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

export function useTranslations(languageCode: string = 'en') {
  const cached = getCachedTranslations();

  return useQuery({
    queryKey: ['translations', 'en'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('translations')
        .select('key, value')
        .eq('language_code', 'en');

      if (error) throw error;

      const map: Record<string, string> = {};
      for (const row of (data || []) as { key: string; value: string }[]) {
        map[row.key] = row.value;
      }
      // Cache to localStorage
      try { localStorage.setItem(CACHE_KEY, JSON.stringify(map)); } catch {}
      return map;
    },
    initialData: cached,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
}
