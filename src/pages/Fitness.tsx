import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Heart, ArrowUpRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const editorial = { fontFamily: '"Space Grotesk", system-ui, sans-serif' };

interface StravaSummary {
  firstname: string; lastname: string; profile_url: string;
  city: string; country: string;
  recent_run_count: number; recent_run_distance: number; recent_run_moving_time: number;
  ytd_run_count: number; ytd_run_distance: number; ytd_run_moving_time: number;
  all_run_count: number; all_run_distance: number;
  last_synced_at: string;
}
interface StravaActivity {
  id: number; name: string; type: string; distance: number; moving_time: number;
  total_elevation_gain: number; average_heartrate: number | null;
  average_speed: number | null; start_date_local: string; kudos_count: number;
}

const fmtKm = (m: number) => (m / 1000).toFixed(1);
const fmtTime = (s: number) => {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}s ${m}d` : `${m}d`;
};
const fmtPace = (speed: number | null) => {
  if (!speed || speed === 0) return "—";
  const paceSec = 1000 / speed;
  const m = Math.floor(paceSec / 60), s = Math.floor(paceSec % 60);
  return `${m}:${String(s).padStart(2, "0")} /km`;
};

const Fitness = () => {
  const [summary, setSummary] = useState<StravaSummary | null>(null);
  const [activities, setActivities] = useState<StravaActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Fitness — Shohruxbek Foziljonov";
    const load = async () => {
      const [s, a] = await Promise.all([
        supabase.from("strava_summary").select("*").maybeSingle(),
        supabase.from("strava_activities").select("*").order("start_date", { ascending: false }).limit(50),
      ]);
      setSummary(s.data as any);
      setActivities((a.data || []) as any);
      setLoading(false);
    };
    load();
  }, []);

  const weeklyData = (() => {
    const map = new Map<string, number>();
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i * 7);
      const wk = `${d.getMonth() + 1}/${d.getDate()}`;
      map.set(wk, 0);
    }
    activities.forEach(a => {
      if (a.type !== "Run") return;
      const d = new Date(a.start_date_local);
      const diff = Math.floor((now.getTime() - d.getTime()) / (7 * 24 * 3600 * 1000));
      if (diff < 0 || diff >= 12) return;
      const target = new Date(now); target.setDate(target.getDate() - diff * 7);
      const wk = `${target.getMonth() + 1}/${target.getDate()}`;
      map.set(wk, (map.get(wk) || 0) + a.distance / 1000);
    });
    return Array.from(map.entries()).map(([week, km]) => ({ week, km: Number(km.toFixed(1)) }));
  })();

  return (
    <div className="min-h-screen bg-[hsl(var(--ink))] text-[hsl(var(--paper))]">
      <Header />
      <main className="max-w-screen-2xl mx-auto px-6 md:px-8 py-16 md:py-24">
        {/* Masthead */}
        <div className="border-b border-[hsl(var(--rule))] pb-10 mb-12">
          <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-[#4f46e5] mb-6">
            <span className="w-8 h-px bg-[#4f46e5]" />
            Field Notes / Strava
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter uppercase leading-[0.9] mb-6" style={editorial}>
            Fitness<br/><span className="text-zinc-600">Ledger</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl leading-relaxed">
            Shaxsiy mashg'ulot daftari — raqamlar, kilometrlar va tempolar. Strava bilan jonli sinxronlanadi.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-32 text-zinc-500 text-[10px] uppercase tracking-[0.4em]">Yuklanmoqda…</div>
        ) : !summary ? (
          <div className="text-center py-32 text-zinc-500 text-[10px] uppercase tracking-[0.4em]">Ma'lumot topilmadi</div>
        ) : (
          <>
            {/* Athlete bar */}
            <div className="border-y border-[hsl(var(--rule))] py-6 mb-12 flex flex-wrap items-center gap-6">
              {summary.profile_url && (
                <img src={summary.profile_url} alt={summary.firstname} className="w-14 h-14 grayscale border border-[hsl(var(--rule))]" />
              )}
              <div className="flex-1 min-w-[200px]">
                <div className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-1">Athlete</div>
                <div className="text-xl font-bold tracking-tight" style={editorial}>
                  {summary.firstname} {summary.lastname}
                </div>
                <div className="text-xs text-zinc-500 flex items-center gap-1.5 mt-1">
                  <MapPin className="w-3 h-3" /> {summary.city}, {summary.country}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-1">Last Sync</div>
                <div className="text-xs text-zinc-400">{new Date(summary.last_synced_at).toLocaleString("uz-UZ")}</div>
              </div>
              <a
                href="https://www.strava.com/athletes/172531720"
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 border border-[#4f46e5] text-[#4f46e5] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-[#4f46e5] hover:text-white transition-all"
              >
                Strava'da kuzating <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 border-t border-l border-[hsl(var(--rule))] mb-16">
              <Stat label="Oxirgi 4 hafta" value={`${fmtKm(summary.recent_run_distance)}`} unit="km" sub={`${summary.recent_run_count} sessiya`} accent />
              <Stat label="Yil boshidan" value={`${fmtKm(summary.ytd_run_distance)}`} unit="km" sub={`${summary.ytd_run_count} sessiya`} />
              <Stat label="Oydagi vaqt" value={fmtTime(summary.recent_run_moving_time)} unit="" sub="harakat vaqti" />
              <Stat label="Jami masofa" value={`${fmtKm(summary.all_run_distance)}`} unit="km" sub={`${summary.all_run_count} marta`} />
            </div>

            {/* Chart */}
            <div className="border border-[hsl(var(--rule))] p-6 md:p-8 mb-16">
              <div className="flex items-baseline justify-between mb-6 border-b border-[hsl(var(--rule))] pb-4">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.4em] text-[#4f46e5] mb-2">Fig. 01</div>
                  <h3 className="text-2xl font-bold tracking-tight uppercase" style={editorial}>Haftalik Hajm</h3>
                </div>
                <div className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">12 hafta / km</div>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="2 4" stroke="hsl(var(--rule))" vertical={false} />
                    <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={{ stroke: "hsl(var(--rule))" }} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--ink))", border: "1px solid hsl(var(--rule))", borderRadius: 0, fontSize: 11 }}
                      labelStyle={{ color: "hsl(var(--paper))", textTransform: "uppercase", letterSpacing: "0.2em", fontSize: 10 }}
                      formatter={(v: any) => [`${v} km`, "Masofa"]}
                      cursor={{ fill: "hsl(var(--rule) / 0.3)" }}
                    />
                    <Bar dataKey="km" fill="#4f46e5" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent activities */}
            <div className="flex items-baseline justify-between mb-6 border-b border-[hsl(var(--rule))] pb-4">
              <h3 className="text-3xl md:text-4xl font-bold tracking-tighter uppercase" style={editorial}>So'nggi Sessiyalar</h3>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">{activities.length} entry</span>
            </div>
            <div className="divide-y divide-[hsl(var(--rule))] border-b border-[hsl(var(--rule))]">
              {activities.slice(0, 20).map((a, i) => (
                <div key={a.id} className="grid grid-cols-12 gap-4 py-5 items-center hover:bg-[hsl(var(--rule)/0.15)] transition-colors px-2">
                  <div className="col-span-1 text-[10px] font-black tracking-[0.2em] text-zinc-600">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="col-span-12 sm:col-span-5">
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#4f46e5] mb-1">{a.type}</div>
                    <h4 className="font-bold tracking-tight truncate text-[hsl(var(--paper))]" style={editorial}>{a.name}</h4>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      {new Date(a.start_date_local).toLocaleDateString("uz-UZ", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                  <div className="hidden sm:contents text-xs">
                    <Cell label="Masofa" value={`${fmtKm(a.distance)} km`} />
                    <Cell label="Vaqt" value={fmtTime(a.moving_time)} />
                    <Cell label="Tempo" value={a.type === "Run" ? fmtPace(a.average_speed) : "—"} />
                    <Cell label="HR" value={a.average_heartrate ? `${Math.round(a.average_heartrate)}` : "—"} icon={a.average_heartrate ? <Heart className="w-3 h-3" /> : null} />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

const Stat = ({ label, value, unit, sub, accent }: any) => (
  <div className={`border-r border-b border-[hsl(var(--rule))] p-6 md:p-8 ${accent ? "bg-[#4f46e5]/5" : ""}`}>
    <div className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-4">{label}</div>
    <div className="flex items-baseline gap-2">
      <div className={`text-4xl md:text-5xl font-bold tracking-tighter ${accent ? "text-[#4f46e5]" : "text-[hsl(var(--paper))]"}`} style={{ fontFamily: '"Space Grotesk", system-ui, sans-serif' }}>
        {value}
      </div>
      {unit && <div className="text-sm font-bold uppercase tracking-widest text-zinc-500">{unit}</div>}
    </div>
    {sub && <div className="text-[11px] text-zinc-500 mt-2">{sub}</div>}
  </div>
);

const Cell = ({ label, value, icon }: any) => (
  <div className="col-span-2 sm:col-span-1 md:col-span-1 text-right md:text-left">
    <div className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-1">{label}</div>
    <div className="font-bold text-[hsl(var(--paper))] flex items-center gap-1 md:justify-start justify-end">{icon}{value}</div>
  </div>
);

export default Fitness;
