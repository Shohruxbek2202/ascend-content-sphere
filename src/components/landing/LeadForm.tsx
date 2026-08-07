import { useState } from 'react';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { LandingConfig } from '@/lib/landing';

const schema = z.object({
  name: z.string().trim().max(100).optional(),
  phone: z.string().trim().max(30).optional(),
  email: z.string().trim().max(255).optional(),
  message: z.string().trim().max(1000).optional(),
  service: z.string().trim().max(120).optional(),
});

interface Props {
  config: LandingConfig;
  landingId?: string;
  slug?: string;
  variant?: 'dark' | 'light';
  compact?: boolean;
}

export const LeadForm = ({ config, landingId, slug, variant = 'dark', compact }: Props) => {
  const { form, colors } = config;
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k: string, v: string) => setValues((p) => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      toast.error('Ma’lumotlarni tekshiring');
      return;
    }
    if (form.fields.includes('phone') && !(values.phone || '').trim()) {
      toast.error('Telefon raqamni kiriting');
      return;
    }
    if (form.fields.includes('name') && !(values.name || '').trim()) {
      toast.error('Ismingizni kiriting');
      return;
    }
    setLoading(true);
    const { error } = await supabase.from('leads').insert({
      landing_id: landingId ?? null,
      landing_slug: slug ?? null,
      name: values.name || null,
      phone: values.phone || null,
      email: values.email || null,
      message: values.message || null,
      service: values.service || null,
      page_url: typeof window !== 'undefined' ? window.location.href : null,
    });
    setLoading(false);
    if (error) {
      toast.error('Yuborishda xatolik. Qayta urinib ko‘ring.');
      return;
    }
    setDone(true);
    toast.success(form.success);
  };

  const isLight = variant === 'light';
  const inputStyle: React.CSSProperties = {
    background: isLight ? '#ffffff' : 'rgba(255,255,255,0.04)',
    border: `1px solid ${isLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.12)'}`,
    color: isLight ? '#0b0b0f' : colors.text,
  };

  if (done) {
    return (
      <div
        className="rounded-2xl p-8 text-center"
        style={{ border: `1px solid ${colors.primary}55`, background: `${colors.primary}12` }}
      >
        <div
          className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full text-xl"
          style={{ background: colors.primary, color: '#fff' }}
        >
          ✓
        </div>
        <p className="text-lg font-semibold" style={{ color: isLight ? '#0b0b0f' : colors.text }}>
          {form.success}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className={compact ? 'space-y-3' : 'space-y-4'}>
      {form.fields.includes('name') && (
        <input
          required
          maxLength={100}
          placeholder="Ismingiz"
          className="w-full rounded-xl px-4 py-3 text-sm outline-none transition focus:ring-2"
          style={inputStyle}
          value={values.name || ''}
          onChange={(e) => set('name', e.target.value)}
        />
      )}
      {form.fields.includes('phone') && (
        <input
          required
          maxLength={30}
          type="tel"
          placeholder="+998 __ ___ __ __"
          className="w-full rounded-xl px-4 py-3 text-sm outline-none transition focus:ring-2"
          style={inputStyle}
          value={values.phone || ''}
          onChange={(e) => set('phone', e.target.value)}
        />
      )}
      {form.fields.includes('email') && (
        <input
          maxLength={255}
          type="email"
          placeholder="Email"
          className="w-full rounded-xl px-4 py-3 text-sm outline-none transition focus:ring-2"
          style={inputStyle}
          value={values.email || ''}
          onChange={(e) => set('email', e.target.value)}
        />
      )}
      {form.fields.includes('service') && form.serviceOptions.length > 0 && (
        <select
          className="w-full rounded-xl px-4 py-3 text-sm outline-none"
          style={inputStyle}
          value={values.service || ''}
          onChange={(e) => set('service', e.target.value)}
        >
          <option value="">Xizmatni tanlang</option>
          {form.serviceOptions.map((s) => (
            <option key={s} value={s} style={{ color: '#0b0b0f' }}>
              {s}
            </option>
          ))}
        </select>
      )}
      {form.fields.includes('message') && (
        <textarea
          maxLength={1000}
          rows={compact ? 2 : 3}
          placeholder="Loyihangiz haqida qisqacha"
          className="w-full rounded-xl px-4 py-3 text-sm outline-none"
          style={inputStyle}
          value={values.message || ''}
          onChange={(e) => set('message', e.target.value)}
        />
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl px-6 py-3.5 text-sm font-bold uppercase tracking-wide transition hover:opacity-90 disabled:opacity-60"
        style={{ background: colors.primary, color: '#fff' }}
      >
        {loading ? 'Yuborilmoqda…' : form.button}
      </button>
      {form.privacy && (
        <p className="text-center text-[11px]" style={{ color: isLight ? '#71717a' : colors.muted }}>
          {form.privacy}
        </p>
      )}
    </form>
  );
};
