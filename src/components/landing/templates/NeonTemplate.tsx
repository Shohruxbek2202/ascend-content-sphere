import { LeadForm } from '../LeadForm';
import type { LandingConfig } from '@/lib/landing';

interface P { config: LandingConfig; landingId?: string; slug?: string }

export const NeonTemplate = ({ config: c, landingId, slug }: P) => {
  const s = c.colors;
  const glow = `0 0 40px ${s.primary}55`;
  return (
    <div style={{ background: s.bg, color: s.text }} className="min-h-screen">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.15]"
        style={{ backgroundImage: `linear-gradient(${s.primary}22 1px, transparent 1px), linear-gradient(90deg, ${s.primary}22 1px, transparent 1px)`, backgroundSize: '48px 48px' }}
      />
      <div className="relative">
        <header className="flex items-center justify-between px-6 py-5">
          <span className="font-mono text-sm font-bold tracking-widest" style={{ color: s.primary }}>&lt;{c.brand}/&gt;</span>
          <a href="#lead" className="rounded-md px-4 py-2 font-mono text-xs uppercase tracking-widest" style={{ border: `1px solid ${s.primary}`, color: s.primary, boxShadow: glow }}>{c.hero.ctaPrimary}</a>
        </header>

        <section className="px-6 py-20 text-center">
          {c.hero.badge && <p className="font-mono text-[11px] uppercase tracking-[0.4em]" style={{ color: s.primary }}>// {c.hero.badge}</p>}
          <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-black leading-tight tracking-tight md:text-6xl">
            {c.hero.title}{' '}
            <span style={{ color: s.primary, textShadow: glow }}>{c.hero.highlight}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl" style={{ color: s.muted }}>{c.hero.subtitle}</p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <a href="#lead" className="rounded-md px-8 py-4 text-sm font-bold uppercase tracking-widest" style={{ background: s.primary, color: '#fff', boxShadow: glow }}>{c.hero.ctaPrimary}</a>
            <a href="#services" className="rounded-md px-8 py-4 text-sm font-bold uppercase tracking-widest" style={{ border: `1px solid ${s.text}22` }}>{c.hero.ctaSecondary}</a>
          </div>
          {c.hero.note && <p className="mt-4 font-mono text-xs" style={{ color: s.muted }}>{c.hero.note}</p>}
        </section>

        {c.stats.length > 0 && (
          <section className="mx-auto grid max-w-5xl gap-px px-6 sm:grid-cols-2 lg:grid-cols-4" style={{ background: `${s.text}12` }}>
            {c.stats.map((st) => (
              <div key={st.label} className="p-6 text-center" style={{ background: s.bg }}>
                <div className="font-mono text-3xl font-black" style={{ color: s.primary, textShadow: glow }}>{st.value}</div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.25em]" style={{ color: s.muted }}>{st.label}</div>
              </div>
            ))}
          </section>
        )}

        <section className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="font-mono text-xs uppercase tracking-[0.4em]" style={{ color: s.primary }}>// Afzalliklar</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {c.benefits.map((b, i) => (
              <div key={i} className="rounded-lg p-6 transition hover:-translate-y-0.5" style={{ background: s.surface, border: `1px solid ${s.primary}22` }}>
                <h3 className="font-bold">{b.title}</h3>
                <p className="mt-2 text-sm" style={{ color: s.muted }}>{b.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="services" className="mx-auto max-w-6xl px-6 pb-20">
          <h2 className="font-mono text-xs uppercase tracking-[0.4em]" style={{ color: s.primary }}>// Paketlar</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {c.services.map((sv, i) => (
              <div key={i} className="flex flex-col rounded-lg p-6" style={{ background: s.surface, border: `1px solid ${sv.highlight ? s.primary : `${s.text}14`}`, boxShadow: sv.highlight ? glow : undefined }}>
                <h3 className="font-mono text-sm uppercase tracking-widest" style={{ color: s.primary }}>{sv.title}</h3>
                {sv.price && <div className="mt-3 text-3xl font-black">{sv.price}</div>}
                {sv.desc && <p className="mt-2 text-sm" style={{ color: s.muted }}>{sv.desc}</p>}
                <ul className="mt-5 flex-1 space-y-2 font-mono text-xs" style={{ color: s.muted }}>
                  {sv.features.map((f) => <li key={f}>&gt; {f}</li>)}
                </ul>
                <a href="#lead" className="mt-6 rounded-md py-3 text-center text-xs font-bold uppercase tracking-widest" style={{ background: sv.highlight ? s.primary : 'transparent', color: sv.highlight ? '#fff' : s.primary, border: `1px solid ${s.primary}` }}>Boshlash</a>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-20">
          <h2 className="font-mono text-xs uppercase tracking-[0.4em]" style={{ color: s.primary }}>// Jarayon</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {c.steps.map((st, i) => (
              <div key={i} className="rounded-lg p-5" style={{ border: `1px dashed ${s.primary}44` }}>
                <div className="font-mono text-xs" style={{ color: s.primary }}>0{i + 1}</div>
                <h3 className="mt-2 font-bold">{st.title}</h3>
                <p className="mt-1 text-sm" style={{ color: s.muted }}>{st.text}</p>
              </div>
            ))}
          </div>
        </section>

        {c.testimonials.length > 0 && (
          <section className="mx-auto max-w-6xl px-6 pb-20 grid gap-5 md:grid-cols-2">
            {c.testimonials.map((t, i) => (
              <div key={i} className="rounded-lg p-6" style={{ background: s.surface, border: `1px solid ${s.text}14` }}>
                <p>“{t.text}”</p>
                <p className="mt-3 font-mono text-xs" style={{ color: s.primary }}>{t.name} / {t.role}</p>
              </div>
            ))}
          </section>
        )}

        <section id="lead" className="px-6 pb-24">
          <div className="mx-auto max-w-xl rounded-2xl p-8" style={{ background: s.surface, border: `1px solid ${s.primary}44`, boxShadow: glow }}>
            <h2 className="text-2xl font-black">{c.form.title}</h2>
            <p className="mb-6 mt-2 text-sm" style={{ color: s.muted }}>{c.form.subtitle}</p>
            <LeadForm config={c} landingId={landingId} slug={slug} />
          </div>
          {c.faq.length > 0 && (
            <div className="mx-auto mt-12 max-w-xl space-y-2">
              {c.faq.map((f, i) => (
                <details key={i} className="rounded-lg p-4" style={{ border: `1px solid ${s.text}14` }}>
                  <summary className="cursor-pointer list-none font-semibold">{f.q}</summary>
                  <p className="mt-2 text-sm" style={{ color: s.muted }}>{f.a}</p>
                </details>
              ))}
            </div>
          )}
        </section>

        <footer className="px-6 py-8 text-center font-mono text-xs" style={{ color: s.muted, borderTop: `1px solid ${s.text}12` }}>
          {c.contact.phone} · {c.contact.email} — {c.footerNote}
        </footer>
      </div>
    </div>
  );
};
