import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TranslationRow {
  key: string;
  language_code: string;
  value: string;
}

export function useTranslations(languageCode: string = 'en') {
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
      return map;
    },
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
}
