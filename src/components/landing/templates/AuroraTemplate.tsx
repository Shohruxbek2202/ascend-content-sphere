import { LeadForm } from '../LeadForm';
import type { LandingConfig } from '@/lib/landing';

interface P { config: LandingConfig; landingId?: string; slug?: string }

export const AuroraTemplate = ({ config: c, landingId, slug }: P) => {
  const s = c.colors;
  return (
    <div style={{ background: s.bg, color: s.text }} className="min-h-screen font-sans">
      {/* Nav */}
      <header className="sticky top-0 z-30 backdrop-blur-xl" style={{ background: `${s.bg}cc`, borderBottom: `1px solid ${s.text}12` }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <span className="text-lg font-black tracking-tight">{c.brand}</span>
          <a href="#lead" className="rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider" style={{ background: s.primary, color: '#fff' }}>
            {c.hero.ctaPrimary}
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-5 pb-20 pt-16 md:pt-24">
        <div className="pointer-events-none absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full blur-3xl" style={{ background: `${s.primary}33` }} />
        <div className="pointer-events-none absolute -right-32 top-40 h-[420px] w-[420px] rounded-full blur-3xl" style={{ background: `${s.primary}22` }} />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div>
            {c.hero.badge && (
              <span className="inline-block rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em]" style={{ background: `${s.primary}20`, color: s.primary }}>
                {c.hero.badge}
              </span>
            )}
            <h1 className="mt-6 text-4xl font-black leading-[1.05] tracking-tight md:text-6xl">
              {c.hero.title}{' '}
              <span style={{ background: `linear-gradient(90deg, ${s.primary}, ${s.text})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
                {c.hero.highlight}
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed md:text-lg" style={{ color: s.muted }}>{c.hero.subtitle}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#lead" className="rounded-2xl px-7 py-4 text-sm font-bold" style={{ background: s.primary, color: '#fff' }}>{c.hero.ctaPrimary}</a>
              <a href="#services" className="rounded-2xl px-7 py-4 text-sm font-bold" style={{ border: `1px solid ${s.text}22`, color: s.text }}>{c.hero.ctaSecondary}</a>
            </div>
            {c.hero.note && <p className="mt-4 text-xs" style={{ color: s.muted }}>⚡ {c.hero.note}</p>}
          </div>
          <div id="lead" className="rounded-3xl p-6 md:p-8" style={{ background: s.surface, border: `1px solid ${s.text}12`, boxShadow: `0 30px 80px -30px ${s.primary}55` }}>
            <h2 className="text-xl font-bold">{c.form.title}</h2>
            {c.form.subtitle && <p className="mb-5 mt-1 text-sm" style={{ color: s.muted }}>{c.form.subtitle}</p>}
            <LeadForm config={c} landingId={landingId} slug={slug} />
          </div>
        </div>
      </section>

      {/* Stats */}
      {c.stats.length > 0 && (
        <section className="px-5 py-10" style={{ borderTop: `1px solid ${s.text}0d`, borderBottom: `1px solid ${s.text}0d` }}>
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 md:grid-cols-4">
            {c.stats.map((st) => (
              <div key={st.label} className="text-center">
                <div className="text-3xl font-black md:text-4xl" style={{ color: s.primary }}>{st.value}</div>
                <div className="mt-1 text-xs uppercase tracking-widest" style={{ color: s.muted }}>{st.label}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Benefits */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="max-w-2xl text-3xl font-black md:text-4xl">Nega aynan biz?</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {c.benefits.map((b, i) => (
            <div key={i} className="rounded-2xl p-6 transition hover:-translate-y-1" style={{ background: s.surface, border: `1px solid ${s.text}0f` }}>
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl text-sm font-black" style={{ background: `${s.primary}22`, color: s.primary }}>{i + 1}</div>
              <h3 className="font-bold">{b.title}</h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: s.muted }}>{b.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section id="services" className="mx-auto max-w-6xl px-5 pb-20">
        <h2 className="text-3xl font-black md:text-4xl">Xizmat paketlari</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {c.services.map((sv, i) => (
            <div key={i} className="flex flex-col rounded-3xl p-7" style={{ background: sv.highlight ? `${s.primary}14` : s.surface, border: `1px solid ${sv.highlight ? s.primary : `${s.text}0f`}` }}>
              <h3 className="text-lg font-bold">{sv.title}</h3>
              {sv.price && <div className="mt-2 text-3xl font-black" style={{ color: s.primary }}>{sv.price}</div>}
              {sv.desc && <p className="mt-2 text-sm" style={{ color: s.muted }}>{sv.desc}</p>}
              <ul className="mt-5 flex-1 space-y-2 text-sm">
                {sv.features.map((f) => (
                  <li key={f} className="flex gap-2"><span style={{ color: s.primary }}>✓</span><span style={{ color: s.muted }}>{f}</span></li>
                ))}
              </ul>
              <a href="#lead" className="mt-6 rounded-xl py-3 text-center text-sm font-bold" style={{ background: sv.highlight ? s.primary : 'transparent', color: sv.highlight ? '#fff' : s.text, border: `1px solid ${sv.highlight ? s.primary : `${s.text}22`}` }}>Tanlash</a>
            </div>
          ))}
        </div>
      </section>

      {/* Steps */}
      <section className="mx-auto max-w-6xl px-5 pb-20">
        <h2 className="text-3xl font-black md:text-4xl">Qanday ishlaymiz</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-4">
          {c.steps.map((st, i) => (
            <div key={i}>
              <div className="text-5xl font-black" style={{ color: `${s.primary}44` }}>0{i + 1}</div>
              <h3 className="mt-2 font-bold">{st.title}</h3>
              <p className="mt-1 text-sm" style={{ color: s.muted }}>{st.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      {c.testimonials.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 pb-20">
          <div className="grid gap-6 md:grid-cols-2">
            {c.testimonials.map((t, i) => (
              <div key={i} className="rounded-3xl p-7" style={{ background: s.surface, border: `1px solid ${s.text}0f` }}>
                <p className="text-lg leading-relaxed">“{t.text}”</p>
                <p className="mt-4 text-sm font-bold">{t.name} <span style={{ color: s.muted }}>· {t.role}</span></p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      {c.faq.length > 0 && (
        <section className="mx-auto max-w-3xl px-5 pb-20">
          <h2 className="text-3xl font-black md:text-4xl">Savol-javob</h2>
          <div className="mt-8 space-y-3">
            {c.faq.map((f, i) => (
              <details key={i} className="group rounded-2xl p-5" style={{ background: s.surface, border: `1px solid ${s.text}0f` }}>
                <summary className="cursor-pointer list-none font-semibold">{f.q}</summary>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: s.muted }}>{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="px-5 pb-24">
        <div className="mx-auto max-w-4xl rounded-3xl p-8 text-center md:p-12" style={{ background: `linear-gradient(135deg, ${s.primary}, ${s.primary}88)` }}>
          <h2 className="text-3xl font-black text-white md:text-4xl">{c.form.title}</h2>
          <p className="mx-auto mt-3 max-w-lg text-white/80">{c.form.subtitle}</p>
          <div className="mx-auto mt-8 max-w-md rounded-2xl p-6" style={{ background: s.bg }}>
            <LeadForm config={c} landingId={landingId} slug={slug} compact />
          </div>
        </div>
      </section>

      <footer className="px-5 py-10 text-center text-xs" style={{ borderTop: `1px solid ${s.text}0d`, color: s.muted }}>
        <div className="mb-3 flex flex-wrap justify-center gap-4">
          {c.contact.phone && <a href={`tel:${c.contact.phone}`}>{c.contact.phone}</a>}
          {c.contact.telegram && <a href={c.contact.telegram} target="_blank" rel="noopener noreferrer">Telegram</a>}
          {c.contact.email && <a href={`mailto:${c.contact.email}`}>{c.contact.email}</a>}
        </div>
        {c.footerNote}
      </footer>
    </div>
  );
};
