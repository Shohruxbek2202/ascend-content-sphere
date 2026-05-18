import { ReactNode } from 'react';

interface Props {
  eyebrow: string;
  title: ReactNode;
  lede?: string;
  meta?: string;
}

const editorial = { fontFamily: '"Space Grotesk", system-ui, sans-serif' };

/**
 * Editorial-style page hero used across all public pages.
 * Bold uppercase Space Grotesk display + indigo eyebrow tag + optional lede.
 */
export const PublicPageHero = ({ eyebrow, title, lede, meta }: Props) => (
  <section className="px-6 md:px-8 pt-14 md:pt-20 pb-10 md:pb-14 border-b border-[hsl(var(--rule))]">
    <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-end">
      <div className="lg:col-span-9">
        <p className="text-[#4f46e5] font-bold uppercase tracking-[0.4em] text-[10px] mb-5">{eyebrow}</p>
        <h1
          className="text-[clamp(2.5rem,8vw,6.5rem)] font-bold leading-[0.88] tracking-tighter uppercase text-[hsl(var(--paper))]"
          style={editorial}
        >
          {title}
        </h1>
      </div>
      {(lede || meta) && (
        <div className="lg:col-span-3 border-t border-[hsl(var(--rule))] pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
          {meta && (
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-4">{meta}</p>
          )}
          {lede && (
            <p className="text-base md:text-lg text-zinc-400 leading-relaxed font-light">{lede}</p>
          )}
        </div>
      )}
    </div>
  </section>
);
