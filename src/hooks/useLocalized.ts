import { useLanguage } from '@/contexts/LanguageContext';

type LocalizedFields = {
  [key: string]: string | null | undefined;
};

/**
 * Utility hook to get localized field values from multilingual objects.
 * Reduces duplicate getTitle/getExcerpt/getCategoryName patterns across pages.
 */
export const useLocalized = () => {
  const { language } = useLanguage();

  const getField = <T extends LocalizedFields>(
    obj: T | null | undefined,
    field: string,
    fallbackLang = 'en'
  ): string => {
    if (!obj) return '';
    const primary = obj[`${field}_${language}`];
    if (primary) return primary;
    const fallback = obj[`${field}_${fallbackLang}`];
    return fallback || '';
  };

  return { getField, language };
};
