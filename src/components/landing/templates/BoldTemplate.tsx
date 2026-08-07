import { LeadForm } from '../LeadForm';
import type { LandingConfig } from '@/lib/landing';

interface P { config: LandingConfig; landingId?: string; slug?: string }

const display = { fontFamily: '"Space Grotesk", system-ui, sans-serif' };

export const BoldTemplate = ({ config: c, landingId, slug }: P) => {
  const s = c.colors;
  return (
    <div style={{ background: s.bg, color: s.text }} className="min-h-screen">
      <header className="flex items-center justify-between border-b px-6 py-5" style={{ borderColor: `${s.text}1a` }}>
        <span className="text-xl font-black uppercase tracking-tighter" style={display}>{c.brand}</span>
        <a href="#lead" className="border px-5 py-2 text-[11px] font-black uppercase tracking-[0.2em]" style={{ borderColor: s.primary, color: s.primary }}>{c.hero.ctaPrimary}</a>
      </header>

      <section className="border-b px-6 py-16 md:py-24" style={{ borderColor: `${s.text}1a` }}>
        <div className="mx-auto max-w-screen-xl">
          {c.hero.badge && <p className="mb-6 text-[10px] font-black uppercase tracking-[0.5em]" style={{ color: s.primary }}>{c.hero.badge}</p>}
          <h1 className="text-[clamp(2.6rem,9vw,7rem)] font-bold uppercase leading-[0.85] tracking-tighter" style={display}>
            {c.hero.title} <span style={{ color: s.primary }}>{c.hero.highlight}</span>
          </h1>
          <div className="mt-10 grid gap-10 border-t pt-10 md:grid-cols-12" style={{ borderColor: `${s.text}1a` }}>
            <p className="text-lg leading-relaxed md:col-span-7" style={{ color: s.muted }}>{c.hero.subtitle}</p>
            <div className="md:col-span-5">
              <a href="#lead" className="block w-full px-8 py-5 text-center text-sm font-black uppercase tracking-widest" style={{ background: s.primary, color: '#fff' }}>{c.hero.ctaPrimary}</a>
              {c.hero.note && <p className="mt-3 text-center text-[11px] uppercase tracking-[0.3em]" style={{ color: s.muted }}>{c.hero.note}</p>}
            </div>
          </div>
        </div>
      </section>

      {c.stats.length > 0 && (
        <section className="grid border-b sm:grid-cols-2 lg:grid-cols-4" style={{ borderColor: `${s.text}1a` }}>
          {c.stats.map((st) => (
            <div key={st.label} className="border-r border-t px-6 py-10" style={{ borderColor: `${s.text}1a` }}>
              <div className="text-5xl font-bold tracking-tighter" style={display}>{st.value}</div>
              <div className="mt-2 text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: s.muted }}>{st.label}</div>
            </div>
          ))}
        </section>
      )}

      <section className="px-6 py-20">
        <div className="mx-auto max-w-screen-xl">
          <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-bold uppercase leading-none tracking-tighter" style={display}>Yondashuv</h2>
          <div className="mt-12 divide-y" style={{ borderColor: `${s.text}1a` }}>
            {c.benefits.map((b, i) => (
              <div key={i} className="grid gap-4 border-t py-8 md:grid-cols-12" style={{ borderColor: `${s.text}1a` }}>
                <div className="text-[11px] font-black tracking-[0.3em] md:col-span-2" style={{ color: s.primary }}>{String(i + 1).padStart(2, '0')}</div>
                <h3 className="text-2xl font-bold uppercase tracking-tight md:col-span-4" style={display}>{b.title}</h3>
                <p className="md:col-span-6" style={{ color: s.muted }}>{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="services" className="border-t px-6 py-20" style={{ borderColor: `${s.text}1a` }}>
        <div className="mx-auto max-w-screen-xl">
          <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-bold uppercase leading-none tracking-tighter" style={display}>Paketlar</h2>
          <div className="mt-12 grid gap-px md:grid-cols-3" style={{ background: `${s.text}1a` }}>
            {c.services.map((sv, i) => (
              <div key={i} className="flex flex-col p-8" style={{ background: sv.highlight ? s.surface : s.bg }}>
                <h3 className="text-2xl font-bold uppercase tracking-tight" style={display}>{sv.title}</h3>
                {sv.price && <div className="mt-3 text-4xl font-bold tracking-tighter" style={{ ...display, color: s.primary }}>{sv.price}</div>}
                {sv.desc && <p className="mt-2 text-sm" style={{ color: s.muted }}>{sv.desc}</p>}
                <ul className="mt-6 flex-1 space-y-3 text-sm">
                  {sv.features.map((f) => <li key={f} className="border-b pb-2" style={{ borderColor: `${s.text}12`, color: s.muted }}>{f}</li>)}
                </ul>
                <a href="#lead" className="mt-8 border px-6 py-3 text-center text-[11px] font-black uppercase tracking-[0.2em]" style={{ borderColor: s.primary, color: s.primary }}>Ariza</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t px-6 py-20" style={{ borderColor: `${s.text}1a` }}>
        <div className="mx-auto grid max-w-screen-xl gap-10 md:grid-cols-4">
          {c.steps.map((st, i) => (
            <div key={i} className="border-t pt-5" style={{ borderColor: s.primary }}>
              <div className="text-[11px] font-black tracking-[0.3em]" style={{ color: s.primary }}>STEP {i + 1}</div>
              <h3 className="mt-3 text-xl font-bold uppercase tracking-tight" style={display}>{st.title}</h3>
              <p className="mt-2 text-sm" style={{ color: s.muted }}>{st.text}</p>
            </div>
          ))}
        </div>
      </section>

      {c.testimonials.length > 0 && (
        <section className="border-t px-6 py-20" style={{ borderColor: `${s.text}1a` }}>
          <div className="mx-auto max-w-screen-xl space-y-12">
            {c.testimonials.map((t, i) => (
              <blockquote key={i} className="max-w-4xl">
                <p className="text-[clamp(1.3rem,3vw,2.2rem)] font-bold leading-tight tracking-tight" style={display}>“{t.text}”</p>
                <footer className="mt-4 text-[11px] font-black uppercase tracking-[0.3em]" style={{ color: s.primary }}>{t.name} — {t.role}</footer>
              </blockquote>
            ))}
          </div>
        </section>
      )}

      <section id="lead" className="border-t px-6 py-20" style={{ borderColor: `${s.text}1a` }}>
        <div className="mx-auto grid max-w-screen-xl gap-12 md:grid-cols-2">
          <div>
            <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-bold uppercase leading-none tracking-tighter" style={display}>{c.form.title}</h2>
            <p className="mt-5 text-lg" style={{ color: s.muted }}>{c.form.subtitle}</p>
            {c.faq.length > 0 && (
              <div className="mt-10 space-y-4">
                {c.faq.map((f, i) => (
                  <details key={i} className="border-t pt-4" style={{ borderColor: `${s.text}1a` }}>
                    <summary className="cursor-pointer list-none text-sm font-black uppercase tracking-wider">{f.q}</summary>
                    <p className="mt-2 text-sm" style={{ color: s.muted }}>{f.a}</p>
                  </details>
                ))}
              </div>
            )}
          </div>
          <div className="p-8" style={{ background: s.surface }}>
            <LeadForm config={c} landingId={landingId} slug={slug} />
          </div>
        </div>
      </section>

      <footer className="border-t px-6 py-8 text-[11px] uppercase tracking-[0.2em]" style={{ borderColor: `${s.text}1a`, color: s.muted }}>
        <div className="mx-auto flex max-w-screen-xl flex-wrap justify-between gap-4">
          <span>{c.footerNote}</span>
          <span>{c.contact.phone} {c.contact.email && `· ${c.contact.email}`}</span>
        </div>
      </footer>
    </div>
  );
};
