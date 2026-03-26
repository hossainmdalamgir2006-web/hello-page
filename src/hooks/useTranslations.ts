import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TranslationRow {
  key: string;
  language_code: string;
  value: string;
}

export function useTranslations(languageCode: string) {
  return useQuery({
    queryKey: ['translations', languageCode],
    queryFn: async () => {
      // Fetch current language + English fallback in one query
      const { data, error } = await supabase
        .from('translations')
        .select('key, language_code, value')
        .in('language_code', languageCode === 'en' ? ['en'] : [languageCode, 'en']);

      if (error) throw error;

      const map: Record<string, string> = {};
      const rows = (data || []) as TranslationRow[];

      // First pass: set English as fallback
      for (const row of rows) {
        if (row.language_code === 'en') {
          map[row.key] = row.value;
        }
      }

      // Second pass: override with current language
      if (languageCode !== 'en') {
        for (const row of rows) {
          if (row.language_code === languageCode) {
            map[row.key] = row.value;
          }
        }
      }

      return map;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000,
  });
}
