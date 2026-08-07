import { LeadForm } from '../LeadForm';
import type { LandingConfig } from '@/lib/landing';

interface P { config: LandingConfig; landingId?: string; slug?: string }

/** Light, trust-oriented agency layout. Ignores dark bg and uses paper surface. */
export const CleanTemplate = ({ config: c, landingId, slug }: P) => {
  const s = c.colors;
  const bg = '#ffffff';
  const text = '#0b0b0f';
  const muted = '#5b5b66';
  const soft = '#f5f6f8';
  return (
    <div style={{ background: bg, color: text }} className="min-h-screen">
      <header className="sticky top-0 z-30 border-b bg-white/90 backdrop-blur" style={{ borderColor: '#e8e9ee' }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg text-xs font-black text-white" style={{ background: s.primary }}>{c.logoText}</div>
            <span className="font-bold">{c.brand}</span>
          </div>
          <a href="#lead" className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white" style={{ background: s.primary }}>{c.hero.ctaPrimary}</a>
        </div>
      </header>

      <section className="px-5 py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          {c.hero.badge && <span className="inline-block rounded-full px-4 py-1.5 text-xs font-semibold" style={{ background: `${s.primary}14`, color: s.primary }}>{c.hero.badge}</span>}
          <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
            {c.hero.title} <span style={{ color: s.primary }}>{c.hero.highlight}</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg" style={{ color: muted }}>{c.hero.subtitle}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="#lead" className="rounded-xl px-7 py-3.5 text-sm font-bold text-white" style={{ background: s.primary }}>{c.hero.ctaPrimary}</a>
            <a href="#services" className="rounded-xl border px-7 py-3.5 text-sm font-bold" style={{ borderColor: '#e0e1e8' }}>{c.hero.ctaSecondary}</a>
          </div>
          {c.hero.note && <p className="mt-4 text-xs" style={{ color: muted }}>{c.hero.note}</p>}
        </div>
      </section>

      {c.stats.length > 0 && (
        <section className="px-5">
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 rounded-2xl p-8 md:grid-cols-4" style={{ background: soft }}>
            {c.stats.map((st) => (
              <div key={st.label} className="text-center">
                <div className="text-3xl font-extrabold" style={{ color: s.primary }}>{st.value}</div>
                <div className="mt-1 text-xs font-medium uppercase tracking-wider" style={{ color: muted }}>{st.label}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="text-center text-3xl font-extrabold tracking-tight">Siz nima olasiz</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {c.benefits.map((b, i) => (
            <div key={i} className="rounded-2xl border p-6" style={{ borderColor: '#ececf2' }}>
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg text-white" style={{ background: s.primary }}>✓</div>
              <h3 className="font-bold">{b.title}</h3>
              <p className="mt-2 text-sm" style={{ color: muted }}>{b.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="services" className="px-5 py-16" style={{ background: soft }}>
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-extrabold tracking-tight">Xizmat paketlari</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {c.services.map((sv, i) => (
              <div key={i} className="flex flex-col rounded-2xl bg-white p-7 shadow-sm" style={{ border: `2px solid ${sv.highlight ? s.primary : '#ececf2'}` }}>
                {sv.highlight && <span className="mb-3 inline-block self-start rounded-full px-3 py-1 text-[11px] font-bold text-white" style={{ background: s.primary }}>Ommabop</span>}
                <h3 className="text-lg font-bold">{sv.title}</h3>
                {sv.price && <div className="mt-2 text-3xl font-extrabold">{sv.price}</div>}
                {sv.desc && <p className="mt-2 text-sm" style={{ color: muted }}>{sv.desc}</p>}
                <ul className="mt-5 flex-1 space-y-2 text-sm">
                  {sv.features.map((f) => <li key={f} className="flex gap-2"><span style={{ color: s.primary }}>✓</span><span style={{ color: muted }}>{f}</span></li>)}
                </ul>
                <a href="#lead" className="mt-6 rounded-xl py-3 text-center text-sm font-bold" style={{ background: sv.highlight ? s.primary : '#ffffff', color: sv.highlight ? '#fff' : text, border: `1px solid ${sv.highlight ? s.primary : '#e0e1e8'}` }}>Ariza qoldirish</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="text-center text-3xl font-extrabold tracking-tight">Ish jarayoni</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-4">
          {c.steps.map((st, i) => (
            <div key={i} className="relative rounded-2xl border p-6" style={{ borderColor: '#ececf2' }}>
              <div className="absolute -top-4 left-6 flex h-8 w-8 items-center justify-center rounded-full text-xs font-black text-white" style={{ background: s.primary }}>{i + 1}</div>
              <h3 className="mt-3 font-bold">{st.title}</h3>
              <p className="mt-1 text-sm" style={{ color: muted }}>{st.text}</p>
            </div>
          ))}
        </div>
      </section>

      {c.testimonials.length > 0 && (
        <section className="px-5 pb-20">
          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
            {c.testimonials.map((t, i) => (
              <div key={i} className="rounded-2xl border p-7" style={{ borderColor: '#ececf2' }}>
                <div className="mb-3" style={{ color: s.primary }}>★★★★★</div>
                <p className="leading-relaxed">“{t.text}”</p>
                <p className="mt-4 text-sm font-bold">{t.name} <span style={{ color: muted }}>· {t.role}</span></p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section id="lead" className="px-5 pb-20">
        <div className="mx-auto grid max-w-5xl gap-10 rounded-3xl p-8 md:grid-cols-2 md:p-12" style={{ background: soft }}>
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">{c.form.title}</h2>
            <p className="mt-3" style={{ color: muted }}>{c.form.subtitle}</p>
            <div className="mt-6 space-y-2 text-sm" style={{ color: muted }}>
              {c.contact.phone && <div>📞 {c.contact.phone}</div>}
              {c.contact.email && <div>✉️ {c.contact.email}</div>}
              {c.contact.address && <div>📍 {c.contact.address}</div>}
            </div>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <LeadForm config={c} landingId={landingId} slug={slug} variant="light" />
          </div>
        </div>
      </section>

      {c.faq.length > 0 && (
        <section className="mx-auto max-w-3xl px-5 pb-20">
          <h2 className="text-center text-3xl font-extrabold tracking-tight">Savol-javob</h2>
          <div className="mt-8 space-y-3">
            {c.faq.map((f, i) => (
              <details key={i} className="rounded-xl border p-5" style={{ borderColor: '#ececf2' }}>
                <summary className="cursor-pointer list-none font-semibold">{f.q}</summary>
                <p className="mt-3 text-sm" style={{ color: muted }}>{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      <footer className="border-t px-5 py-8 text-center text-xs" style={{ borderColor: '#ececf2', color: muted }}>{c.footerNote}</footer>
    </div>
  );
};
