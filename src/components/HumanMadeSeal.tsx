import { Fingerprint } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface HumanMadeSealProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const labels = {
  uz: 'Inson yozgan',
  ru: 'Написано человеком',
  en: 'Human-made',
};

export const HumanMadeSeal = ({ size = 'sm', className = '' }: HumanMadeSealProps) => {
  const { language } = useLanguage();

  const sizes = {
    sm: 'w-16 h-16 text-[6px]',
    md: 'w-20 h-20 text-[7px]',
    lg: 'w-24 h-24 text-[8px]',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div
      className={`${sizes[size]} relative inline-flex items-center justify-center select-none ${className}`}
      title={labels[language]}
    >
      {/* Outer rotating dashed border */}
      <div className="absolute inset-0 rounded-full border-2 border-dashed border-secondary/60 animate-[spin_20s_linear_infinite]" />

      {/* Inner solid ring */}
      <div className="absolute inset-1.5 rounded-full border border-secondary/40" />

      {/* Center content */}
      <div className="relative flex flex-col items-center gap-0.5">
        <Fingerprint className={`${iconSizes[size]} text-secondary`} />
        <span className="font-display font-bold uppercase tracking-wider text-secondary leading-none text-center">
          {labels[language]}
        </span>
      </div>
    </div>
  );
};
