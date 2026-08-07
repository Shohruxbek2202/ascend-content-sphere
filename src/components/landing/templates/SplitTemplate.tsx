import { LeadForm } from '../LeadForm';
import type { LandingConfig } from '@/lib/landing';

interface P { config: LandingConfig; landingId?: string; slug?: string }

export const SplitTemplate = ({ config: c, landingId, slug }: P) => {
  const s = c.colors;
  return (
    <div style={{ background: s.bg, color: s.text }} className="min-h-screen">
      <div className="mx-auto grid max-w-screen-2xl lg:grid-cols-[1fr_440px]">
        {/* Left content */}
        <div className="px-6 py-12 md:px-12">
          <div className="mb-12 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-black" style={{ background: s.primary, color: '#fff' }}>{c.logoText}</div>
            <span className="font-bold">{c.brand}</span>
          </div>

          {c.hero.badge && (
            <span className="inline-block rounded-md px-3 py-1 text-[11px] font-bold uppercase tracking-widest" style={{ background: `${s.primary}1f`, color: s.primary }}>{c.hero.badge}</span>
          )}
          <h1 className="mt-5 max-w-2xl text-4xl font-black leading-tight tracking-tight md:text-5xl">
            {c.hero.title} <span style={{ color: s.primary }}>{c.hero.highlight}</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed" style={{ color: s.muted }}>{c.hero.subtitle}</p>

          {c.stats.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-8">
              {c.stats.map((st) => (
                <div key={st.label}>
                  <div className="text-2xl font-black" style={{ color: s.primary }}>{st.value}</div>
                  <div className="text-[11px] uppercase tracking-widest" style={{ color: s.muted }}>{st.label}</div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-14 grid gap-4 sm:grid-cols-2">
            {c.benefits.map((b, i) => (
              <div key={i} className="rounded-xl p-5" style={{ background: s.surface, border: `1px solid ${s.text}0f` }}>
                <div className="mb-2 text-sm font-black" style={{ color: s.primary }}>◆</div>
                <h3 className="font-semibold">{b.title}</h3>
                <p className="mt-1 text-sm" style={{ color: s.muted }}>{b.text}</p>
              </div>
            ))}
          </div>

          <h2 className="mt-16 text-2xl font-black">Xizmatlar</h2>
          <div className="mt-6 space-y-3">
            {c.services.map((sv, i) => (
              <div key={i} className="flex flex-wrap items-center justify-between gap-4 rounded-xl p-5" style={{ background: s.surface, border: `1px solid ${sv.highlight ? s.primary : `${s.text}0f`}` }}>
                <div className="min-w-[200px] flex-1">
                  <h3 className="font-bold">{sv.title}</h3>
                  <p className="text-sm" style={{ color: s.muted }}>{sv.desc}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {sv.features.map((f) => (
                      <span key={f} className="rounded-full px-2.5 py-1 text-[11px]" style={{ background: `${s.primary}14`, color: s.muted }}>{f}</span>
                    ))}
                  </div>
                </div>
                {sv.price && <div className="text-xl font-black" style={{ color: s.primary }}>{sv.price}</div>}
              </div>
            ))}
          </div>

          <h2 className="mt-16 text-2xl font-black">Jarayon</h2>
          <ol className="mt-6 space-y-4">
            {c.steps.map((st, i) => (
              <li key={i} className="flex gap-4">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-black" style={{ background: `${s.primary}22`, color: s.primary }}>{i + 1}</span>
                <div>
                  <h3 className="font-semibold">{st.title}</h3>
                  <p className="text-sm" style={{ color: s.muted }}>{st.text}</p>
                </div>
              </li>
            ))}
          </ol>

          {c.testimonials.length > 0 && (
            <div className="mt-16 space-y-4">
              {c.testimonials.map((t, i) => (
                <div key={i} className="rounded-xl p-5" style={{ background: s.surface, borderLeft: `3px solid ${s.primary}` }}>
                  <p className="italic">“{t.text}”</p>
                  <p className="mt-2 text-xs font-bold" style={{ color: s.muted }}>{t.name} · {t.role}</p>
                </div>
              ))}
            </div>
          )}

          {c.faq.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-black">FAQ</h2>
              <div className="mt-5 space-y-2">
                {c.faq.map((f, i) => (
                  <details key={i} className="rounded-xl p-4" style={{ background: s.surface }}>
                    <summary className="cursor-pointer list-none font-semibold">{f.q}</summary>
                    <p className="mt-2 text-sm" style={{ color: s.muted }}>{f.a}</p>
                  </details>
                ))}
              </div>
            </div>
          )}

          <p className="mt-16 text-xs" style={{ color: s.muted }}>{c.footerNote}</p>
        </div>

        {/* Right sticky form */}
        <aside id="lead" className="lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto" style={{ background: s.surface, borderLeft: `1px solid ${s.text}0f` }}>
          <div className="px-6 py-12 md:px-10">
            <h2 className="text-2xl font-black">{c.form.title}</h2>
            <p className="mb-6 mt-2 text-sm" style={{ color: s.muted }}>{c.form.subtitle}</p>
            <LeadForm config={c} landingId={landingId} slug={slug} />
            <div className="mt-8 space-y-2 text-sm" style={{ color: s.muted }}>
              {c.contact.phone && <div>📞 {c.contact.phone}</div>}
              {c.contact.telegram && <div>✈️ <a className="underline" href={c.contact.telegram} target="_blank" rel="noopener noreferrer">Telegram</a></div>}
              {c.contact.email && <div>✉️ {c.contact.email}</div>}
              {c.contact.address && <div>📍 {c.contact.address}</div>}
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 p-3 lg:hidden" style={{ background: `${s.bg}e6`, borderTop: `1px solid ${s.text}12` }}>
        <a href="#lead" className="block rounded-xl py-3 text-center text-sm font-bold" style={{ background: s.primary, color: '#fff' }}>{c.hero.ctaPrimary}</a>
      </div>
    </div>
  );
};
