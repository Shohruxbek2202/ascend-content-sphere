import { Bot } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface AIMadeSealProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const labels = {
  uz: 'SI yozgan',
  ru: 'Написано ИИ',
  en: 'AI-generated',
};

export const AIMadeSeal = ({ size = 'sm', className = '' }: AIMadeSealProps) => {
  const { language } = useLanguage();

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  const textSizes = {
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-[11px]',
  };

  return (
    <div
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border border-secondary/30 bg-secondary/5 select-none ${className}`}
      title={labels[language]}
    >
      <Bot className={`${iconSizes[size]} text-secondary/70`} />
      <span className={`${textSizes[size]} font-medium uppercase tracking-wider text-secondary/70 leading-none`}>
        {labels[language]}
      </span>
    </div>
  );
};
